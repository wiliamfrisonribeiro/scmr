import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import MapView from '@/views/MapView.vue'
import Dashboard from '../views/Dashboard.vue'
import CriarOcorrencia from '../views/CriarOcorrencia.vue'
import EditarOcorrencia from '../views/EditarOcorrencia.vue'
import AnalisarOcorrencia from '../views/AnalisarOcorrencia.vue'
import { isAuthenticated as checkAuth } from '@/services/auth/auth'
import { useUser } from '@/composables/useUser'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/map',
      name: 'map',
      component: MapView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/criar-ocorrencia',
      name: 'criar-ocorrencia',
      component: CriarOcorrencia,
      meta: { requiresAuth: true }
    },
    {
      path: '/editar-ocorrencia/:id',
      name: 'editar-ocorrencia',
      component: EditarOcorrencia,
      meta: { requiresAuth: true }
    },
    {
      path: '/analisar-ocorrencia/:id',
      name: 'analisar-ocorrencia',
      component: AnalisarOcorrencia,
      meta: { requiresAuth: true }
    }
  ]
})

// Guarda de navegação para verificar autenticação
router.beforeEach((to, from, next) => {
  // Verificar se a rota requer autenticação
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Verificar se o usuário está autenticado
    if (!checkAuth()) {
      // Redirecionar para a página de login
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      // Verificar se é uma rota restrita para autoridades
      if (to.name === 'criar-ocorrencia' || to.name === 'editar-ocorrencia') {
        // Verificar se o usuário é autoridade
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          if (user.account_group_id === 'b9e4f4b8-57cc-43a7-8a54-ebc498bbc58c') {
            // Usuário é autoridade, redirecionar para dashboard
            next({ path: '/dashboard' });
            return;
          }
        }
      }
      
      // Usuário autenticado e com permissão, permitir acesso
      next()
    }
  } else {
    // Rota pública, permitir acesso
    next()
  }
})

export default router 