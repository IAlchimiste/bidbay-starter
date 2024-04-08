<script setup>
import { ref, computed } from "vue";

const loading = ref(false);
const error = ref(false);
const filter = ref("");
const sorter = ref("name");
const products = ref([]);

async function fetchProducts() {
  loading.value = true;
  error.value = false;

  try {
    const response = await fetch("http://localhost:3000/api/products");
    const data = await response.json();
    if (Array.isArray(data)) {
      products.value = data;
    } else {
      console.error('Unexpected response from API:', data);
      error.value = true;
    }
  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

const filteredProducts = computed(() =>
  products.value.filter((product) =>
    product.name.toLowerCase().includes(filter.value.toLowerCase()),
  ),
);

const sortedProducts = computed(() =>
  filteredProducts.value.sort((a, b) => {
    if (sorter.value === "name") {
      return a.name.localeCompare(b.name);
    } else if (sorter.value === "price") {
      return a.originalPrice - b.originalPrice;
    } else {
      return 0;
    }
  }),
);

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
              v-model="filter"
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
            Trier par {{ sorter === "name" ? "nom" : "prix" }}
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <a
                class="dropdown-item"
                href="#"
                @click.prevent="sorter = 'name'"
              >
                Nom
              </a>
            </li>
            <li>
              <a
                class="dropdown-item"
                href="#"
                data-test-sorter-price
                @click.prevent="sorter = 'price'"
              >
                Prix
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="text-center mt-4" data-test-loading v-if="loading">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div
      class="alert alert-danger mt-4"
      role="alert"
      data-test-error
      v-if="error"
    >
      Une erreur est survenue lors du chargement des produits.
    </div>

    <div class="row">
      <div
        class="col-md-4 mb-4"
        v-for="product in sortedProducts"
        :key="product.id"
        data-test-product
      >
        <div class="card">
          <RouterLink
            :to="{ name: 'Product', params: { productId: product.id } }"
          >
            <img
              :src="product.pictureUrl"
              class="card-img-top"
              :alt="product.name"
            />
          </RouterLink>
          <div class="card-body">
            <h5 class="card-title" data-test-product-name>{{ product.name }}</h5>
            <p class="card-text">{{ product.description }}</p>
            <p class="card-text">
              Vendeur :
              <RouterLink
                data-test-product-seller
                :to="{ name: 'User', params: { userId: product.seller.id } }"
              >
                {{ product.seller.username }}
              </RouterLink>
            </p>
            <p class="card-text">{{ product.originalPrice }} €</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
