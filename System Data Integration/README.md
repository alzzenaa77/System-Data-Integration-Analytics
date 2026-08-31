# Fee Intelligence & Market Benchmarking System

Platform untuk MUC Consulting yang memungkinkan pengumpulan, validasi, dan visualisasi data fee competitor serta informasi lintas divisi.

## Features

- 4 role pengguna: Contributor, Validator, Partner, SPV/Manager/PM
- Workflow validasi data bertingkat
- Sistem poin reward untuk contributor
- Dashboard analytics dan visualisasi
- Audit logging lengkap

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: React
- **Testing**: Jest

## Quick Start

### Prerequisites

- Node.js 16+ dan npm
- PostgreSQL 12+

### 1. Setup Database

```bash
# Create database
createdb fee_intelligence

# Copy environment file
copy .env.example .env

# Edit .env and set your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=fee_intelligence
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_secret_key_here
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Run Database Migration

```bash
# Create schema and load seed data
node src/database/migrate.js --setup --seed
```

### 4. Start Backend Server

```bash
# Development mode
npm run dev

# Or production mode
npm start
```

Backend akan berjalan di `http://localhost:3000`

### 5. Setup Frontend

```bash
cd client
npm install
```

### 6. Start Frontend

```bash
# From client directory
npm start
```

Frontend akan berjalan di `http://localhost:3001`

## Test Accounts

Gunakan akun berikut untuk testing (password: `password123`):

- **contributor1** - John Contributor (CONTRIBUTOR role)
- **contributor2** - Jane Contributor (CONTRIBUTOR role)
- **validator1** - Alice Validator (VALIDATOR role)
- **partner1** - Bob Partner (PARTNER role)
- **manager1** - Charlie Manager (SPV_MANAGER_PM role)

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Contributor
- `POST /api/fee-data` - Submit fee data
- `POST /api/cross-division-data` - Submit cross-division data
- `GET /api/my-data` - Get own data
- `GET /api/my-points` - Get points

### Validator
- `GET /api/validations/pending` - Get pending validations
- `POST /api/fee-data/:id/validate` - Validate fee data
- `POST /api/cross-division-data/:id/validate` - Validate cross-division data

### Dashboard
- `GET /api/dashboard/fee-competitor` - Fee competitor dashboard
- `GET /api/dashboard/cross-division` - Cross-division dashboard

## Testing the System

### 1. Login as Contributor
- Login dengan `contributor1` / `password123`
- Submit fee data atau cross-division data
- Check "My Data" untuk melihat status

### 2. Login as Validator
- Login dengan `validator1` / `password123`
- Lihat pending data
- Validate data (Accept/Reject/Need Clarification)

### 3. Login as Partner
- Login dengan `partner1` / `password123`
- Lihat dashboard fee competitor (hanya data yang accepted)

### 4. Login as Manager
- Login dengan `manager1` / `password123`
- Lihat dashboard fee competitor dan cross-division data

## Project Structure

```
├── src/
│   ├── config/          # Database configuration
│   ├── database/        # Schema, migrations, seed data
│   ├── middleware/      # Auth, errors middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── index.js         # Server entry point
├── client/              # React frontend
│   ├── public/
│   └── src/
│       ├── components/  # React components
│       ├── App.js
│       └── index.js
├── tests/               # Test files
└── package.json

```

## Development

### Run Tests

```bash
npm test
```

### Reset Database

```bash
node src/database/migrate.js --reset --seed
```

## Main Features Implemented

✅ Authentication & Authorization (JWT-based)
✅ Contributor Portal (Submit fee & cross-division data)
✅ Validator Portal (Validate data with Accept/Reject/Clarification)
✅ Partner Portal (View fee competitor dashboard)
✅ Manager Portal (View fee & cross-division dashboards)
✅ Point System (Contributors earn points for accepted data)
✅ Notification System
✅ Audit Logging
✅ Role-based Access Control

## Notes

- Sistem ini adalah MVP (Minimum Viable Product) untuk testing
- Password di seed data adalah hash dari "password123"
- Untuk production, ganti JWT_SECRET dengan nilai yang aman
- Database backup dapat dilakukan dengan: `pg_dump fee_intelligence > backup.sql`

## License

ISC
