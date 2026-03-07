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
                        <template v-slot:activator="{ props }">
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
                                            <v-text-field v-model="editedItem.title" label="Tiêu đề công việc" required></v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-textarea v-model="editedItem.description" label="Mô tả" rows="3"></v-textarea>
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                            <v-autocomplete
                                                v-model="editedItem.projectId"
                                                :items="projects"
                                                item-title="name"
                                                item-value="id"
                                                label="Chọn Dự án"
                                                clearable
                                            ></v-autocomplete>
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                            <v-autocomplete
                                                v-model="editedItem.assigneeId"
                                                :items="users"
                                                item-title="fullName"
                                                item-value="id"
                                                label="Giao cho (Người thực hiện)"
                                                clearable
                                            ></v-autocomplete>
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                            <v-select
                                                v-model="editedItem.priority"
                                                :items="['LOW', 'MEDIUM', 'HIGH']"
                                                label="Độ ưu tiên"
                                            ></v-select>
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                            <v-select
                                                v-model="editedItem.status"
                                                :items="['TO_DO', 'IN_PROGRESS', 'DONE', 'CANCELLED']"
                                                label="Trạng thái"
                                            ></v-select>
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                            <v-text-field v-model="editedItem.deadline" label="Hạn chót (Deadline)" type="datetime-local"></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-card-text>

                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue-darken-1" variant="text" @click="close">Hủy</v-btn>
                                <v-btn color="blue-darken-1" variant="text" @click="save">Lưu</v-btn>
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
                <a href="#" @click.prevent="goDetail(item)" class="text-decoration-none font-weight-bold text-primary">
                    {{ item.title }}
                </a>
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
                <v-icon size="small" class="me-2" @click="editItem(item)">mdi-pencil</v-icon>
                <v-icon size="small" @click="deleteItem(item)">mdi-delete</v-icon>
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

const taskStore = useTaskStore()
const tasks = computed(() => taskStore.tasks)
const loading = computed(() => taskStore.loading)

const projectStore = useProjectStore()
const projects = computed(() => projectStore.projects)

const userStore = useUserStore()
const users = computed(() => userStore.users)

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
    { title: 'Hành động', key: 'actions', sortable: false },
]

const editedIndex = ref(-1)
const defaultItem = { id: '', title: '', description: '', projectId: '', assigneeId: '', priority: 'MEDIUM', status: 'TO_DO', deadline: null }
const editedItem = ref({ ...defaultItem })

const formTitle = computed(() => editedIndex.value === -1 ? 'Thêm công việc mới' : 'Chỉnh sửa công việc')

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
    router.push(`/tasks/${realItem.id}`)
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
    // Clone dữ liệu để xử lý trước khi gửi
    const payload = { ...editedItem.value }

    // Xử lý dữ liệu rỗng và định dạng ngày tháng
    if (editedIndex.value === -1) delete payload.id // Xóa ID rỗng khi tạo mới
    if (!payload.projectId) payload.projectId = null
    if (!payload.assigneeId) payload.assigneeId = null
    
    // Thêm giây vào deadline nếu thiếu (do input datetime-local chỉ trả về HH:mm)
    if (payload.deadline && payload.deadline.length === 16) {
        payload.deadline += ':00'
    }

    try {
        if (editedIndex.value > -1) { // --- LOGIC CẬP NHẬT ---
            const originalTask = tasks.value[editedIndex.value];

            // 1. Luôn gọi API update cho các thông tin chung (Backend sẽ bỏ qua status)
            await taskStore.update(payload.id, payload);

            // 2. Nếu trạng thái có thay đổi, gọi API chuyên dụng để cập nhật trạng thái
            if (originalTask.status !== payload.status) {
                await taskStore.updateStatus(payload.id, payload.status, null);
            }
        } else { // --- LOGIC TẠO MỚI ---
            await taskStore.create(payload);
        }
        close();
    } catch (error) {
        console.error('Lỗi khi lưu công việc:', error);
        alert('Lưu thất bại: ' + (error.response?.data?.message || 'Dữ liệu không hợp lệ'));
    }
}

onMounted(() => {
    taskStore.fetchAll();
    projectStore.fetchAll();
    userStore.fetchAll();
});
</script>