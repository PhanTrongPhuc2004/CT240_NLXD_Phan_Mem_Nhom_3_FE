<template>
  <v-card
    class="project-card h-100 d-flex flex-column"
    :class="['status-border-' + (project.status ? project.status.toLowerCase() : 'default')]"
    elevation="2"
    @click="goToDetail"
  >
    <v-card-item>
      <template v-slot:prepend>
        <v-avatar
          :color="getStatusColor(project.status)"
          variant="tonal"
          rounded="lg"
          class="me-3"
        >
          <v-icon icon="mdi-folder-text-outline" :color="getStatusColor(project.status)"></v-icon>
        </v-avatar>
      </template>
      <v-card-title class="font-weight-bold text-h6 text-truncate">
        {{ project.name }}
      </v-card-title>
      <v-card-subtitle class="d-flex align-center mt-1">
        <v-icon
          size="small"
          class="me-1"
          :color="project.visibility === 'public' ? 'info' : 'grey'"
        >
          {{ project.visibility === 'public' ? 'mdi-earth' : 'mdi-lock' }}
        </v-icon>
        <span class="text-caption">{{ project.visibility === 'public' ? 'Công khai' : 'Riêng tư' }}</span>
        <span class="mx-2 text-grey-lighten-1">•</span>
        <v-icon size="small" class="me-1" color="grey">mdi-calendar-start</v-icon>
        <span class="text-caption">{{ project.startDate ? formatDate(project.startDate) : '---' }}</span>
      </v-card-subtitle>
    </v-card-item>

    <v-card-text class="flex-grow-1 pt-2 pb-0">
      <p class="text-body-2 text-grey-darken-1 mb-4 project-description">
        {{ project.description || 'Chưa có mô tả cho dự án này.' }}
      </p>
      
      <div class="d-flex align-center">
        <v-chip
          size="x-small"
          :color="getStatusColor(project.status)"
          label
          class="text-uppercase font-weight-bold me-2"
        >
          {{ getStatusVN(project.status) }}
        </v-chip>
        
        <v-chip v-if="isOwner" size="x-small" color="purple" variant="flat" class="font-weight-medium">Owner</v-chip>
        <v-chip v-else-if="isMember" size="x-small" color="blue" variant="flat" class="font-weight-medium">Member</v-chip>
        <v-chip v-else-if="isPending" size="x-small" color="orange" variant="flat" class="font-weight-medium">Pending</v-chip>
      </div>
    </v-card-text>

    <v-divider class="mx-4 mt-4"></v-divider>

    <v-card-actions class="px-4 py-3">
      <div class="avatar-stack me-auto">
         <v-avatar 
            v-for="i in Math.min(project.memberIds?.length || 0, 4)" 
            :key="i"
            size="28" 
            color="grey-lighten-3" 
            class="stacked-avatar"
            variant="flat"
        >
            <v-icon size="16" color="grey-darken-1">mdi-account</v-icon>
        </v-avatar>
        <v-avatar 
            v-if="(project.memberIds?.length || 0) > 4" 
            size="28" 
            color="primary" 
            class="stacked-avatar text-caption text-white"
        >
            +{{ project.memberIds.length - 4 }}
        </v-avatar>
      </div>

      <!-- TRƯỜNG HỢP 1: LÀ CHỦ SỞ HỮU -->
      <template v-if="isOwner">
        <v-btn icon="mdi-cog-outline" variant="text" size="small" color="grey-darken-1" @click.stop="goToDetail" title="Quản lý"></v-btn>
        <v-btn icon="mdi-delete-outline" variant="text" size="small" color="error" @click.stop="handleDelete" title="Xóa dự án"></v-btn>
      </template>

      <!-- TRƯỜNG HỢP 2: LÀ THÀNH VIÊN (KHÔNG PHẢI OWNER) -->
      <template v-else-if="isMember">
        <v-btn variant="text" size="small" color="primary" @click.stop="goToDetail">Vào dự án</v-btn>
        <v-btn variant="text" size="small" color="error" :loading="loading" @click.stop="handleLeave">Rời đi</v-btn>
      </template>

      <!-- TRƯỜNG HỢP 3: ĐANG CHỜ DUYỆT -->
      <template v-else-if="isPending">
        <v-btn block variant="tonal" size="small" color="warning" :loading="loading" @click.stop="handleCancelRequest">Hủy yêu cầu</v-btn>
      </template>

      <!-- TRƯỜNG HỢP 4: CHƯA THAM GIA -->
      <template v-else>
        <v-btn block variant="flat" size="small" color="primary" :loading="loading" @click.stop="handleJoin">Tham gia</v-btn>
      </template>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import { useAuthStore } from '@/stores/auth';
import { projectApi } from '@/api/projectApi'; // SỬA: Dùng projectApi thay vì axios trực tiếp

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
});

const router = useRouter();
const projectStore = useProjectStore();
const authStore = useAuthStore();
const loading = ref(false);

const currentUserId = computed(() => authStore.user?.id);

const isOwner = computed(() => props.project.ownerId === currentUserId.value);
const isMember = computed(() => props.project.memberIds?.includes(currentUserId.value));
const isPending = computed(() => props.project.pendingMemberIds?.includes(currentUserId.value));

const getStatusColor = (status) => {
  const map = {
    'ACTIVE': 'success',
    'INACTIVE': 'grey',
    'COMPLETED': 'info',
    'CANCELLED': 'error'
  };
  return map[status] || 'primary';
};

const getStatusVN = (status) => {
  const map = {
    'ACTIVE': 'Hoạt động',
    'INACTIVE': 'Tạm dừng',
    'COMPLETED': 'Hoàn thành',
    'CANCELLED': 'Đã hủy'
  };
  return map[status] || status;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const goToDetail = () => {
  // Kiểm tra role để điều hướng đúng
  if (authStore.userRole === 'ADMIN') {
    router.push(`/admin/projects/${props.project.id}`);
  } else {
    router.push(`/member/projects/${props.project.id}`);
  }
};

const handleDelete = async () => {
  if (confirm(`Bạn có chắc muốn xóa dự án "${props.project.name}" không?`)) {
    try {
      await projectStore.delete(props.project.id);
    } catch (error) {
      alert("Lỗi khi xóa: " + (error.response?.data || error.message));
    }
  }
};

const handleJoin = async () => {
  loading.value = true;
  try {
    await projectStore.joinProject(props.project.id);
    await projectStore.fetchAll(); 
  } catch (error) {
    alert("Lỗi: " + (error.response?.data || error.message));
  } finally {
    loading.value = false;
  }
};

const handleLeave = async () => {
  if (!confirm(`Bạn có chắc muốn rời khỏi dự án "${props.project.name}"?`)) return;
  loading.value = true;
  try {
    await projectStore.leaveProject(props.project.id);
    await projectStore.fetchAll();
  } catch (error) {
    alert("Lỗi: " + (error.response?.data || error.message));
  } finally {
    loading.value = false;
  }
};

// Hàm hủy yêu cầu mới thêm
const handleCancelRequest = async () => {
  if (!confirm("Bạn muốn hủy yêu cầu tham gia dự án này?")) return;
  
  loading.value = true;
  try {
    await projectApi.cancelJoinRequest(props.project.id);
    await projectStore.fetchAll(); // Tải lại danh sách để cập nhật trạng thái
  } catch (error) {
    alert("Lỗi: " + (error.response?.data || error.message));
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.project-card {
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 4px solid transparent;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.1) !important;
}

.status-border-active { border-left-color: #4CAF50; }
.status-border-inactive { border-left-color: #9E9E9E; }
.status-border-completed { border-left-color: #2196F3; }
.status-border-cancelled { border-left-color: #F44336; }

.project-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 40px; /* fixed height for alignment */
  line-height: 20px;
}

/* Hiệu ứng xếp chồng Avatar */
.avatar-stack {
    display: flex;
    padding-left: 8px;
}

.stacked-avatar {
    border: 2px solid #ffffff;
    margin-left: -8px;
}
</style>