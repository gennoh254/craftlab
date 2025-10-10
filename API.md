# CraftLab API Documentation

This document describes the API endpoints and integration patterns for the CraftLab Career Development Platform with enhanced features including video uploads, social networking, and admin management.

## 🔗 Base Configuration

### API Base URL
```
Development: http://localhost:5000/api
Production: https://api.craftlab.com/api
```

### Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Authentication
All authenticated endpoints require a JWT token in the Authorization header:
```http
Authorization: Bearer <jwt_token>
```

## 📋 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  }
}
```

## 🔐 Authentication Endpoints

### Register User
Creates a new user account.

```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "userType": "attachee"
}
```

**User Types:**
- `attachee` - Industrial attachment seeker
- `intern` - Internship seeker
- `apprentice` - Apprenticeship participant
- `volunteer` - Volunteer participant
- `organization` - Company or institution

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id_here",
      "name": "John Doe",
      "email": "john@example.com",
      "userType": "attachee",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

### Login User
Authenticates a user and returns a JWT token.

```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id_here",
      "name": "John Doe",
      "email": "john@example.com",
      "userType": "attachee"
    },
    "token": "jwt_token_here"
  }
}
```

### Get Current User
Retrieves the current authenticated user's information.

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id_here",
      "name": "John Doe",
      "email": "john@example.com",
      "userType": "attachee",
      "profilePicture": "https://example.com/profile.jpg"
    }
  }
}
```

### Logout User
Invalidates the current user session.

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Refresh Token
Refreshes the JWT token.

```http
POST /api/auth/refresh
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data