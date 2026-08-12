# 📋 Attendance Tracker - Face Recognition System

Isang **Attendance Tracker System na may Face Recognition** para awtomatikong makilala ang empleyado at ma-record ang kanyang attendance.

## 🚀 Mga Features

### 1. Face Recognition Attendance Scanning
- Real-time face detection gamit ang Face-API
- Automatic employee identification
- Time In / Time Out tracking
- Automatic remarks generation para sa late, absent, at iba pang scenarios

### 2. Employee Management
- Employee registration with photo/face capture
- Secure face descriptor storage para sa facial matching
- Employee information management (ID, Name, Department, Position)
- Photo upload with automatic face validation

### 3. Attendance Records
- Detailed attendance logging
- Filter by date, employee, status, at department
- Edit attendance records (para sa HR adjustments)
- Export to CSV
- Pagination support

### 4. Reports & Dashboard
- Daily, Weekly, at Monthly attendance summaries
- Attendance charts at statistics
- Department-wise attendance breakdown
- Attendance percentage calculation
- Real-time dashboard with today's summary

### 5. Admin System
- Admin registration at authentication
- Role-based access control
- Secure data management

## 🛠️ Installation & Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge)
- Firebase project account
- Internet connection

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project"
3. Enter project name (e.g., "Attendance Tracker")
4. Follow the setup wizard
5. Enable Google Analytics (optional)

### Step 2: Setup Firebase Services

#### Authentication
1. Sa Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** provider
4. Click **Save**

#### Firestore Database
1. Go to **Firestore Database**
2. Click **Create Database**
3. Choose **Start in test mode** (for development)
4. Select region (e.g., asia-southeast1 para sa Philippines)
5. Click **Create**

#### Cloud Storage
1. Go to **Cloud Storage**
2. Click **Get Started**
3. Start in test mode
4. Select same region
5. Click **Done**

### Step 3: Get Firebase Credentials

1. Go to **Project Settings** (⚙️ icon)
2. Click **Your apps**
3. Click the Web app registration (</> icon)
4. Copy the Firebase config object
5. It should look like:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Step 4: Update Firebase Configuration

1. Open `assets/js/config.js`
2. Replace the placeholder values with your Firebase credentials
3. Save the file

### Step 5: Setup Firestore Security Rules (Optional but Recommended)

1. Go to **Firestore Database** > **Rules**
2. Replace with:
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    match /admins/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### Step 6: Run the Application

1. Open `index.html` in your web browser
2. Or use a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   ```
3. Access at `http://localhost:8000`

## 📝 Usage Guide

### Admin Registration
1. Go to Login page
2. Click "Mag-Register bilang Admin"
3. Enter email at password
4. Click "Mag-Register"
5. Login with your credentials

### Employee Registration
1. Login as Admin
2. Go to **Employee Registration**
3. Fill in employee details:
   - Employee ID (unique identifier)
   - Name (First name at Last name)
   - Department
   - Position
   - Contact info
4. Upload clear face photo (JPG, PNG, GIF)
5. System automatically detects face at extracts features
6. Click "Mag-Register ng Employee"

### Attendance Scanning
1. Go to **Face Scan**
2. Click "Simulan ang Face Scan"
3. Allow camera access
4. Position face clearly in front of camera
5. System automatically:
   - Detects face
   - Matches with registered employees
   - Records Time In o Time Out
   - Shows employee info at status

### View Attendance Records
1. Go to **Attendance Records**
2. Filter by:
   - Date
   - Employee ID/Name
   - Status
   - Department
3. View, edit, o delete records
4. Export to CSV

### Generate Reports
1. Go to **Summary/Reports**
2. Select period:
   - Ngayong Araw
   - Linggo
   - Buwan
   - Custom date range
3. View charts at statistics
4. Export detailed report to CSV

## 📊 Database Collections

### Firestore Collections Structure

#### `admins`
```
{
  email: "admin@example.com",
  createdAt: timestamp,
  role: "admin"
}
```

#### `employees`
```
{
  employeeId: "EMP001",
  firstName: "Juan",
  lastName: "Dela Cruz",
  name: "Juan Dela Cruz",
  email: "juan@example.com",
  department: "IT",
  position: "Software Developer",
  status: "Active",
  phone: "+63 9XX XXX XXXX",
  photoUrl: "storage-url",
  faceDescriptor: [array of numbers],
  remarks: "Optional notes",
  createdAt: timestamp,
  registeredBy: "admin@example.com"
}
```

#### `attendance`
```
{
  employeeId: "EMP001",
  name: "Juan Dela Cruz",
  department: "IT",
  position: "Developer",
  date: "2026-08-12",
  dayOfWeek: "Tuesday",
  timeIn: "08:01 AM",
  timeOut: "05:02 PM",
  totalHours: 9.01,
  status: "Present" | "Late" | "Absent" | "On Leave" | etc,
  remarks: "Automatic remarks",
  late: false,
  undertime: 0,
  overtime: 60,
  createdAt: timestamp
}
```

## ⚙️ Troubleshooting

### Camera not working
- Check browser permissions
- Ensure HTTPS (or localhost) for security
- Try different browser

### Face not detected
- Ensure good lighting
- Face should be clearly visible
- Try different angle

### Firebase connection error
- Check internet connection
- Verify Firebase credentials in config.js
- Check Firestore rules

### Face recognition not matching
- Ensure photo is clear
- Re-register employee with better photo
- Ensure at least 3-5cm face in frame

## 🔒 Security Considerations

1. **Use HTTPS** in production
2. **Update Firestore Rules** for production
3. **Never expose API keys** publicly
4. **Implement CORS** if backend separation needed
5. **Add Two-Factor Authentication** for admin accounts
6. **Regular database backups**

## 📱 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+
- ⚠️ Mobile browsers (partial support - camera access needed)

## 🎯 Keyboard Shortcuts

- `ESC` - Stop face scan
- `R` - Reset filters
- `E` - Export data

## 📞 Support

For issues o questions:
1. Check browser console for errors (F12)
2. Verify Firebase configuration
3. Ensure camera permissions
4. Check internet connection

## 📄 License

This project is provided as-is for educational and business use.

## 🚀 Future Enhancements

- [ ] Multi-language support (English, Filipino, etc)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Biometric alternatives (fingerprint, iris)
- [ ] Liveness detection
- [ ] Offline mode
- [ ] API integration
- [ ] RFID card integration

---

**Attendance Tracker v1.0** - Face Recognition System
Developed for efficient employee attendance management
