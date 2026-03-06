<template>
    <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="5">
                <v-card class="elevation-6">
                    <v-card-title class="text-center text-h5 py-6">Đăng ký tài khoản mới</v-card-title>

                    <v-card-text>
                        <v-form @submit.prevent="handleRegister">
                            <v-text-field v-model="form.username" label="Tên đăng nhập" variant="outlined" required />
                            <v-text-field v-model="form.email" label="Email" type="email" variant="outlined" required />
                            <v-text-field v-model="form.fullName" label="Họ và tên" variant="outlined" required />
                            <v-text-field v-model="form.password" label="Mật khẩu" type="password" variant="outlined"
                                required />

                            <v-btn type="submit" color="primary" block size="large" class="mt-6" :loading="loading">
                                Đăng ký
                            </v-btn>
                        </v-form>
                    </v-card-text>

                    <v-card-actions class="justify-center pb-6">
                        <v-btn variant="text" to="/login">Đã có tài khoản? Đăng nhập ngay</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(false)

const form = ref({
    username: '',
    email: '',
    fullName: '',
    password: ''
})

const handleRegister = async () => {
    loading.value = true
    try {
        await authStore.register(form.value)
        router.push('/dashboard')
    } catch (err) {
        console.error('Register failed:', err)
        alert('Đăng ký thất bại!')
    } finally {
        loading.value = false
    }
}
</script>