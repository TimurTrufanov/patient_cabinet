import { ref, computed } from 'vue';

const token = ref(localStorage.getItem('patientToken') || null);

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value);

  const login = (newToken) => {
    localStorage.setItem('patientToken', newToken);
    token.value = newToken;
  };

  const logout = () => {
    localStorage.removeItem('patientToken');
    token.value = null;
  };

  return { token, isAuthenticated, login, logout };
}
