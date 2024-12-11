<template>
  <v-app-bar class="px-3">
    <h1>Кабінет паціента</h1>
    <v-spacer />
    <div>
      <v-btn :to="{name: 'PatientSchedule'}">
        Записатись на прийом
      </v-btn>
      <v-btn
        v-if="isAuthenticated"
        :to="{name: 'PatientAnalysis'}"
      >
        Завантажити аналізи
      </v-btn>
    </div>
    <v-spacer />
    <v-btn
      v-if="isAuthenticated"
      color="primary"
      @click="handleLogout"
    >
      Вийти
    </v-btn>
    <template v-else>
      <v-btn
        color="primary"
        :to="{name: 'Login'}"
      >
        Увійти
      </v-btn>
      <v-btn
        color="secondary"
        :to="{name: 'Register'}"
      >
        Зареєструватися
      </v-btn>
    </template>
  </v-app-bar>
</template>

<script setup>
import {useAuth} from '@/composables/auth';
import {useRouter} from 'vue-router';

const {isAuthenticated, logout} = useAuth();
const router = useRouter();

const handleLogout = () => {
  logout();
  router.push({name: 'Home'});
};
</script>
