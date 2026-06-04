# DayFlow HRMS - Available Commands Reference

## 📋 Quick Command Reference

### Windows Users

#### Installation
```cmd
# Automated installation (RECOMMENDED)
install.bat

# Manual installation
cd backend
npm install
cd ..\frontend
npm install
```

#### Starting the Application
```cmd
# Automated startup (RECOMMENDED)
start-dayflow.bat

# Manual startup - Backend
cd backend
npm run dev

# Manual startup - Frontend (in separate terminal)
cd frontend
npm start
```

### Mac/Linux Users

#### Installation
```bash
# Automated installation (RECOMMENDED)
chmod +x install.sh
./install.sh

# Manual installation
cd backend
npm install
cd ../frontend
npm install
```

#### Starting the Application
```bash
# Automated startup (RECOMMENDED)
chmod +x start-dayflow.sh
./start-dayflow.sh

# Manual startup - Backend
cd backend
npm run dev

# Manual startup - Frontend (in separate terminal)
cd frontend
npm start
```

## 🛠️ Development Commands

### Backend Commands (from /backend directory)

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Install a new package
npm install <package-name>

# Update all packages
npm update
```

### Frontend Commands (from /frontend directory)

```bash
# Start development server
npm start

# Create production build
npm run build

# Run tests
npm test

# Install a new package
npm install <package-name>
```

## 🗄️ MongoDB Commands

### Windows
```cmd
# Start MongoDB
net start MongoDB

# Stop MongoDB
net stop MongoDB

# Check status - Go to Services (Win+R, type services.msc)
```

### Mac/Linux
```bash
# Start MongoDB
sudo systemctl start mongod

# Stop MongoDB
sudo systemctl stop mongod

# Check status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

### MongoDB Shell
```bash
# Connect to MongoDB
mongosh

# Show databases
show dbs

# Use DayFlow database
use dayflow

# Show collections
show collections

# View all employees
db.employees.find()

# Count documents
db.employees.countDocuments()

# Exit MongoDB shell
exit
```

## 🧹 Cleanup Commands

### Clear node_modules and reinstall

**Backend:**
```bash
cd backend
rm -rf node_modules package-lock.json  # Mac/Linux
# OR
rmdir /s node_modules && del package-lock.json  # Windows
npm install
```

**Frontend:**
```bash
cd frontend
rm -rf node_modules package-lock.json  # Mac/Linux
# OR
rmdir /s node_modules && del package-lock.json  # Windows
npm install
```

### Clear MongoDB database
```bash
mongosh
use dayflow
db.dropDatabase()
exit
```

## 🔧 Environment Configuration

### Backend Environment Variables (.env)
```bash
# Edit backend/.env file
notepad backend\.env  # Windows
nano backend/.env     # Mac/Linux
```

**Required Variables:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dayflow
JWT_SECRET=your_secret_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
```

## 🌐 Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React app |
| Backend API | http://localhost:5000 | Express server |
| API Health | http://localhost:5000/api/health | Health check |
| MongoDB | mongodb://localhost:27017 | Database |

## 📡 Testing API Endpoints

### Using curl

**Check server health:**
```bash
curl http://localhost:5000/api/health
```

**Sign up:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP001",
    "email": "test@test.com",
    "password": "test123",
    "firstName": "Test",
    "lastName": "User",
    "role": "Employee"
  }'
```

**Sign in:**
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "test123"
  }'
```

### Using Postman or Thunder Client

Import the following base URL: `http://localhost:5000/api`

**Headers for authenticated requests:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

## 🐛 Debugging Commands

### Check if ports are in use

**Windows:**
```cmd
netstat -ano | findstr :5000
netstat -ano | findstr :3000
```

**Mac/Linux:**
```bash
lsof -i :5000
lsof -i :3000
```

### Kill process on port

**Windows:**
```cmd
# Find PID from netstat command, then:
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Kill process on port 5000
kill -9 $(lsof -ti:5000)

# Kill process on port 3000
kill -9 $(lsof -ti:3000)
```

### View logs

**Backend logs:**
```bash
cd backend
# Logs appear in the terminal running npm run dev
```

**Frontend logs:**
- Open browser console (F12)
- Or check terminal running npm start

## 🚀 Production Build

### Build frontend for production
```bash
cd frontend
npm run build

# Files will be in frontend/build/
```

### Run backend in production mode
```bash
cd backend
NODE_ENV=production npm start
```

## 📦 Package Management

### Check for outdated packages

**Backend:**
```bash
cd backend
npm outdated
```

**Frontend:**
```bash
cd frontend
npm outdated
```

### Update packages
```bash
# Update all packages
npm update

# Update specific package
npm update <package-name>

# Install latest version
npm install <package-name>@latest
```

## 🔍 Useful npm Commands

```bash
# View installed packages
npm list --depth=0

# Check npm version
npm --version

# Clear npm cache
npm cache clean --force

# Audit for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## 🎯 Git Commands (If using version control)

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit"

# Create .gitignore (already provided)
# It excludes node_modules, .env, etc.

# Push to GitHub
git remote add origin <your-repo-url>
git push -u origin main
```

## 📊 Database Backup

### Backup MongoDB database
```bash
mongodump --db dayflow --out ./backup

# Restore from backup
mongorestore --db dayflow ./backup/dayflow
```

## 🔒 Security Commands

### Generate new JWT secret
```bash
# Generate random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copy output and paste into backend/.env as JWT_SECRET
```

## 📱 Mobile Testing

### Access from mobile device (same network)

1. Find your computer's IP address:

**Windows:**
```cmd
ipconfig
# Look for IPv4 Address
```

**Mac/Linux:**
```bash
ifconfig
# Look for inet address
```

2. On mobile browser, open: `http://<your-ip>:3000`

Example: `http://192.168.1.100:3000`

---

## 🆘 Emergency Commands

### Complete reset (start fresh)

```bash
# Stop all servers (Ctrl+C in terminals)

# Delete all node_modules
cd backend
rm -rf node_modules package-lock.json
cd ../frontend
rm -rf node_modules package-lock.json

# Reinstall everything
cd ..
# Windows: install.bat
# Mac/Linux: ./install.sh

# Clear MongoDB database
mongosh
use dayflow
db.dropDatabase()
exit

# Restart everything
# Windows: start-dayflow.bat
# Mac/Linux: ./start-dayflow.sh
```

---

## 💡 Pro Tips

1. **Always start MongoDB first** before starting the backend
2. **Use separate terminals** for backend and frontend
3. **Check logs** if something doesn't work
4. **Clear browser cache** if UI doesn't update
5. **Restart servers** after changing .env files

---

Need more help? Check:
- [START_HERE.md](START_HERE.md) - Getting started guide
- [README.md](README.md) - Full documentation
- [QUICKSTART.md](QUICKSTART.md) - Quick setup
