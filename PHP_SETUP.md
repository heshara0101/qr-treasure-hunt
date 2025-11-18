# ⚡ PHP LIGHTWEIGHT PROJECT - QUICK START

## 🎯 What's New?

✅ **No Node.js needed** - Pure PHP backend
✅ **No Python needed** - Direct HTML files
✅ **Lightweight** - Only PHP + MySQL + HTML/CSS/JS
✅ **Your own SQL** - Use your database credentials
✅ **Free QR API** - Third-party service (no setup)

---

## 📋 REQUIREMENTS

### 1. PHP (7.4+)
```
If you have XAMPP, WAMP, or MAMP installed:
✅ PHP is already included
✅ MySQL is already included

If NOT: Download from https://www.php.net/downloads
```

### 2. MySQL Database
```
You need ONE of these:
  • XAMPP (includes Apache + PHP + MySQL)
  • WAMP (includes Apache + PHP + MySQL)
  • MAMP (Mac - includes Apache + PHP + MySQL)
  • Live hosting with MySQL support
```

### 3. Connection Details (You Provide)
```
Edit: api/config.php and update:
  - DB_HOST: Your database server
  - DB_USER: Your database username
  - DB_PASS: Your database password
  - DB_NAME: Name for the database (will be created)
```

---

## 🚀 SETUP STEPS

### Step 1: Install XAMPP (If you don't have PHP)
```
1. Download: https://www.apachefriends.org/download.html
2. Install and run
3. Click "Start" for Apache and MySQL
```

### Step 2: Configure Database Connection
```
1. Open: api/config.php
2. Update these lines:
   - DB_HOST = 'localhost'  (usually correct)
   - DB_USER = 'root'       (XAMPP default, change if needed)
   - DB_PASS = ''           (XAMPP default is empty)
   - DB_NAME = 'qr_treasure' (or any name you want)
3. Save file
```

### Step 3: Initialize Database
```
1. If using XAMPP:
   • Open browser: http://localhost/phpmyadmin/
   • Verify MySQL is running

2. Run initialization:
   • Open: http://localhost/qr-treasure-hunt/api/init-database.php
   • Should see: ✅ Database initialized successfully!
   
3. If error, check:
   • MySQL is running (check XAMPP control panel)
   • Database credentials in api/config.php
   • PHP can access database
```

### Step 4: Test Backend
```
1. Visit: http://localhost/qr-treasure-hunt/api/auth.php?action=health
   (Should show: {"success": true})

2. Test login:
   POST to: http://localhost/qr-treasure-hunt/api/auth.php?action=login
   Body: {"email":"admin@example.com","password":"admin123"}
```

### Step 5: Open Frontend
```
1. Open browser to: http://localhost/qr-treasure-hunt/
2. You should see the login page
3. Login with:
   - Email: admin@example.com
   - Password: admin123
   - Role: Admin
```

---

## 📁 PROJECT STRUCTURE

```
qr-treasure-hunt/
├── api/                          ← 🔌 PHP Backend
│   ├── config.php               ← Database config (EDIT THIS!)
│   ├── database.php             ← DB connection
│   ├── init-database.php        ← Initialize DB (run once)
│   ├── auth.php                 ← Login/Register
│   ├── events.php               ← Create events
│   ├── progress.php             ← Track progress
│   └── admin.php                ← Admin features
├── js/
│   ├── php-api.js              ← 🆕 API client for PHP backend
│   ├── auth.js                 ← Authentication UI
│   ├── user-main.js            ← User dashboard
│   ├── admin-main.js           ← Admin dashboard
│   └── ...other files
├── css/
│   ├── style.css
│   ├── admin.css
│   └── user.css
├── index.html                   ← Main page
├── login.html                   ← Login page
├── register.html                ← Register page
├── admin/
│   └── dashboard.html          ← Admin dashboard
└── user/
    └── dashboard.html          ← User dashboard
```

---

## 🔑 DEFAULT CREDENTIALS

```
Email:    admin@example.com
Password: admin123
Role:     Admin
```

After setup, create a new password for security!

---

## 🛠️ TROUBLESHOOTING

### ❌ "Page not found"
```
1. Make sure PHP files are in: C:\xampp\htdocs\qr-treasure-hunt\
2. Apache should be running (green in XAMPP)
3. URL should be: http://localhost/qr-treasure-hunt/
```

### ❌ "Cannot connect to database"
```
1. Check MySQL is running (green in XAMPP)
2. Verify config.php has correct credentials
3. Check database name in config.php
```

### ❌ "API returns error"
```
1. Check browser console (F12) for error details
2. Verify all PHP files are in api/ folder
3. Make sure .php files are PHP, not text
4. Check api/config.php for database credentials
```

### ❌ "Database already exists"
```
If you run init-database.php twice:
1. Go to: http://localhost/phpmyadmin/
2. Delete the old database
3. Run init-database.php again
```

---

## 📝 HOW TO USE

### For Admin:
```
1. Login as admin
2. Go to Admin Dashboard
3. Create Event
4. Add Levels (1, 2, 3, etc.)
5. Add Tasks with questions
6. System auto-generates QR codes
7. Share event with users
8. View results in real-time
```

### For Users:
```
1. Register new account
2. Login
3. Join Event (from list)
4. Scan QR codes
5. Answer questions
6. Track progress
7. See results
```

---

## 📊 DATA STORAGE

```
All data is saved in:
  • MySQL Database: qr_treasure
  • Tables: users, events, levels, tasks, progress, etc.
  • Data persists permanently
  • Can backup using phpMyAdmin
```

---

## 🔌 API ENDPOINTS

### Authentication
```
POST   /api/auth.php?action=register    → Register user
POST   /api/auth.php?action=login       → Login
GET    /api/auth.php?action=get-user    → Get current user
```

### Events
```
POST   /api/events.php?action=create    → Create event
GET    /api/events.php?action=list      → List events
GET    /api/events.php?action=get       → Get event details
POST   /api/events.php?action=add-level → Add level
POST   /api/events.php?action=add-task  → Add task
```

### Progress
```
POST   /api/progress.php?action=join-event → Join event
POST   /api/progress.php?action=submit-answer → Submit answer
GET    /api/progress.php?action=get-results → Get results
```

### Admin
```
GET    /api/admin.php?action=get-event-results → View results
GET    /api/admin.php?action=get-all-users    → List users
```

---

## 💡 CUSTOMIZATION

### Change Database Name
```
Edit: api/config.php
Change: define('DB_NAME', 'your_database_name');
```

### Change JWT Secret
```
Edit: api/config.php
Change: define('JWT_SECRET', 'your_new_secret_key');
```

### Change Default Admin
```
1. After init-database.php, the default admin is created
2. You can change password by logging in
3. Or run SQL: UPDATE users SET password = ... WHERE id = 1
```

---

## 🌐 DEPLOY TO LIVE SERVER

### Upload to Hosting
```
1. Get FTP credentials from host
2. Upload all files (except .env) to your web root
3. Create database on host
4. Update api/config.php with host credentials
5. Run: http://yoursite.com/qr-treasure-hunt/api/init-database.php
```

### Change URLs
```
In HTML files, change:
FROM: http://localhost/qr-treasure-hunt/
TO:   https://yoursite.com/qr-treasure-hunt/
```

---

## 📞 SUPPORT FILES

- **BACKEND_SETUP.md** - Detailed backend setup
- **API_REFERENCE.md** - All API endpoints
- **DATABASE_SCHEMA.md** - Database structure

---

## ✨ KEY FEATURES

✅ No dependencies to install
✅ Runs on any PHP hosting
✅ SQLite or MySQL support
✅ Lightweight (~50KB code)
✅ Secure JWT authentication
✅ Real-time progress tracking
✅ QR code generation
✅ Admin dashboard
✅ User dashboard
✅ Responsive design

---

## 🎯 NEXT STEPS

1. ✅ Install XAMPP/PHP
2. ✅ Edit api/config.php
3. ✅ Run init-database.php
4. ✅ Open http://localhost/qr-treasure-hunt/
5. ✅ Login and start using!

**You're ready to go!** 🚀
