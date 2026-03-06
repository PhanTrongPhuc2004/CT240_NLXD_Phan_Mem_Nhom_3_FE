import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/Login.vue'),
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/auth/Register.vue'),
    },

    {
      path: '/',
      component: () => import('@/layouts/MemberLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'MemberDashboard',
          component: () => import('@/views/member/Dashboard.vue'),
        },
        // Quản lý dự án
        {
          path: 'projects',
          name: 'MemberProjects',
          component: () => import('@/views/member/project/ProjectList.vue'),
        },
        {
          path: 'projects/create', // Chức năng Tạo dự án (CN_11) - Phải nằm trên :id
          name: 'ProjectCreate',
          component: () => import('@/views/member/project/ProjectForm.vue'),
        },
        {
          path: 'projects/edit/:id', // Chức năng Sửa dự án (CN_12)
          name: 'ProjectEdit',
          component: () => import('@/views/member/project/ProjectForm.vue'),
        },
        {
          path: 'projects/:id', // Chức năng Xem chi tiết (CN_14)
          name: 'ProjectDetail',
          component: () => import('@/views/member/project/ProjectDetail.vue'),
        },
        // Quản lý Task
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
        // Khác
        {
          path: 'notifications',
          name: 'Notifications',
          component: () => import('@/views/notification/NotificationList.vue'),
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('@/views/user/Profile.vue'),
        },
      ],
    },

    // Admin route
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresRole: ['ADMIN', 'MANAGER'] },
      children: [
        {
          path: '',
          name: 'AdminDashboard',
          component: () => import('@/views/admin/Dashboard.vue'),
        },
      ],
    },
  ],
})

// Navigation Guard (Bảo vệ route)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  next()
})

export default router
