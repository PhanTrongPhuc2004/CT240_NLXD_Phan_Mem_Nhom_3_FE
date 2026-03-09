<!-- src/views/profile/ProfileEdit.vue -->
<template>
    <v-container fluid class="py-8" style="max-width: 800px; margin: 0 auto;">
        <v-card elevation="3" class="rounded-xl">
            <v-card-title class="pa-6 bg-primary text-white">
                <v-icon class="mr-3">mdi-account-edit</v-icon>
                Chỉnh sửa hồ sơ cá nhân
            </v-card-title>

            <v-card-text class="pa-8">
                <v-form ref="formRef" @submit.prevent="saveProfile">
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="form.fullName" label="Họ và tên" prepend-icon="mdi-account" outlined
                                density="compact" :rules="[rules.required]" />
                        </v-col>

                        <v-col cols="12">
                            <v-text-field v-model="form.email" label="Email" prepend-icon="mdi-email" outlined
                                density="compact" disabled />
                        </v-col>

                        <v-col cols="12">
                            <v-text-field v-model="form.avatarUrl" label="Link URL ảnh đại diện" prepend-icon="mdi-link"
                                outlined density="compact" placeholder="https://example.com/anh-cua-ban.jpg"
                                hint="Dán link ảnh trực tiếp từ internet (Imgur, Google Drive, GitHub...)"
                                persistent-hint />
                        </v-col>

                        <v-col cols="12" class="text-center">
                            <v-avatar size="160" class="mb-4" style="border: 4px solid #eee;">
                                <v-img v-if="form.avatarUrl" :src="form.avatarUrl" cover />
                                <v-icon v-else size="80" color="grey-lighten-1">mdi-account-circle</v-icon>
                            </v-avatar>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>

            <v-card-actions class="pa-6">
                <v-spacer />
                <v-btn color="grey" variant="text" @click="goBack">Hủy</v-btn>
                <v-btn color="primary" :loading="saving" @click="saveProfile">
                    Lưu thay đổi
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { userApi } from '@/api/userApi'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
    fullName: '',
    email: '',
    avatarUrl: ''
})

const saving = ref(false)
const formRef = ref(null)

const rules = {
    required: v => !!v || 'Họ và tên không được để trống'
}

const loadProfile = async () => {
    try {
        const res = await userApi.getProfile()
        form.value.fullName = res.data.fullName || ''
        form.value.email = res.data.email || ''
        form.value.avatarUrl = res.data.avatarUrl || ''
    } catch (e) {
        console.error(e)
    }
}

const saveProfile = async () => {
    const { valid } = await formRef.value.validate()
    if (!valid) return

    saving.value = true
    try {
        await authStore.updateProfile({
            fullName: form.value.fullName,
            avatarUrl: form.value.avatarUrl || null
        })
        router.push('/member/profile')
    } catch (err) {
        console.error(err)
        alert('Lưu không thành công!')
    } finally {
        saving.value = false
    }
}

const goBack = () => router.push('/profile')

loadProfile()
</script>

<style scoped>
.v-card {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1) !important;
}
</style>