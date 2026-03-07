<template>
    <div v-if="loading">Đang chuyển hướng...</div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(true)

onMounted(() => {
    const role = authStore.user?.role

    if (role === 'ADMIN' ) {
        router.replace('/admin')
    } else {
        router.replace('/member')   // hoặc '/dashboard' nếu bạn muốn dùng chung
    }
    loading.value = false
})
</script>