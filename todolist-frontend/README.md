# TodoList Frontend

A modern React frontend for the TodoList application built with Vite, Tailwind CSS, React Router, and RTK Query.

## Features

- 🔐 User Authentication (Login/Signup)
- ✅ Task Management (Create, Read, Update, Delete)
- 🔍 Task Search and Filtering
- 📊 Task Statistics Dashboard
- 👤 User Profile Management
- 🛡️ Admin Panel (for super admins)
- 🎨 Modern UI with Tailwind CSS v3
- ⚡ Fast and responsive design

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS v3** - Styling
- **React Router v6** - Routing
- **Redux Toolkit (RTK Query)** - State management and API calls
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend server running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3001`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components (Navbar, etc.)
│   └── tasks/          # Task-related components
├── pages/              # Page components
├── store/              # Redux store
│   ├── api/           # RTK Query API slices
│   └── slices/        # Redux slices
├── App.jsx            # Main App component
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env` file if needed:

```
VITE_API_URL=http://localhost:3000
```

## Features Overview

### Authentication
- User signup and login
- Token-based authentication
- Protected routes
- Auto token verification

### Task Management
- Create, edit, and delete tasks
- Filter by status and priority
- Search tasks
- Sort tasks
- Bulk operations
- Task statistics

### User Profile
- Update profile information
- Change password

### Admin Panel
- View all users
- Update user status (active/pending/banned)
- View admin statistics

