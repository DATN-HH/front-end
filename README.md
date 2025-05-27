# Menu+ Personnel Management System

A complete personnel management system for restaurants built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Authentication System**: Login, registration, and logout functionality
- **Dashboard**: Overview of restaurant operations with key metrics
- **Employee Management**: Manage staff information and roles
- **Role Management**: Define and manage job roles and permissions
- **Scheduling System**: Assign staff to shifts and manage schedules
- **Responsive Design**: Modern UI that works on all devices

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/          # Protected dashboard routes
│   │   ├── layout.tsx      # Dashboard layout with sidebar
│   │   ├── page.tsx        # Dashboard home page
│   │   ├── scheduling/     # Scheduling management
│   │   │   └── assign/     # Staff assignment to shifts
│   │   └── system/         # System management
│   │       ├── employees/  # Employee management
│   │       └── roles/      # Role management
│   ├── login/              # Authentication pages
│   ├── register/
│   ├── logout/
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/             # Reusable UI components
│   ├── ui/                 # shadcn/ui components
│   ├── common/             # Common components (header, sidebar, etc.)
│   └── Table/              # Table components
├── contexts/               # React contexts
├── features/               # Feature-based organization
│   ├── scheduling/         # Scheduling-related features
│   └── system/             # System management features
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and configurations
└── services/               # API services
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Update the environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8090/api
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🏗️ Architecture

### Routing Structure

- **Public Routes**: `/`, `/login`, `/register`
- **Protected Routes**: `/dashboard/*` (requires authentication)
- **Dashboard Layout**: Includes sidebar navigation and header

### Key Components

- **Dashboard Layout**: Provides consistent layout for all dashboard pages
- **Sidebar Navigation**: Easy access to all system features
- **Protected Routes**: Authentication-based route protection
- **Responsive Design**: Mobile-first approach

### State Management

- **React Query**: Server state management and caching
- **React Context**: Authentication and global state
- **Local State**: Component-level state with React hooks

## 🎨 UI/UX

- **Design System**: Built with shadcn/ui components
- **Styling**: Tailwind CSS for utility-first styling
- **Icons**: Lucide React for consistent iconography
- **Theme**: Support for light/dark mode

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔐 Authentication

- JWT-based authentication
- Protected routes with automatic redirection
- Token storage in localStorage
- Automatic token refresh

## 🚀 Deployment

The application can be deployed to any platform that supports Next.js:

- **Vercel** (recommended)
- **Netlify**
- **AWS**
- **Docker**

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📞 Support

For support and questions, please contact the development team.
