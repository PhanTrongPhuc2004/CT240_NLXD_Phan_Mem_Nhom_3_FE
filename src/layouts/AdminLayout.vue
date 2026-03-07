<!-- src/layouts/AdminLayout.vue -->
<template>
    <v-app>

        <!-- Header trên cùng (màu xanh, có tên hệ thống + logout) -->
        <v-app-bar app color="primary" dark flat elevation="2">
            <v-toolbar-title class="font-weight-bold">
                Quản lý công việc nhóm
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <!-- Nút đăng xuất góc phải -->
            <v-btn icon @click="logout" title="Đăng xuất">
                <v-icon>mdi-logout</v-icon>
            </v-btn>
        </v-app-bar>

        <!-- Sidebar trái - permanent để KHÔNG BIẾN MẤT khi chuyển trang -->
        <v-navigation-drawer permanent app color="grey lighten-3" width="280" class="elevation-1">
            <v-list nav dense>
                <!-- Tiêu đề hệ thống -->
                <v-list-item class="px-6 py-4">
                    <v-list-item-title class="text-subtitle-1 font-weight-bold grey--text text--darken-3">
                        Quản trị hệ thống
                    </v-list-item-title>
                </v-list-item>

                <v-divider></v-divider>

                <!-- Menu chính với icon -->
                <v-list-item-group v-model="selectedItem" color="primary">
                    <v-list-item :to="{ name: 'AdminDashboard' }" exact @click="selectedItem = 0">
                        <v-list-item-icon>
                            <v-icon>mdi-view-dashboard</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Bảng điều khiển</v-list-item-title>
                    </v-list-item>

                    <v-list-item :to="{ name: 'ProjectManagement' }" @click="selectedItem = 1">
                        <v-list-item-icon>
                            <v-icon>mdi-folder-multiple-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Dự án</v-list-item-title>
                    </v-list-item>

                    <v-list-item :to="{ name: 'UserManagement' }" @click="selectedItem = 2">
                        <v-list-item-icon>
                            <v-icon>mdi-account-group-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Người dùng</v-list-item-title>
                    </v-list-item>

                    <v-list-item :to="{ name: 'TaskManagement' }" @click="selectedItem = 3">
                        <v-list-item-icon>
                            <v-icon>mdi-clipboard-check-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Công việc</v-list-item-title>
                    </v-list-item>

                    <v-list-item :to="{ name: 'NotificationManagement' }" @click="selectedItem = 4">
                        <v-list-item-icon>
                            <v-icon>mdi-bell-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Thông báo</v-list-item-title>
                    </v-list-item>

                    <v-list-item :to="{ name: 'ReportManagement' }" @click="selectedItem = 5">
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

const drawer = ref(true)
const selectedItem = ref(0)

const logout = () => {
    authStore.logout()
    router.push('/login')
}
</script>

<style scoped>
.v-navigation-drawer {
    background-color: #838383 !important;
    border-right: 1px solid #e0e0e0 !important;
    z-index: 10 !important;
}

.v-list-item__icon {
    margin-right: 16px !important;
}

.v-list-item__title {
    font-size: 0.95rem !important;
    font-weight: 500 !important;
}

.v-list-item--active {
    background-color: rgba(63, 81, 181, 0.12) !important;
}
</style>