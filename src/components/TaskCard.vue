<template>
    <v-card>
        <v-card-title>{{ task.title }}</v-card-title>
        <v-card-text>
            <p>Trạng thái: {{ task.status }}</p>
            <p>Hạn: {{ formatDate(task.deadline) }}</p>
        </v-card-text>
    </v-card>
</template>

<script setup>
import { formatDate } from '@/utils/format'
defineProps({ task: Object })
</script>