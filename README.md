# Audionix - Music Streaming Platform Backend 🎧

📖 **Giới thiệu**

Audionix là một nền tảng streaming nhạc trực tuyến được xây dựng bằng **NestJS**, cung cấp API backend cho ứng dụng nghe nhạc với đầy đủ tính năng như Spotify. Dự án hỗ trợ quản lý người dùng, nghệ sĩ, album, bài hát, playlist và nhiều tính năng khác.

---

✨ **Tính năng chính**

### 🎵 Quản lý nhạc

- **Tracks**: Upload, quản lý và streaming bài hát.
- **Albums**: Tạo và quản lý album cho nghệ sĩ.
- **Artists**: Hồ sơ nghệ sĩ và quản lý nội dung.
- **Playlists**: Tạo playlist cá nhân và công khai.

### 👥 Quản lý người dùng

- **Authentication**: Đăng ký, đăng nhập với JWT.
- **Authorization**: Phân quyền theo role (USER, ARTIST, ADMIN).
- **Profiles**: Quản lý hồ sơ người dùng.
- **Following**: Follow nghệ sĩ và album.

### 📊 Tính năng nâng cao

- **Dashboard Analytics**: Thống kê chi tiết cho admin.
- **Search**: Tìm kiếm đa tiêu chí.
- **Recommendations**: Gợi ý bài hát tương tự.
- **Liked Songs**: Quản lý bài hát yêu thích.
- **File Upload**: Upload audio và hình ảnh.

### 🔧 Tính năng hệ thống

- **Caching**: Redis cho performance tối ưu.
- **Email Service**: Gửi email xác thực và thông báo.
- **Data Seeding**: Dữ liệu mẫu cho development.
- **Error Handling**: Xử lý lỗi toàn cục.
- **Validation**: Validate dữ liệu đầu vào.

---

🛠️ **Công nghệ sử dụng**

- **Backend Framework**
  - [NestJS](https://nestjs.com/) - Progressive Node.js framework
  - [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
  - [Node.js](https://nodejs.org/) - Runtime environment
- **Database & Storage**
  - [MongoDB](https://www.mongodb.com/) - NoSQL database với Mongoose ODM
  - [Redis](https://redis.io/) - In-memory caching và session storage
  - [Multer](https://github.com/expressjs/multer) - File upload middleware
- **Authentication & Security**
  - [JWT](https://jwt.io/) - JSON Web Tokens cho authentication
  - [Passport](http://www.passportjs.org/) - Authentication middleware
  - [Bcrypt](https://www.google.com/search?q=https://github.com/kelektiv/node.bcrypt.js) - Password hashing
- **Utilities**
  - [Nodemailer](https://nodemailer.com/) - Email service
  - [Handlebars](https://handlebarsjs.com/) - Template engine cho email
  - [Class Validator](https://github.com/typestack/class-validator) - DTO validation
  - [Class Transformer](https://github.com/typestack/class-transformer) - Object transformation

---

📦 **Cài đặt**

### 1\. Clone repository

```bash
git clone https://github.com/your-username/audionix-nestjs.git
cd audionix-nestjs
```

### 2\. Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
```

### 3\. Cấu hình môi trường

Tạo file `.env` từ file `.env.example` và cấu hình các biến môi trường cần thiết:

```bash
cp .env.example .env
```

Cập nhật các thông tin trong file `.env` (database connection, JWT secret, email credentials...).

### 4\. Khởi động dịch vụ

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

---

🚀 **Sử dụng**

### API Documentation

Sau khi khởi động server, bạn có thể truy cập Swagger UI để xem tài liệu API chi tiết:

- **API Base URL**: `http://localhost:8080/api`
