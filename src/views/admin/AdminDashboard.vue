<template>
    <v-container fluid class="py-6">
        <div class="mb-6">
            <h2 class="text-h4 font-weight-bold mb-1">Tổng quan hệ thống</h2>
            <p class="text-grey">Chào mừng trở lại, {{ authStore.user?.fullName || 'Admin' }}!</p>
        </div>

        <!-- Thẻ thống kê (Stats Cards) -->
        <v-row>
            <v-col cols="12" sm="6" md="3">
                <v-card elevation="2" class="rounded-lg pa-4 h-100 d-flex align-center bg-blue-lighten-5">
                    <v-avatar color="primary" size="50" class="mr-4 rounded-lg">
                        <v-icon color="white" size="30">mdi-account-group</v-icon>
                    </v-avatar>
                    <div>
                        <div class="text-h5 font-weight-bold text-primary">{{ userStore.users.length }}</div>
                        <div class="text-caption font-weight-bold text-grey-darken-1">Tổng người dùng</div>
                    </div>
                </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="3">
                <v-card elevation="2" class="rounded-lg pa-4 h-100 d-flex align-center bg-teal-lighten-5">
                    <v-avatar color="teal" size="50" class="mr-4 rounded-lg">
                        <v-icon color="white" size="30">mdi-folder-multiple</v-icon>
                    </v-avatar>
                    <div>
                        <div class="text-h5 font-weight-bold text-teal">{{ projectStore.allSystemProjects.length }}</div>
                        <div class="text-caption font-weight-bold text-grey-darken-1">Dự án hệ thống</div>
                    </div>
                </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="3">
                <v-card elevation="2" class="rounded-lg pa-4 h-100 d-flex align-center bg-orange-lighten-5">
                    <v-avatar color="orange-darken-1" size="50" class="mr-4 rounded-lg">
                        <v-icon color="white" size="30">mdi-clipboard-list</v-icon>
                    </v-avatar>
                    <div>
                        <div class="text-h5 font-weight-bold text-orange-darken-2">{{ taskStore.tasks.length }}</div>
                        <div class="text-caption font-weight-bold text-grey-darken-1">Tổng công việc</div>
                    </div>
                </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="3">
                <v-card elevation="2" class="rounded-lg pa-4 h-100 d-flex align-center bg-red-lighten-5">
                    <v-avatar color="red" size="50" class="mr-4 rounded-lg">
                        <v-icon color="white" size="30">mdi-alert-circle</v-icon>
                    </v-avatar>
                    <div>
                        <div class="text-h5 font-weight-bold text-red">{{ lateTasksCount }}</div>
                        <div class="text-caption font-weight-bold text-grey-darken-1">Công việc quá hạn</div>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <!-- Hàng 2: Biểu đồ đơn giản (Progress bars) & Danh sách dự án mới -->
        <v-row class="mt-4">
            <!-- Cột trái: Thống kê trạng thái -->
            <v-col cols="12" md="4">
                <v-card class="pa-5 h-100" elevation="2" border>
                    <h3 class="text-h6 font-weight-bold mb-4">Trạng thái Dự án</h3>
                    
                    <div class="mb-4">
                        <div class="d-flex justify-space-between text-body-2 mb-1">
                            <span>Đang hoạt động (Active)</span>
                            <span class="font-weight-bold">{{ projectStats.active }}</span>
                        </div>
                        <v-progress-linear :model-value="(projectStats.active / projectStats.total) * 100" color="success" height="8" rounded></v-progress-linear>
                    </div>

                    <div class="mb-4">
                        <div class="d-flex justify-space-between text-body-2 mb-1">
                            <span>Đã hoàn thành (Completed)</span>
                            <span class="font-weight-bold">{{ projectStats.completed }}</span>
                        </div>
                        <v-progress-linear :model-value="(projectStats.completed / projectStats.total) * 100" color="primary" height="8" rounded></v-progress-linear>
                    </div>

                    <div class="mb-4">
                        <div class="d-flex justify-space-between text-body-2 mb-1">
                            <span>Tạm dừng/Khác</span>
                            <span class="font-weight-bold">{{ projectStats.other }}</span>
                        </div>
                        <v-progress-linear :model-value="(projectStats.other / projectStats.total) * 100" color="grey" height="8" rounded></v-progress-linear>
                    </div>
                </v-card>
            </v-col>

            <!-- Cột phải: Dự án mới nhất -->
            <v-col cols="12" md="8">
                <v-card class="h-100" elevation="2" border>
                    <v-card-title class="d-flex align-center py-4 px-5">
                        <span class="text-h6 font-weight-bold">Dự án mới nhất</span>
                        <v-spacer></v-spacer>
                        <v-btn variant="text" size="small" color="primary" to="/admin/projects">Xem tất cả</v-btn>
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-table>
                        <thead>
                            <tr>
                                <th class="text-left font-weight-bold">Tên dự án</th>
                                <th class="text-left font-weight-bold">Chủ sở hữu</th>
                                <th class="text-left font-weight-bold">Ngày tạo</th>
                                <th class="text-center font-weight-bold">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in recentProjects" :key="item.id">
                                <td class="font-weight-medium">{{ item.name }}</td>
                                <td>{{ getUserName(item.ownerId) }}</td>
                                <td>{{ new Date(item.createdAt).toLocaleDateString('vi-VN') }}</td>
                                <td class="text-center">
                                    <v-chip size="x-small" :color="item.status === 'ACTIVE' ? 'success' : 'grey'" label>{{ item.status }}</v-chip>
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'

const authStore = useAuthStore()
const userStore = useUserStore()
const projectStore = useProjectStore()
const taskStore = useTaskStore()

const recentProjects = computed(() => projectStore.allSystemProjects.slice(0, 5))
const lateTasksCount = computed(() => taskStore.tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'DONE').length)

const projectStats = computed(() => {
    const all = projectStore.allSystemProjects
    const total = all.length || 1
    return {
        total,
        active: all.filter(p => p.status === 'ACTIVE').length,
        completed: all.filter(p => p.status === 'COMPLETED').length,
        other: all.filter(p => !['ACTIVE', 'COMPLETED'].includes(p.status)).length
    }
})

const getUserName = (id) => {
    const u = userStore.users.find(x => x.id === id)
    return u ? (u.fullName || u.username) : id
}

onMounted(async () => {
    await Promise.all([
        userStore.fetchAll(),
        projectStore.fetchAllSystem(),
        taskStore.fetchAll()
    ])
})
</script>