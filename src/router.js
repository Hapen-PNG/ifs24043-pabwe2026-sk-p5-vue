import { createRouter, createWebHistory } from 'vue-router'
import { getAccessToken } from './helpers/apiHelper.js'
import LoginPage from './features/auth/pages/LoginPage.vue'

export const routes = [
  {
    path: '/auth',
    component: () => import('./features/auth/layouts/AuthLayout.vue'),
    meta: { guest: true },
    children: [
      { path: 'login', component: LoginPage },
      { path: 'register', component: () => import('./features/auth/pages/RegisterPage.vue') },
    ],
  },
  {
    path: '/',
    component: () => import('./features/aucations/layouts/AucationLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('./features/aucations/pages/HomePage.vue') },
      { path: 'aucations/:aucationId', component: () => import('./features/aucations/pages/DetailPage.vue') },
      { path: 'users', component: () => import('./features/users/pages/UsersPage.vue') },
      { path: 'profile', component: () => import('./features/users/pages/ProfilePage.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', component: () => import('./features/common/pages/NotFoundPage.vue') },
]

function redirectFor(meta) {
  const loggedIn = Boolean(getAccessToken())
  if (meta.requiresAuth && !loggedIn) return '/auth/login'
  if (meta.guest && loggedIn) return '/'
  return ''
}

export function createAppRouter(history = createWebHistory()) {
  const router = createRouter({ history, routes })
  router.beforeEach((to) => redirectFor(to.meta) || true)
  return router
}
