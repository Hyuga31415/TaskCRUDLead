# TASK: CRUD LEAD FE VÀ BE

Backend: **Spring Boot (Java)**
Frontend: **ReactJS + (Vite)**.

## Các tính năng đã hoàn thiện

- **CRUD Lead:** Thêm mới, Xem chi tiết, Cập nhật thông tin và Xóa Khách hàng tiềm năng.
- **Tìm kiếm thông minh:** Tìm kiếm nhanh theo Tên liên hệ, Tên công ty, Số điện thoại và Email.
- **Lọc dữ liệu nâng cao (Advanced Filter):**
  - Lọc theo Trạng thái (Mới, Đang liên hệ, Đã chuyển đổi, v.v.).
  - Lọc theo Nguồn khách hàng (Facebook, Website, v.v.).
  - Lọc theo Nhóm bán hàng (Phòng ban/Organization).
  - Lọc theo Tỉnh/Thành phố.
- **Phân trang (Pagination):** Xử lý phân trang tối ưu trực tiếp từ Backend giúp tải dữ liệu nhanh chóng kể cả khi có hàng chục ngàn bản ghi.
- **Chuyển đổi Khách hàng (Convert Lead):** Chức năng lõi của CRM, cho phép chuyển đổi một Khách hàng tiềm năng (Lead) thành Khách hàng chính thức (Customer) cùng với Cơ hội bán hàng (Opportunity) thông qua Stored Procedure.

---

---

## 📊 Sơ đồ Cơ sở dữ liệu (ERD Schema)

<img width="1165" height="663" alt="image" src="https://github.com/user-attachments/assets/a8def5a8-5c50-4e5b-b740-c4255828fff9" />

---

## 🗄️ Cấu trúc Cơ sở dữ liệu (Database Schema)
Các chức năng trong phân hệ Lead tương tác mật thiết với các nhóm bảng sau trong cơ sở dữ liệu:

### 1. Nhóm bảng nghiệp vụ chính (Core Tables)
- `leads`: Bảng trung tâm lưu trữ toàn bộ thông tin của Khách hàng tiềm năng (Tên, SĐT, Email, Doanh thu dự kiến, Thông tin nguồn, Trạng thái...).
  
 <img width="986" height="521" alt="image" src="https://github.com/user-attachments/assets/d72a85f9-808b-47a7-ab40-5db15e477784" />

- `lead_product_interests`: Bảng trung gian (Many-to-Many) lưu trữ danh sách các Dịch vụ / Sản phẩm mà Lead đang quan tâm.

### 2. Nhóm bảng danh mục / Bộ lọc (Master Data)
Dùng để cấp nguồn dữ liệu cho các tính năng tạo mới và bộ lọc (Filter):
- `sys_lead_statuses`: Định nghĩa các trạng thái của Lead (Mới, Đang liên hệ, Đã chuyển đổi...).
- `sys_lead_sources`: Danh mục nguồn khách hàng (Facebook Ads, Website, Sự kiện...).
- `provinces`: Danh mục Tỉnh/Thành phố.
- `organizations`: Cấu trúc phòng ban / nhóm bán hàng.
- `campaigns`: Danh sách các chiến dịch Marketing.
- `products`: Danh mục sản phẩm / dịch vụ.
- `users`: Thông tin nhân viên (dùng để lưu người tạo và người được phân công phụ trách Lead).

### 3. Nhóm bảng liên quan đến tiến trình Chuyển đổi (Conversion Process)
Khi người dùng thực hiện "Convert Lead", hệ thống sẽ tự động gọi thủ tục `sp_ConvertLeadToCustomer` để phân bổ dữ liệu từ `leads` sang các bảng sau:
- `customers`: Khởi tạo hồ sơ Khách hàng doanh nghiệp (B2B) hoặc cá nhân (B2C) chính thức.
- `contacts`: Khởi tạo hồ sơ Người liên hệ thuộc Khách hàng tương ứng.
- `opportunities`: Tự động tạo một Cơ hội bán hàng mới dựa trên doanh thu dự kiến của Lead.
- `customer_addresses`: Lưu trữ địa chỉ trụ sở của Khách hàng.
- `audit_logs`: Lưu vết lịch sử (Audit Trail) quá trình chuyển đổi để phục vụ truy xuất sau này.

### Luồng xử lý Chuyển đổi (Conversion Logic)
Sử dụng **Stored Procedure `sp_ConvertLeadToCustomer`** để xử lý giao dịch chuyển đổi trực tiếp dưới tầng DB. Khi gọi Procedure, DB sẽ thực hiện Transaction:
1. Đọc dữ liệu từ bảng `leads`.
2. `INSERT` vào các bảng `customers`, `customer_addresses`, `contacts`, và `opportunities`.
3. `UPDATE` trạng thái của bảng `leads` thành `CONVERTED`.
4. `INSERT` log vào bảng `audit_logs`.
5. `COMMIT` nếu thành công, `ROLLBACK` nếu có bất kỳ lỗi nào xảy ra.

---

## 🛠 Công nghệ sử dụng

### Backend
- **Ngôn ngữ:** Java (JDK 17)
- **Framework:** Spring Boot 4.0.5
- **Database:** MySQL
- **Khác:** Spring Data JPA, Spring JDBC (Gọi Stored Procedure), Maven.

### Frontend
- **Thư viện chính:** React 18
- **Build Tool:** Vite
- **Routing:** React Router DOM
- **UI/UX:** CSS thuần (Custom Grid/Flexbox), React Icons, React Toastify (Thông báo).

---

---

## 📂 Cấu trúc thư mục (Monorepo)

```text
TaskCRUDLead/
├── ModuleLead/             # Chứa mã nguồn Java Spring Boot (Backend)
│   ├── src/
│   ├── pom.xml
│   └── ..........
├── ModuleLeadFE/           # Chứa mã nguồn React + Vite (Frontend)
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── .........
└── README.md
```

Hướng dẫn cài đặt và chạy dự án (Step-by-Step)
Yêu cầu hệ thống (Prerequisites)
Đảm bảo máy tính của bạn đã cài đặt các phần mềm sau:

Node.js (Phiên bản 16+ trở lên)

Java Development Kit (JDK) (Phiên bản 17 trở lên)

IntelliJ IDEA

Maven (Nếu không dùng công cụ tích hợp sẵn của IDE)

MySQL Server (Phiên bản 8.x)

Bước 1: Cài đặt Cơ sở dữ liệu (Database)
Mở công cụ quản lý MySQL (ví dụ: MySQL Workbench, DBeaver, XAMPP, WAMP...).

Tạo một database mới, ví dụ: db_crm.

Import file script SQL (db_crm.sql) của dự án vào database vừa tạo để khởi tạo các bảng và Stored Procedure (sp_ConvertLeadToCustomer).

Hướng dẫn cài đặt và Chạy dự án

Bước 2. Cài đặt môi trường Backend với IntelliJ IDEA

Để phát triển phần Backend (Spring Boot), bạn thực hiện các bước sau:

Tải và cài đặt: Tải IntelliJ IDEA (phiên bản Community hoặc Ultimate).

Mở dự án: Chọn Open -> Tìm đến thư mục ModuleLead/.

Cấu hình JDK: - Vào File > Project Structure > Project.

Chọn SDK là Java 17 (hoặc cao hơn).

Cấu hình Database: - Mở file src/main/resources/application.properties.

Chỉnh sửa spring.datasource.username và spring.datasource.password theo tài khoản MySQL của bạn:

Properties
spring.datasource.url=jdbc:mysql://localhost:3306/db_crm?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=mat_khau_cua_ban

Chạy ứng dụng: Tìm file có đuôi ...Application.java trong thư mục src/main/java, Click chuột phải và chọn Run.

Nếu không có IntelliJ IDEA:
Mở Terminal (Command Prompt) tại thư mục ModuleLead/, chạy lệnh sau để tải thư viện và khởi động server:

Bash
mvn clean install
mvn spring-boot:run
Backend sẽ khởi động và chạy tại địa chỉ: http://localhost:8080

Bước 3: Cài đặt và Chạy Frontend (React + Vite)
Mở một cửa sổ Terminal mới và di chuyển vào thư mục ModuleLeadFE/.

Bash
cd ModuleLeadFE
Cài đặt các thư viện cần thiết (bao gồm react-router-dom, react-toastify, react-icons...):

Bash
npm install
Khởi động ứng dụng React:

Bash
npm run dev
Frontend sẽ được biên dịch siêu tốc bởi Vite và chạy tại địa chỉ: http://localhost:5173 (hoặc một port khác được hiển thị trên terminal).

Bước 4: Trải nghiệm hệ thống
Mở trình duyệt web và truy cập vào đường dẫn của Frontend (Ví dụ: http://localhost:5173). Giao diện quản lý Khách hàng Tiềm năng sẽ xuất hiện và đã sẵn sàng sử dụng! 

Giao diện danh sách Leads:
<img width="1341" height="595" alt="image" src="https://github.com/user-attachments/assets/2e238a1f-6e6c-45a3-96e8-707098785eae" />
<img width="1341" height="591" alt="image" src="https://github.com/user-attachments/assets/e2b3e549-f42d-4443-8c42-64ef4eac756f" />

Giao diện thêm Leads:
<img width="1345" height="584" alt="image" src="https://github.com/user-attachments/assets/9c44ce93-9b33-4622-bbe8-9c3ca35d9626" />
<img width="1340" height="570" alt="image" src="https://github.com/user-attachments/assets/e5965b84-2b87-4a93-98ce-d06691298ae1" />

Giao diện xem chi tiết Leads:

<img width="670" height="583" alt="image" src="https://github.com/user-attachments/assets/6ab48e57-3f9f-4b80-8c96-6f80005cac04" />

