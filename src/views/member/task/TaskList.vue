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
            <template v-slot:item.title="{ item }">
                <a href="#" @click.prevent="goDetail(item)" class="text-decoration-none font-weight-bold text-primary">
                    {{ item.title }}
                </a>
            </template>

            <template v-slot:item.projectId="{ item }">
                {{ getProjectName(item.projectId) }}
            </template>

            <template v-slot:item.status="{ item }">
                <v-menu location="bottom">
                    <template v-slot:activator="{ props }">
                        <v-chip v-bind="props" :color="getStatusColor(item.status)" size="small" link class="cursor-pointer" style="min-width: 140px; justify-content: space-between;">
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
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/task'
import { useProjectStore } from '@/stores/project'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const taskStore = useTaskStore()
const authStore = useAuthStore()
const projectStore = useProjectStore()

const availableStatuses = ['TO_DO', 'IN_PROGRESS', 'DONE', 'CANCELLED']

const loading = computed(() => taskStore.loading)

// Lọc công việc theo ID người dùng hiện tại
const myTasks = computed(() => {
    const userId = authStore.user?.id
    if (!userId) return []
    // Lấy từ danh sách tất cả task của hệ thống, sau đó lọc ra những task được giao cho mình
    return taskStore.tasks.filter(t => t.assigneeId === userId)
})

const projects = computed(() => projectStore.projects)

const getProjectName = (projectId) => {
    const project = projects.value.find(p => p.id === projectId)
    return project ? project.name : projectId
}

const goDetail = (item) => {
    const realItem = item.raw || item
    router.push(`/member/tasks/${realItem.id}`)
}

const headers = [
    { title: 'Tiêu đề', key: 'title' },
    { title: 'Dự án', key: 'projectId' },
    { title: 'Ưu tiên', key: 'priority' },
    { title: 'Trạng thái', key: 'status', width: '180px' },
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
    // Lấy tất cả task và project của hệ thống để đảm bảo có đủ dữ liệu
    // để lọc ra task của mình và hiển thị đúng tên dự án.
    taskStore.fetchAll()
    projectStore.fetchAll()
})
</script>