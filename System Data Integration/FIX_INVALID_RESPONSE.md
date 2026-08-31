# Fix: Error received invalid response: 59

## Masalah
Error saat login: **"Error: received invalid response: 59"**

## Penyebab
Backend mengembalikan response yang tidak valid (bukan JSON proper). Ini terjadi karena:
1. Response structure dari `authService.login()` tidak konsisten
2. `/me` endpoint tidak query database untuk full user details

## Perbaikan yang Sudah Dilakukan

### 1. Fix Login Response Structure
**File:** `src/routes/auth.js`

```javascript
// Before:
const result = await login(username, password);
res.json(result); // Returns flat object with success, token, userId, etc.

// After:
const result = await login(username, password);

if (!result.success) {
  return res.status(401).json({
    error: { message: result.error, status: 401 }
  });
}

res.json({
  token: result.token,
  user: {
    id: result.userId,
    username: result.username,
    email: result.email,
    fullName: result.fullName,
    role: result.role
  },
  expiresAt: result.expiresAt
});
```

### 2. Fix /me Endpoint
**File:** `src/routes/auth.js`

```javascript
// Before:
res.json({ user: req.user }); // req.user only has id, role, username from token

// After:
const [rows] = await pool.query(
  'SELECT id, username, email, full_name, role FROM users WHERE id = ?',
  [req.user.id]
);
res.json({
  user: {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.full_name,
    role: user.role
  }
});
```

## Cara Test

### 1. Restart Backend
```bash
# Stop backend (Ctrl+C)
npm start
```

**Expected output:**
```
✅ MySQL Database connected successfully
Server running on port 3000
```

### 2. Clear Browser Storage
- Tekan `F12` → Application → Clear site data
- Atau di console:
```javascript
localStorage.clear();
location.reload();
```

### 3. Test Login
1. Buka http://localhost:3000
2. Login: `contributor1` / `password123`
3. **Check DevTools Console** - tidak ada error
4. **Check Network tab:**
   - POST /api/auth/login
   - Response harus JSON valid:
   ```json
   {
     "token": "eyJhbGc...",
     "user": {
       "id": 1,
       "username": "contributor1",
       "email": "contributor1@muc.com",
       "fullName": "John Contributor",
       "role": "CONTRIBUTOR"
     },
     "expiresAt": "2024-..."
   }
   ```

### 4. Test Submit Data
1. Klik "Submit Fee Data"
2. Isi semua fields
3. Submit
4. Harus berhasil tanpa error!

## Response Structure

### Login Response (Correct)
```json
{
  "token": "JWT_TOKEN_STRING",
  "user": {
    "id": 1,
    "username": "contributor1",
    "email": "contributor1@muc.com",
    "fullName": "John Contributor",
    "role": "CONTRIBUTOR"
  },
  "expiresAt": "2024-02-19T10:00:00.000Z"
}
```

### Error Response (Correct)
```json
{
  "error": {
    "message": "Username atau password salah",
    "status": 401
  }
}
```

## Troubleshooting

### Error masih muncul?

1. **Check Backend Console:**
   - Lihat apakah ada error saat query database
   - Pastikan MySQL connection berhasil

2. **Check Network Response:**
   - F12 → Network → POST /api/auth/login
   - Tab "Response" → Harus JSON valid
   - Jika response kosong atau HTML, berarti ada error di backend

3. **Test Login via curl:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"contributor1","password":"password123"}'
```

4. **Check Database:**
```sql
USE fee_intelligence;
SELECT * FROM users WHERE username = 'contributor1';
```

---

**Status:** Fixed ✅
**Next:** Restart backend, clear storage, test login

