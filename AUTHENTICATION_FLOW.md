# Authentication Flow Implementation

## Overview
The application now has a complete authentication system that matches the admin UI pattern:
1. **Login page displays first** when the app starts (if not authenticated)
2. **Redirects to dashboard** after successful login
3. **Shows login page again** after logout or closing the app

---

## How It Works

### 1. **Initial App Load**
- User runs `npm run dev`
- Middleware checks for `miisky_auth` cookie
- **If cookie missing** → User redirected to `/login`
- **If cookie exists** → User allowed to access the app

### 2. **Login Process**
- User enters username and password
- `authApi.login()` sends credentials to backend
- Backend returns access token and refresh token
- Tokens are stored:
  - **`miisky_auth` cookie** (used by middleware for auth checks)
  - **`localStorage`** (used by frontend for API requests)
- Page redirects to `/` (homepage/dashboard)

### 3. **Dashboard/Website Access**
- `page.tsx` verifies auth cookie exists
- Displays the full website with Layout and Header
- **Logout button** is visible in the header (top-right area)
- User can browse the website

### 4. **Logout Process**
- User clicks the **"Logout"** button in the header
- `useAuth()` hook calls `authApi.logout()`
- All tokens are cleared from:
  - `localStorage`
  - Cookies
- User is redirected to `/login`

### 5. **Closing & Reopening App**
- When user closes the app and reopens it (refreshes page):
- Middleware checks for `miisky_auth` cookie
- Cookie was cleared during logout → **Login page shows**
- User needs to login again

---

## Files Modified/Created

### 1. **New: `src/context/AuthContext.tsx`**
- Provides `useAuth()` hook
- Manages logout functionality
- Makes `logout()` available throughout the app

### 2. **New: `src/ClientWrapper.tsx`**
- Wraps app with AuthProvider
- Enables AuthContext in all client components

### 3. **Updated: `src/app/layout.tsx`**
- Imports and uses ClientWrapper
- Provides AuthContext to entire app

### 4. **Updated: `components/layout/header/Header1.tsx`**
- Imports `useAuth()` hook
- Adds **Logout button** in header menu
- Button appears next to Appointment button
- Click logout → clears auth and redirects to login

### 5. **Already Existing: `middleware.ts`**
- Handles auth checks on every request
- No changes needed – already configured correctly

---

## Authentication Flow Diagram

```
┌─────────────────┐
│   Visit App     │
└────────┬────────┘
         │
         v
┌─────────────────────────────────────┐
│ Middleware checks miisky_auth cookie│
└────┬───────────────────────────┬────┘
     │                           │
  NO COOKIE               COOKIE EXISTS
     │                           │
     v                           v
┌──────────┐            ┌────────────────┐
│  /login  │            │  Homepage/App  │
│  Shows   │            │   Works Fine   │
│  Login   │            │                │
│  Form    │            │ [Logout Button]│
└────┬─────┘            └────────┬───────┘
     │                           │
     │ (User logs in)            │ (User clicks Logout)
     │                           │
     v                           v
  ┌────────────────────┐    ┌─────────────┐
  │ Auth cookie set    │    │Clear tokens │
  │ Redirect to home   │    │Redirect to  │
  │                    │    │/login       │
  └───────────────────┘    └─────────────┘
```

---

## Testing the Flow

### ✅ Test 1: Initial Login
1. Run `npm run dev`
2. Should see login page (not the website)
3. Login with valid credentials
4. Should redirect to homepage

### ✅ Test 2: Logout
1. Click **"Logout"** button in header
2. Should redirect to login page
3. Cookie should be cleared

### ✅ Test 3: Session Persistence
1. Login successfully
2. Refresh the page (F5)
3. Should stay logged in (cookie still valid)

### ✅ Test 4: Protected Routes
1. Logout
2. Try to directly visit `/` in browser
3. Should redirect to `/login`

---

## Key Features

✅ **Automatic auth checks** via middleware  
✅ **Persistent login** (survives page refresh)  
✅ **Clear session** on logout  
✅ **Protected pages** - non-authenticated users can't access app  
✅ **Redirect after login** - goes back to requested page or home  
✅ **User-friendly** - logout button in header  

---

## Admin UI Reference

This implementation follows the same pattern as the admin UI in `frontend/src`:
- Login page is entry point
- Dashboard shows after login
- Logout available in header
- Session clears on logout
