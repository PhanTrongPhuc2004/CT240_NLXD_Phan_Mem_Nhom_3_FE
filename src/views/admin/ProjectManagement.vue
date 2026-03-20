<!-- src/views/admin/ProjectManagement.vue - ĐÃ SỬA: Gọi đúng endpoint /users để lấy danh sách user, không dùng axios trực tiếp -->
<template>
  <v-container class="py-10">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center">
          <h1 class="text-h4 font-weight-bold">Quản lý Dự án Toàn hệ thống</h1>
          <v-spacer></v-spacer>
          <v-btn v-if="canCreate" color="primary" @click="goToCreateProject">Tạo dự án mới</v-btn>
        </div>
        <p class="mt-2 text-grey">Xem và quản lý tất cả các dự án đang hoạt động trong hệ thống.</p>
      </v-col>
    </v-row>

    <v-card class="mt-8" variant="flat" border>
      <!-- Bảng dữ liệu để hiển thị -->
      <v-data-table :headers="headers" :items="projectStore.allSystemProjects" :loading="projectStore.loading"
        loading-text="Đang tải dữ liệu..." no-data-text="Không có dự án nào trong hệ thống."
        items-per-page-text="Số dự án mỗi trang">
        <!-- Tùy chỉnh cột Tên dự án -->
        <template v-slot:item.name="{ item }">
          <div class="font-weight-bold">{{ item.name }}</div>
        </template>

        <!-- Tùy chỉnh cột Chủ sở hữu (Hiển thị Tên thay vì ID) -->
        <template v-slot:item.ownerId="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="24" color="primary" class="me-2">
              <span class="text-caption text-white">{{ getInitials(getUserName(item.ownerId)) }}</span>
            </v-avatar>
            {{ getUserName(item.ownerId) }}
          </div>
        </template>

        <!-- Tùy chỉnh cột Trạng thái -->
        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small" label>{{ item.status }}</v-chip>
        </template>

        <!-- Tùy chỉnh cột Ngày tạo -->
        <template v-slot:item.createdAt="{ item }">
          {{ new Date(item.createdAt).toLocaleDateString('vi-VN') }}
        </template>

        <!-- Cột Hành động -->
        <template v-slot:item.actions="{ item }">
          <v-icon small class="me-2" @click="viewProject(item)">mdi-eye</v-icon>
          <v-icon small class="me-2" @click="editProject(item)">mdi-pencil</v-icon>
          <v-icon small color="error" @click="confirmDelete(item)" v-if="canDeleteProject(item)">mdi-delete</v-icon>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog xác nhận xóa -->
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Bạn có chắc chắn muốn xóa dự án này?</v-card-title>
        <v-card-text>Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến dự án sẽ bị xóa vĩnh
          viễn.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Hủy</v-btn>
          <v-btn color="red-darken-1" variant="text" @click="deleteProjectConfirm">Xóa</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user'; // SỬA: Dùng store thay vì gọi api trực tiếp
import Swal from 'sweetalert2';

const router = useRouter();
const projectStore = useProjectStore();
const authStore = useAuthStore();
const userStore = useUserStore();

// Định nghĩa các cột cho bảng
const headers = [
  { title: 'Tên dự án', key: 'name', sortable: true },
  { title: 'Chủ sở hữu', key: 'ownerId', sortable: true },
  { title: 'Trạng thái', key: 'status', sortable: true },
  { title: 'Ngày tạo', key: 'createdAt', sortable: true },
  { title: 'Hành động', key: 'actions', sortable: false, align: 'end' },
];

const canCreate = computed(() => authStore.userRole === 'ADMIN');

const canDeleteProject = (item) => {
  // Chỉ Admin mới có quyền xóa dự án từ trang quản lý
  return authStore.userRole === 'ADMIN';
};

// Dialog xác nhận xóa
const dialogDelete = ref(false);
const projectToDelete = ref(null);

// Gọi API để lấy dữ liệu khi component được mount
onMounted(async () => {
  // Gọi song song nhưng catch lỗi r  iêng để tránh crash toàn bộ nếu 1 API lỗi (đặc biệt là lỗi 500 từ users)
  const p1 = projectStore.fetchAllSystem().catch(err => console.error("Lỗi tải dự án:", err));
  const p2 = userStore.fetchAll().catch(err => console.error("Lỗi tải users (có thể do Backend):", err));
  await Promise.all([p1, p2]);
});

// Hàm helper để lấy tên từ ID
const getUserName = (userId) => {
  const user = userStore.users.find(u => u.id === userId);
  return user ? (user.fullName || user.username) : userId;
};

const getInitials = (name) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase();
};

const getStatusColor = (status) => {
  if (status === 'ACTIVE') return 'green';
  if (status === 'INACTIVE') return 'orange';
  if (status === 'COMPLETED') return 'blue';
  return 'grey';
};

const goToCreateProject = () => {
  router.push('/admin/projects/create');
};

const viewProject = (item) => {
  router.push(`/admin/projects/${item.id}`);
};

const editProject = (item) => {
  // Chuyển đến trang chi tiết và mở tab settings
  router.push(`/admin/projects/${item.id}?tab=settings`);
};

const confirmDelete = (item) => {
  projectToDelete.value = item;
  dialogDelete.value = true;
};

const closeDelete = () => {
  dialogDelete.value = false;
  projectToDelete.value = null;
};

const deleteProjectConfirm = async () => {
  if (projectToDelete.value) {
    try {
      await projectStore.delete(projectToDelete.value.id);
      closeDelete(); // Chỉ đóng dialog khi xóa thành công
    } catch (error) {
      Swal.fire('Lỗi', "Lỗi khi xóa dự án: " + (error.response?.data?.message || error.message || "Bạn không có quyền xóa dự án này."), 'error');
    }
  }
};
</script>