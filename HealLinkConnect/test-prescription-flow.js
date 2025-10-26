// Test prescription flow between doctor and patient
async function testPrescriptionFlow() {
  console.log('🧪 Testing Prescription Flow...\n');

  const baseUrl = 'http://localhost:5000';
  
  try {
    // 1. Register a doctor
    console.log('👨‍⚕️ Registering doctor...');
    const doctorResponse = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'dr_john',
        password: 'test123',
        role: 'doctor',
        email: 'dr.john@hospital.com',
        profileData: {
          name: 'Dr. John Smith',
          specialization: 'Cardiology',
          hospital: 'City General Hospital',
          licenseNumber: 'MD123456',
          phone: '+1-555-0101'
        }
      }),
      credentials: 'include'
    });

    if (doctorResponse.ok) {
      const doctor = await doctorResponse.json();
      console.log('✅ Doctor registered successfully:', doctor.username);
    } else {
      const error = await doctorResponse.text();
      console.log('❌ Doctor registration failed:', error);
      return;
    }

    // 2. Register a patient
    console.log('👤 Registering patient...');
    const patientResponse = await fetch(`${baseUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'patient_jane',
        password: 'test123',
        role: 'patient',
        email: 'jane.doe@email.com',
        profileData: {
          name: 'Jane Doe',
          dateOfBirth: new Date('1990-05-15').getTime(),
          bloodGroup: 'A+',
          phone: '+1-555-0102',
          address: '123 Main St, City'
        }
      }),
      credentials: 'include'
    });

    let patientId = null;
    if (patientResponse.ok) {
      const patient = await patientResponse.json();
      console.log('✅ Patient registered successfully:', patient.username);
      
      // Get patient profile to get the patient ID
      const patientProfileResponse = await fetch(`${baseUrl}/api/patient/profile`, {
        credentials: 'include'
      });
      
      if (patientProfileResponse.ok) {
        const patientProfile = await patientProfileResponse.json();
        patientId = patientProfile.id;
        console.log('✅ Patient ID obtained:', patientId);
      }
    } else {
      const error = await patientResponse.text();
      console.log('❌ Patient registration failed:', error);
      return;
    }

    // 3. Logout patient and login as doctor
    console.log('🔄 Switching to doctor login...');
    await fetch(`${baseUrl}/api/logout`, {
      method: 'POST',
      credentials: 'include'
    });

    const doctorLoginResponse = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'dr_john',
        password: 'test123'
      }),
      credentials: 'include'
    });

    if (!doctorLoginResponse.ok) {
      console.log('❌ Doctor login failed');
      return;
    }
    console.log('✅ Doctor logged in successfully');

    // 4. Create prescription
    console.log('💊 Creating prescription...');
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

    if (createPrescriptionResponse.ok) {
      const prescription = await createPrescriptionResponse.json();
      console.log('✅ Prescription created successfully:', prescription.id);
    } else {
      const error = await createPrescriptionResponse.text();
      console.log('❌ Prescription creation failed:', error);
      return;
    }

    // 5. Logout doctor and login as patient
    console.log('🔄 Switching to patient login...');
    await fetch(`${baseUrl}/api/logout`, {
      method: 'POST',
      credentials: 'include'
    });

    const patientLoginResponse = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'patient_jane',
        password: 'test123'
      }),
      credentials: 'include'
    });

    if (!patientLoginResponse.ok) {
      console.log('❌ Patient login failed');
      return;
    }
    console.log('✅ Patient logged in successfully');

    // 6. Check patient prescriptions
    console.log('📋 Checking patient prescriptions...');
    const patientPrescriptionsResponse = await fetch(`${baseUrl}/api/patient/prescriptions`, {
      credentials: 'include'
    });

    if (patientPrescriptionsResponse.ok) {
      const prescriptions = await patientPrescriptionsResponse.json();
      console.log('✅ Patient prescriptions retrieved:', prescriptions.length, 'prescriptions found');
      
      if (prescriptions.length > 0) {
        console.log('🎉 PRESCRIPTION FLOW WORKING! Patient can see prescriptions from doctor');
        prescriptions.forEach((rx, index) => {
          console.log(`   Prescription ${index + 1}:`, JSON.parse(rx.medications || '[]'));
        });
      } else {
        console.log('⚠️  No prescriptions found for patient');
      }
    } else {
      const error = await patientPrescriptionsResponse.text();
      console.log('❌ Failed to get patient prescriptions:', error);
    }

    console.log('\n🎊 Prescription flow test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testPrescriptionFlow();