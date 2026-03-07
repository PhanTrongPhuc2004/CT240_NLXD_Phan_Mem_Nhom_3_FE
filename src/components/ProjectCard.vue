<template>
  <v-card class="mx-auto h-100" variant="outlined" hover>
    <v-card-item>
      <div>
        <div class="text-overline mb-1 d-flex justify-space-between align-center">
          <div class="d-flex align-center">
            <v-chip size="x-small" :color="getStatusColor(project.status)" label class="mr-2">
              {{ project.status }}
            </v-chip>
            <v-icon v-if="project.visibility === 'private'" size="small" color="grey" title="Riêng tư">mdi-lock-outline</v-icon>
            <v-icon v-else-if="project.visibility === 'public'" size="small" color="blue" title="Công khai">mdi-earth</v-icon>
          </div>
          
          <!-- Hiển thị vai trò của user đối với dự án -->
          <v-chip v-if="isOwner" size="x-small" color="purple" variant="flat">Owner</v-chip>
          <v-chip v-else-if="isMember" size="x-small" color="blue" variant="flat">Member</v-chip>
          <v-chip v-else-if="isPending" size="x-small" color="orange" variant="flat">Pending</v-chip>
        </div>
        
        <div class="text-h6 mb-1 text-truncate" :title="project.name">{{ project.name }}</div>
        
        <div class="text-body-2 text-grey-darken-1 line-clamp-2" :title="project.description">
          {{ project.description || 'Không có mô tả' }}
        </div>
      </div>
    </v-card-item>

    <v-card-text class="pt-0">
      <div class="d-flex align-center mt-2">
        <v-icon icon="mdi-account-group" size="small" class="me-2" color="grey"></v-icon>
        <span class="text-caption text-grey">{{ project.memberIds?.length || 0 }} thành viên</span>
      </div>
      <div class="d-flex align-center mt-1">
        <v-icon icon="mdi-calendar-clock" size="small" class="me-2" color="grey"></v-icon>
        <span class="text-caption text-grey">Deadline: {{ project.endDate ? new Date(project.endDate).toLocaleDateString('vi-VN') : 'Chưa đặt' }}</span>
      </div>
      
      <!-- SỬ DỤNG COMPONENT MỚI ĐỂ HIỂN THỊ OWNER -->
      <div class="mt-2">
        <UserAvatarName :user-id="project.ownerId" />
      </div>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions>
      <!-- TRƯỜNG HỢP 1: LÀ CHỦ SỞ HỮU -->
      <template v-if="isOwner">
        <v-btn 
          variant="text" 
          color="primary" 
          @click="goToDetail"
        >
          Quản lý
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn 
          icon="mdi-delete" 
          variant="text" 
          color="error" 
          size="small"
          @click="handleDelete"
          title="Xóa dự án"
        ></v-btn>
      </template>

      <!-- TRƯỜNG HỢP 2: LÀ THÀNH VIÊN (KHÔNG PHẢI OWNER) -->
      <template v-else-if="isMember">
        <v-btn 
          variant="text" 
          color="primary" 
          @click="goToDetail"
        >
          Vào dự án
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn 
          variant="text" 
          color="error" 
          size="small"
          :loading="loading"
          @click="handleLeave"
        >
          Rời dự án
        </v-btn>
      </template>

      <!-- TRƯỜNG HỢP 3: ĐANG CHỜ DUYỆT -->
      <template v-else-if="isPending">
        <v-btn 
          block 
          variant="outlined" 
          color="warning"
          :loading="loading"
          @click="handleCancelRequest"
        >
          Hủy yêu cầu
        </v-btn>
      </template>

      <!-- TRƯỜNG HỢP 4: CHƯA THAM GIA -->
      <template v-else>
        <v-btn 
          block 
          variant="elevated" 
          color="secondary"
          :loading="loading"
          @click="handleJoin"
        >
          Xin tham gia
        </v-btn>
      </template>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import { useAuthStore } from '@/stores/auth';
import UserAvatarName from '@/components/UserAvatarName.vue';
import { projectApi } from '@/api/projectApi'; // SỬA: Dùng projectApi thay vì axios trực tiếp

const props = defineProps({ 
  project: { type: Object, required: true }
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
  switch (status) {
    case 'ACTIVE': return 'success';
    case 'INACTIVE': return 'grey';
    case 'COMPLETED': return 'info';
    default: return 'primary';
  }
};

const goToDetail = () => {
  router.push(`/projects/${props.project.id}`);
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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 40px; 
}
</style>