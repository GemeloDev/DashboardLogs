const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/logs' },
      { path: 'logs', component: () => import('pages/LogsPage.vue') },
      { path: 'estadisticas', component: () => import('pages/EstadisticasPage.vue') },
      { path: 'eventos', component: () => import('pages/EventosPage.vue') },
      { path: 'eventos-fallidos', component: () => import('pages/EventosFallidos.vue') },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
