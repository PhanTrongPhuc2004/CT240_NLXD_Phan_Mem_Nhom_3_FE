<template>
  <v-container fluid>
    <!-- TITLE -->
    <v-row class="mb-4">
      <v-col cols="3">
        <h2>Báo cáo chi tiết</h2>
      </v-col>

      <v-col>
        <v-row class="align-center mb-6">
          <v-col cols="2" md="3">
            <v-select v-model="selectedProject" :items="projects" label="Dự án" density="compact" @update:model-value="onProjectChange" />
          </v-col>

          <v-col cols="3">
            <v-text-field v-model="fromDate" label="Từ ngày" type="date" density="compact" />
          </v-col>

          <v-col cols="3">
            <v-text-field v-model="toDate" label="Đến ngày" type="date" density="compact" />
          </v-col>

          <v-col cols="3" class="d-flex align-center justify-end ga-5 mb-2">
            <v-btn color="primary" @click="fetchDetailedReport">Áp dụng</v-btn>

            <v-btn variant="outlined" @click="exportCsv"> CSV </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- SUMMARY -->
    <v-row class="mb-4">
      <v-col md="4">
        <v-card class="pa-4">
          <div class="text-subtitle-2">Tổng task</div>
          <h2>{{ totalTasks }}</h2>
        </v-card>
      </v-col>

      <v-col md="4">
        <v-card class="pa-4">
          <div class="text-subtitle-2">Task hoàn thành</div>
          <h2>{{ completedTasks }}</h2>
        </v-card>
      </v-col>

      <v-col md="4">
        <v-card class="pa-4">
          <div class="text-subtitle-2">Tỷ lệ hoàn thành (%)</div>
          <h2>{{ completionRate }}</h2>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- LEFT SIDE -->
      <v-col md="8">
        <!-- CHART -->
        <v-card class="pa-4 mb-4">
          <v-card-title> Biểu đồ Task theo thời gian </v-card-title>

          <div style="height: 300px">
            <Line :data="chartData" :options="chartOptions" />
          </div>
        </v-card>

        <!-- TABLE -->

        <v-card class="pa-4">
          <v-card-title> Bảng chi tiết Task </v-card-title>

          <v-data-table :headers="headers" :items="tableData" />
        </v-card>
      </v-col>

      <!-- RIGHT SIDE -->

      <v-col md="4">
        <v-card class="pa-4 mb-4">
          <v-card-title> Báo cáo theo người dùng </v-card-title>

          <!-- SEARCH -->

          <v-text-field v-model="searchUser" placeholder="Tìm kiếm người dùng" density="compact" />

          <v-select :items="sortOptions" label="Task hoàn thành (giảm dần)" density="compact" />

          <!-- USER LIST -->

          <div v-for="user in filteredUsers" :key="user.name" class="mb-4">
            <div class="d-flex justify-space-between">
              <div>
                <strong>{{ user.name }}</strong>

                <div class="text-caption">Hoàn thành: {{ user.done }} / {{ user.total }}</div>

                <v-progress-linear
                  :model-value="(user.done / user.total) * 100"
                  height="6"
                  color="primary"
                />
              </div>

              <v-btn size="small" @click="viewUserDetails(user.id)"> Xem chi tiết </v-btn>
            </div>
          </div>
        </v-card>

        <!-- FILTER -->

        <v-card class="pa-4">
          <v-card-title> Bộ lọc nhanh </v-card-title>

          <v-select v-model="filterTeam" label="Đội nhóm" :items="[{title: 'Tất cả', value: 'ALL'}]" density="compact" />

          <v-select v-model="filterRole" label="Vai trò" :items="[{title: 'Tất cả', value: 'ALL'}]" density="compact" />

          <v-select v-model="filterPriority" label="Ưu tiên" :items="priorityOptions" item-title="title" item-value="value" density="compact" />

          <v-select v-model="filterStatus" label="Trạng thái" :items="statusOptions" item-title="title" item-value="value" density="compact" />

          <v-row class="mt-3">
            <v-col>
              <v-btn block color="primary" @click="fetchDetailedReport"> Áp dụng </v-btn>
            </v-col>

            <v-col>
              <v-btn block variant="outlined" @click="resetFilters"> Đặt lại </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- USER DETAILS DIALOG -->
    <v-dialog v-model="userDialog" max-width="800">
      <v-card>
        <v-card-title>Chi tiết công việc - {{ selectedUser?.name }}</v-card-title>
        <v-card-text>
          <v-data-table :headers="userTaskHeaders" :items="selectedUserTasks" density="compact" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="grey-darken-1" @click="userDialog = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { projectApi } from '@/api/projectApi'
import { reportApi } from '@/api/reportApi'
import { taskApi } from '@/api/taskApi'
import { useUserStore } from '@/stores/user'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// Store and Routing
const userStore = useUserStore()
const route = useRoute()

// --- UI STATE ---
const selectedProject = ref(null)
const projects = ref([])
const fromDate = ref('')
const toDate = ref('')
const searchUser = ref('')
const sortOptions = ['Task hoàn thành (giảm dần)']

const filterTeam = ref('ALL')
const filterRole = ref('ALL')
const filterPriority = ref('ALL')
const filterStatus = ref('ALL')
const userDialog = ref(false)

// --- DATA STATE ---
const users = ref([])
const tableData = ref([])
const allTasks = ref([])
const selectedUser = ref(null)
const selectedUserTasks = ref([])

const totalTasks = ref(204)
const completedTasks = ref(162)
const completionRate = ref('79.4%')

const chartData = ref({
  labels: ['22/01', '23/01', '24/01', '25/01', '26/01', '27/01', '28/01', '29/01'],
  datasets: [
    { label: 'Tạo mới', data: [27, 26, 39, 10, 18, 21, 33, 25], borderColor: '#1976D2' },
    { label: 'Hoàn thành', data: [27, 30, 27, 11, 12, 8, 31, 20], borderColor: '#4CAF50' },
  ],
})

// --- CONSTANTS ---
const priorityOptions = [
  { title: 'Tất cả', value: 'ALL' },
  { title: 'Thấp', value: 'LOW' },
  { title: 'Bình thường', value: 'NORMAL' },
  { title: 'Cao', value: 'HIGH' }
]

const statusOptions = [
  { title: 'Tất cả', value: 'ALL' },
  { title: 'Cần làm', value: 'TO_DO' },
  { title: 'Đang làm', value: 'IN_PROGRESS' },
  { title: 'Hoàn thành', value: 'DONE' },
  { title: 'Đã hủy', value: 'CANCELLED' }
]

const headers = [
  { title: 'Ngày', key: 'date' },
  { title: 'Tạo mới', key: 'created' },
  { title: 'Hoàn thành', key: 'done' },
  { title: 'Quá hạn', key: 'late' },
  { title: 'Tỷ lệ hoàn thành (%)', key: 'rate' },
]

const userTaskHeaders = [
  { title: 'Tên công việc', key: 'title' },
  { title: 'Trạng thái', key: 'status' },
  { title: 'Ngày tạo', key: 'createdAt' },
  { title: 'Hạn chót', key: 'deadline' }
]

const chartOptions = { responsive: true, maintainAspectRatio: false }

// --- COMPUTED ---
const filteredUsers = computed(() => {
  if (!searchUser.value) return users.value
  const query = searchUser.value.toLowerCase()
  return users.value.filter(u => u.name && u.name.toLowerCase().includes(query))
})

// --- LIFECYCLE ---
onMounted(async () => {
  try {
    await userStore.fetchAll()
  } catch (error) {
    console.error("Error fetching users", error)
  }
  fetchProjects()
})

// --- API & INITIALIZATION ---
const fetchProjects = async () => {
  try {
    const res = await projectApi.getAllSystem()
    const data = res.data || res
    projects.value = data.map(p => ({ title: p.name, value: p._id || p.id, startDate: p.startDate, endDate: p.endDate }))
    
    if (projects.value.length > 0) {
      if (route.query.projectId && projects.value.some(p => p.value === route.query.projectId)) {
        selectedProject.value = route.query.projectId
      } else {
        selectedProject.value = projects.value[0].value
      }
      await onProjectChange()
    }
  } catch (err) {
    console.error('Error fetching projects', err)
  }
}

// --- LOGIC / ACTIONS ---
const onProjectChange = async () => {
  const p = projects.value.find(x => x.value === selectedProject.value)
  if (p) {
    fromDate.value = p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : ''
    toDate.value = p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : ''
  }
  await fetchDetailedReport()
}

const fetchDetailedReport = async () => {
  if (!selectedProject.value) return
  try {
    const res = await taskApi.getByProject(selectedProject.value)
    let tasks = res.data || res

    tasks = filterTasksForReport(tasks)
    allTasks.value = tasks

    updateTaskSummary(tasks)
    updateUserStatistics(tasks)
    updateChartAndTable(tasks)
  } catch (err) {
    console.error('Error fetching detailed report', err)
  }
}

const filterTasksForReport = (tasks) => {
  return tasks.filter(t => {
    let isValid = true
    if (fromDate.value && t.deadline && new Date(t.deadline) < new Date(fromDate.value)) isValid = false
    if (toDate.value && t.deadline && new Date(t.deadline) > new Date(toDate.value + 'T23:59:59')) isValid = false
    if (filterPriority.value !== 'ALL' && t.priority !== filterPriority.value) isValid = false
    if (filterStatus.value !== 'ALL' && t.status !== filterStatus.value) isValid = false
    return isValid
  })
}

const updateTaskSummary = (tasks) => {
  totalTasks.value = tasks.length
  completedTasks.value = tasks.filter(t => t.status === 'DONE').length
  completionRate.value = totalTasks.value ? Math.round((completedTasks.value / totalTasks.value) * 100) + '%' : '0%'
}

const updateUserStatistics = (tasks) => {
  const userMap = {}
  tasks.forEach(t => {
    if (!t.assigneeId) return
    if (!userMap[t.assigneeId]) {
      const u = userStore.users.find(user => user.id === t.assigneeId)
      const nameFallback = t.assignee ? (t.assignee.fullName || t.assignee.name) : t.assigneeId
      userMap[t.assigneeId] = { id: t.assigneeId, name: u ? u.fullName : nameFallback, done: 0, total: 0 }
    }
    userMap[t.assigneeId].total += 1
    if (t.status === 'DONE') userMap[t.assigneeId].done += 1
  })
  
  users.value = Object.values(userMap).sort((a,b) => b.done - a.done)
}

const updateChartAndTable = (tasks) => {
  const dateMap = {}
  
  tasks.forEach(t => {
    const dbDate = new Date(t.createdAt || t.deadline || new Date())
    const d = `${dbDate.getDate().toString().padStart(2, '0')}/${(dbDate.getMonth() + 1).toString().padStart(2, '0')}`
    if (!dateMap[d]) dateMap[d] = { created: 0, done: 0, late: 0 }
    
    dateMap[d].created += 1
    if (t.status === 'DONE') dateMap[d].done += 1
    if (t.status !== 'DONE' && t.status !== 'CANCELLED' && t.deadline && new Date(t.deadline) < new Date()) {
      dateMap[d].late += 1
    }
  })

  const dates = Object.keys(dateMap).sort()

  tableData.value = dates.map(d => ({
    date: d,
    created: dateMap[d].created,
    done: dateMap[d].done,
    late: dateMap[d].late,
    rate: dateMap[d].created ? Math.round((dateMap[d].done / dateMap[d].created) * 100) + '%' : '0%'
  }))

  chartData.value = {
    labels: dates,
    datasets: [
      { label: 'Tạo mới', data: dates.map(d => dateMap[d].created), borderColor: '#1976D2' },
      { label: 'Hoàn thành', data: dates.map(d => dateMap[d].done), borderColor: '#4CAF50' },
    ],
  }
}

const resetFilters = () => {
  filterTeam.value = 'ALL'
  filterRole.value = 'ALL'
  filterPriority.value = 'ALL'
  filterStatus.value = 'ALL'
  fetchDetailedReport()
}

const viewUserDetails = (userId) => {
  selectedUser.value = users.value.find(u => u.id === userId)
  selectedUserTasks.value = allTasks.value.filter(t => t.assigneeId === userId).map(t => ({
    title: t.title,
    status: t.status,
    createdAt: t.createdAt ? new Date(t.createdAt).toLocaleDateString('vi-VN') : '',
    deadline: t.deadline ? new Date(t.deadline).toLocaleDateString('vi-VN') : ''
  }))
  userDialog.value = true
}

const exportCsv = async () => {
  if (!selectedProject.value) return
  try {
    const res = await taskApi.getByProject(selectedProject.value)
    let tasks = res.data || res

    // Only apply date filters in exportCsv as per original behaviour
    if (fromDate.value) tasks = tasks.filter(t => t.deadline && new Date(t.deadline) >= new Date(fromDate.value))
    if (toDate.value) tasks = tasks.filter(t => t.deadline && new Date(t.deadline) <= new Date(toDate.value + 'T23:59:59'))

    downloadCsvData(tasks)
  } catch (err) {
    console.error('Error exporting CSV', err)
  }
}

const downloadCsvData = (tasks) => {
  const headers = ['Tên công việc', 'Trạng thái', 'Ngày tạo', 'Hạn chót', 'Người thực hiện']
  
  const rows = tasks.map(t => {
    let assigneeName = ''
    if (t.assignee) {
      assigneeName = t.assignee.fullName || t.assignee.name || t.assigneeId
    } else if (t.assigneeId) {
      const u = userStore.users.find(user => user.id === t.assigneeId)
      assigneeName = u ? u.fullName : t.assigneeId
    }
    
    return [
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${t.status || ''}"`,
      `"${t.createdAt ? new Date(t.createdAt).toLocaleDateString('vi-VN') : ''}"`,
      `"${t.deadline ? new Date(t.deadline).toLocaleDateString('vi-VN') : ''}"`,
      `"${assigneeName}"`
    ]
  })

  generateAndDownloadCsv(headers, rows)
}

const generateAndDownloadCsv = (headers, rows) => {
  const csvContent = "\uFEFF" + headers.join(',') + '\n' + rows.map(e => e.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `detailed-report-${selectedProject.value}.csv`)
  document.body.appendChild(link)
  link.click()
  link.remove()
}
</script>
