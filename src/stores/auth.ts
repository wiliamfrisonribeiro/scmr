import { ref } from 'vue';

const token = ref<string | null>(localStorage.getItem('token'));

export const useAuthStore = () => {
  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  };

  const clearToken = () => {
    token.value = null;
    localStorage.removeItem('token');
  };

  return {
    token,
    setToken,
    clearToken
  };
}; 