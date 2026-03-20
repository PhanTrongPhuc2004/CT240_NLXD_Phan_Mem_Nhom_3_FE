<template>
  <v-container>
    <v-row class="align-center mb-6">
      <v-col cols="6">
        <h2>Báo cáo & Thống kê</h2>
      </v-col>

      <v-col cols="6" class="d-flex justify-end">
        <v-btn color="#111111" @click="goDetail"> Xem báo cáo chi tiết </v-btn>
      </v-col>
    </v-row>
    <!-- Bộ lọc -->
    <v-card class="pa-4 mb-6">
      <v-row>
        <v-col cols="3">
          <v-select v-model="selectedProject" label="Chọn dự án" :items="projects" item-title="name" item-value="id" variant="outlined" @update:model-value="fetchStatistics" />
        </v-col>

        <v-col cols="3">
          <v-text-field label="Từ ngày" type="date" variant="outlined" />
        </v-col>

        <v-col cols="3">
          <v-text-field label="Đến ngày" type="date" variant="outlined" />
        </v-col>

        <v-col cols="3" class="d-flex justify-center align-center ga-2">
          <v-btn color="primary" @click="fetchStatistics">Áp dụng</v-btn>
          <v-btn color="green" @click="exportDialog = true"> Xuất báo cáo </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-row>
      <!-- Tiến độ công việc -->
      <v-col cols="4">
        <v-card class="pa-4">
          <h3 class="mb-0">Tiến độ công việc chính</h3>
          <p class="text-grey text-caption mb-4">Tổng quan về tiến độ dự án.</p>

          <p class="mt-3">{{ done }} / {{ total }} công việc</p>

          <div class="d-flex align-center">
            <v-progress-linear
              :model-value="progressPercent"
              height="10"
              color="green"
              rounded
              class="flex-grow-1"
            />
            <span class="ml-2 pg-percent">{{ progressPercent }}%</span>
          </div>
        </v-card>
      </v-col>

      <!-- Chart tiến độ -->
      <v-col cols="8">
        <v-card class="pa-4">
          <h3 class="mb-0">Tiến độ theo thời gian</h3>
          <p class="text-grey text-caption mb-4">Hiển thị tỷ lệ phần trăm tiến độ qua các tuần.</p>
          <canvas id="progressChart"></canvas>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-6">
      <!-- Pie chart -->
      <v-col cols="6">
        <v-card class="pa-4">
          <h3 class="mb-0">Phân bố trạng thái công việc</h3>
          <p class="text-grey text-caption mb-4">Tỷ lệ phần trăm công việc theo từng trạng thái.</p>
          <canvas id="statusChart"></canvas>
        </v-card>
      </v-col>

      <!-- Phân tích trạng thái -->
      <v-col cols="6">
        <v-card class="pa-4">
          <h3 class="mb-1">Thẻ phân tích trạng thái</h3>
          <p class="text-grey text-caption mb-4">
            Số lượng và tỷ lệ phần trăm cho từng trạng thái.
          </p>

          <div v-for="item in status" :key="item.name" class="status-card">
            <div class="status-name">
              {{ item.name }}
            </div>

            <div class="status-row">
              <v-progress-linear
                :model-value="item.percent"
                height="6"
                color="grey-darken-2"
                rounded
                class="status-progress"
              />

              <div class="status-info">
                <span class="status-count">
                  {{ item.count }}
                </span>

                <v-chip class="percent-chip"> {{ item.percent }}% </v-chip>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-8">
      <v-col cols="12">
        <v-card class="pa-4">
          <!-- Header -->
          <v-row class="align-center mb-1">
            <v-col cols="10">
              <h3 class="mb-0">Công việc trễ hạn</h3>
              <p class="text-grey text-caption mb-4">Danh sách 5 công việc trễ hạn gần đây nhất.</p>
            </v-col>

            <v-col cols="2" class="d-flex justify-end">
              <v-chip color="grey-lighten-2">
                {{ lateTasks.length }}
              </v-chip>
            </v-col>
          </v-row>

          <!-- List -->
          <v-list>
            <v-list-item v-for="task in lateTasks" :key="task.title">
              <!-- icon -->
              <template v-slot:prepend>
                <v-icon color="orange">mdi-alert-circle-outline</v-icon>
              </template>

              <!-- title -->
              <v-list-item-title>
                {{ task.title }}
              </v-list-item-title>

              <!-- subtitle -->
              <v-list-item-subtitle>
                Dự án: {{ task.project }} -
                <span class="text-red"> Trễ hạn: {{ task.days }} ngày </span>
              </v-list-item-subtitle>

              <!-- button -->
              <template v-slot:append>
                <v-btn variant="outlined" size="small" class="text-none btn-view" @click="goToTaskReport(task.projectId)"> Xem </v-btn>
              </template>
            </v-list-item>

            <v-divider></v-divider>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Xuất báo cáo -->
    <v-dialog v-model="exportDialog" max-width="1200">
      <v-card>
        <v-card-title class="text-h6"> Xuất báo cáo </v-card-title>

        <v-card-text>
          <v-row>
            <!-- BÊN TRÁI -->
            <v-col cols="6">
              <h2 class="mb-1">Xuất báo cáo</h2>
              <p class="text-grey text-caption mb-4">
                Tùy chỉnh các lựa chọn để xuất báo cáo tối ưu cho màn hình máy tính (desktop).
              </p>

              <v-select v-model="selectedProject" label="Dự án" :items="projects" item-title="name" item-value="id" variant="outlined" class="mb-1" />

              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="fromDate"
                    label="Từ ngày"
                    type="date"
                    prepend-inner-icon="mdi-calendar"
                    variant="outlined"
                  ></v-text-field>
                </v-col>

                <v-col cols="6">
                  <v-text-field
                    v-model="toDate"
                    label="Đến ngày"
                    type="date"
                    prepend-inner-icon="mdi-calendar"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row no-gutters class="mb-8">
                <v-col cols="12" class="d-flex justify-center">
                  <v-btn block color="primary"> Áp dụng </v-btn>
                </v-col>
              </v-row>

              <v-divider class="my-6"></v-divider>

              <h2 class="mb-1">Tùy chọn báo cáo</h2>

              <v-checkbox
                density="compact"
                hide-details
                label="Bao gồm các filter hiện tại (trạng thái, người được gán, priority)"
              />

              <p class="mt-3 mb-2 font-weight-medium">Định dạng xuất</p>

              <v-row>
                <v-col cols="4">
                  <v-btn block :color="exportFormat === 'csv' ? 'blue' : ''" variant="outlined" class="btn-export" @click="exportFormat = 'csv'">
                    <div class="btn-content">
                      CSV
                      <span class="sub-text text-none">Dữ liệu thô</span>
                    </div>
                  </v-btn>
                </v-col>

                <v-col cols="4">
                  <v-btn block :color="exportFormat === 'pdf' ? 'blue' : ''" variant="outlined" class="btn-export" @click="exportFormat = 'pdf'">
                    <div class="btn-content">
                      PDF
                      <span class="sub-text text-none">Tài liệu cố định</span>
                    </div>
                  </v-btn>
                </v-col>

                <v-col cols="4">
                  <v-btn block :color="exportFormat === 'excel' ? 'blue' : ''" variant="outlined" class="btn-export" @click="exportFormat = 'excel'">
                    <div class="btn-content">
                      Excel (XLSX)
                      <span class="sub-text text-none">Bảng tính</span>
                    </div>
                  </v-btn>
                </v-col>
              </v-row>

              <v-row class="ma-0">
                <v-col cols="6">
                  <p class="mt-2 font-weight-medium">Nội dung bổ sung</p>

                  <v-checkbox density="compact" hide-details label="Bao gồm biểu đồ" />
                  <v-checkbox density="compact" hide-details label="Bao gồm bảng chi tiết" />
                  <v-checkbox density="compact" hide-details label="Bao gồm lịch sử thay đổi" />
                  <v-checkbox density="compact" hide-details label="Bao gồm file đính kèm" />
                </v-col>
                <v-col cols="6">
                  <p class="mt-2 font-weight-medium">Tùy chọn PDF nâng cao</p>
                  <v-row>
                    <v-col cols="6">
                      <p class="mt-2 font-weight-medium">Hướng</p>

                      <v-radio-group v-model="orientation" density="compact">
                        <v-radio label="Dọc" value="portrait"></v-radio>
                        <v-radio label="Ngang" value="landscape"></v-radio>
                      </v-radio-group>
                    </v-col>
                    <v-col cols="6">
                      <p class="mt-2 font-weight-medium">Kích thước</p>

                      <v-radio-group v-model="paperSize" density="compact">
                        <v-radio label="A4" value="a4"></v-radio>
                        <v-radio label="Letter" value="letter"></v-radio>
                      </v-radio-group>
                    </v-col>
                  </v-row>
                </v-col>

                <v-row>
                  <v-col cols="12" class="py-1">
                    <p class="text-subtitle-1 font-weight-medium mb-0">Lên lịch xuất</p>
                  </v-col>
                  <!-- Tần suất -->
                  <v-col cols="6" class="py-1">
                    <v-select
                      label="Tần suất"
                      :items="['Hàng ngày', 'Hàng tuần', 'Hàng tháng']"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>

                  <!-- Thời gian -->
                  <v-col cols="6" class="py-1">
                    <v-text-field
                      label="Thời gian"
                      type="time"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>

                  <!-- Email -->
                  <v-col cols="12" class="py-1">
                    <v-text-field
                      label="Gửi tới email"
                      placeholder="nguyenvana@example.com"
                      prepend-inner-icon="mdi-email-outline"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                </v-row>
                <!-- Buttons -->
                <v-row class="mt-0">
                  <v-col cols="6">
                    <v-btn block color="primary"> Lưu lịch </v-btn>
                  </v-col>

                  <v-col cols="6">
                    <v-btn block variant="outlined"> Hủy lịch </v-btn>
                  </v-col>
                </v-row>
              </v-row>
            </v-col>

            <!-- BÊN PHẢI -->
            <v-col cols="6">
              <h2>Lịch sử xuất</h2>

              <v-table>
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Dự án</th>
                    <th>Định dạng</th>
                    <th>Trạng thái</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="item in exportHistory" :key="item.date">
                    <td>{{ item.date }}</td>

                    <td>{{ item.projectName }}</td>

                    <td>{{ item.format }}</td>

                    <td>
                      <v-chip :color="item.status === 'Hoàn thành' ? 'success' : 'error'" size="small">
                        {{ item.status }}
                      </v-chip>
                    </td>

                    <td>
                      <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="deleteHistory(item.date)" />
                    </td>
                  </tr>
                  <tr v-if="exportHistory.length === 0">
                    <td colspan="5" class="text-center text-grey">Chưa có lịch sử xuất</td>
                  </tr>
                </tbody>
              </v-table>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn variant="text" @click="exportDialog = false"> Hủy </v-btn>

          <v-btn color="primary" @click="exportReport"> Xuất báo cáo </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Chart from 'chart.js/auto'
import { projectApi } from '@/api/projectApi'
import { reportApi } from '@/api/reportApi'
import { taskApi } from '@/api/taskApi'

const router = useRouter()

const projects = ref([])
const selectedProject = ref(null)
const fromDate = ref('')
const toDate = ref('')

const status = ref([
  { name: 'Hoàn thành', count: 45, percent: 60 },
  { name: 'Đã hủy', count: 5, percent: 7 },
])
const lateTasks = ref([
  { title: 'Thiết kế giao diện Dashboard', project: 'Website Quản lý công việc', days: 3 },
  { title: 'Viết API đăng nhập', project: 'Hệ thống Backend', days: 2 },
  { title: 'Tối ưu database', project: 'CRM System', days: 5 },
])
const done = ref(45)
const total = ref(60)

const exportDialog = ref(false)
const exportFormat = ref('pdf')
const exportHistory = ref([])

const loadHistory = () => {
  const saved = localStorage.getItem('report_export_history')
  if (saved) {
    try {
      exportHistory.value = JSON.parse(saved)
    } catch(e) {}
  }
}

const saveHistory = () => {
  localStorage.setItem('report_export_history', JSON.stringify(exportHistory.value))
}

const deleteHistory = (date) => {
  exportHistory.value = exportHistory.value.filter(item => item.date !== date)
  saveHistory()
}

const orientation = ref('portrait')
const paperSize = ref('a4')

const progressPercent = computed(() => {
  if (total.value === 0) return 0
  return Math.round((done.value / total.value) * 100)
})

let progressChartInstance = null
let statusChartInstance = null

const fetchProjects = async () => {
  try {
    const res = await projectApi.getAllSystem()
    const data = res.data || res
    projects.value = data.map(p => ({ name: p.name, id: p._id || p.id }))
    if (projects.value.length > 0) {
      selectedProject.value = projects.value[0].id
      await fetchStatistics()
    }
  } catch (error) {
    console.error('Error fetching projects:', error)
  }
}

const fetchStatistics = async () => {
  if (!selectedProject.value) return
  try {
    const res = await taskApi.getByProject(selectedProject.value)
    const data = res.data || res

    total.value = data.length
    done.value = data.filter(t => t.status === 'DONE').length

    const tTodo = data.filter(t => t.status === 'TO_DO').length
    const tInProgress = data.filter(t => t.status === 'IN_PROGRESS').length
    const tDone = done.value
    const tCancelled = data.filter(t => t.status === 'CANCELLED').length

    status.value = [
      { name: 'Cần làm', count: tTodo, percent: total.value ? Math.round((tTodo / total.value) * 100) : 0 },
      { name: 'Đang 
    ]

    const now = new Date()
    const projName = projects.value.find(p => p.id === selectedProject.value)?.name || 'Dự án'

    const lates = data.filter(t => t.status !== 'DONE' && t.status !== 'CANCELLED' && t.deadline && new Date(t.deadline) < now)
    lateTasks.value = lates.map(t => {
      const days = Math.floor((now - new Date(t.deadline)) / (1000 * 60 * 60 * 24))
      return {
        title: t.title,
        project: projName,
        projectId: selectedProject.value,
        days: days > 0 ? days : 1
      }
    }).sort((a,b) => b.days - a.days).slice(0, 5)

    updateCharts({
      statusChart: {
        labels: ['Cần làm', 'Đang làm', 'Hoàn thành', 'Đã hủy'],
        data: [tTodo, tInProgress, tDone, tCancelled]
      }
    })
    console.error('Error fetching statistics:', error)
    // Fallback to update charts with current placeholder data if API fails
    updateCharts({})
  }
}

const updateCharts = (data) => {
  if (progressChartInstance) progressChartInstance.destroy()
  if (statusChartInstance) statusChartInstance.destroy()

  const progressCanvas = document.getElementById('progressChart')
  if (progressCanvas) {
    progressChartInstance = new Chart(progressCanvas, {
      type: 'line',
      data: data.progressChartData || {
        labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5'],
        datasets: [{ label: 'Tiến độ', data: [20, 35, 50, 70, 80], borderColor: '#1976d2', tension: 0.4 }]
      }
    })
  }

  const statusCanvas = document.getElementById('statusChart')
  if (statusCanvas) {
    statusChartInstance = new Chart(statusCanvas, {
      type: 'doughnut',
      data: {
        labels: data.statusChart?.labels || ['Cần làm', 'Đang làm', 'Hoàn thành', 'Đã hủy'],
        datasets: [{
          data: data.statusChart?.data || status.value.map(s => s.count),
          backgroundColor: ['#9e9e9e', '#2196f3', '#4caf50', '#f44336'],
          bor
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '70%',
        plugins: { legend: { position: 'bottom', align: 'center', labels: { boxWidth: 15, padding: 15 } } }
      }
    })
  }
}

const goDetail = () => {
  if (!selectedProject.value) return
  router.push({ name: 'ReportDetail', query: { projectId: selectedProject.value } })
}

const goToTaskReport = (projectId) => {
  if (!projectId) return
  router.push({ name: 'ReportDetail', query: { projectId } })
}

const exportReport = async () => {
  if (!selectedProject.value) return
  try {
    let response;
    if (exportFormat.value === 'csv') {
      response = await reportApi.exportCsv(selectedProject.value, exportFormat.value)
    } else {
      // API currently only has PDF mapping, so fallback excel to pdf as well or handle later
      response = await reportApi.exportPdf(selectedProject.value, exportFormat.value)
    }

    const url = window.URL.createObjectURL(new Blob([response.data || response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `report-${selectedProject.value}.${exportFormat.value}`)
    document.body.appendChild(link)
    link.click()
    link.remove()

    exportDialog.value = false
    alert('Xuất báo cáo thành công!')

    // Save success history
    const projName = projects.value.find(p => p.id === selectedProject.value)?.name || 'Dự án'
    exportHistory.value.unshift({
      date: new Date().toLocaleString('vi-VN'),
      projectName: projName,
      format: exportFormat.value.toUpperCase(),
      status: 'Hoàn thành'
    })
    saveHistory()
  } catch (err) {
    console.error('Error exporting report:', err)

    // Save failure history
    const projName = projects.value.find(p => p.id === selectedProject.value)?.name || 'Dự án'
    exportHistory.value.unshift({
      date: new Date().toLocaleString('vi-VN'),
      projectName: projName,
      format: exportFormat.value.toUpperCase(),
      status: 'Thất bại'
    })
    saveHistory()
    alert('Xuất báo cáo thất bại!')
  }
}

onMounted(() => {
  fetchProjects()
  loadHistory()
  nextTick(() => {
    updateCharts({})
  })
})
</script>

<style scoped>
h3 {
  margin-bottom: 15px;
  font-weight: 600;
}

/*Tiến độ công việc */
.pg-percent {
  font-size: 14px;
  padding: 5px 10px;
  background: #e6e6e6;
  color: #111111;
  border-radius: 999px;
}

/*Biểu đồ tròn*/
#statusChart {
  max-width: 400px;
  max-height: 400px;
  margin: auto;
}

/*Thẻ phân tích dự án*/
.status-card {
  border: 1px solid #e0e0e0;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.status-name {
  margin-bottom: 6px;
  font-weight: 500;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-progress {
  flex: 1;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-count {
  font-weight: 500;
  color: #555;
}

.percent-chip {
  background: #111111;
  color: white;
}

/*Button xem công việc trễ hạn */
.btn-view:hover {
  background-color: #000000;
  color: white;
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.2;
}

.sub-text {
  font-size: 12px;
  color: #777;
}
</style>
