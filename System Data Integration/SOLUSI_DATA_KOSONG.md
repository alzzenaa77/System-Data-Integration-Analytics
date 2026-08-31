# Solusi Data Kosong di Validator Portal

## 🔍 Penyebab Masalah

Saat Contributor menginput data dan Validator melihatnya, banyak field yang muncul **NULL/kosong** karena:

1. **Database masih berisi data lama** dengan struktur 8 fields (versi lama sistem)
2. **Sistem sekarang menggunakan** struktur 16 fields (versi baru)
3. Field-field baru seperti:
   - `submitter_name` (Nama Pengisi)
   - `submitter_division` (Divisi Pengisi)
   - `service_provider` (Pemberi Jasa)
   - `service_recipient` (Penerima Jasa)
   - `tax_year` (Tahun Pajak)
   - Dan field lainnya
   
   **TIDAK ADA** di data lama, sehingga tampil **NULL**.

## ✅ Solusi (3 Langkah Mudah)

### Langkah 1: Pastikan MySQL Running

**Windows:**
```bash
# Buka Services (Win+R, ketik: services.msc)
# Cari "MySQL" dan pastikan status "Running"
# Jika belum running, klik kanan → Start
```

### Langkah 2: Jalankan Script Cleanup

Buka terminal/command prompt di folder project, lalu jalankan:

```bash
node src/database/clean-old-data-mysql.js
```

Script ini akan:
- ✅ Menghitung jumlah data lama
- ✅ Menghapus semua data dengan struktur lama (yang NULL)
- ✅ Menampilkan jumlah data yang tersisa

**Output yang diharapkan:**
```
🔍 Checking for old data...

Found 5 old data entries to delete.

✅ Successfully deleted 5 old data entries!

Remaining data entries (with correct structure): 0
```

### Langkah 3: Restart Backend Server

```bash
# Stop backend server (tekan Ctrl+C di terminal yang menjalankan server)
# Lalu start kembali:
npm start
```

## 🧪 Verifikasi Setelah Cleanup

### 1. Test Submit Data Baru (Contributor)

1. Login sebagai **Contributor**
2. Klik tab **"Submit Fee Data"**
3. Isi **SEMUA 14 field wajib**:

   **A. Identitas Pengisi (3 fields)**
   - Nama Pengisi
   - Divisi
   - Tanggal Input

   **B. Identitas (2 fields)**
   - Pemberi Jasa (Service Provider)
   - Penerima Jasa (Service Recipient)

   **C. Detail Jasa (3 fields)**
   - Jenis Jasa
   - Scope of Work
   - Tahun Pajak

   **D. Financial Data (6 fields)**
   - Jenis Financial
   - Deskripsi Financial
   - Skema Fee
   - Nominal Fee
   - Currency (default: IDR)
   - Tanggal Financial

4. Klik **Submit**
5. Periksa tab **"My Data"** → Semua field harus terisi lengkap!

### 2. Test Validator Portal

1. Login sebagai **Validator**
2. Klik tab **"Pending Validations"**
3. Data baru harus tampil **LENGKAP** dengan semua field
4. Tidak ada lagi field yang NULL/kosong
5. Validate data (Accept/Reject)

### 3. Test Dashboard (Partner/Manager)

1. Login sebagai **Partner** atau **Manager**
2. Klik tab **"Fee Competitor"**
3. Data yang sudah di-approve harus tampil di insights dan table
4. Semua field harus terisi lengkap

## 🚨 Troubleshooting

### Error: "Cannot connect to MySQL"

**Solusi:**
1. Pastikan MySQL service running (lihat Langkah 1)
2. Periksa file `.env`:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=fee_intelligence
   DB_USER=root
   DB_PASSWORD=
   ```
3. Pastikan database `fee_intelligence` sudah dibuat

### Data masih kosong setelah cleanup

**Solusi:**
1. **Restart backend server** (Ctrl+C lalu `npm start`)
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Logout dan login kembali**
4. **Submit data BARU** (jangan gunakan data lama)

### Error saat submit data baru: "All fields are required"

**Solusi:**
- Pastikan **SEMUA 14 field** diisi, tidak boleh ada yang kosong
- Periksa format tanggal: `YYYY-MM-DD` (contoh: 2026-02-16)
- Periksa nominal fee: harus angka positif

## 📋 Struktur Data Baru (16 Fields)

### Identitas Pengisi (3 fields)
1. `submitter_name` - Nama Pengisi
2. `submitter_division` - Divisi Pengisi
3. `submitter_input_date` - Tanggal Input

### Identitas (2 fields)
4. `service_provider` - Pemberi Jasa
5. `service_recipient` - Penerima Jasa

### Detail Jasa (3 fields)
6. `service_type` - Jenis Jasa
7. `scope_of_work` - Scope of Work
8. `tax_year` - Tahun Pajak

### Financial Data (6 fields)
9. `financial_type` - Jenis Financial
10. `financial_description` - Deskripsi Financial
11. `fee_scheme` - Skema Fee
12. `fee_amount` - Nominal Fee
13. `currency` - Mata Uang
14. `financial_date` - Tanggal Financial

### System Fields (2 fields)
15. `status` - Status (PENDING/ACCEPTED/REJECTED)
16. `created_at` - Waktu Dibuat

## ⚠️ Catatan Penting

- ❌ Data lama yang dihapus **TIDAK BISA** dikembalikan
- ✅ Setelah cleanup, semua user harus **submit data baru** dengan struktur 16 fields
- ✅ Data baru akan tampil **lengkap** di semua portal (Contributor, Validator, Manager, Partner)

## 📞 Bantuan Lebih Lanjut

Jika masih ada masalah:
1. Screenshot error yang muncul
2. Periksa console browser (F12 → Console tab)
3. Periksa log backend server
4. Hubungi developer untuk debugging
