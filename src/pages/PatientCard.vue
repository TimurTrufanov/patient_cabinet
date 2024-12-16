<template>
  <div>
    <h1>Картки пацієнта</h1>

    <v-alert
      v-if="alertMessage"
      class="my-4"
      :type="alertType"
    >
      {{ alertMessage }}
    </v-alert>

    <v-select
      v-if="specializations.length"
      v-model="selectedSpecialization"
      :items="specializations"
      item-title="name"
      item-value="id"
      label="Виберіть спеціалізацію"
    />

    <v-skeleton-loader
      v-if="isLoading && selectedSpecialization"
      class="my-4"
      type="card"
    />

    <template v-else>
      <v-list v-if="cardRecords.length">
        <v-list-item
          class="mb-3"
          v-for="cardRecord in cardRecords"
          :key="cardRecord.id"
        >
          <div>
            <p><strong>Доктор:</strong> {{ cardRecord.doctor }}</p>
            <p><strong>Дата запису:</strong> {{ cardRecord.date }}</p>
            <p><strong>Діагноз:</strong> {{ cardRecord.diagnosis || 'Не вказано' }}</p>
            <p><strong>Історія хвороби:</strong> {{ cardRecord.medical_history }}</p>
            <p><strong>Лікування:</strong> {{ cardRecord.treatment }}</p>
          </div>
        </v-list-item>
      </v-list>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axiosInstance from '@/api/axiosInstance';

const cardRecords = ref([]);
const specializations = ref([]);
const selectedSpecialization = ref(null);
const alertMessage = ref('');
const alertType = ref('');
const isLoading = ref(false);

const fetchSpecializations = async () => {
  try {
    const response = await axiosInstance.get('/patient/card-records/specializations');
    specializations.value = response.data;

    if (!specializations.value.length) {
      alertMessage.value = 'Список карток порожній.';
      alertType.value = 'info';
    }
  } catch (error) {
    alertMessage.value = 'Не вдалося завантажити спеціалізації.';
    alertType.value = 'error';
  }
};

const fetchCardRecords = async () => {
  if (!selectedSpecialization.value) return;

  isLoading.value = true;

  try {
    const response = await axiosInstance.get('/patient/card-records', {
      params: {
        specialization_id: selectedSpecialization.value,
      },
    });

    cardRecords.value = response.data;

    if (!cardRecords.value.length) {
      alertMessage.value = 'Записів не знайдено для цієї спеціалізації.';
      alertType.value = 'info';
    }
  } catch (error) {
    alertMessage.value = 'Не вдалося завантажити записи карти.';
    alertType.value = 'error';
  } finally {
    isLoading.value = false;
  }
};

watch(selectedSpecialization, (newValue) => {
  if (newValue) {
    fetchCardRecords();
  }
});

onMounted(() => {
  fetchSpecializations();
});
</script>
