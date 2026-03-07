<template>
  <div class="d-flex align-center">
    <!-- Avatar -->
    <v-avatar color="primary" size="24" class="mr-2">
      <span class="text-white text-caption font-weight-bold">{{ initials }}</span>
    </v-avatar>
    
    <!-- Tên -->
    <span class="text-caption text-grey-darken-1 font-weight-medium">
      Chủ dự án: {{ displayName }}
    </span>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
});

const user = ref(null);
const loading = ref(true);

// Tính toán tên hiển thị
const displayName = computed(() => {
  if (user.value) {
    return user.value.fullName || user.value.username;
  }
  return loading.value ? 'Đang tải...' : `User ${props.userId.substring(0, 5)}...`;
});

// Tính toán chữ cái đầu cho Avatar
const initials = computed(() => {
  const name = displayName.value;
  if (name === 'Đang tải...') return '...';
  return name.charAt(0).toUpperCase();
});

onMounted(async () => {
  if (!props.userId) return;
  
  try {
    const token = localStorage.getItem('auth_token');
    // Gọi API lấy thông tin user theo ID
    const res = await axios.post('http://localhost:8080/api/users/list', 
      { userIds: [props.userId] }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data && res.data.length > 0) {
      user.value = res.data[0];
    }
  } catch (err) {
    console.error(`Lỗi lấy info user ${props.userId}:`, err);
  } finally {
    loading.value = false;
  }
});
</script>