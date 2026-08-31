# Migration Instructions - Database Update

## Masalah
Data di database masih menggunakan struktur lama (8 field) sedangkan aplikasi sudah menggunakan struktur baru (16 field untuk fee_data dan submission_date untuk cross_division_data).

## Solusi

### Opsi 1: Reset Database (Recommended untuk Development)
Jika Anda masih dalam tahap development dan tidak masalah kehilangan data:

```bash
# Reset database dan load seed data baru
node src/database/migrate.js --reset --seed
```

Ini akan:
1. Drop semua table
2. Buat ulang dengan struktur baru
3. Load seed data dengan 16 field lengkap

### Opsi 2: Manual Migration (Untuk Production)
Jika Anda sudah punya data production yang tidak boleh hilang:

1. **Backup database terlebih dahulu!**
```bash
pg_dump -U postgres fee_intelligence > backup_$(date +%Y%m%d).sql
```

2. **Jalankan migration untuk menambah field baru**
```bash
node src/database/run-migration.js
```

3. **Update data yang sudah ada dengan nilai default**
```sql
-- Update fee_data yang sudah ada
UPDATE fee_data 
SET 
  submitter_name = COALESCE(submitter_name, 'Unknown'),
  submitter_division = COALESCE(submitter_division, 'Unknown'),
  submitter_input_date = COALESCE(submitter_input_date, created_at::DATE),
  service_provider = COALESCE(service_provider, source),
  service_recipient = COALESCE(service_recipient, 'Unknown'),
  scope_of_work = COALESCE(scope_of_work, description),
  tax_year = COALESCE(tax_year, EXTRACT(YEAR FROM date)::TEXT),
  financial_type = COALESCE(financial_type, 'Professional Fee'),
  financial_description = COALESCE(financial_description, description),
  fee_scheme = COALESCE(fee_scheme, 'Fixed Fee'),
  financial_date = COALESCE(financial_date, date)
WHERE submitter_name IS NULL;

-- Update cross_division_data yang sudah ada
UPDATE cross_division_data 
SET submission_date = COALESCE(submission_date, created_at::DATE)
WHERE submission_date IS NULL;
```

### Opsi 3: Fresh Start (Paling Mudah)
Jika database masih kosong atau baru setup:

```bash
# Setup database dari awal
node src/database/migrate.js --setup --seed
```

## Verifikasi
Setelah migration, cek apakah data sudah benar:

```sql
-- Cek struktur fee_data
SELECT 
  submitter_name, 
  submitter_division, 
  service_provider, 
  service_recipient, 
  service_type, 
  tax_year,
  fee_amount,
  status
FROM fee_data 
LIMIT 5;

-- Cek struktur cross_division_data
SELECT 
  title, 
  division_category, 
  submission_date, 
  attachment_url,
  status
FROM cross_division_data 
LIMIT 5;
```

## Troubleshooting

### Error: "column does not exist"
Artinya migration belum dijalankan. Jalankan:
```bash
node src/database/run-migration.js
```

### Data masih kosong di UI
1. Cek apakah backend running: `http://localhost:3000/health`
2. Cek console browser untuk error
3. Cek apakah token JWT masih valid (logout dan login lagi)
4. Cek database apakah data ada:
```sql
SELECT COUNT(*) FROM fee_data WHERE contributor_id = 'YOUR_USER_ID';
```

## Catatan Penting
- Struktur baru memiliki 16 field untuk fee_data (dari 8 field)
- Cross-division data sekarang wajib punya submission_date
- Seed data sudah diupdate dengan struktur baru
- Frontend sudah siap menampilkan semua field baru
