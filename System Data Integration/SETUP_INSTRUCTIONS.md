# Setup Instructions - Fee Intelligence System

## Langkah-langkah Setup dan Menjalankan Sistem

### 1. Prerequisites
Pastikan sudah terinstall:
- Node.js 16+ dan npm
- PostgreSQL 12+

### 2. Setup Database

```bash
# Buat database baru
createdb fee_intelligence

# Atau jika menggunakan psql:
psql -U postgres
CREATE DATABASE fee_intelligence;
\q
```

### 3. Setup Environment Variables

```bash
# Copy file .env.example menjadi .env
copy .env.example .env

# Edit .env dan sesuaikan dengan konfigurasi database Anda
```

Isi .env:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fee_intelligence
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=your_secret_key_minimum_32_characters
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
```

### 4. Install Dependencies Backend

```bash
# Di root folder project
npm install
```

### 5. Setup Database Schema dan Seed Data

```bash
# Jalankan migration untuk create schema dan load seed data
node src/database/migrate.js --setup --seed
```

Output yang diharapkan:
```
✓ Connected to database
✓ Creating database schema completed successfully
✓ Loading seed data completed successfully
✓ Migration completed successfully!
```

### 6. Start Backend Server

```bash
# Development mode (dengan auto-reload)
npm run dev

# Atau production mode
npm start
```

Server akan berjalan di `http://localhost:3000`

Test dengan browser atau curl:
```bash
curl http://localhost:3000/health
```

### 7. Setup Frontend

Buka terminal baru:

```bash
# Masuk ke folder client
cd client

# Install dependencies
npm install
```

### 8. Start Frontend

```bash
# Dari folder client
npm start
```

Frontend akan berjalan di `http://localhost:3001` dan otomatis membuka browser.

## Testing Sistem

### Test Accounts

Gunakan akun berikut untuk login (password semua: `password123`):

1. **Contributor** - `contributor1` / `password123`
2. **Validator** - `validator1` / `password123`
3. **Partner** - `partner1` / `password123`
4. **Manager** - `manager1` / `password123`

### Skenario Testing

#### 1. Test sebagai Contributor
1. Login dengan `contributor1` / `password123`
2. Klik tab "Submit Fee Data"
3. Isi form:
   - Source: "Market Report Q1 2024"
   - Service Type: "Audit Services"
   - Fee Amount: 150000000
   - Date: pilih tanggal hari ini
   - Description: "Test data"
4. Klik Submit
5. Klik tab "My Data" untuk melihat data yang baru disubmit (status: PENDING)

#### 2. Test sebagai Validator
1. Logout dari contributor
2. Login dengan `validator1` / `password123`
3. Lihat "Pending Fee Data" - akan muncul data yang tadi disubmit
4. Klik tombol "Accept" pada data tersebut
5. Masukkan notes: "Data verified and accepted"
6. Data akan hilang dari pending list (sudah divalidasi)

#### 3. Test sebagai Contributor (cek points)
1. Logout dari validator
2. Login kembali dengan `contributor1` / `password123`
3. Klik tab "My Data" - status data sekarang "ACCEPTED"
4. Klik tab "My Points" - akan muncul 1 point (dari data yang di-accept)

#### 4. Test sebagai Partner
1. Logout dari contributor
2. Login dengan `partner1` / `password123`
3. Akan langsung muncul "Fee Competitor Dashboard"
4. Lihat data yang sudah ACCEPTED (termasuk data yang tadi disubmit)
5. Partner TIDAK bisa akses cross-division data

#### 5. Test sebagai Manager
1. Logout dari partner
2. Login dengan `manager1` / `password123`
3. Klik tab "Fee Competitor" - lihat fee data yang accepted
4. Klik tab "Cross-Division" - lihat cross-division data yang accepted
5. Manager bisa akses kedua jenis data

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solusi**: Pastikan PostgreSQL sudah running dan credentials di .env benar.

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solusi**: 
- Matikan aplikasi lain yang menggunakan port 3000
- Atau ubah PORT di .env menjadi port lain (misal 3001)

### Migration Failed
```
Error: relation "users" already exists
```
**Solusi**: Reset database terlebih dahulu:
```bash
node src/database/migrate.js --reset --seed
```

### Frontend Cannot Connect to Backend
**Solusi**: 
- Pastikan backend sudah running di port 3000
- Check CORS_ORIGIN di .env backend sudah sesuai dengan port frontend
- Clear browser cache dan reload

### Login Failed
```
Error: Username atau password salah
```
**Solusi**: 
- Pastikan seed data sudah di-load dengan benar
- Check di database: `psql -d fee_intelligence -c "SELECT username FROM users;"`
- Pastikan menggunakan password: `password123`

## Reset Database

Jika ingin reset database dan mulai dari awal:

```bash
# Reset dan reload seed data
node src/database/migrate.js --reset --seed
```

## Struktur Data Seed

Seed data yang di-load:
- 5 users (contributor1, contributor2, validator1, partner1, manager1)
- 7 fee data records (berbagai status)
- 4 cross-division data records
- Point transactions
- Notifications
- Audit logs

## Next Steps

Setelah sistem berjalan, Anda bisa:
1. Test semua fitur dengan berbagai role
2. Submit data baru sebagai contributor
3. Validate data sebagai validator
4. Lihat dashboard sebagai partner/manager
5. Check audit logs di database

## Support

Jika ada masalah, check:
1. Console log di terminal backend
2. Console log di browser (F12 > Console)
3. Database logs: `tail -f /var/log/postgresql/postgresql-*.log`
