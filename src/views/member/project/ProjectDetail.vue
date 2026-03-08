<template>
  <v-container fluid class="fill-height align-start pa-0">
    <!-- Loading State -->
    <v-row v-if="loading" class="fill-height" justify="center" align="center">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </v-row>

    <!-- Error State -->
    <v-row v-else-if="error" class="fill-height" justify="center" align="center">
      <v-alert type="error" title="Lỗi" :text="error" variant="tonal" class="ma-4"></v-alert>
    </v-row>

    <!-- Content -->
    <div v-else class="w-100">
      <!-- Header Dự án -->
      <v-card flat color="grey-lighten-4" class="px-6 py-4 rounded-0 border-b">
        <div class="d-flex align-center justify-space-between">
          <div>
            <div class="d-flex align-center mb-2">
              <h1 class="text-h4 font-weight-bold text-primary mr-4">{{ project?.name || 'Tạo dự án mới' }}</h1>
              <v-chip v-if="project?.status" :color="getStatusColor(project?.status)" label size="small"
                class="font-weight-bold">
                {{ project?.status }}
              </v-chip>
            </div>
            <p class="text-body-1 text-grey-darken-1" style="max-width: 800px;">
              {{ project?.description || 'Nhập mô tả cho dự án mới của bạn.' }}
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="d-flex gap-2">
            <v-btn v-if="isOwner && !isNewProject" prepend-icon="mdi-cog" variant="outlined" color="primary"
              @click="activeTab = 'settings'">
              Cài đặt
            </v-btn>
            <v-btn v-if="isMember && !isOwner && !isNewProject" prepend-icon="mdi-logout" variant="outlined"
              color="error" @click="handleLeaveProject">
              Rời dự án
            </v-btn>
            <!-- Nút Hủy yêu cầu cho người đang chờ duyệt -->
            <v-btn v-if="isPending && !isNewProject" prepend-icon="mdi-close-circle" variant="outlined" color="warning"
              @click="handleCancelRequest">
              Hủy yêu cầu
            </v-btn>
            <!-- Nút Xin tham gia cho người chưa tham gia -->
            <v-btn v-if="!isMember && !isOwner && !isPending && !isNewProject" prepend-icon="mdi-login"
              variant="elevated" color="primary" @click="handleJoinProject">
              Xin tham gia
            </v-btn>
          </div>
        </div>

        <!-- Thống kê nhanh -->
        <div v-if="!isNewProject" class="d-flex mt-6 gap-6">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="32" class="mr-2">
              <v-icon size="18" color="white">mdi-account-group</v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-grey">Thành viên</div>
              <div class="font-weight-bold">{{ project?.memberIds?.length || 0 }}</div>
            </div>
          </div>
          <div class="d-flex align-center ml-6">
            <v-avatar color="success" size="32" class="mr-2">
              <v-icon size="18" color="white">mdi-check-circle</v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-grey">Hoàn thành</div>
              <div class="font-weight-bold">0/0 Task</div> <!-- TODO: Bind real data -->
            </div>
          </div>
          <div class="d-flex align-center ml-6">
            <v-avatar color="warning" size="32" class="mr-2">
              <v-icon size="18" color="white">mdi-clock-outline</v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-grey">Hạn chót</div>
              <div class="font-weight-bold">--/--/----</div> <!-- TODO: Bind real data -->
            </div>
          </div>
        </div>
      </v-card>

      <!-- Tabs Navigation -->
      <v-tabs v-model="activeTab" color="primary" bg-color="white" class="border-b px-6">
        <v-tab value="overview">Tổng quan</v-tab>
        <v-tab value="tasks" v-if="isMember || isOwner">Công việc</v-tab>
        <v-tab value="members">Thành viên</v-tab>
        <v-tab value="settings" v-if="isOwner">Cài đặt</v-tab>
      </v-tabs>

      <!-- Tab Content -->
      <v-container fluid class="pa-6 bg-grey-lighten-5 min-h-screen">
        <v-window v-model="activeTab">

          <!-- TAB 1: TỔNG QUAN -->
          <v-window-item value="overview">
            <v-row>
              <v-col cols="12" md="8">
                <v-card class="pa-4 h-100" elevation="1">
                  <v-card-title>Tiến độ dự án</v-card-title>
                  <v-card-text class="d-flex flex-column align-center justify-center" style="min-height: 300px;">
                    <v-progress-circular :model-value="0" :size="150" :width="15" color="primary">
                      <span class="text-h5 font-weight-bold">0%</span>
                    </v-progress-circular>
                    <p class="mt-4 text-grey">Chưa có dữ liệu task để tính toán tiến độ.</p>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card class="pa-4 h-100" elevation="1">
                  <v-card-title>Hoạt động gần đây</v-card-title>
                  <v-list lines="two">
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-avatar color="blue-lighten-4" size="32">
                          <v-icon size="16" color="blue">mdi-plus</v-icon>
                        </v-avatar>
                      </template>
                      <v-list-item-title class="text-body-2">Dự án được tạo</v-list-item-title>
                      <v-list-item-subtitle class="text-caption">
                        {{ new Date(project?.createdAt).toLocaleDateString('vi-VN') }}
                      </v-list-item-subtitle>
                    </v-list-item>
                    <!-- TODO: List activity log -->
                  </v-list>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- TAB 2: CÔNG VIỆC (TASKS) -->
          <v-window-item value="tasks" v-if="isMember || isOwner">
            <v-card class="pa-4" elevation="1">
              <div class="d-flex justify-space-between align-center mb-4">
                <h3 class="text-h6">Danh sách công việc</h3>
                <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateTaskDialog">
                  Thêm công việc
                </v-btn>
              </div>

              <!-- Placeholder cho Task List -->
              <v-sheet border rounded class="d-flex flex-column align-center justify-center pa-10 bg-grey-lighten-4">
                <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-clipboard-list-outline</v-icon>
                <h3 class="text-h6 text-grey-darken-1">Chưa có công việc nào</h3>
                <p class="text-body-2 text-grey mb-6">Bắt đầu bằng cách tạo công việc đầu tiên cho dự án này.</p>
                <v-btn color="primary" variant="flat" @click="openCreateTaskDialog">
                  Tạo công việc ngay
                </v-btn>
              </v-sheet>
            </v-card>
          </v-window-item>

          <!-- TAB 3: THÀNH VIÊN -->
          <v-window-item value="members">
            <!-- SECTION: YÊU CẦU THAM GIA (Chỉ hiện cho Owner/Manager) -->
            <v-card v-if="(isOwner || isManager) && project?.pendingMemberIds?.length > 0"
              class="pa-4 mb-6 border-warning" elevation="1" variant="outlined" color="orange-lighten-5">
              <div class="d-flex align-center mb-2">
                <v-icon color="warning" class="mr-2">mdi-account-clock</v-icon>
                <h3 class="text-h6 text-warning-darken-2">Yêu cầu tham gia ({{ project.pendingMemberIds.length }})</h3>
              </div>

              <v-list bg-color="transparent">
                <v-list-item v-for="userId in project.pendingMemberIds" :key="userId"
                  class="mb-2 rounded border bg-white">
                  <template v-slot:prepend>
                    <UserAvatarName :user-id="userId" />
                  </template>

                  <template v-slot:append>
                    <div class="d-flex gap-2">
                      <v-btn size="small" color="success" prepend-icon="mdi-check" @click="approveJoin(userId)">
                        Duyệt
                      </v-btn>
                      <v-btn size="small" color="error" variant="outlined" prepend-icon="mdi-close"
                        @click="rejectJoin(userId)">
                        Từ chối
                      </v-btn>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>

            <!-- SECTION: DANH SÁCH THÀNH VIÊN -->
            <v-card class="pa-4" elevation="1">
              <div class="d-flex justify-space-between align-center mb-4">
                <h3 class="text-h6">Thành viên dự án ({{ project?.memberIds?.length || 0 }})</h3>
                <v-btn v-if="isOwner || isManager" color="primary" prepend-icon="mdi-account-plus"
                  @click="dialogAddMember = true">
                  Thêm thành viên
                </v-btn>
              </div>

              <v-list>
                <!-- Owner -->
                <v-list-item class="mb-2 rounded border">
                  <template v-slot:prepend>
                    <UserAvatarName :user-id="project?.ownerId" />
                  </template>
                  <template v-slot:append>
                    <v-chip color="purple" size="small" label>Owner</v-chip>
                  </template>
                </v-list-item>

                <!-- Managers -->
                <v-list-item v-for="managerId in project?.managerIds" :key="managerId" class="mb-2 rounded border">
                  <template v-slot:prepend>
                    <UserAvatarName :user-id="managerId" />
                  </template>
                  <template v-slot:append>
                    <v-chip color="blue" size="small" label class="mr-2">Manager</v-chip>

                    <v-menu v-if="isOwner">
                      <template v-slot:activator="{ props }">
                        <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props"></v-btn>
                      </template>
                      <v-list dense>
                        <v-list-item @click="removeManager(managerId)">
                          <template v-slot:prepend>
                            <v-icon color="warning">mdi-account-arrow-down</v-icon>
                          </template>
                          <v-list-item-title>Xóa quyền quản lý</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="removeMember(managerId)">
                          <template v-slot:prepend>
                            <v-icon color="error">mdi-account-remove</v-icon>
                          </template>
                          <v-list-item-title>Xóa khỏi dự án</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </template>
                </v-list-item>

                <!-- Members -->
                <v-list-item v-for="memberId in filteredMembers" :key="memberId" class="mb-2 rounded border">
                  <template v-slot:prepend>
                    <UserAvatarName :user-id="memberId" />
                  </template>
                  <template v-slot:append>
                    <v-menu v-if="isOwner || isManager">
                      <template v-slot:activator="{ props }">
                        <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props"></v-btn>
                      </template>
                      <v-list dense>
                        <v-list-item v-if="isOwner" @click="promoteToManager(memberId)">
                          <template v-slot:prepend>
                            <v-icon color="success">mdi-account-arrow-up</v-icon>
                          </template>
                          <v-list-item-title>Thăng cấp Quản lý</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="removeMember(memberId)">
                          <template v-slot:prepend>
                            <v-icon color="error">mdi-account-remove</v-icon>
                          </template>
                          <v-list-item-title>Xóa khỏi dự án</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-window-item>

          <!-- TAB 4: CÀI ĐẶT (OWNER ONLY) -->
          <v-window-item value="settings" v-if="isOwner">
            <v-card class="pa-6" elevation="1">
              <h3 class="text-h6 mb-4">Cài đặt dự án</h3>
              <v-form @submit.prevent="updateProjectInfo">
                <v-text-field v-model="editForm.name" label="Tên dự án" variant="outlined" class="mb-4"></v-text-field>
                <v-textarea v-model="editForm.description" label="Mô tả" variant="outlined" rows="4"
                  class="mb-4"></v-textarea>
                <div class="d-flex justify-end">
                  <v-btn color="primary" type="submit" :loading="updating">Lưu thay đổi</v-btn>
                </div>
              </v-form>

              <v-divider class="my-8"></v-divider>

              <h3 class="text-h6 text-error mb-2">Vùng nguy hiểm</h3>
              <div class="border border-error rounded pa-4 bg-red-lighten-5 d-flex align-center justify-space-between">
                <div>
                  <div class="font-weight-bold text-error">Xóa dự án này</div>
                  <div class="text-caption">Hành động này không thể hoàn tác. Tất cả dữ liệu sẽ bị mất.</div>
                </div>
                <v-btn color="error" variant="elevated" @click="deleteProject">Xóa dự án</v-btn>
              </div>
            </v-card>
          </v-window-item>

        </v-window>
      </v-container>
    </div>

    <!-- Dialog Thêm thành viên -->
    <v-dialog v-model="dialogAddMember" max-width="500">
      <v-card>
        <v-card-title>Thêm thành viên vào dự án</v-card-title>
        <v-card-text>
          <v-autocomplete v-model="newMemberId" :items="searchResults" :loading="searching" item-title="fullName"
            item-value="id" label="Tìm kiếm thành viên" placeholder="Nhập tên hoặc email..." variant="outlined"
            prepend-inner-icon="mdi-magnify" return-object @update:search="onSearchUser" no-filter hide-no-data
            hide-selected clearable>
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props" :subtitle="item.raw.email">
                <template v-slot:prepend>
                  <v-avatar color="primary" size="32" class="mr-2">
                    <span class="text-white text-caption">{{ getInitials(item.raw.fullName) }}</span>
                  </v-avatar>
                </template>
              </v-list-item>
            </template>
          </v-autocomplete>

          <v-radio-group v-model="newMemberRole" inline class="mt-4">
            <v-radio label="Thành viên" value="member"></v-radio>
            <v-radio label="Quản lý" value="manager"></v-radio>
          </v-radio-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="dialogAddMember = false">Hủy</v-btn>
          <v-btn color="primary" @click="addMemberSubmit" :loading="addingMember" :disabled="!newMemberId">
            Thêm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import { useAuthStore } from '@/stores/auth';
import { projectApi } from '@/api/projectApi';
import { userApi } from '@/api/userApi';
import UserAvatarName from '@/components/UserAvatarName.vue';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const authStore = useAuthStore();

const activeTab = ref('overview');
const loading = ref(true);
const error = ref(null);
const project = ref(null);

// State cho các dialog và form
const dialogAddMember = ref(false);
const newMemberId = ref(null);
const newMemberRole = ref('member');
const addingMember = ref(false);
const updating = ref(false);

// State cho tìm kiếm user
const searchResults = ref([]);
const searching = ref(false);
let searchTimeout = null;

const editForm = reactive({
  name: '',
  description: ''
});

// Computed Properties
const currentUserId = computed(() => authStore.user?.id);
// SỬA: Chỉ Admin hệ thống mới có quyền như Owner (cài đặt, xóa dự án). Manager chỉ quản lý trong phạm vi được giao.
const isOwner = computed(() => project.value?.ownerId === currentUserId.value || authStore.userRole === 'ADMIN');

const isManager = computed(() => project.value?.managerIds?.includes(currentUserId.value));
const isMember = computed(() => project.value?.memberIds?.includes(currentUserId.value));
const isPending = computed(() => project.value?.pendingMemberIds?.includes(currentUserId.value));
const isNewProject = computed(() => route.params.id === 'create');

// Lọc danh sách member để không hiển thị trùng với Owner và Manager
const filteredMembers = computed(() => {
  if (!project.value) return [];
  const excludeIds = [project.value.ownerId, ...(project.value.managerIds || [])];
  return project.value.memberIds.filter(id => !excludeIds.includes(id));
});

// Methods
const getStatusColor = (status) => {
  switch (status) {
    case 'ACTIVE': return 'success';
    case 'INACTIVE': return 'grey';
    case 'COMPLETED': return 'info';
    default: return 'primary';
  }
};

const getInitials = (name) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase();
};

const loadProjectData = async () => {
  // Nếu là tạo mới (id = 'create') → không load project cũ
  if (isNewProject.value) {
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;
  try {
    const res = await projectApi.getById(route.params.id);
    project.value = res.data;

    editForm.name = res.data.name;
    editForm.description = res.data.description;
  } catch (err) {
    console.error(err);
    error.value = "Không thể tải thông tin dự án. Có thể dự án không tồn tại hoặc bạn không có quyền truy cập.";
  } finally {
    loading.value = false;
  }
};

const updateProjectInfo = async () => {
  updating.value = true;
  try {
    await projectStore.update(project.value.id, editForm);
    await loadProjectData();
    alert("Cập nhật thành công!");
  } catch (err) {
    alert("Lỗi cập nhật: " + err.message);
  } finally {
    updating.value = false;
  }
};

const deleteProject = async () => {
  if (!confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn dự án này?")) return;
  try {
    await projectStore.delete(project.value.id);
    router.push('/projects');
  } catch (err) {
    alert("Lỗi xóa dự án: " + err.message);
  }
};

const handleLeaveProject = async () => {
  if (!confirm("Bạn có chắc muốn rời khỏi dự án này?")) return;
  try {
    await projectStore.leaveProject(project.value.id);
    router.push('/projects');
  } catch (err) {
    alert("Lỗi: " + err.message);
  }
};

const handleJoinProject = async () => {
  try {
    await projectStore.joinProject(project.value.id);
    await loadProjectData();
    alert("Đã gửi yêu cầu tham gia!");
  } catch (err) {
    alert("Lỗi: " + err.message);
  }
};

const handleCancelRequest = async () => {
  if (!confirm("Bạn muốn hủy yêu cầu tham gia dự án này?")) return;
  try {
    await projectApi.cancelJoinRequest(project.value.id); // Gọi endpoint mới
    await loadProjectData();
    alert("Đã hủy yêu cầu.");
  } catch (err) {
    alert("Lỗi: " + (err.response?.data || err.message));
  }
};

const approveJoin = async (userId) => {
  try {
    await projectApi.approveJoin(project.value.id, { userId });
    await loadProjectData();
    alert("Đã duyệt thành viên!");
  } catch (err) {
    alert("Lỗi: " + err.message);
  }
};

const rejectJoin = async (userId) => {
  if (!confirm("Từ chối yêu cầu này?")) return;
  try {
    await projectApi.rejectJoin(project.value.id, { userId });
    await loadProjectData();
  } catch (err) {
    alert("Lỗi: " + err.message);
  }
};

const onSearchUser = async (keyword) => {
  if (!keyword || keyword.length < 2) {
    searchResults.value = [];
    return;
  }

  if (searchTimeout) clearTimeout(searchTimeout);

  searchTimeout = setTimeout(async () => {
    searching.value = true;
    try {
      const res = await userApi.search(keyword);
      searchResults.value = res.data;
    } catch (err) {
      console.error("Lỗi tìm kiếm:", err);
    } finally {
      searching.value = false;
    }
  }, 500);
};

const addMemberSubmit = async () => {
  const userIdToAdd = newMemberId.value?.id || newMemberId.value;

  if (!userIdToAdd) return;

  addingMember.value = true;
  try {
    const payload = { userId: userIdToAdd };
    if (newMemberRole.value === 'manager') {
      await projectApi.assignManager(project.value.id, payload);
    } else {
      await projectApi.assignMember(project.value.id, payload);
    }
    await loadProjectData();
    dialogAddMember.value = false;
    newMemberId.value = null;
    alert("Thêm thành viên thành công!");
  } catch (err) {
    alert("Lỗi thêm thành viên: " + (err.response?.data || err.message));
  } finally {
    addingMember.value = false;
  }
};

const removeMember = async (userId) => {
  if (!confirm("Xóa thành viên này khỏi dự án?")) return;
  try {
    await projectApi.removeMember(project.value.id, userId);
    await loadProjectData();
  } catch (err) {
    alert("Lỗi: " + err.message);
  }
};

const removeManager = async (userId) => {
  if (!confirm("Chỉ xóa quyền quản lý của thành viên này?")) return;
  try {
    await projectApi.removeManager(project.value.id, userId);
    await loadProjectData();
  } catch (err) {
    alert("Lỗi: " + err.message);
  }
};

const promoteToManager = async (userId) => {
  if (!confirm("Thăng cấp thành viên này thành Quản lý?")) return;
  try {
    const payload = { userId: userId };
    await projectApi.assignManager(project.value.id, payload);
    await loadProjectData();
    alert("Thăng cấp thành công!");
  } catch (err) {
    alert("Lỗi khi thăng cấp: " + (err.response?.data || err.message));
  }
};

const openCreateTaskDialog = () => {
  alert("Chức năng tạo Task sẽ được phát triển tiếp theo!");
};

onMounted(() => {
  // Nếu có query param tab (ví dụ: ?tab=settings), mở tab đó
  if (route.query.tab) {
    activeTab.value = route.query.tab;
  }
  loadProjectData();
});
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.gap-6 {
  gap: 24px;
}

.min-h-screen {
  min-height: calc(100vh - 200px);
}

.border-warning {
  border: 1px solid #FFB74D !important;
}
</style>