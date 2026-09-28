# User Data Models Documentation

## Overview

This documentation provides detailed information about each user-related data model in the ABSU Faculty of Engineering Backend. The system supports multiple user types with distinct schemas, each serving a specific role within the institution.

---

## 1. User Model

**File:** `src/models/user.model.ts`

### Purpose
Represents administrative users with roles such as Super Admin, Dean, or Department Admin.

### Schema Definition

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `fullName` | String | ✓ | Trimmed | Administrator's full name |
| `email` | String | ✓ | Unique, lowercase, trimmed | Administrative email address |
| `password` | String | ✓ | Min 8 chars, not in JSON | Hashed password (excluded from responses) |
| `role` | String | ✓ | Enum: `super_admin`, `dean`, `department_admin` | User's administrative role |
| `departmentId` | ObjectId | ✗ | Ref: Department | Department assignment (null if not applicable) |
| `matricNumber` | String | ✗ | Sparse unique | Student/staff matriculation number |
| `level` | String | ✗ | Default null | Academic level if applicable |
| `profileImage` | String | ✗ | Default null | URL to profile image in cloud storage |
| `profileImageId` | String | ✗ | Default null | Cloud storage ID for image deletion |
| `isActive` | Boolean | ✓ | Default true | Account active status |
| `lastLogin` | Date | ✗ | Default null | Timestamp of last login |
| `createdAt` | Date | ✓ | Auto | Document creation timestamp |
| `updatedAt` | Date | ✓ | Auto | Last modification timestamp |

### Indexes
- `{ departmentId: 1 }` — Query users by department
- `{ role: 1 }` — Query users by role

### Security Features
- **Password Hashing:** Pre-save middleware uses bcryptjs with salt rounds of 12
- **Password Exclusion:** Mongoose transform excludes `password` and `__v` from JSON responses
- **Case Normalization:** Email is stored in lowercase

### Methods

#### `comparePassword(candidatePassword: string): Promise<boolean>`
Compares a plaintext password against the stored hashed password using bcryptjs.

**Usage:**
```typescript
const user = await User.findById(userId);
const isValid = await user.comparePassword(inputPassword);
```

### Example Document
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "fullName": "Dr. Chukwu Okafor",
  "email": "chukwu.okafor@absu.edu.ng",
  "role": "department_admin",
  "departmentId": "507f1f77bcf86cd799439012",
  "profileImage": "https://r2.example.com/profiles/507f1f77bcf86cd799439011.jpg",
  "isActive": true,
  "lastLogin": "2024-09-27T14:30:00.000Z",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-09-27T14:30:00.000Z"
}
```

---

## 2. Student Model

**File:** `src/models/student.model.ts`

### Purpose
Represents enrolled students in the faculty with academic-specific information.

### Schema Definition

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `fullName` | String | ✓ | Trimmed | Student's full name |
| `email` | String | ✓ | Unique, lowercase, trimmed | Student email address |
| `password` | String | ✓ | Min 8 chars, not in JSON | Hashed password (excluded from responses) |
| `role` | String | ✓ | Default: `student`, immutable | Fixed role that cannot be changed |
| `matricNumber` | String | ✓ | Unique, trimmed | University matriculation number |
| `level` | String | ✓ | Enum: '100', '200', '300', '400', '500' | Academic level/year |
| `departmentId` | ObjectId | ✓ | Ref: Department | Department enrollment |
| `profileImage` | String | ✗ | Default null | URL to profile image |
| `profileImageId` | String | ✗ | Default null | Cloud storage ID for image |
| `isActive` | Boolean | ✓ | Default true | Account active status |
| `lastLogin` | Date | ✗ | Default null | Last login timestamp |
| `createdAt` | Date | ✓ | Auto | Document creation timestamp |
| `updatedAt` | Date | ✓ | Auto | Last modification timestamp |

### Indexes
- `{ departmentId: 1 }` — Query students by department
- `{ matricNumber: 1 }` — Query students by matriculation number

### Collection Name
Students are stored in a collection explicitly named `students`.

### Security Features
- **Password Hashing:** Pre-save middleware uses bcryptjs with salt rounds of 12
- **Immutable Role:** The role cannot be changed after creation
- **Password Exclusion:** Not included in JSON responses
- **Email Case Normalization:** Stored in lowercase

### Methods

#### `comparePassword(candidatePassword: string): Promise<boolean>`
Verifies a plaintext password against the stored hash.

**Usage:**
```typescript
const student = await Student.findById(studentId);
const isValid = await student.comparePassword(inputPassword);
```

### Example Document
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "fullName": "Obinna Chidi Nwadike",
  "email": "obinna.nwadike@student.absu.edu.ng",
  "role": "student",
  "matricNumber": "ENG/CSC/2022/001",
  "level": "200",
  "departmentId": "507f1f77bcf86cd799439012",
  "profileImage": "https://r2.example.com/students/507f1f77bcf86cd799439013.jpg",
  "isActive": true,
  "lastLogin": "2024-09-28T09:15:00.000Z",
  "createdAt": "2024-09-01T12:00:00.000Z",
  "updatedAt": "2024-09-28T09:15:00.000Z"
}
```

---

## 3. Lecturer Model

**File:** `src/models/lecturer.model.ts`

### Purpose
Represents academic staff members who teach courses and publish research.

### Schema Definition

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `firstName` | String | ✓ | Trimmed | Lecturer's first name |
| `lastName` | String | ✓ | Trimmed | Lecturer's surname |
| `email` | String | ✓ | Unique, lowercase, trimmed | Professional email |
| `password` | String | ✗ | Min 8 chars, not in JSON | Optional password (excluded from responses) |
| `staffId` | String | ✗ | Trimmed, default null | University staff ID number |
| `designation` | String | ✓ | Trimmed | Job title (e.g., "Associate Professor", "Lecturer I") |
| `role` | String | ✓ | Default: `lecturer`, immutable | Fixed role |
| `profileImage` | String | ✗ | Default null | URL to profile photo |
| `profileImageId` | String | ✗ | Default null | Cloud storage ID for deletion |
| `bio` | String | ✗ | Default null | Professional biography |
| `departmentId` | ObjectId | ✓ | Ref: Department | Home department |
| `isVerified` | Boolean | ✓ | Default false | Account verification status |
| `verifiedBy` | ObjectId | ✗ | Ref: User, default null | Admin who verified this lecturer |
| `verifiedAt` | Date | ✗ | Default null | Verification timestamp |
| `isActive` | Boolean | ✓ | Default true | Account active status |
| `lastLogin` | Date | ✗ | Default null | Last login timestamp |
| `createdAt` | Date | ✓ | Auto | Document creation timestamp |
| `updatedAt` | Date | ✓ | Auto | Last modification timestamp |

### Indexes
- `{ departmentId: 1 }` — Query lecturers by department
- `{ role: 1 }` — Query by role
- `{ isVerified: 1 }` — Query verification status

### Verification Workflow
Lecturers must be verified by an admin before they can perform certain operations. This creates an audit trail:
- Admin triggers verification → sets `isVerified = true`, `verifiedBy = adminId`, `verifiedAt = now()`

### Security Features
- **Optional Password:** Lecturers may be created without passwords (e.g., provisioned via LDAP)
- **Password Hashing:** If password is provided or modified, it is hashed with salt rounds of 12
- **Password Exclusion:** Never included in JSON responses

### Methods

#### `comparePassword(candidatePassword: string): Promise<boolean>`
Safely compares a password (returns false if no password is set).

**Usage:**
```typescript
const lecturer = await Lecturer.findById(lecturerId);
const isValid = await lecturer.comparePassword(inputPassword);
```

### Example Document
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "firstName": "Amarachukwu",
  "lastName": "Obi",
  "email": "amarachukwu.obi@absu.edu.ng",
  "staffId": "ABSU/CSC/001",
  "designation": "Associate Professor",
  "role": "lecturer",
  "profileImage": "https://r2.example.com/lecturers/507f1f77bcf86cd799439014.jpg",
  "bio": "Specializes in Machine Learning and AI applications in Engineering.",
  "departmentId": "507f1f77bcf86cd799439012",
  "isVerified": true,
  "verifiedBy": "507f1f77bcf86cd799439011",
  "verifiedAt": "2024-02-20T10:30:00.000Z",
  "isActive": true,
  "lastLogin": "2024-09-28T15:45:00.000Z",
  "createdAt": "2024-01-10T08:00:00.000Z",
  "updatedAt": "2024-09-28T15:45:00.000Z"
}
```

---

## 4. Token Model

**File:** `src/models/token.model.ts`

### Purpose
Manages refresh tokens for session persistence and token revocation (logout).

### Schema Definition

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `userId` | ObjectId | ✓ | Ref: User | Owner of the token |
| `refreshToken` | String | ✓ | Unique | JWT refresh token string |
| `isRevoked` | Boolean | ✓ | Default false | Revocation status (true = logged out) |
| `expiresAt` | Date | ✓ | No default | Token expiration time |
| `createdAt` | Date | ✓ | Auto | Creation timestamp |
| `updatedAt` | Date | ✓ | Auto | Last update timestamp |

### Indexes
- `{ userId: 1 }` — Query all tokens for a user (for multi-device logout)
- `{ expiresAt: 1 }` with TTL of 0 seconds — Auto-delete expired tokens

### TTL Index
MongoDB will automatically delete expired token documents after the `expiresAt` time passes, keeping the collection clean.

### Workflow

**Token Creation (Login):**
```
1. User provides credentials
2. Backend hashes password and compares
3. On match, generate JWT access and refresh tokens
4. Store refresh token in database with expiresAt = now + 7 days
5. Return both tokens to client
```

**Token Refresh:**
```
1. Client includes expired access token and valid refresh token
2. Backend verifies refresh token signature and checks database
3. If valid and not revoked, generate new access token
4. Return new access token
```

**Token Revocation (Logout):**
```
1. Client sends refresh token to logout endpoint
2. Backend marks token as revoked: { isRevoked: true }
3. Client clears local tokens
```

### Example Document
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "userId": "507f1f77bcf86cd799439011",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isRevoked": false,
  "expiresAt": "2024-10-05T10:00:00.000Z",
  "createdAt": "2024-09-28T10:00:00.000Z",
  "updatedAt": "2024-09-28T10:00:00.000Z"
}
```

---

## 5. Department Model

**File:** `src/models/department.model.ts`

### Purpose
Represents academic departments within the faculty (e.g., Computer Science, Civil Engineering).

### Schema Definition

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `name` | String | ✓ | Trimmed | Full department name |
| `code` | String | ✓ | Unique, uppercase, trimmed | Department code (e.g., "CSC", "CEE") |
| `description` | String | ✓ | Trimmed | Department description/overview |
| `createdAt` | Date | ✓ | Auto | Creation timestamp |
| `updatedAt` | Date | ✓ | Auto | Last update timestamp |

### Indexes
- `{ name: 1 }` — Query departments by name

### Example Document
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Computer Science",
  "code": "CSC",
  "description": "Department of Computer Science and Engineering dedicated to advancing computing education and research.",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2024-09-28T10:00:00.000Z"
}
```

---

## 6. Lecture Note Model

**File:** `src/models/lectureNote.model.ts`

### Purpose
Manages course lecture notes and study materials uploaded by lecturers.

### Schema Definition

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `title` | String | ✓ | Trimmed | Note title/name |
| `courseCode` | String | ✓ | Uppercase, trimmed | Course code (e.g., "CSC101") |
| `level` | String | ✓ | Trimmed | Academic level (e.g., "100", "200") |
| `semester` | String | ✓ | Trimmed | Semester (e.g., "first", "second") |
| `fileUrl` | String | ✓ | No defaults | Direct download URL (typically Google Drive) |
| `fileId` | String | ✗ | Default null | Cloud storage file ID for deletion |
| `lecturerId` | ObjectId | ✓ | Ref: Lecturer | Lecturer who uploaded |
| `departmentIds` | ObjectId[] | ✓ | Refs: Department, min 1 required | Departments this note is relevant to |
| `createdAt` | Date | ✓ | Auto | Upload timestamp |
| `updatedAt` | Date | ✓ | Auto | Last update timestamp |

### Indexes
- `{ departmentIds: 1 }` — Query notes by department
- `{ lecturerId: 1 }` — Query by lecturer
- `{ level: 1 }` — Filter by academic level
- `{ semester: 1 }` — Filter by semester
- `{ courseCode: 1 }` — Query by course code
- `{ title: "text", courseCode: "text" }` — Full-text search

### Validation
- `departmentIds` must be a non-empty array (at least one department is required)

### Example Document
```json
{
  "_id": "507f1f77bcf86cd799439030",
  "title": "Introduction to Data Structures",
  "courseCode": "CSC201",
  "level": "200",
  "semester": "first",
  "fileUrl": "https://drive.google.com/file/d/1abc123.../view?usp=sharing",
  "fileId": "1abc123...",
  "lecturerId": "507f1f77bcf86cd799439014",
  "departmentIds": ["507f1f77bcf86cd799439012"],
  "createdAt": "2024-09-01T12:30:00.000Z",
  "updatedAt": "2024-09-01T12:30:00.000Z"
}
```

---

## 7. Publication Model

**File:** `src/models/publication.model.ts`

### Purpose
Records academic publications (journal articles, research papers) authored by lecturers.

### Schema Definition

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `title` | String | ✓ | Trimmed | Publication title |
| `journal` | String | ✓ | Trimmed | Journal name |
| `publicationYear` | Number | ✓ | No constraints | Year of publication |
| `publicationUrl` | String | ✓ | Trimmed | Link to publication (DOI or journal URL) |
| `authors` | String[] | ✓ | Array of trimmed strings | List of author names |
| `lecturerId` | ObjectId | ✓ | Ref: Lecturer | Primary lecturer/author |
| `departmentId` | ObjectId | ✓ | Ref: Department | Department affiliation |
| `isPublished` | Boolean | ✓ | Default true | Publication status |
| `createdAt` | Date | ✓ | Auto | Record creation timestamp |
| `updatedAt` | Date | ✓ | Auto | Last update timestamp |

### Indexes
- `{ departmentId: 1 }` — Query by department
- `{ lecturerId: 1 }` — Query by lecturer
- `{ publicationYear: 1 }` — Filter by year
- `{ isPublished: 1 }` — Filter by publication status
- `{ title: "text", journal: "text" }` — Full-text search

### Example Document
```json
{
  "_id": "507f1f77bcf86cd799439031",
  "title": "Machine Learning Applications in Smart Grid Systems",
  "journal": "IEEE Transactions on Power Systems",
  "publicationYear": 2024,
  "publicationUrl": "https://doi.org/10.1109/TPWRS.2024.xxxxx",
  "authors": ["Amarachukwu Obi", "Chukwu Okafor", "Obinna Nwadike"],
  "lecturerId": "507f1f77bcf86cd799439014",
  "departmentId": "507f1f77bcf86cd799439012",
  "isPublished": true,
  "createdAt": "2024-08-15T14:00:00.000Z",
  "updatedAt": "2024-08-15T14:00:00.000Z"
}
```

---

## 8. News Model

**File:** `src/models/news.model.ts`

### Purpose
Publishes news articles and announcements for faculty stakeholders.

### Schema Definition

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `title` | String | ✓ | Trimmed, max 120 chars | News headline |
| `slug` | String | ✓ | Unique, lowercase | URL-friendly identifier (auto-generated) |
| `summary` | String | ✗ | Trimmed, max 300 chars | Brief summary/excerpt |
| `content` | String | ✓ | Full article body | Rich text content (HTML/Markdown) |
| `category` | String | ✓ | Enum from NEWS_CATEGORIES | Category (e.g., "General", "Announcement", "Event") |
| `imageUrl` | String | ✗ | Default null | Featured image URL |
| `imageId` | String | ✗ | Default null | Cloud storage ID for deletion |
| `isPublished` | Boolean | ✓ | Default false | Publication visibility |
| `publishedAt` | Date | ✗ | Default null | Publication timestamp (auto-set on publish) |
| `isFeatured` | Boolean | ✓ | Default false | Featured article flag |
| `metaTitle` | String | ✗ | Trimmed, max 80 chars | SEO meta title |
| `metaDescription` | String | ✗ | Trimmed, max 180 chars | SEO meta description |
| `author` | ObjectId | ✓ | Ref: User | Admin who created the article |
| `updatedBy` | ObjectId | ✗ | Ref: User | Admin who last edited |
| `createdAt` | Date | ✓ | Auto | Creation timestamp |
| `updatedAt` | Date | ✓ | Auto | Last update timestamp |

### Indexes
- `{ slug: 1 }` — Retrieve by URL slug
- `{ isPublished: 1 }` — Filter published articles
- `{ isFeatured: 1 }` — Highlight featured articles
- `{ category: 1 }` — Filter by category
- `{ createdAt: -1 }` — Sort by recency
- `{ title: "text", content: "text", summary: "text" }` — Full-text search

### Auto-Generation: Slug
When a news article is saved, if the title changes or no slug exists:
1. Generate base slug from title using slugify
2. Check for uniqueness (excluding current document)
3. If collision, append `-2`, `-3`, etc. until unique
4. Assign the slug

**Example:** Title "New Lab Opening" → slug "new-lab-opening"

### Auto-Publication
When `isPublished` changes to `true` and `publishedAt` is null:
- Automatically set `publishedAt = now()`

### Example Document
```json
{
  "_id": "507f1f77bcf86cd799439032",
  "title": "Faculty Achieves World-Class Research Recognition",
  "slug": "faculty-achieves-world-class-research-recognition",
  "summary": "Our department has been ranked among the top engineering faculties...",
  "content": "<p>The faculty is proud to announce...</p>",
  "category": "Achievement",
  "imageUrl": "https://r2.example.com/news/507f1f77bcf86cd799439032.jpg",
  "isPublished": true,
  "publishedAt": "2024-09-27T10:00:00.000Z",
  "isFeatured": true,
  "metaTitle": "ABSU Faculty Research Recognition",
  "metaDescription": "Read about our recent research achievements...",
  "author": "507f1f77bcf86cd799439011",
  "createdAt": "2024-09-27T09:00:00.000Z",
  "updatedAt": "2024-09-27T10:00:00.000Z"
}
```

---

## 9. Event Model

**File:** `src/models/event.model.ts`

### Purpose
Manages faculty events, seminars, and workshops.

### Schema Definition

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `title` | String | ✓ | Trimmed | Event name |
| `slug` | String | ✓ | Unique, lowercase | URL identifier |
| `description` | String | ✓ | Full event details | Event description/agenda |
| `venue` | String | ✓ | Trimmed | Location/venue name |
| `eventDate` | Date | ✓ | ISO date-time | Event date and time |
| `featuredImage` | String | ✓ | URL required | Event poster/banner image |
| `featuredImageId` | String | ✗ | Default null | Cloud storage ID |
| `isPublished` | Boolean | ✓ | Default false | Event visibility status |
| `departmentId` | ObjectId | ✓ | Ref: Department | Organizing department |
| `createdAt` | Date | ✓ | Auto | Creation timestamp |
| `updatedAt` | Date | ✓ | Auto | Last update timestamp |

### Indexes
- `{ departmentId: 1 }` — Query events by department
- `{ isPublished: 1 }` — Filter published events
- `{ eventDate: 1 }` — Sort by date
- `{ title: "text", description: "text" }` — Full-text search

### Example Document
```json
{
  "_id": "507f1f77bcf86cd799439033",
  "title": "Annual Engineering Symposium 2024",
  "slug": "annual-engineering-symposium-2024",
  "description": "Join us for the 12th annual symposium featuring keynote speakers from leading tech companies...",
  "venue": "Faculty Auditorium, Main Campus",
  "eventDate": "2024-11-15T09:00:00.000Z",
  "featuredImage": "https://r2.example.com/events/507f1f77bcf86cd799439033.jpg",
  "isPublished": true,
  "departmentId": "507f1f77bcf86cd799439012",
  "createdAt": "2024-09-20T14:00:00.000Z",
  "updatedAt": "2024-09-27T10:00:00.000Z"
}
```

---

## 10. Academic Session Model

**File:** `src/models/academicSession.model.ts`

### Purpose
Records academic sessions/years for the institution (e.g., "2023/2024").

### Schema Definition

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `session` | String | ✓ | Trimmed | Session identifier (e.g., "2023/2024", "2024/2025") |
| `startYear` | Number | ✓ | No constraints | Starting year (for sorting/filtering) |
| `isActive` | Boolean | ✓ | Default true | Current active session flag |
| `updatedBy` | String | ✓ | No constraints | Admin who set it active |
| `createdAt` | Date | ✓ | Auto | Creation timestamp |
| `updatedAt` | Date | ✓ | Auto | Last update timestamp |

### Example Document
```json
{
  "_id": "507f1f77bcf86cd799439034",
  "session": "2024/2025",
  "startYear": 2024,
  "isActive": true,
  "updatedBy": "507f1f77bcf86cd799439011",
  "createdAt": "2024-09-01T00:00:00.000Z",
  "updatedAt": "2024-09-28T10:00:00.000Z"
}
```

---

## Data Relationships

### Entity Relationship Diagram (Conceptual)

```
User (Admin)
├─ departmentId → Department
├─ verifies → Lecturer.verifiedBy
└─ creates → News.author / Event / AcademicSession

Student
├─ departmentId → Department
└─ enrolled in → AcademicSession

Lecturer
├─ departmentId → Department
├─ verifiedBy → User
├─ publishes → Publication
└─ uploads → LectureNote

Department
├─ houses → User, Student, Lecturer
├─ referenced by → News, Event, LectureNote, Publication
└─ organizes → AcademicSession

Token
└─ userId → User (session management)

Content Models
├─ News: author (User), departmentId (Department)
├─ Event: departmentId (Department)
├─ LectureNote: lecturerId (Lecturer), departmentIds (Department[])
└─ Publication: lecturerId (Lecturer), departmentId (Department)
```

---

## Common Data Patterns

### Authentication Flow
```
User → Credentials → UserModel.comparePassword()
     → JWT Tokens → TokenModel stores refresh token
     → Access Token validates requests
     → Refresh Token renews expired access tokens
```

### Role-Based Access
- **Super Admin:** Can manage all users, departments, and system settings
- **Department Admin:** Can manage users and content within their department
- **Lecturer:** Can upload lecture notes, publications; must be verified
- **Student:** Can view public content, access department materials

### Department Scoping
Most content models include `departmentId` or `departmentIds` to enable:
- Department admins to see only their department's data
- Students to see materials relevant to their department
- Super admins to see everything

### File Management
Models with cloud-stored files (`profileImage`, `imageUrl`, `fileUrl`) typically have two fields:
- **URL field:** Direct access URL (for downloads/display)
- **ID field:** Cloud storage identifier (for deletion via API)

---

## Validation Rules

### User Model
- Email must be unique and valid email format
- Password min 8 characters
- Role must be one of the three admin roles
- departmentId must reference valid Department if provided

### Student Model
- MatricNumber must be unique
- Level must be one of: 100, 200, 300, 400, 500
- DepartmentId is required
- Email must be unique

### Lecturer Model
- Email must be unique
- Designation cannot be empty
- DepartmentId is required
- isVerified and verifiedBy must be consistent

### Publication Model
- Authors array must not be empty
- publicationUrl must be valid URL format
- publicationYear must be reasonable (not in future)

---

## Best Practices

### When Querying
1. **Use indexes:** Always filter by indexed fields first
2. **Lean queries:** Use `.lean()` when not modifying documents
3. **Pagination:** Always paginate large result sets
4. **Select fields:** Use `.select()` to limit fields returned
5. **Populate carefully:** Avoid deep nested population

### When Creating/Updating
1. **Validate input:** Use validators before saving
2. **Sanitize content:** Remove HTML/XSS from user input
3. **Audit changes:** Track who modified what and when
4. **Handle files:** Store cloud IDs for later deletion
5. **Transactions:** Use sessions for multi-document updates

### Security Considerations
1. **Never expose passwords:** Already excluded in schema
2. **Hash before compare:** Use `.comparePassword()` method
3. **Verify lecturers:** Require verification before publishing
4. **Department isolation:** Always check departmentId on reads
5. **Audit logs:** Track admin actions (file updates show `updatedBy`)

---

## Version Notes

- **Mongoose Version:** 8.x
- **MongoDB Compatibility:** 4.4+
- **TypeScript:** Strict mode enabled
- **Date Format:** ISO 8601 (UTC)

---

*Documentation generated for ABSU Faculty of Engineering Backend*
*Generated: 2024-09-28*