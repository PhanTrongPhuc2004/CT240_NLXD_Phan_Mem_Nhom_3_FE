<template>
    <v-container class="fill-height register-background" fluid>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="10" md="6" lg="5">
                <v-card class="elevation-10 rounded-xl pa-4 glass-card">
                    <div class="text-center pt-4">
                        <v-avatar color="secondary" size="64" class="elevation-3 mb-3">
                            <v-icon size="32" color="white">mdi-account-plus</v-icon>
                        </v-avatar>
                        <h2 class="text-h5 font-weight-bold text-secondary mb-1">Tạo Tài Khoản Mới</h2>
                        <p class="text-caption text-grey-darken-1">Tham gia cùng chúng tôi để quản lý dự án hiệu quả</p>
                    </div>

                    <v-card-text class="mt-4">
                        <v-form @submit.prevent="handleRegister" ref="formRef">
                            <v-row dense>
                                <v-col cols="12" md="6">
                                     <v-text-field 
                                        v-model="form.fullName" 
                                        label="Họ và tên" 
                                        variant="outlined" 
                                        density="comfortable"
                                        prepend-inner-icon="mdi-card-account-details"
                                        color="secondary"
                                        :rules="[v => !!v || 'Họ tên là bắt buộc']"
                                    />
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field 
                                        v-model="form.username" 
                                        label="Tên đăng nhập" 
                                        variant="outlined" 
                                        density="comfortable"
                                        prepend-inner-icon="mdi-account"
                                        color="secondary"
                                        :rules="[v => !!v || 'Tên đăng nhập là bắt buộc', v => v.length >= 3 || 'Tối thiểu 3 ký tự']"
                                    />
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field 
                                        v-model="form.email" 
                                        label="Email" 
                                        type="email" 
                                        variant="outlined" 
                                        density="comfortable"
                                        prepend-inner-icon="mdi-email"
                                        color="secondary"
                                        :rules="[v => !!v || 'Email là bắt buộc', v => /.+@.+\..+/.test(v) || 'Email không hợp lệ']"
                                    />
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field 
                                        v-model="form.password" 
                                        label="Mật khẩu" 
                                        type="password" 
                                        variant="outlined" 
                                        density="comfortable"
                                        prepend-inner-icon="mdi-lock"
                                        color="secondary"
                                        :rules="[v => !!v || 'Mật khẩu là bắt buộc', v => v.length >= 6 || 'Tối thiểu 6 ký tự']"
                                    />
                                </v-col>
                            </v-row>

                            <v-btn 
                                type="submit" 
                                color="secondary" 
                                block 
                                size="large" 
                                class="mt-4 text-none font-weight-bold gradient-btn rounded-lg" 
                                :loading="loading"
                                elevation="3"
                            >
                                Đăng ký
                            </v-btn>
                        </v-form>
                    </v-card-text>

                    <v-card-actions class="justify-center pb-6">
                        <span class="text-body-2 text-grey-darken-1">Đã có tài khoản?</span>
                        <v-btn variant="text" to="/login" color="secondary" class="font-weight-bold text-none px-1" :ripple="false">
                            Đăng nhập ngay
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
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(false)
const formRef = ref(null)

const form = ref({
    username: '',
    email: '',
    fullName: '',
    password: ''
})

const handleRegister = async () => {
    const { valid } = await formRef.value.validate()
    if (!valid) return

    loading.value = true
    try {
        await authStore.register(form.value)
    } catch (err) {
        console.error('Register failed:', err)
        alert('Đăng ký thất bại!')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.register-background {
    background: linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(103, 58, 183, 0.1) 100%), 
                url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop') no-repeat center center;
    background-size: cover;
}

.glass-card {
    backdrop-filter: blur(10px);
    background-color: rgba(255, 255, 255, 0.95) !important;
}

.gradient-btn {
    background: linear-gradient(90deg, #9C27B0 0%, #673AB7 100%);
    transition: transform 0.2s;
}

.gradient-btn:active {
    transform: scale(0.98);
}
</style>