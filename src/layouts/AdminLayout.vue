<!-- src/layouts/AdminLayout.vue -->
<template>
    <v-app class="admin-background">
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

        <!-- Sidebar trái -->
        <v-navigation-drawer permanent app width="280" class="glass-sidebar" elevation="0" :rail="rail" @mouseenter="rail = false" @mouseleave="rail = true">
            <v-list nav dense>
                <!-- Tiêu đề hệ thống -->
                <v-list-item class="px-2 py-4" prepend-icon="mdi-shield-crown" title="Quản trị hệ thống">
                    <template v-slot:title>
                        <span class="text-h6 font-weight-bold black--text">Quản trị hệ thống</span>
                    </template>
                </v-list-item>

                <v-divider class="mb-2"></v-divider>

                <!-- Menu chính -->
                <v-list-item :to="{ name: 'AdminDashboard' }" exact class="menu-item" prepend-icon="mdi-view-dashboard" title="Bảng điều khiển"></v-list-item>

                <v-list-item :to="{ name: 'ProjectManagement' }" class="menu-item" prepend-icon="mdi-folder-multiple-outline" title="Dự án"></v-list-item>

                <v-list-item v-if="isAdmin" :to="{ name: 'UserManagement' }" class="menu-item" prepend-icon="mdi-account-group-outline" title="Người dùng"></v-list-item>

                <v-list-item :to="{ name: 'TaskManagement' }" class="menu-item" prepend-icon="mdi-clipboard-check-outline" title="Công việc"></v-list-item>

                <v-list-item :to="{ name: 'NotificationManagement' }" class="menu-item" prepend-icon="mdi-bell-outline" title="Thông báo"></v-list-item>

                <v-list-item :to="{ name: 'ReportManagement' }" class="menu-item" prepend-icon="mdi-chart-bar" title="Báo cáo & Thống kê"></v-list-item>

                <v-list-item :to="{ name: 'AdminProfile' }" class="menu-item" prepend-icon="mdi-account-circle-outline" title="Hồ sơ"></v-list-item>
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
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.userRole === 'ADMIN')
const router = useRouter()
const rail = ref(true)


const logout = () => {
    authStore.logout()
    router.push('/login')
}
</script>

<style scoped>
/* Tạo nền gradient nhẹ cho toàn bộ trang Admin để hiệu ứng kính nổi bật hơn */
.admin-background {
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
    /* Hiệu ứng trượt mượt mà (chậm hơn mặc định để tạo cảm giác "từ từ") */
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* --- GLASS HEADER STYLE (Optional) --- */
/* Nếu bạn muốn header cũng đồng bộ (nhưng giữ màu primary) */
.glass-header {
    background: rgba(var(--v-theme-primary), 0.9) !important; /* Vuetify 3 var, hoặc dùng hex code cứng */
}

/* Vùng nội dung trong suốt để thấy nền gradient */
.v-main {
    background: transparent !important;
    /* Thêm transition cho padding-left để nội dung bị đẩy vào mượt mà cùng tốc độ với sidebar */
    transition: padding-left 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.v-list-item__title {
    font-size: 1rem !important;
    /* chữ to hơn, không còn nhỏ */
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
    border-radius: 8px !important; /* Bo tròn item menu cho hợp style kính */
    border-bottom: none !important; /* Bỏ gạch chân cũ */
    
    /* Setup cho hiệu ứng trượt background */
    position: relative;
    z-index: 1;
    overflow: hidden; /* Quan trọng: để ẩn phần background khi nó trượt ra ngoài */
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
    z-index: -1; /* Nằm dưới chữ */
    
    /* Trạng thái mặc định: Ẩn sang bên trái (-100%) */
    transform: translateX(-100%);
    /* Hiệu ứng trượt mượt mà (ease-out) */
    transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* KHI ACTIVE: Trượt nền từ trái vào vị trí 0 (Hiện ra) */
.v-list-item--active::before {
    transform: translateX(0);
}

.menu-item:hover {
    background-color: rgba(0, 0, 0, 0.04); /* Hover nhẹ */
}

.v-list-item--active {
    background: transparent !important; /* Tắt background mặc định của Vuetify để dùng background trượt của mình */
    box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3);
}

.v-list-item--active .v-list-item__title,
.v-list-item--active .v-icon {
    color: #ffffff !important;
    /* Thêm transition cho màu chữ để đổi màu nhịp nhàng cùng lúc với nền trượt vào */
    transition: color 0.3s ease;
}

.v-divider {
    border-color: rgba(0, 0, 0, 0.08) !important;
}
</style>