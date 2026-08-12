// Authentication Functions - Complete System

// Check auth state on page load
if (typeof auth !== "undefined") {
    auth.onAuthStateChanged(user => {
        const currentPage = window.location.pathname.split("/").pop() || "index.html";
        const loginPages = ["index.html", "admin-register.html", ""];
        
        if (user) {
            // User is logged in
            const userEmailElements = document.querySelectorAll("#userEmail");
            userEmailElements.forEach(el => {
                el.textContent = user.email;
            });
            
            const emailTextElements = document.querySelectorAll("#emailText");
            emailTextElements.forEach(el => {
                el.textContent = user.email;
            });
            
            // Redirect to dashboard if on login page
            if (loginPages.includes(currentPage)) {
                window.location.href = "dashboard.html";
            }
        } else {
            // User is not logged in
            // Redirect to login if on protected page
            if (!loginPages.includes(currentPage)) {
                window.location.href = "index.html";
            }
        }
    });
}

// Login Handler
if (document.getElementById("loginForm")) {
    document.getElementById("loginForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const messageDiv = document.getElementById("loginMessage");
        
        // Validation
        if (!email) {
            messageDiv.className = "alert alert-warning";
            messageDiv.textContent = "Please enter your email address.";
            messageDiv.classList.remove("d-none");
            return;
        }
        
        if (!password) {
            messageDiv.className = "alert alert-warning";
            messageDiv.textContent = "Please enter your password.";
            messageDiv.classList.remove("d-none");
            return;
        }
        
        try {
            // Disable button during login
            const submitBtn = e.target.querySelector("button[type=\"submit\"]");
            submitBtn.disabled = true;
            
            const result = await auth.signInWithEmailAndPassword(email, password);
            
            messageDiv.className = "alert alert-success";
            messageDiv.textContent = "Login successful! Redirecting to dashboard...";
            messageDiv.classList.remove("d-none");
            
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        } catch (error) {
            messageDiv.className = "alert alert-danger";
            let errorMessage = "Login failed. Please try again.";
            
            if (error.code === "auth/user-not-found") {
                errorMessage = "User account not found. Please register first.";
            } else if (error.code === "auth/wrong-password") {
                errorMessage = "Incorrect password. Please try again.";
            } else if (error.code === "auth/invalid-email") {
                errorMessage = "Invalid email address.";
            }
            
            messageDiv.textContent = errorMessage;
            messageDiv.classList.remove("d-none");
            
            const submitBtn = e.target.querySelector("button[type=\"submit\"]");
            submitBtn.disabled = false;
        }
    });
}

// Register Handler
if (document.getElementById("registerForm")) {
    document.getElementById("registerForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const email = document.getElementById("regEmail").value.trim();
        const password = document.getElementById("regPassword").value;
        const confirmPassword = document.getElementById("regConfirmPassword").value;
        const messageDiv = document.getElementById("registerMessage");
        
        // Validation
        if (!email) {
            messageDiv.className = "alert alert-warning";
            messageDiv.textContent = "Please enter an email address.";
            messageDiv.classList.remove("d-none");
            return;
        }
        
        if (password.length < 6) {
            messageDiv.className = "alert alert-warning";
            messageDiv.textContent = "Password must be at least 6 characters long.";
            messageDiv.classList.remove("d-none");
            return;
        }
        
        if (password !== confirmPassword) {
            messageDiv.className = "alert alert-warning";
            messageDiv.textContent = "Passwords do not match. Please try again.";
            messageDiv.classList.remove("d-none");
            return;
        }
        
        try {
            const submitBtn = e.target.querySelector("button[type=\"submit\"]");
            submitBtn.disabled = true;
            messageDiv.className = "alert alert-info";
            messageDiv.textContent = "Creating admin account...";
            messageDiv.classList.remove("d-none");
            
            const result = await auth.createUserWithEmailAndPassword(email, password);
            
            // Save admin info to Firestore
            await db.collection("admins").doc(result.user.uid).set({
                email: email,
                createdAt: new Date(),
                role: "admin",
                uid: result.user.uid
            });
            
            messageDiv.className = "alert alert-success";
            messageDiv.textContent = "Registration successful! Redirecting to login page...";
            messageDiv.classList.remove("d-none");
            
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);
        } catch (error) {
            messageDiv.className = "alert alert-danger";
            let errorMessage = "Registration failed. Please try again.";
            
            if (error.code === "auth/email-already-in-use") {
                errorMessage = "This email is already registered. Please login instead.";
            } else if (error.code === "auth/invalid-email") {
                errorMessage = "Invalid email address.";
            } else if (error.code === "auth/weak-password") {
                errorMessage = "Password is too weak. Please use a stronger password.";
            }
            
            messageDiv.textContent = errorMessage;
            messageDiv.classList.remove("d-none");
            
            const submitBtn = e.target.querySelector("button[type=\"submit\"]");
            submitBtn.disabled = false;
        }
    });
}

// Logout Handler
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                await auth.signOut();
                window.location.href = "index.html";
            } catch (error) {
                console.error("Logout error:", error);
                alert("Error logging out. Please try again.");
            }
        });
    }
});

// Navigation Helper
function goToPage(page) {
    window.location.href = page;
}
