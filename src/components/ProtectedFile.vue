<template>
  <div class="protected-file-container mb-2">
    <v-progress-circular v-if="loading" indeterminate size="20" width="2"></v-progress-circular>
    
    <div v-else-if="objectUrl" class="d-flex flex-column align-end">
      <v-img 
        v-if="isImage" 
        :src="objectUrl" 
        max-width="300" 
        class="rounded border mb-2"
      ></v-img>
      
      <v-btn 
        variant="outlined" 
        size="small" 
        color="primary" 
        class="text-none"
        @click="downloadFile"
      >
        <v-icon start>mdi-download</v-icon>
        Tải xuống
      </v-btn>
    </div>

    <span v-else class="text-caption text-error">Lỗi tải file (Không có dữ liệu)</span>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import axios from 'axios';

const props = defineProps({
  url: { type: String, required: true }
});

const loading = ref(true);
const objectUrl = ref(null);
const fileName = computed(() => {
  const rawName = props.url.split('/').pop();
  // Tự động cắt bỏ ID/UUID của Backend (vd: 360d384a_filename.pdf)
  const splitIndex = rawName.indexOf('_');
  if (splitIndex !== -1) {
    return decodeURIComponent(rawName.substring(splitIndex + 1));
  }
  return decodeURIComponent(rawName);
});
const isImage = computed(() => /\.(jpg|jpeg|png|gif)$/i.test(props.url));

const fetchFile = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('auth_token'); // Hoặc lấy từ authStore

    const response = await axios.get(props.url, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob' // Quan trọng: tải dưới dạng blob
    });

    // Tạo một URL tạm thời cho file vừa tải về
    objectUrl.value = URL.createObjectURL(response.data);
  } catch (error) {
    console.error("Lỗi tải file bảo mật:", error);
  } finally {
    loading.value = false;
  }
};

const downloadFile = () => {
  const link = document.createElement('a');
  link.href = objectUrl.value;
  link.setAttribute('download', fileName.value);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

onMounted(fetchFile);

// Giải phóng bộ nhớ khi component bị hủy
onUnmounted(() => {
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value);
});
</script>