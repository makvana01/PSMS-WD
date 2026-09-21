const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Student = require('./models/Student');
const Company = require('./models/Company');
const Job = require('./models/Job');
const Application = require('./models/Application');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placement_db');
    console.log('MongoDB Connected for Seeding...');
  } catch (error) {
    console.error('DB Connection Error:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  try {
    // Clear existing collections
    await User.deleteMany();
    await Student.deleteMany();
    await Company.deleteMany();
    await Job.deleteMany();
    await Application.deleteMany();

    console.log('Cleared existing data...');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Create Admin
    const adminUser = await User.create({
      name: 'Campus Admin',
      email: 'admin@college.com',
      password: passwordHash,
      role: 'admin',
      isVerified: true
    });

    // 2. Create Companies
    const company1User = await User.create({
      name: 'TechCorp Solutions',
      email: 'techcorp@company.com',
      password: passwordHash,
      role: 'company',
      isVerified: true,
      status: 'Active'
    });

    const company2User = await User.create({
      name: 'InnoTech Innovations',
      email: 'innotech@company.com',
      password: passwordHash,
      role: 'company',
      isVerified: true,
      status: 'Deactive'
    });

    const company1Profile = await Company.create({
      user: company1User._id,
      companyName: 'TechCorp Solutions',
      industry: 'Software Development & IT Support',
      website: 'https://techcorp.example.com',
      location: 'Bangalore, India',
      phone: '+91 9876543210',
      description: 'Leading provider of enterprise web applications and cloud solutions.',
      status: 'Approved'
    });

    const company2Profile = await Company.create({
      user: company2User._id,
      companyName: 'InnoTech Innovations',
      industry: 'Artificial Intelligence & Analytics',
      website: 'https://innotech.example.com',
      location: 'Pune, India',
      phone: '+91 9123456789',
      description: 'Cutting edge AI startup delivering data solutions across Asia.',
      status: 'Deactive'
    });

    // 3. Create Students
    const student1User = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@student.com',
      password: passwordHash,
      role: 'student',
      isVerified: true,
      status: 'Active'
    });

    const student2User = await User.create({
      name: 'Priya Patel',
      email: 'priya@student.com',
      password: passwordHash,
      role: 'student',
      isVerified: true,
      status: 'Deactive'
    });

    await Student.create({
      user: student1User._id,
      phone: '9876500001',
      department: 'BCA',
      passingYear: 2026,
      cgpa: 8.8,
      skills: ['React.js', 'Node.js', 'MongoDB', 'JavaScript', 'CSS'],
      bio: 'Enthusiastic web developer aiming for full-stack software development roles.',
      resumeUrl: '/uploads/resumes/sample-resume.pdf',
      idCardUrl: '/uploads/id-cards/sample-id-card.pdf',
      status: 'Active',
      isDeleted: false
    });

    await Student.create({
      user: student2User._id,
      phone: '9876500002',
      department: 'BCA',
      passingYear: 2026,
      cgpa: 9.2,
      skills: ['Java', 'Spring Boot', 'Python', 'SQL', 'HTML5'],
      bio: 'Passionate programmer with strong analytical problem-solving skills.',
      status: 'Deactive',
      isDeleted: false
    });

    // 4. Create Jobs
    const job1 = await Job.create({
      company: company1User._id,
      companyName: 'TechCorp Solutions',
      title: 'Junior Web Developer (MERN Stack)',
      location: 'Bangalore / Remote',
      salary: '₹6,50,000 - ₹8,00,000 PA',
      eligibility: 'BCA / BSc CS / MCA (CGPA >= 7.5)',
      description: 'We are hiring freshers passionate about React.js, Express, and MongoDB to join our core development team.',
      lastDate: new Date('2026-10-31'),
      status: 'Open',
      approvalStatus: 'Approved'
    });

    const job2 = await Job.create({
      company: company1User._id,
      companyName: 'TechCorp Solutions',
      title: 'Graduate Software Engineer Trainee',
      location: 'Bangalore',
      salary: '₹5,00,000 PA',
      eligibility: 'BCA 2026 Passouts',
      description: 'Comprehensive software trainee program covering cloud backend systems and database engineering.',
      lastDate: new Date('2026-09-15'),
      status: 'Open',
      approvalStatus: 'Approved'
    });

    const job3 = await Job.create({
      company: company2User._id,
      companyName: 'InnoTech Innovations',
      title: 'Associate Data Analyst',
      location: 'Pune / Hybrid',
      salary: '₹7,00,000 PA',
      eligibility: 'BCA / B.Sc with strong SQL & Python knowledge',
      description: 'Analyze client datasets, construct SQL queries, and generate actionable business dashboards.',
      lastDate: new Date('2026-08-30'),
      status: 'Open',
      approvalStatus: 'Approved'
    });

    // 5. Create Applications
    await Application.create({
      job: job1._id,
      student: student1User._id,
      company: company1User._id,
      status: 'Shortlisted'
    });

    await Application.create({
      job: job3._id,
      student: student2User._id,
      company: company2User._id,
      status: 'Applied'
    });

    console.log('--- SEED DATA CREATED SUCCESSFULLY ---');
    console.log('Default Accounts for Evaluation:');
    console.log('1. Admin: admin@college.com / password123');
    console.log('2. Company: techcorp@company.com / password123');
    console.log('3. Student: rahul@student.com / password123');
    console.log('----------------------------------------');

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
