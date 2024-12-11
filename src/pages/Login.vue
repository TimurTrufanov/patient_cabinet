<template>
  <div class="d-flex justify-center h-100">
    <v-card
      class="pa-6 elevation-3"
      width="500"
    >
      <v-card-title class="mb-4 justify-center text-h6 font-weight-bold">
        Вхід
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="submitLogin">
          <v-text-field
            v-model="email"
            label="Email"
          />
          <v-text-field
            v-model="password"
            label="Пароль"
            type="password"
            autocomplete="on"
          />
          <v-alert
            v-if="errorMessage"
            type="error"
            class="mb-4"
          >
            {{ errorMessage }}
          </v-alert>
          <v-btn
            block
            color="primary"
            type="submit"
          >
            Увійти
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axiosInstance from '@/api/axiosInstance';
import { useAuth } from '@/composables/auth';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter();
const { login } = useAuth();

const submitLogin = async () => {
  try {
    errorMessage.value = '';
    const response = await axiosInstance.post('/patient/login', {
      email: email.value,
      password: password.value,
    });

    login(response.data.token);
    await router.push({ name: 'Home' });
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Помилка входу';
  }
};
</script>
