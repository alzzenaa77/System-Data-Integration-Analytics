# Quick Start Guide - Fee Intelligence System

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Step 1: Database Setup (2 minutes)

```bash
# 1. Create database
createdb fee_intelligence_db

# 2. Update .env file
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fee_intelligence_db

# 3. Run migration
node src/database/migrate.js --setup --seed
```

### Step 2: Backend Setup (1 minute)

```bash
# Install dependencies
npm install

# Start backend server
npm start
```

Backend running at: http://localhost:3000

### Step 3: Frontend Setup (1 minute)

```bash
# Navigate to client folder
cd client

# Install dependencies
npm install

# Start frontend
npm start
```

Frontend running at: http://localhost:3001

### Step 4: Login & Test (1 minute)

Open browser: http://localhost:3001

**Test Accounts:**
- Contributor: `contributor1` / `password123`
- Validator: `validator1` / `password123`
- Partner: `partner1` / `password123`
- Manager: `manager1` / `password123`

## 📝 Quick Test Flow

### As Contributor:
1. Login dengan `contributor1`
2. Click "Submit Fee Data"
3. Fill form dengan 4 sections:
   - **Identitas Pengisi**: Nama, Divisi, Tanggal
   - **Identitas**: Pemberi Jasa, Penerima Jasa
   - **Detail Jasa**: Jenis Jasa, Scope, Tahun Pajak
   - **Financial**: Jenis, Deskripsi, Skema, Nominal, Tanggal
4. Click "Submit Data"
5. Check "My Data" tab untuk melihat status

### As Validator:
1. Login dengan `validator1`
2. Review pending data
3. Click Accept/Reject/Clarify
4. Enter validation notes

### As Partner/Manager:
1. Login dengan `partner1` atau `manager1`
2. View dashboard dengan data lengkap
3. See all accepted fee data

## 🎯 Key Features to Test

### ✅ Form Input
- [ ] All 14 fields dapat diisi
- [ ] Validation works (required fields)
- [ ] Reset button clears form
- [ ] Success message muncul setelah submit

### ✅ Data Display
- [ ] Table menampilkan semua kolom baru
- [ ] Submitter info (nama + divisi) terlihat
- [ ] Currency dan fee scheme terlihat
- [ ] Status badges berwarna sesuai

### ✅ Validation Flow
- [ ] Validator dapat accept data
- [ ] Validator dapat reject data
- [ ] Validator dapat request clarification
- [ ] Status berubah sesuai action

### ✅ Dashboard
- [ ] Partner hanya lihat fee data
- [ ] Manager lihat fee + cross-division
- [ ] Data yang ditampilkan hanya yang "Accepted"

## 🎨 Form Structure

```
┌─────────────────────────────────────────┐
│ Identitas Pengisi                       │
│ ├─ Nama                                 │
│ ├─ Divisi                               │
│ └─ Tanggal Input                        │
├─────────────────────────────────────────┤
│ Identitas                               │
│ ├─ Pemberi Jasa                         │
│ └─ Penerima Jasa                        │
├─────────────────────────────────────────┤
│ Detail Jasa                             │
│ ├─ Jenis Jasa                           │
│ ├─ Scope of Work                        │
│ └─ Tahun Pajak                          │
├─────────────────────────────────────────┤
│ Financial Data                          │
│ ├─ Jenis                                │
│ ├─ Deskripsi                            │
│ ├─ Skema Fee                            │
│ ├─ Nominal                              │
│ ├─ Currency                             │
│ └─ Tanggal                              │
└─────────────────────────────────────────┘
```

## 📊 Sample Data

### Example Fee Data Input:
```
Identitas Pengisi:
- Nama: John Doe
- Divisi: Tax Division
- Tanggal Input: 2024-01-15

Identitas:
- Pemberi Jasa: ABC Consulting
- Penerima Jasa: XYZ Corporation

Detail Jasa:
- Jenis Jasa: Tax Consulting
- Scope of Work: Annual tax planning and compliance review
- Tahun Pajak: 2024

Financial Data:
- Jenis: Professional Fee
- Deskripsi: Comprehensive tax advisory services for fiscal year 2024
- Skema Fee: Fixed
- Nominal: 50,000,000
- Currency: IDR
- Tanggal: 2024-01-15
```

## 🔧 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -l | grep fee_intelligence_db

# Recreate if needed
dropdb fee_intelligence_db
createdb fee_intelligence_db
node src/database/migrate.js --setup --seed
```

### Port Already in Use
```bash
# Backend (port 3000)
# Kill process on port 3000
npx kill-port 3000

# Frontend (port 3001)
# Kill process on port 3001
npx kill-port 3001
```

### Frontend Not Loading
```bash
# Clear cache and reinstall
cd client
rm -rf node_modules package-lock.json
npm install
npm start
```

## 📚 Documentation

- **Full Guide**: `IMPLEMENTATION_GUIDE.md`
- **Changes**: `CHANGES_SUMMARY.md`
- **Requirements**: `.kiro/specs/fee-intelligence-market-benchmarking/requirements.md`
- **Design**: `.kiro/specs/fee-intelligence-market-benchmarking/design.md`

## 🎉 Success Indicators

You're ready when you see:
- ✅ Backend running without errors
- ✅ Frontend loads at localhost:3001
- ✅ Login works with test accounts
- ✅ Form has 4 clear sections
- ✅ Data submits successfully
- ✅ Tables show all new columns
- ✅ Validation workflow works

## 💡 Tips

1. **Use Chrome DevTools** untuk inspect form validation
2. **Check Network Tab** untuk melihat API calls
3. **Use PostgreSQL client** untuk verify data di database
4. **Test responsive design** dengan browser resize
5. **Try all user roles** untuk understand full workflow

## 🚀 Ready to Go!

Sistem sudah siap digunakan dengan:
- ✅ Modern, sectioned form design
- ✅ Comprehensive data capture (14 fields)
- ✅ Enhanced validation
- ✅ Better data visualization
- ✅ Responsive design
- ✅ Complete workflow (submit → validate → dashboard)

Happy testing! 🎊
