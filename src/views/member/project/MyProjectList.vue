<template>
  <v-container fluid>
    <h2 class="text-h5 font-weight-bold mb-6">Dự án tôi tham gia</h2>
    
    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <v-row v-else-if="myProjects.length > 0">
      <v-col v-for="project in myProjects" :key="project.id" cols="12" sm="6" md="4" lg="3">
        <ProjectCard :project="project" />
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12" class="text-center">
        <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-folder-search-outline</v-icon>
        <p class="text-grey text-h6">Bạn chưa tham gia dự án nào.</p>
        <v-btn color="primary" to="/projects" class="mt-4" variant="flat">Khám phá dự án công khai</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project';
import { useAuthStore } from '@/stores/auth';
import ProjectCard from '@/components/ProjectCard.vue';

const projectStore = useProjectStore();
const authStore = useAuthStore();

const loading = computed(() => projectStore.loading);

const myProjects = computed(() => {
  const userId = authStore.user?.id;
  if (!userId) return [];
  return projectStore.projects.filter(p => {
    const isOwner = p.ownerId === userId;
    const isMember = p.memberIds?.includes(userId);
    // Hiển thị nếu là Owner hoặc Member
    return isOwner || isMember;
  });
});

onMounted(() => {
  projectStore.fetchAll();
});
</script>