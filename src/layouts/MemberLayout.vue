<!-- src/layouts/MemberLayout.vue -->
<template>
  <v-app class="app-background">
    <!-- Header trên cùng -->
    <v-app-bar app color="primary" dark flat elevation="0" class="glass-header">
      <v-toolbar-title class="font-weight-bold">
        CT240-Quản lý công việc nhóm
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="logout" title="Đăng xuất">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Sidebar trái cho Member -->
    <v-navigation-drawer permanent app width="280" class="glass-sidebar" elevation="0" :rail="rail" @mouseenter="rail = false" @mouseleave="rail = true">
      <v-list nav dense>
        <!-- Tiêu đề -->
        <v-list-item class="px-2 py-4" prepend-icon="mdi-account-circle-outline" title="Thành viên">
          <template v-slot:title>
            <span class="text-h6 font-weight-bold black--text">Thành viên</span>
          </template>
        </v-list-item>

        <v-divider class="mb-2"></v-divider>

        <!-- Menu cho Member -->
        <v-list-item :to="{ name: 'MemberDashboard' }" exact class="menu-item" prepend-icon="mdi-view-dashboard" title="Dashboard"></v-list-item>

        <v-list-item :to="{ name: 'MemberProjects' }" class="menu-item" prepend-icon="mdi-folder-outline" title="Tất cả dự án"></v-list-item>

        <v-list-item :to="{ name: 'MyProjects' }" class="menu-item" prepend-icon="mdi-account-group-outline" title="Dự án tham gia"></v-list-item>

        <v-list-item :to="{ name: 'MemberTasks' }" class="menu-item" prepend-icon="mdi-clipboard-text-outline" title="Công việc của tôi"></v-list-item>

        <v-list-item :to="{ name: 'Notifications' }" class="menu-item" prepend-icon="mdi-bell-outline" title="Thông báo của tôi"></v-list-item>

        <v-list-item :to="{ name: 'MemberProfile' }" class="menu-item" prepend-icon="mdi-account-circle-outline" title="Hồ sơ"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Nội dung chính -->
    <v-main>
      <v-container fluid class="pa-6 content-area">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const rail = ref(true)

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* Tạo nền gradient nhẹ cho toàn bộ trang (giống Admin) */
.app-background {
    background: linear-gradient(135deg, #eef2f3 0%, #e0eafc 100%) !important;
    background-attachment: fixed !important;
}

/* --- GLASS SIDEBAR STYLE --- */
.glass-sidebar {
    /* Màu trắng đục 75% */
    background: rgba(255, 255, 255, 0.75) !important;
    /* Hiệu ứng mờ đằng sau */
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    /* Viền phải nhẹ */
    border-right: 1px solid rgba(255, 255, 255, 0.8) !important;
    /* Đổ bóng nhẹ để tách biệt */
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.05) !important;
    /* Hiệu ứng trượt mượt mà */
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* --- GLASS HEADER STYLE --- */
.glass-header {
    background: rgba(var(--v-theme-primary), 0.9) !important;
}

/* Vùng nội dung trong suốt */
.v-main {
    background: transparent !important;
    /* Thêm transition cho padding-left để nội dung bị đẩy vào mượt mà */
    transition: padding-left 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.v-list-item__title {
  font-size: 1rem !important;
  /* chữ to hơn */
  font-weight: 700 !important;
  /* đậm rõ ràng */
  color: #000000 !important;
}

.v-list-item .v-icon {
  color: #000000 !important;
  font-size: 24px !important;
}

.menu-item {
  min-height: 52px !important;
  margin-bottom: 4px !important;
  border-radius: 8px !important;
  border-bottom: none !important;
  
  /* Setup cho hiệu ứng trượt background */
  position: relative;
  z-index: 1;
  overflow: hidden;
}

/* Tạo lớp nền ảo (pseudo-element) để trượt vào */
.menu-item::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, #1976d2, #64b5f6);
    z-index: -1;
    
    /* Trạng thái mặc định: Ẩn sang bên trái */
    transform: translateX(-100%);
    /* Hiệu ứng trượt mượt mà */
    transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* KHI ACTIVE: Trượt nền từ trái vào */
.v-list-item--active::before {
    transform: translateX(0);
}

.menu-item:hover {
    background-color: rgba(0, 0, 0, 0.04);
}

/* Khi active: nền xanh đậm + chữ trắng */
.v-list-item--active {
    background: transparent !important;
    box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3);
}

.v-list-item--active .v-list-item__title,
.v-list-item--active .v-icon {
  color: #ffffff !important;
  transition: color 0.3s ease;
}

.v-divider {
  border-color: rgba(0, 0, 0, 0.08) !important;
}
</style>