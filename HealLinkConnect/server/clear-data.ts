import { db } from "./db";
import { users, doctors, patients, pharmacies, prescriptions, appointments } from "../shared/schema-sqlite";

async function clearAllData() {
  console.log('🗑️  Starting database cleanup...');
  
  try {
    // Delete all data in reverse dependency order to avoid foreign key constraints
    console.log('Deleting appointments...');
    await db.delete(appointments);
    
    console.log('Deleting prescriptions...');
    await db.delete(prescriptions);
    
    console.log('Deleting doctors...');
    await db.delete(doctors);
    
    console.log('Deleting patients...');
    await db.delete(patients);
    
    console.log('Deleting pharmacies...');
    await db.delete(pharmacies);
    
    console.log('Deleting users...');
    await db.delete(users);
    
    console.log('✅ All data cleared successfully!');
    console.log('🎉 Database is now clean and ready for fresh data!');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
}

// Run the cleanup
clearAllData();