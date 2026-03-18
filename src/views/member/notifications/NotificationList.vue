<template>
  <v-container class="pa-4">
    <v-card elevation="2" class="rounded-lg">
      <v-toolbar flat color="white">
        <v-toolbar-title class="font-weight-bold">🔔 Thông báo của bạn</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="tonal" @click="store.markAllAsRead(userId)">
          Đánh dấu tất cả đã đọc
        </v-btn>
      </v-toolbar>

      <v-divider></v-divider>

      <v-list lines="three">
        <v-list-item v-if="notifications.length === 0">
          <v-list-item-title class="text-center">Không có thông báo nào</v-list-item-title>
        </v-list-item>

        <template v-for="(n, index) in notifications" :key="n.id">
          <v-list-item
            :class="{ 'unread-bg': !n.read }"
            @click="store.markAsRead(n.id, userId)"
            link
          >
            <template v-slot:prepend>
              <v-avatar :color="getNotifyColor(n.type)" size="40">
                <v-icon color="white">{{ getNotifyIcon(n.type) }}</v-icon>
              </v-avatar>
            </template>

            <v-list-item-title :class="{ 'font-weight-bold': !n.read }">
              {{ n.message }}
            </v-list-item-title>

            <v-list-item-subtitle class="mt-1">
              {{ formatDate(n.createdAt) }}
            </v-list-item-subtitle>

            <template v-slot:append>
              <div v-if="!n.read" class="unread-dot"></div>
            </template>
          </v-list-item>
          <v-divider v-if="index < notifications.length - 1" inset></v-divider>
        </template>
      </v-list>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'

const store = useNotificationStore()
// Sử dụng storeToRefs để notifications có tính phản ứng
const { notifications } = storeToRefs(store)

const getUserId = () => {
  const userData = localStorage.getItem("auth_user");
  if (userData) {
    try {
      return JSON.parse(userData).id;
    } catch (e) {
      return null;
    }
  }
  return null;
};

const userId = getUserId();

onMounted(() => {
  if (userId) {
    store.fetchAll(userId);
  } else {
    console.error("Không tìm thấy UserId trong localStorage");
  }
})

const getNotifyIcon = (type) => {
  switch (type) {
    case 'TASK_ASSIGNED': return 'mdi-clipboard-plus-outline';
    case 'COMMENT_ADDED': return 'mdi-comment-text-outline';
    case 'PROJECT_INVITE': return 'mdi-email-outline';
    default: return 'mdi-bell-outline';
  }
};

const getNotifyColor = (type) => {
  if (type?.includes('OVERDUE')) return 'error';
  if (type?.includes('PROJECT')) return 'info';
  if (type?.includes('COMMENT')) return 'teal';
  return 'primary';
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('vi-VN');
};
</script>

<style scoped>
.unread-bg {
  background-color: #f0f7ff !important;
}
.unread-dot {
  width: 10px;
  height: 10px;
  background-color: #1976d2;
  border-radius: 50%;
}
</style>
