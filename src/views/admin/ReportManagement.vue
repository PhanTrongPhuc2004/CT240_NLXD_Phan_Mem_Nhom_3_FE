<template>
  <v-container>
    <v-row class="align-center mb-6">
      <v-col cols="6">
        <h2>Báo cáo & Thống kê</h2>
      </v-col>

      <v-col cols="6" class="d-flex justify-end">
        <v-btn class="dark-gradient-btn pulse-dark font-weight-bold px-4" rounded="pill" prepend-icon="mdi-chart-box" @click="goDetail"> Xem báo cáo chi tiết </v-btn>
      </v-col>
    </v-row>
    <!-- Bộ lọc -->
    <v-card class="pa-4 mb-6">
      <v-row>
        <v-col cols="3">
          <v-select v-model="selectedProject" label="Chọn dự án" :items="projects" item-title="name" item-value="id" variant="outlined" @update:model-value="onProjectChange" />
        </v-col>

        <v-col cols="3">
          <v-text-field v-model="fromDate" label="Từ ngày" type="date" variant="outlined" />
        </v-col>

        <v-col cols="3">
          <v-text-field v-model="toDate" label="Đến ngày" type="date" variant="outlined" />
        </v-col>

        <v-col cols="3" class="d-flex justify-center align-center ga-2">
          <v-btn class="primary-gradient-btn pulse-primary font-weight-bold px-4" rounded="pill" @click="fetchStatistics">Áp dụng</v-btn>
          <v-btn class="success-gradient-btn pulse-success font-weight-bold px-4" rounded="pill" prepend-icon="mdi-file-export" @click="exportDialog = true"> Xuất báo cáo </v-btn>
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
                <v-btn size="small" class="dark-gradient-btn pulse-dark text-none font-weight-bold px-4" rounded="pill" @click="goToTaskReport(task.projectId)"> Xem </v-btn>
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

              <v-select v-model="selectedProject" label="Dự án" :items="projects" item-title="name" item-value="id" variant="outlined" class="mb-1" @update:model-value="onProjectChange" />

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
                  <v-btn block class="primary-gradient-btn pulse-primary font-weight-bold" rounded="pill" @click="fetchStatistics"> Áp dụng </v-btn>
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

                  <v-checkbox v-model="includeCharts" density="compact" hide-details label="Bao gồm biểu đồ" />
                  <v-checkbox v-model="includeDetails" density="compact" hide-details label="Bao gồm bảng chi tiết" />
                  <v-checkbox v-model="includeHistory" density="compact" hide-details label="Bao gồm lịch sử thay đổi" />
                  <v-checkbox v-model="includeAttachments" density="compact" hide-details label="Bao gồm file đính kèm" />
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
                    <v-btn block class="primary-gradient-btn pulse-primary font-weight-bold" rounded="pill"> Lưu lịch </v-btn>
                  </v-col>

                  <v-col cols="6">
                    <v-btn block variant="outlined" class="font-weight-bold" rounded="pill"> Hủy lịch </v-btn>
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

          <v-btn variant="text" color="grey-darken-1" class="font-weight-bold" rounded="pill" @click="exportDialog = false"> Hủy </v-btn>

          <v-btn class="primary-gradient-btn pulse-primary font-weight-bold px-6" rounded="pill" @click="exportReport"> Xuất báo cáo </v-btn>
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
import { taskApi } from '@/api/taskApi'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// --- UI / DATA STATE ---
const projects = ref([])
const selectedProject = ref(null)
const fromDate = ref('')
const toDate = ref('')

const status = ref([])
const lateTasks = ref([])
const done = ref(0)
const total = ref(0)

const exportDialog = ref(false)
const exportFormat = ref('pdf')
const exportHistory = ref([])
const includeCharts = ref(false)
const includeDetails = ref(true)
const includeHistory = ref(false)
const includeAttachments = ref(false)
const orientation = ref('portrait')
const paperSize = ref('a4')

let progressChartInstance = null
let statusChartInstance = null

// --- COMPUTED ---
const progressPercent = computed(() => {
  if (total.value === 0) return 0
  return Math.round((done.value / total.value) * 100)
})

// --- LIFECYCLE ---
onMounted(async () => {
  try {
    await userStore.fetchAll()
  } catch (error) {
    console.error("Error fetching users", error)
  }
  fetchProjects()
  loadHistory()
  nextTick(() => {
    updateCharts({})
  })
})

// --- HISTORY LOGIC ---
const loadHistory = () => {
  const saved = localStorage.getItem('report_export_history')
  if (saved) {
    try { exportHistory.value = JSON.parse(saved) } catch(e) {}
  }
}

const saveHistory = () => {
  localStorage.setItem('report_export_history', JSON.stringify(exportHistory.value))
}

const deleteHistory = (date) => {
  exportHistory.value = exportHistory.value.filter(item => item.date !== date)
  saveHistory()
}

// --- PROJECT FETCH LOGIC ---
const fetchProjects = async () => {
  try {
    const res = await projectApi.getAllSystem()
    const data = res.data || res
    projects.value = data.map(p => ({
      name: p.name,
      id: p._id || p.id,
      startDate: p.startDate,
      endDate: p.endDate
    }))
    if (projects.value.length > 0) {
      selectedProject.value = projects.value[0].id
      await onProjectChange()
    }
  } catch (error) {
    console.error('Error fetching projects:', error)
  }
}

const onProjectChange = async () => {
  const p = projects.value.find(x => x.id === selectedProject.value)
  if (p) {
    fromDate.value = p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : ''
    toDate.value = p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : ''
  }
  await fetchStatistics()
}

// --- STATISTICS FETCH LOGIC ---
const fetchStatistics = async () => {
  if (!selectedProject.value) return
  try {
    const res = await taskApi.getByProject(selectedProject.value)
    let data = res.data || res

    // 1. Date filters
    const filteredTasks = filterTasksByDate(data)

    // 2. Summary stats
    updateTaskSummary(filteredTasks)

    // 3. Late tasks
    updateLateTasks(filteredTasks)

    // 4. Update Charts
    prepareAndRenderCharts(filteredTasks)

  } catch (error) {
    console.error('Error fetching statistics:', error)
    updateCharts({}) // Fallback
  }
}

const filterTasksByDate = (tasks) => {
  return tasks.filter(t => {
    let isValid = true
    if (fromDate.value && t.deadline && new Date(t.deadline) < new Date(fromDate.value)) isValid = false
    if (toDate.value && t.deadline && new Date(t.deadline) > new Date(toDate.value + 'T23:59:59')) isValid = false
    return isValid
  })
}

const updateTaskSummary = (tasks) => {
  total.value = tasks.length
  done.value = tasks.filter(t => t.status === 'DONE').length

  const tTodo = tasks.filter(t => t.status === 'TO_DO').length
  const tInProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length
  const tCancelled = tasks.filter(t => t.status === 'CANCELLED').length

  status.value = [
    { name: 'Cần làm', count: tTodo, percent: total.value ? Math.round((tTodo / total.value) * 100) : 0 },
    { name: 'Đang làm', count: tInProgress, percent: total.value ? Math.round((tInProgress / total.value) * 100) : 0 },
    { name: 'Hoàn thành', count: done.value, percent: total.value ? Math.round((done.value / total.value) * 100) : 0 },
    { name: 'Đã hủy', count: tCancelled, percent: total.value ? Math.round((tCancelled / total.value) * 100) : 0 },
  ]
}

const updateLateTasks = (tasks) => {
  const now = new Date()
  const projName = getProjectName()
  
  const lates = tasks.filter(t => t.status !== 'DONE' && t.status !== 'CANCELLED' && t.deadline && new Date(t.deadline) < now)
  
  lateTasks.value = lates.map(t => {
    const days = Math.floor((now - new Date(t.deadline)) / (1000 * 60 * 60 * 24))
    return {
      title: t.title,
      project: projName,
      projectId: selectedProject.value,
      days: days > 0 ? days : 1
    }
  }).sort((a,b) => b.days - a.days).slice(0, 5)
}

const prepareAndRenderCharts = (tasks) => {
  const dateMap = {}
  tasks.forEach(t => {
    const dbDate = new Date(t.createdAt || t.deadline || new Date())
    const d = `${dbDate.getDate().toString().padStart(2, '0')}/${(dbDate.getMonth() + 1).toString().padStart(2, '0')}`
    if (!dateMap[d]) dateMap[d] = { total: 0, done: 0 }
    dateMap[d].total += 1
    if (t.status === 'DONE') dateMap[d].done += 1
  })

  const dates = Object.keys(dateMap).sort()
  let cumTotal = 0, cumDone = 0
  const chartLabels = [], chartDataValues = []

  if (dates.length === 0) {
    chartLabels.push('Không có dữ liệu')
    chartDataValues.push(0)
  } else {
    dates.forEach(d => {
      cumTotal += dateMap[d].total
      cumDone += dateMap[d].done
      chartLabels.push(d)
      chartDataValues.push(cumTotal ? Math.round((cumDone / cumTotal) * 100) : 0)
    })
  }

  updateCharts({
    progressChartData: {
      labels: chartLabels,
      datasets: [{ label: 'Tiến độ (%)', data: chartDataValues, borderColor: '#1976d2', tension: 0.4 }]
    },
    statusChart: {
      labels: ['Cần làm', 'Đang làm', 'Hoàn thành', 'Đã hủy'],
      data: status.value.map(s => s.count)
    }
  })
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
          borderWidth: 1
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '70%',
        plugins: { legend: { position: 'bottom', align: 'center', labels: { boxWidth: 15, padding: 15 } } }
      }
    })
  }
}

// --- ROUTING ---
const goDetail = () => {
  if (!selectedProject.value) return
  router.push({ name: 'ReportDetail', query: { projectId: selectedProject.value } })
}

const goToTaskReport = (projectId) => {
  if (!projectId) return
  router.push({ name: 'ReportDetail', query: { projectId } })
}

// --- REPORT EXPORT LOGIC ---
const getProjectName = () => {
  return projects.value.find(p => p.id === selectedProject.value)?.name || 'Dự án'
}

const getAssigneeName = (t) => {
  if (t.assignee) return t.assignee.fullName || t.assignee.name || t.assigneeId || ''
  const u = userStore.users.find(u => u.id === t.assigneeId)
  return u ? u.fullName : (t.assigneeId || '')
}

const getExportHeaders = () => {
  let headers = ['Tên công việc', 'Trạng thái', 'Ngày tạo', 'Hạn chót', 'Người thực hiện']
  if (includeAttachments.value) headers.push('Đính kèm')
  if (includeHistory.value) headers.push('Cập nhật lần cuối')
  return headers
}

const generateChartsHtml = () => {
  if (!includeCharts.value) return ''
  
  const progressCanvas = document.getElementById('progressChart')
  const statusCanvas = document.getElementById('statusChart')
  const progressImg = progressCanvas ? progressCanvas.toDataURL('image/png') : ''
  const statusImg = statusCanvas ? statusCanvas.toDataURL('image/png') : ''
  
  return `
    <h3>Biểu đồ báo cáo</h3>
    <div style="display: flex; gap: 20px; align-items: start; margin-bottom: 20px;">
      ${progressImg ? `<div><h4>Tiến độ</h4><img src="${progressImg}" style="max-width: 400px;" /></div>` : ''}
      ${statusImg ? `<div><h4>Trạng thái</h4><img src="${statusImg}" style="max-width: 300px;" /></div>` : ''}
    </div>
  `
}

const generateTableRowsHtml = (tasks) => {
  if (!includeDetails.value) return '<p><i>Không bao gồm bảng chi tiết công việc.</i></p>'
  
  const rows = tasks.map(t => {
    let extraCells = ''
    if (includeAttachments.value) extraCells += `<td>${t.attachments ? t.attachments.length : 0} file</td>`
    if (includeHistory.value) extraCells += `<td>${t.updatedAt ? new Date(t.updatedAt).toLocaleDateString('vi-VN') : ''}</td>`
    
    return `<tr>
      <td>${t.title || ''}</td>
      <td>${t.status || ''}</td>
      <td>${t.createdAt ? new Date(t.createdAt).toLocaleDateString('vi-VN') : ''}</td>
      <td>${t.deadline ? new Date(t.deadline).toLocaleDateString('vi-VN') : ''}</td>
      <td>${getAssigneeName(t)}</td>
      ${extraCells}
    </tr>`
  }).join('')

  const headers = getExportHeaders()
  return `
    <table>
      <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `
}

const exportPdf = (tasks, projName, chartsHtml) => {
  const tableHtml = generateTableRowsHtml(tasks)
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  printWindow.document.write(`
    <html>
      <head>
        <title>Báo cáo dự án - ${projName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
        </style>
      </head>
      <body>
        <h2>Báo cáo dự án: ${projName}</h2>
        <p>Thời gian xuất: ${new Date().toLocaleString('vi-VN')}</p>
        ${chartsHtml}
        ${tableHtml}
        <script>
          window.onload = function() { window.print(); }
          window.onafterprint = function() { window.close(); }
        </${'script'}>
      </body>
    </html>
  `)
  printWindow.document.close()
}

const exportExcel = (tasks, projName, chartsHtml) => {
  let tableHtml = '<p><i>Không bao gồm bảng chi tiết công việc.</i></p>'
  if (includeDetails.value) {
    const rows = tasks.map(t => {
      let extraCells = ''
      if (includeAttachments.value) extraCells += `<td>${t.attachments ? t.attachments.length : 0} file</td>`
      if (includeHistory.value) extraCells += `<td>${t.updatedAt ? new Date(t.updatedAt).toLocaleDateString('vi-VN') : ''}</td>`
      return `<tr>
        <td>${t.title || ''}</td>
        <td>${t.status || ''}</td>
        <td>${t.createdAt ? new Date(t.createdAt).toLocaleDateString('vi-VN') : ''}</td>
        <td>${t.deadline ? new Date(t.deadline).toLocaleDateString('vi-VN') : ''}</td>
        <td>${getAssigneeName(t)}</td>
        ${extraCells}
      </tr>`
    }).join('')
    tableHtml = `
      <table border="1">
        <thead><tr>${getExportHeaders().map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `
  }

  const excelContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"></head>
    <body>
      <h2>Báo cáo dự án: ${projName}</h2>
      ${chartsHtml}
      ${tableHtml}
    </body>
    </html>
  `
  downloadBlob(excelContent, `report-${selectedProject.value}.xls`, 'application/vnd.ms-excel')
}

const exportCsv = (tasks) => {
  const headers = getExportHeaders()
  let rows = []
  
  if (includeDetails.value) {
    rows = tasks.map(t => {
      let cols = [
        `"${(t.title || '').replace(/"/g, '""')}"`,
        `"${t.status || ''}"`,
        `"${t.createdAt ? new Date(t.createdAt).toLocaleDateString('vi-VN') : ''}"`,
        `"${t.deadline ? new Date(t.deadline).toLocaleDateString('vi-VN') : ''}"`,
        `"${getAssigneeName(t)}"`
      ]
      if (includeAttachments.value) cols.push(`"${t.attachments ? t.attachments.length : 0} file"`)
      if (includeHistory.value) cols.push(`"${t.updatedAt ? new Date(t.updatedAt).toLocaleDateString('vi-VN') : ''}"`)
      return cols
    })
  }

  const csvContent = "\uFEFF" + headers.join(',') + '\n' + rows.map(e => e.join(',')).join('\n')
  downloadBlob(csvContent, `report-${selectedProject.value}.csv`, 'text/csv;charset=utf-8;')
}

const downloadBlob = (content, filename, contentType) => {
  const blob = new Blob([content], { type: contentType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
}

const exportReport = async () => {
  if (!selectedProject.value) return
  
  const projName = getProjectName()
  
  try {
    const res = await taskApi.getByProject(selectedProject.value)
    let tasks = res.data || res
    tasks = filterTasksByDate(tasks)

    const chartsHtml = generateChartsHtml()

    if (exportFormat.value === 'pdf') {
      exportPdf(tasks, projName, chartsHtml)
    } else if (exportFormat.value === 'excel') {
      exportExcel(tasks, projName, chartsHtml)
    } else {
      exportCsv(tasks)
    }

    exportDialog.value = false
    alert('Xuất báo cáo thành công!')

    exportHistory.value.unshift({
      date: new Date().toLocaleString('vi-VN'),
      projectName: projName,
      format: exportFormat.value.toUpperCase(),
      status: 'Hoàn thành'
    })
    saveHistory()
  } catch (err) {
    console.error('Error exporting report:', err)
    
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

.primary-gradient-btn {
  background: linear-gradient(45deg, #1976D2, #42A5F5) !important;
  color: white !important;
  text-transform: none !important;
  letter-spacing: 0.5px;
}

.danger-gradient-btn {
  background: linear-gradient(45deg, #E53935, #EF5350) !important;
  color: white !important;
  text-transform: none !important;
  letter-spacing: 0.5px;
}

.success-gradient-btn {
  background: linear-gradient(45deg, #2E7D32, #66BB6A) !important;
  color: white !important;
  text-transform: none !important;
  letter-spacing: 0.5px;
}

.dark-gradient-btn {
  background: linear-gradient(45deg, #212121, #424242) !important;
  color: white !important;
  text-transform: none !important;
  letter-spacing: 0.5px;
}

@keyframes pulse-primary {
  0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
}

.pulse-primary {
  animation: pulse-primary 2s infinite;
}

@keyframes pulse-success {
  0% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(46, 125, 50, 0); }
  100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0); }
}

.pulse-success {
  animation: pulse-success 2s infinite;
}

@keyframes pulse-dark {
  0% { box-shadow: 0 0 0 0 rgba(33, 33, 33, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(33, 33, 33, 0); }
  100% { box-shadow: 0 0 0 0 rgba(33, 33, 33, 0); }
}

.pulse-dark {
  animation: pulse-dark 2s infinite;
}
</style>
