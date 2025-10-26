import Database from 'better-sqlite3';

const sqlite = new Database('./dev.db');

// Create tables
const createTables = `
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    abha_id TEXT UNIQUE,
    created_at INTEGER
);

CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    hospital TEXT NOT NULL,
    license_number TEXT NOT NULL,
    phone TEXT,
    email TEXT
);

CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    date_of_birth INTEGER,
    blood_group TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    emergency_contact TEXT,
    insurance_info TEXT
);

CREATE TABLE IF NOT EXISTS pharmacies (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    license_number TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    email TEXT
);

CREATE TABLE IF NOT EXISTS prescriptions (
    id TEXT PRIMARY KEY,
    doctor_id TEXT NOT NULL REFERENCES doctors(id),
    patient_id TEXT NOT NULL REFERENCES patients(id),
    medications TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    instructions TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at INTEGER,
    valid_until INTEGER
);

CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    doctor_id TEXT NOT NULL REFERENCES doctors(id),
    patient_id TEXT NOT NULL REFERENCES patients(id),
    appointment_date INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_at INTEGER
);

CREATE TABLE IF NOT EXISTS consent_requests (
    id TEXT PRIMARY KEY,
    from_user_id TEXT NOT NULL REFERENCES users(id),
    to_patient_id TEXT NOT NULL REFERENCES patients(id),
    purpose TEXT NOT NULL,
    data_types TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at INTEGER,
    responded_at INTEGER
);
`;

try {
    sqlite.exec(createTables);
    console.log('Database tables created successfully!');
} catch (error) {
    console.error('Error creating tables:', error);
}

sqlite.close();