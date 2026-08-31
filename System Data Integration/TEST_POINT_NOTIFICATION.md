# Test Point System & Notifications

## Fitur yang Sudah Diimplementasi

### 1. Point System ✅
- Contributor mendapat +5 poin saat data di-approve
- Point bisa di-redeem (kelipatan 5)
- Point history tercatat

### 2. Notification System ✅
- Validator mendapat notifikasi saat contributor redeem poin
- Notification bell dengan badge unread count
- Notification panel dengan detail redemption

---

## Cara Test Point System

### STEP 1: Submit Data sebagai Contributor

1. Login: `contributor1` / `password123`
2. Submit Fee Data:
   - Isi semua 14 fields
   - Submit
3. Submit Cross-Division Data:
   - Isi semua fields
   - Submit
4. Check "My Points" tab → Harus 0 poin (belum di-approve)

### STEP 2: Approve Data sebagai Validator

1. Logout → Login: `validator1` / `password123`
2. Klik tab "Pending Validations"
3. Lihat 2 data pending (1 fee, 1 cross-division)
4. Approve Fee Data:
   - Klik "Accept"
   - Confirm
5. Approve Cross-Division Data:
   - Klik "Accept"
   - Confirm

### STEP 3: Check Points sebagai Contributor

1. Logout → Login: `contributor1` / `password123`
2. Klik tab "My Points"
3. **Expected:**
   - Total Points: **10** (5 + 5)
   - Redeemable Multiples: **2**
   - Can Redeem: **Yes**
   - History:
     - Fee data approved: +5 points
     - Cross-division data approved: +5 points

---

## Cara Test Notification System

### STEP 1: Redeem Points sebagai Contributor

1. Login: `contributor1` / `password123`
2. Klik tab "My Points"
3. Klik tombol "Redeem Points"
4. Input: `10` (atau kelipatan 5 lainnya)
5. Klik "Redeem"
6. **Expected:**
   - Success message
   - Total points berkurang: 10 → 0

### STEP 2: Check Notification sebagai Validator

1. Logout → Login: `validator1` / `password123`
2. Lihat **notification bell** (🔔) di header
3. **Expected:**
   - Badge merah dengan angka **1** (unread count)
4. Klik notification bell
5. **Expected:**
   - Notification panel muncul
   - Isi notifikasi:
     - 🎁 Point Redemption Request
     - "John Contributor has redeemed 10 points"
     - Badge: "10 points"
     - Timestamp

---

## Expected Flow Diagram

```
Contributor Submit Data
  ↓
Validator Approve
  ↓
Contributor +5 Points ✅
  ↓
Contributor Redeem Points
  ↓
Notification to Validator 🔔
  ↓
Validator See Notification
```

---

## Test Scenarios

### Scenario 1: Multiple Approvals
1. Contributor submit 3 data
2. Validator approve all 3
3. **Expected:** Contributor has 15 points (3 × 5)

### Scenario 2: Partial Approval
1. Contributor submit 3 data
2. Validator approve 2, reject 1
3. **Expected:** Contributor has 10 points (2 × 5)

### Scenario 3: Multiple Redemptions
1. Contributor has 20 points
2. Redeem 10 points
3. **Expected:** 
   - Remaining: 10 points
   - Validator gets 1 notification
4. Redeem 5 points again
5. **Expected:**
   - Remaining: 5 points
   - Validator gets 2nd notification

### Scenario 4: Notification Badge
1. Validator has 3 unread notifications
2. **Expected:** Badge shows "3"
3. Click notification bell
4. **Expected:** Panel shows all 3 notifications

---

## UI Elements

### Contributor Portal - My Points Tab:
```
┌─────────────────────────────────────────────────────┐
│  My Contribution Points                             │
│  Track and redeem your contribution rewards         │
├─────────────────────────────────────────────────────┤
│  Available Points                                   │
│  ┌───────────────────────────────────────────────┐ │
│  │  🎁  10 points                                │ │
│  │  Silver Member                                │ │
│  │  Kelipatan 5 poin • Dapat ditukar 3 bulan    │ │
│  │  [Redeem Points]                              │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Recent Activity                                    │
│  ┌───────────────────────────────────────────────┐ │
│  │  Fee data approved        +5    [Approved]    │ │
│  │  Cross-division approved  +5    [Approved]    │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Validator Portal - Notification Bell:
```
┌─────────────────────────────────────────────────────┐
│  Validator Portal          🔔(1)  John Validator    │
│                                    [Logout]          │
├─────────────────────────────────────────────────────┤
│  [Pending] [Fee Competitor] [Cross-Division]        │
└─────────────────────────────────────────────────────┘
```

### Notification Panel:
```
┌─────────────────────────────────────────┐
│  Notifications                      [×] │
├─────────────────────────────────────────┤
│  🎁  Point Redemption Request           │
│      John Contributor has redeemed      │
│      10 points                          │
│      [10 points] 2024-02-18 10:30       │
├─────────────────────────────────────────┤
│  🎁  Point Redemption Request           │
│      Jane Contributor has redeemed      │
│      5 points                           │
│      [5 points] 2024-02-18 09:15        │
└─────────────────────────────────────────┘
```

---

## Troubleshooting

### Points tidak bertambah setelah approve?

1. **Check DEMO_MODE:**
   - File: `client/src/services/api.js`
   - Harus: `const DEMO_MODE = true;`

2. **Check approval logic:**
   - Pastikan klik "Accept" (bukan Reject)
   - Refresh "My Points" tab

3. **Clear storage & retry:**
   - F12 → Application → Clear site data
   - Login ulang
   - Submit & approve data baru

### Notification tidak muncul?

1. **Check notification bell:**
   - Harus ada di header Validator Portal
   - Badge merah harus muncul jika ada unread

2. **Check notification fetch:**
   - F12 → Console
   - Lihat apakah ada error

3. **Restart frontend:**
   ```bash
   cd client
   npm start
   ```

### Badge count salah?

1. **Check unread logic:**
   - Notification dengan `is_read: false` dihitung
   - Setelah dibuka, badge harus update

2. **Refresh page:**
   - Ctrl + Shift + R

---

## Summary

✅ Point system: +5 per approval
✅ Point redemption: kelipatan 5
✅ Notification to validator: saat redeem
✅ Notification bell: dengan badge unread count
✅ Notification panel: detail redemption
✅ Auto-refresh: setiap 30 detik

**Next:** Test complete flow dari submit → approve → redeem → notification!

