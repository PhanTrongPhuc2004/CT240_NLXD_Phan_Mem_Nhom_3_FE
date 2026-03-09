<template>
  <div class="comment-section mt-4">
    <h4 class="text-h6 mb-4">Bình luận</h4>
    
    <!-- Loading -->
    <div v-if="loading" class="d-flex justify-center my-4">
      <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="comments.length === 0" class="text-center text-grey my-4 text-body-2">
      Chưa có bình luận nào.
    </div>

    <!-- List Comments -->
    <v-list v-else class="bg-transparent pa-0">
      <v-list-item v-for="comment in comments" :key="comment.id" class="mb-4 px-0">
        <template v-slot:prepend>
          <v-avatar color="primary" size="32" class="mr-3">
            <span class="text-caption text-white font-weight-bold">
              {{ getInitials(comment.user?.fullName || comment.user?.username) }}
            </span>
          </v-avatar>
        </template>
        
        <v-card variant="flat" class="bg-grey-lighten-4 rounded-lg px-3 py-2 w-100">
          <div class="d-flex justify-space-between align-center mb-1">
            <span class="font-weight-bold text-body-2">{{ comment.user?.fullName || 'Người dùng' }}</span>
            <span class="text-caption text-grey">{{ formatDate(comment.createdAt) }}</span>
          </div>
          <div class="text-body-2 text-grey-darken-3" style="white-space: pre-wrap;">{{ comment.content }}</div>
        </v-card>
      </v-list-item>
    </v-list>

    <!-- Add Comment Form -->
    <div class="d-flex align-start mt-2">
      <v-avatar color="grey-lighten-1" size="32" class="mr-3 mt-1">
        <span class="text-caption text-white">{{ userInitials }}</span>
      </v-avatar>
      <v-textarea
        v-model="newComment"
        placeholder="Viết bình luận..."
        variant="outlined"
        rows="1"
        auto-grow
        hide-details
        density="compact"
        class="mr-2"
        bg-color="white"
        :disabled="submitting"
        @keydown.enter.prevent="submitComment"
      ></v-textarea>
      <v-btn
        icon="mdi-send"
        variant="text"
        color="primary"
        :disabled="!newComment.trim() || submitting"
        :loading="submitting"
        @click="submitComment"
      ></v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { commentApi } from '@/api/commentApi'

const props = defineProps({
  taskId: {
    type: [String, Number],
    required: true
  }
})

const authStore = useAuthStore()
const comments = ref([])
const loading = ref(false)
const submitting = ref(false)
const newComment = ref('')

const userInitials = computed(() => {
  const name = authStore.user?.fullName || authStore.user?.username || 'Me'
  return name.charAt(0).toUpperCase()
})

const getInitials = (name) => name ? name.charAt(0).toUpperCase() : '?'

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  })
}

const fetchComments = async () => {
  if (!props.taskId) return
  loading.value = true
  try {
    const res = await commentApi.getByTask(props.taskId)
    comments.value = res.data || []
  } catch (err) {
    console.error('Failed to load comments', err)
  } finally {
    loading.value = false
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) return
  
  submitting.value = true
  try {
    await commentApi.create(props.taskId, newComment.value)
    newComment.value = ''
    await fetchComments()
  } catch (err) {
    alert('Lỗi gửi bình luận: ' + (err.response?.data?.message || err.message))
  } finally {
    submitting.value = false
  }
}

onMounted(fetchComments)
watch(() => props.taskId, fetchComments)
</script>