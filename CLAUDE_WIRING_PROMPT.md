# Prompt for Claude — Wire the ABSU Engineering Frontend to the Backend API

## Your Task

You are wiring an existing React frontend to a production backend REST API. The UI already exists. Your job is to replace every piece of hardcoded/mock/localStorage data with real API calls, implement proper JWT authentication, and make the app fully functional and production-ready.

Do NOT redesign pages or change the visual layout unless specifically told to. Keep all existing CSS. Your changes are purely functional.

---

## Locations

- **Frontend project:** `C:\Users\DIGITAL ECONOMY\Desktop\absu-engineering-website`
- **Backend project:** `C:\Users\DIGITAL ECONOMY\Desktop\absu-backend`
- **Full API reference:** `C:\Users\DIGITAL ECONOMY\Desktop\absu-backend\FRONTEND_INTEGRATION_GUIDE.md`

**Read `FRONTEND_INTEGRATION_GUIDE.md` before writing a single line of code.** It has every endpoint, request shape, response shape, error format, file upload pattern, and role access rule.

---

## Backend Base URL

The backend runs on `http://localhost:5000/api`.

Create `C:\Users\DIGITAL ECONOMY\Desktop\absu-engineering-website\.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Current State of the Frontend (what's broken/fake)

### 1. Authentication — completely fake
`src/adminSection/AdminLogin.jsx` authenticates with hardcoded credentials (`admin` / `admin123`) and stores only `localStorage.setItem('absu_admin', 'true')`. There are no real tokens.

`src/App.jsx` checks `localStorage.getItem('absu_admin')` to guard admin routes. This must be replaced with real JWT validation.

### 2. Dashboard stats — hardcoded numbers
`src/adminSection/AdminDashboard.jsx` has a `stats` state object initialised with hardcoded numbers (24, 12, 6, 8, 7, 15, 3). These must be fetched from `GET /api/dashboard/stats`.

### 3. All management pages — mock data or empty
Every page in `src/pages/` and `src/adminSection/pages/` either shows "Coming soon…" or uses `localStorage` as a fake database. All of these must call the real API.

### 4. No role-based access
The app currently only has one admin role. The backend has three roles: `super_admin`, `department_admin`, `student`. The UI must reflect this.

### 5. No public-facing dynamic data
The public pages (`StaffDirectoryPage`, `NewsPage`, `EventsManagement` shown publicly, `DepartmentDetailPage`) load no real data. These must call the API.

---

## What You Must Build

Work through these in order. Do not skip ahead.

---

### Step 1 — API Client (`src/lib/api.js`)

Create this file from scratch. It must:

- Read `BASE_URL` from `import.meta.env.VITE_API_BASE_URL`
- Attach `Authorization: Bearer <token>` from `localStorage.getItem('accessToken')` on every request
- On **401 response**: silently call `POST /auth/refresh-token` with `localStorage.getItem('refreshToken')`, save the new tokens, and **retry the original request once**. If the retry also returns 401, clear all tokens and redirect to `/admin/login`
- Parse the response body as JSON
- On non-OK response, throw an `Error` object with `.message` (from `res.data.message`), `.status` (HTTP code), and `.errors` (array from `res.data.errors`)
- Export helper methods: `api.get(path)`, `api.post(path, body)`, `api.put(path, body)`, `api.delete(path)`, `api.upload(path, formData, method='POST')`
- For `api.upload`, pass the `FormData` directly — do NOT set `Content-Type` manually

Token helpers to export: `saveTokens(access, refresh)`, `clearTokens()`, `getAccessToken()`, `getRefreshToken()`.

---

### Step 2 — Auth (`src/adminSection/AdminLogin.jsx`)

Replace the hardcoded credential check with a real API call:

```
POST /api/auth/login
Body: { email, password }
Response: { data: { user, tokens: { accessToken, refreshToken } } }
```

On success:
- `localStorage.setItem('accessToken', tokens.accessToken)`
- `localStorage.setItem('refreshToken', tokens.refreshToken)`
- `localStorage.setItem('absu_user', JSON.stringify(user))` — store the full user object (has `role`, `departmentId`, `fullName`, `email`, `profileImage`)
- Keep the existing `localStorage.setItem('absu_admin', 'true')` so the existing route guard still works for now
- Navigate to `/admin/dashboard`

Change the input field label and `name` attribute from `username` to `email`. Keep the rest of the UI identical.

**Forgot password link**: Add a small "Forgot password?" link below the form. Clicking it should show an inline email input that calls `POST /api/auth/forgot-password`. Always show the success message regardless of whether the email exists (the backend intentionally always returns 200).

---

### Step 3 — Auth State Helper (`src/lib/auth.js`)

Create this file:

```js
export function getCurrentUser() {
  const raw = localStorage.getItem('absu_user');
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem('accessToken') && !!getCurrentUser();
}

export function isSuperAdmin() {
  return getCurrentUser()?.role === 'super_admin';
}

export function isDepartmentAdmin() {
  return getCurrentUser()?.role === 'department_admin';
}

export function isStudent() {
  return getCurrentUser()?.role === 'student';
}

export function isAdmin() {
  const role = getCurrentUser()?.role;
  return role === 'super_admin' || role === 'department_admin';
}
```

---

### Step 4 — Protected Route (`src/App.jsx`)

Update `ProtectedRoute` to use `isAuthenticated()` from `src/lib/auth.js` instead of the `absu_admin` key:

```jsx
import { isAuthenticated, isAdmin } from './lib/auth';

const ProtectedRoute = ({ element, adminOnly }) => {
  if (!isAuthenticated()) return <Navigate to="/admin/login" replace />;
  if (adminOnly && !isAdmin()) return <Navigate to="/" replace />;
  return element;
};
```

---

### Step 5 — Dashboard (`src/adminSection/AdminDashboard.jsx`)

Replace the hardcoded `stats` object. On mount, call `GET /api/dashboard/stats`:

```js
import { api } from '../lib/api';

useEffect(() => {
  api.get('/dashboard/stats')
    .then(res => setStats(res.data))
    .catch(() => {}); // fail silently, keep whatever is shown
}, []);
```

Map the response fields to the existing stat cards:
- `res.data.lectureNotes` → "Notes & Announcements" card
- `res.data.events` → "Upcoming Events" card  
- `res.data.students` → "Users" card
- `res.data.departments` → "Departments" card (super_admin only; hide card for dept_admin)
- `res.data.lecturers` → "Staff/Lecturers" card
- `res.data.publications` → "Publications" card
- `res.data.news` → "News" card

Replace `adminName` source: read from `getCurrentUser()?.fullName` instead of `absu_admin_name`.

Replace the logout handler to also call `POST /api/auth/logout` with the stored refresh token, then clear tokens.

---

### Step 6 — Users Management (`src/pages/UsersManagement.jsx`)

Full CRUD. This page is for admins only.

**List:** `GET /api/users?page=1&limit=20&search=...`  
**Create:** `POST /api/users` with `{ fullName, email, password, role, departmentId?, matricNumber?, level? }`  
**Update:** `PUT /api/users/:id`  
**Delete:** `DELETE /api/users/:id`

Show a table with columns: Full Name, Email, Role, Department, Status (Active/Inactive), Actions.

For `super_admin`: show all users, allow creating any role, show department column.  
For `department_admin`: show only users in their department (`getCurrentUser().departmentId`), only allow creating `student` role.

Password validation: minimum 8 chars, must include uppercase, lowercase, and a digit. Show this requirement near the password field.

Add a search input at the top of the table. Debounce search by 400ms.

---

### Step 7 — Lecturers/Staff (`src/pages/StaffDirectoryPage.jsx`)

This is a **public-facing** page. Replace mock data with: `GET /api/lecturers?limit=100`

Display lecturer cards with `profileImage` (fall back to initials avatar if null), full name, designation, and department.

For admins viewing this page (check `isAdmin()`), show Edit and Delete buttons on each card.

Create a separate admin management page at `src/pages/LecturersManagement.jsx` (add it as a route under `/admin/dashboard/lecturers`) with:
- **List:** `GET /api/lecturers?page=1&limit=20&search=...`
- **Create:** `POST /api/lecturers` with `{ firstName, lastName, email, designation, bio?, departmentId }`
- **Update:** `PUT /api/lecturers/:id`
- **Delete:** `DELETE /api/lecturers/:id`
- **Upload profile image:** `POST /api/lecturers/:id/profile-image` with `FormData` field `image`

Add this route to `AdminDashboard.jsx` and a sidebar link.

---

### Step 8 — News (`src/pages/NewsPage.jsx` and `src/pages/NewsDetailPage.jsx`)

**Public listing:** `GET /api/news?isPublished=true&limit=20&page=1`  
**Public detail:** `GET /api/news/:id`

Replace any mock news data in these files with real API calls.

Create admin management at `src/pages/NewsManagement.jsx` (route: `/admin/dashboard/news`):
- **List:** `GET /api/news?page=1&limit=20&search=...` (admins see all including unpublished)
- **Create:** `POST /api/news` — multipart/form-data with fields: `image` (file), `title`, `content`, `category`, `isPublished` (string "true"/"false"), `departmentId`
- **Update:** `PUT /api/news/:id` — if replacing image use FormData; if only updating text fields use JSON (`api.put`)
- **Delete:** `DELETE /api/news/:id`
- **Toggle publish:** inline toggle that calls `api.put('/news/:id', { isPublished: !current })`

For the create/edit form image upload:
```js
const formData = new FormData();
formData.append('image', fileInputRef.current.files[0]);
formData.append('title', title);
formData.append('isPublished', String(isPublished)); // must be string
formData.append('departmentId', departmentId);
// etc.
await api.upload('/news', formData);
```

Add route and sidebar link.

---

### Step 9 — Events (`src/pages/EventsManagement.jsx`)

The existing `EventsManagement.jsx` appears to be used in the admin section. Wire it to the real API.

**List:** `GET /api/events?page=1&limit=20`  
**Create:** `POST /api/events` — multipart with fields: `image`, `title`, `description`, `venue`, `eventDate` (ISO string), `isPublished`, `departmentId`  
**Update:** `PUT /api/events/:id`  
**Delete:** `DELETE /api/events/:id`

For `eventDate`, convert from a `datetime-local` input to ISO before sending:
```js
formData.append('eventDate', new Date(eventDateInput).toISOString());
```

---

### Step 10 — Lecture Notes (`src/pages/NotesManagement.jsx`)

**List:** `GET /api/lecture-notes?page=1&limit=20&level=...&semester=...`  
**Create:** `POST /api/lecture-notes` — multipart with fields: `file` (PDF/DOC/PPT), `title`, `courseCode`, `level`, `semester`, `lecturerId`, `departmentId`  
**Update:** `PUT /api/lecture-notes/:id` — include `file` field only if replacing  
**Delete:** `DELETE /api/lecture-notes/:id`

For downloading: render `<a href={note.fileUrl} target="_blank" rel="noreferrer">Download</a>`. The `fileUrl` is a direct Google Drive link.

Add filter dropdowns for `level` (100–500) and `semester` (first/second).

---

### Step 11 — Publications (`src/adminSection/pages/CourseMaterialsManagement.jsx`)

Rename/repurpose this page to handle Publications (it maps most directly).

**List:** `GET /api/publications?page=1&limit=20`  
**Create:** `POST /api/publications` with JSON body: `{ title, journal, publicationYear, publicationUrl, authors, lecturerId, departmentId }`  
Note: `authors` is an array of strings. When building from a form, split a comma-separated input: `authors: authorInput.split(',').map(s => s.trim())`  
**Update:** `PUT /api/publications/:id`  
**Delete:** `DELETE /api/publications/:id`

---

### Step 12 — Profile Management (`src/adminSection/pages/ProfileManagement.jsx`)

Replace localStorage profile with real API:

**Load:** `GET /api/users/profile`  
**Update name/email:** `PUT /api/users/profile` with `{ fullName?, email? }`  
**Upload avatar:** `POST /api/users/profile/image` with FormData field `image`  
**Change password:** `POST /api/auth/change-password` with `{ currentPassword, newPassword }`

After a successful profile image upload, update `localStorage.setItem('absu_user', JSON.stringify(updatedUser))` with the returned user object so the name/avatar in the header updates.

---

### Step 13 — Departments (`src/pages/DepartmentsPage/DepartmentsPage.jsx` and detail pages)

**Public listing:** `GET /api/departments?limit=100`  
Replace the hardcoded department list in the public `DepartmentsPage` with real API data.

Create admin management at route `/admin/dashboard/departments` (replaces the "Coming soon…" placeholder in `AdminDashboard.jsx`):
- **List, Create, Update, Delete** using `/api/departments`  
- Only show Create/Edit/Delete buttons if `isSuperAdmin()`

---

### Step 14 — Sidebar (`src/components/Sidebar.jsx`)

Add links for every new admin page you've created:
- `/admin/dashboard` — Dashboard
- `/admin/dashboard/notes` — Lecture Notes
- `/admin/dashboard/news` — News
- `/admin/dashboard/events` — Events
- `/admin/dashboard/lecturers` — Lecturers
- `/admin/dashboard/publications` — Publications
- `/admin/dashboard/users` — Users
- `/admin/dashboard/departments` — Departments (show only if `isSuperAdmin()`)
- `/admin/dashboard/profile` — Profile

Import and use `getCurrentUser` and `isSuperAdmin` from `src/lib/auth.js` to conditionally show links.

---

### Step 15 — Error Handling (global pattern)

Every API call must handle errors. Do not let errors fail silently (except Step 5 dashboard load). Use this pattern everywhere:

```jsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);
  setError('');
  try {
    await api.post('/lecturers', formData);
    // reset form / reload list
  } catch (err) {
    setError(err.message || 'Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
}
```

Render the error:
```jsx
{error && <div className="error-message" style={{color:'red', margin:'8px 0'}}>{error}</div>}
```

Disable submit buttons while `loading` is true and show a text change ("Saving…", "Uploading…", "Deleting…").

---

## Constraints

- **No TypeScript** — this is plain JavaScript
- **No new UI libraries** — do not install Tailwind, shadcn, MUI, etc. Keep the existing CSS
- **Use Fetch API only** — do not install axios. The `api.js` client in Step 1 wraps fetch
- **Do not break the public pages** (HomePage, AboutPage, ContactPage, AdmissionsPage) — they should continue to work as-is
- **Preserve all existing CSS files** — do not modify any `.css` files unless explicitly required

---

## File Structure After Your Changes

```
src/
├── lib/
│   ├── api.js          ← NEW: fetch wrapper with token auth + silent refresh
│   └── auth.js         ← NEW: getCurrentUser, isAdmin, isSuperAdmin helpers
├── adminSection/
│   ├── AdminLogin.jsx  ← MODIFIED: real API login
│   ├── AdminDashboard.jsx ← MODIFIED: real stats, real logout
│   └── pages/
│       ├── ProfileManagement.jsx   ← MODIFIED: real API
│       └── CourseMaterialsManagement.jsx ← MODIFIED: publications API
├── pages/
│   ├── UsersManagement.jsx         ← MODIFIED: real API
│   ├── NotesManagement.jsx         ← MODIFIED: real API
│   ├── EventsManagement.jsx        ← MODIFIED: real API
│   ├── NewsManagement.jsx          ← NEW: admin news CRUD
│   ├── LecturersManagement.jsx     ← NEW: admin lecturers CRUD
│   ├── NewsPage.jsx                ← MODIFIED: public API
│   ├── NewsDetailPage.jsx          ← MODIFIED: public API
│   └── StaffDirectoryPage.jsx      ← MODIFIED: public API
├── components/
│   └── Sidebar.jsx     ← MODIFIED: updated nav links
└── App.jsx             ← MODIFIED: updated ProtectedRoute
```

---

## Backend Test Accounts

Use these to test every role:

| Role | Email | Password |
|---|---|---|
| super_admin | admin@absu.edu.ng | Admin@123456 |
| department_admin | admin.csc@absu.edu.ng | Admin@123456 |
| student | student1.csc@absu.edu.ng | Student@123456 |

---

## Definition of Done

The app is production-ready when:

- [ ] Login calls the real API and stores JWT tokens
- [ ] Expired tokens are refreshed silently without the user being logged out
- [ ] Dashboard stats show real numbers from the database
- [ ] All CRUD pages (users, lecturers, news, events, notes, publications, departments) read from and write to the API
- [ ] File uploads (images and documents) reach Google Drive via the backend
- [ ] Super admin sees all departments' data; department admin sees only their own
- [ ] Every form shows a loading state on submit and an error message on failure
- [ ] Logging out calls `POST /auth/logout` and clears all tokens from localStorage
- [ ] Public pages (staff directory, news, events) display real data from the API
- [ ] No hardcoded credentials, no hardcoded numbers, no localStorage used as a fake database
