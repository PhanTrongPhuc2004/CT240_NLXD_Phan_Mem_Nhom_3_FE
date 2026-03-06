<template>
  <v-container>
    <v-toolbar flat color="transparent">
      <v-toolbar-title class="text-h5 font-weight-bold">
        Danh sách Dự án
      </v-toolbar-title>
      <v-spacer />
      <v-btn 
        color="primary" 
        prepend-icon="mdi-plus" 
        variant="elevated"
        to="/projects/create"
      >
        Tạo dự án mới
      </v-btn>
    </v-toolbar>

    <v-row v-if="projectStore.loading" justify="center" class="mt-10">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-row>

    <v-row v-else-if="projects.length === 0" justify="center" class="mt-10">
      <v-col cols="12" class="text-center">
        <v-icon size="64" color="grey-lighten-1">mdi-folder-open-outline</v-icon>
        <p class="text-grey mt-2">Bạn chưa có dự án nào. Hãy tạo dự án đầu tiên!</p>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col 
        v-for="project in projects" 
        :key="project.id" 
        cols="12" 
        sm="6" 
        md="4"
      >
        <ProjectCard :project="project" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import ProjectCard from '@/components/ProjectCard.vue'

const projectStore = useProjectStore()

// Lấy dữ liệu từ Pinia Store
const projects = computed(() => projectStore.projects)

// Tự động gọi API lấy danh sách từ BE khi vừa vào trang
onMounted(async () => {
  await projectStore.fetchAll()
})
</script>