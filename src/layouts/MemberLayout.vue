<template>
  <v-layout shadow>
    <v-app-bar color="primary" flat px-4>
      <v-toolbar-title class="font-weight-bold">CT240 - Quản lý dự án</v-toolbar-title>
      <v-spacer></v-spacer>
      <span class="me-4 text-body-2">{{ authStore.user?.name }}</span>
      <v-btn variant="text" icon="mdi-logout" @click="logout"></v-btn>
    </v-app-bar>

    <v-navigation-drawer permanent elevation="1">
      <v-list nav>
        <v-list-item 
          prepend-icon="mdi-view-dashboard" 
          title="Dashboard" 
          to="/" 
        ></v-list-item>
        
        <v-list-item 
          prepend-icon="mdi-folder-strategy" 
          title="Dự án" 
          to="/projects" 
        ></v-list-item>
        
        <v-list-item 
          prepend-icon="mdi-clipboard-list" 
          title="Công việc" 
          to="/tasks" 
        ></v-list-item>
        
        <v-list-item 
          prepend-icon="mdi-bell" 
          title="Thông báo" 
          to="/notifications" 
        ></v-list-item>
        
        <v-list-item 
          prepend-icon="mdi-account-circle" 
          title="Hồ sơ" 
          to="/profile" 
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main style="min-height: 100vh; background-color: #f5f5f5;">
      <router-view />
    </v-main>
  </v-layout>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>