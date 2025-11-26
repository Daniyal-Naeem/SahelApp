# Network Error Troubleshooting Guide

## Issue: Network Error While Updating Category

### Common Causes and Solutions

#### 1. Backend Server Not Running
**Symptom**: Network error, connection refused
**Solution**:
```bash
cd backend
npm start
```
Verify backend is running on port 4000 by checking: `http://localhost:4000/api/categories`

#### 2. CORS Issues
**Symptom**: CORS error in browser console
**Solution**: 
- Backend already has CORS enabled
- Check if backend `index.js` has `app.use(cors())`
- Verify admin panel URL is allowed

#### 3. Authentication Token Missing
**Symptom**: 401 Unauthorized
**Solution**:
- Check browser console for token
- Verify you're logged in: `localStorage.getItem('admin_token')`
- Try logging out and logging back in

#### 4. API URL Configuration
**Symptom**: Request going to wrong URL
**Solution**:
- Check `.env` file in `admin-panel` directory
- Should have: `VITE_API_URL=http://localhost:4000/api`
- Restart dev server after changing `.env`

#### 5. Backend Route Not Found
**Symptom**: 404 Not Found
**Solution**:
- Verify route exists: `PUT /api/categories/:id`
- Check backend routes are properly registered

### Debugging Steps

1. **Open Browser Console (F12)**
   - Check Network tab
   - Look for failed request
   - Check request URL, method, headers

2. **Check Request Details**
   - URL should be: `http://localhost:4000/api/categories/:id`
   - Method should be: `PUT`
   - Headers should include: `Authorization: Bearer <token>`

3. **Verify Backend**
   ```bash
   # Check if backend is running
   curl http://localhost:4000/api/categories
   
   # Check backend logs
   # Look for incoming requests
   ```

4. **Test Authentication**
   ```javascript
   // In browser console
   console.log('Token:', localStorage.getItem('admin_token'))
   console.log('User:', localStorage.getItem('admin_user'))
   ```

### Quick Fixes

1. **Restart Backend**:
   ```bash
   cd backend
   npm start
   ```

2. **Restart Admin Panel**:
   ```bash
   cd admin-panel
   npm run dev
   ```

3. **Clear Browser Cache**:
   - Clear localStorage
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

4. **Check .env Files**:
   - Backend: `backend/.env` should have `PORT=4000`
   - Admin Panel: `admin-panel/.env` should have `VITE_API_URL=http://localhost:4000/api`

### Error Messages Explained

- **"Network error: Unable to connect to server"**: Backend not running or wrong URL
- **"401 Unauthorized"**: Missing or invalid token
- **"404 Not Found"**: Route doesn't exist
- **"500 Internal Server Error"**: Backend error (check backend logs)
- **"CORS error"**: CORS not configured properly

### Testing API Directly

Test the update endpoint directly:
```bash
# Get a category ID first
curl http://localhost:4000/api/categories

# Update category (replace TOKEN and ID)
curl -X PUT http://localhost:4000/api/categories/CATEGORY_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Updated Category","description":"Test"}'
```

