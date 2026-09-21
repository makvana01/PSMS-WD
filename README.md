# PSMS-WD

> **Smart Campus Placement Management System (PSMS)** — Advanced Web Development (AWD) Project

A comprehensive web application designed to streamline campus recruitment and placement drives for colleges and universities. It connects students, placement coordinators/administrators, and corporate recruiters on a single unified platform.

---

## 🚀 Key Features

- **Role-Based Authentication & Portals**:
  - **Student Portal**: Profile management, resume & ID upload, browse job openings, apply with one click, track application status.
  - **Company Portal**: Post jobs & internships, review applicants, download student resumes, update selection stages (Shortlisted, Interview, Selected, Rejected).
  - **Admin / TPO Portal**: Complete oversight of placement drives, approve company registrations, monitor analytics, manage students and company listings.
- **Application Tracking System (ATS)**: Real-time status tracking for every application stage.
- **Email Notifications**: Automated email updates using Nodemailer / Resend for verification and status changes.
- **Secure Authentication**: JWT-based stateless authentication with password hashing using bcrypt.
- **Responsive Modern UI**: Built with React, modern CSS, and Bootstrap Icons.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React.js 18
  - React Router v6
  - Axios
  - Bootstrap 5 & Bootstrap Icons
- **Backend**:
  - Node.js & Express.js
  - MongoDB & Mongoose ORM
  - JSON Web Tokens (JWT) & bcryptjs
  - Multer (File uploads for resumes and ID cards)
  - Nodemailer / Resend (Email service)

---

## 📁 Project Structure

```text
PSMS-WD/
├── client/                     # Frontend React Application
│   ├── public/                 # HTML entry point and static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components & Navbar
│   │   ├── context/            # Auth and App contexts
│   │   ├── pages/              # Role-specific dashboards and views
│   │   ├── services/           # Axios API services
│   │   ├── utils/              # Client utility functions
│   │   ├── App.jsx             # Main router
│   │   └── index.jsx           # React DOM root
│   └── package.json
├── server/                     # Backend Node / Express API
│   ├── config/                 # DB connection and email configuration
│   ├── controllers/            # Request handlers (Auth, Jobs, Applications, Admin)
│   ├── middleware/             # Auth and role validation middleware
│   ├── models/                 # Mongoose schemas (User, Student, Company, Job, Application)
│   ├── routes/                 # Express API routes
│   ├── uploads/                # User document uploads (Resumes, ID cards, Profile pictures)
│   ├── utils/                  # Helper utilities and email sender
│   ├── seed.js                 # Sample database seeder
│   ├── server.js               # Express app entry point
│   ├── .env.example            # Sample environment variables
│   └── package.json
├── .gitignore                  # Git ignore configuration
├── package.json                # Root package.json with concurrent scripts
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB running locally or MongoDB Atlas connection URI

### 1. Installation

Clone the repository and install all dependencies:
```bash
git clone https://github.com/makvana01/PSMS-WD.git
cd PSMS-WD

# Install dependencies for both server and client
npm run install-all
```

### 2. Environment Configuration

Create a `.env` file in the `server/` directory based on `server/.env.example`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/placement_db
JWT_SECRET=your_secret_key_here

EMAIL_PROVIDER=nodemailer
EMAIL_FROM_NAME="Campus Placement Hub"
EMAIL_FROM=your_email@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 3. Seed Sample Data (Optional)

To seed initial companies, students, and job postings:
```bash
npm run seed
```

### 4. Running the Application

To run both frontend and backend concurrently:
```bash
npm run dev
```

- **Frontend Client**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`

---

## 📄 License
This project is licensed under the ISC License.
