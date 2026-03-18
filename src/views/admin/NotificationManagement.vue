<template>
  <v-container>
    <div class="d-flex align-center mb-6">
      <h2 class="text-h4 font-weight-bold">Quản lý Thông báo Dự án</h2>
      <v-spacer></v-spacer>
      <v-chip color="red" label class="mr-2">Chưa đọc: {{ unreadCount }}</v-chip>
      <v-btn color="success" prepend-icon="mdi-check-all" @click="store.markAllAsRead(userId)">
        Đọc tất cả
      </v-btn>
    </div>

    <v-card variant="outlined" class="rounded-xl">
      <v-list v-if="notifications.length === 0" class="pa-10 text-center">
        <v-icon size="64" color="grey-lighten-1">mdi-bell-off-outline</v-icon>
        <p class="text-grey mt-2">Hiện tại không có thông báo nào.</p>
      </v-list>

      <v-list v-else lines="two" class="pa-0">
        <template v-for="(n, index) in notifications" :key="n.id">
          <v-list-item
            :class="{ 'unread-item': !n.read }"
            class="py-4 px-6"
          >
            <template v-slot:prepend>
              <v-avatar :color="getManagerNotifyColor(n.type)" size="48">
                <v-icon color="white">{{ getManagerNotifyIcon(n.type) }}</v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="text-subtitle-1 font-weight-bold">
              {{ n.message }}
            </v-list-item-title>

            <v-list-item-subtitle class="text-caption">
              {{ formatDate(n.createdAt) }}
            </v-list-item-subtitle>

            <template v-slot:append>
              <div v-if="n.type === 'MEMBER_REQUEST_JOIN'" class="d-flex gap-2">
                <v-btn
                  size="small"
                  color="primary"
                  variant="elevated"
                  @click="handleAction(n, 'approve')"
                >Chấp nhận</v-btn>
                <v-btn
                  size="small"
                  color="error"
                  variant="outlined"
                  @click="handleAction(n, 'reject')"
                >Từ chối</v-btn>
              </div>

              <v-btn
                v-else-if="!n.read"
                icon="mdi-eye-outline"
                variant="text"
                color="grey"
                @click="store.markAsRead(n.id, userId)"
              ></v-btn>
            </template>
          </v-list-item>
          <v-divider v-if="index < notifications.length - 1"></v-divider>
        </template>
      </v-list>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'
import { projectApi } from '@/api/projectApi'

const store = useNotificationStore()
const { notifications, unreadCount } = storeToRefs(store)
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
  }
});

const getManagerNotifyIcon = (type) => {
  switch (type) {
    case 'MEMBER_REQUEST_JOIN': return 'mdi-account-plus';
    case 'MEMBER_LEFT_PROJECT': return 'mdi-account-remove';
    case 'TASK_OVERDUE': return 'mdi-clock-alert';
    case 'COMMENT_URGENT': return 'mdi-comment-alert';
    default: return 'mdi-shield-check';
  }
};

const getManagerNotifyColor = (type) => {
  if (type === 'TASK_OVERDUE') return 'orange-darken-2';
  if (type === 'MEMBER_REQUEST_JOIN') return 'blue-accent-3';
  if (type === 'MEMBER_LEFT_PROJECT') return 'grey-darken-1';
  return 'indigo';
};

const handleAction = async (notification, action) => {
  try {
    const payload = { userId: notification.senderId };

    if (action === 'approve') {
      await projectApi.approveJoin(notification.projectId, payload);
    } else {
      await projectApi.rejectJoin(notification.projectId, payload);
    }

    // Đánh dấu đã đọc và tải lại danh sách
    await store.markAsRead(notification.id, userId);
    await store.fetchAll(userId);
  } catch (error) {
    console.error("Lỗi khi xử lý yêu cầu:", error);
  }
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('vi-VN');
};
</script>

<style scoped>
.unread-item {
  border-left: 4px solid #2979FF;
  background-color: #F5Faff;
}
.gap-2 {
  display: flex;
  gap: 8px;
}
</style>
