// Comprehensive Dashboard Test Script
// This script tests all major dashboard functions across Doctor, Patient, and Pharmacy roles

async function testDashboardFunctionality() {
  console.log('🧪 Starting Comprehensive Dashboard Tests...\n');

  const baseUrl = 'http://localhost:5000';
  
  // Test data
  const testUsers = {
    doctor: {
      username: 'dr_smith',
      password: 'test123',
      email: 'dr.smith@hospital.com',
      role: 'doctor',
      name: 'Dr. John Smith',
      specialization: 'Cardiology',
      hospital: 'City General Hospital',
      licenseNumber: 'DOC123456',
      phone: '+1-555-0101',
    },
    patient: {
      username: 'patient_doe',
      password: 'test123', 
      email: 'john.doe@email.com',
      role: 'patient',
      name: 'John Doe',
      dateOfBirth: new Date('1985-06-15').getTime(),
      bloodGroup: 'O+',
      phone: '+1-555-0102',
      address: '123 Main St, City',
      emergencyContact: '+1-555-0199'
    },
    pharmacy: {
      username: 'pharmacy_care',
      password: 'test123',
      email: 'contact@careplus.com', 
      role: 'pharmacy',
      name: 'CarePlus Pharmacy',
      address: '456 Health Ave, City',
      licenseNumber: 'PHARM789',
      phone: '+1-555-0103'
    }
  };

  try {
    // 1. Test User Registration & Login
    console.log('📝 Testing User Registration...');
    
    for (const [role, userData] of Object.entries(testUsers)) {
      const response = await fetch(`${baseUrl}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      
      if (response.ok) {
        console.log(`✅ ${role} registration successful`);
      } else {
        console.log(`❌ ${role} registration failed:`, await response.text());
      }
    }

    // 2. Test Doctor Dashboard Functions
    console.log('\n🩺 Testing Doctor Dashboard...');
    
    // Login as doctor
    let loginResponse = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsers.doctor.username,
        password: testUsers.doctor.password
      }),
      credentials: 'include'
    });

    if (loginResponse.ok) {
      console.log('✅ Doctor login successful');
      
      // Test doctor profile
      const profileResponse = await fetch(`${baseUrl}/api/doctor/profile`, {
        credentials: 'include'
      });
      console.log(`${profileResponse.ok ? '✅' : '❌'} Doctor profile fetch: ${profileResponse.status}`);
      
      // Test today's appointments
      const appointmentsResponse = await fetch(`${baseUrl}/api/doctor/appointments/today`, {
        credentials: 'include'
      });
      console.log(`${appointmentsResponse.ok ? '✅' : '❌'} Doctor appointments fetch: ${appointmentsResponse.status}`);
      
      // Test prescriptions list
      const prescriptionsResponse = await fetch(`${baseUrl}/api/doctor/prescriptions`, {
        credentials: 'include'
      });
      console.log(`${prescriptionsResponse.ok ? '✅' : '❌'} Doctor prescriptions fetch: ${prescriptionsResponse.status}`);

      // Test prescription creation (need patient ID first)
      // We'll come back to this after getting patient data
      
    } else {
      console.log('❌ Doctor login failed');
    }

    // 3. Test Patient Dashboard Functions  
    console.log('\n👤 Testing Patient Dashboard...');
    
    // Login as patient
    loginResponse = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsers.patient.username,
        password: testUsers.patient.password
      }),
      credentials: 'include'
    });

    let patientId = null;
    if (loginResponse.ok) {
      console.log('✅ Patient login successful');
      
      // Test patient profile
      const profileResponse = await fetch(`${baseUrl}/api/patient/profile`, {
        credentials: 'include'
      });
      
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        patientId = profile.id;
        console.log(`✅ Patient profile fetch successful (ID: ${patientId})`);
      } else {
        console.log(`❌ Patient profile fetch failed: ${profileResponse.status}`);
      }
      
      // Test patient prescriptions
      const prescriptionsResponse = await fetch(`${baseUrl}/api/patient/prescriptions`, {
        credentials: 'include'
      });
      console.log(`${prescriptionsResponse.ok ? '✅' : '❌'} Patient prescriptions fetch: ${prescriptionsResponse.status}`);
      
      // Test consent requests
      const consentResponse = await fetch(`${baseUrl}/api/patient/consent-requests`, {
        credentials: 'include'
      });
      console.log(`${consentResponse.ok ? '✅' : '❌'} Patient consent requests fetch: ${consentResponse.status}`);
      
      // Test health records
      const healthResponse = await fetch(`${baseUrl}/api/patient/health-records`, {
        credentials: 'include'
      });
      console.log(`${healthResponse.ok ? '✅' : '❌'} Patient health records fetch: ${healthResponse.status}`);
      
    } else {
      console.log('❌ Patient login failed');
    }

    // 4. Test Pharmacy Dashboard Functions
    console.log('\n💊 Testing Pharmacy Dashboard...');
    
    // Login as pharmacy
    loginResponse = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsers.pharmacy.username,
        password: testUsers.pharmacy.password
      }),
      credentials: 'include'
    });

    if (loginResponse.ok) {
      console.log('✅ Pharmacy login successful');
      
      // Test pharmacy profile
      const profileResponse = await fetch(`${baseUrl}/api/pharmacy/profile`, {
        credentials: 'include'
      });
      console.log(`${profileResponse.ok ? '✅' : '❌'} Pharmacy profile fetch: ${profileResponse.status}`);
      
      // Test pending prescriptions
      const pendingResponse = await fetch(`${baseUrl}/api/pharmacy/prescriptions/pending`, {
        credentials: 'include'
      });
      console.log(`${pendingResponse.ok ? '✅' : '❌'} Pharmacy pending prescriptions fetch: ${pendingResponse.status}`);
      
    } else {
      console.log('❌ Pharmacy login failed');
    }

    // 5. Test Cross-Dashboard Integration
    if (patientId) {
      console.log('\n🔄 Testing Cross-Dashboard Integration...');
      
      // Login back as doctor to create prescription for patient
      await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: testUsers.doctor.username,
          password: testUsers.doctor.password
        }),
        credentials: 'include'
      });

      // Create prescription
      const prescriptionData = {
        patientId: patientId,
        medicines: [
          { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
          { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }
        ],
        diagnosis: 'Hypertension and Type 2 Diabetes',
        instructions: 'Take with food. Monitor blood pressure daily.'
      };

      const createPrescriptionResponse = await fetch(`${baseUrl}/api/doctor/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescriptionData),
        credentials: 'include'
      });

      console.log(`${createPrescriptionResponse.ok ? '✅' : '❌'} Prescription creation: ${createPrescriptionResponse.status}`);
      
      if (!createPrescriptionResponse.ok) {
        const error = await createPrescriptionResponse.text();
        console.log('   Error details:', error);
      }
    }

    // 6. Test Chatbot Functionality
    console.log('\n🤖 Testing Chatbot...');
    
    const chatbotResponse = await fetch(`${baseUrl}/api/chatbot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What are my recent prescriptions?'
      }),
      credentials: 'include'
    });

    console.log(`${chatbotResponse.ok ? '✅' : '❌'} Chatbot query: ${chatbotResponse.status}`);

    console.log('\n🎉 Dashboard testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the tests
testDashboardFunctionality();