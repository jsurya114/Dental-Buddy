# Dental Buddy - Smart Dental EMR System 🦷

Dental Buddy is a comprehensive, modern Electronic Medical Record (EMR) system designed specifically for dental clinics. It facilitates seamless clinic management through role-based access control, patient management, appointment scheduling, and clinical documentation.

## 🚀 Features

### **Role-Based Access Control (RBAC)**
Secure access tailored for every clinic role:
- **Super Admin**: Manage multiple clinics and system-wide settings.
- **Clinic Admin**: Full control over a specific clinic, including staff and settings.
- **Doctor**: Manage patients, appointments, case sheets, prescriptions, and imaging.
- **Receptionist**: Handle patient registration and appointment scheduling.
- **Billing Staff**: Manage invoices and payments.

### **Core Modules**
- **Dashboard**: Role-specific dashboards with quick stats and actions.
- **Patient Management**: Comprehensive patient profiles, history, and demographics.
- **Appointments**: Interactive scheduling system with doctor availability.
- **Case Sheets**: Detailed clinical notes and treatment planning (Context-aware).
- **Prescriptions**: Digital prescriptions linked to case sheets.
- **Imaging**: Store and view patient X-rays and scans.
- **Billing**: Generate invoices and track payments.
- **Reports**: System-wide analytics for clinic performance (Admin/Billing only).

### **Technical Highlights**
- **Context-Aware Design**: Clinical modules (Case Sheets, Prescriptions) are strictly scoped to patients to prevent errors.
- **Secure Authentication**: Robust JWT-based authentication with refresh tokens and HTTP-only cookies.
- **Modern UI**: Clean, professional, flat design using Tailwind CSS.
- **Scalable Architecture**: Built on the MERN stack with multi-clinic capabilities.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18 (Vite)
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios (with interceptors)

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT), bcryptjs
- **Security**: Helmet, CORS, Rate Limiting

---

## 📦 Installation & Setup

### **Prerequisites**
- Node.js (v18+)
- MongoDB (Local or Atlas)



### **2. Backend Setup**
Navigate to the backend directory and install dependencies:
```bash
cd Backend
npm install
```


Start the backend server:
```bash
npm run dev
# or
nodemon app
```

### **3. Frontend Setup**
Navigate to the frontend directory and install dependencies:
```bash
cd ../Frontend
npm install
```

Start the development server:
```bash
npm run dev
```



---



---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

---

## 📄 License

This project is licensed under the MIT License.

---

**Developed with ❤️ by Jayasurya**
