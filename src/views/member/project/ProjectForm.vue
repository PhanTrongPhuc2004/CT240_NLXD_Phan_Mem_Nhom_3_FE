<!-- src/views/member/project/ProjectForm.vue - ĐÃ SỬA HOÀN CHỈNH: Bố cục rõ ràng, tab Tổng quan và Thành viên không chồng chéo -->
<template>
  <v-container fluid class="py-10">
    <v-row justify="center">
      <v-col cols="12" xl="10">
        <!-- Header -->
        <div class="d-flex align-center justify-space-between mb-8">
          <h1 class="text-h4 font-weight-bold">Tạo dự án mới</h1>
          <v-btn color="grey-darken-1" variant="text" class="font-weight-bold" rounded="pill" @click="router.back()" :disabled="loading">
            Hủy
          </v-btn>
        </div>

        <!-- Tabs -->
        <v-tabs v-model="activeTab" color="primary" bg-color="transparent" grow class="mb-6">
          <v-tab value="overview">Tổng quan</v-tab>
          <v-tab value="members">Thành viên</v-tab>
        </v-tabs>

        <!-- Nội dung tab -->
        <v-form ref="formRef" @submit.prevent="handleSubmit">
        <v-window v-model="activeTab">
          <!-- Tab Tổng quan -->
          <v-window-item value="overview">
            <v-card flat class="pa-6">
                <v-row>
                  <v-col cols="12">
                    <v-text-field v-model="form.name" label="Tên dự án" placeholder="Ví dụ: Dự án Nền tảng E-commerce"
                      variant="outlined" required :rules="[v => !!v || 'Tên dự án là bắt buộc']"></v-text-field>
                  </v-col>

                  <v-col cols="12">
                    <v-textarea v-model="form.description" label="Mô tả dự án"
                      placeholder="Phát triển một nền tảng thương mại điện tử mạnh mẽ..." variant="outlined"
                      rows="4"></v-textarea>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field v-model="form.startDate" label="Ngày bắt đầu" type="date"
                      variant="outlined"></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field v-model="form.endDate" label="Ngày kết thúc" type="date"
                      variant="outlined" :min="form.startDate"></v-text-field>
                  </v-col>
                </v-row>

                <!-- Nút tạo dự án -->
                <div class="d-flex justify-end mt-8">
                  <v-btn size="large" class="primary-gradient-btn pulse-primary font-weight-bold px-10" rounded="pill" :loading="loading" type="submit">
                    Tạo dự án
                  </v-btn>
                </div>
            </v-card>
          </v-window-item>

          <!-- Tab Thành viên -->
          <v-window-item value="members">
            <v-card flat class="pa-6">
              <v-card-title class="px-0 pt-0 font-weight-bold mb-4">Thêm thành viên vào dự án</v-card-title>
              <v-autocomplete v-model="form.members" :items="availableUsers" item-title="fullName" item-value="id" label="Tìm kiếm thành viên..."
                placeholder="Chọn thành viên từ danh sách"
                variant="outlined" multiple chips closable-chips return-object
                prepend-inner-icon="mdi-account-search"></v-autocomplete>

              <!-- Danh sách thành viên đã thêm (preview) -->
              <v-list v-if="form.members.length > 0" class="mt-6">
                <v-list-item v-for="(member, index) in form.members" :key="index">
                  <template v-slot:prepend>
                    <v-avatar color="primary" size="36">
                      <span class="text-white">{{ getInitials(member.fullName) }}</span>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ member.fullName }}</v-list-item-title>
                  <v-list-item-subtitle>{{ member.email }}</v-list-item-subtitle>
                  <template v-slot:append>
                    <v-btn icon="mdi-delete" variant="text" color="error"
                      @click="form.members.splice(index, 1)"></v-btn>
                  </template>
                </v-list-item>
              </v-list>

              <v-alert v-else type="info" class="mt-6" text="Chưa có thành viên nào. Thêm ngay để bắt đầu!" />

              <!-- Nút tạo dự án ở cuối tab -->
              <div class="d-flex justify-end mt-8">
                <v-btn size="large" class="primary-gradient-btn pulse-primary font-weight-bold px-10" rounded="pill" :loading="loading" @click="handleSubmit">
                  Tạo dự án
                </v-btn>
              </div>
            </v-card>
          </v-window-item>
        </v-window>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import { useAuthStore } from '@/stores/auth';
import api from '@/api/index';
import { projectApi } from '@/api/projectApi';
import Swal from 'sweetalert2';

const router = useRouter();
const projectStore = useProjectStore();
const loading = ref(false);
const activeTab = ref('overview');

const form = ref({
  name: '',
  description: '',
  visibility: 'public',
  startDate: '',
  endDate: '',
  members: []
});

const availableUsers = ref([]);

const authStore = useAuthStore();

onMounted(() => {
  if (authStore.userRole !== 'ADMIN') {
    alert('Bạn không có quyền truy cập trang này. Chỉ Admin mới được tạo dự án.');
    router.push('/projects');
  }
  fetchUsers();
});

const fetchUsers = async () => {
  try {
    const res = await api.get('/users');
    // Lọc bỏ chính mình ra khỏi danh sách (vì mình là Owner rồi)
    availableUsers.value = res.data.filter(u => u.id !== authStore.user?.id);
  } catch (error) {
    console.error("Lỗi tải danh sách user:", error);
  }
};

const getInitials = (name) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase();
};

const formRef = ref(null);


const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();
  
  // SỬA: Nếu form không hợp lệ (ví dụ chưa nhập tên), chuyển về tab Overview để user thấy lỗi
  if (!valid) {
    Swal.fire('Cảnh báo', "Vui lòng nhập đầy đủ thông tin bắt buộc (Tên dự án) ở tab Tổng quan.", 'warning');
    activeTab.value = 'overview';
    return;
  }

  loading.value = true;
  try {
    const payload = {
      name: form.value.name,
      description: form.value.description,
      visibility: form.value.visibility,
      startDate: form.value.startDate ? `${form.value.startDate}T00:00:00` : null,
      endDate: form.value.endDate ? `${form.value.endDate}T23:59:59` : null,
    };

    // 1. Tạo dự án trước
    const newProject = await projectStore.create(payload);
    // Đảm bảo lấy được ID dù backend trả về 'id' hay '_id'
    const newProjectId = newProject.id || newProject._id;

    // 2. Gọi API thêm từng thành viên vào dự án vừa tạo (Workaround lỗi Backend không lưu memberIds)
    if (form.value.members && form.value.members.length > 0 && newProjectId) {
      for (const member of form.value.members) {
        await projectApi.assignMember(newProjectId, { userId: member.id });
      }
    }

    Swal.fire({ title: 'Thành công!', text: 'Tạo dự án thành công!', icon: 'success', timer: 2000, showConfirmButton: false });

    // Kiểm tra quyền để điều hướng về đúng trang quản lý
    if (authStore.userRole === 'ADMIN') {
      router.push('/admin/projects');
    } else {
      router.push('/projects');
    }
  } catch (error) {
    Swal.fire('Lỗi', error.response?.data?.message || "Không thể tạo dự án", 'error');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.primary-gradient-btn {
  background: linear-gradient(45deg, #1976D2, #42A5F5) !important;
  color: white !important;
  text-transform: none !important;
  letter-spacing: 0.5px;
}

@keyframes pulse-primary {
  0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
}

.pulse-primary {
  animation: pulse-primary 2s infinite;
}
</style>