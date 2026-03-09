<template>
  <v-card class="mt-4" variant="outlined">
    <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
      <v-icon start size="small" color="grey">mdi-comment-text-multiple</v-icon>
      Thảo luận
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <!-- Danh sách bình luận -->
      <div v-if="comments.length === 0" class="text-center text-grey py-4">
        Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
      </div>
      <v-list v-else class="pa-0" density="compact">
        <v-list-item v-for="comment in comments" :key="comment.id" class="px-0 mb-2">
          <template v-slot:prepend>
            <v-avatar color="grey-lighten-3" size="32">
              <span class="text-caption font-weight-bold text-grey-darken-3">
                {{ getInitials(comment.userName) }}
              </span>
            </v-avatar>
          </template>
          <v-list-item-title class="text-body-2 font-weight-bold">
            {{ comment.userName }}
            <span class="text-caption text-grey ml-2">{{ formatDate(comment.createdAt) }}</span>
          </v-list-item-title>
          <v-list-item-subtitle class="text-body-1 text-high-emphasis mt-1" style="white-space: pre-wrap;">
            {{ comment.content }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <!-- Form bình luận -->
      <div class="d-flex align-start mt-4 gap-2">
        <v-avatar color="primary" size="32" class="mt-1">
          <span class="text-white text-caption">ME</span>
        </v-avatar>
        <v-textarea
          v-model="newComment"
          placeholder="Viết bình luận..."
          variant="outlined"
          rows="1"
          auto-grow
          hide-details
          density="comfortable"
          bg-color="grey-lighten-5"
        >
          <template v-slot:append-inner>
            <v-btn
              icon="mdi-send"
              variant="text"
              size="small"
              color="primary"
              :disabled="!newComment.trim()"
              @click="submitComment"
            ></v-btn>
          </template>
        </v-textarea>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  taskId: { type: String, required: true }
});

const comments = ref([]);
const newComment = ref('');

const getInitials = (name) => name ? name.charAt(0).toUpperCase() : '?';
const formatDate = (date) => new Date(date).toLocaleString('vi-VN');

const submitComment = () => {
  if (!newComment.value.trim()) return;
  // Mock comment
  comments.value.push({ id: Date.now(), userName: 'Bạn', content: newComment.value, createdAt: new Date().toISOString() });
  newComment.value = '';
};
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
.hover-black:hover { color: #212121 !important; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.text-pre-wrap { white-space: pre-wrap; }
</style>
