# Migrasi dari PostgreSQL ke MySQL

## Keuntungan MySQL
- ✅ Lebih ringan dan cepat di Windows
- ✅ Lebih mudah di-install dan di-manage
- ✅ Kompatibel dengan XAMPP (sudah include MySQL)
- ✅ Lebih familiar untuk banyak developer

## Langkah Migrasi

### Step 1: Install MySQL

**Opsi A: Via XAMPP (RECOMMENDED)**
1. Download XAMPP dari https://www.apachefriends.org/
2. Install XAMPP
3. Buka XAMPP Control Panel
4. Start "MySQL" service
5. MySQL akan running di port 3306

**Opsi B: MySQL Standalone**
1. Download MySQL dari https://dev.mysql.com/downloads/installer/
2. Install MySQL Server
3. Set root password saat instalasi
4. Start MySQL service

### Step 2: Install MySQL Package untuk Node.js

```bash
npm install mysql2
```

### Step 3: Update Environment Variables

Edit file `.env`:

```env
# Database Configuration - MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=fee_intelligence
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Secret
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# Server Port
PORT=3000
```

### Step 4: Create Database

**Via phpMyAdmin (jika pakai XAMPP):**
1. Buka http://localhost/phpmyadmin
2. Klik "New" untuk create database baru
3. Nama database: `fee_intelligence`
4. Collation: `utf8mb4_general_ci`
5. Klik "Create"

**Via MySQL Command Line:**
```sql
CREATE DATABASE fee_intelligence CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE fee_intelligence;
```

### Step 5: Update Database Connection Files

Saya akan membuat file-file baru untuk MySQL.

### Step 6: Run MySQL Schema

Jalankan schema SQL yang sudah saya buat untuk MySQL.

### Step 7: Restart Backend

```bash
npm start
```

## File yang Perlu Diupdate

1. ✅ `src/config/database.js` - MySQL connection
2. ✅ `src/database/pool.js` - MySQL pool
3. ✅ `src/database/schema-mysql.sql` - MySQL schema
4. ✅ `src/database/seed-mysql.sql` - MySQL seed data
5. ✅ `package.json` - Add mysql2 dependency

## Perbedaan PostgreSQL vs MySQL

### Syntax Differences:
- PostgreSQL: `SERIAL` → MySQL: `AUTO_INCREMENT`
- PostgreSQL: `TEXT` → MySQL: `TEXT` (sama)
- PostgreSQL: `TIMESTAMP` → MySQL: `DATETIME`
- PostgreSQL: `$1, $2` → MySQL: `?` (parameterized queries)
- PostgreSQL: `RETURNING *` → MySQL: `LAST_INSERT_ID()`

### UUID:
- PostgreSQL: Native UUID type
- MySQL: Use `VARCHAR(36)` atau `CHAR(36)`

## Troubleshooting

### Error: "Client does not support authentication protocol"
**Solusi:**
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

### Error: "ER_NOT_SUPPORTED_AUTH_MODE"
**Solusi:** Update MySQL ke versi terbaru atau gunakan mysql2 package

### Error: "Access denied for user"
**Solusi:** Periksa username dan password di file .env

## Verifikasi Migrasi

1. ✅ MySQL service running
2. ✅ Database `fee_intelligence` created
3. ✅ Tables created (users, fee_data, cross_division_data, dll)
4. ✅ Backend bisa connect ke MySQL
5. ✅ Test submit data via Contributor portal
6. ✅ Test validate via Validator portal
7. ✅ Test dashboard via Partner/Manager portal

## Rollback ke PostgreSQL

Jika ingin kembali ke PostgreSQL:
1. Stop MySQL service
2. Start PostgreSQL service
3. Update .env dengan PostgreSQL credentials
4. Restart backend

---

**Next Steps:** Saya akan membuat semua file yang diperlukan untuk MySQL.
