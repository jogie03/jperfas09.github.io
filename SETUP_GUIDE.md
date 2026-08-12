# 🔧 QUICK START SETUP GUIDE

## Mabilis na Gabay sa Pag-setup ng Attendance Tracker

### STEP 1: Lumikha ng Firebase Project (5 minutes)

1. Pumunta sa https://console.firebase.google.com
2. Click "Create Project" o "Add Project"
3. Magpasok ng project name: "Attendance Tracker"
4. Click Continue
5. Disable Google Analytics (optional)
6. Click Create Project
7. Antayin ang project creation...

---

### STEP 2: I-enable ang Firebase Services (10 minutes)

#### A. Authentication
1. Left sidebar → **Authentication**
2. Click **Get Started**
3. Sign-in method → **Email/Password**
4. Enable toggle → Click **Save**

#### B. Firestore Database
1. Left sidebar → **Firestore Database**
2. Click **Create Database**
3. Start in **test mode**
4. Region: **asia-southeast1** (or nearest sa Philippines)
5. Click **Create**

#### C. Cloud Storage
1. Left sidebar → **Storage**
2. Click **Get Started**
3. Start in **test mode**
4. Select region: **asia-southeast1**
5. Click **Done**

---

### STEP 3: Kunin ang Firebase Credentials (5 minutes)

1. Go to **Project Settings** (⚙️ icon sa top)
2. Tab: **Your apps** → Click **Web** (</> icon)
3. Register app: "Attendance Tracker Web"
4. Click Register app
5. Copy ang ito:

```javascript
const firebaseConfig = {
    apiKey: "COPY_THIS",
    authDomain: "COPY_THIS",
    projectId: "COPY_THIS",
    storageBucket: "COPY_THIS",
    messagingSenderId: "COPY_THIS",
    appId: "COPY_THIS"
};
```

---

### STEP 4: I-update ang Config File (2 minutes)

1. Open file: `assets/js/config.js`
2. Replace ang:
   ```
   apiKey: "YOUR_API_KEY"
   authDomain: "YOUR_PROJECT_ID.firebaseapp.com"
   projectId: "YOUR_PROJECT_ID"
   storageBucket: "YOUR_PROJECT_ID.appspot.com"
   messagingSenderId: "YOUR_MESSAGING_SENDER_ID"
   appId: "YOUR_APP_ID"
   ```
   
   With ang inyong actual Firebase credentials

3. Save ang file

---

### STEP 5: Mag-run ng Application (2 minutes)

#### Option A: Using Python (Recommended)
```bash
# Windows
python -m http.server 8000

# Or if may Python 2
python -m SimpleHTTPServer 8000

# Linux/Mac
python3 -m http.server 8000
```

#### Option B: Using Node.js
```bash
npx http-server
```

#### Option C: Direct sa Browser
- Double-click `index.html`
- OR drag into browser

#### Access:
Open browser: `http://localhost:8000`

---

### STEP 6: Gumawa ng Admin Account (2 minutes)

1. Go sa http://localhost:8000
2. Click **"Mag-Register bilang Admin"**
3. Magpasok ng:
   - Email: `admin@example.com`
   - Password: `Password123`
4. Click **Mag-Register**
5. Mag-login gamit ang credentials

---

### STEP 7: I-test ang System (5 minutes)

#### A. I-register ang Employee
1. Login as admin
2. Go to **Employee Registration**
3. Fill in details:
   - Employee ID: `EMP001`
   - Name: `Juan Dela Cruz`
   - Department: `IT`
   - Position: `Developer`
4. Upload photo of face (clear photo, head-on)
5. Click **Mag-Register ng Employee**

#### B. Test Face Scan
1. Go to **Face Scan**
2. Click **Simulan ang Face Scan**
3. Allow camera access
4. Show face to camera
5. System should detect at record attendance

#### C. View Records
1. Go to **Attendance Records**
2. Should makita ang scanned attendance

---

## ✅ Troubleshooting

### "Cannot connect to Firebase"
- ❌ Check internet connection
- ❌ Verify config.js file
- ❌ Check Firebase credentials copied correctly

### "Camera not working"
- ❌ Check browser permissions (click 🔒 sa address bar)
- ❌ Try different browser
- ❌ Ensure HTTPS or localhost

### "Face not detected"
- ❌ Ensure good lighting
- ❌ Face should be clearly visible
- ❌ Try different angle
- ❌ Upload bigger face photo

### "File upload failed"
- ❌ Check file size (max 5MB)
- ❌ Check internet connection
- ❌ Refresh page at try again

---

## 📁 File Structure

```
Jperfas/
├── index.html                    (Login page)
├── admin-register.html           (Admin registration)
├── dashboard.html                (Main dashboard)
├── attendance-scan.html          (Face recognition)
├── employee-registration.html    (Register employees)
├── attendance-records.html       (View records)
├── attendance-summary.html       (Reports & analytics)
│
├── assets/
│   ├── css/
│   │   └── style.css            (Styling)
│   │
│   └── js/
│       ├── config.js            (Firebase config - UPDATE THIS!)
│       ├── auth.js              (Authentication)
│       ├── face-recognition.js  (Face scanning)
│       ├── employee.js          (Employee management)
│       ├── attendance.js        (Records)
│       ├── dashboard.js         (Dashboard)
│       └── summary.js           (Reports)
│
└── README.md                     (Full documentation)
```

---

## 🎯 Key Passwords & Accounts

**Recommended Admin Credentials:**
- Email: `admin@yourcompany.com`
- Password: `SecurePassword123!`

---

## 🔐 Firestore Rules (Security)

Copy-paste sa Firestore → Rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 📞 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Blank page | Open browser console (F12), check errors |
| Login not working | Verify email/password, check Firebase auth enabled |
| Camera permission | Check browser settings, allow camera access |
| No face detected | Better lighting, larger face, clear photo |
| Slow upload | Check internet speed, file size |

---

## ✨ Tips for Best Results

1. **Clear Face Photos**: Minimum 200x200px face size
2. **Good Lighting**: Natural light works best
3. **One Person Per Photo**: No group photos
4. **Recent Photos**: Current employee appearance
5. **Test First**: Register yourself, then test scan
6. **Backup Data**: Regular export to CSV

---

## 🚀 You're All Set!

**Next Steps:**
1. Register your employees
2. Have them scan their face daily
3. Check attendance records regularly
4. Generate reports weekly/monthly

**Need Help?**
- Check README.md for detailed documentation
- Review browser console for error messages (F12)
- Verify all Firebase services are enabled

---

**Happy Attendance Tracking! 📋✨**
