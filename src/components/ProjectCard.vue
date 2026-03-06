<template>
    <v-card>
        <v-card-title>{{ project.name }}</v-card-title>
        <v-card-text>
            <p>Trạng thái: {{ project.status }}</p>
            <p>Thành viên: {{ project.memberIds?.length || 0 }}</p>
        </v-card-text>
    </v-card>
</template>

<script setup>
defineProps({ project: Object })
</script>