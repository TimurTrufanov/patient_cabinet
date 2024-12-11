import { createRouter, createWebHistory } from 'vue-router';
import Login from "@/pages/Login.vue";
import Register from "@/pages/Register.vue";
import Home from "@/pages/Home.vue";

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guestOnly: true },
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/patient/schedule',
    name: 'PatientSchedule',
    component: () => import('@/pages/PatientSchedule.vue'),
  },
  {
    path: '/patient/analyses',
    name: 'PatientAnalysis',
    component: () => import('@/pages/PatientAnalysis.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue'),
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('patientToken');

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Home' });
  } else if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'Home' });
  } else {
    next();
  }
});

export default router;
