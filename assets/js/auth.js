// Authentication Functions

// Check auth state
auth.onAuthStateChanged(user => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const loginPages = ['index.html', 'admin-register.html', ''];
    
    if (user) {
        // User is logged in
        document.getElementById('userEmail').textContent = user.email;
        
        // Redirect to dashboard if on login page
        if (loginPages.includes(currentPage)) {
            window.location.href = 'dashboard.html';
        }
    } else {
        // User is not logged in
        // Redirect to login if on protected page
        if (!loginPages.includes(currentPage)) {
            window.location.href = 'index.html';
        }
    }
});

// Login Handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const messageDiv = document.getElementById('loginMessage');
        
        try {
            const result = await auth.signInWithEmailAndPassword(email, password);
            messageDiv.className = 'alert alert-success';
            messageDiv.textContent = 'Login successful! Redirecting...';
            messageDiv.classList.remove('d-none');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } catch (error) {
            messageDiv.className = 'alert alert-danger';
            messageDiv.textContent = `Error: ${error.message}`;
            messageDiv.classList.remove('d-none');
        }
    });
}

// Register Handler
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const messageDiv = document.getElementById('registerMessage');
        
        if (password !== confirmPassword) {
            messageDiv.className = 'alert alert-warning';
            messageDiv.textContent = 'Passwords do not match!';
            messageDiv.classList.remove('d-none');
            return;
        }
        
        if (password.length < 6) {
            messageDiv.className = 'alert alert-warning';
            messageDiv.textContent = 'Password must be at least 6 characters!';
            messageDiv.classList.remove('d-none');
            return;
        }
        
        try {
            const result = await auth.createUserWithEmailAndPassword(email, password);
            
            // Save admin info to Firestore
            await db.collection('admins').doc(result.user.uid).set({
                email: email,
                createdAt: new Date(),
                role: 'admin'
            });
            
            messageDiv.className = 'alert alert-success';
            messageDiv.textContent = 'Registration successful! Redirecting to login...';
            messageDiv.classList.remove('d-none');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } catch (error) {
            messageDiv.className = 'alert alert-danger';
            messageDiv.textContent = `Error: ${error.message}`;
            messageDiv.classList.remove('d-none');
        }
    });
}

// Logout Handler
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await auth.signOut();
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }
});

// Navigation Helper
function goToPage(page) {
    window.location.href = page;
}
