# 4You Broadband Portal - Full Stack Setup Guide

A complete broadband management system with React frontend and Python (FastAPI) + MongoDB backend.

## 🏗️ Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Python FastAPI
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://python.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd 4you
```

### Step 2: MongoDB Setup

1. **Start MongoDB Server**:
   ```bash
   # On macOS (using Homebrew)
   brew services start mongodb-community

   # On Ubuntu/Linux
   sudo systemctl start mongod

   # On Windows
   # MongoDB should start automatically, or use MongoDB Compass
   ```

2. **Verify MongoDB is running**:
   ```bash
   mongosh
   # or
   mongo
   ```
   You should see the MongoDB shell. Type `exit` to quit.

### Step 3: Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create Python virtual environment**:
   ```bash
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate

   # On Windows
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   ```bash
   # The .env file is already created, but you can modify it
   # Edit backend/.env if you need to change MongoDB URL or other settings
   ```

5. **Seed the database with test data**:
   ```bash
   python seed_data.py
   ```

   This will create:
   - Test customer (mobile: 9876543210, password: password)
   - Test engineer (mobile: 8888888888, password: engineer)
   - Sample bills and tasks

6. **Start the backend server**:
   ```bash
   # Make sure you're in the backend directory
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   Backend will be running at: **http://localhost:8000**
   API Documentation: **http://localhost:8000/docs**

### Step 4: Frontend Setup

1. **Open a new terminal** and navigate to project root:
   ```bash
   cd /path/to/4you
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Start the frontend development server**:
   ```bash
   npm run dev
   ```

   Frontend will be running at: **http://localhost:5173**

## 🎯 Usage

### Customer Portal

1. Open **http://localhost:5173** in your browser
2. Select **Customer** role
3. Login with:
   - **Mobile**: 9876543210
   - **Password**: password
4. Features:
   - View current plan and bills
   - Pay overdue bills
   - Download invoices
   - View billing history

### Engineer Portal

1. Open **http://localhost:5173** in your browser
2. Select **Engineer** role
3. Login with:
   - **Mobile**: 8888888888
   - **Password**: engineer
4. Features:
   - Add new customers (KYC)
   - View installation tasks
   - Update task status (Pending → Scheduled → Completed)
   - Manage customer activations

## 📁 Project Structure

```
4you/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/        # API endpoints
│   │   │   │   ├── auth.py    # Authentication routes
│   │   │   │   ├── bills.py   # Bill management routes
│   │   │   │   └── tasks.py   # Task management routes
│   │   │   └── dependencies.py # Auth dependencies
│   │   ├── core/
│   │   │   ├── config.py      # App configuration
│   │   │   ├── database.py    # MongoDB connection
│   │   │   └── security.py    # JWT & password hashing
│   │   ├── schemas/           # Pydantic models
│   │   ├── services/          # Business logic
│   │   └── main.py           # FastAPI app entry point
│   ├── requirements.txt       # Python dependencies
│   ├── seed_data.py          # Database seeding script
│   └── .env                  # Environment variables
├── src/
│   ├── App.jsx               # Main React component
│   └── main.jsx              # React entry point
├── package.json              # Node.js dependencies
└── SETUP.md                  # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Bills (Customer only)
- `GET /api/bills` - Get all bills for current user
- `PATCH /api/bills/{bill_id}/pay` - Pay a bill

### Tasks (Engineer only)
- `GET /api/tasks` - Get all installation tasks
- `POST /api/tasks` - Create new task (adds customer)
- `PATCH /api/tasks/{task_id}/status` - Update task status

## 🛠️ Development

### Running Backend Tests

```bash
cd backend
python -m pytest
```

### Building for Production

**Frontend:**
```bash
npm run build
# Output will be in the dist/ directory
```

**Backend:**
```bash
# Set environment variables for production
# Use a production WSGI server like gunicorn
pip install gunicorn
gunicorn app.main:app --workers 4 --bind 0.0.0.0:8000
```

## 🔐 Security Notes

1. **Change the SECRET_KEY** in `backend/.env` before deploying to production
2. **Use strong passwords** for production users
3. **Configure CORS** properly in production
4. **Use HTTPS** in production
5. **Set up proper MongoDB authentication**

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongosh` or `mongo`
- Check MongoDB URL in `backend/.env`

### Port Already in Use
- Backend (8000): Kill process using `lsof -ti:8000 | xargs kill` (macOS/Linux)
- Frontend (5173): Kill process using `lsof -ti:5173 | xargs kill` (macOS/Linux)

### CORS Issues
- Ensure frontend URL is in `BACKEND_CORS_ORIGINS` in `backend/.env`
- Restart backend server after changing .env

### Module Not Found Errors (Python)
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again

### Module Not Found Errors (Node)
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## 📝 Creating New Users

### Via Engineer Portal (Recommended)
1. Login as engineer
2. Go to "New Customer KYC"
3. Fill in customer details
4. Customer can then login with their mobile and set password

### Via API
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9999999999",
    "name": "New User",
    "password": "newpassword",
    "role": "customer",
    "address": "123 Main St",
    "plan": "100 Mbps Standard"
  }'
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Need Help?** Open an issue on GitHub or contact the development team.
