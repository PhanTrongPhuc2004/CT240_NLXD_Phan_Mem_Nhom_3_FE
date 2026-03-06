<template>
    <v-list-item :class="{ 'font-weight-bold': !notification.read }">
        <v-list-item-title>{{ notification.message }}</v-list-item-title>
    </v-list-item>
</template>

<script setup>
defineProps({ notification: Object })
</script>