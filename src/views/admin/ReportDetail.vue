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
            <v-select v-model="selectedProject" :items="projects" label="Dự án" density="compact" />
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

          <div v-for="user in users" :key="user.name" class="mb-4">
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

              <v-btn size="small"> Xem chi tiết </v-btn>
            </div>
          </div>
        </v-card>

        <!-- FILTER -->

        <v-card class="pa-4">
          <v-card-title> Bộ lọc nhanh </v-card-title>

          <v-select label="Đội nhóm" :items="['Tất cả']" density="compact" />

          <v-select label="Vai trò" :items="['Tất cả']" density="compact" />

          <v-select label="Ưu tiên" :items="['Tất cả']" density="compact" />

          <v-select label="Trạng thái" :items="['Tất cả']" density="compact" />

          <v-row class="mt-3">
            <v-col>
              <v-btn block color="primary"> Áp dụng </v-btn>
            </v-col>

            <v-col>
              <v-btn block variant="outlined"> Đặt lại </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

const userStore = useUserStore()
const route = useRoute()
const selectedProject = ref(null)
const projects = ref([])
const fromDate = ref('')
const toDate = ref('')

const searchUser = ref('')
const sortOptions = ['Task hoàn thành (giảm dần)']

const users = ref([
  { name: 'Nguyễn Văn A', done: 120, total: 150 },
  { name: 'Trần Thị B', done: 95, total: 110 },
  { name: 'Lê Hoàng C', done: 80, total: 100 },
  { name: 'Phạm Thanh D', done: 110, total: 130 },
])

const headers = [
  { title: 'Ngày', key: 'date' },
  { title: 'Tạo mới', key: 'created' },
  { title: 'Hoàn thành', key: 'done' },
  { title: 'Quá hạn', key: 'late' },
  { title: 'Tỷ lệ hoàn thành (%)', key: 'rate' },
]

const tableData = ref([
  { date: '22/01', created: 27, done: 27, late: 1, rate: '100%' },
  { date: '23/01', created: 26, done: 30, late: -1, rate: '115%' },
  { date: '24/01', created: 39, done: 27, late: 9, rate: '69%' },
])

const chartData = ref({
  labels: ['22/01', '23/01', '24/01', '25/01', '26/01', '27/01', '28/01', '29/01'],
  datasets: [
    { label: 'Tạo mới', data: [27, 26, 39, 10, 18, 21, 33, 25], borderColor: '#1976D2' },
    { label: 'Hoàn thành', data: [27, 30, 27, 11, 12, 8, 31, 20], borderColor: '#4CAF50' },
  ],
})

const chartOptions = { responsive: true, maintainAspectRatio: false }

const totalTasks = ref(204)
const completedTasks = ref(162)
const completionRate = ref('79.4%')

const fetchProjects = async () => {
  try {
    const res = await projectApi.getAllSystem()
    const data = res.data || res
    projects.value = data.map(p => ({ title: p.name, value: p._id || p.id }))
    if (projects.value.length > 0) {
      if (route.query.projectId && projects.value.some(p => p.value === route.query.projectId)) {
        selectedProject.value = route.query.projectId
      } else {
        selectedProject.value = projects.value[0].value
      }
      await fetchDetailedReport()
    }
  } catch (err) {
    console.error('Error fetching projects', err)
  }
}

const fetchDetailedReport = async () => {
  if (!selectedProject.value) return
  try {
    const res = await taskApi.getByProject(selectedProject.value)
    let tasks = res.data || res

    if (fromDate.value) {
      tasks = tasks.filter(t => t.deadline && new Date(t.deadline) >= new Date(fromDate.value))
    }
    if (toDate.value) {
      tasks = tasks.filter(t => t.deadline && new Date(t.deadline) <= new Date(toDate.value + 'T23:59:59'))
    }

    totalTasks.value = tasks.length
    completedTasks.value = tasks.filter(t => t.status === 'DONE').length
    completionRate.value = totalTasks.value ? Math.round((completedTasks.value / totalTasks.value) * 100) + '%' : '0%'

    // Grouping by Members
    const userMap = {}
    tasks.forEach(t => {
      if (!t.assigneeId) return
      if (!userMap[t.assigneeId]) {
        const u = userStore.users.find(user => user.id === t.assigneeId)
        userMap[t.assigneeId] = { name: u ? u.fullName : t.assigneeId, done: 0, total: 0 }
      }
      userMap[t.assigneeId].total += 1
      if (t.status === 'DONE') userMap[t.assigneeId].done += 1
    })

    users.value = Object.values(userMap).sort((a,b) => b.done - a.done)

    // Grouping by Date for Chart & Table
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

  } catch (err) {
    console.error('Error fetching detailed report', err)
  }
}

const exportCsv = async () => {
  if (!selectedProject.value) return
  try {
    const res = await reportApi.exportCsv(selectedProject.value, 'csv')
    const url = window.URL.createObjectURL(new Blob([res.data || res]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `detailed-report-${selectedProject.value}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (err) {
    console.error('Error exporting CSV', err)
  }
}

onMounted(async () => {
  try {
    await userStore.fetchAll()
  } catch (error) {
    console.error("Error fetching users", error)
  }
  fetchProjects()
})
</script>
