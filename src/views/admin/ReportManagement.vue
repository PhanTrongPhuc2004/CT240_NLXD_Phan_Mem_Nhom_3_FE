<template>
<v-container>

<h2 class="mb-6">Báo cáo & Thống kê</h2>

<!-- Bộ lọc -->
<v-card class="pa-4 mb-6">
<v-row>

<v-col cols="3">
<v-select
label="Chọn dự án"
:items="projects"
variant="outlined"
/>
</v-col>

<v-col cols="3">
<v-text-field
label="Từ ngày"
type="date"
variant="outlined"
/>
</v-col>

<v-col cols="3">
<v-text-field
label="Đến ngày"
type="date"
variant="outlined"
/>
</v-col>

<v-col cols="3" class="d-flex justify-center align-center ga-2">
<v-btn color="primary">Áp dụng</v-btn>
<v-btn color="success">Xuất CSV</v-btn>
</v-col>
</v-row>
</v-card>

<v-row>

<!-- Tiến độ công việc -->
<v-col cols="4">
<v-card class="pa-4">

<h3 class="mb-0">Tiến độ công việc chính</h3>
<p class="text-grey text-caption mb-4">Tổng quan về tiến độ dự án.</p>
<p class="mt-3">45 / 60 công việc</p>

<v-progress-linear
:model-value="75"
height="10"
color="green"
/>

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

<div
v-for="item in status"
:key="item.name"
class="status-card"
>

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

<v-chip class="percent-chip">
{{ item.percent }}%
</v-chip>

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
          <p class="text-grey text-caption mb-4" >
            Danh sách 5 công việc trễ hạn gần đây nhất.
          </p>
        </v-col>

        <v-col cols="2" class="d-flex justify-end">
          <v-chip color="grey-lighten-2">
            {{ lateTasks.length }}
          </v-chip>
        </v-col>
      </v-row>

      <!-- List -->
      <v-list>

        <v-list-item
          v-for="task in lateTasks"
          :key="task.title"
        >

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
            <span class="text-red">
              Trễ hạn: {{ task.days }} ngày
            </span>
          </v-list-item-subtitle>

          <!-- button -->
          <template v-slot:append>
            <v-btn variant="outlined" size="small" class="text-none btn-view">
              Xem
            </v-btn>
          </template>

        </v-list-item>

        <v-divider></v-divider>

      </v-list>

    </v-card>
  </v-col>
</v-row>


</v-container>
</template>



<script>
import Chart from "chart.js/auto"

export default {

data(){
return{

projects:[
"Website",
"Mobile App",
"CRM System"
],

status:[
{
name:"To Do",
count:10,
percent:13
},
{
name:"Đang tiến hành",
count:15,
percent:20
},
{
name:"Hoàn thành",
count:45,
percent:60
},
{
name:"Đã hủy",
count:5,
percent:7
}
],

lateTasks: [
        {
          title: "Thiết kế giao diện Dashboard",
          project: "Website Quản lý công việc",
          days: 3
        },
        {
          title: "Viết API đăng nhập",
          project: "Hệ thống Backend",
          days: 2
        },
        {
          title: "Tối ưu database",
          project: "CRM System",
          days: 5
        },
        {
          title: "Test chức năng báo cáo",
          project: "Dashboard Analytics",
          days: 1
        },
        {
          title: "Cập nhật tài liệu hướng dẫn",
          project: "Project Documentation",
          days: 4
        }
      ]


}
},

mounted(){
this.createCharts()
},

methods:{

createCharts(){

// line chart
new Chart(document.getElementById("progressChart"),{

type:"line",

data:{
labels:["Tuần 1","Tuần 2","Tuần 3","Tuần 4","Tuần 5"],

datasets:[
{
label:"Tiến độ",

data:[20,35,50,70,80],

borderColor:"#1976d2",

tension:0.4
}
]
}

})


// donut chart
new Chart(document.getElementById("statusChart"),{

type:"doughnut",

data:{
labels:[
"To Do",
"Đang tiến hành",
"Hoàn thành",
"Đã hủy"
],

datasets:[
{
data:[10,15,45,5],

backgroundColor:[
"#9e9e9e",
"#2196f3",
"#4caf50",
"#f44336"
],

borderWidth:0,
spacing:4,
borderRadius:6
}
]
},

options:{
  responsive:true,
  maintainAspectRatio:false,
  cutout:"70%",
  plugins:{
    legend:{
      position:"bottom",
      align:"center",
      labels:{
        boxWidth:15,
        padding:15
      }
    }
  }
}

})

}

}

}
</script>

<style scoped>

h3{
margin-bottom:15px;
font-weight:600;
}

/*Biểu đồ tròn*/
#statusChart{
max-width: 400px;
max-height: 400px;
margin:auto;
}

/*Thẻ phân tích dự án*/
.status-card{
border:1px solid #e0e0e0;
padding:12px;
border-radius:6px;
margin-bottom:12px;
}

.status-name{
margin-bottom:6px;
font-weight:500;
}

.status-row{
display:flex;
align-items:center;
gap:12px;
}

.status-progress{
flex:1;
}

.status-info{
display:flex;
align-items:center;
gap:8px;
}

.status-count{
font-weight:500;
color:#555;
}

.percent-chip{
background:#111111;
color:white;
}

/*Button xem công việc trễ hạn */
.btn-view:hover{
background-color:#000000;
color:white;
}
</style>


