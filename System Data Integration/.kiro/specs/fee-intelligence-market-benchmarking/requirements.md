# Requirements Document: Fee Intelligence & Market Benchmarking System

## Introduction

Sistem Fee Intelligence & Market Benchmarking adalah platform untuk MUC Consulting yang memungkinkan pengumpulan, validasi, dan visualisasi data fee competitor serta informasi lintas divisi. Sistem ini mendukung 4 role pengguna (Contributor, Validator, Partner, SPV/Manager/PM) dengan workflow validasi data dan sistem poin reward untuk contributor.

## Glossary

- **System**: Fee Intelligence & Market Benchmarking System
- **Contributor**: Pengguna yang menginput data fee competitor dan data lintas divisi
- **Validator**: Pengguna yang memvalidasi data dari contributor
- **Partner**: Pengguna yang hanya dapat mengakses dashboard fee competitor
- **SPV_Manager_PM**: Pengguna dengan role Supervisor, Manager, atau Project Manager yang dapat mengakses dashboard fee competitor dan data lintas divisi
- **Fee_Data**: Data fee competitor yang diinput oleh contributor
- **Cross_Division_Data**: Data informasi lintas divisi yang diinput oleh contributor
- **Dashboard**: Antarmuka untuk melihat data fee competitor dan insight
- **Point_System**: Sistem poin reward untuk contributor
- **Validation_Status**: Status validasi data (Pending, Need Clarification, Accepted, Rejected)

## Requirements

### Requirement 1: Autentikasi dan Otorisasi Pengguna

**User Story:** Sebagai pengguna sistem, saya ingin login dengan role yang sesuai, sehingga saya dapat mengakses fitur yang sesuai dengan wewenang saya.

#### Acceptance Criteria

1. WHEN pengguna mengakses sistem, THE System SHALL menampilkan halaman login
2. WHEN pengguna memasukkan kredensial valid, THE System SHALL mengautentikasi pengguna dan menentukan role-nya
3. THE System SHALL mendukung 4 role: Contributor, Validator, Partner, dan SPV_Manager_PM
4. WHEN autentikasi berhasil, THE System SHALL mengarahkan pengguna ke halaman sesuai role-nya
5. WHEN autentikasi gagal, THE System SHALL menampilkan pesan error dan meminta pengguna login ulang

### Requirement 2: Input Data Fee Competitor oleh Contributor

**User Story:** Sebagai Contributor, saya ingin menginput data fee competitor dengan informasi lengkap dan terstruktur, sehingga data dapat divalidasi dan digunakan untuk benchmarking yang akurat.

#### Acceptance Criteria

1. WHEN Contributor login, THE System SHALL menampilkan form input data fee competitor
2. THE System SHALL menerima input data fee competitor dengan struktur berikut:
   - **Identitas Pengisi (Submitter Identity):** Nama, Divisi, Tanggal Input
   - **Identitas (Service Provider & Recipient Identity):** Pemberi Jasa, Penerima Jasa
   - **Detail Jasa (Service Details):** Jenis Jasa, Scope of Work, Tahun Pajak
   - **Financial Data:** Jenis, Deskripsi, Skema Fee, Nominal, Tanggal
3. WHEN Contributor submit data fee competitor, THE System SHALL menyimpan data dengan status "Pending"
4. WHEN data fee competitor disimpan, THE System SHALL mengirim notifikasi ke Validator untuk validasi
5. THE System SHALL mencatat timestamp dan identitas Contributor untuk setiap data yang diinput
6. THE System SHALL memvalidasi bahwa semua field wajib telah diisi sebelum menyimpan data

### Requirement 3: Input Data Cross-Functional Division oleh Contributor

**User Story:** Sebagai Contributor, saya ingin menginput data lintas divisi, sehingga informasi dapat dibagikan ke role yang berwenang.

#### Acceptance Criteria

1. WHEN Contributor login, THE System SHALL menampilkan form input data cross-functional division
2. THE System SHALL menerima input Cross_Division_Data dengan field: judul, kategori divisi, deskripsi, dan attachment (opsional)
3. WHEN Contributor submit Cross_Division_Data, THE System SHALL menyimpan data dengan status "Pending"
4. WHEN Cross_Division_Data disimpan, THE System SHALL mengirim notifikasi ke Validator untuk validasi
5. THE System SHALL mencatat timestamp dan identitas Contributor untuk setiap data yang diinput

### Requirement 4: Validasi Data Fee Competitor oleh Validator

**User Story:** Sebagai Validator, saya ingin memvalidasi data fee competitor dari contributor, sehingga hanya data kredibel yang masuk ke dashboard.

#### Acceptance Criteria

1. WHEN Validator login, THE System SHALL menampilkan daftar Fee_Data dengan status "Pending" atau "Need Clarification"
2. WHEN Validator menerima notifikasi data baru, THE System SHALL menampilkan detail Fee_Data untuk review
3. THE System SHALL menyediakan 3 opsi validasi: Reject, Need Clarification, dan Accept
4. WHEN Validator memilih "Reject", THE System SHALL mengubah status Fee_Data menjadi "Rejected" dan data tidak masuk dashboard
5. WHEN Validator memilih "Need Clarification", THE System SHALL mengubah status menjadi "Need Clarification" dan mengirim notifikasi ke Contributor
6. WHEN Validator memilih "Accept", THE System SHALL mengubah status menjadi "Accepted" dan data masuk ke dashboard
7. WHEN Validator memilih "Need Clarification" atau "Reject", THE System SHALL meminta catatan/alasan dari Validator

### Requirement 5: Validasi Data Cross-Functional Division oleh Validator

**User Story:** Sebagai Validator, saya ingin memvalidasi data lintas divisi dari contributor, sehingga hanya data valid yang dapat diakses oleh role yang berwenang.

#### Acceptance Criteria

1. WHEN Validator login, THE System SHALL menampilkan daftar Cross_Division_Data dengan status "Pending" atau "Need Clarification"
2. THE System SHALL menyediakan 3 opsi validasi: Reject, Need Clarification, dan Accept
3. WHEN Validator memilih "Reject", THE System SHALL mengubah status Cross_Division_Data menjadi "Rejected"
4. WHEN Validator memilih "Need Clarification", THE System SHALL mengubah status menjadi "Need Clarification" dan mengirim notifikasi ke Contributor
5. WHEN Validator memilih "Accept", THE System SHALL mengubah status menjadi "Accepted" dan data dapat diakses oleh SPV_Manager_PM
6. WHEN Validator memilih "Need Clarification" atau "Reject", THE System SHALL meminta catatan/alasan dari Validator

### Requirement 6: Klarifikasi Data oleh Contributor

**User Story:** Sebagai Contributor, saya ingin menerima notifikasi dan melakukan klarifikasi data yang diminta validator, sehingga data saya dapat divalidasi ulang.

#### Acceptance Criteria

1. WHEN data memiliki status "Need Clarification", THE System SHALL mengirim notifikasi ke Contributor
2. WHEN Contributor membuka notifikasi, THE System SHALL menampilkan data yang perlu klarifikasi beserta catatan dari Validator
3. THE System SHALL menyediakan form untuk Contributor menambahkan klarifikasi atau memperbaiki data
4. WHEN Contributor submit klarifikasi, THE System SHALL mengubah status data kembali ke "Pending" dan mengirim notifikasi ke Validator
5. THE System SHALL mencatat history klarifikasi untuk audit trail

### Requirement 7: Sistem Poin Reward untuk Contributor

**User Story:** Sebagai Contributor, saya ingin mendapatkan poin untuk setiap data yang diterima, sehingga saya dapat menukar poin di HC.

#### Acceptance Criteria

1. WHEN Fee_Data atau Cross_Division_Data diubah statusnya menjadi "Accepted", THE System SHALL menambahkan poin ke akun Contributor
2. THE System SHALL menghitung poin berdasarkan jenis data yang diterima
3. THE System SHALL menampilkan total poin Contributor di dashboard mereka
4. THE System SHALL mencatat history perolehan poin dengan timestamp dan sumber data
5. WHEN Contributor mencapai kelipatan 5 poin, THE System SHALL menampilkan notifikasi bahwa poin dapat ditukar di HC

### Requirement 8: Dashboard Fee Competitor untuk Partner

**User Story:** Sebagai Partner, saya ingin melihat dashboard fee competitor dengan insights dan data detail, sehingga saya dapat melakukan benchmarking market secara komprehensif.

#### Acceptance Criteria

1. WHEN Partner login, THE System SHALL menampilkan Dashboard fee competitor dalam satu tab
2. THE Dashboard SHALL menampilkan insights section dengan 4 summary cards, bar chart, dan pie chart legend
3. THE Dashboard SHALL menampilkan data table dengan semua Fee_Data yang berstatus "Accepted"
4. THE Dashboard SHALL menyediakan filter berdasarkan jenis jasa, periode waktu, pemberi jasa, penerima jasa, tahun pajak, dan skema fee
5. THE Dashboard SHALL menampilkan visualisasi dan data dalam satu halaman yang terintegrasi
6. THE System SHALL mencegah Partner mengakses data Cross_Division_Data

### Requirement 9: Dashboard Fee Competitor untuk SPV/Manager/PM

**User Story:** Sebagai SPV/Manager/PM, saya ingin melihat dashboard fee competitor dengan insights dan data detail, sehingga saya dapat melakukan benchmarking market secara komprehensif.

#### Acceptance Criteria

1. WHEN SPV_Manager_PM login, THE System SHALL menampilkan Dashboard fee competitor dalam satu tab
2. THE Dashboard SHALL menampilkan insights section dengan 4 summary cards, bar chart, dan pie chart legend
3. THE Dashboard SHALL menampilkan data table dengan semua Fee_Data yang berstatus "Accepted"
4. THE Dashboard SHALL menyediakan filter berdasarkan jenis jasa, periode waktu, pemberi jasa, penerima jasa, tahun pajak, dan skema fee
5. THE Dashboard SHALL menampilkan visualisasi dan data dalam satu halaman yang terintegrasi
6. THE System SHALL menyediakan tab terpisah untuk Cross-Division data

### Requirement 10: Akses Data Cross-Functional Division untuk SPV/Manager/PM

**User Story:** Sebagai SPV/Manager/PM, saya ingin mengakses informasi data lintas divisi, sehingga saya dapat melihat informasi cross-functional yang relevan.

#### Acceptance Criteria

1. WHEN SPV_Manager_PM login, THE System SHALL menampilkan menu akses ke data Cross_Division_Data
2. THE System SHALL menampilkan hanya Cross_Division_Data dengan status "Accepted"
3. THE System SHALL menyediakan filter berdasarkan kategori divisi dan periode waktu
4. THE Dashboard SHALL menyediakan filter tabs per divisi (Accounting, Customs, Legal, Tax Advisory, Tax Compliance, Tax Dispute, Transfer Pricing)
5. THE System SHALL menampilkan detail Cross_Division_Data termasuk attachment jika ada
6. THE System SHALL menampilkan submission date untuk setiap data cross-division
7. THE System SHALL mencatat log akses untuk audit trail

### Requirement 11: Dashboard Monitoring untuk Validator

**User Story:** Sebagai Validator, saya ingin melihat keseluruhan dashboard untuk monitoring, sehingga saya dapat memantau data yang telah divalidasi.

#### Acceptance Criteria

1. WHEN Validator login, THE System SHALL menampilkan dashboard monitoring lengkap
2. THE System SHALL menyediakan tab "Pending Validations" untuk validasi data
3. THE System SHALL menyediakan tab "Fee Competitor" yang menampilkan insights dan data table
4. THE System SHALL menyediakan tab "Cross-Division" dengan filter per divisi
5. THE Dashboard SHALL menampilkan statistik validasi (jumlah data pending, accepted, rejected)
6. THE Dashboard SHALL menyediakan filter dan pencarian data

### Requirement 12: Sistem Notifikasi

**User Story:** Sebagai pengguna sistem, saya ingin menerima notifikasi untuk event yang relevan dengan role saya, sehingga saya dapat merespons dengan cepat.

#### Acceptance Criteria

1. WHEN data baru disubmit oleh Contributor, THE System SHALL mengirim notifikasi ke Validator
2. WHEN data memerlukan klarifikasi, THE System SHALL mengirim notifikasi ke Contributor yang bersangkutan
3. WHEN data di-accept, THE System SHALL mengirim notifikasi ke Contributor tentang perolehan poin
4. THE System SHALL menampilkan notifikasi di dalam aplikasi (in-app notification)
5. THE System SHALL menyimpan history notifikasi untuk setiap pengguna

### Requirement 13: Penyimpanan dan Keamanan Data

**User Story:** Sebagai administrator sistem, saya ingin data disimpan dengan aman dan terstruktur, sehingga integritas dan kerahasiaan data terjaga.

#### Acceptance Criteria

1. THE System SHALL menyimpan semua Fee_Data dan Cross_Division_Data di database terenkripsi
2. THE System SHALL mencatat audit trail untuk setiap perubahan data (create, update, delete)
3. THE System SHALL memastikan hanya role yang berwenang dapat mengakses data tertentu
4. THE System SHALL melakukan backup data secara berkala
5. WHEN terjadi kegagalan sistem, THE System SHALL dapat melakukan recovery data dari backup

### Requirement 14: Pencarian dan Filter Data

**User Story:** Sebagai pengguna dengan akses dashboard, saya ingin mencari dan memfilter data, sehingga saya dapat menemukan informasi yang relevan dengan cepat.

#### Acceptance Criteria

1. THE System SHALL menyediakan fitur pencarian berdasarkan keyword di dashboard
2. THE System SHALL menyediakan filter berdasarkan jenis jasa, pemberi jasa, penerima jasa, tahun pajak, dan skema fee untuk Fee_Data
3. THE System SHALL menyediakan filter berdasarkan periode waktu (tanggal mulai dan tanggal akhir)
4. THE System SHALL menyediakan filter berdasarkan kategori divisi untuk Cross_Division_Data
5. WHEN filter diterapkan, THE System SHALL menampilkan hasil yang sesuai dalam waktu kurang dari 2 detik

### Requirement 15: Export Data

**User Story:** Sebagai pengguna dengan akses dashboard, saya ingin mengexport data, sehingga saya dapat menggunakan data untuk analisis lebih lanjut.

#### Acceptance Criteria

1. THE System SHALL menyediakan fitur export data dalam format CSV dan Excel
2. WHEN pengguna memilih export, THE System SHALL mengexport data yang sedang ditampilkan (sesuai filter yang aktif)
3. THE System SHALL mencatat log export untuk audit trail
4. THE System SHALL memastikan hanya data yang sesuai dengan hak akses role yang di-export
5. WHEN export selesai, THE System SHALL memberikan file download ke pengguna

### Requirement 16: Fee Insights Dashboard

**User Story:** Sebagai pengguna dengan akses dashboard (Validator, Partner, Manager), saya ingin melihat insights dan data detail fee competitor dalam satu tampilan, sehingga saya dapat memahami tren dan pola fee market dengan lebih baik.

#### Acceptance Criteria

1. THE System SHALL menyediakan Fee Competitor Dashboard yang menggabungkan insights dan data table
2. THE Dashboard SHALL menampilkan insights section dengan 4 summary cards:
   - Total Data: Jumlah total data fee yang accepted
   - Total Amount: Total nilai fee dalam IDR (dalam jutaan)
   - Average Fee: Rata-rata nilai fee per submission
   - Fee Range: Range nilai fee dari minimum ke maximum
3. THE Dashboard SHALL menampilkan bar chart "Top 5 Service Types by Total Fee" dengan:
   - Nama service type
   - Total fee amount dalam IDR
   - Persentase dari total
   - Jumlah submissions
4. THE Dashboard SHALL menampilkan pie chart legend "Fee Scheme Distribution" dengan:
   - Nama fee scheme
   - Jumlah data per scheme
   - Persentase dari total
5. THE Dashboard SHALL menampilkan data table lengkap di bawah insights section
6. THE Dashboard SHALL menggunakan data fee yang sudah accepted (status "Accepted")
7. THE Dashboard SHALL responsive dan dapat diakses dari berbagai device
8. THE Dashboard SHALL menggunakan color coding yang konsisten dengan brand MUC Consulting
