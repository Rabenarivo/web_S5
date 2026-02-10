import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/carte'
  },
  {
    path: '/carte',
    name: 'Carte',
    component: () => import('../views/CartePage.vue')
    // Accessible sans authentification (visiteurs)
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue')
  },
  {
    path: '/signalements',
    name: 'Signalements',
    component: () => import('../views/SignalementsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/signalements/add',
    name: 'AddSignalement',
    component: () => import('../views/AddSignalementPage.vue'),

  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterPage.vue')
  },

  {
    path: '/recapitulation',
    name: 'Recapitulation',
    component: () => import('../views/RecapitulationPage.vue')
    // Accessible sans authentification (visiteurs)
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfilePage.vue'),
    meta: { requiresAuth: true }
  }

 
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const userProfile = localStorage.getItem('userProfile');
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !userProfile) {
    next('/login');
  } else if ((to.path === '/login' || to.path === '/register') && userProfile) {
    next('/home');
  } else {
    next();
  }
});

export default router
