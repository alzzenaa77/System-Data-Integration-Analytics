# Design Document: Fee Intelligence & Market Benchmarking System

## Overview

Sistem Fee Intelligence & Market Benchmarking adalah aplikasi web berbasis role yang memungkinkan MUC Consulting untuk mengumpulkan, memvalidasi, dan menganalisis data fee competitor serta informasi lintas divisi. Sistem ini mengimplementasikan workflow validasi bertingkat dengan sistem reward berbasis poin untuk mendorong kontribusi data berkualitas.

Arsitektur sistem menggunakan pendekatan three-tier dengan presentation layer (web frontend), business logic layer (backend API), dan data layer (database). Sistem mendukung 4 role pengguna dengan hak akses yang berbeda dan workflow validasi yang terstruktur.

## Architecture

### High-Level Architecture

Sistem menggunakan arsitektur client-server dengan komponen-komponen berikut:

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Contributor  │  │  Validator   │  │Partner/SPV/  │      │
│  │   Portal     │  │   Portal     │  │Manager Portal│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Service │  │ Data Service │  │Notification  │      │
│  │              │  │              │  │  Service     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Validation   │  │Point Service │  │Dashboard     │      │
│  │  Service     │  │              │  │  Service     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Users DB   │  │  Fee Data DB │  │Cross-Division│      │
│  │              │  │              │  │   Data DB    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Notifications │  │  Audit Log   │  │   Points DB  │      │
│  │     DB       │  │      DB      │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Considerations

Sistem ini dirancang untuk dapat diimplementasikan dengan berbagai technology stack. Beberapa pilihan yang umum:

**Frontend:**
- React/Vue.js/Angular untuk Single Page Application
- Chart library (Chart.js, D3.js, atau Recharts) untuk visualisasi data

**Backend:**
- REST API atau GraphQL
- Framework: Express.js (Node.js), Django/FastAPI (Python), Spring Boot (Java), atau ASP.NET Core (C#)

**Database:**
- Relational: PostgreSQL, MySQL, atau SQL Server
- Document: MongoDB (jika diperlukan fleksibilitas schema)

**Authentication:**
- JWT (JSON Web Tokens) untuk session management
- OAuth 2.0 atau SAML untuk enterprise SSO (opsional)

## Components and Interfaces

### 1. Authentication Service

**Tanggung Jawab:**
- Mengelola autentikasi pengguna
- Mengelola session dan token
- Menentukan role dan permissions pengguna

**Interface:**

```
AuthService:
  + login(username: string, password: string): AuthResult
  + logout(token: string): boolean
  + validateToken(token: string): TokenValidation
  + getUserRole(userId: string): UserRole
  + checkPermission(userId: string, resource: string, action: string): boolean
```

**AuthResult:**
```
{
  success: boolean
  token: string
  userId: string
  role: UserRole
  expiresAt: timestamp
}
```

**UserRole:** Enum { CONTRIBUTOR, VALIDATOR, PARTNER, SPV_MANAGER_PM }

### 2. Data Service

**Tanggung Jawab:**
- Mengelola CRUD operations untuk Fee Data dan Cross-Division Data
- Mengelola status data (Pending, Need Clarification, Accepted, Rejected)
- Menyimpan dan mengambil data dari database

**Interface:**

```
DataService:
  + createFeeData(data: FeeDataInput, contributorId: string): FeeData
  + createCrossDivisionData(data: CrossDivisionInput, contributorId: string): CrossDivisionData
  + getFeeDataById(id: string): FeeData
  + getCrossDivisionDataById(id: string): CrossDivisionData
  + updateFeeDataStatus(id: string, status: ValidationStatus, notes: string): FeeData
  + updateCrossDivisionDataStatus(id: string, status: ValidationStatus, notes: string): CrossDivisionData
  + getFeeDataByStatus(status: ValidationStatus): FeeData[]
  + getCrossDivisionDataByStatus(status: ValidationStatus): CrossDivisionData[]
  + updateFeeData(id: string, data: FeeDataInput, contributorId: string): FeeData
  + updateCrossDivisionData(id: string, data: CrossDivisionInput, contributorId: string): CrossDivisionData
```

**FeeDataInput Structure:**
```
FeeDataInput {
  // Identitas Pengisi (Submitter Identity)
  submitterName: string
  submitterDivision: string
  submitterInputDate: date
  
  // Identitas (Service Provider & Recipient Identity)
  serviceProvider: string
  serviceRecipient: string
  
  // Detail Jasa (Service Details)
  serviceType: string
  scopeOfWork: text
  taxYear: string
  
  // Financial Data
  financialType: string
  financialDescription: text
  feeScheme: string
  feeAmount: decimal
  currency: string (optional, default: IDR)
  financialDate: date
}
```

### 3. Validation Service

**Tanggung Jawab:**
- Mengelola workflow validasi data
- Memproses keputusan validator (Accept, Reject, Need Clarification)
- Trigger notifikasi dan update poin

**Interface:**

```
ValidationService:
  + validateFeeData(dataId: string, validatorId: string, decision: ValidationDecision, notes: string): ValidationResult
  + validateCrossDivisionData(dataId: string, validatorId: string, decision: ValidationDecision, notes: string): ValidationResult
  + getPendingValidations(validatorId: string): ValidationItem[]
  + getValidationHistory(dataId: string): ValidationHistory[]
```

**ValidationDecision:** Enum { ACCEPT, REJECT, NEED_CLARIFICATION }

**ValidationResult:**
```
{
  success: boolean
  dataId: string
  newStatus: ValidationStatus
  pointsAwarded: number (jika applicable)
}
```

### 4. Notification Service

**Tanggung Jawab:**
- Mengirim notifikasi in-app kepada pengguna
- Mengelola queue notifikasi
- Menyimpan history notifikasi

**Interface:**

```
NotificationService:
  + sendNotification(userId: string, type: NotificationType, message: string, metadata: object): Notification
  + getNotifications(userId: string, unreadOnly: boolean): Notification[]
  + markAsRead(notificationId: string): boolean
  + getUnreadCount(userId: string): number
```

**NotificationType:** Enum { 
  NEW_DATA_SUBMITTED, 
  VALIDATION_REQUIRED, 
  CLARIFICATION_NEEDED, 
  DATA_ACCEPTED, 
  DATA_REJECTED,
  POINTS_EARNED 
}

### 5. Point Service

**Tanggung Jawab:**
- Mengelola sistem poin contributor
- Menghitung dan menambahkan poin
- Menyimpan history perolehan poin

**Interface:**

```
PointService:
  + awardPoints(contributorId: string, dataId: string, dataType: DataType, points: number): PointTransaction
  + getContributorPoints(contributorId: string): number
  + getPointHistory(contributorId: string): PointTransaction[]
  + checkRedeemablePoints(contributorId: string): RedeemablePoints
```

**PointTransaction:**
```
{
  id: string
  contributorId: string
  dataId: string
  dataType: DataType
  points: number
  timestamp: timestamp
  description: string
}
```

**RedeemablePoints:**
```
{
  totalPoints: number
  redeemableMultiples: number (kelipatan 5)
  canRedeem: boolean
}
```

### 6. Dashboard Service

**Tanggung Jawab:**
- Menyediakan data untuk dashboard berdasarkan role
- Menerapkan filter dan pencarian
- Menghasilkan insight dan statistik
- Mengelola export data

**Interface:**

```
DashboardService:
  + getFeeCompetitorDashboard(userId: string, filters: DashboardFilters): DashboardData
  + getCrossDivisionDashboard(userId: string, filters: DashboardFilters): DashboardData
  + getValidatorMonitoringDashboard(validatorId: string): MonitoringData
  + searchData(userId: string, query: string, dataType: DataType): SearchResult[]
  + exportData(userId: string, filters: DashboardFilters, format: ExportFormat): ExportFile
  + getInsights(dataType: DataType, filters: DashboardFilters): Insights
  + getFeeInsights(feeData: FeeData[]): FeeInsights
```

**DashboardFilters:**
```
{
  serviceType: string[] (opsional) // Jenis Jasa
  startDate: date (opsional) // Filter by financialDate
  endDate: date (opsional) // Filter by financialDate
  divisionCategory: string[] (opsional) // For cross-division data
  serviceProvider: string[] (opsional) // Pemberi Jasa
  serviceRecipient: string[] (opsional) // Penerima Jasa
  taxYear: string[] (opsional) // Tahun Pajak
  feeScheme: string[] (opsional) // Skema Fee
}
```

**FeeInsights:**
```
{
  totalData: number
  totalAmount: number
  averageAmount: number
  minAmount: number
  maxAmount: number
  byServiceType: { [key: string]: { count: number, total: number } }
  byFeeScheme: { [key: string]: { count: number, total: number } }
  topServiceTypes: Array<{ type: string, count: number, total: number, percentage: number }>
}
```

**ExportFormat:** Enum { CSV, EXCEL }

## Data Models

### User

```
User {
  id: string (UUID)
  username: string (unique)
  passwordHash: string
  email: string
  fullName: string
  role: UserRole
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

### FeeData

```
FeeData {
  id: string (UUID)
  contributorId: string (foreign key to User)
  
  // Identitas Pengisi (Submitter Identity)
  submitterName: string
  submitterDivision: string
  submitterInputDate: date
  
  // Identitas (Service Provider & Recipient Identity)
  serviceProvider: string (Pemberi Jasa)
  serviceRecipient: string (Penerima Jasa)
  
  // Detail Jasa (Service Details)
  serviceType: string (Jenis Jasa)
  scopeOfWork: text
  taxYear: string (Tahun Pajak)
  
  // Financial Data
  financialType: string (Jenis)
  financialDescription: text (Deskripsi)
  feeScheme: string (Skema Fee)
  feeAmount: decimal (Nominal)
  currency: string (default: IDR)
  financialDate: date (Tanggal)
  
  // System fields
  status: ValidationStatus
  validatorId: string (foreign key to User, nullable)
  validationNotes: text (nullable)
  validatedAt: timestamp (nullable)
  clarificationHistory: ClarificationEntry[] (embedded)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### CrossDivisionData

```
CrossDivisionData {
  id: string (UUID)
  contributorId: string (foreign key to User)
  title: string
  divisionCategory: string (Enum: Accounting, Customs, Legal, Tax Advisory, Tax Compliance, Tax Dispute, Transfer Pricing)
  description: text
  attachmentUrl: string (nullable)
  submissionDate: date
  status: ValidationStatus
  validatorId: string (foreign key to User, nullable)
  validationNotes: text (nullable)
  validatedAt: timestamp (nullable)
  clarificationHistory: ClarificationEntry[] (embedded)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### ClarificationEntry

```
ClarificationEntry {
  requestedBy: string (validator userId)
  requestedAt: timestamp
  requestNotes: text
  respondedBy: string (contributor userId)
  respondedAt: timestamp (nullable)
  responseNotes: text (nullable)
}
```

### Notification

```
Notification {
  id: string (UUID)
  userId: string (foreign key to User)
  type: NotificationType
  message: string
  metadata: json (data tambahan seperti dataId, dll)
  isRead: boolean
  createdAt: timestamp
  readAt: timestamp (nullable)
}
```

### PointTransaction

```
PointTransaction {
  id: string (UUID)
  contributorId: string (foreign key to User)
  dataId: string (foreign key to FeeData atau CrossDivisionData)
  dataType: DataType
  points: number
  description: string
  createdAt: timestamp
}
```

### AuditLog

```
AuditLog {
  id: string (UUID)
  userId: string (foreign key to User)
  action: string (CREATE, UPDATE, DELETE, VALIDATE, EXPORT, dll)
  resourceType: string (FeeData, CrossDivisionData, User, dll)
  resourceId: string
  changes: json (detail perubahan)
  ipAddress: string
  userAgent: string
  createdAt: timestamp
}
```

**ValidationStatus:** Enum { PENDING, NEED_CLARIFICATION, ACCEPTED, REJECTED }

**DataType:** Enum { FEE_DATA, CROSS_DIVISION_DATA }

## Frontend Components

### FeeInsightsDashboard Component

**Tanggung Jawab:**
- Menampilkan visualisasi insights dari data fee competitor
- Menghitung dan menampilkan statistik summary
- Menampilkan bar chart untuk top service types
- Menampilkan pie chart legend untuk fee scheme distribution

**Props:**
```
{
  feeData: FeeData[] (array of accepted fee data)
}
```

**Features:**
1. **Summary Cards (4 cards):**
   - Total Data: Jumlah total submissions
   - Total Amount: Total fee dalam IDR (jutaan)
   - Average Fee: Rata-rata fee per submission
   - Fee Range: Min-Max range dalam IDR

2. **Bar Chart - Top 5 Service Types:**
   - Menampilkan 5 service type dengan total fee tertinggi
   - Menampilkan percentage bar dengan gradient
   - Menampilkan total amount dan jumlah submissions

3. **Pie Chart Legend - Fee Scheme Distribution:**
   - Menampilkan distribusi fee scheme
   - Menampilkan count dan percentage untuk setiap scheme
   - Color-coded dengan HSL color scheme

**Styling:**
- Menggunakan MUC Consulting brand colors
- Gradient backgrounds untuk summary cards
- Responsive grid layout
- Modern card-based design

### Portal Components

**ValidatorPortal:**
- 2 tabs: Pending Validations, Fee Competitor
- Fee Competitor tab berisi: Insights dashboard + Data table
- Access to cross-division data with division filters (moved to Fee Competitor tab)
- Validation actions (Accept, Reject, Need Clarification)

**PartnerPortal:**
- 1 tab: Fee Competitor
- Fee Competitor tab berisi: Insights dashboard + Data table
- No access to cross-division data

**ManagerPortal:**
- 2 tabs: Fee Competitor, Cross-Division
- Fee Competitor tab berisi: Insights dashboard + Data table
- Cross-Division tab dengan division filters

**ContributorPortal:**
- 4 tabs: Submit Fee Data, Submit Cross-Division, My Data, Points
- Form untuk submit fee data (16 fields, 4 sections)
- Form untuk submit cross-division data (dengan file upload)
- View submitted data dengan status
- Points management dengan redemption feature

## Correctness Properties

*Property adalah karakteristik atau perilaku yang harus berlaku untuk semua eksekusi sistem yang valid - pada dasarnya, pernyataan formal tentang apa yang seharusnya dilakukan sistem. Property berfungsi sebagai jembatan antara spesifikasi yang dapat dibaca manusia dan jaminan kebenaran yang dapat diverifikasi mesin.*


### Property 1: Autentikasi Valid Mengembalikan Role yang Benar

*Untuk setiap* pengguna dengan kredensial valid, ketika sistem melakukan autentikasi, sistem harus mengembalikan role yang sesuai dengan role pengguna tersebut di database.

**Validates: Requirements 1.2**

### Property 2: Redirect Sesuai Role Setelah Autentikasi

*Untuk setiap* autentikasi yang berhasil, sistem harus mengarahkan pengguna ke halaman yang sesuai dengan role mereka (Contributor ke halaman input, Validator ke halaman validasi, Partner ke dashboard fee, SPV/Manager/PM ke dashboard lengkap).

**Validates: Requirements 1.4**

### Property 3: Autentikasi Gagal Mengembalikan Error

*Untuk setiap* kredensial yang invalid, sistem harus mengembalikan error dan tidak memberikan akses ke sistem.

**Validates: Requirements 1.5**

### Property 4: Data Submission Memiliki Status Pending

*Untuk setiap* data (FeeData atau CrossDivisionData) yang di-submit oleh Contributor, sistem harus menyimpan data tersebut dengan status "Pending".

**Validates: Requirements 2.3, 3.3**

### Property 4a: Data Submission Memvalidasi Field Wajib

*Untuk setiap* data FeeData yang di-submit, sistem harus memvalidasi bahwa semua field wajib (submitterName, submitterDivision, submitterInputDate, serviceProvider, serviceRecipient, serviceType, scopeOfWork, taxYear, financialType, financialDescription, feeScheme, feeAmount, financialDate) telah diisi sebelum menyimpan data.

**Validates: Requirements 2.6**

**Validates: Requirements 2.3, 3.3**

### Property 5: Data Submission Memicu Notifikasi ke Validator

*Untuk setiap* data (FeeData atau CrossDivisionData) yang di-submit oleh Contributor, sistem harus mengirim notifikasi ke Validator untuk validasi.

**Validates: Requirements 2.4, 3.4, 12.1**

### Property 6: Data Submission Mencatat Metadata Contributor

*Untuk setiap* data (FeeData atau CrossDivisionData) yang dibuat, sistem harus mencatat timestamp pembuatan dan identitas Contributor (contributorId).

**Validates: Requirements 2.5, 3.5**

### Property 7: Validasi Reject Mengubah Status Menjadi Rejected

*Untuk setiap* data (FeeData atau CrossDivisionData) yang di-reject oleh Validator, sistem harus mengubah status data menjadi "Rejected" dan data tidak boleh muncul di dashboard publik.

**Validates: Requirements 4.4, 5.3**

### Property 8: Validasi Need Clarification Mengubah Status dan Mengirim Notifikasi

*Untuk setiap* data (FeeData atau CrossDivisionData) yang diberi status "Need Clarification" oleh Validator, sistem harus mengubah status data menjadi "Need Clarification" dan mengirim notifikasi ke Contributor yang bersangkutan.

**Validates: Requirements 4.5, 5.4, 6.1, 12.2**

### Property 9: Validasi Accept Mengubah Status Menjadi Accepted

*Untuk setiap* data (FeeData atau CrossDivisionData) yang di-accept oleh Validator, sistem harus mengubah status data menjadi "Accepted" dan data harus dapat diakses di dashboard sesuai dengan hak akses role.

**Validates: Requirements 4.6, 5.5**

### Property 10: Submit Klarifikasi Mengubah Status Kembali ke Pending

*Untuk setiap* klarifikasi yang di-submit oleh Contributor untuk data dengan status "Need Clarification", sistem harus mengubah status data kembali ke "Pending" dan mengirim notifikasi ke Validator.

**Validates: Requirements 6.4**

### Property 11: Klarifikasi Tercatat di History

*Untuk setiap* klarifikasi yang dilakukan (baik request dari Validator maupun response dari Contributor), sistem harus mencatat entry klarifikasi di clarificationHistory dengan timestamp, userId, dan notes.

**Validates: Requirements 6.5**

### Property 12: Data Accepted Menambahkan Poin ke Contributor

*Untuk setiap* data (FeeData atau CrossDivisionData) yang statusnya diubah menjadi "Accepted", sistem harus menambahkan poin ke akun Contributor yang membuat data tersebut.

**Validates: Requirements 7.1**

### Property 13: Perolehan Poin Tercatat di History

*Untuk setiap* poin yang diberikan ke Contributor, sistem harus mencatat PointTransaction dengan timestamp, dataId, dataType, dan jumlah poin.

**Validates: Requirements 7.4**

### Property 14: Notifikasi untuk Kelipatan 5 Poin

*Untuk setiap* Contributor yang total poinnya mencapai kelipatan 5 setelah penambahan poin, sistem harus mengirim notifikasi bahwa poin dapat ditukar di HC.

**Validates: Requirements 7.5**

### Property 15: Dashboard Hanya Menampilkan Data Accepted

*Untuk setiap* request dashboard (fee competitor atau cross-division), sistem hanya boleh mengembalikan data dengan status "Accepted", tidak boleh mengembalikan data dengan status Pending, Need Clarification, atau Rejected.

**Validates: Requirements 8.2, 9.2, 10.2, 11.2, 11.3**

### Property 16: Partner Tidak Dapat Mengakses Cross-Division Data

*Untuk setiap* request dari pengguna dengan role Partner untuk mengakses CrossDivisionData, sistem harus menolak akses dan mengembalikan error authorization.

**Validates: Requirements 8.6**

### Property 17: Audit Log Tercatat untuk Setiap Operasi Data

*Untuk setiap* operasi data (create, update, delete, validate), sistem harus mencatat AuditLog dengan userId, action, resourceType, resourceId, dan timestamp.

**Validates: Requirements 13.2**

### Property 18: Authorization Berdasarkan Role

*Untuk setiap* request akses ke resource tertentu, sistem harus memvalidasi bahwa role pengguna memiliki permission untuk mengakses resource tersebut, jika tidak sistem harus menolak akses.

**Validates: Requirements 13.3**

### Property 19: Filter Mengembalikan Data yang Sesuai Kriteria

*Untuk setiap* filter yang diterapkan pada dashboard (serviceType, dateRange, divisionCategory), sistem hanya boleh mengembalikan data yang memenuhi semua kriteria filter yang aktif.

**Validates: Requirements 14.5**

### Property 20: Export Data Sesuai dengan Filter Aktif

*Untuk setiap* operasi export, sistem harus mengexport data yang sesuai dengan filter yang sedang aktif di dashboard, tidak boleh mengexport data yang tidak sesuai filter.

**Validates: Requirements 15.2**

### Property 21: Export Tercatat di Audit Log

*Untuk setiap* operasi export yang dilakukan pengguna, sistem harus mencatat AuditLog dengan action "EXPORT", userId, dan metadata tentang data yang di-export.

**Validates: Requirements 15.3**

### Property 22: Export Hanya Data Sesuai Hak Akses Role

*Untuk setiap* operasi export, sistem hanya boleh mengexport data yang sesuai dengan hak akses role pengguna (Partner hanya fee data, SPV/Manager/PM bisa fee dan cross-division, Validator bisa semua).

**Validates: Requirements 15.4**

### Property 23: Notifikasi Tersimpan di History

*Untuk setiap* notifikasi yang dikirim ke pengguna, sistem harus menyimpan record Notification di database dengan userId, type, message, dan timestamp.

**Validates: Requirements 12.5**

### Property 24: Akses Cross-Division Data Tercatat di Audit Log

*Untuk setiap* akses ke CrossDivisionData oleh SPV/Manager/PM atau Validator, sistem harus mencatat AuditLog dengan action "VIEW", userId, dan resourceId.

**Validates: Requirements 10.5**

### Property 25: Data Accepted Mengirim Notifikasi Poin ke Contributor

*Untuk setiap* data yang di-accept, sistem harus mengirim notifikasi ke Contributor tentang perolehan poin dengan detail jumlah poin yang diperoleh.

**Validates: Requirements 12.3**

### Property 26: Fee Insights Dashboard Menampilkan Data Accepted

*Untuk setiap* request ke Fee Insights Dashboard, sistem hanya boleh menghitung dan menampilkan insights dari data fee dengan status "Accepted", tidak boleh menggunakan data dengan status Pending, Need Clarification, atau Rejected.

**Validates: Requirements 16.5**

### Property 27: Division Filter Mengembalikan Data Sesuai Divisi

*Untuk setiap* filter divisi yang diterapkan pada Cross-Division Dashboard, sistem hanya boleh mengembalikan data yang memiliki division_category sesuai dengan divisi yang dipilih.

**Validates: Requirements 10.4**

## Error Handling

### Authentication Errors

**Invalid Credentials:**
- Sistem mengembalikan HTTP 401 Unauthorized
- Response body berisi pesan error yang jelas: "Username atau password salah"
- Tidak memberikan informasi spesifik apakah username atau password yang salah (security best practice)

**Expired Token:**
- Sistem mengembalikan HTTP 401 Unauthorized
- Response body berisi pesan: "Session telah berakhir, silakan login kembali"
- Frontend mengarahkan pengguna ke halaman login

**Insufficient Permissions:**
- Sistem mengembalikan HTTP 403 Forbidden
- Response body berisi pesan: "Anda tidak memiliki akses ke resource ini"

### Validation Errors

**Missing Required Fields:**
- Sistem mengembalikan HTTP 400 Bad Request
- Response body berisi daftar field yang missing dan pesan error untuk masing-masing field
- Format: `{ "errors": { "fieldName": "Field ini wajib diisi" } }`

**Invalid Data Format:**
- Sistem mengembalikan HTTP 400 Bad Request
- Response body berisi pesan error spesifik tentang format yang diharapkan
- Contoh: "Nominal fee harus berupa angka positif"

**Data Not Found:**
- Sistem mengembalikan HTTP 404 Not Found
- Response body berisi pesan: "Data tidak ditemukan"

### Business Logic Errors

**Invalid Status Transition:**
- Contoh: Mencoba validate data yang sudah Accepted
- Sistem mengembalikan HTTP 409 Conflict
- Response body berisi pesan: "Data sudah divalidasi sebelumnya"

**Duplicate Submission:**
- Jika contributor mencoba submit data yang sama dalam waktu singkat
- Sistem mengembalikan HTTP 409 Conflict
- Response body berisi pesan: "Data serupa baru saja disubmit"

**Clarification on Non-Clarifiable Data:**
- Jika contributor mencoba submit klarifikasi untuk data yang tidak berstatus "Need Clarification"
- Sistem mengembalikan HTTP 400 Bad Request
- Response body berisi pesan: "Data ini tidak memerlukan klarifikasi"

### Database Errors

**Connection Failure:**
- Sistem mengembalikan HTTP 503 Service Unavailable
- Response body berisi pesan: "Layanan sedang tidak tersedia, silakan coba lagi"
- Sistem melakukan retry dengan exponential backoff
- Jika retry gagal, error di-log dan admin mendapat alert

**Transaction Failure:**
- Sistem melakukan rollback semua perubahan dalam transaction
- Sistem mengembalikan HTTP 500 Internal Server Error
- Response body berisi pesan generic: "Terjadi kesalahan, silakan coba lagi"
- Detail error di-log untuk debugging

**Constraint Violation:**
- Contoh: Foreign key constraint, unique constraint
- Sistem mengembalikan HTTP 409 Conflict
- Response body berisi pesan yang user-friendly (bukan raw database error)

### File Upload Errors

**File Too Large:**
- Sistem mengembalikan HTTP 413 Payload Too Large
- Response body berisi pesan: "Ukuran file maksimal adalah X MB"

**Invalid File Type:**
- Sistem mengembalikan HTTP 400 Bad Request
- Response body berisi pesan: "Tipe file tidak didukung. Gunakan PDF, DOC, atau XLSX"

**Upload Failure:**
- Sistem mengembalikan HTTP 500 Internal Server Error
- Response body berisi pesan: "Gagal mengupload file, silakan coba lagi"
- Sistem melakukan cleanup file temporary jika ada

### Rate Limiting

**Too Many Requests:**
- Sistem mengembalikan HTTP 429 Too Many Requests
- Response body berisi pesan: "Terlalu banyak request, silakan tunggu X detik"
- Header `Retry-After` berisi waktu tunggu dalam detik

### Error Logging and Monitoring

**Error Logging Strategy:**
- Semua error di-log dengan level yang sesuai (ERROR, WARN, INFO)
- Log berisi: timestamp, userId, action, error message, stack trace
- Sensitive data (password, token) tidak di-log

**Monitoring and Alerting:**
- Error rate monitoring: Alert jika error rate > threshold
- Critical errors (database down, authentication service down) trigger immediate alert
- Dashboard monitoring untuk melihat error trends

## Testing Strategy

### Dual Testing Approach

Sistem ini akan menggunakan kombinasi unit testing dan property-based testing untuk memastikan correctness dan reliability:

**Unit Tests:**
- Menguji specific examples dan edge cases
- Menguji error conditions dan error handling
- Menguji integration points antar komponen
- Focus pada concrete scenarios yang penting

**Property-Based Tests:**
- Menguji universal properties yang harus berlaku untuk semua input
- Menggunakan randomized input generation untuk comprehensive coverage
- Setiap property test harus run minimum 100 iterations
- Setiap test harus di-tag dengan format: **Feature: fee-intelligence-market-benchmarking, Property {number}: {property_text}**

### Property-Based Testing Library

Pilihan library berdasarkan bahasa implementasi:
- **Python**: Hypothesis
- **TypeScript/JavaScript**: fast-check
- **Java**: jqwik atau QuickCheck for Java
- **C#**: FsCheck

### Test Coverage Requirements

**Backend Services:**
- Minimum 80% code coverage untuk business logic
- 100% coverage untuk authentication dan authorization logic
- 100% coverage untuk validation logic

**API Endpoints:**
- Test semua HTTP methods (GET, POST, PUT, DELETE)
- Test semua response codes (200, 400, 401, 403, 404, 409, 500)
- Test dengan valid dan invalid payloads

**Database Operations:**
- Test CRUD operations untuk semua entities
- Test transaction rollback scenarios
- Test constraint violations

### Unit Test Examples

**Authentication Service:**
```
Test: login dengan kredensial valid
Test: login dengan password salah
Test: login dengan username tidak ada
Test: token validation dengan token valid
Test: token validation dengan token expired
Test: token validation dengan token invalid
```

**Validation Service:**
```
Test: validate fee data dengan decision Accept
Test: validate fee data dengan decision Reject
Test: validate fee data dengan decision Need Clarification
Test: validate data yang sudah Accepted (should fail)
Test: validate data dengan validator yang tidak berwenang (should fail)
```

**Point Service:**
```
Test: award points untuk fee data accepted
Test: award points untuk cross-division data accepted
Test: check redeemable points dengan total 5 poin
Test: check redeemable points dengan total 7 poin
Test: check redeemable points dengan total 3 poin
```

### Property-Based Test Examples

**Property 4: Data Submission Memiliki Status Pending**
```
Feature: fee-intelligence-market-benchmarking, Property 4: Data Submission Memiliki Status Pending

Generate: Random FeeData atau CrossDivisionData dengan field valid
Action: Submit data via DataService.createFeeData() atau createCrossDivisionData()
Assert: Status data yang tersimpan adalah "Pending"
Iterations: 100
```

**Property 12: Data Accepted Menambahkan Poin ke Contributor**
```
Feature: fee-intelligence-market-benchmarking, Property 12: Data Accepted Menambahkan Poin ke Contributor

Generate: Random data (FeeData atau CrossDivisionData) dengan status Pending
Action: 
  1. Get initial points untuk contributor
  2. Validate data dengan decision Accept
  3. Get final points untuk contributor
Assert: Final points > Initial points
Iterations: 100
```

**Property 15: Dashboard Hanya Menampilkan Data Accepted**
```
Feature: fee-intelligence-market-benchmarking, Property 15: Dashboard Hanya Menampilkan Data Accepted

Generate: Random mix of FeeData dengan berbagai status (Pending, Accepted, Rejected, Need Clarification)
Action: Call DashboardService.getFeeCompetitorDashboard()
Assert: Semua data yang dikembalikan memiliki status "Accepted"
Iterations: 100
```

**Property 18: Authorization Berdasarkan Role**
```
Feature: fee-intelligence-market-benchmarking, Property 18: Authorization Berdasarkan Role

Generate: Random user dengan role Partner
Action: Attempt to access CrossDivisionData via DashboardService
Assert: Request ditolak dengan error 403 Forbidden
Iterations: 100
```

**Property 19: Filter Mengembalikan Data yang Sesuai Kriteria**
```
Feature: fee-intelligence-market-benchmarking, Property 19: Filter Mengembalikan Data yang Sesuai Kriteria

Generate: 
  - Random collection of FeeData dengan berbagai serviceType dan dates
  - Random filter criteria (serviceType, startDate, endDate)
Action: Call DashboardService.getFeeCompetitorDashboard() dengan filters
Assert: Semua data yang dikembalikan memenuhi filter criteria
Iterations: 100
```

### Integration Testing

**API Integration Tests:**
- Test end-to-end flow: Submit data → Validate → View in dashboard
- Test authentication flow dengan berbagai roles
- Test notification delivery
- Test file upload dan download

**Database Integration Tests:**
- Test dengan real database (bukan mock)
- Test transaction isolation
- Test concurrent operations
- Test database constraints

### Performance Testing

**Load Testing:**
- Test dengan 100 concurrent users
- Test dashboard query performance dengan large dataset (10,000+ records)
- Test filter dan search performance
- Target: Response time < 2 seconds untuk 95th percentile

**Stress Testing:**
- Test system behavior under high load
- Test graceful degradation
- Test recovery after failure

### Security Testing

**Authentication Testing:**
- Test brute force protection
- Test session management
- Test token expiration

**Authorization Testing:**
- Test role-based access control untuk semua endpoints
- Test horizontal privilege escalation (user A accessing user B's data)
- Test vertical privilege escalation (Contributor accessing Validator functions)

**Input Validation Testing:**
- Test SQL injection prevention
- Test XSS prevention
- Test file upload security

### Test Data Management

**Test Data Generation:**
- Use factories atau builders untuk generate test data
- Use property-based testing libraries untuk random data generation
- Maintain seed data untuk consistent testing

**Test Database:**
- Use separate test database
- Reset database state sebelum setiap test suite
- Use transactions untuk isolate tests

### Continuous Integration

**CI Pipeline:**
- Run unit tests pada setiap commit
- Run integration tests pada setiap pull request
- Run property-based tests dengan full iterations (100+) pada nightly builds
- Generate code coverage reports
- Fail build jika coverage < threshold

**Test Reporting:**
- Generate test reports dengan details tentang failures
- Track test execution time
- Track flaky tests
