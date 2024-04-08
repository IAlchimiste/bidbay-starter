<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../store/auth";

const { isAuthenticated, isAdmin, userData, token } = useAuthStore();

const route = useRoute();
const router = useRouter();

const productId = ref(route.params.productId);

function formatDate(date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("fr-FR", options);
}

const product = ref(null);
const bidAmount = ref(0);

const loading = ref(false);
const error = ref(false);

async function fetchProduct() {
  loading.value = true;
  try {
    let response = await fetch(
      "http://localhost:3000/api/products/" + productId.value,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    );

    if (response.ok) {
      product.value = await response.json();
    } else {
      error.value = true;
    }
  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}
fetchProduct();

async function deleteProduct() {
  loading.value = true;
  try {
    const response = await fetch(
      "http://localhost:3000/api/products/" + productId.value,
      {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token.value}`,
          accept: "application/json",
        },
      },
    );
    if (response.ok) {
      router.push({ name: "User", params: { userId: "me" } });
    } else {
      error.value = true;
    }
  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}
async function deleteBid(bidId) {
  loading.value = true;
  try {
    const response = await fetch("http://localhost:3000/api/bids/" + bidId, {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${token.value}`,
        accept: "application/json",
      },
    });
    if (!response.ok) {
      error.value = true;
    }
  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}
async function addBid() {
  loading.value = true;
  console.log(bidAmount);
  try {
    const response = await fetch(
      "http://localhost:3000/api/products/" + productId.value + "/bids",
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: bidAmount.value,
        }),
      },
    );
    if (response.ok) {
      fetchProduct();
    } else {
      error.value = true;
    }
  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

let countdown = 0;
//ne fonctionne pas
// let date = new Date()
// let end = formatDate(product.endDate)
// countdown = date - end // temps restant en secondes

// let intervalId = setInterval(tick(), 1000);

// function tick() {
//   if (this.countdown > 0) {
//     countdown--;
//   } else {
//     clearInterval(intervalId);
//   }
// }
</script>

<template>
  <div class="row">
    <div class="text-center mt-4" data-test-loading v-if="loading">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div
      v-if="error"
      class="alert alert-danger mt-4"
      role="alert"
      data-test-error
    >
      Une erreur est survenue lors du chargement des produits.
    </div>
    <div class="row" v-if="product != null" data-test-product>
      <!-- Colonne de gauche : image et compte à rebours -->
      <div class="col-lg-4">
        <img
          :src="product.pictureUrl"
          alt=""
          class="img-fluid rounded mb-3"
          data-test-product-picture
        />
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">Compte à rebours</h5>
          </div>
          <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted" data-test-countdown>
              <div v-if="countdown > 0">
                <p>Temps restant : {{ countdown }}</p>
              </div>
              <div v-else>
                <p>Le temps est écoulé !</p>
              </div>
            </h6>
          </div>
        </div>
      </div>

      <!-- Colonne de droite : informations du produit et formulaire d'enchère -->
      <div class="col-lg-8">
        <div class="row">
          <div class="col-lg-6">
            <h1 class="mb-3" data-test-product-name>
              {{ product.name }}
            </h1>
          </div>
          <div
            v-if="userData.admin || userData.id == product.seller.id"
            class="col-lg-6 text-end"
          >
            <RouterLink
              :to="{
                name: 'ProductEdition',
                params: { productId: product.id },
              }"
              class="btn btn-primary"
              data-test-edit-product
            >
              Editer
            </RouterLink>
            &nbsp;
            <button
              @click="deleteProduct()"
              class="btn btn-danger"
              data-test-delete-product
            >
              Supprimer
            </button>
          </div>
        </div>

        <h2 class="mb-3">Description</h2>
        <p data-test-product-description>
          {{ product.description }}
        </p>

        <h2 class="mb-3">Informations sur l'enchère</h2>
        <ul>
          <li data-test-product-price>
            Prix de départ : {{ product.originalPrice }} €
          </li>
          <li data-test-product-end-date>
            Date de fin : {{ formatDate(product.endDate) }}
          </li>
          <li>
            Vendeur :
            <router-link
              :to="{ name: 'User', params: { userId: product.seller.id } }"
              data-test-product-seller
            >
              {{ product.seller.username }}
            </router-link>
          </li>
        </ul>

        <h2 class="mb-3">Offres sur le produit</h2>
        <table class="table table-striped" data-test-bids>
          <thead>
            <tr>
              <th scope="col">Enchérisseur</th>
              <th scope="col">Offre</th>
              <th scope="col">Date</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bid in product.bids" :key="bid.id" data-test-bid>
              <td>
                <router-link
                  :to="{ name: 'User', params: { userId: bid.bidder.id } }"
                  data-test-bid-bidder
                >
                  {{ bid.bidder.username }}
                </router-link>
              </td>
              <td data-test-bid-price>{{ bid.price }} €</td>
              <td data-test-bid-date>{{ formatDate(bid.date) }}</td>
              <td>
                <button
                  v-if="userData.admin || userData.id == bid.bidder.id"
                  @click="deleteBid(bid.id)"
                  class="btn btn-danger btn-sm"
                  data-test-delete-bid
                >
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p data-test-no-bids>Aucune offre pour le moment</p>

        <form @submit.prevent="addBid()" data-test-bid-form>
          <div class="form-group">
            <label for="bidAmount">Votre offre :</label>
            <input
              type="number"
              class="form-control"
              id="bidAmount"
              v-model="bidAmount"
              data-test-bid-form-price
            />
            <small class="form-text text-muted">
              Le montant doit être supérieur à 10 €.
            </small>
          </div>
          <button type="submit" class="btn btn-primary" data-test-submit-bid>
            Enchérir
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
