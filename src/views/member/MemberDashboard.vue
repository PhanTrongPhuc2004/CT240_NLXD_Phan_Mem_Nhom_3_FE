<template>
    <v-container fluid class="py-6">
        <div class="mb-8">
            <h2 class="text-h4 font-weight-bold mb-1">Xin chào, {{ authStore.user?.fullName }} 👋</h2>
            <p class="text-grey-darken-1">Đây là tổng quan công việc của bạn hôm nay.</p>
        </div>

        <!-- 1. Stats Cards -->
        <v-row class="mb-4">
            <v-col cols="12" sm="6" md="4">
                <v-card elevation="2" class="rounded-xl pa-4 d-flex align-center bg-white border-left-primary">
                    <div class="flex-grow-1">
                        <div class="text-h4 font-weight-bold text-primary mb-1">{{ (myPendingTasks || []).length }}</div>
                        <div class="text-subtitle-2 text-grey-darken-1 font-weight-bold">Công việc cần làm</div>
                    </div>
                    <v-avatar color="blue-lighten-5" size="56" class="rounded-lg">
                        <v-icon color="primary" size="32">mdi-clipboard-text-clock</v-icon>
                    </v-avatar>
                </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="4">
                <v-card elevation="2" class="rounded-xl pa-4 d-flex align-center bg-white border-left-warning">
                    <div class="flex-grow-1">
                        <div class="text-h4 font-weight-bold text-orange-darken-2">{{ (myProjects || []).length }}</div>
                        <div class="text-subtitle-2 text-grey-darken-1 font-weight-bold">Dự án tham gia</div>
                    </div>
                    <v-avatar color="orange-lighten-5" size="56" class="rounded-lg">
                        <v-icon color="orange-darken-2" size="32">mdi-briefcase-account</v-icon>
                    </v-avatar>
                </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="4">
                <v-card elevation="2" class="rounded-xl pa-4 d-flex align-center bg-white border-left-success">
                    <div class="flex-grow-1">
                        <div class="text-h4 font-weight-bold text-success">{{ myCompletedTasksCount }}</div>
                        <div class="text-subtitle-2 text-grey-darken-1 font-weight-bold">Đã hoàn thành</div>
                    </div>
                    <v-avatar color="green-lighten-5" size="56" class="rounded-lg">
                        <v-icon color="success" size="32">mdi-check-decagram</v-icon>
                    </v-avatar>
                </v-card>
            </v-col>
        </v-row>

        <!-- 2. Main Content -->
        <v-row>
            <!-- Cột trái: Danh sách công việc ưu tiên -->
            <v-col cols="12" md="8">
                <v-card elevation="2" class="rounded-lg h-100">
                    <v-card-title class="d-flex align-center py-4 px-5">
                        <v-icon color="primary" class="mr-2">mdi-lightning-bolt</v-icon>
                        <span class="font-weight-bold">Công việc ưu tiên</span>
                        <v-spacer></v-spacer>
                        <v-btn variant="text" size="small" color="primary" to="/member/tasks">Xem tất cả</v-btn>
                    </v-card-title>
                    <v-divider></v-divider>

                    <v-list lines="two" class="py-2">
                        <template v-if="myPendingTasks && myPendingTasks.length > 0">
                            <v-list-item v-for="task in myPendingTasks.slice(0, 5)" :key="task.id"
                                :to="'/member/tasks/' + task.id" class="rounded mb-1 mx-2">
                                <template v-slot:prepend>
                                    <v-icon :color="getPriorityColor(task.priority)" class="mr-3">
                                        {{ task.priority === 'HIGH' ? 'mdi-alert-circle' : 'mdi-circle-slice-8' }}
                                    </v-icon>
                                </template>

                                <v-list-item-title class="font-weight-bold text-body-1">
                                    {{ task.title }}
                                </v-list-item-title>
                                <v-list-item-subtitle class="mt-1 d-flex align-center">
                                    <v-chip size="x-small" label class="mr-2" color="blue-grey-lighten-4" variant="flat">{{ getProjectName(task.projectId) }}</v-chip>
                                    <span class="text-caption text-grey" v-if="task.deadline">Hạn: {{ new Date(task.deadline).toLocaleDateString('vi-VN') }}</span>
                                </v-list-item-subtitle>

                                <template v-slot:append>
                                    <v-chip size="small" :color="getStatusColor(task.status)" variant="tonal" class="font-weight-bold">
                                        {{ getStatusDisplay(task.status) }}
                                    </v-chip>
                                </template>
                            </v-list-item>
                        </template>
                        <div v-else class="text-center py-8 text-grey">
                            <v-icon size="48" class="mb-2 text-grey-lighten-2">mdi-coffee-outline</v-icon>
                            <div>Tuyệt vời! Bạn không có công việc tồn đọng.</div>
                        </div>
                    </v-list>
                </v-card>
            </v-col>

            <!-- Cột phải: Dự án của tôi -->
            <v-col cols="12" md="4">
                <v-card elevation="2" class="rounded-lg h-100">
                    <v-card-title class="py-4 px-5 font-weight-bold">Dự án của tôi</v-card-title>
                    <v-divider></v-divider>
                    <v-list class="py-2">
                        <v-list-item v-for="proj in (myProjects || []).slice(0, 5)" :key="proj.id" :to="{ name: 'MyProjectDetail', params: { id: proj.id } }" class="mb-1">
                            <template v-slot:prepend>
                                <v-avatar color="primary" variant="tonal" size="36" class="mr-3 rounded">
                                    <span class="font-weight-bold">{{ proj.name.charAt(0).toUpperCase() }}</span>
                                </v-avatar>
                            </template>
                            <v-list-item-title class="font-weight-medium">{{ proj.name }}</v-list-item-title>
                            <v-list-item-subtitle class="text-caption">{{ proj.status }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item v-if="!myProjects || myProjects.length === 0">
                            <v-list-item-title class="text-grey text-center text-body-2">Chưa tham gia dự án nào</v-list-item-title>
                        </v-list-item>
                    </v-list>
                    <div class="px-4 pb-4" v-if="myProjects && myProjects.length > 0">
                        <v-btn block variant="tonal" color="primary" to="/member/my-projects">Xem tất cả dự án</v-btn>
                    </div>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTaskStore } from '@/stores/task'
import { useProjectStore } from '@/stores/project'

const authStore = useAuthStore()
const taskStore = useTaskStore()
const projectStore = useProjectStore()

const myPendingTasks = computed(() => {
    const uid = authStore.user?.id
    const tasks = taskStore.tasks || []
    return tasks.filter(t => t.assigneeId === uid && t.status !== 'DONE' && t.status !== 'CANCELLED')
})

const myCompletedTasksCount = computed(() => {
    const uid = authStore.user?.id
    const tasks = taskStore.tasks || []
    return tasks.filter(t => t.assigneeId === uid && t.status === 'DONE').length
})

const myProjects = computed(() => {
    const userId = authStore.user?.id;
    if (!userId) return [];
    // Logic giống MyProjectList.vue: Lọc thủ công từ danh sách projects
    // Ưu tiên projectStore.projects (được tải từ fetchAll)
    const source = (projectStore.projects && projectStore.projects.length) ? projectStore.projects : (projectStore.allSystemProjects || []);
    return source.filter(p => {
        const isOwner = p.ownerId == userId;
        const isMember = p.memberIds?.some(id => id == userId);
        return isOwner || isMember;
    });
})

const getPriorityColor = (p) => p === 'HIGH' ? 'red' : p === 'MEDIUM' ? 'orange' : 'green'
const getStatusColor = (s) => s === 'IN_PROGRESS' ? 'blue' : 'grey'
const getStatusDisplay = (s) => s === 'TO_DO' ? 'Cần làm' : s === 'IN_PROGRESS' ? 'Đang làm' : s

const getProjectName = (pid) => {
    // Tìm trong cả 2 danh sách (projects và allSystemProjects) để đảm bảo thấy tên dự án
    const all = [...(projectStore.allSystemProjects || []), ...(projectStore.projects || [])]
    const p = all.find(x => x.id == pid)
    return p ? p.name : 'Dự án hệ thống'
}

onMounted(async () => {
    // Gọi projectStore.fetchAll() tương tự như trang MyProjectList.vue để lấy dữ liệu
    await Promise.all([
        taskStore.fetchAll(), 
        projectStore.fetchAll(), 
        projectStore.fetchAllSystem().catch(() => {}) // Catch lỗi nếu Member không có quyền gọi API system
    ])
})
</script>

<style scoped>
.border-left-primary { border-left: 5px solid rgb(var(--v-theme-primary)); }
.border-left-warning { border-left: 5px solid #F57C00; }
.border-left-success { border-left: 5px solid #4CAF50; }
</style>