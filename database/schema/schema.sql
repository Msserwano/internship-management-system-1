-- Database Schema for KCCA Internship Management System

CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('applicant', 'hr', 'admin', 'supervisor')),
  phone VARCHAR(30),
  gender VARCHAR(10),
  dob DATE,
  district VARCHAR(50),
  nationality VARCHAR(50) DEFAULT 'Ugandan',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE internships (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  department VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  vacancies INT DEFAULT 1,
  deadline DATE NOT NULL,
  supervisor VARCHAR(100),
  duration VARCHAR(50),
  location VARCHAR(100),
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE applications (
  id VARCHAR(50) PRIMARY KEY,
  internship_id VARCHAR(50) REFERENCES internships(id),
  applicant_id VARCHAR(50) REFERENCES users(id),
  university VARCHAR(150) NOT NULL,
  course VARCHAR(150) NOT NULL,
  gpa NUMERIC(3,2),
  status VARCHAR(30) DEFAULT 'submitted',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE interviews (
  id VARCHAR(50) PRIMARY KEY,
  application_id VARCHAR(50) REFERENCES applications(id),
  interview_date DATE NOT NULL,
  interview_time VARCHAR(20) NOT NULL,
  venue TEXT NOT NULL,
  meeting_link TEXT,
  status VARCHAR(20) DEFAULT 'scheduled'
);
