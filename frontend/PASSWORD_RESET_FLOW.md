# Password Reset Flow Documentation

## Overview

The password reset functionality allows users to securely reset their password via email verification. The flow consists of two main pages and backend API endpoints.

## Architecture

### Frontend Pages

1. **Forgot Password Page** (`/forgot-password`)
2. **Reset Password Page** (`/reset-password?token=xxx`)

### Backend Endpoints

1. `POST /api/v1/auth/forgot-password` - Request password reset
2. `POST /api/v1/auth/reset-password` - Reset password with token

---

## User Flow

### Step 1: Request Password Reset

**Page:** `/forgot-password`

1. User navigates to forgot password page
2. User enters their email address
3. System sends reset token to email (if account exists)
4. User receives success message (regardless of account existence for security)

**Security Note:** The system doesn't reveal whether an account exists to prevent email enumeration attacks.

### Step 2: Receive Email

The user receives an email with:
- Reset token (64 character hex string)
- Link to reset password page: `http://localhost:3000/reset-password?token=xxx`
- Token expiration time (1 hour)

### Step 3: Reset Password

**Page:** `/reset-password?token=xxx`

1. User clicks link in email
2. Page extracts token from URL query parameter
3. User enters new password (min 6 characters)
4. User confirms new password
5. System validates token and updates password
6. All existing sessions are invalidated (logout from all devices)
7. User is redirected to login page

---

## Technical Implementation

### Forgot Password Page

**Location:** `src/app/forgot-password/page.tsx`

**Features:**
- ✅ Email input with validation
- ✅ Loading state during submission
- ✅ Error handling with user-friendly messages
- ✅ Success state with helpful instructions
- ✅ Link back to login page
- ✅ Responsive design with dark mode support

**API Call:**
```typescript
await apiClient.post("/auth/forgot-password", { email });
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent.",
  "data": {
    "message": "If an account with that email exists, a password reset link has been sent."
  }
}
```

### Reset Password Page

**Location:** `src/app/reset-password/page.tsx`

**Features:**
- ✅ Token extraction from URL query parameter
- ✅ Password and confirm password fields
- ✅ Client-side validation (min 6 chars, passwords match)
- ✅ Loading state during submission
- ✅ Error handling for invalid/expired tokens
- ✅ Success state with auto-redirect to login
- ✅ Helpful error messages for missing tokens
- ✅ Responsive design with dark mode support
- ✅ Uses Suspense for proper Next.js 13+ handling

**API Call:**
```typescript
await apiClient.post("/auth/reset-password", {
  token,
  password
});
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully. Please login with your new password.",
  "data": {
    "message": "Password has been reset successfully. Please login with your new password."
  }
}
```

### Auth Context Integration

**Location:** `src/contexts/AuthContext.tsx`

Added two new methods:

```typescript
// Request password reset
forgotPassword: (email: string) => Promise<{ message: string }>;

// Reset password with token
resetPassword: (token: string, password: string) => Promise<{ message: string }>;
```

**Usage:**
```typescript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { forgotPassword, resetPassword } = useAuth();

  // Request reset
  await forgotPassword("user@example.com");

  // Reset password
  await resetPassword("token-from-email", "newPassword123");
}
```

---

## Backend Implementation

### Token Generation

**Method:** `authService.forgotPassword(email)`

1. Finds user by email
2. Generates 32-byte random token (64 hex characters)
3. Hashes token with SHA-256 before storing
4. Sets expiration to 1 hour from now
5. Stores hashed token in database
6. Sends email with unhashed token

**Security:**
- Token is hashed before storage (prevents database compromise)
- Token expires after 1 hour
- Only unhashed token is sent via email
- System doesn't reveal if account exists

### Password Reset

**Method:** `authService.resetPassword(token, newPassword)`

1. Hashes provided token
2. Finds user with matching hashed token
3. Checks token hasn't expired
4. Verifies account is active
5. Hashes new password with bcrypt
6. Updates password and clears reset token
7. Invalidates all refresh tokens (logout all devices)
8. Sends confirmation email

**Security:**
- All existing sessions are terminated
- Password is hashed with bcrypt (10 rounds)
- Reset token is single-use (cleared after use)
- Confirmation email sent to user

---

## Email Templates

### Password Reset Email

**Sent by:** `notificationService.sendPasswordReset(email, firstName, token)`

**Contains:**
- Personalized greeting
- Reset link with token
- Token expiration time
- Security notice
- Support contact

### Password Changed Confirmation

**Sent by:** `notificationService.sendPasswordChangedConfirmation(email, firstName)`

**Contains:**
- Confirmation of password change
- Security notice (if not you, contact support)
- Support contact

---

## Security Features

### Token Security
- ✅ Cryptographically secure random tokens (32 bytes)
- ✅ Tokens hashed before storage (SHA-256)
- ✅ Single-use tokens (cleared after use)
- ✅ Time-limited tokens (1 hour expiration)

### Account Security
- ✅ All sessions invalidated on password reset
- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ Account status checked before reset
- ✅ Confirmation email sent after reset

### Privacy & Anti-Enumeration
- ✅ Same response whether account exists or not
- ✅ No indication if email is registered
- ✅ Prevents email enumeration attacks

---

## Error Handling

### Forgot Password Errors

| Error | Cause | User Message |
|-------|-------|--------------|
| Invalid email | Email format invalid | "Invalid email address" |
| Network error | API unreachable | "An error occurred" |

**Note:** Backend always returns success to prevent enumeration

### Reset Password Errors

| Error | Cause | User Message |
|-------|-------|--------------|
| Missing token | No token in URL | "Invalid or missing reset token" |
| Invalid token | Token not found in DB | "Invalid or expired reset token" |
| Expired token | Token older than 1 hour | "Invalid or expired reset token" |
| Password too short | Less than 6 characters | "Password must be at least 6 characters long" |
| Passwords don't match | Confirmation mismatch | "Passwords do not match" |
| Inactive account | Account not active | "Account is not active" |

---

## UI/UX Features

### Forgot Password Page

**Visual Design:**
- 🎨 Gradient background matching auth theme
- 🎴 Card-based layout with shadow
- 🌓 Full dark mode support
- 📱 Fully responsive

**User Experience:**
- ⚡ Loading spinner during submission
- ✅ Success state with helpful instructions
- ❌ Clear error messages
- 🔗 Easy navigation back to login
- 💡 Helpful tips for email not received

### Reset Password Page

**Visual Design:**
- 🎨 Consistent with other auth pages
- 🎴 Card-based layout
- 🌓 Dark mode support
- 📱 Mobile-friendly

**User Experience:**
- ⚡ Loading state with spinner
- ✅ Success message with auto-redirect
- ❌ Clear error handling
- 🔒 Password strength hint
- 💡 Helpful message for invalid tokens
- ⏱️ Auto-redirect after success (3 seconds)

---

## Testing Checklist

### Forgot Password
- [ ] Valid email sends reset link
- [ ] Invalid email shows same success message
- [ ] Non-existent email shows same success message
- [ ] Loading state displays correctly
- [ ] Success state shows helpful instructions
- [ ] Link to login works
- [ ] Responsive on mobile
- [ ] Dark mode works

### Reset Password
- [ ] Valid token allows password reset
- [ ] Invalid token shows error
- [ ] Expired token shows error
- [ ] Missing token shows error
- [ ] Password validation works (min 6 chars)
- [ ] Password confirmation validation works
- [ ] Success redirects to login
- [ ] All sessions invalidated after reset
- [ ] Confirmation email sent
- [ ] Responsive on mobile
- [ ] Dark mode works

---

## Configuration

### Environment Variables

**Frontend:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

**Backend:**
```env
# Email service (required for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

### Token Configuration

**Location:** `backend/src/modules/auth/auth.service.ts`

```typescript
// Token size (32 bytes = 64 hex characters)
const resetToken = crypto.randomBytes(32).toString('hex');

// Token expiration (1 hour)
const resetExpires = new Date(Date.now() + 60 * 60 * 1000);
```

To change token expiration, modify the milliseconds value:
- 30 minutes: `30 * 60 * 1000`
- 1 hour: `60 * 60 * 1000`
- 2 hours: `2 * 60 * 60 * 1000`

---

## API Reference

### POST /auth/forgot-password

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent.",
  "data": {
    "message": "If an account with that email exists, a password reset link has been sent."
  }
}
```

### POST /auth/reset-password

**Request:**
```json
{
  "token": "a1b2c3d4e5f6...",
  "password": "newPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password has been reset successfully. Please login with your new password.",
  "data": {
    "message": "Password has been reset successfully. Please login with your new password."
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

---

## Future Enhancements

Potential improvements:

1. **Rate Limiting** - Limit password reset requests per IP/email
2. **2FA Integration** - Require 2FA before password reset
3. **Password History** - Prevent reusing recent passwords
4. **Password Strength Meter** - Visual indicator of password strength
5. **Magic Link Login** - Alternative to password reset
6. **SMS Verification** - Additional verification method
7. **Security Questions** - Additional identity verification
8. **Audit Log** - Track all password reset attempts

---

## Troubleshooting

### Email Not Received

**Possible causes:**
1. Email in spam/junk folder
2. SMTP configuration incorrect
3. Email service blocking
4. Invalid email address

**Solutions:**
1. Check spam folder
2. Verify SMTP credentials in `.env`
3. Use app-specific password for Gmail
4. Check email service logs

### Token Invalid/Expired

**Possible causes:**
1. Token older than 1 hour
2. Token already used
3. Token malformed in URL

**Solutions:**
1. Request new reset link
2. Ensure token is complete in URL
3. Check token hasn't been modified

### Password Reset Not Working

**Possible causes:**
1. Account not active
2. Database connection issue
3. Token not found in database

**Solutions:**
1. Verify account status
2. Check database connection
3. Request new reset link

---

## Support

For issues or questions:
- Check backend logs for errors
- Verify email service configuration
- Test with a known valid email
- Check database for stored tokens
- Review API response in browser DevTools
