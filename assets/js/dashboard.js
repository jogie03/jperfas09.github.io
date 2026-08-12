// Dashboard Functions

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardSummary();
});

// Load dashboard summary
async function loadDashboardSummary() {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Get all employees
        const employeesSnapshot = await db.collection('employees').get();
        const totalEmployees = employeesSnapshot.size;
        document.getElementById('totalEmployees').textContent = totalEmployees;
        
        // Get today's attendance
        const attendanceSnapshot = await db.collection('attendance')
            .where('date', '==', today)
            .get();
        
        let present = 0;
        let late = 0;
        let absent = 0;
        let leave = 0;
        let wfh = 0;
        
        attendanceSnapshot.forEach(doc => {
            const record = doc.data();
            switch (record.status) {
                case 'Present':
                    present++;
                    break;
                case 'Late':
                    late++;
                    break;
                case 'On Leave':
                    leave++;
                    break;
                case 'Work From Home':
                    wfh++;
                    break;
            }
        });
        
        // Calculate absent (employees not scanned)
        absent = totalEmployees - present - late - leave - wfh;
        
        // Update display
        document.getElementById('presentCount').textContent = present;
        document.getElementById('lateCount').textContent = late;
        document.getElementById('absentCount').textContent = absent > 0 ? absent : 0;
        document.getElementById('leaveCount').textContent = leave;
        document.getElementById('wfhCount').textContent = wfh;
    } catch (error) {
        console.error('Error loading dashboard summary:', error);
    }
}

// Navigation function
function goToPage(page) {
    window.location.href = page;
}
