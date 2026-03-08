<template>

<v-container>

<h2>Thông báo</h2>

<v-btn
color="primary"
class="mb-3"
@click="markAll"
>
Đánh dấu tất cả đã đọc
</v-btn>

<v-list>

<NotificationItem
v-for="n in notifications"
:key="n.id"
:notification="n"
@click="markRead(n.id)"
/>

</v-list>

</v-container>

</template>

<script setup>

import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '@/stores/notification'
import NotificationItem from '@/components/NotificationItem.vue'

const store = useNotificationStore()

const { notifications } = storeToRefs(store)

const userId = localStorage.getItem("userId")

onMounted(() => {
store.fetchAll(userId)
})

const markRead = (id) => {
store.markAsRead(id, userId)
}

const markAll = () => {
store.markAllAsRead(userId)
}

</script>
