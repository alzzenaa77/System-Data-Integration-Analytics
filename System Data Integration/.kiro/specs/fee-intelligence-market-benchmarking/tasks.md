# Implementation Plan: Fee Intelligence & Market Benchmarking System

## Overview

Implementasi sistem Fee Intelligence & Market Benchmarking menggunakan JavaScript/Node.js untuk backend API dan JavaScript (React/Vue) untuk frontend. Sistem akan dibangun secara incremental dengan fokus pada core functionality terlebih dahulu, kemudian ditambahkan fitur-fitur pendukung.

Stack teknologi yang akan digunakan:
- Backend: Node.js dengan Express.js
- Database: PostgreSQL
- Authentication: JWT (JSON Web Tokens)
- Testing: Jest untuk unit tests, fast-check untuk property-based tests
- Frontend: React (atau Vue.js sesuai preferensi)

## Tasks

- [x] 1. Setup project structure dan dependencies
  - Inisialisasi project Node.js dengan npm/yarn
  - Install dependencies: express, pg (PostgreSQL client), jsonwebtoken, bcrypt, jest, fast-check
  - Setup folder structure: src/services, src/models, src/routes, src/middleware, tests/
  - Setup database connection configuration
  - Setup environment variables (.env file)
  - _Requirements: Semua requirements (foundational)_

- [x] 2. Implementasi database schema dan models
  - [x] 2.1 Buat database schema SQL untuk semua tables
    - Table: users (id, username, password_hash, email, full_name, role, is_active, created_at, updated_at)
    - Table: fee_data (id, contributor_id, submitter_name, submitter_division, submitter_input_date, service_provider, service_recipient, service_type, scope_of_work, tax_year, financial_type, financial_description, fee_scheme, fee_amount, currency, financial_date, status, validator_id, validation_notes, validated_at, created_at, updated_at)
    - Table: cross_division_data (id, contributor_id, title, division_category, description, attachment_url, status, validator_id, validation_notes, validated_at, created_at, updated_at)
    - Table: clarification_history (id, data_id, data_type, requested_by, requested_at, request_notes, responded_by, responded_at, response_notes)
    - Table: notifications (id, user_id, type, message, metadata, is_read, created_at, read_at)
    - Table: point_transactions (id, contributor_id, data_id, data_type, points, description, created_at)
    - Table: audit_logs (id, user_id, action, resource_type, resource_id, changes, ip_address, user_agent, created_at)
    - _Requirements: 13.1, 13.2_

  - [x] 2.2 Implementasi data models (JavaScript classes atau objects)
    - Model untuk User, FeeData, CrossDivisionData, Notification, PointTransaction, AuditLog
    - Include validation methods untuk setiap model
    - _Requirements: 2.2, 3.2_

- [x] 3. Implementasi Authentication Service
  - [x] 3.1 Implementasi login dan token generation
    - Function login(username, password) yang validate credentials dan generate JWT token
    - Hash password menggunakan bcrypt
    - Generate JWT token dengan payload: userId, role, expiresAt
    - _Requirements: 1.2, 1.4_

  - [ ]* 3.2 Write property test untuk authentication
    - **Property 1: Autentikasi Valid Mengembalikan Role yang Benar**
    - **Validates: Requirements 1.2**

  - [ ]* 3.3 Write property test untuk autentikasi gagal
    - **Property 3: Autentikasi Gagal Mengembalikan Error**
    - **Validates: Requirements 1.5**

  - [x] 3.4 Implementasi middleware untuk validate JWT token
    - Middleware authenticateToken() untuk protect routes
    - Middleware authorizeRole(allowedRoles) untuk check role permissions
    - _Requirements: 1.2, 13.3_

  - [ ]* 3.5 Write unit tests untuk authentication middleware
    - Test valid token
    - Test expired token
    - Test invalid token
    - Test role authorization
    - _Requirements: 1.2, 13.3_

- [ ] 4. Implementasi Data Service
  - [x] 4.1 Implementasi CRUD operations untuk FeeData
    - Function createFeeData(data, contributorId)
    - Function getFeeDataById(id)
    - Function updateFeeDataStatus(id, status, notes)
    - Function getFeeDataByStatus(status)
    - Function updateFeeData(id, data, contributorId)
    - _Requirements: 2.3, 2.5_

  - [x] 4.2 Implementasi CRUD operations untuk CrossDivisionData
    - Function createCrossDivisionData(data, contributorId)
    - Function getCrossDivisionDataById(id)
    - Function updateCrossDivisionDataStatus(id, status, notes)
    - Function getCrossDivisionDataByStatus(status)
    - Function updateCrossDivisionData(id, data, contributorId)
    - _Requirements: 3.3, 3.5_

  - [ ]* 4.3 Write property test untuk data submission
    - **Property 4: Data Submission Memiliki Status Pending**
    - **Validates: Requirements 2.3, 3.3**

  - [ ]* 4.3a Write property test untuk validasi field wajib
    - **Property 4a: Data Submission Memvalidasi Field Wajib**
    - **Validates: Requirements 2.6**

  - [ ]* 4.4 Write property test untuk metadata contributor
    - **Property 6: Data Submission Mencatat Metadata Contributor**
    - **Validates: Requirements 2.5, 3.5**

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implementasi Notification Service
  - [x] 6.1 Implementasi notification functions
    - Function sendNotification(userId, type, message, metadata)
    - Function getNotifications(userId, unreadOnly)
    - Function markAsRead(notificationId)
    - Function getUnreadCount(userId)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ]* 6.2 Write property test untuk notification submission
    - **Property 5: Data Submission Memicu Notifikasi ke Validator**
    - **Validates: Requirements 2.4, 3.4, 12.1**

  - [ ]* 6.3 Write property test untuk notification history
    - **Property 23: Notifikasi Tersimpan di History**
    - **Validates: Requirements 12.5**

- [ ] 7. Implementasi Validation Service
  - [x] 7.1 Implementasi validation workflow
    - Function validateFeeData(dataId, validatorId, decision, notes)
    - Function validateCrossDivisionData(dataId, validatorId, decision, notes)
    - Function getPendingValidations(validatorId)
    - Function getValidationHistory(dataId)
    - Integrate dengan NotificationService untuk kirim notifikasi
    - Integrate dengan PointService untuk award points (jika Accept)
    - _Requirements: 4.4, 4.5, 4.6, 5.3, 5.4, 5.5_

  - [ ]* 7.2 Write property test untuk validation reject
    - **Property 7: Validasi Reject Mengubah Status Menjadi Rejected**
    - **Validates: Requirements 4.4, 5.3**

  - [ ]* 7.3 Write property test untuk validation need clarification
    - **Property 8: Validasi Need Clarification Mengubah Status dan Mengirim Notifikasi**
    - **Validates: Requirements 4.5, 5.4, 6.1, 12.2**

  - [ ]* 7.4 Write property test untuk validation accept
    - **Property 9: Validasi Accept Mengubah Status Menjadi Accepted**
    - **Validates: Requirements 4.6, 5.5**

  - [ ]* 7.5 Write unit tests untuk validation edge cases
    - Test validate data yang sudah Accepted (should fail)
    - Test validate dengan validator yang tidak berwenang
    - _Requirements: 4.4, 4.5, 4.6_

- [ ] 8. Implementasi Clarification Workflow
  - [ ] 8.1 Implementasi clarification functions
    - Function submitClarification(dataId, dataType, contributorId, responseNotes)
    - Function getClarificationHistory(dataId, dataType)
    - Update status data kembali ke Pending setelah clarification
    - Kirim notifikasi ke Validator
    - _Requirements: 6.4, 6.5_

  - [ ]* 8.2 Write property test untuk clarification submission
    - **Property 10: Submit Klarifikasi Mengubah Status Kembali ke Pending**
    - **Validates: Requirements 6.4**

  - [ ]* 8.3 Write property test untuk clarification history
    - **Property 11: Klarifikasi Tercatat di History**
    - **Validates: Requirements 6.5**

- [ ] 9. Implementasi Point Service
  - [x] 9.1 Implementasi point management functions
    - Function awardPoints(contributorId, dataId, dataType, points)
    - Function getContributorPoints(contributorId)
    - Function getPointHistory(contributorId)
    - Function checkRedeemablePoints(contributorId)
    - _Requirements: 7.1, 7.4, 7.5_

  - [ ]* 9.2 Write property test untuk point award
    - **Property 12: Data Accepted Menambahkan Poin ke Contributor**
    - **Validates: Requirements 7.1**

  - [ ]* 9.3 Write property test untuk point history
    - **Property 13: Perolehan Poin Tercatat di History**
    - **Validates: Requirements 7.4**

  - [ ]* 9.4 Write property test untuk notifikasi kelipatan 5 poin
    - **Property 14: Notifikasi untuk Kelipatan 5 Poin**
    - **Validates: Requirements 7.5**

  - [ ]* 9.5 Write property test untuk notifikasi poin ke contributor
    - **Property 25: Data Accepted Mengirim Notifikasi Poin ke Contributor**
    - **Validates: Requirements 12.3**

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implementasi Dashboard Service
  - [x] 11.1 Implementasi dashboard data retrieval
    - Function getFeeCompetitorDashboard(userId, filters)
    - Function getCrossDivisionDashboard(userId, filters)
    - Function getValidatorMonitoringDashboard(validatorId)
    - Apply role-based filtering (hanya return data Accepted)
    - _Requirements: 8.2, 9.2, 10.2, 11.2, 11.3_

  - [ ]* 11.2 Write property test untuk dashboard filtering
    - **Property 15: Dashboard Hanya Menampilkan Data Accepted**
    - **Validates: Requirements 8.2, 9.2, 10.2, 11.2, 11.3**

  - [ ] 11.3 Implementasi search dan filter functionality
    - Function searchData(userId, query, dataType)
    - Apply filters: serviceType, dateRange, serviceProvider, serviceRecipient, taxYear, feeScheme, divisionCategory
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ]* 11.4 Write property test untuk filter correctness
    - **Property 19: Filter Mengembalikan Data yang Sesuai Kriteria**
    - **Validates: Requirements 14.5**

  - [ ] 11.5 Implementasi insights dan statistics
    - Calculate statistics: average fee, min/max fee, trend analysis
    - Group data by service type, time period
    - _Requirements: 8.5, 9.5_

- [ ] 12. Implementasi Export Service
  - [ ] 12.1 Implementasi export functionality
    - Function exportData(userId, filters, format)
    - Support CSV dan Excel format
    - Apply role-based access control
    - _Requirements: 15.1, 15.2, 15.4_

  - [ ]* 12.2 Write property test untuk export data sesuai filter
    - **Property 20: Export Data Sesuai dengan Filter Aktif**
    - **Validates: Requirements 15.2**

  - [ ]* 12.3 Write property test untuk export authorization
    - **Property 22: Export Hanya Data Sesuai Hak Akses Role**
    - **Validates: Requirements 15.4**

- [ ] 13. Implementasi Audit Logging
  - [x] 13.1 Implementasi audit log functions
    - Function logAudit(userId, action, resourceType, resourceId, changes, ipAddress, userAgent)
    - Integrate audit logging ke semua services (create, update, delete, validate, export, view)
    - _Requirements: 13.2, 15.3, 10.5_

  - [ ]* 13.2 Write property test untuk audit log creation
    - **Property 17: Audit Log Tercatat untuk Setiap Operasi Data**
    - **Validates: Requirements 13.2**

  - [ ]* 13.3 Write property test untuk export audit log
    - **Property 21: Export Tercatat di Audit Log**
    - **Validates: Requirements 15.3**

  - [ ]* 13.4 Write property test untuk access audit log
    - **Property 24: Akses Cross-Division Data Tercatat di Audit Log**
    - **Validates: Requirements 10.5**

- [x] 14. Implementasi Authorization Middleware
  - [x] 14.1 Implementasi role-based access control
    - Middleware checkPermission(resource, action)
    - Define permission matrix untuk setiap role
    - Partner: read fee_data dashboard only
    - SPV/Manager/PM: read fee_data dan cross_division_data dashboard
    - Validator: read/write validation, read all dashboards
    - Contributor: write data, read own data
    - _Requirements: 8.6, 13.3_

  - [ ]* 14.2 Write property test untuk authorization
    - **Property 18: Authorization Berdasarkan Role**
    - **Validates: Requirements 13.3**

  - [ ]* 14.3 Write property test untuk partner access restriction
    - **Property 16: Partner Tidak Dapat Mengakses Cross-Division Data**
    - **Validates: Requirements 8.6**

  - [ ]* 14.4 Write unit tests untuk authorization edge cases
    - Test horizontal privilege escalation (user A accessing user B's data)
    - Test vertical privilege escalation (Contributor accessing Validator functions)
    - _Requirements: 13.3_

- [ ] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Implementasi REST API Routes
  - [x] 16.1 Implementasi authentication routes
    - POST /api/auth/login - Login endpoint
    - POST /api/auth/logout - Logout endpoint
    - GET /api/auth/me - Get current user info
    - _Requirements: 1.1, 1.2, 1.5_

  - [x] 16.2 Implementasi contributor routes
    - POST /api/fee-data - Submit fee data
    - POST /api/cross-division-data - Submit cross-division data
    - GET /api/my-data - Get contributor's own data
    - PUT /api/fee-data/:id/clarify - Submit clarification for fee data
    - PUT /api/cross-division-data/:id/clarify - Submit clarification for cross-division data
    - GET /api/my-points - Get contributor's points
    - _Requirements: 2.1, 2.3, 3.1, 3.3, 6.3, 6.4, 7.3_

  - [x] 16.3 Implementasi validator routes
    - GET /api/validations/pending - Get pending validations
    - POST /api/fee-data/:id/validate - Validate fee data
    - POST /api/cross-division-data/:id/validate - Validate cross-division data
    - GET /api/validations/history/:id - Get validation history
    - GET /api/dashboard/monitoring - Get validator monitoring dashboard
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.6, 5.3, 5.4, 5.5, 11.1_

  - [x] 16.4 Implementasi dashboard routes untuk Partner dan SPV/Manager/PM
    - GET /api/dashboard/fee-competitor - Get fee competitor dashboard
    - GET /api/dashboard/cross-division - Get cross-division dashboard (SPV/Manager/PM only)
    - GET /api/dashboard/search - Search data
    - POST /api/dashboard/export - Export data
    - _Requirements: 8.1, 8.2, 9.1, 9.2, 10.1, 10.2, 14.1, 15.1, 15.2_

  - [ ] 16.5 Implementasi notification routes
    - GET /api/notifications - Get user notifications
    - PUT /api/notifications/:id/read - Mark notification as read
    - GET /api/notifications/unread-count - Get unread count
    - _Requirements: 12.4, 12.5_

  - [ ]* 16.6 Write integration tests untuk API routes
    - Test end-to-end flow: Submit data → Validate → View in dashboard
    - Test authentication flow dengan berbagai roles
    - Test error responses (400, 401, 403, 404, 409, 500)
    - _Requirements: All requirements_

- [x] 17. Implementasi Error Handling
  - [x] 17.1 Implementasi global error handler middleware
    - Handle authentication errors (401, 403)
    - Handle validation errors (400)
    - Handle not found errors (404)
    - Handle business logic errors (409)
    - Handle database errors (500, 503)
    - Return user-friendly error messages
    - _Requirements: All requirements (error handling)_

  - [x] 17.2 Implementasi custom error classes
    - AuthenticationError, AuthorizationError, ValidationError, NotFoundError, ConflictError
    - Each error class dengan appropriate HTTP status code
    - _Requirements: All requirements (error handling)_

  - [ ]* 17.3 Write unit tests untuk error handling
    - Test semua error scenarios
    - Test error response format
    - _Requirements: All requirements (error handling)_

- [ ] 18. Implementasi Frontend - Authentication dan Layout
  - [x] 18.1 Setup React project dengan routing
    - Setup React dengan Create React App atau Vite
    - Install dependencies: react-router-dom, axios, chart.js atau recharts
    - Setup routing untuk berbagai pages
    - _Requirements: 1.1_

  - [x] 18.2 Implementasi login page dan authentication flow
    - Login form dengan username dan password
    - Call API /api/auth/login
    - Store JWT token di localStorage atau sessionStorage
    - Redirect ke halaman sesuai role setelah login
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

  - [x] 18.3 Implementasi layout dan navigation
    - Header dengan user info dan logout button
    - Sidebar navigation sesuai role
    - Protected routes dengan authentication check
    - _Requirements: 1.4_

  - [x] 18.4 Implementasi FeeInsightsDashboard component
    - Create reusable component untuk fee insights
    - Implement 4 summary cards (Total Data, Total Amount, Average Fee, Fee Range)
    - Implement bar chart untuk Top 5 Service Types
    - Implement pie chart legend untuk Fee Scheme Distribution
    - Apply MUC Consulting brand styling
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

- [ ] 19. Implementasi Frontend - Contributor Portal
  - [x] 19.1 Implementasi form input fee data
    - Form dengan fields:
      - Identitas Pengisi: submitterName, submitterDivision, submitterInputDate
      - Identitas: serviceProvider, serviceRecipient
      - Detail Jasa: serviceType, scopeOfWork, taxYear
      - Financial Data: financialType, financialDescription, feeScheme, feeAmount, currency, financialDate
    - Validation di frontend untuk semua field wajib
    - Call API POST /api/fee-data
    - Show success/error message
    - _Requirements: 2.1, 2.2, 2.3, 2.6_

  - [x] 19.2 Implementasi form input cross-division data
    - Form dengan fields: title, divisionCategory, description, attachment
    - File upload untuk attachment
    - Call API POST /api/cross-division-data
    - Show success/error message
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 19.3 Implementasi halaman my data dan clarification
    - List data yang disubmit oleh contributor
    - Show status untuk setiap data
    - Form clarification untuk data dengan status "Need Clarification"
    - Show validation notes dari validator
    - _Requirements: 6.2, 6.3, 6.4_

  - [x] 19.4 Implementasi halaman my points
    - Display total points
    - Display point history
    - Show notification jika poin dapat ditukar (kelipatan 5)
    - _Requirements: 7.3, 7.4, 7.5_

- [ ] 20. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 21. Implementasi Frontend - Validator Portal
  - [x] 21.1 Implementasi halaman pending validations
    - List data dengan status Pending atau Need Clarification
    - Show detail data untuk review
    - Buttons untuk Reject, Need Clarification, Accept
    - Form untuk validation notes
    - _Requirements: 4.1, 4.2, 4.3, 4.7_

  - [x] 21.2 Implementasi validation action handlers
    - Call API POST /api/fee-data/:id/validate atau /api/cross-division-data/:id/validate
    - Show success/error message
    - Refresh list setelah validation
    - _Requirements: 4.4, 4.5, 4.6, 5.3, 5.4, 5.5_

  - [x] 21.3 Implementasi tab Fee Competitor (gabungan insights + data)
    - Integrate FeeInsightsDashboard component
    - Display comprehensive insights dengan summary cards, bar chart, pie chart
    - Display data table lengkap di bawah insights
    - Single integrated view untuk insights dan data
    - _Requirements: 11.2, 11.3, 16.1, 16.2, 16.3, 16.4, 16.5_

  - [x] 21.4 Implementasi tab Cross-Division untuk Validator
    - Display cross-division data dengan status Accepted
    - Implement division filter tabs (7 divisions)
    - Display submission date dan attachment
    - Same functionality as Manager portal
    - _Requirements: 11.4, 10.4, 10.6_

- [ ] 22. Implementasi Frontend - Partner Portal
  - [x] 22.1 Implementasi tab Fee Competitor (gabungan insights + data)
    - Integrate FeeInsightsDashboard component
    - Display comprehensive insights dengan summary cards, bar chart, pie chart
    - Display data table lengkap di bawah insights
    - Single integrated view untuk insights dan data
    - Filter berdasarkan serviceType, dateRange, serviceProvider, serviceRecipient, taxYear, feeScheme
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 16.1, 16.2, 16.3, 16.4, 16.5_

  - [ ] 22.2 Implementasi export functionality
    - Button export dengan pilihan format (CSV, Excel)
    - Call API POST /api/dashboard/export
    - Download file hasil export
    - _Requirements: 15.1, 15.2, 15.5_

- [ ] 23. Implementasi Frontend - SPV/Manager/PM Portal
  - [x] 23.1 Implementasi tab Fee Competitor (gabungan insights + data)
    - Integrate FeeInsightsDashboard component
    - Display comprehensive insights dengan summary cards, bar chart, pie chart
    - Display data table lengkap di bawah insights
    - Single integrated view untuk insights dan data
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 16.1, 16.2, 16.3, 16.4, 16.5_

  - [x] 23.2 Implementasi tab Cross-Division
    - Display cross-division data dengan status Accepted
    - Filter berdasarkan divisionCategory dengan tabs (7 divisions)
    - Search functionality
    - Display detail termasuk attachment dan submission date
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ] 23.3 Implementasi export functionality untuk cross-division data
    - Button export dengan pilihan format (CSV, Excel)
    - Call API POST /api/dashboard/export
    - Download file hasil export
    - _Requirements: 15.1, 15.2, 15.5_

- [ ] 24. Implementasi Frontend - Notification System
  - [ ] 24.1 Implementasi notification bell icon di header
    - Display unread count badge
    - Dropdown untuk show notifications
    - Call API GET /api/notifications
    - Mark as read ketika notification dibuka
    - _Requirements: 12.4, 12.5_

  - [ ] 24.2 Implementasi notification polling atau WebSocket
    - Poll API GET /api/notifications/unread-count setiap 30 detik
    - Atau implement WebSocket untuk real-time notifications (opsional)
    - _Requirements: 12.1, 12.2, 12.3_

- [ ] 25. Final Integration dan Testing
  - [ ] 25.1 Integration testing end-to-end
    - Test complete flow: Contributor submit → Validator validate → Dashboard display
    - Test clarification flow
    - Test point system
    - Test notification delivery
    - _Requirements: All requirements_

  - [ ]* 25.2 Run all property-based tests dengan full iterations
    - Ensure all 25 properties pass dengan 100+ iterations
    - Fix any failures
    - _Requirements: All requirements_

  - [ ]* 25.3 Security testing
    - Test authentication dan authorization
    - Test SQL injection prevention
    - Test XSS prevention
    - Test file upload security
    - _Requirements: 13.1, 13.3_

  - [ ] 25.4 Performance testing
    - Test dashboard query performance dengan large dataset
    - Test filter dan search performance
    - Optimize queries jika diperlukan
    - _Requirements: 14.5_

- [ ] 26. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows
- Frontend implementation dapat disesuaikan dengan framework pilihan (React, Vue, atau Angular)
- Database dapat diganti dengan MongoDB jika diperlukan fleksibilitas schema
