# Fix: Cannot read properties of undefined (reading 'id')

## Masalah
Error saat submit data: **"Cannot read properties of undefined (reading 'id')"**

## Penyebab
Token JWT tidak terkirim ke backend, sehingga `req.user` undefined di backend route.

## Perbaikan yang Sudah Dilakukan

### Add Authorization Headers to API Calls
**File:** `client/src/services/api.js`

```javascript
// Added helper function
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Updated all API methods
api.get(endpoint) → axios.get(url, { headers: getAuthHeaders() })
api.post(endpoint, data) → axios.post(url, data, { headers: getAuthHeaders() })
api.put(endpoint, data) → axios.put(url, data, { headers: getAuthHeaders() })
```

## Cara Test

### 1. Restart Frontend
```bash
cd client
npm start
```

### 2. Clear Browser Storage
- Tekan `F12` untuk buka DevTools
- Tab "Application" → Storage → "Clear site data"
- Atau run di console:
```javascript
localStorage.clear();
location.reload();
```

### 3. Login Ulang
1. Buka http://localhost:3000
2. Login: `contributor1` / `password123`
3. **Check DevTools:**
   - Application → Local Storage → Harus ada key `token`
   - Console → Tidak ada error

### 4. Test Submit
1. Klik "Submit Fee Data"
2. Isi semua 14 fields
3. Klik "Submit Data"
4. **Check DevTools Network:**
   - POST /api/fee-data
   - Request Headers → `Authorization: Bearer eyJhbGc...`
   - Response Status → 201 Created
5. Klik "My Data" → Data harus tampil lengkap

## Authentication Flow

```
Login
  ↓ POST /api/auth/login
  ↓ Backend returns { token, user }
  ↓ localStorage.setItem('token', token)
  ↓
Submit Data
  ↓ api.post('/fee-data', data)
  ↓ getAuthHeaders() reads token from localStorage
  ↓ Adds Authorization: Bearer <token>
  ↓ Backend authenticateToken middleware
  ↓ Validates token → sets req.user
  ✅ req.user.id available
```

## Troubleshooting

### Error masih muncul?

1. **Check localStorage:**
```javascript
// Di browser console:
console.log(localStorage.getItem('token'));
// Harus return JWT string, bukan null
```

2. **Check Network Request:**
- F12 → Network → POST /api/fee-data
- Request Headers harus ada: `Authorization: Bearer ...`

3. **Force Logout & Login:**
```javascript
localStorage.clear();
location.reload();
```

4. **Check Backend Console:**
- Lihat apakah ada error "Token tidak ditemukan"

---

**Status:** Fixed ✅
**Next:** Restart frontend, clear storage, login ulang, test submit

