import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue')
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
