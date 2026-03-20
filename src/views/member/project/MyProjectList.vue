<template>
  <v-container>
    <v-toolbar flat color="transparent">
      <v-toolbar-title class="text-h5 font-weight-bold">
        Dự án tôi tham gia
      </v-toolbar-title>
    </v-toolbar>

    <v-row v-if="loading" justify="center" class="mt-10">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-row>

    <v-row v-else-if="myProjects.length === 0" justify="center" class="mt-10">
      <v-col cols="12" class="text-center">
        <v-icon size="64" color="grey-lighten-1">mdi-folder-account-outline</v-icon>
        <p class="text-grey mt-2">Bạn chưa tham gia dự án nào. Hãy khám phá và tham gia các dự án!</p>
        <v-btn class="primary-gradient-btn pulse-primary font-weight-bold px-6 mt-4" rounded="pill" to="/projects">Khám phá dự án</v-btn>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col v-for="project in myProjects" :key="project.id" cols="12" sm="6" md="4">
        <ProjectCard :project="project" />
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
    const isOwner = p.ownerId == userId;
    const isMember = p.memberIds?.some(id => id == userId);
    // Hiển thị nếu là Owner hoặc Member
    return isOwner || isMember;
  });
});

onMounted(() => {
  projectStore.fetchAll();
});
</script>

<style scoped>
.primary-gradient-btn {
  background: linear-gradient(45deg, #1976D2, #42A5F5) !important;
  color: white !important;
  text-transform: none !important;
  letter-spacing: 0.5px;
}

@keyframes pulse-primary {
  0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
}

.pulse-primary {
  animation: pulse-primary 2s infinite;
}
</style>