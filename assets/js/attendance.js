// Attendance Records Functions

let currentPage = 1;
let allRecords = [];
let filteredRecords = [];
const recordsPerPage = 20;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadAttendanceRecords();
    setDefaultDate();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('filterBtn').addEventListener('click', applyFilters);
    document.getElementById('resetFilterBtn').addEventListener('click', resetFilters);
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
    document.getElementById('prevPage').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            displayRecords();
        }
    });
    document.getElementById('nextPage').addEventListener('click', (e) => {
        e.preventDefault();
        const maxPage = Math.ceil(filteredRecords.length / recordsPerPage);
        if (currentPage < maxPage) {
            currentPage++;
            displayRecords();
        }
    });
    
    // Edit modal save
    document.getElementById('saveEditBtn').addEventListener('click', saveEditedRecord);
}

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('filterDate').value = today;
}

// Load attendance records
async function loadAttendanceRecords() {
    try {
        const snapshot = await db.collection('attendance')
            .orderBy('createdAt', 'desc')
            .get();
        
        allRecords = [];
        snapshot.forEach(doc => {
            allRecords.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        filteredRecords = [...allRecords];
        currentPage = 1;
        displayRecords();
    } catch (error) {
        console.error('Error loading attendance records:', error);
        showMessage('Error loading records', 'danger');
    }
}

// Apply filters
function applyFilters() {
    const filterDate = document.getElementById('filterDate').value;
    const filterEmployee = document.getElementById('filterEmployee').value.toLowerCase();
    const filterStatus = document.getElementById('filterStatus').value;
    const filterDepartment = document.getElementById('filterDepartment').value;
    
    filteredRecords = allRecords.filter(record => {
        let match = true;
        
        if (filterDate && record.date !== filterDate) {
            match = false;
        }
        
        if (filterEmployee && 
            !record.employeeId.toLowerCase().includes(filterEmployee) &&
            !record.name.toLowerCase().includes(filterEmployee)) {
            match = false;
        }
        
        if (filterStatus && record.status !== filterStatus) {
            match = false;
        }
        
        if (filterDepartment && record.department !== filterDepartment) {
            match = false;
        }
        
        return match;
    });
    
    currentPage = 1;
    displayRecords();
    showMessage(`Found ${filteredRecords.length} records`, 'info');
}

// Reset filters
function resetFilters() {
    document.getElementById('filterDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('filterEmployee').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterDepartment').value = '';
    
    filteredRecords = [...allRecords];
    currentPage = 1;
    displayRecords();
}

// Display records
function displayRecords() {
    const tableBody = document.getElementById('attendanceTableBody');
    
    if (filteredRecords.length === 0) {
        tableBody.innerHTML = '<tr id="noRecords" class="text-muted text-center"><td colspan="14">Walang attendance records</td></tr>';
        updatePagination();
        return;
    }
    
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const pageRecords = filteredRecords.slice(startIndex, endIndex);
    
    tableBody.innerHTML = '';
    
    pageRecords.forEach(record => {
        const row = tableBody.insertRow();
        
        const hoursWorked = record.totalHours || 'N/A';
        const late = record.late ? calculateLateMinutes(record) : 0;
        const undertime = calculateUndertime(record);
        const overtime = record.overtime || 0;
        
        let statusBadge = `<span class="badge bg-success">${record.status}</span>`;
        if (record.status === 'Late') {
            statusBadge = `<span class="badge bg-warning text-dark">${record.status}</span>`;
        } else if (record.status === 'Absent') {
            statusBadge = `<span class="badge bg-danger">${record.status}</span>`;
        } else if (record.status === 'On Leave' || record.status === 'Work From Home') {
            statusBadge = `<span class="badge bg-info">${record.status}</span>`;
        } else if (record.status === 'Error' || record.status === 'Incomplete') {
            statusBadge = `<span class="badge bg-danger">${record.status}</span>`;
        }
        
        row.innerHTML = `
            <td>${record.employeeId}</td>
            <td>${record.name}</td>
            <td>${record.department}</td>
            <td>${record.position}</td>
            <td>${record.date}</td>
            <td>${record.timeIn || 'N/A'}</td>
            <td>${record.timeOut || 'N/A'}</td>
            <td>${hoursWorked}</td>
            <td>${statusBadge}</td>
            <td>${late}</td>
            <td>${undertime}</td>
            <td>${overtime}</td>
            <td>${record.remarks}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editRecord('${record.id}')">Edit</button>
            </td>
        `;
    });
    
    updatePagination();
}

// Update pagination
function updatePagination() {
    const maxPage = Math.ceil(filteredRecords.length / recordsPerPage);
    
    document.getElementById('pageNumber').innerHTML = `<span class="page-link">${currentPage}</span>`;
    
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (currentPage === 1) {
        prevBtn.classList.add('disabled');
    } else {
        prevBtn.classList.remove('disabled');
    }
    
    if (currentPage >= maxPage) {
        nextBtn.classList.add('disabled');
    } else {
        nextBtn.classList.remove('disabled');
    }
}

// Calculate late minutes
function calculateLateMinutes(record) {
    if (!record.timeIn) return 0;
    
    const timeInDate = new Date(`${record.date}T${record.timeIn}`);
    const lateTime = new Date(`${record.date}T09:00:00`);
    
    if (timeInDate > lateTime) {
        return Math.round((timeInDate - lateTime) / (1000 * 60));
    }
    return 0;
}

// Calculate undertime
function calculateUndertime(record) {
    if (!record.totalHours || record.totalHours >= 8) return 0;
    
    const shortHours = 8 - record.totalHours;
    return Math.round(shortHours * 60);
}

// Edit record
function editRecord(recordId) {
    const record = allRecords.find(r => r.id === recordId);
    if (!record) return;
    
    document.getElementById('editRecordId').value = recordId;
    document.getElementById('editTimeIn').value = record.timeIn || '';
    document.getElementById('editTimeOut').value = record.timeOut || '';
    document.getElementById('editStatus').value = record.status;
    document.getElementById('editRemarks').value = record.remarks || '';
    
    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
}

// Save edited record
async function saveEditedRecord() {
    try {
        const recordId = document.getElementById('editRecordId').value;
        const timeIn = document.getElementById('editTimeIn').value;
        const timeOut = document.getElementById('editTimeOut').value;
        const status = document.getElementById('editStatus').value;
        const remarks = document.getElementById('editRemarks').value;
        
        const record = allRecords.find(r => r.id === recordId);
        
        let totalHours = 0;
        if (timeIn && timeOut) {
            const startTime = new Date(`2000-01-01T${timeIn}`);
            const endTime = new Date(`2000-01-01T${timeOut}`);
            totalHours = (endTime - startTime) / (1000 * 60 * 60);
        }
        
        await db.collection('attendance').doc(recordId).update({
            timeIn: timeIn || record.timeIn,
            timeOut: timeOut || record.timeOut,
            status: status,
            remarks: remarks,
            totalHours: parseFloat(totalHours.toFixed(2)),
            updatedAt: new Date()
        });
        
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
        
        // Reload records
        await loadAttendanceRecords();
        showMessage('Record updated successfully', 'success');
    } catch (error) {
        console.error('Error saving record:', error);
        showMessage('Error updating record', 'danger');
    }
}

// Export to CSV
function exportToCSV() {
    if (filteredRecords.length === 0) {
        showMessage('No records to export', 'warning');
        return;
    }
    
    const headers = [
        'Employee ID', 'Name', 'Department', 'Position', 'Date', 'Day',
        'Time In', 'Time Out', 'Hours Worked', 'Status', 'Late (min)', 
        'Undertime (min)', 'Overtime (min)', 'Remarks'
    ];
    
    const rows = filteredRecords.map(record => [
        record.employeeId,
        record.name,
        record.department,
        record.position,
        record.date,
        record.dayOfWeek,
        record.timeIn || '',
        record.timeOut || '',
        record.totalHours || '',
        record.status,
        calculateLateMinutes(record),
        calculateUndertime(record),
        record.overtime || '',
        record.remarks || ''
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showMessage('CSV exported successfully', 'success');
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
