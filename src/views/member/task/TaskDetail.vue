<template>
    <v-container>
        <h2>Chi tiết Công việc</h2>
        <!-- TODO: CN_22 - Mô tả, assignee, deadline, bình luận (CommentSection) -->
        <CommentSection :taskId="taskId" />
    </v-container>
</template>

<script setup>
import { useTaskStore } from '@/stores/task'
import CommentSection from '@/components/CommentSection.vue'
const taskStore = useTaskStore()
</script>