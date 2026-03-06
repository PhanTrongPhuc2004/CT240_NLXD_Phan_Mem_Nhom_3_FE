<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(() => {
  if (authStore.token) {
    authStore.checkAuth()
  }
})
</script>