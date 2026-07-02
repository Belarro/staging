# Security Audit Report — Belarro Admin

**Date:** July 2, 2026  
**Status:** ⚠️ CRITICAL VULNERABILITIES FOUND

---

## Critical Issues (Fix Immediately)

### 1. Hardcoded Password in Login Route ⚠️⚠️⚠️
**File:** `frontend/src/app/api/auth/login/route.ts` (Line 36)  
**Issue:** Password hardcoded as plain text: `password === '0548020911'`  
**Risk:** Anyone with access to the code can log in. This password is now exposed in git history and production.

**Fix:**
- Remove hardcoded password comparison
- Only compare against `password_hash` from database
- Use bcrypt for comparison (or move to Supabase Auth)

**Current (INSECURE):**
```typescript
const isValid = password === '0548020911' || storedHash.includes(password);
```

**Should be:**
```typescript
const isValid = storedHash === hashPassword(password);
```

---

### 2. Authentication Disabled on All API Routes ⚠️⚠️⚠️
**Files:** All routes in `frontend/src/app/api/`  
**Issue:** Auth checks are commented out:
```typescript
// const auth = await requireAuth();
// if (!auth.ok) return auth.response;
```

**Risk:** **Anyone can access sensitive data without logging in:**
- Crops, customers, orders, invoices
- Production schedules, inventory
- Follow-up information, sales data
- File uploads

**Example Vulnerable Routes:**
- GET `/api/crops` — Lists all crops
- GET `/api/orders` — Lists all orders with prices
- GET `/api/customers` — Lists all customer data
- POST `/api/upload` — Upload files without auth
- GET `/api/invoices` — Generate invoices

**Fix:** Re-enable auth on ALL protected routes immediately:
```typescript
const auth = await requireAuth();
if (!auth.ok) return auth.response;
```

---

### 3. Weak Session Token Generation ⚠️⚠️
**File:** `frontend/src/app/api/auth/login/route.ts` (Line 46)  
**Issue:** Session token is not cryptographically secure:
```typescript
const sessionToken = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
```

**Risk:** Token is predictable and can be forged.

**Fix:** Use `crypto.randomBytes()` for secure tokens:
```typescript
import { randomBytes } from 'crypto';
const sessionToken = randomBytes(32).toString('hex');
```

---

## High-Risk Issues

### 4. Plain Password Storage (Potential)
**File:** `frontend/src/app/api/auth/login/route.ts` (Line 36)  
**Issue:** Code checks `storedHash.includes(password)` — suggests password might be stored in plaintext  
**Risk:** If database is breached, all passwords are exposed

**Fix:** Verify `admin_users.password_hash` is bcrypt hashed. If not, hash all passwords.

---

### 5. Session Cookie Not Marked Secure in Dev
**File:** `frontend/src/app/api/auth/login/route.ts` (Line 52)  
**Issue:**
```typescript
secure: process.env.NODE_ENV === 'production',
```
In development, cookies are not marked `Secure`, allowing interception.

**Fix:** Always use `secure: true` for session cookies (or use `Secure: false` only for localhost):
```typescript
secure: process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'preview',
```

---

### 6. No CSRF Protection
**Issue:** POST requests (`/api/crops`, `/api/orders`, etc.) have no CSRF tokens

**Fix:** Implement CSRF token validation or use SameSite cookies (already set to `strict`, which is good).

---

## Medium-Risk Issues

### 7. SQL Injection Risk (Low - Using Supabase REST)
**Files:** All API routes using `fetchFromSupabase()`  
**Current:** Uses URL encoding for query parameters
```typescript
`/admin_users?email=eq.${encodeURIComponent(email)}`
```

**Risk:** Low because Supabase handles parameterization, but ensure all user inputs are encoded.

**Status:** ✅ Currently safe (encodeURIComponent is used)

---

### 8. No Input Validation on File Uploads
**File:** `frontend/src/app/api/upload/route.ts`  
**Issue:** No file type/size restrictions

**Fix:** Add validation:
```typescript
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large' }, { status: 413 });
if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
```

---

### 9. No Rate Limiting
**Issue:** Login endpoint has no rate limiting — vulnerable to brute force

**Fix:** Implement rate limiting on `/api/auth/login` (e.g., 5 attempts per 15 minutes)

---

### 10. Missing Environment Variable Validation
**Files:** Many routes  
**Issue:** If env vars are missing, code throws errors but doesn't validate at startup

**Current:**
```typescript
if (!SUPABASE_URL) {
  throw new Error('Missing required environment variables');
}
```

**Better:** Add validation at app startup in middleware or a config file

---

## Low-Risk Issues (Best Practice)

### 11. No XSS Protection Headers
**Issue:** Missing security headers in middleware
```typescript
// Add to middleware:
headers.set('X-Content-Type-Options', 'nosniff');
headers.set('X-Frame-Options', 'DENY');
headers.set('X-XSS-Protection', '1; mode=block');
```

---

### 12. CORS Configuration
**File:** `frontend/src/app/api/send-followup-email/route.ts`  
**Status:** ✅ Good — Whitelist is set (not wildcard)

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 3 | Fix immediately |
| 🟠 High | 3 | Fix before production |
| 🟡 Medium | 2 | Address in next release |
| 🟢 Low | 2 | Best practice |

---

## Recommended Actions

### Immediate (Before Next Deploy)
1. ✅ Re-enable `requireAuth()` on all protected API routes
2. ✅ Remove hardcoded password `0548020911`
3. ✅ Implement secure session token generation (crypto.randomBytes)

### Short-term (This Week)
4. Verify password hashing in `admin_users` table
5. Add file upload validation
6. Implement rate limiting on login endpoint
7. Change `admin_users` password to a secure one

### Medium-term (Next Sprint)
8. Add CSRF protection
9. Implement request logging/audit trail
10. Add security headers to all responses
11. Set up secrets rotation policy

---

## Next Steps

1. Review and acknowledge this report
2. Fix critical issues (1-3) immediately
3. Create tickets for remaining issues
4. Re-test after each fix
5. Consider security audit by external firm before public launch
