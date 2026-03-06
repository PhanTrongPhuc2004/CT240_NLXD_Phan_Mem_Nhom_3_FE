<template>
    <v-container>
        <h2>Chi tiết Dự án: {{ project?.name }}</h2>
        <!-- TODO: CN_14 - Hiển thị thành viên, tiến độ, danh sách task -->
    </v-container>
</template>

<script setup>
import { useProjectStore } from '@/stores/project'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const projectStore = useProjectStore()
const route = useRoute()
const project = ref(null)

onMounted(async () => {
    project.value = await projectStore.getDetail(route.params.id)
})
</script>