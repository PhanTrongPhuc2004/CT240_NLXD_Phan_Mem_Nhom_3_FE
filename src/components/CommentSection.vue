<script setup>
import { ref, onMounted, computed } from 'vue';
import { commentApi } from '@/api/commentApi'; 
import { useAuthStore } from '@/stores/auth';
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

// ==========================================
// THÔNG TIN CHUNG & LOCAL STORAGE
// ==========================================
const props = defineProps({
  taskId: { type: String, required: true }
});

const authStore = useAuthStore();
// Tạo biến lưu thông tin user đang đăng nhập
const currentUserId = ref('');
const currentUserName = ref('');

// Helper format thời gian (thay thế date-fns để tránh lỗi thiếu package)
const formatTimeAgo = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'vừa xong';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

onMounted(() => {
  // Tự động lấy ID và Tên từ Local Storage theo đúng như ảnh bạn gửi
  if (authStore.user) {
    currentUserId.value = authStore.user.id;
    currentUserName.value = authStore.user.fullName || authStore.user.username;
  } else {
    currentUserId.value = localStorage.getItem('userId') || '';
    currentUserName.value = localStorage.getItem('username') || '';
  }
  
  fetchComments(); 
});


// [CHỨC NĂNG 24] - THÊM BÌNH LUẬN
// ==========================================
const fileInput = ref(null);
const newCommentContent = ref('');
const isLoading = ref(false);
const notifyAssignee = ref(true);
const postAs = ref('Bình luận');
const attachedFiles = ref([]);

const editorOptions = {
  modules: {
    toolbar: [
      ['bold', 'italic'],
      ['link'],
      [{ list: 'bullet' }],
      ['code-block']
    ]
  }
}

const triggerChooseFile = () => fileInput.value.click();

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

const handleSendComment = async () => {
  if (!newCommentContent.value.trim() && attachedFiles.value.length === 0) return;

  if (!currentUserId.value) {
    alert("Lỗi: Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
    return;
  }

  try {
    isLoading.value = true;
    const filesToUpload = attachedFiles.value.map(f => f.raw);
    
    console.log("Đang gửi bình luận:", { taskId: props.taskId, content: newCommentContent.value, userId: currentUserId.value, files: filesToUpload });

    // Gọi API kèm ID thật của user từ Local Storage
    await commentApi.addComment(props.taskId, newCommentContent.value, filesToUpload, currentUserId.value);
    
    newCommentContent.value = '';
    attachedFiles.value = [];
    
    await fetchComments();
} catch (error) {
  console.log("FULL ERROR:", error.response);
  alert(JSON.stringify(error.response?.data));
} finally {
  isLoading.value = false;
}
};


// ==========================================
// [CHỨC NĂNG 25] - XEM DANH SÁCH BÌNH LUẬN
// ==========================================
const comments = ref([]); 
const currentFilter = ref('all'); 
const searchQuery = ref(''); 
const visibleCount = ref(4); 

const fetchComments = async () => {
  try {
    const response = await commentApi.getCommentsByTask(props.taskId);
    comments.value = response.data;
  } catch (error) {
    console.error("Lỗi khi tải bình luận:", error);
  }
};

const filteredComments = computed(() => {
  let result = comments.value;

  if (currentFilter.value === 'mine') {
    result = result.filter(c => c.userId === currentUserId.value);
  } else if (currentFilter.value === 'mentions') {
    result = result.filter(c => c.content.includes('@'));
  } else if (currentFilter.value === 'files') {
    result = result.filter(c => c.attachmentUrls && c.attachmentUrls.length > 0);
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(c => 
      c.content.toLowerCase().includes(query) || 
      (c.userName && c.userName.toLowerCase().includes(query))
    );
  }

  return result;
});

const displayedComments = computed(() => {
  return filteredComments.value.slice(0, visibleCount.value);
});

const hasMoreComments = computed(() => {
  return visibleCount.value < filteredComments.value.length;
});

const loadMore = () => {
  visibleCount.value += 4; 
};


// ==========================================
// [CHỨC NĂNG 26] - SỬA / XÓA BÌNH LUẬN
// ==========================================
const editingCommentId = ref(null);
const editContent = ref('');
const isUpdating = ref(false);

const startEdit = (comment) => {
  editingCommentId.value = comment.id;
  editContent.value = comment.content;
};

const cancelEdit = () => {
  editingCommentId.value = null;
  editContent.value = '';
};

const saveEdit = async (commentId) => {
  const originalComment = comments.value.find(c => c.id === commentId);
  if (!editContent.value.trim() || editContent.value === originalComment?.content) {
    cancelEdit();
    return;
  }
  
  try {
    isUpdating.value = true;
    await commentApi.updateComment(commentId, editContent.value, currentUserId.value);
    await fetchComments(); 
    cancelEdit();
  } catch (error) {
    alert("Có lỗi xảy ra khi cập nhật bình luận.");
    console.error(error);
  } finally {
    isUpdating.value = false;
  }
};

const deleteComment = async (commentId) => {
  if (confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
    try {
      await commentApi.deleteComment(commentId, currentUserId.value);
      await fetchComments(); 
    } catch (error) {
      alert("Có lỗi xảy ra khi xóa bình luận.");
      console.error(error);
    }
  }
};
</script>


<template>
  <v-card class="comment-section mx-auto mt-6" elevation="0" border>
    
    <v-card-title class="pt-4 pb-3 px-6 font-weight-bold text-h6 border-b">
      Thêm bình luận vào công việc
    </v-card-title>

    <v-card-text class="pt-4 px-6 pb-2">
      <div class="comment-input-box mb-4 rounded border">
        
      <QuillEditor
  v-model:content="newCommentContent"
  placeholder="Viết bình luận của bạn..."
  contentType="html"
  theme="snow"
  :options="editorOptions"
  style="height:120px"
/>

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

      <v-divider class="my-6"></v-divider>

      <div class="d-flex flex-wrap align-center justify-space-between mb-6 gap-3">
        <div class="d-flex align-center">
          <v-icon size="24" color="grey-darken-3" class="mr-2">mdi-comment-text-outline</v-icon>
          <span class="text-h6 font-weight-bold">{{ filteredComments.length }} bình luận</span>
        </div>
        
        <div class="d-flex align-center gap-4 flex-wrap">
          <div class="filter-group d-flex align-center border rounded px-1 py-1">
            <button class="filter-btn" :class="{ active: currentFilter === 'all' }" @click="currentFilter = 'all'">
              Tất cả
            </button>
            <button class="filter-btn" :class="{ active: currentFilter === 'mine' }" @click="currentFilter = 'mine'">
              <v-icon size="16" class="mr-1">mdi-account-outline</v-icon> Chỉ tôi
            </button>
            <button class="filter-btn" :class="{ active: currentFilter === 'mentions' }" @click="currentFilter = 'mentions'">
              <span class="font-weight-bold mr-1">@</span> Chỉ mentions
            </button>
            <button class="filter-btn" :class="{ active: currentFilter === 'files' }" @click="currentFilter = 'files'">
              <v-icon size="16" class="mr-1">mdi-paperclip</v-icon> Có file
            </button>
          </div>

          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            placeholder="Tìm kiếm bình luận..."
            variant="outlined"
            density="compact"
            hide-details
            class="search-input"
          ></v-text-field>
        </div>
      </div>

      <div class="comments-list">
        <div v-if="comments.length === 0" class="text-grey mb-4 text-body-2 text-center py-4">Chưa có bình luận nào.</div>
        <div v-else-if="displayedComments.length === 0" class="text-grey mb-4 text-body-2 text-center py-4">Không tìm thấy bình luận phù hợp.</div>
        
        <div v-for="comment in displayedComments" :key="comment.id" class="comment-wrapper d-flex gap-4 mb-6">
          <v-avatar color="grey-lighten-1" size="40" class="mt-1">
            <v-icon v-if="comment.userId === currentUserId" color="white" size="24">mdi-account</v-icon>
            <span v-else class="text-white font-weight-medium">{{ comment.userName?.charAt(0).toUpperCase() || 'U' }}</span>
          </v-avatar>
          
          <div class="flex-grow-1">
            <div class="d-flex align-center flex-wrap mb-2 gap-2">
              <span class="font-weight-bold text-body-2 text-grey-darken-4">
                {{ comment.userId === currentUserId ? 'Bạn' : (comment.userName || 'Người dùng không xác định') }}
              </span>
              
              <v-chip 
                v-if="comment.userId !== currentUserId" 
                size="x-small" 
                color="blue-grey-darken-3" 
                variant="flat" 
                class="px-2 font-weight-medium text-caption"
              >
                Thành viên
              </v-chip>

              <span class="text-caption text-grey-darken-1">
                • <v-icon size="12" class="mr-1 mb-1">mdi-clock-outline</v-icon>
                {{ formatTimeAgo(comment.createdAt) }}
              </span>
            </div>

            <p v-if="comment.deleted || comment.isDeleted" class="mb-3 text-grey font-italic text-body-2 text-pre-wrap">
              Bình luận này đã bị xóa.
            </p>

            <template v-else>
              <div v-if="editingCommentId === comment.id" class="mb-3">
                <v-textarea
                  v-model="editContent"
                  variant="outlined"
                  density="compact"
                  auto-grow
                  rows="2"
                  hide-details
                  autofocus
                  class="bg-white mb-2"
                ></v-textarea>
                <div class="d-flex gap-2">
                  <v-btn color="primary" size="small" elevation="0" @click="saveEdit(comment.id)" :loading="isUpdating">
                    Lưu
                  </v-btn>
                  <v-btn variant="text" size="small" color="grey-darken-1" @click="cancelEdit">
                    Hủy
                  </v-btn>
                </div>
              </div>

              <div v-else>
                <p class="mb-3 text-grey-darken-4 text-body-2 text-pre-wrap line-height-1-5">
                   <span v-html="comment.content"></span>
                  <span v-if="comment.edited" class="text-caption text-grey ml-1 font-italic">(Đã chỉnh sửa)</span>
                </p>

                <div v-if="comment.attachmentUrls && comment.attachmentUrls.length > 0" class="attachments-display mb-3">
                  <div v-for="(url, index) in comment.attachmentUrls" :key="index" class="attachment-card d-flex align-center border rounded pa-3 mb-2">
                    <v-avatar rounded size="40" color="grey-lighten-4" class="mr-3">
                      <v-icon color="grey-darken-1">mdi-file-document-outline</v-icon>
                    </v-avatar>
                    <div class="flex-grow-1">
                      <div class="text-body-2 font-weight-medium text-grey-darken-4 text-truncate" style="max-width: 250px;">Tài_liệu_đính_kèm_{{index + 1}}.pdf</div>
                      <div class="text-caption text-grey">1.2 MB</div>
                    </div>
                    <v-btn icon="mdi-download" variant="text" size="small" color="grey-darken-1"></v-btn>
                  </div>
                </div>

                <div class="action-buttons d-flex align-center gap-4 mt-2">
                  <button class="action-btn text-grey-darken-2">
                    <v-icon size="16" class="mr-1">mdi-reply</v-icon> Trả lời
                  </button>
                  
                  <template v-if="comment.userId === currentUserId">
                    <button class="action-btn text-grey-darken-2" @click="startEdit(comment)">
                      <v-icon size="16" class="mr-1">mdi-pencil-outline</v-icon> Sửa
                    </button>
                    <button class="action-btn text-grey-darken-2" @click="deleteComment(comment.id)">
                      <v-icon size="16" class="mr-1">mdi-trash-can-outline</v-icon> Xóa
                    </button>
                  </template>
                </div>
              </div>
            </template>
          </div>
        </div>

        <div v-if="hasMoreComments" class="text-center mt-6">
          <v-btn 
            variant="tonal" 
            color="grey-darken-1" 
            class="text-none font-weight-medium rounded-pill px-6 bg-grey-lighten-4"
            elevation="0"
            @click="loadMore"
          >
            Xem thêm bình luận
            <v-icon end>mdi-chevron-down</v-icon>
          </v-btn>
        </div>
      </div>
      
    </v-card-text>
  </v-card>
</template>

<style scoped>
.cursor-pointer { cursor: pointer; }
.hover-black:hover { color: #212121 !important; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.text-pre-wrap { white-space: pre-wrap; }
.line-height-1-5 { line-height: 1.5; }

.filter-group {
  background-color: white;
  border-color: #e0e0e0 !important;
}

.filter-btn {
  background: transparent;
  border: none;
  padding: 6px 16px;
  font-size: 13px;
  color: #616161;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  font-weight: 500;
}

.filter-btn:hover { background-color: #f5f5f5; }

.filter-btn.active {
  background-color: #f0f0f0;
  color: #212121;
  font-weight: 600;
}

.search-input { max-width: 260px; }

.comment-wrapper { position: relative; }

.attachment-card {
  background-color: #ffffff;
  border-color: #eeeeee !important;
  max-width: 400px;
  transition: border-color 0.2s ease;
}
.attachment-card:hover { border-color: #bdbdbd !important; }

.action-btn {
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
}
.action-btn:hover { color: #212121 !important; }
.action-btn:last-child:hover { color: #d32f2f !important; }
</style>