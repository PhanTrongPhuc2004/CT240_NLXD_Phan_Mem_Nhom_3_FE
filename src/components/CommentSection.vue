<script setup>
import { ref, onMounted, computed } from 'vue';
import { commentApi } from '@/api/commentApi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const props = defineProps({
  taskId: { type: String, required: true }
});

const fileInput = ref(null);
const comments = ref([]);
const newCommentContent = ref('');
const isLoading = ref(false);
const notifyAssignee = ref(true);
const postAs = ref('Bình luận');
const attachedFiles = ref([]);

// Logic cho nút "Xem thêm"
const isExpanded = ref(false);
const displayedComments = computed(() => {
  if (isExpanded.value) return comments.value;
  return comments.value.slice(0, 3); // Mặc định chỉ hiện 3 bình luận đầu
});

const triggerChooseFile = () => {
  fileInput.value.click();
};

const onFileChange = (event) => {
  const files = Array.from(event.target.files);
  const newFiles = files.map(file => ({
    id: Math.random().toString(36).substr(2, 9),
    name: file.name,
    size: (file.size / 1024).toFixed(1) + ' KB',
    icon: getFileIcon(file.name),
    raw: file
  }));
  attachedFiles.value = [...attachedFiles.value, ...newFiles];
  event.target.value = '';
};

const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'mdi-file-image';
  if (ext === 'pdf') return 'mdi-file-pdf-box';
  if (['doc', 'docx'].includes(ext)) return 'mdi-file-word';
  return 'mdi-file-document-outline';
};

const removeFile = (id) => {
  attachedFiles.value = attachedFiles.value.filter(file => file.id !== id);
};

const fetchComments = async () => {
  try {
    const response = await commentApi.getCommentsByTask(props.taskId);
    comments.value = response.data;
  } catch (error) {
    console.error("Lỗi khi tải bình luận:", error);
  }
};

const handleSendComment = async () => {
  if (!newCommentContent.value.trim() && attachedFiles.value.length === 0) return;
  try {
    isLoading.value = true;
    const filesToUpload = attachedFiles.value.map(f => f.raw);
    await commentApi.addComment(props.taskId, newCommentContent.value, filesToUpload);
    newCommentContent.value = '';
    attachedFiles.value = [];
    await fetchComments();
  } catch (error) {
    alert(error.response?.data || "Có lỗi xảy ra khi gửi file");
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchComments);
</script>

<template>
  <v-card class="comment-section mx-auto mt-6" elevation="0" border>
    <v-card-title class="pt-4 pb-3 px-6 font-weight-bold text-h6 border-b">
      Thêm bình luận vào công việc
    </v-card-title>

    <v-card-text class="pt-4 px-6 pb-2">
      <div class="comment-input-box mb-4 rounded border">
        <div class="toolbar d-flex align-center px-3 py-1 border-b">
          <v-btn icon="mdi-format-bold" variant="text" density="compact" color="grey-darken-1" class="mr-1"></v-btn>
          <v-btn icon="mdi-format-italic" variant="text" density="compact" color="grey-darken-1" class="mr-1"></v-btn>
          <v-btn icon="mdi-link" variant="text" density="compact" color="grey-darken-1" class="mr-1"></v-btn>
          <v-btn icon="mdi-format-list-bulleted" variant="text" density="compact" color="grey-darken-1" class="mr-1"></v-btn>
          <v-btn icon="mdi-code-tags" variant="text" density="compact" color="grey-darken-1"></v-btn>
        </div>

        <v-textarea
          v-model="newCommentContent"
          placeholder="Viết bình luận của bạn..."
          variant="plain"
          auto-grow
          rows="3"
          hide-details
          class="px-4 py-2 custom-textarea"
        ></v-textarea>

        <div v-if="attachedFiles.length > 0" class="attachments d-flex flex-wrap gap-3 px-4 pb-3 mt-2">
          <v-chip
            v-for="file in attachedFiles"
            :key="file.id"
            closable
            size="small"
            variant="text"
            class="px-1 border"
            @click:close="removeFile(file.id)"
          >
            <v-icon start size="small" color="grey-darken-3">{{ file.icon }}</v-icon>
            <span class="text-body-2 text-grey-darken-3">{{ file.name }}</span>
            <span class="text-caption text-grey ml-1">({{ file.size }})</span>
          </v-chip>
        </div>
      </div>

      <div class="d-flex flex-column flex-md-row justify-space-between align-md-center gap-3 mb-6">
        <div class="d-flex flex-wrap align-center gap-4 text-body-2 text-grey-darken-2 font-weight-medium">
          <div @click="triggerChooseFile" class="cursor-pointer d-flex align-center text-grey-darken-1 hover-black">
            <v-icon size="small" class="mr-1">mdi-paperclip</v-icon> Đính kèm file
          </div>
          <input type="file" ref="fileInput" style="display: none" multiple @change="onFileChange" />
          <v-checkbox v-model="notifyAssignee" label="Thông báo cho người được gán" hide-details density="compact" color="grey-darken-2" class="custom-checkbox"></v-checkbox>
          <div class="d-flex align-center">
            <span class="mr-2">Đăng dưới dạng:</span>
            <v-select v-model="postAs" :items="['Bình luận']" variant="outlined" density="compact" hide-details width="130px" class="custom-select"></v-select>
          </div>
        </div>

        <div class="d-flex align-center gap-3">
          <v-btn variant="text" color="grey-darken-1" class="text-none font-weight-medium" @click="newCommentContent = ''; attachedFiles = []">Hủy</v-btn>
          <v-btn
            color="grey-lighten-2"
            variant="flat"
            class="text-none px-6 font-weight-medium rounded-pill text-grey-darken-2"
            :disabled="isLoading || (!newCommentContent && attachedFiles.length === 0)"
            @click="handleSendComment"
            elevation="0"
          >
            Gửi
            <template v-slot:loader>
              <v-progress-circular indeterminate size="16"></v-progress-circular>
            </template>
          </v-btn>
        </div>
      </div>

      <v-divider></v-divider>

      <div class="recent-comments pt-5">
        <h3 class="text-subtitle-1 font-weight-bold mb-4">Bình luận gần đây</h3>
        <div v-if="comments.length === 0" class="text-grey mb-4 text-body-2">Chưa có bình luận nào.</div>
        
        <div v-for="comment in displayedComments" :key="comment.id" class="comment-item d-flex gap-3 mb-5">
          <v-avatar color="grey-darken-1" size="40" class="mt-1">
            <span class="text-white font-weight-medium">{{ comment.userName?.charAt(0).toUpperCase() || 'U' }}</span>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="d-flex align-center mb-1">
              <span class="font-weight-bold text-body-2 text-grey-darken-4 mr-2">{{ comment.userName || 'Người dùng ẩn danh' }}</span>
              <span class="text-caption text-grey-darken-1">
                {{ comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi }) : '' }}
              </span>
            </div>
            <p class="mb-0 text-grey-darken-3 text-body-2 text-pre-wrap">{{ comment.content }}</p>
          </div>
        </div>

        <div v-if="comments.length > 3" class="mt-2">
          <v-btn
            variant="text"
            size="small"
            color="grey-darken-2"
            class="text-none px-0"
            @click="isExpanded = !isExpanded"
          >
            {{ isExpanded ? 'Thu gọn' : 'Xem thêm' }}
            <v-icon end size="small">{{ isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.cursor-pointer { cursor: pointer; }
.hover-black:hover { color: #212121 !important; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.text-pre-wrap { white-space: pre-wrap; }
</style>