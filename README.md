Hệ thống CRM - Quản lý Khách hàng Tiềm năng (Lead Management)

Dự án này là một phân hệ Quản lý Khách hàng Tiềm năng (Lead) thuộc hệ thống Quản trị Quan hệ Khách hàng (CRM). Dự án được thiết kế theo kiến trúc Monorepo với Backend là Spring Boot (Java) và Frontend là ReactJS (Vite).

Các tính năng nổi bật đã hoàn thiện

CRUD Lead: Thêm mới, Xem chi tiết, Cập nhật thông tin và Xóa Khách hàng tiềm năng.

Tìm kiếm thông minh: Tìm kiếm nhanh theo Tên liên hệ, Tên công ty, Số điện thoại và Email.

Lọc dữ liệu nâng cao (Advanced Filter):

Lọc theo Trạng thái (Mới, Đang liên hệ, Đã chuyển đổi, v.v.).

Lọc theo Nguồn khách hàng (Facebook, Website, v.v.).

Lọc theo Nhóm bán hàng (Phòng ban/Organization).

Lọc theo Tỉnh/Thành phố.

Phân trang (Pagination): Xử lý phân trang tối ưu trực tiếp từ Backend giúp tải dữ liệu nhanh chóng kể cả khi có hàng chục ngàn bản ghi.

Chuyển đổi Khách hàng (Convert Lead): Chức năng lõi của CRM, cho phép chuyển đổi một Khách hàng tiềm năng (Lead) thành Khách hàng chính thức (Customer) cùng với Cơ hội bán hàng (Opportunity) thông qua Stored Procedure.

Công nghệ sử dụng

Backend

Ngôn ngữ: Java (JDK 17+)

Framework: Spring Boot 4.0.5

Database: MySQL

Khác: Spring Data JPA, Spring JDBC (Gọi Stored Procedure), Maven.

Frontend

Thư viện chính: React 18

Build Tool: Vite

Routing: React Router DOM

UI/UX: CSS thuần (Custom Grid/Flexbox), React Icons, React Toastify (Thông báo).

📂 Cấu trúc thư mục (Monorepo)

my-crm-project/
├── ModuleLead/            # Chứa mã nguồn Java Spring Boot
│   ├── src/
│   ├── pom.xml
│   └── application.properties
├── ModuleLeadFE/           # Chứa mã nguồn React + Vite
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── README.md


⚙️ Hướng dẫn cài đặt và chạy dự án (Step-by-Step)

Yêu cầu hệ thống (Prerequisites)

Đảm bảo máy tính của bạn đã cài đặt các phần mềm sau:

Node.js (Phiên bản 16+ trở lên)

Java Development Kit (JDK) (Phiên bản 17 trở lên)

Maven (Nếu không dùng công cụ tích hợp sẵn của IDE)

MySQL Server (Phiên bản 8.x)

Bước 1: Cài đặt Cơ sở dữ liệu (Database)

Mở công cụ quản lý MySQL (ví dụ: MySQL Workbench, DBeaver, XAMPP, Wamp...).

Tạo một database mới, ví dụ: db_crm.

Import file script SQL (db_crm.sql) của dự án vào database vừa tạo để khởi tạo các bảng và Stored Procedure (sp_ConvertLeadToCustomer).

Bước 2: Cấu hình và Chạy Backend (Spring Boot)

Mở thư mục backend/ bằng IDE của bạn (IntelliJ IDEA, Eclipse, hoặc VS Code).

Mở file cấu hình cơ sở dữ liệu src/main/resources/application.properties (hoặc .yml) và thay đổi thông tin kết nối cho khớp với máy của bạn:

spring.datasource.url=jdbc:mysql://localhost:3306/db_crm?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=mat_khau_cua_ban


Mở Terminal (Command Prompt) tại thư mục ModuleLead/, chạy lệnh sau để tải thư viện và khởi động server:

mvn clean install
mvn spring-boot:run


Backend sẽ khởi động và chạy tại địa chỉ: http://localhost:8080

Bước 3: Cài đặt và Chạy Frontend (React + Vite)

Mở một cửa sổ Terminal mới và di chuyển vào thư mục frontend/.

cd frontend


Cài đặt các thư viện cần thiết (bao gồm react-router-dom, react-toastify, react-icons...):

npm install


Khởi động ứng dụng React:

npm run dev


Frontend sẽ được biên dịch siêu tốc bởi Vite và chạy tại địa chỉ: http://localhost:5173 (hoặc một port khác được hiển thị trên terminal).

Bước 4: Trải nghiệm hệ thống

Mở trình duyệt web và truy cập vào đường dẫn của Frontend (Ví dụ: http://localhost:5173). Giao diện quản lý Khách hàng Tiềm năng sẽ xuất hiện và đã sẵn sàng sử dụng! 🎉