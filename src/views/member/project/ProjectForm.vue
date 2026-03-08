<!-- src/views/member/project/ProjectForm.vue - ĐÃ SỬA HOÀN CHỈNH: Bố cục rõ ràng, tab Tổng quan và Thành viên không chồng chéo -->
<template>
  <v-container fluid class="py-10">
    <v-row justify="center">
      <v-col cols="12" xl="10">
        <!-- Header -->
        <div class="d-flex align-center justify-space-between mb-8">
          <h1 class="text-h4 font-weight-bold">Tạo dự án mới</h1>
          <v-btn color="grey" variant="text" @click="router.back()" :disabled="loading">
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

                  <v-col cols="12" sm="6">
                    <div class="text-subtitle-2 mb-2">Khả năng hiển thị</div>
                    <v-radio-group v-model="form.visibility" inline>
                      <v-radio label="Công khai" value="public"></v-radio>
                      <v-radio label="Riêng tư" value="private"></v-radio>
                    </v-radio-group>
                  </v-col>

                  <!-- Ảnh đại diện -->
                  <v-col cols="12">
                    <v-card variant="flat" class="pa-4 border">
                      <v-card-title class="px-0 pt-0 font-weight-bold">Ảnh đại diện/Logo</v-card-title>
                      <div
                        class="upload-box mt-4 d-flex flex-column align-center justify-center border-dashed rounded-lg pa-6 grey-lighten-4"
                        @click="$refs.fileInput.click()">
                        <v-icon v-if="!form.avatarPreview" icon="mdi-image-outline" size="48"
                          color="grey-lighten-1"></v-icon>
                        <v-img v-else :src="form.avatarPreview" max-height="200" contain></v-img>
                        <span class="text-caption text-center mt-2 grey-darken-1">
                          Kéo và thả ảnh vào đây, hoặc nhấn để tải lên
                        </span>
                        <input type="file" class="d-none" ref="fileInput" accept="image/*" @change="handleFileUpload">
                      </div>
                    </v-card>
                  </v-col>
                </v-row>

                <!-- Nút tạo dự án -->
                <div class="d-flex justify-end mt-8">
                  <v-btn color="primary" size="large" class="px-10" :loading="loading" type="submit">
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
                <v-btn color="primary" size="large" class="px-10" :loading="loading" @click="handleSubmit">
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

const router = useRouter();
const projectStore = useProjectStore();
const loading = ref(false);
const activeTab = ref('overview');

const form = ref({
  name: '',
  description: '',
  visibility: 'private',
  startDate: '',
  endDate: '',
  members: [],
  avatarPreview: null,
  avatarFile: null
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

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    form.value.avatarFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      form.value.avatarPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();
  
  // SỬA: Nếu form không hợp lệ (ví dụ chưa nhập tên), chuyển về tab Overview để user thấy lỗi
  if (!valid) {
    alert("Vui lòng nhập đầy đủ thông tin bắt buộc (Tên dự án) ở tab Tổng quan.");
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
      // memberIds: form.value.members.map(m => m.id) // Backend có thể chưa hỗ trợ trường này
      // TODO: Xử lý upload avatar nếu có
    };

    // 1. Tạo dự án trước
    const newProject = await projectStore.create(payload);
    // Đảm bảo lấy được ID dù backend trả về 'id' hay '_id'
    const newProjectId = newProject.id || newProject._id;

    // 2. Gọi API thêm từng thành viên vào dự án vừa tạo (Workaround lỗi Backend không lưu memberIds)
    if (form.value.members && form.value.members.length > 0 && newProjectId) {
      await Promise.all(form.value.members.map(member => 
        projectApi.assignMember(newProjectId, { userId: member.id })
      ));
    }

    // Kiểm tra quyền để điều hướng về đúng trang quản lý
    if (authStore.userRole === 'ADMIN') {
      router.push('/admin/projects');
    } else {
      router.push('/projects');
    }
  } catch (error) {
    alert("Lỗi: " + (error.response?.data?.message || "Không thể tạo dự án"));
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.upload-box {
  cursor: pointer;
  transition: background 0.3s;
  border: 2px dashed #e0e0e0;
}

.upload-box:hover {
  background-color: #f5f5f5;
}
</style>