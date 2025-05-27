# Menu+ Management System

A comprehensive restaurant management system with both Planning and Menu modules.

## Features

### Authentication
- User login/registration system
- Protected routes requiring authentication
- Automatic redirection based on authentication status

### Planning Module
- Staff scheduling and management
- Role-based access control
- Time-off request management
- Employee portal
- Shift planning and assignment

### Menu Module
- Product management with full CRUD operations
- POS category organization with hierarchical structure
- Advanced filtering and sorting capabilities
- Pagination for large datasets
- Product attributes (coming soon)
- Kitchen printer configuration (coming soon)

## Project Structure

```
front-end/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── page.tsx                    # Module selection dashboard
│   │   │   ├── planning/
│   │   │   │   └── page.tsx               # Planning module overview
│   │   │   ├── menu/
│   │   │   │   ├── page.tsx               # Menu module overview
│   │   │   │   ├── products/
│   │   │   │   │   └── page.tsx           # Product management
│   │   │   │   ├── pos-categories/
│   │   │   │   │   └── page.tsx           # POS category management
│   │   │   │   ├── attributes/
│   │   │   │   │   └── page.tsx           # Product attributes (placeholder)
│   │   │   │   └── kitchen-printers/
│   │   │   │       └── page.tsx           # Kitchen printer config (placeholder)
│   │   │   ├── scheduling/                # Planning module features
│   │   │   └── system/                    # System administration
│   │   ├── login/
│   │   └── register/
│   ├── components/
│   │   ├── common/
│   │   │   ├── sidebar.tsx                # Navigation sidebar
│   │   │   └── header.tsx                 # Top header
│   │   └── ui/                            # Reusable UI components
│   ├── contexts/
│   │   └── auth-context.tsx               # Authentication context
│   └── middleware.ts                      # Route protection middleware
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Open [http://localhost:3000](http://localhost:3000)
   - You'll be redirected to login if not authenticated
   - After login, you'll see the module selection dashboard

## Authentication Flow

1. **Unauthenticated users** are redirected to `/login`
2. **Successful login** sets both localStorage token and auth cookie
3. **Authenticated users** are redirected to `/dashboard` (module selection)
4. **Module selection** allows access to Planning or Menu modules
5. **Logout** clears tokens and redirects to login

## Module Navigation

### Planning Module (`/dashboard/planning`)
- Personnel management and scheduling
- Staff role management
- Time-off requests
- Schedule overview and assignment

### Menu Module (`/dashboard/menu`)
- Product management with advanced features
- POS category organization
- Product attributes (coming soon)
- Kitchen printer configuration (coming soon)

## Key Features

### Product Management
- **Advanced filtering:** By type, category, status, and POS availability
- **Sorting:** By name, price, cost, and creation date
- **Pagination:** Configurable items per page (5, 10, 20, 30, 50)
- **Search:** Real-time product name search
- **Actions:** View, edit, archive/unarchive products

### POS Categories
- **Hierarchical structure:** Parent and child categories
- **Sequence management:** Move categories up/down
- **Product count tracking:** Shows number of products per category
- **Advanced filtering:** By category level and parent category

### Security
- **Route protection:** Middleware ensures authentication for dashboard routes
- **Token management:** Dual storage (localStorage + cookies) for reliability
- **Automatic logout:** On token expiration or verification failure

## Technology Stack

- **Framework:** Next.js 15 with App Router
- **UI Components:** Radix UI + Tailwind CSS
- **State Management:** React Context API
- **Authentication:** JWT tokens with cookie-based middleware
- **Icons:** Lucide React
- **Styling:** Tailwind CSS with custom design system

## Development Notes

- The system prioritizes front-end code when merging conflicts
- Authentication is required for all dashboard functionality
- Module-based navigation provides clear separation of concerns
- Responsive design works on desktop and mobile devices
- Toast notifications provide user feedback for all actions

## Future Enhancements

- Complete product attributes functionality
- Kitchen printer configuration
- Advanced reporting and analytics
- Mobile app integration
- Real-time notifications
- Multi-language support
