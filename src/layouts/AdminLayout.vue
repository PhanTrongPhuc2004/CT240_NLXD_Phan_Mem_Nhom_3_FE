<template>
    <v-layout>
        <v-app-bar color="primary" flat>
            <v-toolbar-title>CT240 - Quản trị hệ thống</v-toolbar-title>
        </v-app-bar>

        <v-navigation-drawer permanent>
            <v-list>
                <v-list-item to="/admin">Dashboard Quản trị</v-list-item>
                <v-list-item to="/admin/users">Quản lý Người dùng</v-list-item>
                <v-list-item to="/admin/projects">Quản lý Dự án</v-list-item>
                <v-list-item to="/admin/reports">Báo cáo & Thống kê</v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-main>
            <router-view />
        </v-main>
    </v-layout>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
const logout = () => authStore.logout()
</script>