# 🏛️ Smart Hostel Management & Digital Security System

A production-grade, real-time Hostel Management and Security System built with **React, TypeScript, Tailwind CSS, Vite, and Firebase Firestore**.

Designed for colleges and university campuses, this system streamlines student hostel admissions, room bed allocations, biometric attendance monitoring, automated missed attendance alerts, mess dining menus, student grievance tracking, and end-to-end digital security gate pass issuance with automatic next-day expiration and guard QR verification.

---

## 🚀 Key Features

### 1. 🛡️ Digital QR Gate Pass System
- **Real-time Pass Issuance**: Students apply for Outstation Home Leave, Local Outing, or Gym Outing.
- **Warden Office Digital Seal**: Approved passes generate a scannable encrypted QR code (`WDN-SEAL-...`).
- **⏳ Automatic Next-Day Expiration**:
  - If an approved pass is not used by the student on the scheduled departure date, the system automatically transitions the status to **`Expired (Void)`**.
  - Guards at the terminal are strictly disallowed from punching exit for expired passes, and students are prompted to apply for a fresh pass.
- **Lucknow IST Curfew Timetables**: Automated time window checks for 1st-year juniors vs senior students.

### 2. 💪 Hostel Gym Roster Management
- **Warden Gym Terminal**: Warden can enrol admitted hostel students into dedicated daily workout shifts (Morning `06:00 AM - 08:00 AM`, Evening `05:00 PM - 07:00 PM`, Night `07:30 PM - 09:30 PM`).
- **Instant Pre-Approved Gym Gate Pass**: Enrolled students receive permanent daily authorized gym passes (`WDN-GYM-...`).
- **Student Dashboard Badge**: Active gym members can view their assigned shift and show their Gym QR pass in 1 click.
- **Roster Controls**: Search, QR viewer, and membership revocation controls.

### 3. 🚪 Guard Terminal (Main Gate Security)
- **Live Camera QR Scanner**: Built-in camera scanner powered by `html5-qrcode` for instant barcode/QR verification.
- **Fallback Roll Search**: Guard can verify any student by typing their University Roll Number.
- **Biometric Face ID Validation**: Matches camera scan with machine Face ID records.
- **Exit & Re-entry Logs**: Records exact timestamp and guard identity for all campus departures and returns.

### 4. 🛏️ Real-Time Room Directory & Bed Occupancy
- Interactive floor-by-floor visual bed allotment for hostel blocks (Tagore, Ramanujan, Aryabhatta, Kalam).
- Live room directory with vacancy counts and student profile viewing.
- Auto-allotment and room transfer management.

### 5. 📋 Biometric Attendance & Bunk Alerts
- Daily biometric sync with morning and evening window tracking.
- Automated system notices pushed to 1st, 2nd, 3rd, and 4th-year group notice boards for missed punches.
- Bunk detection highlighting repeated absences.

### 6. 🍲 Digital Mess Menu & Nutrition
- Complete 7-day weekly schedule for Breakfast, Lunch, Evening Snacks, and Dinner.
- Daily special dish highlights and calorie counter.

### 7. 🛠️ Student Complaints & Maintenance
- Categorized ticketing (Electricity, Plumbing, Carpentry, Cleaning, Wi-Fi).
- Photo/media upload attachment support with resolution tracking.

---

## 💻 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **QR Scanning & Generation**: `html5-qrcode`, QR Server API
- **Cloud Database**: Firebase Firestore (Real-Time Sync)
- **Tooling**: Vite, ESLint

---

## 🛠️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/hostel-management-system.git
   cd hostel-management-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🔑 Login Access Roles

| Role | Roll No / Identifier | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Student** | Any registered student roll (e.g. `2024CS101`) | Set per student | Apply Passes, View QR, Check Mess, Lodge Complaints, Year Notices |
| **Warden** | Warden Login Button | `warden123` | Approve Passes, Gym Roster, Room Allotment, Notice Broadcasts, Missed Alerts |
| **College Admin**| Admin Login Button | `admin123` | Master Controls, Student Admissions, Room Directory Visibility Toggle |

---

## 📄 License
MIT License. Built for university hostels and campus residences.
