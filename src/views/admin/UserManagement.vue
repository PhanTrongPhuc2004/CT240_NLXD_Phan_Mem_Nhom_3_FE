<!-- src/views/admin/UserManagement.vue -->
<template>
    <v-container fluid class="py-8">
        <!-- Header -->
        <v-row class="align-center mb-6" no-gutters>
            <v-col cols="12" md="6">
                <h4 class="text-h5 font-weight-bold primary--text mb-0">Quản lý người dùng</h4>
                <p class="text-caption text-grey mt-1">Quản lý toàn bộ tài khoản trong hệ thống (chỉ dành cho Admin)</p>
            </v-col>

            <v-col cols="12" md="6" class="text-right">
                <div class="d-flex align-center justify-end gap-3 flex-wrap">
                    <v-text-field v-model="searchQuery" label="Tìm kiếm tên, email..." prepend-inner-icon="mdi-magnify"
                        variant="outlined" density="compact" hide-details class="search-field" @input="filterUsers" />

                    <v-select v-model="selectedRole" :items="roleFilterItems" label="Lọc theo vai trò"
                        variant="outlined" density="compact" hide-details class="role-filter"
                        @update:model-value="filterUsers" />

                    <v-btn color="primary" prepend-icon="mdi-plus" elevation="2" @click="openAddUserDialog">
                        Thêm người dùng
                    </v-btn>
                </div>
            </v-col>
        </v-row>

        <!-- Bảng dữ liệu (đã xóa cột Tên đăng nhập) -->
        <v-card elevation="2" class="rounded-lg overflow-hidden">
            <v-data-table :headers="headers" :items="filteredUsers" :loading="loading"
                loading-text="Đang tải danh sách người dùng..." no-data-text="Không tìm thấy người dùng nào"
                :items-per-page="10"
                :footer-props="{ itemsPerPageOptions: [5, 10, 20, 50, -1], itemsPerPageText: 'Hiển thị:' }"
                class="elevation-0">
                <template v-slot:item.fullName="{ item }">
                    <div class="d-flex align-center">
                        <v-avatar size="36" class="mr-3">
                            <v-img v-if="item.avatarUrl" :src="item.avatarUrl" alt="Avatar" />
                            <span v-else class="white--text font-weight-bold">
                                {{ getInitials(item.fullName || item.username) }}
                            </span>
                        </v-avatar>
                        <div>
                            <div class="font-weight-medium">{{ item.fullName || 'Chưa đặt tên' }}</div>
                            <div class="text-caption grey--text">{{ item.username }}</div>
                        </div>
                    </div>
                </template>

                <template v-slot:item.email="{ item }">
                    <span class="text-caption">{{ item.email }}</span>
                </template>

                <template v-slot:item.role="{ item }">
                    <v-chip :color="getRoleColor(item.role)" size="small" label>
                        {{ getRoleDisplay(item.role) }}
                    </v-chip>
                </template>

                <template v-slot:item.active="{ item }">
                    <v-chip :color="item.active ? 'success' : 'error'" size="small" label>
                        {{ item.active ? 'Hoạt động' : 'Đã khóa' }}
                    </v-chip>
                </template>

                <template v-slot:item.actions="{ item }">
                    <v-btn icon size="small" color="primary" variant="text" :ripple="false"
                        @click="openEditUserDialog(item)">
                        <v-icon size="small">mdi-pencil</v-icon>
                    </v-btn>

                    <v-btn icon size="small" color="error" variant="text" :ripple="false"
                        @click="confirmDeleteUser(item)">
                        <v-icon size="small">mdi-delete</v-icon>
                    </v-btn>
                </template>
            </v-data-table>
        </v-card>

        <!-- Dialog Thêm / Sửa -->
        <v-dialog v-model="dialog" max-width="600px" persistent>
            <v-card>
                <v-card-title class="text-h6 primary white--text">
                    {{ dialogMode === 'add' ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng' }}
                </v-card-title>

                <v-card-text class="pt-6">
                    <v-form ref="userFormRef">
                        <v-text-field v-model="form.username" label="Tên đăng nhập" prepend-icon="mdi-account"
                            :rules="[rules.required, rules.username]" outlined density="compact"
                            :disabled="dialogMode === 'edit'" />

                        <v-text-field v-model="form.email" label="Email" prepend-icon="mdi-email"
                            :rules="[rules.required, rules.email]" outlined density="compact" />

                        <v-text-field v-model="form.fullName" label="Họ và tên" prepend-icon="mdi-account-details"
                            :rules="[rules.required]" outlined density="compact" />

                        <v-text-field v-if="dialogMode === 'add'" v-model="form.password" label="Mật khẩu"
                            type="password" prepend-icon="mdi-lock" :rules="[rules.required, rules.password]" outlined
                            density="compact" />

                        <v-select v-model="form.role" :items="roleSelectItems" label="Vai trò"
                            prepend-icon="mdi-shield-account" :rules="[rules.required]" outlined density="compact"
                            :disabled="dialogMode === 'add'" />

                        <v-switch v-model="form.active" label="Trạng thái hoạt động" color="success" inset />
                    </v-form>
                </v-card-text>

                <v-card-actions class="pb-6 px-6">
                    <v-spacer />
                    <v-btn color="grey" text @click="closeDialog">Hủy</v-btn>
                    <v-btn color="primary" :loading="saving" @click="saveUser">
                        {{ dialogMode === 'add' ? 'Thêm mới' : 'Cập nhật' }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Dialog Xác nhận xóa -->
        <v-dialog v-model="deleteDialog" max-width="450px">
            <v-card>
                <v-card-title class="text-h6 error white--text">Xác nhận xóa người dùng</v-card-title>
                <v-card-text class="pt-6">
                    Bạn có chắc chắn muốn xóa người dùng <strong>{{ userToDelete?.fullName || userToDelete?.username
                        }}</strong>?<br>
                    Hành động này <strong>không thể hoàn tác</strong>.
                </v-card-text>
                <v-card-actions class="pb-6 px-6">
                    <v-spacer />
                    <v-btn color="grey" text @click="deleteDialog = false">Hủy</v-btn>
                    <v-btn color="error" :loading="deleting" @click="deleteUserConfirm">Xóa</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { userApi } from '@/api/userApi'

const router = useRouter()
const authStore = useAuthStore()

if (authStore.user?.role !== 'ADMIN') {
    router.push('/403')
}

// ==================== DATA ====================
const users = ref([])
const filteredUsers = ref([])
const searchQuery = ref('')
const selectedRole = ref('Tất cả vai trò')
const loading = ref(false)
const dialog = ref(false)
const deleteDialog = ref(false)
const dialogMode = ref('add')
const userToDelete = ref(null)
const saving = ref(false)
const deleting = ref(false)

const form = ref({
    id: null,
    username: '',
    email: '',
    fullName: '',
    password: '',
    role: 'Thành viên',
    active: true
})

const userFormRef = ref(null)

const rules = {
    required: v => !!v || 'Trường này là bắt buộc',
    username: v => (v && v.length >= 3) || 'Tên đăng nhập phải từ 3 ký tự trở lên',
    email: v => /.+@.+\..+/.test(v) || 'Email không hợp lệ',
    password: v => (dialogMode.value === 'edit' || (v && v.length >= 6)) || 'Mật khẩu phải từ 6 ký tự trở lên'
}

const headers = [
    { title: 'Họ và tên', key: 'fullName', sortable: true },
    { title: 'Email', key: 'email', sortable: true },
    { title: 'Vai trò', key: 'role', sortable: true },
    { title: 'Trạng thái', key: 'active', sortable: true },
    { title: 'Thao tác', key: 'actions', sortable: false, align: 'end' }
]

const roleFilterItems = ['Tất cả vai trò', 'Quản trị viên', 'Quản lý', 'Thành viên']
const roleSelectItems = ['Quản trị viên', 'Quản lý', 'Thành viên']

// ==================== FUNCTIONS ====================
const fetchUsers = async () => {
    loading.value = true
    try {
        const res = await userApi.getAllUsers()
        users.value = res.data || []
        filteredUsers.value = [...users.value]
    } catch (err) {
        console.error('Lỗi tải danh sách user:', err)
    } finally {
        loading.value = false
    }
}

const filterUsers = () => {
    let temp = [...users.value]
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim()
        temp = temp.filter(u =>
        (u.fullName?.toLowerCase().includes(q) ||
            u.username?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q))
        )
    }
    if (selectedRole.value !== 'Tất cả vai trò') {
        const map = { 'Quản trị viên': 'ADMIN', 'Quản lý': 'MANAGER', 'Thành viên': 'MEMBER' }
        temp = temp.filter(u => u.role === map[selectedRole.value])
    }
    filteredUsers.value = temp
}

const openAddUserDialog = () => {
    dialogMode.value = 'add'
    form.value = { id: null, username: '', email: '', fullName: '', password: '', role: 'Thành viên', active: true }
    dialog.value = true
}

const openEditUserDialog = (user) => {
    dialogMode.value = 'edit'
    form.value = {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName || '',
        password: '',
        role: getRoleDisplay(user.role),
        active: user.active
    }
    dialog.value = true
}

const closeDialog = () => {
    dialog.value = false
    if (userFormRef.value) userFormRef.value.resetValidation()
}

const saveUser = async () => {
    const { valid } = await userFormRef.value.validate()
    if (!valid) return

    saving.value = true
    try {
        const roleMap = { 'Quản trị viên': 'ADMIN', 'Quản lý': 'MANAGER', 'Thành viên': 'MEMBER' }

        if (dialogMode.value === 'add') {
            await userApi.createUser({
                username: form.value.username,
                email: form.value.email,
                password: form.value.password,
                fullName: form.value.fullName
            })
        } else {
            await userApi.updateUser(form.value.id, {
                fullName: form.value.fullName,
                active: form.value.active
            })
            await userApi.updateRole(form.value.id, roleMap[form.value.role])
        }

        await fetchUsers()
        filterUsers()
        closeDialog()
    } catch (err) {
        console.error('Lỗi lưu user:', err)
        alert('Có lỗi: ' + (err.response?.data?.message || err.message))
    } finally {
        saving.value = false
    }
}

const confirmDeleteUser = (user) => {
    userToDelete.value = user
    deleteDialog.value = true
}

const deleteUserConfirm = async () => {
    if (!userToDelete.value) return
    deleting.value = true
    try {
        await userApi.deleteUser(userToDelete.value.id)
        await fetchUsers()
        filterUsers()
        deleteDialog.value = false
    } catch (err) {
        console.error('Lỗi xóa user:', err)
    } finally {
        deleting.value = false
    }
}

const getRoleColor = (role) => role === 'ADMIN' ? 'error' : role === 'MANAGER' ? 'warning' : 'success'
const getRoleDisplay = (role) => role === 'ADMIN' ? 'Quản trị viên' : role === 'MANAGER' ? 'Quản lý' : 'Thành viên'
const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'

onMounted(() => {
    fetchUsers()
})
</script>

<style scoped>
.search-field {
    max-width: 300px;
}

.role-filter {
    max-width: 200px;
}

.v-data-table .v-data-table-header th {
    color: #000000 !important;
    font-weight: 600 !important;
    background-color: #f8f9fa;
}

.v-list-item--active {
    background-color: #1976d2 !important;
}

.v-list-item--active .v-list-item__title,
.v-list-item--active .v-icon {
    color: #ffffff !important;
}

.v-divider {
    border-color: #e0e0e0 !important;
}
</style>