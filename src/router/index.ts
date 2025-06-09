import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import MapView from '@/views/MapView.vue'
import Dashboard from '../views/Dashboard.vue'
import CriarOcorrencia from '../views/CriarOcorrencia.vue'
import EditarOcorrencia from '../views/EditarOcorrencia.vue'
import { isAuthenticated as checkAuth } from '@/services/auth/auth'


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
      // Usuário autenticado, permitir acesso
      next()
    }
  } else {
    // Rota pública, permitir acesso
    next()
  }
})

export default router 