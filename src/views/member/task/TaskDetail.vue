<template>
    <v-container>
        <v-btn color="grey-darken-1" variant="text" class="mb-4 font-weight-bold" rounded="pill" @click="$router.back()">
            <v-icon start>mdi-arrow-left</v-icon> Quay lại
        </v-btn>

        <v-card v-if="task" :loading="loading">
            <v-card-title class="d-flex justify-space-between align-center py-4">
                <span class="text-h5 font-weight-bold">{{ task.title }}</span>
                <div>
                    <v-menu location="bottom end" v-if="canChangeStatus">
                        <template v-slot:activator="{ props }">
                            <v-chip v-bind="props" :color="getStatusColor(task.status)" class="mr-2 cursor-pointer" link append-icon="mdi-chevron-down">
                                {{ task.status }}
                            </v-chip>
                        </template>
                        <v-list density="compact">
                            <v-list-item v-for="status in ['TO_DO', 'IN_PROGRESS', 'DONE', 'CANCELLED']" :key="status" :value="status" @click="updateStatus(status)">
                                <v-list-item-title>
                                    <v-chip size="x-small" :color="getStatusColor(status)" class="mr-2"></v-chip>
                                    {{ status }}
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                    <v-chip v-else :color="getStatusColor(task.status)" class="mr-2">
                        {{ task.status }}
                    </v-chip>
                    <v-chip :color="getPriorityColor(task.priority)" variant="outlined">
                        {{ task.priority }}
                    </v-chip>
                </div>
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text class="py-4">
                <v-row>
                    <v-col cols="12" md="8">
                        <h3 class="text-subtitle-1 font-weight-bold mb-2">Mô tả công việc</h3>
                        <p class="text-body-1 mb-4" style="white-space: pre-line;">
                            {{ task.description || 'Không có mô tả' }}
                        </p>

                        <v-divider class="my-4"></v-divider>
                        <CommentSection :taskId="task.id" />
                    </v-col>

                    <v-col cols="12" md="4">
                        <v-card variant="tonal" color="primary">
                            <v-card-text>
                                <div class="mb-3">
                                    <div class="text-caption text-grey">Dự án</div>
                                    <div class="font-weight-medium">{{ projectName }}</div>
                                </div>
                                <div class="mb-3">
                                    <div class="text-caption text-grey">Người thực hiện</div>
                                    <div class="font-weight-medium">{{ assigneeName }}</div>
                                </div>
                                <div class="mb-3">
                                    <div class="text-caption text-grey">Hạn chót</div>
                                    <div class="font-weight-medium text-red">
                                        {{ task.deadline ? new Date(task.deadline).toLocaleString('vi-VN') : 'Chưa thiết lập' }}
                                    </div>
                                </div>
                                <div>
                                    <div class="text-caption text-grey">Ngày tạo</div>
                                    <div>{{ task.createdAt ? new Date(task.createdAt).toLocaleDateString('vi-VN') : '' }}</div>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <v-alert v-else-if="!loading" type="error" class="mt-4">
            Không tìm thấy thông tin công việc.
        </v-alert>

    </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTaskStore } from '@/stores/task'
import { useProjectStore } from '@/stores/project'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'
import CommentSection from '@/components/CommentSection.vue'

const route = useRoute()
const taskStore = useTaskStore()
const projectStore = useProjectStore()
const userStore = useUserStore()
const authStore = useAuthStore()

const task = computed(() => taskStore.currentTask)
const loading = computed(() => taskStore.loading)

const canChangeStatus = computed(() => {
    // Admin chỉ có quyền xem
    if (authStore.userRole === 'ADMIN') return false
    
    const uid = authStore.user?.id
    const project = projectStore.projects.find(p => p.id === task.value?.projectId)
    
    // Manager hệ thống có quyền thay đổi nếu nằm trong dự án
    if (authStore.userRole === 'MANAGER') {
        if (project) {
            return project.ownerId == uid || project.memberIds?.some(id => id == uid)
        }
        return false;
    }
    
    // Check quyền Project Owner
    if (project) {
        if (project.ownerId == uid) return true
    }

    // Người được giao việc (Assignee) có quyền thay đổi
    return task.value?.assigneeId == authStore.user?.id
})

// Helper lấy tên dự án
const projectName = computed(() => {
    if (!task.value?.projectId) return 'N/A'
    const project = projectStore.projects.find(p => p.id === task.value.projectId)
    return project ? project.name : task.value.projectId
})

// Helper lấy tên người thực hiện
const assigneeName = computed(() => {
    if (!task.value?.assigneeId) return 'Chưa giao'
    // Nếu là chính mình (Member xem task của mình)
    if (task.value.assigneeId === authStore.user?.id) {
        return authStore.user?.fullName || authStore.user?.username
    }
    const user = userStore.users.find(u => u.id === task.value.assigneeId)
    return user ? user.fullName : task.value.assigneeId
})

const getStatusColor = (status) => {
    if (status === 'DONE') return 'success'
    if (status === 'IN_PROGRESS') return 'info'
    if (status === 'CANCELLED') return 'error'
    return 'default'
}

const getPriorityColor = (priority) => {
    if (priority === 'HIGH') return 'red'
    if (priority === 'MEDIUM') return 'orange'
    return 'green'
}

const updateStatus = async (newStatus) => {
    if (!task.value || task.value.status === newStatus) return
    try {
        await taskStore.updateStatus(task.value.id, newStatus, null)
        // Load lại chi tiết để cập nhật giao diện
        await taskStore.getDetail(task.value.id)
    } catch (error) {
        const msg = error.response?.status === 403 
            ? "Bạn không có quyền chỉnh sửa trạng thái của công việc này" 
            : (error.response?.data?.message || error.message)
        Swal.fire('Lỗi', 'Lỗi cập nhật trạng thái: ' + msg, 'error')
    }
}

onMounted(async () => {
    const taskId = route.params.id
    if (taskId) {
        const promises = [
            taskStore.getDetail(taskId),
            projectStore.fetchAll() // Load để map tên dự án
        ]

        // Chỉ Admin/Manager mới được phép lấy danh sách tất cả user
        // Member thường bị chặn (403) hoặc 401 gây logout
        if (['ADMIN', 'MANAGER'].includes(authStore.userRole)) {
             promises.push(userStore.fetchAll())
        }
        
        await Promise.all(promises)
    }
})
</script>
