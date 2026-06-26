# ABSU Faculty Management — Frontend Integration Guide

**Stack:** React + Vite (plain JavaScript) + Fetch API  
**Backend base URL (dev):** `http://localhost:5000/api`  
**Swagger UI:** `http://localhost:5000/api/docs`

---

## 1. Environment Setup

In your frontend project root, create `.env`:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

Access it anywhere in your app:

```js
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

---

## 2. API Client (`src/lib/api.js`)

Create a single wrapper around `fetch` that handles:
- Attaching the `Authorization` header automatically
- Silently refreshing the access token on 401
- Uniform error parsing

```js
// src/lib/api.js

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

export function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

export function saveTokens(accessToken, refreshToken) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

// ─── Silent token refresh ─────────────────────────────────────────────────────

let refreshPromise = null; // prevents multiple simultaneous refresh calls

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: getRefreshToken() }),
  })
    .then(async (res) => {
      const body = await res.json();
      if (!res.ok) throw new Error(body.message);
      saveTokens(body.data.accessToken, body.data.refreshToken);
      return body.data.accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

// ─── Core request function ────────────────────────────────────────────────────

/**
 * @param {string} path  - e.g. '/lecturers' or '/lecturers/123'
 * @param {RequestInit & { isFormData?: boolean }} options
 */
export async function request(path, options = {}) {
  const { isFormData, ...fetchOptions } = options;

  const headers = { ...fetchOptions.headers };

  // Attach auth header (skip for auth endpoints)
  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set Content-Type only for JSON bodies (not FormData)
  if (!isFormData && fetchOptions.body && typeof fetchOptions.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  let response = await fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers });

  // ── Silent refresh on 401 ──────────────────────────────────────────────────
  if (response.status === 401 && path !== '/auth/login' && path !== '/auth/refresh-token') {
    try {
      const newAccessToken = await refreshAccessToken();
      headers['Authorization'] = `Bearer ${newAccessToken}`;
      response = await fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers });
    } catch {
      clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.errors = data.errors || [];
    throw error;
  }

  return data;
}

// ─── Convenience methods ──────────────────────────────────────────────────────

export const api = {
  get: (path) =>
    request(path, { method: 'GET' }),

  post: (path, body) =>
    request(path, { method: 'POST', body: JSON.stringify(body) }),

  put: (path, body) =>
    request(path, { method: 'PUT', body: JSON.stringify(body) }),

  delete: (path) =>
    request(path, { method: 'DELETE' }),

  /** For endpoints that require multipart/form-data (file uploads) */
  upload: (path, formData, method = 'POST') =>
    request(path, { method, body: formData, isFormData: true }),
};
```

---

## 3. Auth State (`src/store/auth.js`)

A minimal plain-JS store with React context. No external library needed.

```js
// src/store/auth.js

import { createContext, useContext, useState, useCallback } from 'react';
import { saveTokens, clearTokens } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((userData, tokens) => {
    localStorage.setItem('user', JSON.stringify(userData));
    saveTokens(tokens.accessToken, tokens.refreshToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

Wrap your app in `main.jsx`:

```jsx
// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './store/auth';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
```

---

## 4. Protected Routes

```jsx
// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/auth';

export function ProtectedRoute({ roles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/403" replace />;

  return <Outlet />;
}
```

Usage in your router:

```jsx
<Routes>
  {/* Public */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  <Route path="/reset-password" element={<ResetPasswordPage />} />

  {/* All authenticated users */}
  <Route element={<ProtectedRoute />}>
    <Route path="/departments" element={<DepartmentsPage />} />
    <Route path="/lecturers" element={<LecturersPage />} />
    <Route path="/publications" element={<PublicationsPage />} />
    <Route path="/lecture-notes" element={<LectureNotesPage />} />
    <Route path="/news" element={<NewsPage />} />
    <Route path="/events" element={<EventsPage />} />
    <Route path="/profile" element={<ProfilePage />} />
  </Route>

  {/* Admins only */}
  <Route element={<ProtectedRoute roles={['super_admin', 'department_admin']} />}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/users" element={<UsersPage />} />
  </Route>

  {/* Super admin only */}
  <Route element={<ProtectedRoute roles={['super_admin']} />}>
    <Route path="/departments/new" element={<CreateDepartmentPage />} />
  </Route>
</Routes>
```

---

## 5. Authentication Endpoints

### Login

```js
// src/services/auth.service.js
import { api } from '../lib/api';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  // res.data = { user: {...}, tokens: { accessToken, refreshToken } }
  return res.data;
}
```

In your `LoginPage.jsx`:

```jsx
import { login } from '../services/auth.service';
import { useAuth } from '../store/auth';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const { email, password } = Object.fromEntries(new FormData(e.target));
    try {
      const { user, tokens } = await login(email, password);
      setAuth(user, tokens);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message); // show error in UI
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Logout

```js
export async function logout(refreshToken) {
  await api.post('/auth/logout', { refreshToken });
}
```

```jsx
import { getRefreshToken } from '../lib/api';
import { logout as logoutApi } from '../services/auth.service';
import { useAuth } from '../store/auth';

function LogoutButton() {
  const { logout } = useAuth();

  async function handleLogout() {
    try {
      await logoutApi(getRefreshToken());
    } finally {
      logout(); // always clear local state even if request fails
      navigate('/login');
    }
  }

  return <button onClick={handleLogout}>Logout</button>;
}
```

### Change Password

```js
export async function changePassword(currentPassword, newPassword) {
  return api.post('/auth/change-password', { currentPassword, newPassword });
}
```

### Forgot / Reset Password

```js
export async function forgotPassword(email) {
  return api.post('/auth/forgot-password', { email });
}

export async function resetPassword(token, newPassword) {
  return api.post('/auth/reset-password', { token, newPassword });
}
```

The `token` for reset comes from the URL: `?token=eyJ...`

```js
const params = new URLSearchParams(window.location.search);
const token = params.get('token');
```

---

## 6. Dashboard

```js
// src/services/dashboard.service.js
import { api } from '../lib/api';

export async function getDashboardStats() {
  const res = await api.get('/dashboard/stats');
  return res.data;
  // super_admin:      { departments, departmentAdmins, students, lecturers, publications, lectureNotes, news, events }
  // department_admin: { students, lecturers, publications, lectureNotes, news, events }
}
```

---

## 7. Departments

```js
// src/services/department.service.js
import { api } from '../lib/api';

export async function getDepartments({ page = 1, limit = 20, search = '' } = {}) {
  const q = new URLSearchParams({ page, limit, ...(search && { search }) });
  const res = await api.get(`/departments?${q}`);
  return res; // { data: [...], pagination: {...} }
}

export async function getDepartmentById(id) {
  const res = await api.get(`/departments/${id}`);
  return res.data;
}

export async function createDepartment(body) {
  // { name, code, description }
  const res = await api.post('/departments', body);
  return res.data;
}

export async function updateDepartment(id, body) {
  const res = await api.put(`/departments/${id}`, body);
  return res.data;
}

export async function deleteDepartment(id) {
  return api.delete(`/departments/${id}`);
}
```

---

## 8. Users

```js
// src/services/user.service.js
import { api } from '../lib/api';

export async function getUsers({ page = 1, limit = 20, search, departmentId, level } = {}) {
  const q = new URLSearchParams({ page, limit });
  if (search) q.set('search', search);
  if (departmentId) q.set('departmentId', departmentId);
  if (level) q.set('level', level);
  const res = await api.get(`/users?${q}`);
  return res;
}

export async function getProfile() {
  const res = await api.get('/users/profile');
  return res.data;
}

export async function createUser(body) {
  // { fullName, email, password, role, departmentId?, matricNumber?, level? }
  const res = await api.post('/users', body);
  return res.data;
}

export async function updateUser(id, body) {
  const res = await api.put(`/users/${id}`, body);
  return res.data;
}

export async function deleteUser(id) {
  return api.delete(`/users/${id}`);
}

export async function uploadProfileImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await api.upload('/users/profile/image', formData);
  return res.data;
}
```

---

## 9. Lecturers

```js
// src/services/lecturer.service.js
import { api } from '../lib/api';

export async function getLecturers({ page = 1, limit = 20, search, departmentId } = {}) {
  const q = new URLSearchParams({ page, limit });
  if (search) q.set('search', search);
  if (departmentId) q.set('departmentId', departmentId);
  return api.get(`/lecturers?${q}`);
}

export async function getLecturerById(id) {
  const res = await api.get(`/lecturers/${id}`);
  return res.data;
}

export async function createLecturer(body) {
  // { firstName, lastName, email, designation, bio?, departmentId }
  const res = await api.post('/lecturers', body);
  return res.data;
}

export async function updateLecturer(id, body) {
  const res = await api.put(`/lecturers/${id}`, body);
  return res.data;
}

export async function deleteLecturer(id) {
  return api.delete(`/lecturers/${id}`);
}

export async function uploadLecturerProfileImage(id, file) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await api.upload(`/lecturers/${id}/profile-image`, formData);
  return res.data;
}
```

---

## 10. Publications

```js
// src/services/publication.service.js
import { api } from '../lib/api';

export async function getPublications({ page = 1, limit = 20, search, departmentId, publicationYear } = {}) {
  const q = new URLSearchParams({ page, limit });
  if (search) q.set('search', search);
  if (departmentId) q.set('departmentId', departmentId);
  if (publicationYear) q.set('publicationYear', publicationYear);
  return api.get(`/publications?${q}`);
}

export async function getPublicationById(id) {
  const res = await api.get(`/publications/${id}`);
  return res.data;
}

export async function createPublication(body) {
  /*
    {
      title, journal, publicationYear, publicationUrl,
      authors: ['Name 1', 'Name 2'],
      lecturerId, departmentId
    }
  */
  const res = await api.post('/publications', body);
  return res.data;
}

export async function updatePublication(id, body) {
  const res = await api.put(`/publications/${id}`, body);
  return res.data;
}

export async function deletePublication(id) {
  return api.delete(`/publications/${id}`);
}
```

---

## 11. Lecture Notes

> File upload required on create. Optional on update.  
> Accepted types: PDF, Word (.doc/.docx), PowerPoint (.ppt/.pptx). Max 50 MB.

```js
// src/services/lectureNote.service.js
import { api } from '../lib/api';

export async function getLectureNotes({ page = 1, limit = 20, search, departmentId, level, semester } = {}) {
  const q = new URLSearchParams({ page, limit });
  if (search) q.set('search', search);
  if (departmentId) q.set('departmentId', departmentId);
  if (level) q.set('level', level);
  if (semester) q.set('semester', semester);
  return api.get(`/lecture-notes?${q}`);
}

export async function getLectureNoteById(id) {
  const res = await api.get(`/lecture-notes/${id}`);
  return res.data;
}

export async function createLectureNote({ title, courseCode, level, semester, lecturerId, departmentId, file }) {
  const formData = new FormData();
  formData.append('file', file);          // the actual document
  formData.append('title', title);
  formData.append('courseCode', courseCode);
  formData.append('level', level);        // '100' | '200' | '300' | '400' | '500'
  formData.append('semester', semester);  // 'first' | 'second'
  formData.append('lecturerId', lecturerId);
  formData.append('departmentId', departmentId);
  const res = await api.upload('/lecture-notes', formData);
  return res.data;
}

export async function updateLectureNote(id, { file, ...fields }) {
  const formData = new FormData();
  if (file) formData.append('file', file);
  Object.entries(fields).forEach(([k, v]) => v !== undefined && formData.append(k, v));
  const res = await api.upload(`/lecture-notes/${id}`, formData, 'PUT');
  return res.data;
}

export async function deleteLectureNote(id) {
  return api.delete(`/lecture-notes/${id}`);
}
```

---

## 12. News

> Featured image required on create. Optional on update.  
> Accepted image types: JPEG, PNG, WebP. Max 5 MB.

```js
// src/services/news.service.js
import { api } from '../lib/api';

export async function getNews({ page = 1, limit = 20, search, departmentId, isPublished, category } = {}) {
  const q = new URLSearchParams({ page, limit });
  if (search) q.set('search', search);
  if (departmentId) q.set('departmentId', departmentId);
  if (isPublished !== undefined) q.set('isPublished', isPublished);
  if (category) q.set('category', category);
  return api.get(`/news?${q}`);
}

export async function getNewsById(id) {
  const res = await api.get(`/news/${id}`);
  return res.data;
}

export async function getNewsBySlug(slug) {
  const res = await api.get(`/news/slug/${slug}`);
  return res.data;
}

export async function createNews({ title, content, category, isPublished = false, departmentId, image }) {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('title', title);
  formData.append('content', content);
  formData.append('category', category);
  formData.append('isPublished', String(isPublished)); // ← must be string in FormData
  formData.append('departmentId', departmentId);
  const res = await api.upload('/news', formData);
  return res.data;
}

export async function updateNews(id, { image, ...fields }) {
  // If no image is being changed, send as JSON (simpler)
  if (!image) {
    const res = await api.put(`/news/${id}`, fields);
    return res.data;
  }
  // If replacing the image, use FormData
  const formData = new FormData();
  formData.append('image', image);
  Object.entries(fields).forEach(([k, v]) => v !== undefined && formData.append(k, String(v)));
  const res = await api.upload(`/news/${id}`, formData, 'PUT');
  return res.data;
}

export async function deleteNews(id) {
  return api.delete(`/news/${id}`);
}
```

---

## 13. Events

> Same image rules as News. `eventDate` must be an ISO 8601 string.

```js
// src/services/event.service.js
import { api } from '../lib/api';

export async function getEvents({ page = 1, limit = 20, search, departmentId, isPublished } = {}) {
  const q = new URLSearchParams({ page, limit });
  if (search) q.set('search', search);
  if (departmentId) q.set('departmentId', departmentId);
  if (isPublished !== undefined) q.set('isPublished', isPublished);
  return api.get(`/events?${q}`);
}

export async function getEventById(id) {
  const res = await api.get(`/events/${id}`);
  return res.data;
}

export async function createEvent({ title, description, venue, eventDate, isPublished = false, departmentId, image }) {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('title', title);
  formData.append('description', description);
  formData.append('venue', venue);
  formData.append('eventDate', new Date(eventDate).toISOString()); // ensure ISO format
  formData.append('isPublished', String(isPublished));
  formData.append('departmentId', departmentId);
  const res = await api.upload('/events', formData);
  return res.data;
}

export async function updateEvent(id, { image, ...fields }) {
  if (!image) {
    if (fields.eventDate) fields.eventDate = new Date(fields.eventDate).toISOString();
    const res = await api.put(`/events/${id}`, fields);
    return res.data;
  }
  const formData = new FormData();
  formData.append('image', image);
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined) formData.append(k, k === 'eventDate' ? new Date(v).toISOString() : String(v));
  });
  const res = await api.upload(`/events/${id}`, formData, 'PUT');
  return res.data;
}

export async function deleteEvent(id) {
  return api.delete(`/events/${id}`);
}
```

---

## 14. Error Handling Pattern

Every API call can throw an error object with these properties:

```js
error.message  // string — user-readable message from the server
error.status   // number — HTTP status code (400, 401, 403, 404, 409, 500 …)
error.errors   // array  — field-level validation errors [ { field, message } ]
```

Standard try/catch in a component:

```jsx
const [error, setError] = useState(null);
const [fieldErrors, setFieldErrors] = useState({});

async function handleSubmit(data) {
  setError(null);
  setFieldErrors({});
  try {
    await createLecturer(data);
    navigate('/lecturers');
  } catch (err) {
    if (err.errors?.length) {
      // map field errors onto individual inputs
      const map = {};
      err.errors.forEach(({ field, message }) => { map[field] = message; });
      setFieldErrors(map);
    } else {
      setError(err.message);
    }
  }
}
```

Render field errors next to inputs:

```jsx
<input name="email" />
{fieldErrors.email && <p className="error">{fieldErrors.email}</p>}
```

---

## 15. File Display

**Images** (profile photos, news/event featured images):

```jsx
// Google Drive URLs work directly as <img src>
<img src={lecturer.profileImage} alt={lecturer.firstName} />

// Fallback when null:
<img
  src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}`}
  alt={user.fullName}
/>
```

**Lecture note files** — open in new tab:

```jsx
<a href={note.fileUrl} target="_blank" rel="noreferrer">
  Download {note.title}
</a>
```

---

## 16. Role-Aware UI

Read the current user's role from the auth store and conditionally render admin controls:

```jsx
import { useAuth } from '../store/auth';

function LecturerCard({ lecturer }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'department_admin';

  return (
    <div>
      <h3>{lecturer.firstName} {lecturer.lastName}</h3>
      {isAdmin && (
        <>
          <button onClick={() => openEditModal(lecturer)}>Edit</button>
          <button onClick={() => confirmDelete(lecturer._id)}>Delete</button>
        </>
      )}
    </div>
  );
}
```

Department admin — pre-fill and lock `departmentId` on create forms:

```jsx
function CreateLecturerForm() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <form>
      {/* ... other fields ... */}
      {isSuperAdmin ? (
        <select name="departmentId">
          {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
      ) : (
        <input type="hidden" name="departmentId" value={user.departmentId} />
      )}
    </form>
  );
}
```

---

## 17. Pagination

Every list response includes:

```json
{
  "pagination": {
    "total": 120, "page": 2, "limit": 20,
    "totalPages": 6, "hasNextPage": true, "hasPrevPage": true
  }
}
```

Simple pagination component:

```jsx
function Pagination({ pagination, onPageChange }) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div>
      <button disabled={!pagination.hasPrevPage} onClick={() => onPageChange(pagination.page - 1)}>
        Previous
      </button>
      <span>Page {pagination.page} of {pagination.totalPages}</span>
      <button disabled={!pagination.hasNextPage} onClick={() => onPageChange(pagination.page + 1)}>
        Next
      </button>
    </div>
  );
}
```

---

## 18. Quick Reference — All Endpoints

| Method | Path | Auth | Roles |
|---|---|---|---|
| POST | `/auth/login` | ❌ | — |
| POST | `/auth/refresh-token` | ❌ | — |
| POST | `/auth/logout` | ❌ | — |
| POST | `/auth/logout-all` | ✅ | all |
| POST | `/auth/change-password` | ✅ | all |
| POST | `/auth/forgot-password` | ❌ | — |
| POST | `/auth/reset-password` | ❌ | — |
| GET | `/dashboard/stats` | ✅ | super_admin, dept_admin |
| GET | `/departments` | ✅ | all |
| GET | `/departments/:id` | ✅ | all |
| POST | `/departments` | ✅ | super_admin |
| PUT | `/departments/:id` | ✅ | super_admin |
| DELETE | `/departments/:id` | ✅ | super_admin |
| GET | `/users/profile` | ✅ | all |
| PUT | `/users/profile` | ✅ | all |
| POST | `/users/profile/image` | ✅ | all — multipart |
| GET | `/users` | ✅ | super_admin, dept_admin |
| POST | `/users` | ✅ | super_admin, dept_admin |
| GET | `/users/:id` | ✅ | super_admin, dept_admin |
| PUT | `/users/:id` | ✅ | super_admin, dept_admin |
| DELETE | `/users/:id` | ✅ | super_admin, dept_admin |
| GET | `/lecturers` | ✅ | all |
| POST | `/lecturers` | ✅ | super_admin, dept_admin |
| GET | `/lecturers/:id` | ✅ | all |
| PUT | `/lecturers/:id` | ✅ | super_admin, dept_admin |
| DELETE | `/lecturers/:id` | ✅ | super_admin, dept_admin |
| POST | `/lecturers/:id/profile-image` | ✅ | super_admin, dept_admin — multipart |
| GET | `/publications` | ✅ | all |
| POST | `/publications` | ✅ | super_admin, dept_admin |
| GET | `/publications/:id` | ✅ | all |
| PUT | `/publications/:id` | ✅ | super_admin, dept_admin |
| DELETE | `/publications/:id` | ✅ | super_admin, dept_admin |
| GET | `/lecture-notes` | ✅ | all |
| POST | `/lecture-notes` | ✅ | super_admin, dept_admin — **multipart required** |
| GET | `/lecture-notes/:id` | ✅ | all |
| PUT | `/lecture-notes/:id` | ✅ | super_admin, dept_admin — multipart |
| DELETE | `/lecture-notes/:id` | ✅ | super_admin, dept_admin |
| GET | `/news` | ✅ | all (students see published only) |
| POST | `/news` | ✅ | super_admin, dept_admin — **multipart required** |
| GET | `/news/slug/:slug` | ✅ | all — published only |
| GET | `/news/:id` | ✅ | all |
| PUT | `/news/:id` | ✅ | super_admin, dept_admin |
| DELETE | `/news/:id` | ✅ | super_admin, dept_admin |
| GET | `/events` | ✅ | all (students see published only) |
| POST | `/events` | ✅ | super_admin, dept_admin — **multipart required** |
| GET | `/events/:id` | ✅ | all |
| PUT | `/events/:id` | ✅ | super_admin, dept_admin |
| DELETE | `/events/:id` | ✅ | super_admin, dept_admin |

---

## 19. Common Gotchas

| Gotcha | Detail |
|---|---|
| **FormData booleans** | `isPublished` must be the string `"true"` or `"false"` in FormData, not a real boolean |
| **Do NOT set Content-Type for FormData** | Let the browser set the `multipart/form-data` boundary automatically — setting it manually breaks the upload |
| **eventDate format** | Always convert to ISO 8601 before sending: `new Date(value).toISOString()` |
| **Null vs undefined** | Fields like `profileImage` come as `null` from the API — always check `!= null` not just truthy |
| **Department auto-scoping** | The backend already filters by `req.user.departmentId` for dept_admin and student — you don't need to send `departmentId` as a query param for them, but it doesn't hurt |
| **Slug links** | Use `/news/slug/:slug` for shareable public links; use `/news/:id` for admin detail views |
| **CORS** | If you get CORS errors, add your frontend's dev origin (e.g. `http://localhost:5173`) to `ALLOWED_ORIGINS` in the backend `.env` and restart the server |
