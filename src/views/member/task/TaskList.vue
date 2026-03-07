<template>
    <v-container>
        <h2 class="mb-4">Công việc được giao</h2>

        <v-data-table
            :headers="headers"
            :items="myTasks"
            :loading="loading"
            class="elevation-1"
            no-data-text="Bạn chưa được giao công việc nào"
        >
            <template v-slot:item.status="{ item }">
                <v-menu location="bottom">
                    <template v-slot:activator="{ props }">
                        <v-chip v-bind="props" :color="getStatusColor(item.status)" size="small" link class="cursor-pointer">
                            {{ item.status }}
                            <v-icon end size="small">mdi-chevron-down</v-icon>
                        </v-chip>
                    </template>
                    <v-list density="compact">
                        <v-list-item v-for="status in availableStatuses" :key="status" :value="status" @click="handleUpdateStatus(item, status)">
                            <v-list-item-title>
                                <v-chip size="x-small" :color="getStatusColor(status)">{{ status }}</v-chip>
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>

            <template v-slot:item.priority="{ item }">
                <v-chip :color="getPriorityColor(item.priority)" size="small" variant="outlined">
                    {{ item.priority }}
                </v-chip>
            </template>

            <template v-slot:item.deadline="{ item }">
                {{ item.deadline ? new Date(item.deadline).toLocaleDateString('vi-VN') : '' }}
            </template>
        </v-data-table>
    </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/task'
import { useAuthStore } from '@/stores/auth'

const taskStore = useTaskStore()
const authStore = useAuthStore()

const availableStatuses = ['TO_DO', 'IN_PROGRESS', 'DONE', 'CANCELLED']

const loading = computed(() => taskStore.loading)

// Lọc công việc theo ID người dùng hiện tại
const myTasks = computed(() => {
    const userId = authStore.user?.id
    if (!userId) return []
    // Chỉ lấy các task mà assigneeId trùng với ID của user đang đăng nhập
    return taskStore.tasks.filter(t => t.assigneeId === userId)
})

const headers = [
    { title: 'Tiêu đề', key: 'title' },
    { title: 'Dự án ID', key: 'projectId' },
    { title: 'Ưu tiên', key: 'priority' },
    { title: 'Trạng thái', key: 'status' },
    { title: 'Hạn chót', key: 'deadline' },
]

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

const handleUpdateStatus = async (item, newStatus) => {
    if (item.status === newStatus) return
    // Nếu chuyển sang CANCELLED hoặc DONE, có thể cần confirm hoặc nhập lý do (tạm thời để null)
    // Backend yêu cầu: updateStatus(id, status, cancelReason)
    const realItem = item.raw || item // Xử lý reactivity của Vuetify data table
    await taskStore.updateStatus(realItem.id, newStatus, null)
}

onMounted(() => {
    taskStore.fetchAll()
})
</script>