# ⚡ PHP PROJECT - QUICK REFERENCE CARD

## 🚀 START IN 3 STEPS

### Step 1: Install
```
Download: https://www.apachefriends.org/download.html
Install XAMPP
Run: Start Apache + MySQL in XAMPP Control Panel
```

### Step 2: Configure
```
Edit: api/config.php
Update: DB_HOST, DB_USER, DB_PASS, DB_NAME
Save
```

### Step 3: Launch
```
Visit: http://localhost/phpmyadmin/
Verify MySQL is green
Visit: http://localhost/qr-treasure-hunt/api/init-database.php
See: ✅ Database initialized successfully!
```

---

## 🔐 LOGIN CREDENTIALS

```
Email:    admin@example.com
Password: admin123
Role:     Select "Admin Login"
```

---

## 📍 IMPORTANT URLS

| Purpose | URL |
|---------|-----|
| Main App | http://localhost/qr-treasure-hunt/ |
| phpMyAdmin | http://localhost/phpmyadmin/ |
| Initialize DB | http://localhost/qr-treasure-hunt/api/init-database.php |
| Test Console | http://localhost/qr-treasure-hunt/test-php-api.html |

---

## 📁 KEY FILES TO EDIT

```
api/config.php          ← Database credentials (MOST IMPORTANT!)
js/php-api.js           ← API client (if changing API URL)
login.html              ← Already updated ✅
register.html           ← Already updated ✅
```

---

## 🔌 API ENDPOINTS (20+)

### Auth (3)
```
POST   api/auth.php?action=register
POST   api/auth.php?action=login
GET    api/auth.php?action=get-user
```

### Events (5)
```
POST   api/events.php?action=create
GET    api/events.php?action=list
GET    api/events.php?action=get
POST   api/events.php?action=add-level
POST   api/events.php?action=add-task
```

### Progress (5)
```
POST   api/progress.php?action=join-event
GET    api/progress.php?action=get-progress
POST   api/progress.php?action=submit-answer
GET    api/progress.php?action=scan-qr
GET    api/progress.php?action=get-results
```

### Admin (4)
```
GET    api/admin.php?action=get-event-results
GET    api/admin.php?action=get-all-users
GET    api/admin.php?action=get-user-detail
GET    api/admin.php?action=get-event-stats
```

---

## 📊 DATABASE TABLES (8)

```
users              → User accounts
events             → Events
levels             → Levels in events
tasks              → Questions with QR codes
user_events        → User enrollments
completed_tasks    → Submitted answers
progress           → Real-time tracking
wrong_qr_scans     → Invalid QR codes
```

---

## 🔒 SECURITY

✅ Passwords: bcrypt hashing (10 rounds)
✅ Authentication: JWT tokens (7-day expiry)
✅ Input: SQL injection protection (prepared statements)
✅ API: CORS enabled

⚠️ Change JWT_SECRET in api/config.php before production!

---

## ❌ TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| "Page not found" | Copy files to C:\xampp\htdocs\qr-treasure-hunt\ |
| "Database error" | Check MySQL is running (green in XAMPP) |
| "Cannot connect" | Verify DB credentials in api/config.php |
| "Init fails" | Make sure MySQL is running first |
| "QR not generated" | Check internet (uses qrserver.com API) |

---

## 📚 DOCUMENTATION

```
PHP_SETUP.md              ← Detailed setup guide
PHP_PROJECT_SUMMARY.md    ← Project overview
test-php-api.html         ← Test console (browser)
api/*.php                 ← API code (well-commented)
js/php-api.js             ← JavaScript client library
```

---

## ✨ FEATURES

✅ No npm install
✅ No Node.js
✅ Lightweight (~5KB)
✅ Easy hosting
✅ Your own database
✅ Free QR API
✅ Secure auth
✅ Real-time tracking
✅ Mobile ready
✅ Production ready

---

## 🎯 WORKFLOW

```
Admin:
  Login → Create Event → Add Levels → Add Tasks 
  → Get auto QR codes → Share → View results

Users:
  Register → Login → Join Event → Scan QR 
  → Answer → Track → See results
```

---

## 💡 TIPS

- Keep XAMPP running while using app
- Use test-php-api.html to test endpoints
- Check browser console (F12) for errors
- Backup database regularly via phpMyAdmin
- Change default password after first login
- Deploy to live hosting when ready

---

## 🌐 DEPLOY TO LIVE

```
1. FTP upload all files
2. Create MySQL database
3. Update api/config.php
4. Run: site.com/api/init-database.php
5. Update URL in JavaScript
6. Done!
```

---

## 📞 QUICK HELP

**Can't login?**
- Check MySQL is running
- Verify api/config.php database settings
- Try default: admin@example.com / admin123

**API not responding?**
- Check all PHP files in api/ folder
- Verify .php files aren't text files
- Check apache error log in XAMPP

**Database already exists?**
- Delete via phpMyAdmin
- Or rename database in config.php

---

## 🎉 READY TO GO!

Your lightweight PHP + MySQL app is ready to use!

```
Visit: http://localhost/qr-treasure-hunt/
Login: admin@example.com / admin123
```

**Happy coding!** 🚀
