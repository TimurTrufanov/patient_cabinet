<template>
  <v-app>
    <header-layout />
    <v-main>
      <v-container class="container">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import HeaderLayout from "@/layouts/HeaderLayout.vue";

</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
