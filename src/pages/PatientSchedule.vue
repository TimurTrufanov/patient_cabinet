<template>
  <v-container>
    <v-card>
      <v-card-title
        class="text-h5"
      >
        Виберіть клініку, спеціалізацію та послугу
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            md="4"
          >
            <v-select
              v-model="selectedClinic"
              :items="clinics"
              label="Клініка"
              item-value="id"
              item-title="name"
            />
          </v-col>

          <v-col
            cols="12"
            md="4"
          >
            <v-select
              v-model="selectedSpecialization"
              :items="specializations"
              label="Спеціалізація"
              item-value="id"
              item-title="name"
              :disabled="!selectedClinic"
            />
          </v-col>

          <v-col
            cols="12"
            md="4"
          >
            <v-select
              v-model="selectedService"
              :items="services"
              label="Послуга"
              item-value="id"
              item-title="name"
              :disabled="!selectedSpecialization"
            />
          </v-col>
        </v-row>

        <v-alert
          v-if="fetchError"
          type="error"
          class="mt-4"
        >
          {{ fetchError }}
        </v-alert>

        <v-skeleton-loader
          v-if="isLoading"
          type="table"
          class="mt-4"
        />

        <v-data-table
          v-else-if="schedules.length"
          :headers="scheduleHeaders"
          :items="schedules"
          class="mt-4"
        >
          <template #item.specializations="{ item }">
            {{ item.specializations.join(', ') }}
          </template>
          <template #item.clinic="{ item }">
            {{ item.clinic.name }}, {{ item.clinic.city }}, {{ item.clinic.address }}
          </template>
          <template #item.actions="{ item }">
            <v-btn
              v-if="isAuthenticated"
              small
              color="primary"
              @click="openDaySchedule(item.id)"
            >
              Переглянути
            </v-btn>
            <v-alert
              v-else
              class="my-1"
              text="Увійдіть, щоб записатися на прийом."
              type="info"
            />
          </template>
        </v-data-table>
        <v-alert
          v-else-if="selectedClinic && selectedSpecialization && selectedService && !schedules.length"
          type="info"
          class="mt-4"
        >
          Розклад не знайдено.
        </v-alert>
      </v-card-text>
    </v-card>

    <v-dialog
      v-model="isDayScheduleOpen"
      max-width="600px"
    >
      <v-card>
        <v-card-title class="text-h5">
          Розклад на {{ formattedDate }}
        </v-card-title>

        <v-card-text>
          <v-alert
            v-if="showAlert"
            :type="alertType"
            dismissible
            class="mb-4"
            @click:close="showAlert = false"
          >
            {{ alertMessage }}
          </v-alert>

          <v-alert
            v-if="dayScheduleError"
            type="error"
            class="mb-4"
            @click:close="dayScheduleError = ''"
          >
            {{ dayScheduleError }}
          </v-alert>

          <v-skeleton-loader
            v-if="dayScheduleLoading"
            class="mb-4"
            type="table"
          />

          <v-table v-else>
            <template #default>
              <thead>
                <tr>
                  <th>Час</th>
                  <th>Дія</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="slot in timeSlots"
                  :key="slot.id"
                >
                  <td>{{ slot.start_time }} - {{ slot.end_time }}</td>
                  <td>
                    <v-btn
                      small
                      :disabled="!slot.is_active"
                      color="primary"
                      @click="bookAppointment(slot.id)"
                    >
                      {{ slot.is_active ? 'Записатись' : 'Зайнято' }}
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-table>
        </v-card-text>

        <v-card-actions>
          <v-btn
            color="secondary"
            @click="isDayScheduleOpen = false"
          >
            Закрити
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import axiosInstance from '@/api/axiosInstance';
import Pusher from 'pusher-js';

const clinics = ref([]);
const specializations = ref([]);
const services = ref([]);
const schedules = ref([]);

const selectedClinic = ref(null);
const selectedSpecialization = ref(null);
const selectedService = ref(null);

const initialLoadComplete = ref(false);
const isLoading = ref(false);
const isDayScheduleOpen = ref(false);
const fetchError = ref('');
const timeSlots = ref([]);
const formattedDate = ref('');
const dayScheduleLoading = ref(false);
const dayScheduleError = ref('');

const isAuthenticated = ref(!!localStorage.getItem('patientToken'));

const alertMessage = ref('');
const alertType = ref('success');
const showAlert = ref(false);

const scheduleHeaders = [
  { title: 'Дата', value: 'date' },
  { title: 'Час роботи', value: 'time' },
  { title: 'Доктор', value: 'doctor_name' },
  { title: 'Спеціалізації', value: 'specializations' },
  { title: 'Клініка', value: 'clinic' },
  { title: 'Дії', value: 'actions' },
];

const fetchClinics = async () => {
  try {
    fetchError.value = '';
    const response = await axiosInstance.get('/clinics');
    clinics.value = response.data.data.map((clinic) => ({
      id: clinic.id,
      name: `${clinic.name}, ${clinic.region}, ${clinic.city}, ${clinic.address}`,
      specializations: clinic.specializations.map((spec) => ({
        id: spec.id,
        name: spec.name,
      })),
    }));
  } catch {
    fetchError.value = 'Помилка при завантаженні клінік. Спробуйте пізніше.';
  }
};

const fetchServices = async () => {
  if (!selectedSpecialization.value) {
    services.value = [];
    return;
  }
  try {
    fetchError.value = '';
    const response = await axiosInstance.get(`/specializations/${selectedSpecialization.value}/services`);
    services.value = response.data.map((service) => ({
      id: service.id,
      name: service.name,
    }));
  } catch {
    fetchError.value = 'Помилка при завантаженні послуг. Спробуйте пізніше.';
  }
};

const fetchSchedule = async () => {
  if (!selectedClinic.value || !selectedSpecialization.value || !selectedService.value) {
    schedules.value = [];
    return;
  }

  isLoading.value = true;

  try {
    fetchError.value = '';
    const response = await axiosInstance.get('/patient/schedule', {
      params: {
        clinic: selectedClinic.value,
        specialization: selectedSpecialization.value,
        service: selectedService.value,
      },
    });

    schedules.value = response.data.map((schedule) => ({
      ...schedule,
      time: `${schedule.start_time} - ${schedule.end_time}`,
    }));
  } catch {
    fetchError.value = 'Помилка при завантаженні розкладу. Спробуйте пізніше.';
    schedules.value = [];
  } finally {
    isLoading.value = false;
  }
};

const fetchDaySchedule = async (dayId) => {
  dayScheduleLoading.value = true;
  dayScheduleError.value = '';

  try {
    const response = await axiosInstance.get(`/patient/schedule/${dayId}`);
    formattedDate.value = response.data.date;
    timeSlots.value = response.data.time_sheets;
  } catch (err) {
    dayScheduleError.value = err.response?.data?.message || 'Не вдалось завантажити розклад.';
  } finally {
    dayScheduleLoading.value = false;
  }
};

const openDaySchedule = async (dayId) => {
  showAlert.value = false;
  alertMessage.value = '';
  alertType.value = 'success';

  await fetchDaySchedule(dayId);

  if (timeSlots.value.length) {
    isDayScheduleOpen.value = true;
  } else {
    dayScheduleError.value = 'Часові слоти недоступні.';
  }
};

const bookAppointment = async (timeSheetId) => {
  try {
    const response = await axiosInstance.post('/patient/appointments', {
      time_sheet_id: timeSheetId,
      service_id: selectedService.value,
    });

    alertMessage.value = response.data.message;
    alertType.value = 'success';
    showAlert.value = true;

    const slotIndex = timeSlots.value.findIndex(slot => slot.id === timeSheetId);
    if (slotIndex !== -1) {
      timeSlots.value[slotIndex].is_active = false;
    }

  } catch (err) {
    alertMessage.value = err.response?.data?.message || 'Помилка під час запису.';
    alertType.value = 'error';
    showAlert.value = true;
  }
};

onMounted(async () => {
  const pusher = new Pusher('84809a7900d8ed262dd8', {
    cluster: 'eu',
    encrypted: true,
  });

  const channel = pusher.subscribe('appointments');

  channel.bind('App\\Events\\AppointmentBooked', (data) => {
    const slotIndex = timeSlots.value.findIndex(slot => slot.id === data.time_slot_id);
    if (slotIndex !== -1) {
      timeSlots.value[slotIndex].is_active = false;
    }
  });

  const savedClinic = localStorage.getItem('selectedClinic');
  const savedSpecialization = localStorage.getItem('selectedSpecialization');
  const savedService = localStorage.getItem('selectedService');

  await fetchClinics();

  if (savedClinic) {
    selectedClinic.value = parseInt(savedClinic);
    const clinic = clinics.value.find((c) => c.id === selectedClinic.value);

    if (clinic) {
      specializations.value = clinic.specializations || [];
    }
  }

  if (savedSpecialization && specializations.value.length > 0) {
    selectedSpecialization.value = parseInt(savedSpecialization);
    await fetchServices();
  }

  if (savedService && services.value.some((service) => service.id === parseInt(savedService))) {
    selectedService.value = parseInt(savedService);
    await fetchSchedule();
  }

  initialLoadComplete.value = true;
});

watch(selectedClinic, async (newValue) => {
  if (!initialLoadComplete.value) return;

  if (!newValue) {
    specializations.value = [];
    services.value = [];
    schedules.value = [];
    selectedSpecialization.value = null;
    selectedService.value = null;
    localStorage.removeItem('selectedClinic');
    return;
  }

  localStorage.setItem('selectedClinic', newValue);

  const clinic = clinics.value.find((c) => c.id === newValue);

  if (clinic) {
    specializations.value = clinic.specializations || [];
  }

  const savedSpecialization = localStorage.getItem('selectedSpecialization');
  const savedService = localStorage.getItem('selectedService');

  if (savedSpecialization && specializations.value.some((s) => s.id === parseInt(savedSpecialization))) {
    selectedSpecialization.value = parseInt(savedSpecialization);
    await fetchServices();
  } else {
    selectedSpecialization.value = null;
    selectedService.value = null;
    schedules.value = [];
  }

  if (savedService && services.value.some((service) => service.id === parseInt(savedService))) {
    selectedService.value = parseInt(savedService);
    await fetchSchedule();
  } else {
    schedules.value = [];
  }
});

watch(selectedSpecialization, async (newValue) => {
  if (!initialLoadComplete.value) return;

  if (!newValue) {
    services.value = [];
    schedules.value = [];
    selectedService.value = null;
    localStorage.removeItem('selectedSpecialization');
    return;
  }

  localStorage.setItem('selectedSpecialization', newValue);
  await fetchServices();
  selectedService.value = null;
  schedules.value = [];
});

watch(selectedService, async (newValue) => {
  if (!initialLoadComplete.value) return;

  if (!newValue) {
    schedules.value = [];
    localStorage.removeItem('selectedService');
    return;
  }

  localStorage.setItem('selectedService', newValue);
  await fetchSchedule();
});
</script>

