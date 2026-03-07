<template>
    <v-container>
        <v-btn color="grey" variant="text" class="mb-4" @click="$router.back()">
            <v-icon start>mdi-arrow-left</v-icon> Quay lại
        </v-btn>

        <v-card v-if="task" :loading="loading">
            <v-card-title class="d-flex justify-space-between align-center py-4">
                <span class="text-h5 font-weight-bold">{{ task.title }}</span>
                <div>
                    <v-chip :color="getStatusColor(task.status)" class="mr-2">
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

const route = useRoute()
const taskStore = useTaskStore()
const projectStore = useProjectStore()
const userStore = useUserStore()

const task = computed(() => taskStore.currentTask)
const loading = computed(() => taskStore.loading)

// Helper lấy tên dự án
const projectName = computed(() => {
    if (!task.value?.projectId) return 'N/A'
    const project = projectStore.projects.find(p => p.id === task.value.projectId)
    return project ? project.name : task.value.projectId
})

// Helper lấy tên người thực hiện
const assigneeName = computed(() => {
    if (!task.value?.assigneeId) return 'Chưa giao'
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

onMounted(async () => {
    const taskId = route.params.id
    if (taskId) {
        await Promise.all([
            taskStore.getDetail(taskId),
            projectStore.fetchAll(), // Load để map tên dự án
            userStore.fetchAll()     // Load để map tên user
        ])
    }
})
</script>