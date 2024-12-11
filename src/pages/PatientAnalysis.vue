<template>
  <div>
    <h1>Аналізи</h1>

    <v-alert
      v-if="alertMessage"
      class="my-4"
      :type="alertType"
    >
      {{ alertMessage }}
    </v-alert>

    <v-skeleton-loader
      v-if="isLoading"
      class="my-4"
      type="card"
    />

    <template v-else>
      <v-list v-if="analyses.length">
        <v-list-item
          class="mb-3"
          v-for="(analysis, index) in analyses"
          :key="analysis.id"
        >
          <div>
            <p><strong>Аналіз:</strong> {{ analysis.analysis_name }}</p>
            <p><strong>Дата запису:</strong> {{ analysis.appointment_date }}</p>
            <p><strong>Рекомендована дата:</strong> {{ analysis.recommended_date || 'Не вказано' }}</p>
            <p><strong>Кількість:</strong> {{ analysis.quantity }}</p>
            <p><strong>Ціна:</strong> {{ analysis.price }} грн</p>
            <p><strong>Ітогова вартість:</strong> {{ analysis.total_price }} грн</p>
            <p><strong>Дата здачі:</strong> {{ analysis.submission_date || 'Не здано' }}</p>
            <p><strong>Статус:</strong> {{ analysis.status }}</p>
            <p v-if="analysis.file">
              <a :href="`http://localhost:8080/storage/${analysis.file}`" target="_blank">Завантажити результат</a>
            </p>
          </div>

          <v-file-input
            v-if="!analysis.file"
            counter
            show-size
            class="mt-2 w-50"
            label="Виберіть файл"
            accept=".pdf"
            @change="(event) => handleFileSelection(index, event)"
            @click:clear="() => handleClearFile(index)"
          />

          <v-btn
            v-if="selectedFiles[index]"
            class="mt-2"
            color="primary"
            @click="uploadFile(analysis.id, index)"
          >
            Підтвердити завантаження
          </v-btn>
        </v-list-item>
      </v-list>
    </template>
  </div>

</template>

<script setup>
import { onMounted, ref } from 'vue';
import axiosInstance from '@/api/axiosInstance';

const analyses = ref([]);
const selectedFiles = ref([]);
const alertMessage = ref('');
const alertType = ref('');
const isLoading = ref(true);

const fetchAnalyses = async () => {
  try {
    const response = await axiosInstance.get('/patient/analyses');
    analyses.value = response.data;

    if (!analyses.value.length) {
      alertMessage.value = 'Список аналізів порожній.';
      alertType.value = 'info';
    }

  } catch (error) {
    alertMessage.value = 'Не вдалося завантажити аналізи.';
    alertType.value = 'error';
  } finally {
    isLoading.value = false;
  }
};

const handleFileSelection = (index, event) => {
  selectedFiles.value[index] = event.target.files[0];
};

const handleClearFile = (index) => {
  selectedFiles.value[index] = null;
};

const uploadFile = async (analysisId, index) => {
  const file = selectedFiles.value[index];

  if (!file) {
    alertMessage.value = 'Будь ласка, виберіть файл перед завантаженням.';
    alertType.value = 'error';
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    await axiosInstance.post(`/patient/analyses/${analysisId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    alertMessage.value = 'Файл успішно завантажено';
    alertType.value = 'success';
    selectedFiles.value[index] = null;

    await fetchAnalyses();
  } catch (error) {
    if (error.response?.data?.errors?.file) {
      alertMessage.value = error.response.data.errors.file[0];
    } else {
      alertMessage.value = 'Сталася помилка під час завантаження файлу.';
    }
    alertType.value = 'error';
  }
};

onMounted(() => {
  fetchAnalyses();
});
</script>
