export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  PASSWORD_RESET_EMAIL_SENT: 'Password reset email sent',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully',
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_DISABLED: 'Account is disabled. Contact administrator',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'You do not have permission to perform this action',
  REFRESH_TOKEN_REQUIRED: 'Refresh token is required',
};

export const USER_MESSAGES = {
  CREATED: 'User created successfully',
  UPDATED: 'User updated successfully',
  DELETED: 'User deleted successfully',
  FETCHED: 'Users fetched successfully',
  FETCHED_ONE: 'User fetched successfully',
  NOT_FOUND: 'User not found',
  EMAIL_EXISTS: 'Email already in use',
  MATRIC_EXISTS: 'Matriculation number already in use',
  PROFILE_IMAGE_UPDATED: 'Profile image updated successfully',
};

export const DEPARTMENT_MESSAGES = {
  CREATED: 'Department created successfully',
  UPDATED: 'Department updated successfully',
  DELETED: 'Department deleted successfully',
  FETCHED: 'Departments fetched successfully',
  FETCHED_ONE: 'Department fetched successfully',
  NOT_FOUND: 'Department not found',
  CODE_EXISTS: 'Department code already in use',
};

export const LECTURER_MESSAGES = {
  CREATED: 'Lecturer created successfully',
  REGISTERED: 'Registration successful. Your account is pending verification by your Head of Department.',
  VERIFIED: 'Lecturer verified successfully',
  ALREADY_VERIFIED: 'Lecturer is already verified',
  PENDING_VERIFICATION: 'Your lecturer account is pending verification by your Head of Department',
  UPDATED: 'Lecturer updated successfully',
  DELETED: 'Lecturer deleted successfully',
  FETCHED: 'Lecturers fetched successfully',
  FETCHED_ONE: 'Lecturer fetched successfully',
  NOT_FOUND: 'Lecturer not found',
  EMAIL_EXISTS: 'Lecturer email already in use',
  STAFF_ID_EXISTS: 'Staff ID already in use',
};

export const PUBLICATION_MESSAGES = {
  CREATED: 'Publication created successfully',
  UPDATED: 'Publication updated successfully',
  DELETED: 'Publication deleted successfully',
  FETCHED: 'Publications fetched successfully',
  FETCHED_ONE: 'Publication fetched successfully',
  NOT_FOUND: 'Publication not found',
};

export const LECTURE_NOTE_MESSAGES = {
  CREATED: 'Lecture note created successfully',
  UPDATED: 'Lecture note updated successfully',
  DELETED: 'Lecture note deleted successfully',
  FETCHED: 'Lecture notes fetched successfully',
  FETCHED_ONE: 'Lecture note fetched successfully',
  NOT_FOUND: 'Lecture note not found',
};

export const NEWS_MESSAGES = {
  CREATED: 'News created successfully',
  UPDATED: 'News updated successfully',
  DELETED: 'News deleted successfully',
  FETCHED: 'News fetched successfully',
  FETCHED_ONE: 'News fetched successfully',
  NOT_FOUND: 'News not found',
};

export const EVENT_MESSAGES = {
  CREATED: 'Event created successfully',
  UPDATED: 'Event updated successfully',
  DELETED: 'Event deleted successfully',
  FETCHED: 'Events fetched successfully',
  FETCHED_ONE: 'Event fetched successfully',
  NOT_FOUND: 'Event not found',
};

export const UPLOAD_MESSAGES = {
  SUCCESS: 'File uploaded successfully',
  FAILED: 'File upload failed',
  DELETED: 'File deleted successfully',
  NOT_FOUND: 'File not found',
  INVALID_TYPE: 'Invalid file type',
  TOO_LARGE: 'File too large',
};

export const DEAN_MESSAGES = {
  CREATED: 'Dean account created successfully',
  DELETED: 'Dean account deleted successfully',
  FETCHED: 'Dean fetched successfully',
  NOT_FOUND: 'Dean not found',
  ALREADY_EXISTS: 'A dean account already exists',
  CANNOT_DELETE_SELF: 'You cannot delete your own account',
  CANNOT_DELETE_SUPER_ADMIN: 'You cannot delete the super admin account',
};

export const ACADEMIC_SESSION_MESSAGES = {
  UPDATED: 'Academic session updated successfully',
  FETCHED: 'Academic session fetched successfully',
  NOT_FOUND: 'No active academic session found',
  LEVELS_UPDATED: 'Student levels updated successfully',
  INVALID_FORMAT: 'Session must be in format YYYY/YYYY (e.g. 2026/2027)',
  INVALID_YEARS: 'Session end year must be exactly one year after start year',
};

export const COMMON_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found',
  DEPARTMENT_ACCESS_DENIED: 'You can only access resources in your department',
};
