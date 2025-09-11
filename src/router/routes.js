const routes = [
  // Ruta de Login (sin layout)
  {
    path: '/login',
    name: 'Login',
    component: () => import('pages/LoginPageNew.vue'),
    meta: { hideLayout: true }
  },

  // Rutas principales (con layout y protección)
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/escritorio' }, // Por defecto escritorio
      { path: 'dashboard', redirect: '/escritorio' }, // Alias para dashboard
      { path: 'logs', redirect: '/escritorio' }, // Alias para logs

      // Rutas específicas para cada flujo
      {
        path: 'escritorio',
        component: () => import('pages/EscritorioPage.vue'),
        meta: { flow: 'escritorio' }
      },
      {
        path: 'mobile',
        component: () => import('pages/LogsPage.vue'),
        meta: { flow: 'mobile' }
      },

      { path: 'estadisticas', component: () => import('pages/EstadisticasPage.vue') },
      { path: 'eventos', component: () => import('pages/EventosPage.vue') },
      { path: 'eventos-fallidos', component: () => import('pages/EventosFallidos.vue') },
      { path: 'diagnostico', component: () => import('pages/DiagnosticoPage.vue') },
      { path: 'santoro-demo', component: () => import('pages/SantoroDemoPage.vue') },
      { path: 'santoro-config', component: () => import('pages/SantoroConfigPage.vue') },
    ],
  },

  // Página de error 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
