# Setup MySQL - Cara Paling Mudah (Tanpa phpMyAdmin)

## Langkah 1: Start MySQL di XAMPP

1. Buka **XAMPP Control Panel**
2. Klik tombol **Start** di baris **MySQL** (BUKAN Apache)
3. Tunggu sampai status berubah jadi hijau "Running"

**Catatan:** Anda TIDAK perlu start Apache. Kita hanya butuh MySQL!

## Langkah 2: Update File .env

Buka file `.env` di root project, pastikan isinya seperti ini:

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

**Penting:** `DB_PASSWORD=` (kosong) karena XAMPP default tidak pakai password.

## Langkah 3: Run Setup Script

Jalankan script otomatis yang sudah saya buat:

```bash
node src/database/setup-mysql.js
```

Script ini akan:
- ✅ Create database `fee_intelligence`
- ✅ Create 7 tables (users, fee_data, dll)
- ✅ Insert 4 sample users
- ✅ Semua otomatis!

**Expected output:**
```
✅ MySQL Database connected successfully
✅ Database 'fee_intelligence' created successfully
✅ Schema created successfully
✅ Seed data inserted successfully
🎉 MySQL setup complete!
```

## Langkah 4: Start Backend Server

```bash
npm start
```

**Expected output:**
```
✅ MySQL Database connected successfully
Server running on port 3000
```

## Langkah 5: Test Application

1. Buka browser: http://localhost:3000
2. Login dengan:
   - Username: `contributor1`
   - Password: `password123`
3. Submit data baru dengan 14 fields lengkap
4. Periksa apakah data tampil dengan benar!

## Troubleshooting

### Error: "ECONNREFUSED 127.0.0.1:3306"
**Penyebab:** MySQL belum running
**Solusi:** 
1. Buka XAMPP Control Panel
2. Start MySQL
3. Tunggu sampai hijau "Running"

### Error: "Access denied for user 'root'@'localhost'"
**Penyebab:** Password salah
**Solusi:**
1. Buka file `.env`
2. Pastikan `DB_PASSWORD=` (kosong)
3. Jika masih error, coba `DB_PASSWORD=root`

### Error: "Cannot find module 'mysql2'"
**Solusi:**
```bash
npm install mysql2
```

### Script setup-mysql.js error
**Solusi:** Jalankan manual via MySQL command line (lihat SETUP_MYSQL.md)

## Verify Database (Optional)

Jika ingin cek database secara manual:

```bash
# Buka MySQL command line dari XAMPP
# Biasanya di: C:\xampp\mysql\bin\mysql.exe -u root

# Atau via PowerShell:
& "C:\xampp\mysql\bin\mysql.exe" -u root

# Setelah masuk MySQL:
SHOW DATABASES;
USE fee_intelligence;
SHOW TABLES;
SELECT * FROM users;
```

## Default Users

| Username | Password | Role |
|----------|----------|------|
| contributor1 | password123 | CONTRIBUTOR |
| validator1 | password123 | VALIDATOR |
| partner1 | password123 | PARTNER |
| manager1 | password123 | SPV_MANAGER_PM |

---

**Selesai!** Sekarang aplikasi sudah pakai MySQL dan siap digunakan.

