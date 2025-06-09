import { ref, computed, onMounted } from 'vue';

interface UserData {
  id: number;
  name: string;
  email: string;
  account_id: number;
}

const userData = ref<UserData | null>(null);

export function useUser() {
  const decodeToken = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  };

  const setUserFromToken = (token: string) => {
    const decoded = decodeToken(token);
    if (decoded) {
      const user = {
        id: decoded.data.id,
        name: decoded.data.name,
        email: decoded.data.email,
        account_id: decoded.data.account_id
      };
      userData.value = user;
      // Salvar no localStorage
      localStorage.setItem('userData', JSON.stringify(user));
    }
  };

  const clearUser = () => {
    userData.value = null;
    localStorage.removeItem('userData');
  };

  // Restaurar dados do usuário ao iniciar
  onMounted(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      userData.value = JSON.parse(storedUser);
    }
  });

  const userId = computed(() => userData.value?.id);
  const userName = computed(() => userData.value?.name);
  const userEmail = computed(() => userData.value?.email);
  const userAccountId = computed(() => userData.value?.id);

  return {
    userData,
    userId,
    userName,
    userEmail,
    userAccountId,
    setUserFromToken,
    clearUser
  };
} 