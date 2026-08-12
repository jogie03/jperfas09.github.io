// Attendance Summary and Reports

let attendanceChart = null;
let departmentChart = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    generateReport();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('periodSelect').addEventListener('change', (e) => {
        const customRange = document.getElementById('customDateRange');
        const customRange2 = document.getElementById('customDateRange2');
        
        if (e.target.value === 'custom') {
            customRange.style.display = 'block';
            customRange2.style.display = 'block';
        } else {
            customRange.style.display = 'none';
            customRange2.style.display = 'none';
        }
    });
    
    document.getElementById('generateReportBtn').addEventListener('click', generateReport);
    document.getElementById('exportReportBtn').addEventListener('click', exportReport);
}

// Generate report
async function generateReport() {
    try {
        const period = document.getElementById('periodSelect').value;
        let startDate, endDate;
        
        const today = new Date();
        
        switch (period) {
            case 'today':
                startDate = today.toISOString().split('T')[0];
                endDate = startDate;
                break;
            case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                startDate = weekStart.toISOString().split('T')[0];
                endDate = today.toISOString().split('T')[0];
                break;
            case 'month':
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                startDate = monthStart.toISOString().split('T')[0];
                endDate = today.toISOString().split('T')[0];
                break;
            case 'custom':
                startDate = document.getElementById('startDate').value;
                endDate = document.getElementById('endDate').value;
                if (!startDate || !endDate) {
                    showMessage('Please select start and end dates', 'warning');
                    return;
                }
                break;
        }
        
        // Get attendance records in date range
        const snapshot = await db.collection('attendance')
            .where('date', '>=', startDate)
            .where('date', '<=', endDate)
            .get();
        
        const records = [];
        snapshot.forEach(doc => {
            records.push(doc.data());
        });
        
        // Calculate summary
        calculateSummary(records);
        
        // Generate charts
        generateCharts(records);
        
        // Generate detailed report
        generateDetailedReport(records);
    } catch (error) {
        console.error('Error generating report:', error);
        showMessage('Error generating report', 'danger');
    }
}

// Calculate summary
function calculateSummary(records) {
    const employeeMap = new Map();
    
    records.forEach(record => {
        const empId = record.employeeId;
        if (!employeeMap.has(empId)) {
            employeeMap.set(empId, {
                employeeId: empId,
                name: record.name,
                status: {}
            });
        }
        
        const emp = employeeMap.get(empId);
        emp.status[record.status] = (emp.status[record.status] || 0) + 1;
    });
    
    let totalEmployees = employeeMap.size;
    let present = 0, late = 0, absent = 0, leave = 0, wfh = 0;
    
    employeeMap.forEach((emp) => {
        if (emp.status['Present']) present += emp.status['Present'];
        if (emp.status['Late']) late += emp.status['Late'];
        if (emp.status['Absent']) absent += emp.status['Absent'];
        if (emp.status['On Leave']) leave += emp.status['On Leave'];
        if (emp.status['Work From Home']) wfh += emp.status['Work From Home'];
    });
    
    const attendancePercentage = totalEmployees > 0 
        ? Math.round((present / totalEmployees) * 100) 
        : 0;
    
    document.getElementById('summaryTotalEmployees').textContent = totalEmployees;
    document.getElementById('summaryPresent').textContent = present;
    document.getElementById('summaryLate').textContent = late;
    document.getElementById('summaryAbsent').textContent = absent;
    document.getElementById('summaryLeave').textContent = leave;
    document.getElementById('summaryPercentage').textContent = attendancePercentage + '%';
}

// Generate charts
function generateCharts(records) {
    // Attendance Distribution Chart
    const statusCount = {};
    records.forEach(record => {
        statusCount[record.status] = (statusCount[record.status] || 0) + 1;
    });
    
    const ctx1 = document.getElementById('attendanceChart').getContext('2d');
    
    if (attendanceChart) {
        attendanceChart.destroy();
    }
    
    attendanceChart = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCount),
            datasets: [{
                data: Object.values(statusCount),
                backgroundColor: [
                    '#198754', // Present - green
                    '#ffc107', // Late - yellow
                    '#dc3545', // Absent - red
                    '#0dcaf0', // Leave - cyan
                    '#6c757d', // WFH - gray
                    '#fd7e14'  // Other - orange
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Department Chart
    const departmentMap = {};
    records.forEach(record => {
        if (!departmentMap[record.department]) {
            departmentMap[record.department] = 0;
        }
        departmentMap[record.department]++;
    });
    
    const ctx2 = document.getElementById('departmentChart').getContext('2d');
    
    if (departmentChart) {
        departmentChart.destroy();
    }
    
    departmentChart = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: Object.keys(departmentMap),
            datasets: [{
                label: 'Attendance Count',
                data: Object.values(departmentMap),
                backgroundColor: '#0d6efd'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Generate detailed report
function generateDetailedReport(records) {
    const employeeMap = new Map();
    
    records.forEach(record => {
        const empId = record.employeeId;
        if (!employeeMap.has(empId)) {
            employeeMap.set(empId, {
                employeeId: empId,
                name: record.name,
                department: record.department,
                present: 0,
                late: 0,
                absent: 0,
                leave: 0,
                wfh: 0,
                totalHours: 0,
                totalOT: 0,
                totalUT: 0,
                count: 0
            });
        }
        
        const emp = employeeMap.get(empId);
        
        switch (record.status) {
            case 'Present':
                emp.present++;
                break;
            case 'Late':
                emp.late++;
                break;
            case 'Absent':
                emp.absent++;
                break;
            case 'On Leave':
                emp.leave++;
                break;
            case 'Work From Home':
                emp.wfh++;
                break;
        }
        
        if (record.totalHours) {
            emp.totalHours += record.totalHours;
        }
        if (record.overtime) {
            emp.totalOT += record.overtime;
        }
        if (record.undertime) {
            emp.totalUT += record.undertime;
        }
        emp.count++;
    });
    
    const tableBody = document.getElementById('reportTableBody');
    
    if (employeeMap.size === 0) {
        tableBody.innerHTML = '<tr id="noReport" class="text-muted text-center"><td colspan="11">Walang data available</td></tr>';
        return;
    }
    
    tableBody.innerHTML = '';
    
    employeeMap.forEach(emp => {
        const row = tableBody.insertRow();
        const avgHours = emp.count > 0 ? (emp.totalHours / emp.count).toFixed(2) : 0;
        
        row.innerHTML = `
            <td>${emp.employeeId}</td>
            <td>${emp.name}</td>
            <td>${emp.department}</td>
            <td>${emp.present}</td>
            <td>${emp.late}</td>
            <td>${emp.absent}</td>
            <td>${emp.leave}</td>
            <td>${emp.wfh}</td>
            <td>${avgHours}</td>
            <td>${emp.totalOT.toFixed(0)}</td>
            <td>${emp.totalUT.toFixed(0)}</td>
        `;
    });
}

// Export report
function exportReport() {
    const period = document.getElementById('periodSelect').value;
    let startDate = new Date().toISOString().split('T')[0];
    let endDate = startDate;
    
    if (period === 'custom') {
        startDate = document.getElementById('startDate').value;
        endDate = document.getElementById('endDate').value;
    }
    
    const headers = [
        'Employee ID', 'Name', 'Department', 'Present', 'Late', 'Absent', 
        'Leave', 'WFH', 'Avg Hours', 'Total OT', 'Total UT'
    ];
    
    const tableBody = document.getElementById('reportTableBody');
    const rows = [];
    
    tableBody.querySelectorAll('tr').forEach(tr => {
        const cells = [];
        tr.querySelectorAll('td').forEach(td => {
            cells.push(td.textContent);
        });
        rows.push(cells);
    });
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${startDate}_to_${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showMessage('Report exported successfully', 'success');
}

// Show message
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
    messageDiv.textContent = message;
    messageDiv.style.zIndex = '9999';
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}
