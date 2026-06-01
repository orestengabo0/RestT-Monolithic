# API Integration Guide

## Overview

This project uses a centralized API integration system with authentication context for clean, reusable API calls throughout the application.

## Architecture

### 1. **API Client** (`src/lib/api-client.ts`)

A singleton HTTP client that handles all API communication with:

- **Automatic token management** - Stores and retrieves access/refresh tokens
- **Token refresh** - Automatically refreshes expired tokens
- **Request interceptors** - Adds authentication headers when needed
- **Error handling** - Centralized error handling with proper error messages
- **Type safety** - Full TypeScript support

#### Usage:

```typescript
import { apiClient } from "@/lib/api-client";

// Public endpoint (no auth)
const data = await apiClient.get("/public/data");

// Protected endpoint (requires auth)
const userData = await apiClient.get("/users/me", true);

// POST request
const result = await apiClient.post("/items", { name: "Item" }, true);

// PUT request
await apiClient.put("/items/123", { name: "Updated" }, true);

// DELETE request
await apiClient.delete("/items/123", true);
```

### 2. **Auth Context** (`src/contexts/AuthContext.tsx`)

React Context that provides authentication state and methods throughout the app.

#### Features:

- **User state management** - Tracks current user and authentication status
- **Login/Register/Logout** - Simplified auth methods
- **Auto token refresh** - Handles token refresh automatically
- **Loading states** - Provides loading state during auth operations

#### Usage:

```typescript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <button onClick={() => login(email, password)}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 3. **Environment Variables**

Configure the API base URL in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Authentication Flow

### Login Flow:

1. User submits credentials via login form
2. `useAuth().login()` is called
3. API client sends POST to `/auth/login`
4. Tokens are stored in localStorage
5. User state is updated
6. User is redirected to dashboard

### Token Refresh Flow:

1. API request returns 401 Unauthorized
2. API client automatically calls `/auth/refresh`
3. New tokens are stored
4. Original request is retried with new token
5. If refresh fails, user is redirected to login

### Logout Flow:

1. `useAuth().logout()` is called
2. Tokens are cleared from localStorage
3. User state is reset
4. User is redirected to login page

## Protected Routes

To protect a route, check authentication status:

```typescript
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <div>Protected content</div>;
}
```

## Making API Calls

### Example: Fetching User Data

```typescript
import { apiClient } from "@/lib/api-client";

async function fetchUserProfile() {
  try {
    const response = await apiClient.get<{ data: User }>("/users/me", true);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw error;
  }
}
```

### Example: Creating a Resource

```typescript
import { apiClient } from "@/lib/api-client";

async function createItem(name: string) {
  try {
    const response = await apiClient.post<{ data: Item }>(
      "/items",
      { name },
      true // requires authentication
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create item:", error);
    throw error;
  }
}
```

## Benefits

✅ **Centralized** - All API logic in one place  
✅ **Type-safe** - Full TypeScript support  
✅ **Automatic token refresh** - No manual token management  
✅ **Error handling** - Consistent error handling across the app  
✅ **Reusable** - Easy to use in any component  
✅ **Testable** - Easy to mock for testing  
✅ **Maintainable** - Changes to API logic only need to be made once

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token

### Users

- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user profile
- `GET /users` - List all users (admin only)

## Error Handling

The API client automatically handles common errors:

- **401 Unauthorized** - Attempts token refresh, redirects to login if refresh fails
- **Network errors** - Throws descriptive error messages
- **API errors** - Extracts error message from response

Handle errors in your components:

```typescript
try {
  await apiClient.post("/items", data, true);
} catch (error) {
  if (error instanceof Error) {
    setError(error.message);
  }
}
```
