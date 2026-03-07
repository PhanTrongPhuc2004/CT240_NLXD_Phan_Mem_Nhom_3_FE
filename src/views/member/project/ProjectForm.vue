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
        <v-window v-model="activeTab">
          <!-- Tab Tổng quan -->
          <v-window-item value="overview">
            <v-card flat class="pa-6">
              <v-form ref="formRef" @submit.prevent="handleSubmit">
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
                    <v-text-field v-model="form.dateRange" label="Ngày bắt đầu - Ngày kết thúc" type="date"
                      variant="outlined"></v-text-field>
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
              </v-form>
            </v-card>
          </v-window-item>

          <!-- Tab Thành viên -->
          <v-window-item value="members">
            <v-card flat class="pa-6">
              <v-card-title class="px-0 pt-0 font-weight-bold mb-4">Thành viên ban đầu</v-card-title>
              <v-autocomplete v-model="form.members" :items="availableUsers" label="Tìm kiếm và thêm thành viên..."
                variant="outlined" multiple chips closable-chips
                prepend-inner-icon="mdi-account-search"></v-autocomplete>

              <!-- Danh sách thành viên đã thêm (preview) -->
              <v-list v-if="form.members.length > 0" class="mt-6">
                <v-list-item v-for="(member, index) in form.members" :key="index">
                  <template v-slot:prepend>
                    <v-avatar color="primary" size="36">
                      <span class="text-white">{{ member.charAt(0).toUpperCase() }}</span>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ member }}</v-list-item-title>
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
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project';

const router = useRouter();
const projectStore = useProjectStore();
const loading = ref(false);
const activeTab = ref('overview');

const form = ref({
  name: '',
  description: '',
  visibility: 'private',
  dateRange: '',
  members: [],
  avatarPreview: null,
  avatarFile: null
});

const availableUsers = ref(['Alice Smith', 'Bob Johnson', 'Charlie Brown']); // Giả lập - thay bằng API thật sau

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
  if (!valid) return;

  loading.value = true;
  try {
    const payload = {
      name: form.value.name,
      description: form.value.description,
      visibility: form.value.visibility,
      dateRange: form.value.dateRange,
      members: form.value.members
      // TODO: Xử lý upload avatar nếu có
    };

    await projectStore.create(payload);
    router.push('/projects');
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