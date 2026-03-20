<!-- src/layouts/AdminLayout.vue -->
<template>
    <v-app>
        <!-- Header trên cùng -->
        <v-app-bar app color="primary" dark flat elevation="2">
            <v-toolbar-title class="font-weight-bold">
                Quản lý công việc nhóm
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="logout" title="Đăng xuất">
                <v-icon>mdi-logout</v-icon>
            </v-btn>
        </v-app-bar>

        <!-- Sidebar trái -->
        <v-navigation-drawer permanent app width="280" class="elevation-1">
            <v-list nav dense>
                <!-- Tiêu đề hệ thống -->
                <v-list-item class="px-6 py-5">
                    <v-list-item-title class="text-h6 font-weight-bold black--text">
                        Quản trị hệ thống
                    </v-list-item-title>
                </v-list-item>

                <v-divider class="mb-2"></v-divider>

                <!-- Menu chính -->
                <v-list-item-group v-model="selectedItem" mandatory>
                    <v-list-item :to="{ name: 'AdminDashboard' }" exact class="menu-item px-4">
                        <v-list-item-icon>
                            <v-icon>mdi-view-dashboard</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Bảng điều khiển</v-list-item-title>
                    </v-list-item>

                    <v-list-item :to="{ name: 'UserManagement' }" class="menu-item px-4">
                        <v-list-item-icon>
                            <v-icon>mdi-account-group-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Người dùng</v-list-item-title>
                    </v-list-item>

                    <v-list-item :to="{ name: 'ProjectManagement' }" class="menu-item px-4">
                        <v-list-item-icon>
                            <v-icon>mdi-folder-multiple-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Dự án</v-list-item-title>
                    </v-list-item>

                    <v-list-item :to="{ name: 'TaskManagement' }" class="menu-item px-4">
                        <v-list-item-icon>
                            <v-icon>mdi-clipboard-check-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Công việc</v-list-item-title>
                    </v-list-item>

                    <v-list-item :to="{ name: 'NotificationManagement' }" class="menu-item px-4">
                        <v-list-item-icon>
                            <v-icon>mdi-bell-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Thông báo</v-list-item-title>
                    </v-list-item>

                    <v-list-item :to="{ name: 'ReportManagement' }" class="menu-item px-4">
                        <v-list-item-icon>
                            <v-icon>mdi-chart-bar</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Báo cáo & Thống kê</v-list-item-title>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-navigation-drawer>

        <!-- Nội dung chính -->
        <v-main>
            <v-container fluid class="pa-6">
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

const selectedItem = ref(0)

const logout = () => {
    authStore.logout()
    router.push('/login')
}
</script>

<style scoped>
.v-navigation-drawer {
    background-color: #ffffff !important;
    border-right: 1px solid #e0e0e0 !important;
}

.v-list-item__title {
    font-size: 1rem !important;
    /* chữ to hơn, không còn nhỏ */
    font-weight: 700 !important;
    /* đậm rõ ràng */
    color: #000000 !important;
}

.v-list-item__icon .v-icon {
    color: #000000 !important;
    font-size: 24px !important;
}

.menu-item {
    min-height: 52px !important;
    border-bottom: 1px solid #e8ecef !important;
}

.menu-item:last-child {
    border-bottom: none !important;
}

/* Khi active: nền xanh đậm + chữ trắng */
.v-list-item--active {
    background-color: #1976d2 !important;
}

.v-list-item--active .v-list-item__title,
.v-list-item--active .v-icon {
    color: #ffffff !important;
}

.v-divider {
    border-color: #e0e0e0 !important;
}
</style>