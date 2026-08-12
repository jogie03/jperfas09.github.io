# 🔑 Firebase Configuration Reference

## How to Get Your Firebase Credentials

### Step-by-Step Guide

#### 1. Go to Firebase Console
- URL: https://console.firebase.google.com
- Login with your Google account

#### 2. Click on Your Project
- Select the "Attendance Tracker" project you created
- Or create a new one if you haven't

#### 3. Navigate to Project Settings
- Look for the gear icon (⚙️) in the top left
- Click **Project Settings**

#### 4. Go to "Your apps" Tab
- Click on the **Your apps** tab
- Look for a box showing web icon: `</>`
- If none exists, click the web icon to register a new app

#### 5. Copy the Config
You should see a JavaScript snippet like:

```javascript
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// ... other imports

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

#### 6. Extract Individual Values
- **apiKey** - Copy this value
- **authDomain** - Copy the full domain
- **projectId** - Copy this value
- **storageBucket** - Copy the full storage URL
- **messagingSenderId** - Copy this value
- **appId** - Copy this value

---

## Update Config File

### Open: `assets/js/config.js`

Replace this:
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

With your actual values (copy-paste from Firebase):
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyD...",
    authDomain: "attendance-tracker.firebaseapp.com",
    projectId: "attendance-tracker",
    storageBucket: "attendance-tracker.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
};
```

---

## Example Firebase Config

Here's an example of what it looks like (DO NOT USE - these are fake values):

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyDmWvgMWrH_psPmqxhBzfxLj6rPqKd5_xY",
    authDomain: "attendance-tracker.firebaseapp.com",
    projectId: "attendance-tracker",
    storageBucket: "attendance-tracker.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};
```

---

## Verify Setup

After updating config.js, verify:

1. **Open browser Console** (F12 key)
2. **Go to index.html**
3. Look for message: **"Firebase initialized successfully"**
4. If no errors, you're good to go!

If you see errors:
- Check that ALL values are copied correctly
- Make sure no extra spaces
- Verify Firebase services are enabled (Auth, Firestore, Storage)

---

## Firebase Services Checklist

Ensure these are enabled:

✅ **Authentication**
- Go to Authentication tab
- Enable Email/Password sign-in

✅ **Firestore Database**
- Go to Firestore Database tab
- Database created in test mode
- Region: asia-southeast1 (or your region)

✅ **Cloud Storage**
- Go to Storage tab
- Storage bucket created
- Same region as Firestore

✅ **Realtime Database** (Optional)
- NOT needed for this project

---

## Testing Connection

### Method 1: Browser Console
1. Open any page (e.g., index.html)
2. Press F12
3. Look for green message: "Firebase initialized successfully"

### Method 2: Try to Login
1. Try to login (even with wrong credentials)
2. Should connect to Firebase
3. Show error message (not connection error)

### Method 3: Register
1. Try to register new admin
2. Should work (or show email already registered)

---

## Common Errors & Solutions

### Error: "apiKey is undefined"
- **Cause**: Config not updated
- **Solution**: Copy exact values from Firebase

### Error: "Project ID not found"
- **Cause**: projectId is wrong
- **Solution**: Check Firebase Console for exact project ID

### Error: "Authentication is disabled"
- **Cause**: Auth service not enabled
- **Solution**: Enable Email/Password in Authentication tab

### Error: "Permission denied"
- **Cause**: Firestore rules too strict
- **Solution**: Use test mode rules or update security rules

---

## Security Rules

For development (test mode - OPEN):
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

For production (RESTRICTED):
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /admins/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /employees/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid in get(/databases/$(database)/documents/admins).data.keys();
    }
    match /attendance/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid in get(/databases/$(database)/documents/admins).data.keys();
    }
  }
}
```

---

## Need More Help?

1. **Firebase Documentation**: https://firebase.google.com/docs
2. **Authentication Help**: https://firebase.google.com/docs/auth
3. **Firestore Guide**: https://firebase.google.com/docs/firestore
4. **Storage Help**: https://firebase.google.com/docs/storage

---

**You're all set! Start using the Attendance Tracker! 🚀**
