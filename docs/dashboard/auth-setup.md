# Dashboard Authentication Setup

The dashboard is now protected with JWT authentication from the Ruby on Rails backend.

## How It Works

### Backend (Rails)
- Uses Devise with JWT authentication
- JWT tokens are returned in the `Authorization` response header on successful login
- Token expiration: 24 hours
- Protected endpoints require valid JWT token in `Authorization: Bearer <token>` header

### Frontend (Next.js Dashboard)
- AuthContext manages authentication state
- Tokens stored in both localStorage and cookies
- Middleware protects dashboard routes
- Automatic redirect to login if not authenticated

## Authentication Flow

1. **Login**: User enters credentials on `/[locale]/login`
2. **Token Storage**: JWT token received from backend is stored in:
   - localStorage (key: `authToken`)
   - Cookie (name: `authToken`, maxAge: 24 hours)
3. **Route Protection**: Middleware checks for token cookie:
   - If accessing `/dashboard/*` without token → redirect to `/login`
   - If accessing `/login` with token → redirect to `/dashboard`
4. **API Requests**: All authenticated API requests include `Authorization: Bearer <token>` header
5. **Logout**: Clears token from localStorage and cookies, redirects to login

## Key Components

### Shared Package
- `packages/shared/src/services/auth/api.ts` - Authentication API methods
- `packages/shared/src/services/auth/types.ts` - Auth TypeScript types

### Dashboard
- `src/contexts/AuthContext.tsx` - Auth state management
- `app/[locale]/login/page.tsx` - Login page
- `middleware.tsx` - Route protection
- `app/[locale]/dashboard/layout.tsx` - Includes logout button

### Backend
- `app/controllers/users/sessions_controller.rb` - Login/logout endpoints
- `app/controllers/users_controller.rb` - Current user endpoint
- `config/routes.rb` - Auth routes

## API Endpoints

### Login
```
POST /users/sign_in
Body: { "user": { "email": "...", "password": "..." } }
Response: { "success": true, "data": { "id": "...", "email": "...", "name": "...", "role": "..." } }
Header: Authorization: Bearer <jwt_token>
```

### Logout
```
DELETE /users/sign_out
Header: Authorization: Bearer <jwt_token>
Response: { "success": true, "message": "Sesión cerrada" }
```

### Current User
```
GET /users/current
Header: Authorization: Bearer <jwt_token>
Response: { "success": true, "data": { "id": "...", "email": "...", "name": "...", "role": "..." } }
```

## Usage in Components

```tsx
import { useAuth } from '@/src/contexts/AuthContext';

function MyComponent() {
  const { user, loading, login, logout, isAuthenticated } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return (
    <div>
      <p>Welcome {user.name || user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Environment Variables

Make sure these are set in your `.env` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
DEVISE_JWT_SECRET_KEY=your_secret_key_here
CORS_ORIGINS=http://localhost:3001,http://localhost:5173,http://localhost:3002
```

## Testing

1. Start the backend: `cd packages/backend && rails s`
2. Start the dashboard: `cd packages/dashboard && npm run dev`
3. Navigate to `http://localhost:3002`
4. You should be redirected to login
5. Enter valid credentials
6. Upon successful login, you'll be redirected to the dashboard
7. Click "Cerrar Sesión" to logout

## Security Notes

- Tokens are stored in httpOnly cookies for middleware protection
- Tokens are also in localStorage for API client access
- Middleware runs on every request to protect routes
- Token expiration is set to 24 hours
- On logout, both storage locations are cleared
