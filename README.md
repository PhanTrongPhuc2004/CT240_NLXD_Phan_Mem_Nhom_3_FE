# Ứng dụng Quản lý Công việc Nhóm - Frontend

**Tên dự án**: CT240_NLX_D_Phan_Mem_Nhom_3  
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

Frontend của ứng dụng quản lý công việc nhóm là giao diện web hiện đại được xây dựng bằng **Vue.js 3** (Composition API + TypeScript), kết nối với Backend (Spring Boot) qua **REST API** và **WebSocket** (STOMP) để hỗ trợ real-time.

Các chức năng chính:

- Đăng ký / Đăng nhập (JWT authentication)
- Dashboard tổng quan (dự án, task cá nhân, thông báo)
- Quản lý dự án (tạo, xem chi tiết, thêm/xóa thành viên, phân quyền co-manager)
- Quản lý công việc (task): CRUD, cập nhật trạng thái, gán người thực hiện, lọc/sắp xếp, deadline
- Bình luận & trao đổi trong task (real-time như chat)
- Thông báo real-time (bell icon + toast notification)
- Thống kê & báo cáo (tiến độ dự án, biểu đồ, export CSV/PDF)

Giao diện responsive, sử dụng **Vue Router** cho điều hướng, **Pinia** cho quản lý trạng thái toàn cục, **Axios** cho gọi API, và **Vite** làm build tool.

## Công nghệ sử dụng

- **Framework**: Vue.js 3 (Composition API + <script setup>)
- **Ngôn ngữ**: TypeScript
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **HTTP Client**: Axios
- **Real-time**: WebSocket / STOMP
- **Build Tool**: Vite
- **Lint & Format**: ESLint + Prettier
- **Testing**: Vitest
- **UI Library**: (tùy chọn) Tailwind CSS / Bootstrap / Vuetify / Element Plus
- **IDE**: VS Code
- **Package Manager**: npm / pnpm / yarn

## Cấu trúc thư mục (Frontend)

```text
frontend/
├── node_modules/                     # Dependencies (không commit)
├── public/                           # Static files
│   └── favicon.ico
├── src/
│   ├── assets/                       # Hình ảnh, icons, fonts
│   ├── components/                   # Component tái sử dụng
│   │   ├── common/                   # Button, Card, Modal...
│   │   ├── layout/                   # Header, Sidebar, Footer
│   │   └── ...                       # TaskCard, CommentList...
│   ├── composables/                  # Custom hooks (useAuth, useTask, useApi...)
│   ├── router/                       # Vue Router config
│   ├── stores/                       # Pinia stores (auth, project, task, notification...)
│   ├── views/                        # Các page chính
│   │   ├── auth/                     # Login, Register
│   │   ├── dashboard/                # Trang chính
│   │   ├── projects/                 # List & Detail Project
│   │   ├── tasks/                    # Task detail
│   │   └── reports/                  # Báo cáo
│   ├── api/                          # Axios instance + interceptors
│   ├── App.vue                       # Root component
│   └── main.ts                       # Entry point
├── .editorconfig
├── .env.local                        # Biến môi trường local (không commit)
├── .gitignore
├── .prettierrc.json
├── env.d.ts
├── eslint.config.js
├── index.html
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.vitest.json
├── vite.config.ts
└── vitest.config.ts
```

## Các bước chạy local

Yêu cầu hệ thống:

- Node.js 18+ (LTS khuyến nghị)
- npm 9+ (hoặc pnpm/yarn)
- Backend đang chạy tại http://localhost:8080

## Cài đặt và chạy

1. **Di chuyển vào thư mục frontend**:
   cd frontend

2. **Cài đặt dependencies:**:
   npm install

3. **Chạy ứng dụng development:**:
   npm run dev

- Mở browser: http://localhost:5173

Chúc bạn chạy thành công! Nếu gặp lỗi, kiểm tra console log và báo lại nhóm nhé.

© 2026 Nhóm 3 - Ứng dụng Quản lý Công việc Nhóm
Đại học Cần Thơ - Trường Công nghệ Thông tin và Truyền thông
