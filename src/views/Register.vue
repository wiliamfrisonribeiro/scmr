<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { createAccount } from '@/services/auth/accountService';
import { getAccountGroups, type AccountGroup } from '@/services/auth/accountGroupService';

const router = useRouter();

const formData = ref({
  name: '',
  email: '',
  cpf: '',
  birthday: '',
  account_group_id: '732331ca-9e65-431a-825d-70723566fb68',
  password: '',
  confirmPassword: ''
});


const loading = ref(false);
const loadingGroups = ref(false);
const error = ref('');
const success = ref('');

onMounted(async () => {
  try {
    loadingGroups.value = true;
    
  } catch (err) {
    error.value = 'Erro ao carregar os tipos de usuário. Tente novamente.'; 
    console.error('Erro ao carregar grupos:', err);
  } finally {
    loadingGroups.value = false;
  }
});

const validateForm = () => {
  if (!formData.value.name || !formData.value.email || !formData.value.cpf || 
      !formData.value.birthday || !formData.value.password || !formData.value.confirmPassword ||
      !formData.value.account_group_id) {
    error.value = 'Por favor, preencha todos os campos';
    return false;
  }

  if (formData.value.password !== formData.value.confirmPassword) {
    error.value = 'As senhas não coincidem';
    return false;
  }

  // Validar formato do email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.value.email)) {
    error.value = 'Email inválido';
    return false;
  }

  // Validar formato do CPF
  const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  if (!cpfRegex.test(formData.value.cpf)) {
    error.value = 'CPF inválido (formato: 123.456.789-00)';
    return false;
  }

  return true;
};

const handleSubmit = async () => {
  error.value = '';
  success.value = '';

  if (!validateForm()) {
    return;
  }

  loading.value = true;

  try {
    const { confirmPassword, ...accountData } = formData.value;
    await createAccount(accountData);
    success.value = 'Cadastro realizado com sucesso!';
    
    // Limpar formulário
    formData.value = {
      name: '',
      email: '',
      cpf: '',
      birthday: '',
      account_group_id: '',
      password: '',
      confirmPassword: ''
    };

    // Redirecionar para login após 2 segundos
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (err) {
    error.value = 'Erro ao realizar cadastro. Tente novamente.';
    console.error('Erro no cadastro:', err);
  } finally {
    loading.value = false;
  }
};

const formatCPF = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return value;
};

const handleCPFInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  formData.value.cpf = formatCPF(input.value);
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-nature-pattern">
    <div class="max-w-md w-full space-y-8 bg-white bg-opacity-90 p-8 rounded-lg shadow-lg">
      <div>
        <div class="flex justify-start mb-4">
          <button 
            @click="router.push('/')" 
            class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para Home
          </button>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-green-800">
          Criar nova conta
        </h2>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="name" class="sr-only">Nome completo</label>
            <input
              id="name"
              v-model="formData.name"
              name="name"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="Nome completo"
            />
          </div>
          <div>
            <label for="email" class="sr-only">Email</label>
            <input
              id="email"
              v-model="formData.email"
              name="email"
              type="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="Email"
            />
          </div>
          <div>
            <label for="cpf" class="sr-only">CPF</label>
            <input
              id="cpf"
              v-model="formData.cpf"
              name="cpf"
              type="text"
              required
              @input="handleCPFInput"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="CPF (123.456.789-00)"
            />
          </div>
          <div>
            <label for="birthday" class="sr-only">Data de Nascimento</label>
            <input
              id="birthday"
              v-model="formData.birthday"
              name="birthday"
              type="date"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
            />
          </div>
    
          <div>
            <label for="password" class="sr-only">Senha</label>
            <input
              id="password"
              v-model="formData.password"
              name="password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="Senha"
            />
          </div>
          <div>
            <label for="confirmPassword" class="sr-only">Confirmar Senha</label>
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              name="confirmPassword"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="Confirmar senha"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div v-if="success" class="text-green-600 text-sm text-center">
          {{ success }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || loadingGroups"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
          </button>
        </div>
      </form>

      <div class="text-center">
        <p class="text-sm text-gray-600">
          Já tem uma conta?
          <a href="#" @click.prevent="router.push('/login')" class="font-medium text-green-600 hover:text-green-500">
            Faça login
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-nature-pattern {
  background-image: url('/images/fundo.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style> 