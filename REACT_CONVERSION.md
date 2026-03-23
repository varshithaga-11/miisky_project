# Next.js to React Conversion Guide

## ✅ Completed

1. **Created Vite Configuration** 
   - `vite.config.ts` - Vite setup with React and TypeScript support

2. **Updated Entry Point**
   - `src/main.tsx` - React app entry point with ReactDOM
   - `index.html` - HTML entry file for Vite

3. **Updated App Structure**
   - `src/App.tsx` - Root component with React Router setup
   - Removed `src/ClientWrapper.tsx` (integrated into App.tsx)

4. **Updated Authentication**
   - `src/context/AuthContext.tsx` - Migrated from Next.js useRouter to React Router useNavigate
   - `src/components/ProtectedRoute.tsx` - New protected route wrapper

5. **Updated Package.json**
   - Removed Next.js dependencies
   - Added React Router, Vite, and build tools

6. **Updated Page Components**
   - `src/app/page.tsx` - Home page (removed async, auth redirect moved to ProtectedRoute)
   - `src/app/login/page.tsx` - Login page (updated to use React Router)
   - `src/app/register/page.tsx` - Register page (import path fixed)

7. **Created Image Component Wrapper**
   - `src/components/Image.tsx` - Replaces Next.js Image with standard img tag

## ⚠️ Still Needs Conversion

### All Image Imports
Need to replace `from "next/image"` with custom component in these files:
- All page files in `src/app/`
- All component files in `components/`
- All section files in `components/sections/`

### Step-by-Step Manual Conversion

For each file with `import Image from "next/image"`:

```typescript
// OLD (Next.js)
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// NEW (React)
import Image from "@/components/Image";
import { Link } from "react-router-dom"; 
import { useNavigate } from "react-router-dom";
```

### Common Patterns to Replace

1. **Link Component**
   - OLD: `<Link href="/path">` 
   - NEW: `<Link to="/path">`

2. **Router Navigation**
   - OLD: `const router = useRouter(); router.push("/page")`
   - NEW: `const navigate = useNavigate(); navigate("/page")`

3. **Remove "use client" directives**
   - These are Next.js specific and not needed in React

## ⚡ Quick Setup & Run

```bash
cd frontend/src/client-ui

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 📝 Notes

- No middleware needed in React (routing is client-side)
- Remove any server components ("use client" directives)
- All routing is handled by React Router
- CSS imports remain the same
- API calls remain the same (axios/fetch)
- Authentication context now uses React Router hooks

## 🔄 Remaining Work

1. Replace all `next/image` imports with custom Image component (30+ files)
2. Replace all `next/link` imports with `react-router-dom` Link
3. Replace all `next/navigation` imports with `react-router-dom` hooks
4. Test all routes and authentication flow
5. Verify all components render correctly
