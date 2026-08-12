// Employee Registration Functions

let selectedPhotoFile = null;
let faceDescriptorData = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupPhotoUpload();
    setupFormSubmit();
    loadEmployees();
});

// Setup photo upload
function setupPhotoUpload() {
    const dropZone = document.getElementById('photoDropZone');
    const fileInput = document.getElementById('photoUpload');
    
    // Click to upload
    dropZone.addEventListener('click', () => fileInput.click());
    
    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            handlePhotoSelect(e.dataTransfer.files[0]);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handlePhotoSelect(e.target.files[0]);
        }
    });
}

// Handle photo selection
function handlePhotoSelect(file) {
    if (!file.type.startsWith('image/')) {
        showRegistrationMessage('Please select a valid image file', 'warning');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showRegistrationMessage('File size must be less than 5MB', 'warning');
        return;
    }
    
    selectedPhotoFile = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('photoPreview');
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        
        // Extract face descriptor
        extractFaceDescriptor(e.target.result);
    };
    reader.readAsDataURL(file);
}

// Extract face descriptor
async function extractFaceDescriptor(imageDataUrl) {
    try {
        const img = new Image();
        img.src = imageDataUrl;
        
        img.onload = async () => {
            const detections = await faceapi
                .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptors();
            
            if (detections.length === 0) {
                showRegistrationMessage('No face detected in image. Please upload a clear face photo.', 'warning');
                faceDescriptorData = null;
                return;
            }
            
            if (detections.length > 1) {
                showRegistrationMessage('Multiple faces detected. Please upload photo with only one person.', 'warning');
                faceDescriptorData = null;
                return;
            }
            
            faceDescriptorData = detections[0].descriptor;
            showRegistrationMessage('Face detected successfully! ✓', 'success');
        };
    } catch (error) {
        console.error('Error extracting face descriptor:', error);
        showRegistrationMessage('Error processing image. Please try again.', 'danger');
    }
}

// Setup form submit
function setupFormSubmit() {
    document.getElementById('employeeForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate face descriptor
        if (!faceDescriptorData) {
            showRegistrationMessage('Please upload a clear photo with face visible', 'warning');
            return;
        }
        
        await registerEmployee();
    });
}

// Register employee
async function registerEmployee() {
    try {
        const messageDiv = document.getElementById('registrationMessage');
        messageDiv.className = 'alert alert-info';
        messageDiv.textContent = 'Processing... Please wait.';
        messageDiv.classList.remove('d-none');
        
        const employeeId = document.getElementById('employeeId').value.trim();
        
        // Check if employee ID already exists
        const existingEmployee = await db.collection('employees')
            .where('employeeId', '==', employeeId)
            .get();
        
        if (!existingEmployee.empty) {
            showRegistrationMessage('Employee ID already registered!', 'danger');
            return;
        }
        
        // Upload photo to Firebase Storage
        let photoUrl = '';
        if (selectedPhotoFile) {
            const fileName = `employees/${employeeId}_${Date.now()}`;
            const fileRef = firebase.storage().ref().child(fileName);
            
            await fileRef.put(selectedPhotoFile);
            photoUrl = await fileRef.getDownloadURL();
        }
        
        // Create employee record
        const employeeData = {
            employeeId: employeeId,
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            name: `${document.getElementById('firstName').value.trim()} ${document.getElementById('lastName').value.trim()}`,
            email: document.getElementById('email').value.trim(),
            department: document.getElementById('department').value,
            position: document.getElementById('position').value.trim(),
            status: document.getElementById('status').value,
            phone: document.getElementById('phone').value.trim(),
            photoUrl: photoUrl,
            faceDescriptor: Array.from(faceDescriptorData), // Convert to array for storage
            remarks: document.getElementById('remarks').value.trim(),
            createdAt: new Date(),
            registeredBy: auth.currentUser.email
        };
        
        // Save to Firestore
        await db.collection('employees').add(employeeData);
        
        // Show success message
        showRegistrationMessage('Employee registered successfully! ✓', 'success');
        
        // Reset form
        document.getElementById('employeeForm').reset();
        document.getElementById('photoPreview').innerHTML = '';
        selectedPhotoFile = null;
        faceDescriptorData = null;
        
        // Reload employees list
        await new Promise(resolve => setTimeout(resolve, 1000));
        loadEmployees();
    } catch (error) {
        console.error('Error registering employee:', error);
        showRegistrationMessage(`Error: ${error.message}`, 'danger');
    }
}

// Load employees
async function loadEmployees() {
    try {
        const employeesSnapshot = await db.collection('employees')
            .orderBy('createdAt', 'desc')
            .get();
        
        const tableBody = document.getElementById('employeesTable').querySelector('tbody');
        
        if (employeesSnapshot.empty) {
            tableBody.innerHTML = '<tr id="noEmployees" class="text-muted text-center"><td colspan="6">Walang nakarehistring empleyado pa</td></tr>';
            return;
        }
        
        tableBody.innerHTML = '';
        
        employeesSnapshot.forEach(doc => {
            const employee = doc.data();
            const row = tableBody.insertRow();
            
            let statusBadge = `<span class="badge bg-success">${employee.status}</span>`;
            if (employee.status === 'Inactive') {
                statusBadge = `<span class="badge bg-danger">${employee.status}</span>`;
            } else if (employee.status === 'On Leave') {
                statusBadge = `<span class="badge bg-warning text-dark">${employee.status}</span>`;
            }
            
            row.innerHTML = `
                <td>${employee.employeeId}</td>
                <td>${employee.name}</td>
                <td>${employee.department}</td>
                <td>${employee.position}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewEmployee('${doc.id}')">View</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${doc.id}', '${employee.name}')">Delete</button>
                </td>
            `;
        });
    } catch (error) {
        console.error('Error loading employees:', error);
        showRegistrationMessage('Error loading employees', 'danger');
    }
}

// View employee details
async function viewEmployee(docId) {
    try {
        const employee = await db.collection('employees').doc(docId).get();
        const data = employee.data();
        
        alert(`
Employee Details:
ID: ${data.employeeId}
Name: ${data.name}
Email: ${data.email}
Department: ${data.department}
Position: ${data.position}
Status: ${data.status}
Phone: ${data.phone}
Registered: ${new Date(data.createdAt.toDate()).toLocaleString()}
        `);
    } catch (error) {
        console.error('Error viewing employee:', error);
    }
}

// Delete employee
async function deleteEmployee(docId, name) {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
        return;
    }
    
    try {
        await db.collection('employees').doc(docId).delete();
        showRegistrationMessage(`${name} has been deleted successfully`, 'success');
        loadEmployees();
    } catch (error) {
        console.error('Error deleting employee:', error);
        showRegistrationMessage('Error deleting employee', 'danger');
    }
}

// Show message
function showRegistrationMessage(message, type) {
    const messageDiv = document.getElementById('registrationMessage');
    messageDiv.className = `alert alert-${type}`;
    messageDiv.textContent = message;
    messageDiv.classList.remove('d-none');
    
    if (type === 'success' || type === 'warning') {
        setTimeout(() => {
            messageDiv.classList.add('d-none');
        }, 4000);
    }
}

// Load Face API models on page load
window.addEventListener('load', async () => {
    try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        console.log('Face API models loaded');
    } catch (error) {
        console.error('Error loading Face API models:', error);
    }
});
