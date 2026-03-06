<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="mt-5" elevation="2">
          <v-card-title class="text-h5 font-weight-bold py-4 px-6">
            {{ isEdit ? 'Chỉnh sửa dự án' : 'Tạo dự án mới' }}
          </v-card-title>
          
          <v-divider></v-divider>

          <v-card-text class="pa-6">
            <v-form ref="formRef" @submit.prevent="handleSubmit">
              <v-text-field
                v-model="form.name"
                label="Tên dự án"
                placeholder="Nhập tên dự án..."
                variant="outlined"
                required
                :rules="[v => !!v || 'Tên dự án là bắt buộc']"
                prepend-inner-icon="mdi-format-title"
                class="mb-4"
              ></v-text-field>

              <v-textarea
                v-model="form.description"
                label="Mô tả"
                placeholder="Mô tả ngắn gọn về mục tiêu dự án..."
                variant="outlined"
                rows="4"
                prepend-inner-icon="mdi-text-subject"
                class="mb-4"
              ></v-textarea>

              <v-select
                v-if="isEdit"
                v-model="form.status"
                :items="['ACTIVE', 'INACTIVE']"
                label="Trạng thái"
                variant="outlined"
                prepend-inner-icon="mdi-list-status"
              ></v-select>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-6">
  <v-spacer></v-spacer> <v-btn 
    variant="outlined" 
    color="grey-darken-1" 
    class="me-4" 
    @click="router.back()"
    :disabled="loading"
  >
    Hủy bỏ
  </v-btn>

  <v-btn 
    color="primary" 
    variant="elevated" 
    :loading="loading" 
    @click="handleSubmit"
    min-width="120"
  >
    Lưu dự án
  </v-btn>
</v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const formRef = ref(null);

const isEdit = computed(() => !!route.params.id);
const loading = ref(false);

const form = ref({
  name: '',
  description: '',
  status: 'ACTIVE'
});

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true;
    try {
      await projectStore.getDetail(route.params.id);
      if (projectStore.currentProject) {
        form.value = { ...projectStore.currentProject };
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết:", error);
    } finally {
      loading.value = false;
    }
  }
});

const handleSubmit = async () => {
  loading.value = true;
  try {
    const projectData = {
      name: form.value.name,
      description: form.value.description,
      status: 'ACTIVE' // Đảm bảo đúng enum ở Backend
    };
    
    await projectStore.create(projectData);
    router.push('/projects');
  } catch (error) {
    console.error("Lỗi chi tiết từ Server:", error.response?.data);
    alert("Lỗi: " + (error.response?.data?.message || "Không có quyền tạo dự án"));
  } finally {
    loading.value = false;
  }
};
</script>