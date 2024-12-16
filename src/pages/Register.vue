<template>
  <div class="d-flex justify-center h-100">
    <v-card
      class="pa-6 elevation-3"
      width="500"
    >
      <v-card-title class="mb-4 justify-center text-h6 font-weight-bold">
        Реєстрація
      </v-card-title>
      <v-card-text>
        <v-alert
          v-if="globalError"
          type="error"
          class="mb-4"
          dismissible
          @click:close="clearGlobalError"
        >
          {{ globalError }}
        </v-alert>
        <v-form @submit.prevent="submitRegister">
          <v-text-field
            v-model="form.first_name"
            required
            :error-messages="errors.first_name"
          >
            <template v-slot:label>
              <span class="required_field">
                Ім'я
              </span>
            </template>
          </v-text-field>
          <v-text-field
            v-model="form.last_name"
            required
            :error-messages="errors.last_name"
          >
            <template v-slot:label>
              <span class="required_field">
                Прізвище
              </span>
            </template>
          </v-text-field>
          <v-text-field
            v-model="form.email"
            required
            :error-messages="errors.email"
          >
            <template v-slot:label>
              <span class="required_field">
                Email
              </span>
            </template>
          </v-text-field>
          <v-text-field
            v-model="form.password"
            autocomplete="on"
            type="password"
            :error-messages="errors.password"
          >
            <template v-slot:label>
                <span class="required_field">
                  Пароль
                </span>
            </template>
          </v-text-field>
          <v-text-field
            v-model="form.password_confirmation"
            autocomplete="on"
            type="password"
            :error-messages="errors.password_confirmation"
          >
            <template v-slot:label>
                  <span class="required_field">
                    Підтвердження пароля
                  </span>
            </template>
          </v-text-field>
          <v-text-field
            v-model="form.date_of_birth"
            label="Дата народження"
            type="date"
            :error-messages="errors.date_of_birth"
          />
          <v-select
            v-model="form.gender"
            label="Стать"
            :items="['чоловічий', 'жіночий']"
            :error-messages="errors.gender"
          />
          <v-text-field
            v-model="form.address"
            label="Адреса"
            :error-messages="errors.address"
          />
          <v-text-field
            v-model="form.phone_number"
            label="Номер телефону"
            :error-messages="errors.phone_number"
          />
          <v-btn
            block
            color="primary"
            type="submit"
          >
            Зареєструватися
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import axiosInstance from '@/api/axiosInstance';
import {useAuth} from '@/composables/auth';

const router = useRouter();
const {login} = useAuth();

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  date_of_birth: '',
  gender: '',
  address: '',
  phone_number: '',
});

const errors = ref({
  first_name: [],
  last_name: [],
  email: [],
  password: [],
  password_confirmation: [],
  date_of_birth: [],
  gender: [],
  address: [],
  phone_number: [],
});

const globalError = ref('');

const clearErrors = () => {
  Object.keys(errors.value).forEach((key) => {
    errors.value[key] = [];
  });
  globalError.value = '';
};

const clearGlobalError = () => {
  globalError.value = '';
};

const submitRegister = async () => {
  clearErrors();

  try {
    const response = await axiosInstance.post('/patient/register', form.value);

    login(response.data.token);

    await router.push({name: 'Home'});
  } catch (error) {
    if (error.response && error.response.status === 422) {
      const validationErrors = error.response.data.errors;

      Object.keys(validationErrors).forEach((key) => {
        errors.value[key] = validationErrors[key];
      });
    } else {
      globalError.value = 'Щось пішло не так. Спробуйте знову.';
    }
  }
};
</script>

<style scoped>
.required_field::after {
  content: " *";
  color: red;
}
</style>
