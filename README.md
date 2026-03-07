# Ứng dụng Quản lý Công việc Nhóm - Frontend

**Tên dự án**: CT240_NLXD_Phan_Mem_Nhom_3  
**Môn học**: Nguyên lý Xây dựng Phần mềm (CT240)  
**Nhóm thực hiện**: Nhóm 3  
**Thành viên**:
- Phan Trọng Phúc - B2203525  
- Lê Đình Duy - B2203494  
- Nguyễn Khánh Duy - B2203496  
- Nguyễn Hoàng Vinh - B2303856  
- Nguyễn Thanh Yến Khoa - B2303823  
- Nguyễn Kim Yến - B2303860  

**Giảng viên hướng dẫn**: TS. Trương Minh Thái  
**Học kỳ**: II, Năm học 2025-2026  
**Ngày hoàn thành**: Tháng 01/2026

## Mô tả dự án

Frontend là giao diện web hiện đại cho ứng dụng quản lý công việc nhóm, xây dựng bằng **Vue.js 3** (Composition API), kết nối Backend (Spring Boot) qua REST API và WebSocket (STOMP) để hỗ trợ real-time.

Chức năng chính:
- Đăng ký / Đăng nhập (JWT)
- Dashboard tổng quan
- Quản lý dự án & công việc (CRUD task, trạng thái, gán người, bình luận real-time)
- Thông báo real-time
- Thống kê & báo cáo

## Công nghệ sử dụng (hiện tại)

- Framework: Vue.js 3 (Composition API + <script setup>)
- Ngôn ngữ: JavaScript
- State Management: Pinia
- Routing: Vue Router 4
- HTTP Client: Axios (sẽ thêm sau)
- Real-time: WebSocket / STOMP (sẽ thêm sau)
- Build Tool: Vite
- Lint & Format: ESLint + Prettier
- Testing: Vitest
- UI Library: Bootstrap
- IDE: VS Code
- Package Manager: npm

## Cấu trúc thư mục hiện tại

```text
src
 ┣ api
 ┃ ┣ commentApi.js
 ┃ ┣ index.js
 ┃ ┣ notificationApi.js
 ┃ ┣ projectApi.js
 ┃ ┣ reportApi.js
 ┃ ┣ taskApi.js
 ┃ ┗ userApi.js
 ┣ assets
 ┣ components
 ┃ ┣ CommentSection.vue
 ┃ ┣ LoadingSpinner.vue
 ┃ ┣ NotificationItem.vue
 ┃ ┣ ProjectCard.vue
 ┃ ┗ TaskCard.vue
 ┣ layouts
 ┃ ┣ AdminLayout.vue
 ┃ ┣ AuthLayout.vue
 ┃ ┗ MemberLayout.vue
 ┣ plugins
 ┃ ┗ vuetify.js
 ┣ router
 ┃ ┗ index.js
 ┣ stores
 ┃ ┣ auth.js
 ┃ ┣ notification.js
 ┃ ┣ project.js
 ┃ ┣ report.js
 ┃ ┣ task.js
 ┃ ┗ user.js
 ┣ utils
 ┃ ┗ format.js
 ┣ views
 ┃ ┣ admin
 ┃ ┃ ┣ AdminDashboard.vue
 ┃ ┃ ┣ NotificationManagement.vue
 ┃ ┃ ┣ ProjectManagement.vue
 ┃ ┃ ┣ ReportManagement.vue
 ┃ ┃ ┣ TaskManagement.vue
 ┃ ┃ ┗ UserManagement.vue
 ┃ ┣ auth
 ┃ ┃ ┣ Login.vue
 ┃ ┃ ┗ Register.vue
 ┃ ┣ member
 ┃ ┃ ┣ notifications
 ┃ ┃ ┃ ┗ NotificationList.vue
 ┃ ┃ ┣ project
 ┃ ┃ ┃ ┣ ProjectDetail.vue
 ┃ ┃ ┃ ┣ ProjectForm.vue
 ┃ ┃ ┃ ┣ ProjectList.vue
 ┃ ┃ ┃ ┗ ProjectOverview.vue
 ┃ ┃ ┣ task
 ┃ ┃ ┃ ┣ TaskDetail.vue
 ┃ ┃ ┃ ┗ TaskList.vue
 ┃ ┃ ┗ MemberDashboard.vue
 ┃ ┣ shared
 ┃ ┃ ┗ Profile.vue
 ┃ ┗ Dashboard.vue
 ┣ App.vue
 ┣ main.js
 ┗ style.css
```

## Các bước chạy local

Yêu cầu hệ thống:

- Node.js 18+ (LTS khuyến nghị)
- npm 9+ (hoặc pnpm/yarn)
- Backend đang chạy tại http://localhost:8080

## Cài đặt và chạy

1. **Cài đặt dependencies:**:
   npm install

2. **Chạy ứng dụng development:**:
   npm run dev

- Mở browser: http://localhost:5173

Chúc bạn chạy thành công! Nếu gặp lỗi, kiểm tra console log và báo lại nhóm nhé.

© 2026 Nhóm 3 - Ứng dụng Quản lý Công việc Nhóm
Đại học Cần Thơ - Trường Công nghệ Thông tin và Truyền thông
