<template>
    <v-layout>
        <v-app-bar color="primary" flat>
            <v-toolbar-title>CT240 - Công việc của tôi</v-toolbar-title>
        </v-app-bar>

        <v-navigation-drawer permanent>
            <v-list>
                <v-list-item to="/dashboard">Dashboard</v-list-item>
                <v-list-item to="/projects">Dự án</v-list-item>
                <v-list-item to="/tasks">Công việc</v-list-item>
                <v-list-item to="/notifications">Thông báo</v-list-item>
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