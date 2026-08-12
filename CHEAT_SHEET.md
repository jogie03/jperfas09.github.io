# 🎯 ATTENDANCE TRACKER - QUICK REFERENCE CHEAT SHEET

## 📋 System Overview

```
ATTENDANCE TRACKER - Face Recognition System
├─ LOGIN & AUTHENTICATION
├─ EMPLOYEE MANAGEMENT
├─ FACE RECOGNITION SCANNING
├─ ATTENDANCE RECORDS
├─ REPORTS & ANALYTICS
└─ ADMIN DASHBOARD
```

---

## 🔑 Key Access Points

### Admin Panel
```
URL: http://localhost:8000
Login: admin@yourcompany.com / Password
```

### Main Menu Options
1. **🔍 Face Scan** - Scan employee attendance
2. **📋 Attendance Records** - View/edit records
3. **👤 Employee Registration** - Register new employees
4. **📊 Summary/Reports** - View analytics
5. **📋 Dashboard** - View statistics

---

## 👥 User Types

### Admin
- [ ] Register employees
- [ ] Scan attendance
- [ ] View records
- [ ] Generate reports
- [ ] Edit records
- [ ] Export data

### Employee
- [ ] Scan face for attendance
- [ ] View own record

### System
- [ ] Automate Time In/Out
- [ ] Generate remarks
- [ ] Calculate statistics

---

## 🚀 Quick Start Commands

```bash
# Start application
cd d:\downloads\codes\Jperfas
python -m http.server 8000

# Open browser
http://localhost:8000

# Stop server
Press Ctrl+C
```

---

## 📁 Important Files

| File | Purpose | Update? |
|------|---------|---------|
| config.js | Firebase credentials | ✅ YES |
| style.css | Styling/Branding | ✅ Optional |
| index.html | Login page | ❌ No |
| dashboard.html | Main page | ❌ No |
| attendance-scan.html | Face scanning | ❌ No |

**⚠️ MUST UPDATE**: `assets/js/config.js`

---

## 🔑 Firebase Credentials Format

```javascript
{
  apiKey: "AIzaSy...",
  authDomain: "project.firebaseapp.com",
  projectId: "project-id",
  storageBucket: "project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
}
```

---

## 💾 Database Collections

### employees
- employeeId (unique)
- name
- department
- photoUrl
- faceDescriptor (array)

### attendance
- employeeId
- date
- timeIn
- timeOut
- status (Present/Late/Absent)
- totalHours
- remarks

### admins
- email
- role
- createdAt

---

## 🎨 Customization Guide

### Colors (in style.css)
```css
--primary: #0d6efd      /* Blue */
--success: #198754      /* Green */
--danger: #dc3545       /* Red */
--warning: #ffc107      /* Yellow */
--info: #0dcaf0         /* Cyan */
```

### Branding
1. Edit style.css for colors
2. Update navbar brand in HTML
3. Add custom logo in assets/

### Department Options
Edit in: `employee-registration.html`
```html
<option value="IT">IT/Teknolohiya</option>
<option value="HR">HR/Tao Resources</option>
<!-- Add more departments here -->
```

---

## 🔒 Firestore Security Rules

### Development (Test Mode)
```firestore
allow read, write: if request.auth != null;
```

### Production
```firestore
match /employees/{doc=**} {
  allow read: if request.auth != null;
  allow write: if isAdmin(request.auth.uid);
}
```

---

## ⏰ Attendance Logic

### Time In
- First scan of the day
- Before 9 AM = "Present"
- After 9 AM = "Late"

### Time Out
- After Time In exists
- Calculates hours worked
- Checks for undertime/overtime

### Automatic Status
```
Status Generation:
├─ Time In before 9 AM → Present
├─ Time In after 9 AM  → Late
├─ No scan             → Absent
├─ Both Times          → COMPLETED
└─ Error condition     → Error
```

---

## 📊 Report Types

### Daily Report
- Attendance by person
- Status breakdown
- Attendance percentage

### Weekly Report
- Department summary
- Overtime/Undertime totals
- Trends

### Monthly Report
- Employee statistics
- Department comparison
- Performance metrics

---

## 🛠️ Common Operations

### Register Employee
1. Go to Employee Registration
2. Fill form
3. Upload face photo
4. Click Submit

### Scan Attendance
1. Go to Face Scan
2. Click "Simulan ang Face Scan"
3. Allow camera
4. Show face to camera
5. System records attendance

### View Records
1. Go to Attendance Records
2. Set filters (optional)
3. Click Filter
4. Review data

### Export Data
1. Go to any page with table
2. Click Export CSV
3. Download file
4. Open in Excel/Sheets

### Edit Record
1. Go to Attendance Records
2. Click Edit on record
3. Modify values
4. Click Save

---

## ⚠️ Troubleshooting Quick Fixes

| Issue | Fix |
|-------|-----|
| Blank page | F12 → Check Console for errors |
| Cannot login | Check email/password, verify Firebase auth enabled |
| Face not detected | Better lighting, clear photo, try again |
| Camera not working | Check browser permissions, try different browser |
| Firebase error | Verify config.js has correct credentials |
| Upload failed | Check file size <5MB, check internet |
| No records shown | Check date filter, try reset filter |

---

## 🔗 Important URLs

| Page | URL Path |
|------|----------|
| Login | index.html |
| Register | admin-register.html |
| Dashboard | dashboard.html |
| Face Scan | attendance-scan.html |
| Employee Reg | employee-registration.html |
| Records | attendance-records.html |
| Reports | attendance-summary.html |

---

## 📱 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| F12 | Open Developer Console |
| Escape | Stop face scanning |
| Tab | Navigate between form fields |
| Enter | Submit form |

---

## 💡 Tips & Tricks

### For Better Face Recognition
- ✅ Use clear, recent photo
- ✅ Good lighting (natural light best)
- ✅ Head-on angle
- ✅ At least 200x200px face
- ✅ No sunglasses or hats

### For Better Performance
- ✅ Use Chrome browser (fastest)
- ✅ Close other browser tabs
- ✅ Check internet speed
- ✅ Refresh page if slow

### For Data Management
- ✅ Export CSV weekly
- ✅ Store backups safely
- ✅ Keep employee info updated
- ✅ Archive old records yearly

---

## 🔑 Default Roles & Permissions

### Admin
- ✅ Can register employees
- ✅ Can scan attendance
- ✅ Can view all records
- ✅ Can edit records
- ✅ Can export data
- ✅ Can generate reports

### Employee
- ⚠️ Can scan own attendance
- ❌ Cannot view records
- ❌ Cannot edit records

---

## 📞 Quick Support Checklist

When something goes wrong:

1. Check browser console (F12)
2. Verify internet connection
3. Refresh page
4. Check Firebase is running
5. Verify config.js
6. Try different browser
7. Restart local server
8. Check documentation

---

## 📈 Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Page Load | < 3 sec | ✅ |
| Face Detection | < 2 sec | ✅ |
| Record Lookup | < 1 sec | ✅ |
| Export CSV | < 10 sec | ✅ |
| Database Query | < 500ms | ✅ |

---

## 🎓 File Dependencies

```
index.html
├── bootstrap CSS
├── config.js (Firebase)
├── auth.js
└── style.css

attendance-scan.html
├── face-api.js (from CDN)
├── Firebase SDK
├── face-recognition.js
└── style.css

employee-registration.html
├── face-api.js (from CDN)
├── Firebase SDK
├── employee.js
└── style.css
```

---

## 📊 Data Export Format

### CSV Columns
```
Employee ID, Name, Department, Position, Date, Day,
Time In, Time Out, Hours Worked, Status, Late (min),
Undertime (min), Overtime (min), Remarks
```

---

## 🔐 What NOT to Do

❌ **Never:**
- Share Firebase credentials
- Commit credentials to Git
- Use production data in test mode
- Delete records without backup
- Modify security rules without testing
- Run multiple instances without coordination

---

## ✅ What TO Do

✅ **Always:**
- Backup data regularly
- Test changes locally first
- Keep documentation updated
- Monitor system performance
- Review attendance reports
- Update employee status
- Maintain security rules

---

## 📚 Quick Reference Links

| Resource | URL |
|----------|-----|
| Firebase Console | console.firebase.google.com |
| Bootstrap Docs | getbootstrap.com |
| Face-API Docs | github.com/vladmandic/face-api |
| This Project Docs | See README.md |

---

## 🎯 30-Second System Summary

**Attendance Tracker** is a web-based system that:
1. **Registers** employees with photos
2. **Scans** faces for attendance
3. **Records** Time In/Time Out automatically
4. **Stores** all data in Firebase
5. **Generates** reports and statistics
6. **Exports** data to CSV

**Key Features:**
- Real-time face recognition
- Automatic attendance recording
- Advanced reporting
- Employee management
- Admin dashboard

**Technologies:**
- HTML5, CSS3, JavaScript
- Face-API.js for recognition
- Firebase for backend
- Bootstrap for styling

---

## 🚀 Ready to Launch?

### Pre-Launch Checklist
- [ ] Updated config.js
- [ ] Tested locally
- [ ] Registered first admin
- [ ] Registered test employee
- [ ] Tested face scanning
- [ ] Generated first report
- [ ] Read documentation

### Go Live!
- [ ] Start server
- [ ] Inform users
- [ ] Begin scanning
- [ ] Monitor system
- [ ] Collect feedback

---

## 📞 Emergency Contacts

**System Down?**
→ Check Firebase status page

**Face Recognition Failed?**
→ Improve lighting, retry scan

**Data Lost?**
→ Check backups, contact Firebase support

---

**Keep this cheat sheet handy! 📋**

*Last Updated: 2026-08-12*
*System Version: 1.0*
*Status: Production Ready*
