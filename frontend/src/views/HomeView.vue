<script setup>
import { ref, computed } from "vue";

const loading = ref(false);
const error = ref(false);
const products = ref([]);

async function fetchProducts() {
  loading.value = true;
  error.value = false;

  try {
    const response = await fetch("http://localhost:3000/api/products");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    products.value = data;
  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

fetchProducts();
</script>

<template>
  <div>
    <h1 class="text-center mb-4">Liste des produits</h1>

    <div class="row mb-3">
      <div class="col-md-6">
        <form>
          <div class="input-group">
            <span class="input-group-text">Filtrage</span>
            <input
              type="text"
              class="form-control"
              placeholder="Filtrer par nom"
              data-test-filter
            />
          </div>
        </form>
      </div>
      <div class="col-md-6 text-end">
        <div class="btn-group">
          <button
            type="button"
            class="btn btn-primary dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            data-test-sorter
          >
            Trier par nom
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <a class="dropdown-item" href="#"> Nom </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" data-test-sorter-price>
                Prix
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="text-center mt-4" data-test-loading>
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div class="alert alert-danger mt-4" role="alert" data-test-error>
      Une erreur est survenue lors du chargement des produits.
    </div>

    <div class="row">
      <div
        class="col-md-4 mb-4"
        v-for="product in products"
        :key="product.id"
        data-test-product
      >
        <div class="card">
          <RouterLink
            :to="{ name: 'Product', params: { productId: product.id } }"
          >
            <img
              :src="product.pictureUrl"
              data-test-product-picture
              class="card-img-top"
            />
          </RouterLink>
          <div class="card-body">
            <h5 class="card-title">
              <RouterLink
                data-test-product-name
                :to="{ name: 'Product', params: { productId: product.id } }"
              >
                {{ product.name }}
              </RouterLink>
            </h5>
            <p class="card-text" data-test-product-description>
              {{ product.description }}
            </p>

            <p class="card-text">
              Vendeur :

              <RouterLink
                :to="{ name: 'User', params: { userId: product['sellerId'] } }"
                data-test-product-seller
              >
                {{ product["seller"]["username"] }}
              </RouterLink>
            </p>

            <p class="card-text" data-test-product-date>
              En cours jusqu'au
              {{ new Date(product.endDate).toLocaleDateString() }}
            </p>
            <p class="card-text" data-test-product-price>
              Prix actuel : {{ product.originalPrice }} €
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
