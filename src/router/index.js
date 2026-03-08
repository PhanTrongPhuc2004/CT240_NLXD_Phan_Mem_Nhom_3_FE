import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Layouts
import AdminLayout from '@/layouts/AdminLayout.vue'
import MemberLayout from '@/layouts/MemberLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Auth routes (không layout)
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/Login.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/auth/Register.vue'),
      meta: { requiresAuth: false },
    },

    {
      path: '/',
      redirect: '/member'
    },
    // Member routes - dùng MemberLayout
    {
      path: '/member',
      component: MemberLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'MemberDashboard',
          component: () => import('@/views/member/MemberDashboard.vue'),
        },
        {
          path: 'projects',
          name: 'MemberProjects',
          component: () => import('@/views/member/project/ProjectList.vue'),
        },
        {
          path: 'projects/create',
          name: 'ProjectCreate',
          component: () => import('@/views/member/project/ProjectForm.vue'),
        },
        {
          path: 'projects/:id',
          name: 'ProjectDetail',
          component: () => import('@/views/member/project/ProjectDetail.vue'),
        },
        {
          path: 'tasks',
          name: 'MemberTasks',
          component: () => import('@/views/member/task/TaskList.vue'),
        },
        {
          path: 'tasks/:id',
          name: 'TaskDetail',
          component: () => import('@/views/member/task/TaskDetail.vue'),
        },
        {
          path: 'notifications',
          name: 'Notifications',
          component: () => import('@/views/member/notifications/NotificationList.vue'),
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('@/views/shared/Profile.vue'),
        },
      ],
    },

    // Admin/Manager routes - dùng AdminLayout
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'AdminDashboard',
          component: () => import('@/views/admin/AdminDashboard.vue'),
        },
        {
          path: 'users',
          name: 'UserManagement',
          component: () => import('@/views/admin/UserManagement.vue'),
        },
        {
          path: 'projects',
          name: 'ProjectManagement',
          component: () => import('@/views/admin/ProjectManagement.vue'),
        },
        {
          // Thêm route này để Admin xem chi tiết dự án mà vẫn giữ AdminLayout
          path: 'projects/:id',
          name: 'AdminProjectDetail',
          component: () => import('@/views/member/project/ProjectDetail.vue'),
        },
        {
          path: 'tasks',
          name: 'TaskManagement',
          component: () => import('@/views/admin/TaskManagement.vue'),
        },
        {
          path: 'tasks/:id',
          name: 'AdminTaskDetail',
          component: () => import('@/views/member/task/TaskDetail.vue')
        },
        {
          path: 'notifications',
          name: 'NotificationManagement',
          component: () => import('@/views/admin/NotificationManagement.vue'),
        },
        {
          path: 'reports',
          name: 'ReportManagement',
          component: () => import('@/views/admin/ReportManagement.vue')
        }
      ]
    },

    // Redirect nếu không khớp
    { path: '/:pathMatch(.*)*', redirect: '/login' },
  ],
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    authStore.initializeAuth()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  next()
})

export default router
