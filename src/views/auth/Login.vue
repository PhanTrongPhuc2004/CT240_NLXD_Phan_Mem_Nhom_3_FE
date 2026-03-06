<!-- src/views/auth/Login.vue - ĐÃ SỬA HOÀN CHỈNH: Không redirect cứng '/dashboard' nữa, để auth store tự xử lý redirect theo role -->
<template>
    <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="5">
                <v-card class="elevation-6">
                    <v-card-title class="text-center text-h5 py-6">Đăng nhập hệ thống</v-card-title>

                    <v-card-text>
                        <v-form @submit.prevent="handleLogin">
                            <v-text-field v-model="form.username" label="Tên đăng nhập hoặc Email" variant="outlined"
                                required prepend-inner-icon="mdi-account" />
                            <v-text-field v-model="form.password" label="Mật khẩu" type="password" variant="outlined"
                                required prepend-inner-icon="mdi-lock" />

                            <v-btn type="submit" color="primary" block size="large" class="mt-6" :loading="loading">
                                Đăng nhập
                            </v-btn>
                        </v-form>
                    </v-card-text>

                    <v-card-actions class="justify-center pb-6">
                        <v-btn variant="text" to="/register">Chưa có tài khoản? Đăng ký</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loading = ref(false)

const form = ref({
    username: '',
    password: ''
})

const handleLogin = async () => {
    loading.value = true
    try {
        await authStore.login(form.value)
        // KHÔNG push('/dashboard') nữa - authStore.login() sẽ tự redirect theo role
    } catch (err) {
        console.error('Login failed:', err)
        alert('Đăng nhập thất bại! Vui lòng kiểm tra lại tên đăng nhập/mật khẩu.')
    } finally {
        loading.value = false
    }
}
</script>