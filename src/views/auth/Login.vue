<!-- src/views/auth/Login.vue - ĐÃ SỬA HOÀN CHỈNH: Không redirect cứng '/dashboard' nữa, để auth store tự xử lý redirect theo role -->
<template>
    <v-container class="fill-height login-background" fluid>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="5" lg="4">
                <v-card class="elevation-10 rounded-xl pa-4 glass-card">
                    <div class="text-center pt-4">
                        <v-avatar color="primary" size="64" class="elevation-3 mb-3">
                            <v-icon size="32" color="white">mdi-shield-account</v-icon>
                        </v-avatar>
                        <h2 class="text-h5 font-weight-bold text-primary mb-1">Đăng Nhập</h2>
                        <p class="text-caption text-grey-darken-1">Chào mừng bạn quay trở lại hệ thống</p>
                    </div>

                    <v-card-text class="mt-4">
                        <v-form @submit.prevent="handleLogin" ref="formRef">
                            <v-text-field 
                                v-model="form.username" 
                                label="Tên đăng nhập" 
                                variant="outlined"
                                density="comfortable"
                                prepend-inner-icon="mdi-account" 
                                color="primary"
                                class="mb-2"
                                :rules="[v => !!v || 'Vui lòng nhập tài khoản']"
                            />
                            
                            <v-text-field 
                                v-model="form.password" 
                                label="Mật khẩu" 
                                type="password" 
                                variant="outlined"
                                density="comfortable"
                                prepend-inner-icon="mdi-lock" 
                                color="primary"
                                :rules="[v => !!v || 'Vui lòng nhập mật khẩu']"
                            />

                            <v-btn 
                                type="submit" 
                                color="primary" 
                                block 
                                size="large" 
                                class="mt-4 text-none font-weight-bold gradient-btn rounded-lg" 
                                :loading="loading"
                                elevation="3"
                            >
                                Đăng nhập
                            </v-btn>
                        </v-form>
                    </v-card-text>

                    <v-card-actions class="justify-center pb-6">
                        <span class="text-body-2 text-grey-darken-1">Chưa có tài khoản?</span>
                        <v-btn variant="text" to="/register" color="primary" class="font-weight-bold text-none px-1" :ripple="false">
                            Đăng ký ngay
                        </v-btn>
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
const formRef = ref(null)

const form = ref({
    username: '',
    password: ''
})

const handleLogin = async () => {
    const { valid } = await formRef.value.validate()
    if (!valid) return

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

<style scoped>
.login-background {
    background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(66, 165, 245, 0.1) 100%), 
                url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop') no-repeat center center;
    background-size: cover;
}

.glass-card {
    backdrop-filter: blur(10px);
    background-color: rgba(255, 255, 255, 0.95) !important;
}

.gradient-btn {
    background: linear-gradient(90deg, #1976D2 0%, #42A5F5 100%);
    transition: transform 0.2s;
}

.gradient-btn:active {
    transform: scale(0.98);
}
</style>