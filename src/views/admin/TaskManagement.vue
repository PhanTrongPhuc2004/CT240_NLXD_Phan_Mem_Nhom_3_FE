<template>
    <v-container>
        <v-data-table
            :headers="headers"
            :items="tasks"
            :loading="loading"
            class="elevation-1"
        >
            <template v-slot:top>
                <v-toolbar flat>
                    <v-toolbar-title>Quản lý Công việc (Tasks)</v-toolbar-title>
                    <v-divider class="mx-4" inset vertical></v-divider>
                    <v-spacer></v-spacer>
                    <v-dialog v-model="dialog" max-width="700px">
                        <template v-slot:activator="{ props }" v-if="canManageTasks">
                            <v-btn color="primary" dark class="mb-2" v-bind="props">
                                Thêm công việc
                            </v-btn>
                        </template>
                        <v-card>
                            <v-card-title>
                                <span class="text-h5">{{ formTitle }}</span>
                            </v-card-title>

                            <v-card-text>
                                <v-container>
                                    <v-row>
                                        <v-col cols="12">
                                            <v-text-field v-model="editedItem.title" label="Tiêu đề công việc" required :readonly="!canManageTasks"></v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-textarea v-model="editedItem.description" label="Mô tả" rows="3" :readonly="!canManageTasks"></v-textarea>
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                            <v-autocomplete
                                                v-model="editedItem.projectId"
                                                :items="projects"
                                                item-title="name"
                                                item-value="id"
                                                label="Chọn Dự án"
                                                clearable
                                                :readonly="!canManageTasks"
                                                @update:model-value="onProjectChange"
                                            ></v-autocomplete>
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                            <v-autocomplete
                                                v-model="editedItem.assigneeId"
                                                :items="projectUsers"
                                                item-title="fullName"
                                                item-value="id"
                                                label="Giao cho (Người thực hiện)"
                                                :hint="!editedItem.projectId ? 'Vui lòng chọn dự án trước' : ''"
                                                persistent-hint
                                                clearable
                                                :readonly="!canManageTasks"
                                            ></v-autocomplete>
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                            <v-select
                                                v-model="editedItem.priority"
                                                :items="['LOW', 'MEDIUM', 'HIGH']"
                                                label="Độ ưu tiên"
                                                :readonly="!canManageTasks"
                                            ></v-select>
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                            <v-select
                                                v-model="editedItem.status"
                                                :items="['TO_DO', 'IN_PROGRESS', 'DONE', 'CANCELLED']"
                                                label="Trạng thái"
                                                :disabled="!canManageTasks"
                                            ></v-select>
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                            <v-text-field v-model="editedItem.deadline" label="Hạn chót (Deadline)" type="datetime-local" :readonly="!canManageTasks"></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-card-text>

                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue-darken-1" variant="text" @click="close">{{ canManageTasks ? 'Hủy' : 'Đóng' }}</v-btn>
                                <v-btn v-if="canManageTasks" color="blue-darken-1" variant="text" @click="save">Lưu</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <v-dialog v-model="dialogDelete" max-width="500px">
                        <v-card>
                            <v-card-title class="text-h5">Bạn có chắc muốn xóa?</v-card-title>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Hủy</v-btn>
                                <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm">Xóa</v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-toolbar>
            </template>
            
            <!-- Custom hiển thị Tiêu đề (Click để xem chi tiết) -->
            <template v-slot:item.title="{ item }">
                {{ item.title }}
            </template>

            <!-- Custom hiển thị Tên Dự án -->
            <template v-slot:item.projectId="{ item }">
                {{ getProjectName(item.projectId) }}
            </template>

            <!-- Custom hiển thị Tên Người thực hiện -->
            <template v-slot:item.assigneeId="{ item }">
                {{ getAssigneeName(item.assigneeId) }}
            </template>

            <!-- Custom hiển thị Status -->
            <template v-slot:item.status="{ item }">
                <v-chip :color="getStatusColor(item.status)" size="small">
                    {{ item.status }}
                </v-chip>
            </template>

            <!-- Custom hiển thị Priority -->
            <template v-slot:item.priority="{ item }">
                <v-chip :color="getPriorityColor(item.priority)" size="small" variant="outlined">
                    {{ item.priority }}
                </v-chip>
            </template>

            <template v-slot:item.actions="{ item }">
                <v-icon size="small" @click="goDetail(item)">mdi-eye</v-icon>
            </template>
        </v-data-table>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/task'
import { useProjectStore } from '@/stores/project'
import { useUserStore } from '@/stores/user'
import { projectApi } from '@/api/projectApi'
import { useAuthStore } from '@/stores/auth'

const taskStore = useTaskStore()
// SỬA: Dùng allSystemTasks để hiển thị tất cả công việc trong hệ thống
// trên trang quản trị này, bất kể người dùng đăng nhập là ai.
const tasks = computed(() => taskStore.tasks)
const loading = computed(() => taskStore.loading)

const projectStore = useProjectStore()
// SỬA: Dùng allSystemProjects để có đủ dữ liệu map ID -> Tên cho tất cả task,
// bất kể user đăng nhập là ai. Trang này là trang admin nên cần thấy hết.
const projects = computed(() => projectStore.allSystemProjects)

const userStore = useUserStore()
const users = computed(() => userStore.users)

const authStore = useAuthStore()
// Admin chỉ có quyền xem, không có quyền tạo/sửa/xóa task từ trang quản trị này.
const canManageTasks = computed(() => authStore.userRole === 'MANAGER')

const router = useRouter()

const dialog = ref(false)
const dialogDelete = ref(false)
const headers = [
    { title: 'Tiêu đề', key: 'title' },
    { title: 'Dự án', key: 'projectId' },
    { title: 'Người thực hiện', key: 'assigneeId' },
    { title: 'Ưu tiên', key: 'priority' },
    { title: 'Trạng thái', key: 'status' },
    { title: 'Hạn chót', key: 'deadline' },
    { title: 'Hành động', key: 'actions', sortable: false, align: 'end' },
]

const editedIndex = ref(-1)
const defaultItem = { id: '', title: '', description: '', projectId: '', assigneeId: '', priority: 'MEDIUM', status: 'TO_DO', deadline: null }
const editedItem = ref({ ...defaultItem })

// Computed: Lọc danh sách user chỉ hiển thị những người thuộc Project đã chọn
const projectUsers = computed(() => {
    if (!editedItem.value.projectId) return []
    
    // Manager (và Admin ở chế độ xem) thấy tất cả user
    if (['ADMIN', 'MANAGER'].includes(authStore.userRole)) {
        return users.value
    }

    // Role khác chỉ thấy thành viên dự án
    const project = projects.value.find(p => p.id === editedItem.value.projectId)
    if (!project) return []
    const memberIds = [project.ownerId, ...(project.managerIds || []), ...(project.memberIds || [])]
    return users.value.filter(u => memberIds.includes(u.id))
})

const formTitle = computed(() => {
  if (editedIndex.value === -1) return 'Thêm công việc mới'
  // Nếu có quyền quản lý thì là "Chỉnh sửa", không thì là "Chi tiết"
  return canManageTasks.value ? 'Chỉnh sửa công việc' : 'Chi tiết công việc'
})

// Hàm helper để lấy tên từ ID
const getProjectName = (id) => {
    const project = projects.value.find(p => p.id === id)
    return project ? project.name : id // Nếu không tìm thấy thì hiện ID
}
const getAssigneeName = (id) => {
    const user = users.value.find(u => u.id === id)
    return user ? user.fullName : (id || 'Chưa giao')
}

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

function goDetail(item) {
    const realItem = item.raw || item
    router.push(`/admin/tasks/${realItem.id}`)
}

// Khi đổi dự án, reset người được giao việc nếu người đó không thuộc dự án mới
function onProjectChange() {
    editedItem.value.assigneeId = null
}

function editItem(item) {
    const realItem = item.raw || item
    editedIndex.value = tasks.value.findIndex(t => t.id === realItem.id)
    editedItem.value = Object.assign({}, realItem)
    dialog.value = true
}

function deleteItem(item) {
    const realItem = item.raw || item
    editedIndex.value = tasks.value.findIndex(t => t.id === realItem.id)
    editedItem.value = Object.assign({}, realItem)
    dialogDelete.value = true
}

async function deleteItemConfirm() {
    await taskStore.delete(editedItem.value.id)
    closeDelete()
}

function close() {
    dialog.value = false
    nextTick(() => {
        editedItem.value = Object.assign({}, defaultItem)
        editedIndex.value = -1
    })
}

function closeDelete() {
    dialogDelete.value = false
    nextTick(() => {
        editedItem.value = Object.assign({}, defaultItem)
        editedIndex.value = -1
    })
}

async function save() {
    const payload = { ...editedItem.value }

    // 1. Validate
    if (!canManageTasks.value) return alert('Bạn không có quyền thực hiện hành động này.')
    if (!payload.title?.trim()) return alert('Vui lòng nhập tiêu đề công việc')
    if (!payload.projectId) return alert('Vui lòng chọn dự án')

    // 2. Format Data
    if (editedIndex.value === -1) delete payload.id
    payload.description = payload.description || null
    payload.assigneeId = payload.assigneeId || null
    payload.deadline = payload.deadline ? (payload.deadline.length === 16 ? payload.deadline + ':00' : payload.deadline) : null

    // 3. Auto-add Member (Admin/Manager only)
    if (canManageTasks.value && payload.projectId && payload.assigneeId) {
        const project = projects.value.find(p => p.id === payload.projectId)
        if (project) {
            const members = [project.ownerId, ...(project.managerIds || []), ...(project.memberIds || [])]
            if (!members.includes(payload.assigneeId)) {
                try {
                    await projectApi.assignMember(payload.projectId, { userId: payload.assigneeId })
                    await projectStore.fetchAllSystem()
                } catch (err) {
                    return alert('Lỗi thêm thành viên vào dự án: ' + (err.response?.data || err.message))
                }
            }
        }
    }

    // 4. Create/Update Task
    try {
        if (editedIndex.value > -1) {
            await taskStore.update(payload.id, payload)
            const original = tasks.value[editedIndex.value]
            if (original.status !== payload.status) {
                await taskStore.updateStatus(payload.id, payload.status, null)
            }
        } else {
            await taskStore.create(payload)
        }
        close()
    } catch (error) {
        console.error('Save task error:', error)
        const msg = error.response?.status === 403 
            ? 'Bạn không có quyền thực hiện hành động này.' 
            : (error.response?.data?.message || error.response?.data || 'Lỗi lưu dữ liệu')
        alert('Lưu thất bại: ' + msg)
    }
}

onMounted(async () => {
    // Sử dụng Promise.all và catch lỗi riêng lẻ để trang không bị crash nếu một API lỗi
    await Promise.all([
        taskStore.fetchAll().catch(err => console.error("Lỗi tải tasks:", err)),
        projectStore.fetchAllSystem().catch(err => console.error("Lỗi tải projects:", err)),
        userStore.fetchAll().catch(err => console.error("Lỗi tải users (Backend 500):", err))
    ]);
});
</script>