# TodoList Full-Stack Application

A modern, feature-rich todo list application with mind mapping capabilities, built with React and Node.js. Manage your tasks efficiently with an intuitive interface, powerful filtering, and visualize your ideas with interactive mind maps.

![TodoList App](https://img.shields.io/badge/Status-Active-success)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue)

## ✨ Features

### 📋 Task Management
- **Create, Edit, and Delete Tasks** - Full CRUD operations for task management
- **Multiple Views** - Switch between Kanban board and grid view
- **Priority Levels** - Organize tasks with low, medium, high, and urgent priorities
- **Status Tracking** - Track tasks through pending, in progress, completed, and cancelled states
- **Due Dates** - Set and track due dates for your tasks
- **Advanced Filtering** - Filter by status, priority, due date, and overdue tasks
- **Search Functionality** - Quick search across all your tasks
- **Bulk Operations** - Delete or update multiple tasks at once
- **Task Statistics** - Beautiful dashboard with visual statistics and completion rates

### 🧠 Mind Mapping
- **Interactive Mind Maps** - Create and edit mind maps with an intuitive drag-and-drop interface
- **Visual Node Editor** - Add, connect, and organize nodes visually
- **Multiple Mind Maps** - Create and manage unlimited mind maps
- **Search & Filter** - Quickly find your mind maps
- **Visual Previews** - See previews of your mind maps before opening
- **Real-time Editing** - Save your work and continue later

### 🔐 Authentication & Security
- **User Registration & Login** - Secure authentication system
- **JWT Token-based Auth** - Industry-standard security
- **Protected Routes** - Secure access to authenticated pages
- **Password Encryption** - Bcrypt password hashing
- **Session Management** - Automatic token verification

### 👤 User Management
- **Profile Management** - Update your profile information
- **Password Change** - Secure password update functionality
- **User Status** - Active, pending, and banned user states

### 🛡️ Admin Panel
- **User Management** - View and manage all users (Super Admin only)
- **User Status Control** - Activate, deactivate, or ban users
- **Admin Statistics** - Overview of all users and system stats

### 🎨 User Interface
- **Modern Design** - Clean, modern UI with Tailwind CSS
- **Responsive Layout** - Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Ready** - UI designed for easy theme switching
- **Smooth Animations** - Polished transitions and hover effects
- **Toast Notifications** - User-friendly feedback for all actions

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Redux Toolkit** - State management with RTK Query
- **React Router v6** - Client-side routing
- **Tailwind CSS v3** - Utility-first CSS framework
- **React Flow** - Interactive mind map visualization
- **Lucide React** - Beautiful icon library
- **React Hot Toast** - Elegant notifications
- **@dnd-kit** - Drag and drop functionality

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **Swagger** - API documentation

## 📦 Installation

### Prerequisites
- **Node.js** 16+ and npm (or yarn)
- **PostgreSQL** 12+ installed and running
- **Git** for cloning the repository

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd todo-list-full-stack
```

### Step 2: Backend Setup

1. Navigate to the backend directory:
```bash
cd todolist-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `todolist-backend` directory:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todolist_db
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password

# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:3001

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Environment
NODE_ENV=development
```

4. Create the PostgreSQL database:
```sql
CREATE DATABASE todolist_db;
```

5. Start the backend server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The backend API will be available at `http://localhost:3000`
API documentation (Swagger) will be available at `http://localhost:3000/api-docs`

### Step 3: Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd todolist-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `todolist-frontend` directory (optional):
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3001`

## 🎯 Quick Start Guide

### 1. Create Your Account
1. Navigate to `http://localhost:3001`
2. Click "Sign Up" to create a new account
3. Fill in your details and submit

### 2. Create Your First Task
1. After logging in, you'll see the Dashboard
2. Click "New Task" button
3. Fill in the task details (title, description, priority, due date)
4. Click "Create Task"

### 3. Create Your First Mind Map
1. Click "Mind Maps" in the sidebar
2. Click "New Mind Map"
3. Enter a title and description
4. Click "Add Node" to start building your mind map
5. Connect nodes by dragging from one node to another
6. Click "Save" when done

### 4. Explore Features
- **Filter Tasks**: Use the filter bar to filter by status, priority, or due date
- **Search**: Use the search bar to quickly find tasks
- **View Modes**: Switch between Kanban and Grid views
- **Statistics**: Check the dashboard for task statistics
- **Profile**: Update your profile in the Profile page

## 📁 Project Structure

```
todo-list-full-stack/
├── todolist-backend/          # Backend API
│   ├── config/               # Configuration files
│   │   ├── database.js      # Database connection
│   │   └── swagger.js        # API documentation config
│   ├── controllers/         # Request handlers
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   ├── mindMapController.js
│   │   ├── userController.js
│   │   └── adminController.js
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js         # Authentication middleware
│   │   ├── errorHandler.js # Error handling
│   │   └── validation.js    # Input validation
│   ├── models/             # Database models
│   │   ├── userModel.js
│   │   ├── taskModel.js
│   │   └── mindMapModel.js
│   ├── routes/             # API routes
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── mindMapRoutes.js
│   │   ├── userRoutes.js
│   │   └── adminRoutes.js
│   ├── services/           # Business logic
│   ├── app.js             # Express app setup
│   └── package.json
│
└── todolist-frontend/       # Frontend React App
    ├── src/
    │   ├── components/     # Reusable components
    │   │   ├── auth/      # Login, Signup
    │   │   ├── layout/    # Navbar, ProtectedRoute
    │   │   └── tasks/     # Task-related components
    │   ├── pages/         # Page components
    │   │   ├── Dashboard.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Admin.jsx
    │   │   ├── MindMaps.jsx
    │   │   └── MindMapEditor.jsx
    │   ├── store/         # Redux store
    │   │   ├── api/      # RTK Query API slices
    │   │   └── slices/   # Redux slices
    │   ├── App.jsx       # Main app component
    │   └── main.jsx      # Entry point
    └── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Update task status
- `GET /api/tasks/stats` - Get task statistics
- `GET /api/tasks/search?q=query` - Search tasks
- `DELETE /api/tasks/bulk` - Bulk delete tasks
- `PATCH /api/tasks/bulk/status` - Bulk update status

### Mind Maps
- `GET /api/mindmaps` - Get all mind maps
- `GET /api/mindmaps/:id` - Get mind map by ID
- `POST /api/mindmaps` - Create new mind map
- `PUT /api/mindmaps/:id` - Update mind map
- `DELETE /api/mindmaps/:id` - Delete mind map

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Change password

### Admin (Super Admin Only)
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/status` - Update user status
- `GET /api/admin/stats` - Get admin statistics

**Full API Documentation**: Visit `http://localhost:3000/api-docs` when the server is running.

## 🔒 Default Admin Account

A super admin account is automatically created on first server start:
- **Email**: `admin@todoapp.com`
- **Password**: `admin123456`

⚠️ **Important**: Change the admin password immediately after first login in production!

## 🛠️ Available Scripts

### Backend
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🌐 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todolist_db
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3000
FRONTEND_URL=http://localhost:3001
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 📱 Features in Detail

### Task Management
- **Kanban Board**: Visualize tasks in columns (Pending, In Progress, Completed, Cancelled)
- **Grid View**: Card-based layout for easy browsing
- **Drag & Drop**: Reorder tasks in Kanban view
- **Smart Filtering**: Combine multiple filters for precise results
- **Bulk Actions**: Select and update multiple tasks at once
- **Overdue Tracking**: Automatically identify overdue tasks

### Mind Mapping
- **Node Creation**: Add unlimited nodes to your mind map
- **Connections**: Link related nodes with edges
- **Visual Editor**: Intuitive drag-and-drop interface
- **Auto-save**: Save your progress anytime
- **Visual Previews**: See your mind map structure at a glance
- **Search**: Find specific mind maps quickly

### Dashboard
- **Statistics Cards**: Beautiful cards showing task counts
- **Completion Rate**: Visual progress indicator
- **Color Coding**: Easy identification of task statuses
- **Real-time Updates**: Statistics update automatically

## 🐛 Troubleshooting

### Backend Issues
- **Database Connection Error**: Ensure PostgreSQL is running and credentials are correct
- **Port Already in Use**: Change the PORT in `.env` file
- **JWT Errors**: Verify JWT_SECRET is set in `.env`

### Frontend Issues
- **API Connection Error**: Check that backend is running on port 3000
- **Build Errors**: Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- **CORS Errors**: Verify FRONTEND_URL in backend `.env` matches your frontend URL

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Built with ❤️ for efficient task management and idea visualization.

## 🙏 Acknowledgments

- React Flow for mind map visualization
- Tailwind CSS for beautiful styling
- All the amazing open-source contributors

---

**Happy Coding! 🚀**

