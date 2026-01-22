# Troubleshooting White Screen Issue

If you're seeing a white screen at http://localhost:3000/, follow these steps:

## 1. Check Browser Console

Open your browser's developer tools (F12) and check the Console tab for any JavaScript errors.

Common errors:
- `Cannot read property of undefined`
- `Module not found`
- `TypeError`

## 2. Verify Backend is Running

Make sure the backend server is running on http://localhost:8000

```bash
cd backend
python main.py
```

## 3. Check Environment Variables

Verify your `.env` file exists in the frontend directory:

```bash
cd frontend
cat .env
```

Should contain:
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 4. Clear Browser Cache

1. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Or clear browser cache completely

## 5. Check if Dev Server is Running

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## 6. Reinstall Dependencies

If errors persist, try reinstalling:

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 7. Check Network Tab

In browser DevTools → Network tab, check if:
- API requests are failing
- CORS errors are present
- 401/403 errors

## 8. Expected Behavior

When you first visit http://localhost:3000/:
- If NOT logged in → Should redirect to `/login`
- If logged in → Should show the Home page

## 9. Manual Test

Try accessing directly:
- http://localhost:3000/login
- http://localhost:3000/register

If these work but `/` doesn't, it's a routing issue.

## 10. Check Terminal Output

Look at the terminal where `npm run dev` is running for any build errors or warnings.

## Still Not Working?

1. Check if all files are saved
2. Restart the dev server
3. Check for TypeScript errors: `npm run build`
4. Verify React version compatibility
