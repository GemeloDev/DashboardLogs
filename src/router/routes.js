const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('pages/LoginPage.vue'),
    meta: { hideLayout: true }
  },
  {
    path: '/verificarCuenta',
    name: 'verificarCuenta',
    component: () => import('pages/VerificarCuentaPage.vue'),
    meta: { hideLayout: true }
  },
  {
    path: '/olvide-password',
    name: 'olvidePassword',
    component: () => import('pages/PasswordOlvidadoPage.vue'),
    meta: { hideLayout: true }
  },
  {
    path: '/reset-password',
    name: 'resetPassword',
    component: () => import('pages/ResetPasswordPage.vue'),
    meta: { hideLayout: true }
  },
  {
    path: '/accept-invite',
    name: 'acceptInvite',
    component: () => import('pages/AcceptInvitation.vue'),
    meta: { hideLayout: true }
  },
  {
    path: '/client/escritorio/section/:section',
    name: 'dashboardSectionWindow',
    component: () => import('pages/DashboardPanelWindowPage.vue'),
    meta: { requiresAuth: true, hideLayout: true, flow: 'client' }
  },
  {
    path: '/client/escritorio/panel/:panel',
    name: 'dashboardPanelWindow',
    component: () => import('pages/DashboardPanelWindowPage.vue'),
    meta: { requiresAuth: true, hideLayout: true, flow: 'client' }
  },
  {
    path: '/new-password',
    name: 'newPassword',
    component: () => import('pages/ChangeTempPassword.vue'),
    meta: { hideLayout: true }
  },

  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'client/escritorio',
        name: 'clientEscritorio',
        component: () => import('pages/EscritorioPage.vue'),
        meta: { flow: 'client' }
      },
      {
        path: 'client/diagnostico',
        name: 'clientDiagnostico',
        component: () => import('pages/DiagnosticoPage.vue'),
        meta: { flow: 'client' }
      },
      {
        path: 'client/myApiKeys',
        name: 'clientApiKeys',
        component: () => import('pages/APIKeysPage.vue'),
        meta: { flow: 'client' }
      },
      {
        path: 'client/gestion-empleados',
        name: 'clientGestionEmpleados',
        component: () => import('pages/GestionEmpleadosPage.vue'),
        meta: { flow: 'client' }
      },
      {
        path: 'client/eva',
        name: 'clientEva',
        component: () => import('src/pages/EvaWorkspacePage.vue'),
        meta: { flow: 'client' }
      },

      {
        path: 'santoro/inicio',
        name: 'santoroInicio',
        component: () => import('pages/admin/EscritorioInicio.vue'),
        meta: { flow: 'santoro', requiresAdmin: true }
      },
      {
        path: 'santoro/empresas',
        name: 'santoroEmpresas',
        component: () => import('pages/admin/EmpresasAdminPage.vue'),
        meta: { flow: 'santoro', requiresAdmin: true }
      },
      {
        path: 'santoro/usuarios',
        name: 'santoroUsuarios',
        component: () => import('pages/admin/UsuariosAdminPage.vue'),
        meta: { flow: 'santoro', requiresAdmin: true }
      },
      {
        path: 'santoro/api-keys',
        name: 'santoroApiKeys',
        component: () => import('pages/admin/APIKeysAdminPage.vue'),
        meta: { flow: 'santoro', requiresAdmin: true }
      },
      {
        path: 'santoro/gestion-empleados',
        name: 'gestionEmpleados',
        component: () => import('pages/admin/GestionEmpleadosSantoroPage.vue'),
        meta: { flow: 'santoro', requiresAdmin: true }
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
