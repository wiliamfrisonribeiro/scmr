import { ref } from 'vue';
import type { User } from '@/types/user';

import { useUser } from '@/composables/useUser';

// Estado do usuário atual
const currentUser = ref<User | null>(null);

interface LoginResponse {
  token: string;
  user: User;
}

// Função para fazer login
export async function login(email: string, password: string): Promise<boolean> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Accept", "application/json");

    const raw = JSON.stringify({
      email,
      password
    });

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw
    };

    const response = await fetch("https://smrc.onrender.com/accounts/login", requestOptions);
    const result = await response.json();

    if (response.ok && result.token) {
      // Salvar o token
      localStorage.setItem('token', result.token);
      
      // Decodificar e salvar os dados do usuário
      const { setUserFromToken } = useUser();
      setUserFromToken(result.token);
      
      // Atualizar o usuário atual
      currentUser.value = result.user;
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return false;
  }
}

// Função para fazer logout
export function logout(): void {
  localStorage.removeItem('token');
  currentUser.value = null;
  const { clearUser } = useUser();
  clearUser();
}

// Função para verificar se o usuário está autenticado
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('userData');
  return token !== null && userData !== null;
}

// Função para obter o usuário atual
export function getCurrentUser(): User | null {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
} 