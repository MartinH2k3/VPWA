import { RouteRecordRaw } from 'vue-router';
import { api } from 'boot/api';

// const router = useRouter();

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: async () => {
      try {
        await api.get('/auth', { withCredentials: true });
      } catch { return '/login' }
    },
  },
  {
    path: '/login',
    component: () => import('pages/AuthPage.vue'),
    props: {
      type:'login',
    }
  },
  {
    path: '/register',
    component: () => import('pages/AuthPage.vue'),
    props:{
      type:'register',
    }
  },



  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
