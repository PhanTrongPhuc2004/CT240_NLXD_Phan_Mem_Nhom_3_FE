<template>
  <v-container>
    <h2 class="mb-6">Báo cáo & Thống kê</h2>

    <!-- Bộ lọc -->
    <v-card class="pa-4 mb-6">
      <v-row>
        <v-col cols="3">
          <v-select label="Chọn dự án" :items="projects" variant="outlined" />
        </v-col>

        <v-col cols="3">
          <v-text-field label="Từ ngày" type="date" variant="outlined" />
        </v-col>

        <v-col cols="3">
          <v-text-field label="Đến ngày" type="date" variant="outlined" />
        </v-col>

        <v-col cols="3" class="d-flex justify-center align-center ga-2">
          <v-btn color="primary">Áp dụng</v-btn>
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
                <v-btn variant="outlined" size="small" class="text-none btn-view"> Xem </v-btn>
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

              <v-select label="Dự án" :items="projects" variant="outlined" class="mb-1" />

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
                  <v-btn block variant="outlined" class="btn-export">
                    <div class="btn-content">
                      CSV
                      <span class="sub-text text-none">Dữ liệu thô</span>
                    </div>
                  </v-btn>
                </v-col>

                <v-col cols="4">
                  <v-btn block variant="outlined" class="btn-export">
                    <div class="btn-content">
                      PDF
                      <span class="sub-text text-none">Tài liệu cố định</span>
                    </div>
                  </v-btn>
                </v-col>

                <v-col cols="4">
                  <v-btn block variant="outlined" class="btn-export">
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
                    <th>Người yêu cầu</th>
                    <th>Định dạng</th>
                    <th>Trạng thái</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="item in exportHistory" :key="item.date">
                    <td>{{ item.date }}</td>

                    <td>{{ item.user }}</td>

                    <td>{{ item.format }}</td>

                    <td>{{ item.status }}</td>

                    <td>
                      <v-btn icon="mdi-download" size="small" variant="text" />

                      <v-btn icon="mdi-delete" size="small" variant="text" />
                    </td>
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

<script>
import Chart from 'chart.js/auto'

export default {
  data() {
    return {
      projects: ['Website', 'Mobile App', 'CRM System'],

      status: [
        {
          name: 'To Do',
          count: 10,
          percent: 13,
        },
        {
          name: 'Đang tiến hành',
          count: 15,
          percent: 20,
        },
        {
          name: 'Hoàn thành',
          count: 45,
          percent: 60,
        },
        {
          name: 'Đã hủy',
          count: 5,
          percent: 7,
        },
      ],

      lateTasks: [
        {
          title: 'Thiết kế giao diện Dashboard',
          project: 'Website Quản lý công việc',
          days: 3,
        },
        {
          title: 'Viết API đăng nhập',
          project: 'Hệ thống Backend',
          days: 2,
        },
        {
          title: 'Tối ưu database',
          project: 'CRM System',
          days: 5,
        },
        {
          title: 'Test chức năng báo cáo',
          project: 'Dashboard Analytics',
          days: 1,
        },
        {
          title: 'Cập nhật tài liệu hướng dẫn',
          project: 'Project Documentation',
          days: 4,
        },
      ],
      done: 45,
      total: 60,

      exportDialog: false,

      exportHistory: [
        {
          date: '2024-01-10',
          user: 'Nguyễn Văn A',
          format: 'PDF',
          status: 'Hoàn thành',
        },
        {
          date: '2024-01-08',
          user: 'Trần Thị B',
          format: 'Excel',
          status: 'Thất bại',
        },
        {
          date: '2024-01-05',
          user: 'Lê Cảnh C',
          format: 'CSV',
          status: 'Hoàn thành',
        },
      ],
      orientation: 'portrait',
      paperSize: 'a4',
    }
  },

  computed: {
    progressPercent() {
      return Math.round((this.done / this.total) * 100)
    },
  },

  mounted() {
    this.createCharts()
  },

  methods: {
    createCharts() {
      // line chart
      new Chart(document.getElementById('progressChart'), {
        type: 'line',

        data: {
          labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5'],

          datasets: [
            {
              label: 'Tiến độ',

              data: [20, 35, 50, 70, 80],

              borderColor: '#1976d2',

              tension: 0.4,
            },
          ],
        },
      })

      // donut chart
      new Chart(document.getElementById('statusChart'), {
        type: 'doughnut',

        data: {
          labels: ['To Do', 'Đang tiến hành', 'Hoàn thành', 'Đã hủy'],

          datasets: [
            {
              data: [10, 15, 45, 5],

              backgroundColor: ['#9e9e9e', '#2196f3', '#4caf50', '#f44336'],

              borderWidth: 0,
              spacing: 4,
              borderRadius: 6,
            },
          ],
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'bottom',
              align: 'center',
              labels: {
                boxWidth: 15,
                padding: 15,
              },
            },
          },
        },
      })
    },
    //Xuất báo cáo
    exportReport() {
      console.log('Xuất báo cáo')

      this.exportDialog = false
    },
  },
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
</style>
