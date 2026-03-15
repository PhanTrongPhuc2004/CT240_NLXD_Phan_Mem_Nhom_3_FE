<template>
  <v-container fluid class="fill-height align-start pa-0">
    <!-- Loading State -->
    <v-row v-if="loading" class="fill-height" justify="center" align="center">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </v-row>

    <!-- Error State -->
    <v-row v-else-if="error" class="fill-height" justify="center" align="center">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <v-icon size="80" color="grey-lighten-2" class="mb-4">mdi-alert-circle-outline</v-icon>
        <h2 class="text-h5 font-weight-bold text-grey-darken-3 mb-2">Không tìm thấy dự án</h2>
        <p class="text-body-1 text-grey mb-6">{{ error }}</p>
        <v-btn color="primary" variant="flat" size="large" @click="goBack">
          Quay lại danh sách
        </v-btn>
      </v-col>
    </v-row>

    <!-- Content -->
    <div v-else class="w-100">
      <!-- Header Dự án -->
      <v-card flat color="grey-lighten-4" class="px-6 py-4 rounded-0 border-b">
        <div class="d-flex align-center justify-space-between">
          <div>
            <!-- Nút Quay lại thông minh -->
            <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-2 px-0" color="grey-darken-2" @click="goBack">
              {{ backButtonLabel }}
            </v-btn>

            <div class="d-flex align-center mb-2">
              <h1 class="text-h4 font-weight-bold text-primary mr-4">{{ project?.name }}</h1>
              <v-chip v-if="project?.status" :color="getStatusColor(project?.status)" label size="small"
                class="font-weight-bold mr-2">
                {{ project?.status }}
              </v-chip>
              <v-chip v-if="project?.visibility" :color="project?.visibility === 'public' ? 'blue' : 'grey'" label size="small" class="font-weight-bold" :prepend-icon="project?.visibility === 'public' ? 'mdi-earth' : 'mdi-lock'">
                {{ project?.visibility === 'public' ? 'Công khai' : 'Riêng tư' }}
              </v-chip>
            </div>
            <p class="text-body-1 text-grey-darken-1" style="max-width: 800px;">
              {{ project?.description || 'Nhập mô tả cho dự án mới của bạn.' }}
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="d-flex gap-2">
            <!-- <v-btn v-if="isOwner || isAdmin" prepend-icon="mdi-cog" variant="outlined" color="primary"
              @click="activeTab = 'settings'">
              Cài đặt
            </v-btn> -->
            <v-btn v-if="isMember && !isOwner" prepend-icon="mdi-logout" variant="outlined"
              color="error" @click="handleLeaveProject">
              Rời dự án
            </v-btn>
            <!-- Nút Hủy yêu cầu cho người đang chờ duyệt -->
            <v-btn v-if="isPending" prepend-icon="mdi-close-circle" variant="outlined" color="warning"
              @click="handleCancelRequest">
              Hủy yêu cầu
            </v-btn>
            <!-- Nút Xin tham gia cho người chưa tham gia -->
            <v-btn v-if="!isMember && !isOwner && !isPending && !isAdmin" prepend-icon="mdi-login"
              variant="elevated" color="primary" @click="handleJoinProject">
              Xin tham gia
            </v-btn>
          </div>
        </div>

        <!-- Thống kê nhanh -->
        <div class="d-flex mt-6 gap-6">
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
              <div class="font-weight-bold">{{ completedTasksCount }}/{{ projectTasks.length }} Task</div>
            </div>
          </div>
          <div class="d-flex align-center ml-6">
            <v-avatar color="info" size="32" class="mr-2">
              <v-icon size="18" color="white">mdi-calendar-start</v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-grey">Ngày bắt đầu</div>
              <div class="font-weight-bold">
                {{ project?.startDate ? new Date(project.startDate).toLocaleDateString('vi-VN') : 'Chưa đặt' }}
              </div>
            </div>
          </div>
          <div class="d-flex align-center ml-6">
            <v-avatar color="warning" size="32" class="mr-2">
              <v-icon size="18" color="white">mdi-clock-outline</v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-grey">Hạn chót</div>
              <div class="font-weight-bold">
                {{ project?.endDate ? new Date(project.endDate).toLocaleDateString('vi-VN') : 'Chưa đặt' }}
              </div>
            </div>
          </div>
        </div>
      </v-card>

      <!-- Tabs Navigation -->
      <v-tabs v-model="activeTab" color="primary" bg-color="white" class="border-b px-6">
        <v-tab value="overview">Tổng quan</v-tab>
        <v-tab value="tasks" v-if="isMember || isOwner || isAdmin">Công việc</v-tab>
        <v-tab value="members">Thành viên</v-tab>
        <v-tab value="settings" v-if="isOwner || isAdmin">Cài đặt</v-tab>
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
                    <v-progress-circular :model-value="progressPercentage" :size="150" :width="15" color="primary">
                      <span class="text-h5 font-weight-bold">{{ Math.round(progressPercentage) }}%</span>
                    </v-progress-circular>
                    <p class="mt-4 text-grey">{{ projectTasks.length > 0 ? `Đã hoàn thành ${completedTasksCount}/${projectTasks.length} công việc` : 'Chưa có dữ liệu task để tính toán tiến độ.' }}</p>
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
          <v-window-item value="tasks" v-if="isMember || isOwner || isAdmin">
            <v-card class="pa-4" elevation="1">
              <div class="d-flex justify-space-between align-center mb-4">
                <h3 class="text-h6">Danh sách công việc ({{ projectTasks.length }})</h3>
                <v-btn v-if="canManageTasks" color="primary" prepend-icon="mdi-plus" @click="openTaskDialog()">
                  Thêm công việc
                </v-btn>
              </div>

              <!-- Bảng danh sách công việc -->
              <v-data-table :headers="taskHeaders" :items="projectTasks" :loading="loading"
                no-data-text="Chưa có công việc nào trong dự án này.">
                
                <template v-slot:item.title="{ item }">
                  <span class="font-weight-medium">
                    {{ item.title }}
                  </span>
                </template>

                <template v-slot:item.assigneeId="{ item }">
                  <UserAvatarName v-if="item.assigneeId" :user-id="item.assigneeId" />
                  <span v-else class="text-grey text-caption font-italic">Chưa giao</span>
                </template>

                <template v-slot:item.status="{ item }">
                  <v-menu v-if="canUpdateStatus(item)" location="bottom start">
                    <template v-slot:activator="{ props }">
                      <v-chip
                        v-bind="props"
                        :color="getTaskStatusColor(item.status)"
                        size="small"
                        label
                        class="cursor-pointer font-weight-bold"
                        append-icon="mdi-chevron-down"
                        style="min-width: 140px; justify-content: space-between;"
                      >
                        {{ item.status }}
                      </v-chip>
                    </template>
                    <v-list density="compact" elevation="2">
                      <v-list-item
                        v-for="status in ['TO_DO', 'IN_PROGRESS', 'DONE', 'CANCELLED']"
                        :key="status"
                        :value="status"
                        @click="updateTaskStatus(item, status)"
                      >
                        <v-list-item-title>
                          <v-chip :color="getTaskStatusColor(status)" size="x-small" label class="mr-2"></v-chip>
                          {{ status }}
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                  <v-chip
                    v-else
                    :color="getTaskStatusColor(item.status)"
                    size="small"
                    label
                    class="font-weight-bold"
                    style="min-width: 140px; justify-content: center;"
                  >
                    {{ item.status }}
                  </v-chip>
                </template>

                <template v-slot:item.priority="{ item }">
                  <v-chip :color="getTaskPriorityColor(item.priority)" size="small" variant="outlined">{{ item.priority }}</v-chip>
                </template>

                <template v-slot:item.deadline="{ item }">
                  {{ item.deadline ? new Date(item.deadline).toLocaleDateString('vi-VN') : '' }}
                </template>

                <template v-slot:item.actions="{ item }">
                  <v-icon size="small" class="me-2" @click="goToTaskDetail(item)">mdi-eye</v-icon>
                  <template v-if="canManageTasks">
                    <v-icon size="small" class="me-2" @click="openTaskDialog(item)">mdi-pencil</v-icon>
                    <v-icon size="small" color="error" @click="deleteTaskItem(item)">mdi-delete</v-icon>
                  </template>
                </template>
              </v-data-table>
            </v-card>
          </v-window-item>

          <!-- TAB 3: THÀNH VIÊN -->
          <v-window-item value="members">
            <!-- SECTION: YÊU CẦU THAM GIA (Chỉ hiện cho Owner/Manager) -->
            <v-card v-if="(isOwner || isManager || isAdmin) && project?.pendingMemberIds?.length > 0"
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
                <v-btn v-if="isOwner || isManager || isAdmin" color="primary" prepend-icon="mdi-account-plus"
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

                    <v-menu v-if="isOwner || isAdmin">
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
                    <v-menu v-if="isOwner || isManager || isAdmin">
                      <template v-slot:activator="{ props }">
                        <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props"></v-btn>
                      </template>
                      <v-list dense>
                        <v-list-item v-if="isOwner || isAdmin" @click="promoteToManager(memberId)">
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
          <v-window-item value="settings" v-if="isOwner || isAdmin">
            <v-card class="pa-6" elevation="1">
              <h3 class="text-h6 mb-4">Cài đặt dự án</h3>
              <v-form @submit.prevent="updateProjectInfo">
                <v-text-field v-model="editForm.name" label="Tên dự án" variant="outlined" class="mb-4"></v-text-field>
                <v-textarea v-model="editForm.description" label="Mô tả" variant="outlined" rows="4"
                  class="mb-4">
                </v-textarea>

                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="editForm.startDate" label="Ngày bắt đầu" type="date" variant="outlined"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="editForm.endDate" label="Ngày kết thúc" type="date" variant="outlined" :min="editForm.startDate"></v-text-field>
                  </v-col>
                </v-row>

                <div class="mb-4">
                  <div class="text-subtitle-2 mb-2">Khả năng hiển thị</div>
                  <v-radio-group v-model="editForm.visibility" inline>
                    <v-radio label="Công khai" value="public"></v-radio>
                    <v-radio label="Riêng tư" value="private"></v-radio>
                  </v-radio-group>
                </div>

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

    <!-- Dialog Tạo/Sửa Task -->
    <v-dialog v-model="dialogTask" max-width="700px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ dialogTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="editedTask.title" label="Tiêu đề công việc" required variant="outlined" :readonly="!canManageTasks"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="editedTask.description" label="Mô tả" rows="3" variant="outlined" :readonly="!canManageTasks"></v-textarea>
              </v-col>
              <v-col cols="12" sm="6">
                <v-autocomplete
                  v-model="editedTask.assigneeId"
                  :items="projectMembersList"
                  item-title="fullName"
                  item-value="id"
                  label="Giao cho"
                  variant="outlined"
                  clearable
                  :readonly="!canManageTasks"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedTask.priority"
                  :items="['LOW', 'MEDIUM', 'HIGH']"
                  label="Độ ưu tiên"
                  variant="outlined"
                  :readonly="!canManageTasks"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedTask.status"
                  :items="['TO_DO', 'IN_PROGRESS', 'DONE', 'CANCELLED']"
                  label="Trạng thái"
                  variant="outlined"
                  :disabled="!canManageTasks"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editedTask.deadline" label="Hạn chót" type="datetime-local" variant="outlined" :readonly="!canManageTasks"></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeTaskDialog">{{ canManageTasks ? 'Hủy' : 'Đóng' }}</v-btn>
          <v-btn v-if="canManageTasks" color="primary" variant="text" @click="saveTask">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { useTaskStore } from '@/stores/task';
import { projectApi } from '@/api/projectApi';
import api from '@/api/index';
import UserAvatarName from '@/components/UserAvatarName.vue';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const authStore = useAuthStore();
const taskStore = useTaskStore();

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

// State cho Task
const dialogTask = ref(false);
const defaultTask = { id: '', title: '', description: '', projectId: '', assigneeId: null, priority: 'MEDIUM', status: 'TO_DO', deadline: null };
const editedTask = ref({ ...defaultTask });
const allUsers = ref([]); // Để load danh sách thành viên cho dropdown task

const editForm = reactive({
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  visibility: 'private'
});

// Computed Properties
const currentUserId = computed(() => authStore.user?.id);
const isActualOwner = computed(() => project.value?.ownerId === currentUserId.value);
// SỬA: Chỉ Admin hệ thống mới có quyền như Owner (cài đặt, xóa dự án). Manager chỉ quản lý trong phạm vi được giao.
const isOwner = computed(() => isActualOwner.value || authStore.userRole === 'ADMIN');

const isManager = computed(() => project.value?.managerIds?.includes(currentUserId.value));
const isMember = computed(() => project.value?.memberIds?.includes(currentUserId.value));
const isPending = computed(() => project.value?.pendingMemberIds?.includes(currentUserId.value));
const isAdmin = computed(() => authStore.userRole === 'ADMIN');
// Admin không có quyền quản lý task, chỉ Owner hoặc Manager của dự án mới có.
const canManageTasks = computed(() => isActualOwner.value || isManager.value);

const canUpdateStatus = (task) => {
  const realTask = task.raw || task;
  // Admin, Owner, Manager có quyền sửa tất cả
  if (canManageTasks.value) return true;
  
  // FIX: Admin hệ thống (nếu không phải Owner/Manager) thì CHẶN LUÔN, kể cả khi được assign
  if (isAdmin.value) return false;

  // Member chỉ được sửa task được giao cho mình
  return realTask.assigneeId === currentUserId.value;
};

const dialogTitle = computed(() => {
  if (!editedTask.value.id) return 'Thêm công việc mới';
  return canManageTasks.value ? 'Chỉnh sửa công việc' : 'Chi tiết công việc';
});

const taskHeaders = computed(() => {
  const headers = [
    { title: 'Tiêu đề', key: 'title' },
    { title: 'Người thực hiện', key: 'assigneeId' },
    { title: 'Trạng thái', key: 'status', width: '180px' },
    { title: 'Ưu tiên', key: 'priority' },
    { title: 'Hạn chót', key: 'deadline' },
    { title: 'Hành động', key: 'actions', sortable: false, align: 'end' },
  ];
  return headers;
});

// Lọc danh sách member để không hiển thị trùng với Owner và Manager
const filteredMembers = computed(() => {
  if (!project.value) return [];
  const excludeIds = [project.value.ownerId, ...(project.value.managerIds || [])];
  return project.value.memberIds.filter(id => !excludeIds.includes(id));
});

// Lọc danh sách Task thuộc dự án này
const projectTasks = computed(() => {
  if (!project.value) return [];
  return taskStore.tasks.filter(t => t.projectId === project.value.id);
});

const completedTasksCount = computed(() => {
  return projectTasks.value.filter(t => t.status === 'DONE').length;
});

const progressPercentage = computed(() => {
  if (projectTasks.value.length === 0) return 0;
  return (completedTasksCount.value / projectTasks.value.length) * 100;
});

// Lấy danh sách user object của các thành viên trong dự án (để hiển thị trong dropdown giao việc)
const projectMembersList = computed(() => {
  if (!project.value || allUsers.value.length === 0) return [];
  const allMemberIds = [
    project.value.ownerId,
    ...(project.value.managerIds || []),
    ...(project.value.memberIds || [])
  ];
  return allUsers.value.filter(u => allMemberIds.includes(u.id));
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

const getTaskStatusColor = (status) => {
    if (status === 'DONE') return 'success'
    if (status === 'IN_PROGRESS') return 'info'
    if (status === 'CANCELLED') return 'error'
    return 'default'
};

const getTaskPriorityColor = (priority) => {
    if (priority === 'HIGH') return 'red'
    if (priority === 'MEDIUM') return 'orange'
    return 'green'
};

const getInitials = (name) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase();
};

const backButtonLabel = computed(() => {
  if (isAdmin.value) return 'Quay lại trang Quản lý';
  if (route.name === 'MyProjectDetail') return 'Quay lại Dự án của tôi';
  return 'Quay lại Danh sách';
});

const goBack = () => {
  if (isAdmin.value) {
    router.push('/admin/projects');
  } else if (route.name === 'MyProjectDetail') {
    router.push({ name: 'MyProjects' });
  } else {
    router.push({ name: 'MemberProjects' });
  }
};

const loadProjectData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await projectApi.getById(route.params.id);
    
    // Kiểm tra quyền truy cập: Nếu Private thì chỉ Owner, Admin hoặc Member mới được xem
    const p = res.data;
    if (p.visibility === 'private') {
      const uid = authStore.user?.id;
      const isOwner = p.ownerId === uid;
      const isMember = p.memberIds?.includes(uid);
      const isAdmin = authStore.userRole === 'ADMIN';

      if (!isOwner && !isAdmin && !isMember) {
        throw new Error("Dự án này là riêng tư. Bạn không có quyền truy cập.");
      }
    }

    project.value = res.data;

    editForm.name = res.data.name;
    editForm.description = res.data.description;
    // Cắt chuỗi ISO (YYYY-MM-DDTHH:mm:ss) lấy phần ngày YYYY-MM-DD để hiển thị vào input type="date"
    editForm.startDate = res.data.startDate ? res.data.startDate.split('T')[0] : '';
    editForm.endDate = res.data.endDate ? res.data.endDate.split('T')[0] : '';
    editForm.visibility = res.data.visibility || 'private';

    // Load tasks và users
    taskStore.fetchAll(); 
    fetchAllUsers();
  } catch (err) {
    console.error(err);
    error.value = "Không thể tải thông tin dự án. Có thể dự án không tồn tại hoặc bạn không có quyền truy cập.";
  } finally {
    loading.value = false;
  }
};

const fetchAllUsers = async () => {
  // Chỉ Admin mới thử lấy toàn bộ danh sách users để tránh lỗi 500/403 với Member
  if (authStore.userRole === 'ADMIN') {
    try {
      const res = await api.get('/users');
      allUsers.value = res.data;
      return;
    } catch (e) {
      console.warn("Admin không tải được danh sách users, chuyển sang chế độ tải từng người.");
    }
  }

  // Logic tải từng người (Dành cho Member hoặc khi Admin lỗi)
  if (!project.value) return;

    const memberIds = [
      project.value.ownerId,
      ...(project.value.managerIds || []),
      ...(project.value.memberIds || [])
    ].filter(Boolean);
    
    const uniqueIds = [...new Set(memberIds)];
    const loadedUsers = [];

    // Sử dụng Promise.all để tải song song
    await Promise.all(uniqueIds.map(async (uid) => {
      try {
        const uRes = await api.get(`/users/${uid}`);
        loadedUsers.push(uRes.data);
      } catch (err) {
        console.error(`Lỗi tải thông tin user ${uid}:`, err);
      }
    }));
    
    allUsers.value = loadedUsers;
  }


const updateProjectInfo = async () => {
  updating.value = true;
  try {
    // Chuẩn bị payload, format lại ngày tháng thêm giờ để gửi về Backend
    const payload = {
      ...editForm,
      startDate: editForm.startDate ? `${editForm.startDate}T00:00:00` : null,
      endDate: editForm.endDate ? `${editForm.endDate}T23:59:59` : null,
    };
    await projectStore.update(project.value.id, payload);
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
    // Kiểm tra quyền để điều hướng về đúng trang
    if (isAdmin.value) {
      router.replace('/admin/projects'); // Dùng replace để không back lại được trang đã xóa
    } else {
      router.replace({ name: 'MemberProjects' });
    }
  } catch (err) {
    alert(`Lỗi xóa dự án (ID: ${project.value.id}): ` + (err.response?.data?.message || err.message || "Backend từ chối quyền xóa (403)."));
  }
};

const handleLeaveProject = async () => {
  if (!confirm("Bạn có chắc muốn rời khỏi dự án này?")) return;
  try {
    await projectStore.leaveProject(project.value.id);
    router.push({ name: 'MemberProjects' });
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

  // WORKAROUND: Nếu là Admin và đã tải allUsers, thực hiện tìm kiếm client-side
  // Điều này giúp tránh gọi API đang bị lỗi Backend Routing (/users/search bị nhầm là /users/{id})
  if (authStore.userRole === 'ADMIN' && allUsers.value.length > 0) {
    const k = keyword.toLowerCase();
    searchResults.value = allUsers.value.filter(u => 
      (u.fullName?.toLowerCase().includes(k)) ||
      (u.email?.toLowerCase().includes(k)) ||
      (u.username?.toLowerCase().includes(k))
    );
    return;
  }

  if (searchTimeout) clearTimeout(searchTimeout);

  searchTimeout = setTimeout(async () => {
    searching.value = true;
    try {
      const res = await api.get('/users/search', { params: { keyword } });
      searchResults.value = res.data;
    } catch (err) {
      console.error("Lỗi tìm kiếm:", err);
      searchResults.value = [];
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

const goToTaskDetail = (task) => {
  const realTask = task.raw || task;
  router.push(`/member/tasks/${realTask.id}`);
};

const openTaskDialog = (item = null) => {
  if (!item && !canManageTasks.value) {
    alert("Bạn không có quyền tạo công việc mới.");
    return;
  }

  if (item) {
    // Edit mode
    const realItem = item.raw || item;
    editedTask.value = { ...realItem }; // Clone object
  } else {
    // Create mode
    editedTask.value = { ...defaultTask, projectId: project.value.id };
  }
  dialogTask.value = true;
};

const closeTaskDialog = () => {
  dialogTask.value = false;
  editedTask.value = { ...defaultTask };
};

const saveTask = async () => {
  if (!canManageTasks.value) return;
  
  if (!editedTask.value.title) {
    alert("Vui lòng nhập tiêu đề công việc");
    return;
  }

  // Clone payload để xử lý dữ liệu trước khi gửi
  const payload = { ...editedTask.value };

  // Xử lý ID rỗng khi tạo mới (Backend thường không chấp nhận id: "")
  if (!payload.id) delete payload.id;

  // Kiểm tra projectId bắt buộc
  if (!payload.projectId) {
    alert("Lỗi: Không xác định được dự án (Missing projectId)");
    return;
  }

  // Xử lý các trường optional để tránh gửi chuỗi rỗng hoặc undefined
  payload.description = payload.description || ''; // Gửi chuỗi rỗng nếu không có mô tả
  payload.assigneeId = payload.assigneeId || null;

  // Format deadline
  if (payload.deadline && payload.deadline.length === 16) {
      payload.deadline += ':00';
  } else if (!payload.deadline) {
      payload.deadline = null;
  }

  try {
    if (editedTask.value.id) {
      await taskStore.update(editedTask.value.id, payload);
    } else {
      await taskStore.create(payload);
    }
    closeTaskDialog();
    // taskStore.fetchAll() được gọi tự động hoặc reactive update
  } catch (err) {
    console.error("Lỗi saveTask:", err);
    alert("Lỗi lưu công việc: " + (err.response?.data?.message || err.response?.data || err.message));
  }
};

const updateTaskStatus = async (task, newStatus) => {
  const realTask = task.raw || task;
  if (realTask.status === newStatus) return;
  const oldStatus = realTask.status;
  realTask.status = newStatus; // Cập nhật UI ngay lập tức để phản hồi nhanh

  try {
    // Sử dụng updateStatus chuyên biệt để tránh lỗi 403 (Member có thể update status nhưng không update được toàn bộ task)
    await taskStore.updateStatus(realTask.id, newStatus, '');
  } catch (err) {
    task.status = oldStatus; // Hoàn tác nếu lỗi
    alert("Lỗi cập nhật trạng thái: " + (err.response?.data?.message || err.message));
  }
};

const deleteTaskItem = async (item) => {
  const realItem = item.raw || item;
  if (!canManageTasks.value) {
    alert("Bạn không có quyền xóa công việc này.");
    return;
  }
  if (!confirm("Bạn có chắc muốn xóa công việc này?")) return;
  try {
    await taskStore.delete(realItem.id);
  } catch (err) {
    alert("Lỗi xóa: " + err.message);
  }
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