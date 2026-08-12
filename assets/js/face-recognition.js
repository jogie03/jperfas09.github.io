// Face Recognition and Attendance Scan

let videoStream = null;
let isScanning = false;
let modelsLoaded = false;
let lastScanTime = 0;
const SCAN_COOLDOWN = 2000; // 2 seconds between scans

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadFaceApiModels();
    setupEventListeners();
    loadTodayScans();
});

// Load Face-API models
async function loadFaceApiModels() {
    try {
        document.getElementById('loadingStatus').classList.remove('d-none');
        
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        
        modelsLoaded = true;
        document.getElementById('loadingStatus').classList.add('d-none');
        console.log('Face API models loaded successfully');
    } catch (error) {
        console.error('Error loading Face API models:', error);
        showError('Failed to load face recognition models. Please refresh the page.');
    }
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('startScanBtn').addEventListener('click', startFaceScan);
    document.getElementById('stopScanBtn').addEventListener('click', stopFaceScan);
    document.getElementById('clearResultBtn').addEventListener('click', clearResult);
}

// Start face scanning
async function startFaceScan() {
    try {
        if (!modelsLoaded) {
            showError('Face recognition models not loaded yet. Please wait...');
            return;
        }
        
        isScanning = true;
        document.getElementById('startScanBtn').classList.add('d-none');
        document.getElementById('stopScanBtn').classList.remove('d-none');
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 } 
        });
        videoStream = stream;
        
        const video = document.getElementById('video');
        video.srcObject = stream;
        
        scanForFace();
    } catch (error) {
        console.error('Error accessing camera:', error);
        showError('Cannot access camera. Please check permissions.');
        isScanning = false;
        document.getElementById('startScanBtn').classList.remove('d-none');
        document.getElementById('stopScanBtn').classList.add('d-none');
    }
}

// Stop face scanning
function stopFaceScan() {
    isScanning = false;
    
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }
    
    document.getElementById('startScanBtn').classList.remove('d-none');
    document.getElementById('stopScanBtn').classList.add('d-none');
}

// Scan for face
async function scanForFace() {
    if (!isScanning || !modelsLoaded) return;
    
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    
    try {
        const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptors();
        
        if (detections.length > 0) {
            // Face detected
            if (Date.now() - lastScanTime > SCAN_COOLDOWN) {
                lastScanTime = Date.now();
                await processFaceDetection(detections[0]);
            }
        }
    } catch (error) {
        console.error('Error detecting face:', error);
    }
    
    requestAnimationFrame(scanForFace);
}

// Process detected face
async function processFaceDetection(detection) {
    try {
        // Get face descriptor for comparison
        const faceDescriptor = detection.descriptor;
        
        // Query employees from Firestore
        const employeesSnapshot = await db.collection('employees').get();
        let bestMatch = null;
        let bestDistance = 0.6; // Threshold for face match
        
        for (const doc of employeesSnapshot.docs) {
            const employee = doc.data();
            
            if (employee.faceDescriptor) {
                // Compare faces
                const distance = faceapi.euclideanDistance(
                    faceDescriptor, 
                    employee.faceDescriptor
                );
                
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMatch = { ...employee, id: doc.id };
                }
            }
        }
        
        if (bestMatch) {
            // Face recognized - Process attendance
            await recordAttendance(bestMatch);
        } else {
            // Face not recognized
            showResult({
                status: 'error',
                remarks: 'Hindi nakilala ang mukha - Face not recognized',
                employeeId: 'UNKNOWN'
            });
        }
    } catch (error) {
        console.error('Error processing face detection:', error);
        showError('Error processing face. Please try again.');
    }
}

// Record attendance
async function recordAttendance(employee) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const currentTime = new Date();
        const timeString = currentTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        
        // Check if already scanned today
        const attendanceQuery = await db.collection('attendance')
            .where('employeeId', '==', employee.employeeId)
            .where('date', '==', today)
            .get();
        
        let status = 'Present';
        let remarks = '';
        let isTimeIn = true;
        
        if (attendanceQuery.size > 0) {
            // Already has time in today
            const existingRecord = attendanceQuery.docs[0];
            
            if (existingRecord.data().timeOut) {
                // Already has time out
                remarks = 'Nakapag-Time Out na - Already timed out';
                status = 'error';
            } else {
                // Record time out
                isTimeIn = false;
                
                const timeInDate = new Date(existingRecord.data().timeIn);
                const hoursWorked = (currentTime - timeInDate) / (1000 * 60 * 60);
                
                // Update with time out
                await db.collection('attendance').doc(existingRecord.id).update({
                    timeOut: timeString,
                    totalHours: parseFloat(hoursWorked.toFixed(2)),
                    status: 'COMPLETED',
                    remarks: 'Time Out - Employee left'
                });
                
                remarks = `Time Out - Employee left. Total hours: ${hoursWorked.toFixed(1)} hours`;
                status = 'COMPLETED';
            }
        } else {
            // New time in
            remarks = 'Time In - Employee arrived';
            
            // Check if late (assuming 9 AM is standard time)
            const lateTime = new Date(today + 'T09:00:00');
            if (currentTime > lateTime) {
                const lateMinutes = Math.round((currentTime - lateTime) / (1000 * 60));
                remarks = `Late - ${lateMinutes} minutes late`;
                status = 'Late';
            } else {
                status = 'Present';
            }
            
            // Create new attendance record
            await db.collection('attendance').add({
                employeeId: employee.employeeId,
                name: employee.name,
                department: employee.department,
                position: employee.position,
                date: today,
                dayOfWeek: currentTime.toLocaleDateString('en-US', { weekday: 'long' }),
                timeIn: timeString,
                timeOut: null,
                totalHours: 0,
                status: status,
                remarks: remarks,
                late: status === 'Late' ? true : false,
                createdAt: new Date(),
                faceMatchConfidence: (1 - Math.min(0.6, 0.6)) * 100
            });
        }
        
        // Show result
        showResult({
            employeeId: employee.employeeId,
            name: employee.name,
            department: employee.department,
            position: employee.position,
            date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            time: timeString,
            status: isTimeIn ? 'TIME IN' : 'TIME OUT',
            remarks: remarks,
            image: employee.photoUrl
        });
        
        // Reload recent scans
        loadTodayScans();
    } catch (error) {
        console.error('Error recording attendance:', error);
        showError('Error recording attendance. Please try again.');
    }
}

// Show result
function showResult(result) {
    const resultContainer = document.getElementById('resultContainer');
    
    if (result.status === 'error') {
        showError(result.remarks);
        return;
    }
    
    document.getElementById('resultEmployeeId').textContent = result.employeeId;
    document.getElementById('resultName').textContent = result.name || 'N/A';
    document.getElementById('resultDepartment').textContent = result.department || 'N/A';
    document.getElementById('resultPosition').textContent = result.position || 'N/A';
    document.getElementById('resultDate').textContent = result.date;
    document.getElementById('resultTime').textContent = result.time;
    document.getElementById('resultStatus').textContent = result.status;
    document.getElementById('resultRemarks').textContent = result.remarks;
    
    if (result.image) {
        document.getElementById('resultImage').src = result.image;
    }
    
    const header = document.getElementById('resultHeader');
    if (result.status === 'TIME IN') {
        header.className = 'card-header bg-success text-white';
    } else if (result.status === 'TIME OUT') {
        header.className = 'card-header bg-warning text-dark';
    }
    
    resultContainer.classList.remove('d-none');
    document.getElementById('clearResultBtn').classList.remove('d-none');
}

// Clear result
function clearResult() {
    document.getElementById('resultContainer').classList.add('d-none');
    document.getElementById('clearResultBtn').classList.add('d-none');
    document.getElementById('errorContainer').classList.add('d-none');
}

// Show error
function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorContainer').classList.remove('d-none');
}

// Load today's scans
async function loadTodayScans() {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const scansSnapshot = await db.collection('attendance')
            .where('date', '==', today)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
        
        const tableBody = document.getElementById('recentScansTable').querySelector('tbody');
        
        if (scansSnapshot.empty) {
            tableBody.innerHTML = '<tr id="noScans" class="text-muted text-center"><td colspan="5">No scans recorded today</td></tr>';
            return;
        }
        
        tableBody.innerHTML = '';
        
        scansSnapshot.forEach(doc => {
            const scan = doc.data();
            const row = tableBody.insertRow();
            
            let statusBadge = `<span class="badge bg-success">${scan.status}</span>`;
            if (scan.status === 'Late') {
                statusBadge = `<span class="badge bg-warning">${scan.status}</span>`;
            } else if (scan.status === 'error') {
                statusBadge = `<span class="badge bg-danger">${scan.status}</span>`;
            }
            
            row.innerHTML = `
                <td>${scan.timeIn || 'N/A'}</td>
                <td>${scan.employeeId}</td>
                <td>${scan.name}</td>
                <td>${statusBadge}</td>
                <td>${scan.remarks}</td>
            `;
        });
    } catch (error) {
        console.error('Error loading today scans:', error);
    }
}
