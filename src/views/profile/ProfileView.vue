<!-- src/views/profile/ProfileView.vue -->
<template>
    <v-container fluid class="py-8" style="max-width: 1000px; margin: 0 auto;">
        <v-card elevation="3" class="rounded-xl overflow-hidden">
            <!-- Header Profile -->
            <v-card-title class="pa-6 bg-primary text-white d-flex align-center">
                <v-avatar size="80" class="mr-5">
                    <v-img v-if="profile.avatarUrl" :src="profile.avatarUrl" />
                    <v-icon v-else size="50" color="white">mdi-account-circle</v-icon>
                </v-avatar>
                <div>
                    <h2 class="text-h5 font-weight-bold mb-1">{{ profile.fullName || 'Chưa cập nhật tên' }}</h2>
                    <p class="text-body-1 opacity-90 mb-0">{{ profile.role ? getRoleDisplay(profile.role) : 'Thành viên'
                        }}</p>
                </div>
                <v-spacer />
                <v-btn color="white" variant="flat" @click="goToEditProfile">
                    <v-icon left>mdi-pencil</v-icon>
                    Chỉnh sửa hồ sơ
                </v-btn>
            </v-card-title>

            <!-- Thông tin cá nhân -->
            <v-card-text class="pa-6">
                <v-row>
                    <v-col cols="12" md="6">
                        <div class="d-flex mb-5">
                            <v-icon color="grey" class="mr-4 mt-1">mdi-email</v-icon>
                            <div>
                                <div class="text-caption text-grey">Email</div>
                                <div class="font-weight-medium">{{ profile.email || 'Chưa có email' }}</div>
                            </div>
                        </div>
                    </v-col>
                    <v-col cols="12" md="6">
                        <div class="d-flex mb-5">
                            <v-icon color="grey" class="mr-4 mt-1">mdi-account-badge</v-icon>
                            <div>
                                <div class="text-caption text-grey">Vai trò</div>
                                <div class="font-weight-medium">{{ getRoleDisplay(profile.role) }}</div>
                            </div>
                        </div>
                    </v-col>
                </v-row>
            </v-card-text>

            <!-- Dự án đã tham gia -->
            <v-divider />
            <v-card-title class="px-6 py-4 text-body-1 font-weight-medium">
                <v-icon class="mr-2" color="primary">mdi-briefcase-outline</v-icon>
                Dự án đã tham gia ({{ projects.length }})
            </v-card-title>
            <v-card-text class="px-6 pb-6">
                <v-list v-if="projects.length" class="py-0">
                    <v-list-item v-for="project in projects" :key="project.id" class="px-0 py-3">
                        <v-list-item-title class="font-weight-medium">{{ project.name }}</v-list-item-title>
                        <v-list-item-subtitle class="text-caption">
                            {{ project.description || 'Không có mô tả' }}
                        </v-list-item-subtitle>
                        <template v-slot:append>
                            <v-chip size="small" color="primary" variant="tonal">
                                {{ project.status || 'Đang thực hiện' }}
                            </v-chip>
                        </template>
                    </v-list-item>
                </v-list>
                <v-alert v-else type="info" text="Bạn chưa tham gia dự án nào." />
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { userApi } from '@/api/userApi'
import { projectApi } from '@/api/projectApi'

const router = useRouter()
const authStore = useAuthStore()

const profile = ref({
    id: '',
    fullName: '',
    email: '',
    avatarUrl: '',
    role: 'MEMBER'
})

const projects = ref([])

const getRoleDisplay = (role) => {
    switch (role) {
        case 'ADMIN': return 'Quản trị viên'
        case 'MANAGER': return 'Quản lý dự án'
        case 'MEMBER': return 'Thành viên'
        default: return role || 'Thành viên'
    }
}

const fetchProfile = async () => {
    try {
        const res = await userApi.getProfile()
        profile.value = res.data
    } catch (err) {
        console.error('Lỗi tải hồ sơ:', err)
    }
}

const fetchProjects = async () => {
    try {
        const res = await projectApi.getAll()
        projects.value = res.data || []
    } catch (err) {
        console.error('Lỗi tải dự án:', err)
    }
}

const goToEditProfile = () => {
    if (['ADMIN', 'MANAGER'].includes(authStore.user?.role)) {
        router.push('/admin/profile/edit')
    } else {
        router.push('/member/profile/edit')
    }
}

onMounted(() => {
    fetchProfile()
    fetchProjects()
})
</script>

<style scoped>
.v-card {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1) !important;
}
</style>