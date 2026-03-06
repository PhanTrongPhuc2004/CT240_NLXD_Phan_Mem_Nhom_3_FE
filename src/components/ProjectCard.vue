<template>
  <v-card class="mx-auto h-100" variant="outlined">
    <v-card-item>
      <div>
        <div class="text-overline mb-1 flex justify-between">
          <v-chip size="x-small" :color="getStatusColor(project.status)">
            {{ project.status }}
          </v-chip>
          <span class="text-caption">ID: {{ project.id?.substring(0, 5) }}...</span>
        </div>
        <div class="text-h6 mb-1 text-truncate">{{ project.name }}</div>
        <div class="text-body-2 text-grey-darken-1 line-clamp-2">
          {{ project.description || 'Không có mô tả' }}
        </div>
      </div>
    </v-card-item>

    <v-card-text>
      <div class="d-flex align-center">
        <v-icon icon="mdi-account-group" size="small" class="me-2"></v-icon>
        <span class="text-caption">{{ project.memberIds?.length || 0 }} thành viên</span>
      </div>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions>
      <v-btn 
        variant="text" 
        color="primary" 
        @click="$router.push(`/projects/${project.id}`)"
      >
        Chi tiết
      </v-btn>

      <v-spacer></v-spacer>

      <v-btn 
        icon="mdi-delete" 
        variant="text" 
        color="error" 
        size="small"
        @click="handleDelete"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { useProjectStore } from '@/stores/project';

const props = defineProps({ 
  project: { type: Object, required: true } 
});

const projectStore = useProjectStore();

const getStatusColor = (status) => {
  switch (status) {
    case 'ACTIVE': return 'success';
    case 'INACTIVE': return 'grey';
    default: return 'primary';
  }
};

const handleDelete = async () => {
  if (confirm(`Bạn có chắc muốn xóa dự án "${props.project.name}" không?`)) {
    try {
      await projectStore.delete(props.project.id);
      // Bạn có thể thêm thông báo thành công ở đây (snackbar)
    } catch (error) {
      alert("Lỗi khi xóa: " + error.message);
    }
  }
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>