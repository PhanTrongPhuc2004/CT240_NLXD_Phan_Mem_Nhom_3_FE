<template>
  <v-container class="py-10">
    <v-row justify="center">
      <v-col cols="12" xl="10">
        <h1 class="text-h4 font-weight-bold mb-8">Tạo dự án mới</h1>

        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <v-row>
            <v-col cols="12" md="8">
              <v-card variant="flat" class="pa-4 border-b mb-6">
                <v-card-title class="px-0 pt-0 font-weight-bold">Thông tin cơ bản</v-card-title>
                <v-text-field
                  v-model="form.name"
                  label="Tên dự án"
                  placeholder="Ví dụ: Dự án Nền tảng E-commerce"
                  variant="outlined"
                  class="mt-4"
                  persistent-placeholder
                ></v-text-field>
                <v-textarea
                  v-model="form.description"
                  label="Mô tả dự án"
                  placeholder="Phát triển một nền tảng thương mại điện tử mạnh mẽ..."
                  variant="outlined"
                  rows="4"
                  class="mt-2"
                  persistent-placeholder
                ></v-textarea>
              </v-card>

              <v-card variant="flat" class="pa-4 border-b">
                <v-card-title class="px-0 pt-0 font-weight-bold">Lịch trình & Hiển thị</v-card-title>
                <v-row class="mt-2">
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.dateRange"
                      label="Ngày bắt đầu - Ngày kết thúc"
                      type="date"
                      variant="outlined"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="text-subtitle-2 mb-2">Khả năng hiển thị</div>
                    <v-radio-group v-model="form.visibility" inline>
                      <v-radio label="Công khai" value="public"></v-radio>
                      <v-radio label="Riêng tư" value="private"></v-radio>
                    </v-radio-group>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card variant="flat" class="pa-4 border-b mb-6">
                <v-card-title class="px-0 pt-0 font-weight-bold">Ảnh đại diện/Logo</v-card-title>
                <div 
                  class="upload-box mt-4 d-flex flex-column align-center justify-center border-dashed rounded-lg pa-6 grey-lighten-4"
                >
                  <v-icon icon="mdi-image-outline" size="48" color="grey-lighten-1"></v-icon>
                  <span class="text-caption text-center mt-2 grey-darken-1">
                    Kéo và thả ảnh vào đây, hoặc nhấn để tải lên
                  </span>
                  <input type="file" class="d-none" ref="fileInput" @change="handleFileUpload">
                </div>
              </v-card>

              <v-card variant="flat" class="pa-4 border-b">
                <v-card-title class="px-0 pt-0 font-weight-bold">Thành viên ban đầu</v-card-title>
                <v-autocomplete
                  v-model="form.members"
                  :items="availableUsers"
                  label="Tìm kiếm và thêm thành viên..."
                  variant="outlined"
                  multiple
                  chips
                  class="mt-4"
                  closable-chips
                ></v-autocomplete>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-8"></v-divider>
          <div class="d-flex justify-end pb-10">
            <v-btn 
              variant="text" 
              class="me-4 px-8" 
              @click="router.back()"
              :disabled="loading"
            >
              Hủy
            </v-btn>
            <v-btn 
              color="black" 
              size="large" 
              class="px-10 rounded-lg text-none"
              :loading="loading"
              @click="handleSubmit"
            >
              Tạo dự án
            </v-btn>
          </div>
        </v-form>
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

const form = ref({
  name: '',
  description: '',
  visibility: 'private',
  dateRange: '',
  members: []
});

const availableUsers = ['Alice Smith', 'Bob Johnson', 'Charlie Brown']; // Giả lập dữ liệu

const handleSubmit = async () => {
  loading.value = true;
  try {
    await projectStore.create(form.value);
    router.push('/projects');
  } catch (error) {
    alert("Lỗi: " + (error || "Không có quyền tạo dự án"));
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid #e0e0e0 !important;
}
.border-dashed {
  border: 2px dashed #e0e0e0 !important;
}
.upload-box {
  cursor: pointer;
  transition: background 0.3s;
}
.upload-box:hover {
  background-color: #f5f5f5 !important;
}
</style>