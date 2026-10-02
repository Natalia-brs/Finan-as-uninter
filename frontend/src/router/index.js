import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue' 
import FeedbackView from '../views/FeedbackView.vue'
import RegistrosView from '../views/RegistrosView.vue'
import AdminView from '../views/AdminView.vue'

const router = createRouter({

  history: createWebHistory(import.meta.env.BASE_URL), 
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView 
    },
    {
      path: '/feedback',
      name: 'feedback',
      component: FeedbackView
    },
    {
      path: '/registros',
      name: 'registros',
      component: RegistrosView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView
    },
  ]
})

export default router
