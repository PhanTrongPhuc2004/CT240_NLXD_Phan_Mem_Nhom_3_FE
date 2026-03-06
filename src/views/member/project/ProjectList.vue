<template>
    <v-container>
        <v-toolbar flat>
            <v-toolbar-title>Danh sách Dự án của tôi (MEMBER)</v-toolbar-title>
            <v-spacer />
            <v-btn color="primary" @click="createNewProject">Tạo dự án mới</v-btn>
        </v-toolbar>

        <v-row>
            <v-col v-for="project in projects" :key="project.id" cols="12" md="4">
                <ProjectCard :project="project" />
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { useProjectStore } from '@/stores/project'
import ProjectCard from '@/components/ProjectCard.vue'

const projectStore = useProjectStore()
const projects = computed(() => projectStore.projects)
</script>