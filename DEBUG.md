# Debugging White Screen

## Quick Fix Steps

1. **Stop the dev server** (Ctrl+C)

2. **Clear browser cache and localStorage:**
   - Open browser console (F12)
   - Run: `localStorage.clear()`
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

3. **Restart dev server:**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Check browser console:**
   - Open DevTools (F12)
   - Look for any red errors
   - Check if you see "App component rendering..." in console

5. **Try direct URLs:**
   - http://localhost:3000/login
   - http://localhost:3000/register

## Expected Behavior

- **First visit (not logged in):** Should redirect to `/login`
- **After login:** Should show Home page
- **If white screen persists:** Check console for errors

## Common Issues

### Issue: Infinite redirect loop
**Solution:** Clear localStorage and try again

### Issue: "Cannot read property of undefined"
**Solution:** Check if backend is running on port 8000

### Issue: CORS errors
**Solution:** Verify backend CORS settings in `.env`

### Issue: Module not found
**Solution:** Run `npm install` again

## Test if React is Working

Add this temporarily to `main.tsx`:

```tsx
console.log('Main.tsx loaded');
console.log('Root element:', document.getElementById('root'));
```

If you see these logs, React is loading but something else is wrong.

## Check Network Tab

1. Open DevTools → Network tab
2. Refresh page
3. Look for failed requests (red)
4. Check if API calls are being made

## Verify Backend

```bash
curl http://localhost:8000/
```

Should return JSON response.
