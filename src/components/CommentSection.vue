<script setup>
import { ref, onMounted, computed } from 'vue';
import { commentApi } from '@/api/commentApi'; 
import { useAuthStore } from '@/stores/auth';
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import ProtectedFile from './ProtectedFile.vue';

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

// lấy tên file (đã tự động cắt bỏ ID/UUID của Backend)
const getFileNameFromUrl = (url) => {
  if (!url) return 'File đính kèm';
  
  // Lấy tên file lưu trên server (vd: 360d384a_Nguyen_Hoang.pdf)
  const storedFileName = url.split('/').pop(); 
  
  // Tìm vị trí dấu gạch dưới "_" đầu tiên
  const splitIndex = storedFileName.indexOf('_');
  
  // Nếu không có dấu "_" thì trả về tên gốc, nếu có thì cắt bỏ phần trước "_"
  if (splitIndex === -1) {
    return decodeURIComponent(storedFileName);
  }
  return decodeURIComponent(storedFileName.substring(splitIndex + 1));
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
const replyingToId = ref(null); // Lưu ID của bình luận cha
const replyingToName = ref(''); // Lưu tên người đang được trả lời để hiển thị UI
const quillRef = ref(null);


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
    await commentApi.addComment(props.taskId, newCommentContent.value, filesToUpload, currentUserId.value, replyingToId.value);
    
    newCommentContent.value = '';
    attachedFiles.value = [];

    //reset trạng thái trả lời 
    cancelReply();
    //xóa nội dung hiển thị
 if (quillRef.value) {
 quillRef.value.setHTML('<p><br></p>'); 
 }


    
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

//  Lấy danh sách GỐC (Chỉ những bình luận không có parentId)
const allRootComments = computed(() => {
  return filteredComments.value.filter(c => !c.parentId);
});

// Thay thế displayedComments cũ: Chỉ lấy số lượng Cha cần hiển thị
const rootComments = computed(() => {
  return allRootComments.value.slice(0, visibleCount.value);
});

// Cập nhật lại logic nút "Xem thêm": Tính dựa trên tổng số bình luận Cha
const hasMoreComments = computed(() => {
  return visibleCount.value < allRootComments.value.length;
});

// Hàm loadMore giữ nguyên hoặc tăng số lượng tùy bạn
const loadMore = () => {
  visibleCount.value += 4; 
};

// Lấy danh sách reply theo parentId
const getReplies = (parentId) => {
  return comments.value.filter(c => c.parentId === parentId);
};

// ==========================================
// HÀM XỬ LÝ KHI BẤM NÚT "TRẢ LỜI"
// ==========================================
const handleReply = (comment) => {
  // Lưu ID cha
  replyingToId.value = comment.id;
  replyingToName.value = comment.userId === currentUserId.value ? 'Bạn' : (comment.userName || 'Người dùng');

  // Cuộn xuống ô nhập liệu
  const editorElement = document.getElementById('comment-editor');
  if (editorElement) {
    editorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Focus vào editor
  if (quillRef.value) {
    quillRef.value.focus();
  }
};

// Hàm để hủy trạng thái trả lời (nếu người dùng đổi ý)
const cancelReply = () => {
  replyingToId.value = null;
  replyingToName.value = '';
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
      <div id="comment-editor" class="comment-input-box mb-4 rounded border">
        
      <QuillEditor
  ref="quillRef"
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
<v-btn variant="text" color="grey-darken-1" class="text-none font-weight-medium" @click="newCommentContent = ''; attachedFiles = []; cancelReply(); if(quillRef) quillRef.setHTML('<p><br></p>');">Hủy</v-btn>          <v-btn
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
<div v-else-if="rootComments.length === 0" class="text-grey mb-4 text-body-2 text-center py-4">
  Không tìm thấy bình luận phù hợp.
</div>  
  <div v-for="comment in rootComments" :key="comment.id" class="comment-group mb-8">
    
    <div class="comment-wrapper d-flex gap-4">
      <v-avatar color="grey-lighten-1" size="40" class="mt-1">
        <v-icon v-if="comment.userId === currentUserId" color="white" size="24">mdi-account</v-icon>
        <span v-else class="text-white font-weight-medium">{{ comment.userName?.charAt(0).toUpperCase() || 'U' }}</span>
      </v-avatar>

      <div class="flex-grow-1">
        <div class="d-flex align-center flex-wrap mb-2 gap-2">
          <span class="font-weight-bold text-body-2 text-grey-darken-4">
            {{ comment.userId === currentUserId ? 'Bạn' : (comment.userName || 'Người dùng') }}
          </span>
          <v-chip v-if="comment.userId !== currentUserId" size="x-small" color="blue-grey-darken-3" variant="flat" class="px-2">Thành viên</v-chip>
          <span class="text-caption text-grey-darken-1">• {{ formatTimeAgo(comment.createdAt) }}</span>
        </div>

        <div v-if="editingCommentId === comment.id" class="mb-3">
          <v-textarea v-model="editContent" variant="outlined" density="compact" auto-grow rows="2" hide-details class="bg-white mb-2"></v-textarea>
          <div class="d-flex gap-2">
            <v-btn color="primary" size="small" @click="saveEdit(comment.id)" :loading="isUpdating">Lưu</v-btn>
            <v-btn variant="text" size="small" @click="cancelEdit">Hủy</v-btn>
          </div>
        </div>
        <div v-else>
          <p class="mb-2 text-grey-darken-4 text-body-2 text-pre-wrap"><span v-html="comment.content"></span></p>
          
          <div v-if="comment.attachmentUrls?.length > 0" class="pa-3 border rounded bg-grey-lighten-5 mb-2">
            <div v-for="(url, idx) in comment.attachmentUrls" :key="idx" class="d-flex align-center justify-space-between mb-1">
              <span class="text-caption text-truncate" style="max-width: 250px;">{{ getFileNameFromUrl(url) }}</span>
              <ProtectedFile :url="'http://localhost:8080' + url" />
            </div>
          </div>

          <div class="action-buttons d-flex gap-4">
            <button class="action-btn" @click="handleReply(comment)"><v-icon size="14">mdi-reply</v-icon> Trả lời</button>
            <template v-if="comment.userId === currentUserId">
              <button class="action-btn" @click="startEdit(comment)">Sửa</button>
              <button class="action-btn" @click="deleteComment(comment.id)">Xóa</button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div v-if="getReplies(comment.id).length > 0" class="replies-container">
      <div v-for="reply in getReplies(comment.id)" :key="reply.id" class="reply-item d-flex gap-3 mt-4">
        <v-avatar color="blue-grey-lighten-5" size="32">
          <span class="text-caption font-weight-bold">{{ reply.userName?.charAt(0).toUpperCase() }}</span>
        </v-avatar>
        <div class="flex-grow-1">
         <div class="d-flex align-center gap-2 mb-1">
            <span class="font-weight-bold text-caption">{{ reply.userId === currentUserId ? 'Bạn' : reply.userName }}</span>
            <span class="text-caption text-grey">{{ formatTimeAgo(reply.createdAt) }}</span>
          </div>
          
          <div v-html="reply.content" class="text-body-2 text-grey-darken-4"></div>
          
          <div v-if="reply.attachmentUrls?.length > 0" class="pa-3 border rounded bg-grey-lighten-5 mb-2 mt-2">
            <div v-for="(url, idx) in reply.attachmentUrls" :key="idx" class="d-flex align-center justify-space-between mb-1">
              <span class="text-caption text-truncate" style="max-width: 250px;">{{ getFileNameFromUrl(url) }}</span>
              <ProtectedFile :url="'http://localhost:8080' + url" />
            </div>
          </div>
          </div>
      </div>
    </div>
  </div>

  <div v-if="hasMoreComments" class="text-center mt-6">
    <v-btn variant="tonal" color="grey-darken-1" class="rounded-pill px-6" @click="loadMore">
      Xem thêm bình luận <v-icon end>mdi-chevron-down</v-icon>
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

/* ---ĐOẠN NÀY ĐỂ HIỆN PHÂN CẤP --- */
.replies-container {
  margin-left: 55px; /* Đẩy bình luận con sang phải */
  border-left: 2px solid #EEEEEE; /* Tạo đường kẻ dọc màu xám nhạt */
  padding-left: 16px; /* Khoảng cách giữa đường kẻ và nội dung con */
  margin-top: 10px;
}

.reply-item {
  position: relative;
  padding-bottom: 8px;
}

/* Tùy chỉnh hiệu ứng cho nút hành động nhỏ lại xíu cho tinh tế */
.action-btn {
  font-size: 12px !important;
  color: #757575;
}

.action-btn:hover {
  color: #1976D2 !important; /* Đổi màu xanh khi hover nút trả lời */
}
</style>