# Setup MySQL - Panduan Lengkap

## Step 1: Install mysql2 Package

```bash
npm install mysql2
```

## Step 2: Update .env File

Edit file `.env` di root project:

```env
# Database Configuration - MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=fee_intelligence
DB_USER=root
DB_PASSWORD=

# JWT Secret
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRES_IN=24h

# Server Port
PORT=3000
```

**Catatan:**
- Jika pakai XAMPP, password biasanya kosong
- Jika pakai MySQL standalone, gunakan password yang Anda set saat instalasi

## Step 3: Start MySQL Service

**Via XAMPP:**
1. Buka XAMPP Control Panel
2. Klik "Start" pada MySQL
3. Tunggu sampai status "Running" (hijau)

**Via Windows Services:**
1. Tekan `Win + R`
2. Ketik `services.msc` dan Enter
3. Cari "MySQL" atau "MySQL80"
4. Klik kanan → Start

## Step 4: Create Database

**Opsi A: Via phpMyAdmin (XAMPP)**
1. Buka browser: http://localhost/phpmyadmin
2. Klik tab "Databases"
3. Nama database: `fee_intelligence`
4. Collation: `utf8mb4_unicode_ci`
5. Klik "Create"

**Opsi B: Via MySQL Command Line**
```bash
# Buka MySQL command line
mysql -u root -p

# Create database
CREATE DATABASE fee_intelligence CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Verify
SHOW DATABASES;

# Exit
EXIT;
```

## Step 5: Run Schema SQL

**Via phpMyAdmin:**
1. Buka phpMyAdmin
2. Pilih database `fee_intelligence`
3. Klik tab "SQL"
4. Copy-paste isi file `src/database/schema-mysql.sql`
5. Klik "Go"
6. Tunggu sampai selesai (akan create 7 tables)

**Via MySQL Command Line:**
```bash
mysql -u root -p fee_intelligence < src/database/schema-mysql.sql
```

## Step 6: (Optional) Insert Seed Data

**Via phpMyAdmin:**
1. Pilih database `fee_intelligence`
2. Klik tab "SQL"
3. Copy-paste isi file `src/database/seed-mysql.sql`
4. Klik "Go"

**Via MySQL Command Line:**
```bash
mysql -u root -p fee_intelligence < src/database/seed-mysql.sql
```

## Step 7: Update Backend Code

Ganti import pool di semua file backend:

**File yang perlu diupdate:**
1. `src/services/dataService.js`
2. `src/services/authService.js`
3. `src/services/pointService.js`
4. `src/services/notificationService.js`
5. `src/services/validationService.js`
6. `src/services/dashboardService.js`
7. `src/services/auditService.js`
8. `src/routes/contributor.js`
9. `src/routes/validator.js`
10. `src/routes/dashboard.js`
11. `src/routes/auth.js`

**Ganti:**
```javascript
const pool = require('../database/pool');
```

**Menjadi:**
```javascript
const pool = require('../database/pool-mysql');
```

**ATAU** rename file:
```bash
# Backup PostgreSQL pool
mv src/database/pool.js src/database/pool-postgres.js

# Rename MySQL pool
mv src/database/pool-mysql.js src/database/pool.js
```

## Step 8: Update Query Syntax (Jika Perlu)

MySQL menggunakan `?` untuk parameterized queries, bukan `$1, $2, $3`.

**PostgreSQL:**
```javascript
await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
```

**MySQL:**
```javascript
await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
```

**Tapi** dengan `mysql2/promise`, kita bisa tetap pakai named parameters atau array.

## Step 9: Start Backend Server

```bash
npm start
```

**Expected output:**
```
✅ MySQL Database connected successfully
Server running on port 3000
```

## Step 10: Test Application

### 1. Test Login
- Buka browser: http://localhost:3000
- Login dengan:
  - Username: `contributor1`
  - Password: `password123`

### 2. Test Submit Data
- Klik tab "Submit Fee Data"
- Isi semua 14 fields
- Submit
- Periksa tab "My Data" - data harus tampil lengkap!

### 3. Test Validator
- Logout
- Login sebagai `validator1` / `password123`
- Klik "Pending Validations"
- Validate data (Accept)

### 4. Test Dashboard
- Logout
- Login sebagai `partner1` / `password123`
- Klik "Fee Competitor"
- Data harus tampil di insights dan table!

## Troubleshooting

### Error: "Cannot find module 'mysql2'"
**Solusi:**
```bash
npm install mysql2
```

### Error: "Access denied for user 'root'@'localhost'"
**Solusi:**
1. Periksa password di file `.env`
2. Jika pakai XAMPP, password biasanya kosong
3. Reset password MySQL jika perlu

### Error: "Unknown database 'fee_intelligence'"
**Solusi:**
```sql
CREATE DATABASE fee_intelligence;
```

### Error: "ER_NOT_SUPPORTED_AUTH_MODE"
**Solusi:**
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

### Error: "Table 'fee_intelligence.users' doesn't exist"
**Solusi:** Run schema SQL lagi (Step 5)

### Backend tidak bisa connect ke MySQL
**Solusi:**
1. Pastikan MySQL service running
2. Periksa port di `.env` (default: 3306)
3. Test connection via MySQL Workbench atau phpMyAdmin

## Verify Database

**Via phpMyAdmin:**
1. Pilih database `fee_intelligence`
2. Klik tab "Structure"
3. Harus ada 7 tables:
   - users
   - fee_data
   - cross_division_data
   - clarification_history
   - notifications
   - point_transactions
   - audit_logs

**Via MySQL Command Line:**
```sql
USE fee_intelligence;
SHOW TABLES;
DESCRIBE fee_data;
SELECT COUNT(*) FROM users;
```

## Clean Old Data (Jika Ada)

Jika ada data lama dengan struktur 8 fields:

```sql
-- Via phpMyAdmin atau MySQL command line
USE fee_intelligence;

-- Lihat data lama
SELECT id, status, created_at
FROM fee_data
WHERE submitter_name IS NULL;

-- Hapus data lama
DELETE FROM fee_data
WHERE submitter_name IS NULL 
   OR service_provider IS NULL 
   OR service_recipient IS NULL
   OR tax_year IS NULL;

-- Verify
SELECT COUNT(*) FROM fee_data;
```

## Default Users (Seed Data)

Jika Anda run seed data, ada 4 user default:

| Username | Password | Role | Email |
|----------|----------|------|-------|
| contributor1 | password123 | CONTRIBUTOR | contributor1@muc.com |
| validator1 | password123 | VALIDATOR | validator1@muc.com |
| partner1 | password123 | PARTNER | partner1@muc.com |
| manager1 | password123 | SPV_MANAGER_PM | manager1@muc.com |

**⚠️ PENTING:** Ganti password ini di production!

## Next Steps

Setelah MySQL setup berhasil:

1. ✅ Test submit data baru
2. ✅ Test validation workflow
3. ✅ Test dashboard insights
4. ✅ Test point system
5. ✅ Test cross-division data
6. ✅ Ganti default passwords
7. ✅ Setup backup database

---

**Catatan:** Jika ada masalah, screenshot error dan periksa console backend untuk detail error.
