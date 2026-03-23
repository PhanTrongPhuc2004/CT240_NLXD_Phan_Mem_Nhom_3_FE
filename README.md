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
**Ngày hoàn thành**: Tháng 03/2026

## Mô tả dự án

Frontend là giao diện web hiện đại cho ứng dụng quản lý công việc nhóm, xây dựng bằng **Vue.js 3** (Composition API) và **Vuetify**, kết nối Backend (Spring Boot) qua REST API. Giao diện được thiết kế theo phong cách **Glassmorphism** hiện đại, thân thiện với người dùng.

### Chức năng chính:
- **Xác thực & Phân quyền**: Đăng ký, Đăng nhập (JWT), Phân quyền chặt chẽ (Admin - Quản trị hệ thống, Manager - Quản lý dự án, Member - Thành viên).
- **Dashboard**:
  - **Admin**: Thống kê tổng quan hệ thống (User, Project, Task), biểu đồ trạng thái dự án.
  - **Member**: Thống kê công việc cá nhân (To Do, Done), dự án tham gia, deadline sắp tới.
- **Quản lý Dự án**:
  - Tạo mới, cập nhật, xóa dự án.
  - Quản lý thành viên: Thêm thành viên, duyệt yêu cầu tham gia, phân quyền trong dự án (Owner, Manager, Member).
  - Cài đặt hiển thị dự án (Công khai/Riêng tư).
- **Quản lý Công việc (Tasks)**:
  - Tạo, sửa, xóa công việc.
  - Gán người thực hiện, đặt độ ưu tiên, hạn chót.
  - Cập nhật trạng thái (Cần làm, Đang làm, Hoàn thành, Đã hủy).
- **Tương tác & Cộng tác**:
  - Bình luận trong công việc với trình soạn thảo văn bản (Rich Text Editor).
  - Đính kèm tệp tin vào bình luận.
- **Quản lý Người dùng (Admin)**: Xem danh sách, tìm kiếm, khóa/mở khóa tài khoản, phân quyền hệ thống.
- **Hệ thống Thông báo**:
  - Nhận thông báo về công việc được giao, nhắc nhở hạn chót, hoặc thay đổi trong dự án.
  - **Tương tác trực tiếp**: Quản lý dự án có thể Chấp nhận hoặc Từ chối yêu cầu tham gia của thành viên ngay tại giao diện thông báo.
  - Đánh dấu đã đọc/chưa đọc.
- **Báo cáo & Thống kê (Advanced)**:
  - Biểu đồ trực quan: Theo dõi tiến độ dự án (Burn-down chart), phân bố trạng thái công việc (Pie chart).
  - Phân tích hiệu suất: Thống kê tỷ lệ hoàn thành, danh sách công việc trễ hạn.
  - **Xuất dữ liệu**: Hỗ trợ xuất báo cáo chi tiết ra các định dạng **PDF, Excel, CSV** phục vụ lưu trữ và in ấn.
- **Hồ sơ cá nhân**: Cập nhật thông tin cá nhân và ảnh đại diện.

## Công nghệ sử dụng

- **Framework**: Vue.js 3 (Composition API + `<script setup>`)
- **UI Library**: **Vuetify 3** (Material Design)
- State Management: Pinia
- Routing: Vue Router 4
- HTTP Client: Axios
- Rich Text Editor: VueQuill
- Notifications: SweetAlert2
- Build Tool: Vite
- Lint & Format: ESLint + Prettier
- IDE: VS Code (với Volar extension)
- Package Manager: npm

## Cấu trúc thư mục hiện tại

```text
src
 ┣ api
 ┃ ┣ index.js
 ┃ ┣ projectApi.js
 ┃ ┗ userApi.js
 ┣ components
 ┃ ┣ ProjectCard.vue
 ┃ ┗ UserAvatarName.vue
 ┣ layouts
 ┃ ┣ AdminLayout.vue
 ┃ ┗ MemberLayout.vue
 ┣ router
 ┃ ┗ index.js
 ┣ stores
 ┃ ┣ auth.js
 ┃ ┣ project.js
 ┃ ┣ task.js
 ┃ ┗ user.js
 ┣ views
 ┃ ┣ admin
 ┃ ┃ ┣ AdminDashboard.vue
 ┃ ┃ ┣ NotificationManagement.vue
 ┃ ┃ ┣ ProjectManagement.vue
 ┃ ┃ ┣ ReportDetail.vue
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
 ┃ ┃ ┃ ┣ MyProjectList.vue
 ┃ ┃ ┃ ┣ ProjectDetail.vue
 ┃ ┃ ┃ ┣ ProjectForm.vue
 ┃ ┃ ┃ ┣ ProjectList.vue
 ┃ ┃ ┣ task
 ┃ ┃ ┃ ┣ TaskDetail.vue
 ┃ ┃ ┃ ┗ TaskList.vue
 ┃ ┃ ┗ MemberDashboard.vue
 ┃ ┗ profile
 ┃ ┃ ┣ ProfileEdit.vue
 ┃ ┃ ┗ ProfileView.vue
 ┣ App.vue
 ┣ main.js
```

## Các bước chạy local

Yêu cầu hệ thống:
- Node.js 18+ (LTS khuyến nghị)
- npm 9+ (hoặc pnpm/yarn)
- Backend đang chạy tại `http://localhost:8080`

## Cài đặt và khởi chạy

1. **Cài đặt dependencies**:
   ```bash
   npm install
   ```

2. **Chạy ứng dụng development**:
   ```bash
   npm run dev
   ```

3. **Truy cập ứng dụng**:
   - Mở browser: `http://localhost:5173`
   - Đăng nhập và bắt đầu trải nghiệm.

---
Chúc bạn chạy thành công! Nếu gặp lỗi, kiểm tra console log và báo lại nhóm nhé.

© 2026 Nhóm 3 - Ứng dụng Quản lý Công việc Nhóm
Đại học Cần Thơ - Trường Công nghệ Thông tin và Truyền thông
