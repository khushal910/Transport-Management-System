# 📦 FleetFlow - Fleet Management System
## Complete Technical & Business Documentation

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [System Architecture](#-system-architecture)
4. [Core Features](#-core-features)
5. [Role-Based Access Control](#-role-based-access-control)
6. [Email Notifications & Communication](#-email-notifications--communication)
7. [API Documentation](#-api-documentation)
8. [Business Logic Rules](#-business-logic-rules)
9. [Real-World Workflow](#-real-world-workflow)
10. [Database Design](#-database-design)
11. [Error Handling](#-error-handling)
12. [UI & Navigation](#-ui--navigation)
13. [Future Scope](#-future-scope)

---

## 🎯 Project Overview

### What is FleetFlow?

**FleetFlow** is a modern, cloud-based **Fleet Management SaaS (Software as a Service)** platform designed to help logistics companies manage their vehicles, drivers, trips, and operations efficiently. 

Think of it as a **central command center** for your entire fleet!

### Problem It Solves

🚚 **Before FleetFlow:**
- Manual diary/spreadsheets to track vehicles
- No real-time visibility of trips
- Difficult to plan maintenance
- Hard to analyze fuel costs
- No driver performance tracking

✅ **With FleetFlow:**
- Complete digital fleet visibility
- Automated trip management
- Predictive maintenance alerts
- Detailed expense tracking & analytics
- Driver safety & performance monitoring

### Target Users

| User Type | What They Do |
|-----------|-------------|
| **Fleet Manager** | Oversees entire fleet, makes strategic decisions, views analytics |
| **Dispatcher** | Creates & assigns trips, tracks real-time status |
| **Driver** | Completes assigned trips, updates vehicle status |
| **Safety Officer** | Monitors maintenance schedules, vehicle compliance |
| **Financial Analyst** | Analyzes expenses, fuel consumption, cost optimization |

### Real-World Example

**Scenario:** Surat-based logistics company "TransFlow India" with 50 trucks

```
Day starts:
- Manager logs in → Views 10 active trips on dashboard
- Dispatcher gets new order: "Deliver 400kg cargo from Surat to Ahmedabad"
- Dispatcher creates trip with Truck-12 (capacity: 500kg)
- Driver notified → Accepts trip
- Real-time tracking → Shows location & progress
- Trip completed → Automatically generates expense report
- Maintenance alert → "Truck-12 due for service in 2 days"
- Analytics dashboard → Shows daily revenue, fuel efficiency, driver performance
```

---

## ⚙️ Tech Stack

### **Frontend: React.js + Tailwind CSS**
- Modern, interactive UI for desktop & tablets
- Real-time updates with component state management
- Responsive charts and data visualizations
- Dark & Light theme support for user comfort

### **Backend: Node.js + Express.js**
- RESTful API for all operations
- Fast request handling and processing
- Modular middleware for authentication & validation
- Error handling and logging system

### **Database: MongoDB**
- NoSQL database for flexible data storage
- Collections for vehicles, drivers, trips, expenses
- Efficient indexing for fast queries
- Cloud-hosted (MongoDB Atlas) for scalability

### **Additional Libraries**
- **JWT (JSON Web Tokens)** - Secure user authentication
- **Axios** - HTTP client for API calls
- **Chart.js** - Beautiful data visualizations
- **Lucide Icons** - Professional UI icons
- **Tailwind CSS** - Utility-first CSS framework

---

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    FRONTEND (React.js)                     │
│   ┌──────────────────────────────────────────────────┐    │
│   │ Dashboard │ Vehicles │ Trips │ Maintenance │ ... │    │
│   │         (Responsive, Interactive UI)            │    │
│   └──────────────────────────────────────────────────┘    │
│                    ↕ (HTTP/REST)                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    BACKEND (Node.js)                       │
│   ┌──────────────────────────────────────────────────┐    │
│   │ Auth Routes │ Vehicle Routes │ Trip Routes │      │    │
│   │ └─ Controllers                                     │    │
│   │ └─ Middleware (Auth, Validation)                 │    │
│   │ └─ Error Handling                                │    │
│   └──────────────────────────────────────────────────┘    │
│                    ↕ (MongoDB Query)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                DATABASE (MongoDB)                          │
│   ┌──────────────────────────────────────────────────┐    │
│   │ Vehicles │ Drivers │ Trips │ Expenses │ Users │  │    │
│   │                (Collections)                     │    │
│   └──────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### REST API Structure

All API endpoints follow REST conventions:

```
Base URL: http://localhost:3000/api

Pattern:
- GET    /resource          → Fetch all
- GET    /resource/:id      → Fetch one
- POST   /resource          → Create new
- PUT    /resource/:id      → Update
- DELETE /resource/:id      → Delete
```

### Modular Design

```
Backend Structure:
├── controllers/      (Business logic)
│   ├── vehicle.js
│   ├── driver.js
│   ├── trip.js
│   └── expense.js
├── models/          (Database schemas)
│   ├── vehicle.schema.js
│   ├── driver.schema.js
│   └── trip.schema.js
├── routes/          (API endpoints)
│   ├── vehicle.route.js
│   ├── driver.route.js
│   └── trip.route.js
├── middlewares/     (Auth, validation)
│   ├── auth.middleware.js
│   └── role.middleware.js
└── config/          (Database, settings)
    └── dbConnection.js
```

---

## ✨ Core Features

### 1. 🚗 **Vehicle Management**
- ✅ Add/Edit/Delete vehicles
- ✅ Track vehicle status (Available, On Trip, In Shop, Maintenance)
- ✅ Capacity management (max weight/volume)
- ✅ Fuel type and consumption tracking
- ✅ Vehicle photos & documentation
- ✅ License plate and registration tracking

### 2. 👨‍💼 **Driver Management**
- ✅ Add/Edit/Delete drivers
- ✅ License expiration tracking
- ✅ Driver performance metrics (ratings, trips completed)
- ✅ Contact information & emergency details
- ✅ Driver status (Active, On Leave, License Expired)
- ✅ Salary & compensation tracking

### 3. 🛣️ **Trip Management**
- ✅ Create new trips with route & cargo details
- ✅ Assign driver & vehicle
- ✅ Real-time status updates (Draft → Dispatched → Completed)
- ✅ Cargo details (weight, volume, fragile items)
- ✅ Pickup & delivery locations
- ✅ Time estimates & actual duration

### 4. 🔧 **Maintenance & Service Logs**
- ✅ Schedule maintenance tasks
- ✅ Log completed maintenance work
- ✅ Service history for each vehicle
- ✅ Cost tracking for maintenance
- ✅ Preventive maintenance reminders
- ✅ Spare parts inventory tracking

### 5. ⛽ **Fuel & Expense Tracking**
- ✅ Record fuel consumption per trip
- ✅ Track fuel prices & cost analysis
- ✅ Tolls, parking, and miscellaneous expenses
- ✅ Trip-wise expense breakdown
- ✅ Monthly expense reports
- ✅ Budget vs. actual comparison

### 6. 📊 **Analytics Dashboard**
- ✅ KPI cards (Total Trips, Revenue, Fleet Status, Alerts)
- ✅ Revenue trend charts
- ✅ Vehicle utilization rates
- ✅ Driver performance rankings
- ✅ Fuel efficiency analysis
- ✅ Expense trends & forecasting
- ✅ Performance metrics (on-time %, fuel consumption %)

### 7. 📧 **Email Notifications & Communication**
- ✅ Automatic email notifications when employee details are updated
- ✅ Employee receives updates showing: name, email, role, or password changes
- ✅ Professional HTML email templates with security notices
- ✅ Password reset & account setup emails
- ✅ Employee account deactivation notifications
- ✅ Manager-initiated communication system
- ✅ Secure email delivery with error tracking

---

## 🔐 Role-Based Access Control

### **System Overview**

FleetFlow implements strict **Role-Based Access Control (RBAC)** to ensure data security and operational integrity. Each user role has defined permissions, accessible pages, and data view limitations.

### **Available User Roles**

| Role | Icon | Level | Access Type |
|------|------|-------|-------------|
| **Manager** | 👑 | Full | Administrative - Complete access |
| **Dispatcher** | 🚚 | Operations | Limited - Operations focus |
| **Safety Officer** | 🛡️ | Compliance | Restricted - Safety metrics only |
| **Financial Analyst** | 📊 | Finance | Restricted - Financial metrics only |

---

### **1. 👑 Manager Role**

**Access Level:** Full Administrative Access

**Accessible Pages:**
- ✅ Dashboard (Full data)
- ✅ Vehicle Registry (Add/Edit/Delete)
- ✅ Trip Dispatcher
- ✅ Driver Registry / Team
- ✅ Employee Management (Add/Edit/Delete)
- ✅ Maintenance Scheduling
- ✅ Trip Expense Management
- ✅ Performance Analytics
- ✅ System Analytics

**Capabilities:**
- Create, edit, delete vehicles
- Assign drivers to trips
- Manage employee accounts (create, update, delete)
- Schedule and update maintenance
- View all financial data
- Generate all reports
- Update employee details (triggers email notification to employee)
- Assign roles to team members
- Access system-wide analytics

**Example Usage:**
```
Manager Action → Employee Update
1. Manager edits employee in Team page
2. Changes: Name, Email, Role, or Password
3. Employee receives professional email notification
4. Email shows: What was changed and timestamp
5. Log entry created in system audit trail
```

---

### **2. 🚚 Dispatcher Role**

**Access Level:** Operations Focus (Limited Administrative)

**Accessible Pages:**
- ✅ Dashboard (Limited - Operations data only)
- ✅ Vehicle Registry (View Only)
- ✅ Driver Registry (View Only)
- ✅ Trip Dispatcher (Create/Edit/Assign trips)

**Cannot Access:**
- ❌ Employee/Team Management
- ❌ Maintenance Scheduling
- ❌ Financial/Expense Data
- ❌ Analytics (except operations dashboard)
- ❌ System Settings

**View Limitations:**
- Dashboard shows only: Active trips, Vehicle status, Driver availability
- Cannot see: Employee personal data, Salary info, Financial metrics
- Can view vehicle details but cannot modify them
- Can view driver info but cannot edit roles/permissions

**Capabilities:**
- Create and dispatch new trips
- Assign available vehicles to trips
- Assign available drivers to trips
- Update trip status (Draft → Dispatched → In Progress → Completed)
- View real-time vehicle locations
- Track trip progress

**Example Usage:**
```
Dispatcher Workflow:
1. New order received: "Deliver cargo from Surat to Vadodara"
2. Dispatcher views available vehicles → Sees Truck-12 (Available)
3. Dispatcher views available drivers → Sees Rajesh (Available)
4. Creates Trip: Assign Truck-12 + Rajesh
5. Trip status updated → Real-time tracking enabled
✓ Cannot: Edit trip expenses, view maintenance schedule, or access employee contacts
```

---

### **3. 🛡️ Safety Officer Role**

**Access Level:** Compliance & Safety Focus (Restricted)

**Accessible Pages:**
- ✅ Dashboard (Safety metrics only)
- ✅ Performance Analytics (Driver safety & compliance)

**Cannot Access:**
- ❌ Vehicle Management
- ❌ Trip Dispatcher
- ❌ Driver Registry
- ❌ Employee Management
- ❌ Maintenance Scheduling
- ❌ Financial Data
- ❌ System Settings

**View Limitations:**
- Dashboard shows only: Driver safety scores, Maintenance due dates, Compliance alerts
- Can see: Driver performance ratings, License expiration dates
- Cannot see: Personal driver info, Contact details, Financial data
- Cannot make modifications to any data

**Capabilities:**
- Monitor driver performance & safety metrics
- View compliance alerts & schedules
- Access driver performance rankings
- Generate safety compliance reports
- View maintenance requirements & schedules
- Track vehicle inspection history

**Example Usage:**
```
Safety Officer Workflow:
1. Dashboard shows: "Driver Rajesh - Safety Score: 94%"
2. Sees alert: "Truck-12 maintenance due in 3 days"
3. Views: Driver performance history across all trips
4. Cannot: Modify driver info, assign vehicles, view financial data
✓ Pure monitoring & compliance role
```

---

### **4. 📊 Financial Analyst Role**

**Access Level:** Finance & Analytics Focus (Restricted)

**Accessible Pages:**
- ✅ Dashboard (Financial metrics only)
- ✅ Trip Expense Management
- ✅ System Analytics

**Cannot Access:**
- ❌ Vehicle Management
- ❌ Trip Dispatcher
- ❌ Driver Registry
- ❌ Employee Management
- ❌ Maintenance Scheduling
- ❌ Performance Analytics (driver safety)
- ❌ System Settings

**View Limitations:**
- Dashboard shows only: Revenue, expenses, fuel costs, profit margins
- Can see: Trip-wise expenses, fuel consumption costs, maintenance expenses
- Cannot see: Driver personal info, Employee details, Vehicle maintenance history
- Cannot make modifications to operational data

**Capabilities:**
- View all expense data
- Analyze cost trends & patterns
- Generate financial reports
- View revenue analytics
- Track fuel efficiency costs
- Budget vs. actual comparisons
- Export financial data for analysis

**Example Usage:**
```
Financial Analyst Workflow:
1. Dashboard shows: "Monthly Revenue: ₹2,50,000"
2. Views: Trip expenses breakdown
3. Analyzes: "Fuel costs increased by 12% vs last month"
4. Generates report: "Cost optimization recommendations"
5. Cannot: Create trips, view driver names, access employee records
✓ Pure financial analysis role
```

---

### **RBAC Summary Table**

| Feature | Manager | Dispatcher | Safety Officer | Financial Analyst |
|---------|---------|-----------|----------------|-------------------|
| **Dashboard** | ✅ Full | ✅ Limited | ✅ Safety Only | ✅ Finance Only |
| **Vehicles** | ✅ Full CRUD | ✅ View Only | ❌ No Access | ❌ No Access |
| **Trips** | ✅ Full CRUD | ✅ Create/Assign | ❌ No Access | ❌ No Access |
| **Drivers** | ✅ Full CRUD | ✅ View Only | ✅ View Performance | ❌ No Access |
| **Employees** | ✅ Full CRUD | ❌ No Access | ❌ No Access | ❌ No Access |
| **Maintenance** | ✅ Full CRUD | ❌ No Access | ✅ View Only | ❌ No Access |
| **Expenses** | ✅ Full Access | ❌ No Access | ❌ No Access | ✅ View Only |
| **Analytics** | ✅ Full Reports | ❌ Dashboard Only | ✅ Safety Reports | ✅ Finance Reports |
| **Email Notifications** | ✅ Sends (when updating employees) | ❌ Receives Only | ❌ Receives Only | ❌ Receives Only |

---

### **Security Rules**

```
1. Authentication Required
   - All endpoints require valid JWT token
   - Token expires after inactivity
   - Automatic logout on 401 error

2. Authorization Check
   - Every request validated against user role
   - Unauthorized access returns 403 Forbidden
   - Audit logs track all access attempts

3. Data Isolation
   - Users see only data for their company
   - Multi-tenant isolation enforced
   - No cross-company data leakage

4. Email Notifications
   - Sent only to employee being updated
   - Manager/Admin can trigger emails
   - Security notice included in email
```

---

## 📧 Email Notifications & Communication

### **System Overview**

FleetFlow uses **Nodemailer with Gmail SMTP** to send professional email notifications. All emails are HTML-formatted with enterprise-grade design and security considerations.

### **Email Configuration**

**Required Environment Variables (.env):**
```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
CLIENT_URL=http://localhost:5173
```

**Setup Instructions:**
1. Enable 2-Factor Authentication on Gmail account
2. Generate App-Specific Password: https://myaccount.google.com/apppasswords
3. Add credentials to `.env` file
4. Restart backend server

### **Email Types & Triggers**

#### **1. 📋 Employee Details Updated Email**

**Trigger:** When manager updates employee information (name, email, role, or password)

**Recipients:** Updated employee (on their registered email)

**Sender:** Automated system (EMAIL_USER from .env)

**Content:**
```
To: employee@company.com
Subject: Your Account Details Have Been Updated
From: system@fleetflow.com

Email Body:
- Header: "Account Details Updated"
- Updated fields list (what changed)
- Timestamp of update
- Security notice: "If unauthorized, contact manager"
- Help section with contact info
```

**Detailed Update Information Shown:**
```javascript
Updated Fields:
- Name: "Rajesh Kumar" (if changed)
- Email: "new.email@company.com" (if changed)
- Role: "Dispatcher" (if changed)
- Password: "Updated" (if changed)
```

**Real-World Example:**
```
Manager Updates Employee:
1. Opens Team/Employee page
2. Clicks edit on "Rajesh Kumar"
3. Changes:
   - Name: "Rajesh Kumar" → "Rajesh K. Singh"
   - Role: "Driver" → "Dispatcher"
4. Saves changes
5. System sends email to Rajesh's email
6. Email shows:
   ✓ Name updated to: "Rajesh K. Singh"
   ✓ Role updated to: "Dispatcher"
   ✓ Updated on: March 26, 2024 at 2:30 PM
   ✓ Security notice included
```

**Implementation Details:**
```typescript
// Backend Controller: update.employee.ts
- Tracks which fields were updated
- Calls sendEmployeeDetailsUpdatedEmail()
- Sends only if changes were made
- Logs email delivery status

// Email Service: email.service.ts
- Generates professional HTML template
- Includes company branding
- Shows all modified fields
- Provides security guidance
```

---

#### **2. 🔑 Password Reset Email**

**Trigger:** Employee requests password reset

**Recipients:** Employee requesting reset

**Content:**
- Password reset link (24-hour expiration)
- Instructions for creating new password
- Security notice
- Click-to-reset button

**Example:**
```
Subject: Password Reset Request - Fleet Management System

Email includes:
- Reset link with token
- 24-hour expiration notice
- If unauthorized, ignore warning
- Copy/paste URL option
- Security advice about strong passwords
```

---

#### **3. 🎉 Employee Account Setup Email**

**Trigger:** New employee account created

**Recipients:** New employee (on assigned email)

**Content:**
- Welcome message
- Account setup instructions
- Temporary setup link (24-hour expiration)
- Required password strength guidelines
- Security tips

**Example:**
```
Subject: Welcome to Fleet Management System - Set Your Password

Email includes:
- Welcome greeting with name
- Instructions to set password
- Setup link with token
- Password strength requirements
- Security tips & best practices
```

---

#### **4. ❌ Employee Account Deactivation Email**

**Trigger:** Manager deletes/deactivates employee

**Recipients:** Deactivated employee

**Content:**
- Deactivation notice
- Employee information summary
- Deactivation date & reason
- Appeal instructions
- HR contact information

**Example:**
```
Subject: Employee Account Deactivated - Fleet Management System

Email includes:
- Account status: Deactivated (red highlight)
- Employee name & company
- Deactivation date
- Access removal notice
- HR contact for questions
```

---

### **Email Template Features**

**Universal Elements in All Emails:**
```
1. Professional Header
   - Company branding
   - Clear subject line
   - Timestamp

2. Main Content
   - Clear action/change description
   - Relevant details
   - Status indicators

3. Security Section
   - "If unauthorized..."
   - "Contact manager"
   - "Never share password"

4. Footer
   - Automated message notice
   - Company copyright
   - Do not reply notice
```

**Visual Design:**
```
- Color Scheme: Blue (#3b82f6), Green (#10b981), Red (#dc2626)
- Font: Arial, sans-serif
- Max Width: 600px (mobile responsive)
- Professional spacing & padding
- Clear call-to-action buttons
```

---

### **Email Delivery Process**

```
Flowchart:
┌─────────────────────────────────────┐
│ 1. Event Triggered                  │
│ (Employee updated, account created) │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ 2. Email Function Called            │
│ (sendEmployeeDetailsUpdatedEmail)   │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ 3. Template Generated               │
│ (HTML formatted with data)          │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ 4. Nodemailer Transporter           │
│ (Gmail SMTP connection)             │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ 5. Email Sent                       │
│ (Delivery to inbox)                 │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ 6. Confirmation                     │
│ (Success/Error logged)              │
└─────────────────────────────────────┘
```

---

### **Error Handling & Troubleshooting**

**If emails don't send:**

1. **Check .env Configuration**
   ```
   ✓ EMAIL_USER is set
   ✓ EMAIL_PASSWORD is app-specific (not regular password)
   ✓ CLIENT_URL is correct
   ✓ No spaces in credentials
   ```

2. **Verify Gmail Setup**
   - 2-Factor Authentication enabled
   - App-Specific Password generated (not regular password)
   - Less secure app access disabled (use App Password instead)

3. **Check Email Logs**
   ```
   Backend Console Output:
   ✓ "Email transporter ready to send emails"
   ✓ "Employee details updated email sent successfully to: email@example.com"
   ```

4. **Test Email Delivery**
   - Update employee details
   - Check employee's email inbox (including spam folder)
   - Verify email content matches expectations

5. **Common Errors**
   ```
   Error: Email credentials not configured
   Solution: Set EMAIL_USER and EMAIL_PASSWORD in .env

   Error: Invalid credentials
   Solution: Use app-specific password, not regular Gmail password

   Error: 535 Unsuccessful SMTP authentication
   Solution: Enable 2FA and generate new app password
   ```

---

### **Email Notification Use Cases**

**Scenario 1: Name Change Notification**
```
Manager updates employee "Rajesh" to "Rajesh Singh"
Email sent to: rajesh.singh@company.com
Subject line: "Your Account Details Have Been Updated"
Shows: ✓ Name: Rajesh Singh
```

**Scenario 2: Role Promotion Notification**
```
Manager changes employee role from "Driver" to "Dispatcher"
Email sent to: employee@company.com
Subject line: "Your Account Details Have Been Updated"
Shows: ✓ Role: Dispatcher
```

**Scenario 3: Password Reset Notification**
```
Manager updates employee password for security
Email sent to: employee@company.com
Subject line: "Your Account Details Have Been Updated"
Shows: ✓ Password: Updated
Content: "Your password has been updated by your manager"
```

---

## 🔌 API Documentation

### **Authentication APIs**

#### 1️⃣ **User Registration**
```
Endpoint:    POST /api/auth/register
Method:      POST
Description: Create new company account with admin user
Purpose:     Onboarding new logistics company to FleetFlow

Request Body:
{
  "companyName": "TransFlow India Pvt Ltd",
  "registrationNumber": "GST123456789",
  "email": "admin@transflow.com",
  "password": "SecurePass123!",
  "phone": "+919876543210",
  "address": "456 Business Park, Surat, Gujarat"
}

Response (201 Created):
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "_id": "6478a9b2c3d4e5f6g7h8",
      "name": "Admin",
      "email": "admin@transflow.com",
      "role": "admin",
      "company": "6478a9b2c3d4e5f6g7h8"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}

Error Responses:
- 400 Bad Request: Email already registered
- 400 Bad Request: Missing required fields
- 500 Server Error: Database connection failed

Real-World Example:
Company: Surat-based logistics startup with 10 trucks
→ CEO registers on FleetFlow
→ Gets admin account
→ Invites his team members (dispatcher, manager)
```

---

#### 2️⃣ **User Login**
```
Endpoint:    POST /api/auth/login
Method:      POST
Description: Authenticate user and get JWT token
Purpose:     Allow registered users to access FleetFlow

Request Body:
{
  "email": "admin@transflow.com",
  "password": "SecurePass123!"
}

Response (200 OK):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "6478a9b2c3d4e5f6g7h8",
      "name": "Admin",
      "email": "admin@transflow.com",
      "role": "admin",
      "company": {
        "_id": "6478a9b2c3d4e5f6g7h7",
        "name": "TransFlow India Pvt Ltd",
        "registrationNumber": "GST123456789",
        "phone": "+919876543210",
        "address": "456 Business Park, Surat, Gujarat"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

Error Responses:
- 400 Bad Request: Invalid email/password
- 404 Not Found: User doesn't exist
- 401 Unauthorized: Incorrect password

Real-World Example:
Dispatcher arrives at office
→ Opens FleetFlow app
→ Enters credentials
→ Gets authenticated
→ Can now create and assign trips
```

---

### **Vehicle APIs**

#### 3️⃣ **Create New Vehicle**
```
Endpoint:    POST /api/vehicles
Method:      POST
Description: Add a new vehicle to the fleet
Purpose:     Register trucks, vans, bikes in the system
Authorization: Required (Manager/Admin only)

Request Body:
{
  "licensePlate": "GJ-01-AB-1234",
  "vehicleType": "truck",
  "manufacturer": "Tata",
  "model": "407",
  "year": 2022,
  "capacity": {
    "maxWeight": 5000,      // kg
    "maxVolume": 25         // cubic meters
  },
  "fuelType": "diesel",
  "mileage": 8.5,           // km per liter
  "registrationExpiry": "2025-12-31",
  "insuranceExpiry": "2025-06-30",
  "status": "available",
  "lastServiceDate": "2024-01-15",
  "nextServiceDueDate": "2024-04-15"
}

Response (201 Created):
{
  "success": true,
  "message": "Vehicle added successfully",
  "data": {
    "_id": "6478b1c2d3e4f5g6h7i8",
    "licensePlate": "GJ-01-AB-1234",
    "vehicleType": "truck",
    "capacity": { "maxWeight": 5000, "maxVolume": 25 },
    "status": "available",
    "createdAt": "2024-03-26T10:30:00Z"
  }
}

Error Responses:
- 400 Bad Request: License plate already exists
- 400 Bad Request: Invalid capacity values
- 403 Forbidden: Only manager/admin can add vehicles
- 401 Unauthorized: Token required

Real-World Example:
TransFlow buys new Tata 407 truck
→ Manager logs in
→ Goes to Vehicle Management
→ Fills form: License plate (GJ-01-AB-1234), capacity (5000kg)
→ Vehicle added to system
→ Dispatcher can now assign trips to this truck
```

---

#### 4️⃣ **Get All Vehicles**
```
Endpoint:    GET /api/vehicles
Method:      GET
Description: Fetch all vehicles in the fleet
Purpose:     View entire fleet inventory with status
Authorization: Required

Query Parameters:
- status=available        (Filter by status)
- vehicleType=truck       (Filter by type)
- page=1&limit=10         (Pagination)

Response (200 OK):
{
  "success": true,
  "message": "Vehicles fetched successfully",
  "data": [
    {
      "_id": "6478b1c2d3e4f5g6h7i8",
      "licensePlate": "GJ-01-AB-1234",
      "vehicleType": "truck",
      "manufacturer": "Tata",
      "model": "407",
      "capacity": { "maxWeight": 5000, "maxVolume": 25 },
      "status": "available",
      "fuelType": "diesel",
      "mileage": 8.5,
      "lastServiceDate": "2024-01-15",
      "nextServiceDueDate": "2024-04-15"
    },
    {
      "_id": "6478b1c2d3e4f5g6h7i9",
      "licensePlate": "GJ-01-AB-1235",
      "vehicleType": "van",
      "status": "on_trip"
    }
  ],
  "totalCount": 50,
  "currentPage": 1,
  "totalPages": 5
}

Real-World Example:
Manager wants to check fleet status
→ GET /api/vehicles?status=available
→ Shows 35 vehicles available for new trips
→ Shows 10 vehicles on trips
→ Shows 5 vehicles in maintenance
→ Can plan new trips accordingly
```

---

#### 5️⃣ **Update Vehicle Status**
```
Endpoint:    PUT /api/vehicles/:id/status
Method:      PUT
Description: Change vehicle status
Purpose:     Update vehicle availability for dispatch
Authorization: Required (Dispatcher/Manager)

URL Parameter:
:id = 6478b1c2d3e4f5g6h7i8

Request Body:
{
  "status": "on_trip"        // available | on_trip | in_shop | maintenance
}

Response (200 OK):
{
  "success": true,
  "message": "Vehicle status updated",
  "data": {
    "_id": "6478b1c2d3e4f5g6h7i8",
    "licensePlate": "GJ-01-AB-1234",
    "status": "on_trip",
    "previousStatus": "available",
    "updatedAt": "2024-03-26T14:45:00Z"
  }
}

Real-World Example:
Trip created: Surat → Ahmedabad with Truck-12
→ Truck-12 status: available → on_trip
→ Other dispatchers can't assign this truck
→ Trip completed
→ Truck-12 status: on_trip → available
```

---

### **Trip APIs**

#### 6️⃣ **Create New Trip**
```
Endpoint:    POST /api/trips
Method:      POST
Description: Create and dispatch a new trip
Purpose:     Assign delivery/pickup task to vehicle & driver
Authorization: Required (Dispatcher/Manager)

Request Body:
{
  "tripNumber": "TRIP-2024-001234",
  "vehicle": "6478b1c2d3e4f5g6h7i8",      // Vehicle ID
  "driver": "6478b1c2d3e4f5g6h7i9",       // Driver ID
  "pickupLocation": {
    "address": "ABC Warehouse, Surat",
    "latitude": "21.1702",
    "longitude": "72.8479"
  },
  "deliveryLocation": {
    "address": "XYZ Factory, Ahmedabad",
    "latitude": "23.0225",
    "longitude": "72.5714"
  },
  "cargo": {
    "description": "400kg Electronic Components",
    "weight": 400,           // kg
    "volume": 2.5,          // cubic meters
    "isFragile": true,
    "specialHandling": "Keep upright, avoid moisture"
  },
  "tripStartDate": "2024-03-27T08:00:00Z",
  "estimatedEndDate": "2024-03-27T16:00:00Z",
  "status": "draft"
}

Response (201 Created):
{
  "success": true,
  "message": "Trip created successfully",
  "data": {
    "_id": "6478b1c2d3e4f5g6h7i10",
    "tripNumber": "TRIP-2024-001234",
    "vehicle": {
      "_id": "6478b1c2d3e4f5g6h7i8",
      "licensePlate": "GJ-01-AB-1234",
      "capacity": { "maxWeight": 5000 }
    },
    "driver": { "_id": "6478b1c2d3e4f5g6h7i9", "name": "Rajesh" },
    "cargo": { "weight": 400, "volume": 2.5 },
    "status": "draft",
    "createdAt": "2024-03-26T10:00:00Z"
  }
}

Error Responses:
- 400 Bad Request: Cargo weight (400kg) exceeds vehicle capacity
- 400 Bad Request: Driver license expired
- 404 Not Found: Vehicle doesn't exist
- 400 Bad Request: Vehicle already on another trip

Real-World Example:
Customer order received: "400kg goods Surat → Ahmedabad"
→ Dispatcher checks available trucks: Truck-12 (5000kg capacity) ✓
→ Checks available drivers: Rajesh (license valid) ✓
→ Creates trip with Truck-12 + Rajesh
→ Trip status: draft
→ Dispatcher clicks "Dispatch"
→ Trip status: dispatched → Driver sees notification
```

---

#### 7️⃣ **Update Trip Status**
```
Endpoint:    PUT /api/trips/:id/status
Method:      PUT
Description: Update trip completion status
Purpose:     Track trip progress (dispatched → in_progress → completed)
Authorization: Required (Driver/Dispatcher)

Request Body:
{
  "status": "completed",           // draft | dispatched | in_progress | completed | cancelled
  "actualEndTime": "2024-03-27T15:45:00Z",
  "notes": "Delivered successfully, customer signed"
}

Response (200 OK):
{
  "success": true,
  "message": "Trip status updated",
  "data": {
    "_id": "6478b1c2d3e4f5g6h7i10",
    "tripNumber": "TRIP-2024-001234",
    "status": "completed",
    "actualEndTime": "2024-03-27T15:45:00Z",
    "duration": "7 hours 45 minutes",
    "totalDistance": 143,      // km
    "fuelUsed": 16.8,          // liters
    "expense": {
      "fuelCost": 1512,        // Rs. 90/liter
      "tollCost": 200,
      "parkingCost": 50,
      "totalExpense": 1762
    }
  }
}

Real-World Example:
Driver Rajesh completed Surat → Ahmedabad delivery
→ Driver clicks "Mark as Completed"
→ Takes photo of delivery proof
→ Enters notes: "Goods delivered, signed by warehouse manager"
→ System automatically calculates:
   - Fuel used: 16.8 liters
   - Fuel cost: Rs. 1512
   - Trip duration: 7 hours 45 minutes
→ Trip marked as completed
→ Revenue recorded: Trip revenue - Fuel cost - Toll = Net profit
```

---

### **Maintenance APIs**

#### 8️⃣ **Schedule Maintenance**
```
Endpoint:    POST /api/maintenance/schedule
Method:      POST
Description: Schedule maintenance for a vehicle
Purpose:     Keep track of planned maintenance tasks
Authorization: Required (Manager/Admin)

Request Body:
{
  "vehicle": "6478b1c2d3e4f5g6h7i8",         // Vehicle ID
  "maintenanceType": "oil_change",            // oil_change | tire_change | brake_service | full_service
  "scheduledDate": "2024-04-15T09:00:00Z",
  "estimatedCost": 3500,
  "description": "Regular oil and filter change",
  "priority": "high"                          // low | medium | high
}

Response (201 Created):
{
  "success": true,
  "message": "Maintenance scheduled",
  "data": {
    "_id": "6478b1c2d3e4f5g6h7i11",
    "vehicle": { "licensePlate": "GJ-01-AB-1234" },
    "maintenanceType": "oil_change",
    "scheduledDate": "2024-04-15T09:00:00Z",
    "estimatedCost": 3500,
    "status": "scheduled",
    "createdAt": "2024-03-26T10:00:00Z"
  }
}

Real-World Example:
Truck-12 has run 45,000 km since last oil change
→ Safety officer checks maintenance schedule
→ Sees "Oil change due in 5,000 km"
→ Schedules maintenance for next Monday
→ System sends reminder to manager
→ Prevents vehicle from being assigned long trips
```

---

#### 9️⃣ **Complete Maintenance**
```
Endpoint:    PUT /api/maintenance/:id/complete
Method:      PUT
Description: Mark maintenance task as completed
Purpose:     Record actual maintenance work and cost
Authorization: Required (Manager/Admin)

Request Body:
{
  "completedDate": "2024-04-15T11:30:00Z",
  "actualCost": 3650,
  "serviceProvider": "ABC Auto Service",
  "workDone": ["Oil changed", "Filter replaced", "Fluid top-up"],
  "nextServiceDue": "2024-07-15"
}

Response (200 OK):
{
  "success": true,
  "message": "Maintenance completed",
  "data": {
    "_id": "6478b1c2d3e4f5g6h7i11",
    "vehicle": { "licensePlate": "GJ-01-AB-1234" },
    "status": "completed",
    "scheduledDate": "2024-04-15T09:00:00Z",
    "completedDate": "2024-04-15T11:30:00Z",
    "estimatedCost": 3500,
    "actualCost": 3650,
    "nextServiceDue": "2024-07-15",
    "vehicleStatusUpdated": "available"
  }
}

Real-World Example:
Truck-12 maintenance completed at service center
→ Mechanic enters:
   - Work done: Oil change, filter replacement
   - Actual cost: Rs. 3650
   - Next service: July 15, 2024
→ Vehicle status automatically changed: in_shop → available
→ Truck-12 back on road for new trips
```

---

### **Expense APIs**

#### 🔟 **Record Trip Expense**
```
Endpoint:    POST /api/expenses
Method:      POST
Description: Record trip-related expense
Purpose:     Track fuel, tolls, parking, and other costs
Authorization: Required (Driver/Dispatcher)

Request Body:
{
  "trip": "6478b1c2d3e4f5g6h7i10",              // Trip ID
  "expenseType": "fuel",                         // fuel | toll | parking | maintenance | other
  "amount": 1512,
  "currency": "INR",
  "description": "Diesel fuel at Surat pump",
  "quantity": 16.8,                             // liters for fuel
  "location": "Shell pump, Surat",
  "receiptUrl": "https://...",                  // Photo of receipt
  "expenseDate": "2024-03-27T08:30:00Z"
}

Response (201 Created):
{
  "success": true,
  "message": "Expense recorded",
  "data": {
    "_id": "6478b1c2d3e4f5g6h7i12",
    "trip": { "tripNumber": "TRIP-2024-001234" },
    "expenseType": "fuel",
    "amount": 1512,
    "quantity": 16.8,
    "fuelEfficiency": 8.5,       // km/liter (calculated)
    "recordedAt": "2024-03-27T08:30:00Z"
  }
}

Real-World Example:
Driver Rajesh filled 16.8 liters diesel at Shell pump
→ Paid Rs. 1512
→ Takes photo of receipt
→ Enters expense: type=fuel, amount=1512, quantity=16.8
→ System calculates: Truck-12 did 143km with 16.8L = 8.5 km/liter
→ Expense linked to TRIP-2024-001234
```

---

#### 1️⃣1️⃣ **Get Trip Analytics**
```
Endpoint:    GET /api/analytics/trips
Method:      GET
Description: Get analytics and KPIs for trips
Purpose:     Dashboard insights and business metrics
Authorization: Required

Query Parameters:
- startDate=2024-01-01
- endDate=2024-03-26
- vehicleType=truck

Response (200 OK):
{
  "success": true,
  "data": {
    "summary": {
      "totalTrips": 245,
      "completedTrips": 235,
      "pendingTrips": 8,
      "cancelledTrips": 2,
      "totalDistance": 35420,        // km
      "avgTripDistance": 145.8,      // km
      "onTimePercentage": 94.5,      // %
      "completionRate": 95.9         // %
    },
    "revenue": {
      "totalRevenue": 589500,        // Rs.
      "avgRevenuePerTrip": 2406,
      "topRoute": {
        "route": "Surat - Ahmedabad",
        "trips": 45,
        "revenue": 135000,
        "avgCost": 3000
      }
    },
    "expenses": {
      "totalFuelCost": 58950,        // Rs.
      "totalTollCost": 8920,
      "totalExpense": 89530,
      "expensePerKm": 2.52,          // Rs. per km
      "profitMargin": 84.8           // %
    },
    "drivers": {
      "topPerformer": "Rajesh Patel",
      "tripsCompleted": 45,
      "onTimePercentage": 98
    },
    "vehicles": {
      "bestUtilized": "GJ-01-AB-1234",
      "tripsCompleted": 38,
      "avgFuelConsumption": 8.3      // km/liter
    }
  }
}

Real-World Example:
Manager needs monthly performance report
→ GET /api/analytics/trips?startDate=2024-03-01&endDate=2024-03-26
→ Sees: 245 trips completed, 94.5% on-time, Rs. 589500 revenue
→ Identifies: Surat-Ahmedabad route most profitable
→ Identifies: Driver Rajesh is top performer (98% on-time)
→ Fuel efficiency: 8.3 km/liter (good optimization possible)
→ Decides: Allocate more trucks to profitable Surat-Ahmedabad route
```

---

## 🏢 Business Logic Rules

### ✅ Trip Creation Rules

**Rule 1: Cargo Capacity Validation**
```
IF cargo.weight > vehicle.maxWeight
  → REJECT trip with error: "Cargo exceeds vehicle capacity"
  → Suggest alternative vehicle
  
Example: 
- Cargo weight: 600kg
- Truck capacity: 500kg
- Status: ❌ REJECTED
- Suggestion: Use Truck-12 (capacity: 1000kg)
```

**Rule 2: Driver License Validation**
```
IF driver.licenseExpiryDate < TODAY
  → REJECT trip with error: "Driver license expired"
  → Prevent assignment
  
Example:
- Driver: Rajesh (License expires: 2024-03-20)
- Today: 2024-03-26
- Status: ❌ REJECTED - "License expired 6 days ago"
```

**Rule 3: Vehicle Status Check**
```
IF vehicle.status != "available"
  → REJECT trip assignment
  → Show suggestion: "Vehicle will be available in X hours"
  
Possible statuses:
- available ✅ (Can assign trips)
- on_trip ❌ (Already assigned)
- in_shop ❌ (Being repaired)
- maintenance ❌ (Scheduled maintenance)
```

**Rule 4: Duplicate Trip Prevention**
```
IF driver is already assigned to another trip on same date/time
  → REJECT with error: "Driver already assigned to another trip"
  
Example:
- Driver: Rajesh
- Existing trip: Surat → Ahmedabad (08:00 - 16:00)
- New trip: Vadodara → Surat (10:00 - 14:00)
- Status: ❌ REJECTED - Time overlap detected
```

---

### 🚗 Vehicle Status Transitions

**Automatic Status Changes:**

```
STATE MACHINE:

available
    ↓ (Trip created, dispatched)
on_trip
    ↓ (Trip completed)
available

in_shop
    ↓ (Maintenance completed)
available

maintenance (Scheduled)
    ↓ (Maintenance completed)
available

Real Example Flow:
Day 1: 08:00 AM
- Truck-12 status: available
- Trip TRIP-001 created and dispatched
- Truck-12 status: on_trip ⏱️

Day 1: 04:00 PM
- Trip TRIP-001 completed
- Truck-12 status: available ✅

Day 2: 09:00 AM
- Scheduled maintenance: Oil change
- Truck-12 status: maintenance 🔧

Day 2: 11:30 AM
- Maintenance completed
- Truck-12 status: available ✅
```

---

### 📋 Expense Calculation Rules

**Rule: Auto-Calculate Trip Expenses**
```
WHEN trip status = "completed":
1. Get all expenses for this trip
2. Calculate total expense = Fuel + Toll + Parking + Other
3. Calculate trip profit = Revenue - Total Expense
4. Update vehicle's cumulative fuel consumption
5. Generate expense report

Example:
- Trip revenue: Rs. 5000
- Fuel cost: Rs. 1512 (16.8L @ 90/liter)
- Toll: Rs. 200
- Parking: Rs. 50
- Total expense: Rs. 1762
- Trip profit: Rs. 5000 - 1762 = Rs. 3238
- Profit margin: 64.76%
```

---

### 🔄 Maintenance Auto-Alerts

**Rule: Schedule Alerts Based on Usage**
```
WHEN vehicle completes trip:
1. Add distance to odometer
2. Check if maintenance due:
   - Oil change: Every 5000 km or 6 months
   - Tire rotation: Every 10000 km
   - Full service: Every 20000 km or 12 months
3. IF due date within 7 days
   → Send alert to Safety Officer
   → Recommend scheduling maintenance
4. IF due date PAST
   → Block vehicle from new trips
   → Force scheduling maintenance

Example:
- Truck-12 odometer: 44,980 km
- Last oil change: 40,000 km (4,980 km ago)
- Oil change due: 45,000 km
- Alert: "Oil change due in 20 km" ⚠️

- Truck-15 odometer: 45,100 km
- Last oil change: 40,000 km (5,100 km ago)
- Oil change due: 45,000 km
- Status: 🚫 Vehicle blocked - Overdue for oil change!
```

---

## 🔄 Real-World Workflow

### Complete Workflow: From Vehicle to Analytics

#### **Phase 1: Setup (Week 1)**

**Step 1: Add Vehicle**
```
Manager logs in
→ Vehicles → Add New
→ Fills: License GJ-01-AB-1234, Tata 407, 5000kg capacity
→ Vehicle created ✅
→ Status: "available"
```

**Step 2: Add Driver**
```
Manager → Drivers → Add New
→ Fills: Name "Rajesh", License #RJ001, Expiry 2025-12-31
→ Driver activated ✅
→ Status: "active"
```

---

#### **Phase 2: Operations (Day 1)**

**Step 3: Create Trip**
```
Morning 8:00 AM
Customer calls: "Need to deliver 400kg goods from Surat to Ahmedabad"

Dispatcher logs in
→ Trips → Create New
→ Fills: 
  - Vehicle: Truck-12 (5000kg ✓)
  - Driver: Rajesh (License valid ✓)
  - Cargo: 400kg, Electronics
  - Pickup: ABC Warehouse, Surat
  - Delivery: XYZ Factory, Ahmedabad
  - Est. time: 8 hours
→ Trip created ✅
→ Status: "draft"
→ Revenue: Rs. 5000
```

**Step 4: Dispatch Trip**
```
Dispatcher reviews trip details
→ Clicks "Dispatch Trip"
→ Truck-12 status: available → on_trip 🚗
→ Driver: Rajesh notified (SMS/App)
→ Trip status: draft → dispatched ➡️
```

**Step 5: Trip In Progress**
```
Driver Rajesh starts trip
→ Enters "Started trip" in app
→ Trip status: dispatched → in_progress 🛣️
→ Real-time location: GPS tracked
→ Live updates visible to dispatcher & manager
```

**Step 6: Record Expenses**
```
Driver fills fuel: 16.8 liters @ Rs. 90/liter = Rs. 1512
→ Takes receipt photo
→ Enters expense: Fuel, Rs. 1512

Toll gate: Rs. 200
→ Distance: 143 km
→ Expense recorded: Toll, Rs. 200

Parking: Rs. 50
→ Expense recorded: Parking, Rs. 50
```

**Step 7: Complete Trip**
```
Afternoon 4:00 PM
Driver reaches destination
→ Customer signs delivery proof
→ Driver marks trip "Completed"
→ Enters notes: "Delivered successfully"
→ Trip status: in_progress → completed ✅
→ Truck-12 status: on_trip → available 🚗
```

**Step 8: Auto-Calculate Results**
```
System automatically:
✓ Calculates trip duration: 8 hours 15 mins
✓ Calculates distance: 143 km
✓ Calculates fuel efficiency: 143 km ÷ 16.8 L = 8.5 km/L
✓ Sums expenses: 1512 + 200 + 50 = Rs. 1762
✓ Calculates profit: 5000 - 1762 = Rs. 3238
✓ Updates vehicle maintenance: +143 km = 45,143 km
✓ Checks maintenance alert: "Oil change overdue!"
✓ Updates driver stats: +1 trip completed, 100% on-time
```

---

#### **Phase 3: Maintenance (Day 2)**

**Step 9: Schedule Maintenance**
```
Safety Officer sees alert: "Truck-12 oil change overdue"

Safety Officer logs in
→ Maintenance → Schedule
→ Fills:
  - Vehicle: Truck-12
  - Type: Oil change
  - Date: 2024-04-15, 9:00 AM
  - Cost estimate: Rs. 3500
→ Maintenance scheduled ✅
```

**Step 10: Complete Maintenance**
```
Maintenance day arrives
Mechanic completes oil change

Safety Officer logs in
→ Maintenance → Mark Complete
→ Fills:
  - Actual cost: Rs. 3650
  - Work done: Oil changed, filter replaced, fluid top-up
  - Next service: June 15, 2024
→ Truck-12 status: maintenance → available 🚗
```

---

#### **Phase 4: Analytics (End of Month)**

**Step 11: View Dashboard KPIs**
```
Manager logs in → Dashboard

Sees KPI Cards:
┌─────────────────────────────────┐
│ Active Fleet: 48 vehicles       │
│ Trips This Month: 245 ✅        │
│ Revenue: Rs. 589,500            │
│ Alerts: 5 🔔                    │
└─────────────────────────────────┘
```

**Step 12: Analyze Performance**
```
Manager views reports:

Revenue Chart: 📈 Rs. 589,500 (↑ 12% vs last month)
Fuel Efficiency: 📊 8.3 km/L (Target: 8.5)
On-Time %: 94.5% (Target: 95%)
Top Driver: Rajesh (45 trips, 98% on-time)
Top Route: Surat→Ahmedabad (45 trips, Rs. 135,000)
Best Vehicle: Truck-12 (38 trips, 94.5% utilization)
```

**Step 13: Make Decisions**
```
Manager identifies:
✓ Surat-Ahmedabad route is profitable → Allocate 3 more trucks
✓ Fuel efficiency below target → Schedule driver training
✓ Vehicle maintenance under control → Good!
✓ 5 pending maintenance alerts → Schedule this week

Actions taken:
→ Assign 3 more trucks to Surat-Ahmedabad route
→ Schedule driver training on fuel efficiency
→ Book maintenance for 5 vehicles
```

---

## 🗄️ Database Design

### **Collections & Schemas**

---

### **1. Users Collection**
```javascript
{
  _id: ObjectId,
  name: String,                    // User's full name
  email: String,                   // Unique email
  password: String,                // Hashed password
  role: String,                    // "admin", "manager", "dispatcher", "driver"
  phone: String,
  company: ObjectId,               // Reference to company
  status: String,                  // "active", "inactive", "on_leave"
  createdAt: Date,
  updatedAt: Date
}

Example:
{
  _id: ObjectId("6478a9b2c3d4e5f6g7h8"),
  name: "Rajesh Patel",
  email: "rajesh@transflow.com",
  role: "driver",
  phone: "+919876543210",
  company: ObjectId("6478a9b2c3d4e5f6g7h7"),
  status: "active"
}
```

---

### **2. Companies Collection**
```javascript
{
  _id: ObjectId,
  name: String,                    // Company name
  registrationNumber: String,      // GST/Registration #
  email: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  industry: String,                // "logistics", "e-commerce", etc
  fleet_size: Number,              // Number of vehicles
  subscription: {
    plan: String,                  // "basic", "professional", "enterprise"
    startDate: Date,
    endDate: Date,
    isActive: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}

Example:
{
  _id: ObjectId("6478a9b2c3d4e5f6g7h7"),
  name: "TransFlow India Pvt Ltd",
  registrationNumber: "GST123456789",
  phone: "+919876543200",
  address: "456 Business Park, Surat",
  city: "Surat",
  state: "Gujarat",
  fleet_size: 50,
  subscription: {
    plan: "professional",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    isActive: true
  }
}
```

---

### **3. Vehicles Collection**
```javascript
{
  _id: ObjectId,
  licensePlate: String,            // Unique vehicle ID
  company: ObjectId,               // Reference to company
  vehicleType: String,             // "truck", "van", "bike"
  manufacturer: String,            // "Tata", "Ashok", etc.
  model: String,
  year: Number,
  status: String,                  // "available", "on_trip", "in_shop", "maintenance"
  capacity: {
    maxWeight: Number,             // kg
    maxVolume: Number              // cubic meters
  },
  fuelType: String,                // "diesel", "petrol", "CNG"
  mileage: Number,                 // km per liter
  registrationExpiry: Date,
  insuranceExpiry: Date,
  lastServiceDate: Date,
  nextServiceDueDate: Date,
  odometer: Number,                // Current km reading
  createdAt: Date,
  updatedAt: Date
}

Example:
{
  _id: ObjectId("6478b1c2d3e4f5g6h7i8"),
  licensePlate: "GJ-01-AB-1234",
  vehicleType: "truck",
  manufacturer: "Tata",
  model: "407",
  year: 2022,
  status: "available",
  capacity: { maxWeight: 5000, maxVolume: 25 },
  fuelType: "diesel",
  mileage: 8.5,
  registrationExpiry: "2025-12-31",
  insuranceExpiry: "2025-06-30",
  lastServiceDate: "2024-01-15",
  nextServiceDueDate: "2024-04-15",
  odometer: 45143
}
```

---

### **4. Drivers Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  company: ObjectId,               // Reference to company
  licenseNumber: String,           // Unique license #
  licenseExpiry: Date,
  age: Number,
  address: String,
  status: String,                  // "active", "on_leave", "license_expired"
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  performance: {
    tripsCompleted: Number,
    onTimePercentage: Number,      // 0-100
    rating: Number,                // 1-5 stars
    safetyIncidents: Number
  },
  salary: {
    baseSalary: Number,
    perTripBonus: Number
  },
  joinDate: Date,
  createdAt: Date,
  updatedAt: Date
}

Example:
{
  _id: ObjectId("6478b1c2d3e4f5g6h7i9"),
  name: "Rajesh Patel",
  email: "rajesh@transflow.com",
  licenseNumber: "RJ001",
  licenseExpiry: "2025-12-31",
  status: "active",
  performance: {
    tripsCompleted: 45,
    onTimePercentage: 98,
    rating: 4.8,
    safetyIncidents: 0
  },
  salary: { baseSalary: 25000, perTripBonus: 500 }
}
```

---

### **5. Trips Collection**
```javascript
{
  _id: ObjectId,
  tripNumber: String,              // Unique trip ID (TRIP-2024-001234)
  company: ObjectId,               // Reference to company
  vehicle: ObjectId,               // Reference to vehicle
  driver: ObjectId,                // Reference to driver
  pickupLocation: {
    address: String,
    latitude: Number,
    longitude: Number,
    contactName: String,
    contactPhone: String
  },
  deliveryLocation: {
    address: String,
    latitude: Number,
    longitude: String,
    contactName: String,
    contactPhone: String
  },
  cargo: {
    description: String,
    weight: Number,                // kg
    volume: Number,                // cubic meters
    isFragile: Boolean,
    specialHandling: String
  },
  status: String,                  // "draft", "dispatched", "in_progress", "completed", "cancelled"
  estimatedStartTime: Date,
  estimatedEndTime: Date,
  actualStartTime: Date,
  actualEndTime: Date,
  totalDistance: Number,           // km
  totalDuration: Number,           // minutes
  revenue: Number,                 // Rs.
  expenses: [Object],              // Array of expense IDs
  notes: String,
  createdAt: Date,
  updatedAt: Date
}

Example:
{
  _id: ObjectId("6478b1c2d3e4f5g6h7i10"),
  tripNumber: "TRIP-2024-001234",
  vehicle: ObjectId("6478b1c2d3e4f5g6h7i8"),
  driver: ObjectId("6478b1c2d3e4f5g6h7i9"),
  pickupLocation: {
    address: "ABC Warehouse, Surat",
    latitude: 21.1702,
    longitude: 72.8479
  },
  deliveryLocation: {
    address: "XYZ Factory, Ahmedabad",
    latitude: 23.0225,
    longitude: 72.5714
  },
  cargo: { description: "400kg Electronics", weight: 400, volume: 2.5 },
  status: "completed",
  totalDistance: 143,
  totalDuration: 495,              // 8 hours 15 mins
  revenue: 5000
}
```

---

### **6. Expenses Collection**
```javascript
{
  _id: ObjectId,
  trip: ObjectId,                  // Reference to trip
  company: ObjectId,               // Reference to company
  expenseType: String,             // "fuel", "toll", "parking", "maintenance", "other"
  amount: Number,                  // Rs.
  currency: String,                // "INR"
  quantity: Number,                // For fuel: liters
  description: String,
  location: String,
  receiptUrl: String,              // Photo URL
  expenseDate: Date,
  createdBy: ObjectId,             // User who recorded it
  createdAt: Date
}

Example:
{
  _id: ObjectId("6478b1c2d3e4f5g6h7i12"),
  trip: ObjectId("6478b1c2d3e4f5g6h7i10"),
  expenseType: "fuel",
  amount: 1512,
  quantity: 16.8,                  // liters
  location: "Shell pump, Surat",
  expenseDate: "2024-03-27T08:30:00Z"
}
```

---

### **7. Maintenance Collection**
```javascript
{
  _id: ObjectId,
  vehicle: ObjectId,               // Reference to vehicle
  company: ObjectId,               // Reference to company
  maintenanceType: String,         // "oil_change", "tire_change", "brake_service", "full_service"
  scheduledDate: Date,
  completedDate: Date,
  status: String,                  // "scheduled", "in_progress", "completed", "cancelled"
  estimatedCost: Number,           // Rs.
  actualCost: Number,              // Rs. (after completion)
  serviceProvider: String,         // Name of service center
  workDone: [String],              // Array of work items
  priority: String,                // "low", "medium", "high"
  nextServiceDue: Date,
  createdAt: Date,
  updatedAt: Date
}

Example:
{
  _id: ObjectId("6478b1c2d3e4f5g6h7i11"),
  vehicle: ObjectId("6478b1c2d3e4f5g6h7i8"),
  maintenanceType: "oil_change",
  scheduledDate: "2024-04-15T09:00:00Z",
  completedDate: "2024-04-15T11:30:00Z",
  status: "completed",
  estimatedCost: 3500,
  actualCost: 3650,
  workDone: ["Oil changed", "Filter replaced", "Fluid top-up"],
  nextServiceDue: "2024-07-15"
}
```

---

## ⚠️ Error Handling

### **Standard Error Responses**

#### **1. 400 Bad Request** ❌
```json
{
  "success": false,
  "message": "Bad Request",
  "error": "Cargo weight (600kg) exceeds vehicle capacity (500kg)",
  "statusCode": 400
}

Scenarios:
- Missing required fields
- Invalid data format
- Cargo exceeds capacity
- Invalid date format
- Driver license expired
```

---

#### **2. 401 Unauthorized** 🔐
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "Authentication token missing or invalid",
  "statusCode": 401
}

Scenarios:
- No token provided
- Token expired
- Invalid token
- User not authenticated
```

---

#### **3. 403 Forbidden** 🚫
```json
{
  "success": false,
  "message": "Forbidden",
  "error": "Only managers and admins can create vehicles",
  "statusCode": 403
}

Scenarios:
- Insufficient permissions
- Role-based access denied
- User not authorized for action
```

---

#### **4. 404 Not Found** 🔍
```json
{
  "success": false,
  "message": "Not Found",
  "error": "Vehicle with ID '6478b1c2d3e4f5g6h7i8' not found",
  "statusCode": 404
}

Scenarios:
- Resource doesn't exist
- Invalid ID
- Deleted resource
- Wrong endpoint
```

---

#### **5. 409 Conflict** ⚠️
```json
{
  "success": false,
  "message": "Conflict",
  "error": "Vehicle already on another trip. Cannot assign to two trips simultaneously.",
  "statusCode": 409
}

Scenarios:
- Duplicate entries
- Conflicting assignments
- Status conflicts
```

---

#### **6. 500 Server Error** 💥
```json
{
  "success": false,
  "message": "Internal Server Error",
  "error": "Database connection failed",
  "statusCode": 500
}

Scenarios:
- Database connection failed
- Unexpected server error
- Unhandled exceptions
- Server crash
```

---

## 🎨 UI & Navigation

### **Sidebar Navigation Structure**

```
┌────────────────────────────┐
│   FleetFlow   [TM]         │
├────────────────────────────┤
│ 📊 Dashboard               │ KPI cards, analytics
├────────────────────────────┤
│ 🚗 Vehicles                │ Vehicle list, add, edit
├────────────────────────────┤
│ 👨‍💼 Drivers                 │ Driver list, performance
├────────────────────────────┤
│ 🛣️  Trips                  │ Create, track, complete
├────────────────────────────┤
│ 🔧 Maintenance             │ Schedule, view history
├────────────────────────────┤
│ ⛽ Expenses                 │ Fuel, tolls, costs
├────────────────────────────┤
│ 📈 Analytics               │ Reports, charts
├────────────────────────────┤
│ 👤 Profile                 │ User settings
├────────────────────────────┤
│ 🌙 Theme Toggle            │ Dark/Light mode
├────────────────────────────┤
│ 🚪 Logout                  │ Sign out
└────────────────────────────┘
```

---

### **Dashboard Components**

#### **KPI Cards**
```
┌─────────────────────────────────┐
│ 🚗 Active Fleet: 48 vehicles    │
│ 📈 Monthly Revenue: Rs. 589,500 │
│ ✅ Completed Trips: 245         │
│ 🔔 Maintenance Alerts: 5        │
└─────────────────────────────────┘
```

#### **Data Tables**
```
Vehicles Table:
┌──────────────┬──────────┬────────────┬────────────┐
│ License      │ Type     │ Status     │ Capacity   │
├──────────────┼──────────┼────────────┼────────────┤
│ GJ-01-AB-123 │ Truck    │ Available  │ 5000kg ✅  │
│ GJ-01-AB-124 │ Van      │ On Trip    │ 2000kg ⏱️  │
│ GJ-01-AB-125 │ Truck    │ Maintenance│ 5000kg 🔧  │
└──────────────┴──────────┴────────────┴────────────┘

Trips Table:
┌──────────────┬─────────┬──────────────┬────────────┐
│ Trip #       │ Driver  │ Status       │ Revenue    │
├──────────────┼─────────┼──────────────┼────────────┤
│ TRIP-001234  │ Rajesh  │ Completed ✅ │ Rs. 5,000  │
│ TRIP-001235  │ Amit    │ In Progress  │ Rs. 4,500  │
│ TRIP-001236  │ Vikram  │ Dispatched   │ Rs. 6,000  │
└──────────────┴─────────┴──────────────┴────────────┘
```

#### **Status Badges**
```
✅ Completed   - Green badge
⏱️  In Progress - Blue badge
📋 Draft      - Gray badge
🚀 Dispatched - Orange badge
❌ Cancelled  - Red badge
```

#### **Charts & Graphs**
```
Revenue Trend (Line Chart):
₹
800k │     ╱╲
600k │    ╱  ╲    ╱─╲
400k │   ╱    ╲  ╱   ╲
200k │  ╱──────╲╱─────╲
  0  └─────────────────────
     Jan Feb Mar Apr May

Vehicle Utilization (Bar Chart):
100%│ ██ ██ ██ ██ ██ ██
 75%│ ██ ██ ██ ██ ██ ██
 50%│ ██ ██ ██ ██ ██ ██
 25%│ ██ ██ ██ ██ ██ ██
  0%└─────────────────
     1  2  3  4  5  6 (Vehicles)
```

---

## 🚀 Future Scope

### **Phase 2 Features (Coming Soon)**

#### **1. 📍 Real-Time GPS Tracking**
```
Feature:
- Live vehicle location on Google Map
- Route optimization
- Historical route playback
- Geofencing alerts
- Automated stop detection

Business Impact:
✓ Better customer communication: "Your delivery will arrive in 15 mins"
✓ Theft prevention: Alert if vehicle leaves designated route
✓ Emergency response: Find nearest vehicle for urgent tasks
```

#### **2. 🔔 Smart Notifications System**
```
Feature:
- Push notifications for trips
- Email alerts for maintenance
- SMS reminders for drivers
- Webhook integrations

Examples:
✓ Driver: "New trip assigned: Surat → Ahmedabad, 400kg cargo"
✓ Manager: "Truck-12 due for maintenance in 2 days"
✓ Customer: "Your delivery is out for delivery. ETA: 2:30 PM"
```

#### **3. 👥 Role-Based Dashboards**
```
Feature:
- Customized dashboard per role
- Manager: See all vehicles, profits, analytics
- Dispatcher: See trips, assign vehicles
- Driver: See assigned trips, record expenses
- Financial Analyst: See expenses, generate reports
- Safety Officer: See maintenance schedule, vehicle compliance

Current: All users see same dashboard
Future: Each role sees relevant data only
```

#### **4. 💳 SaaS Subscription Model**
```
Feature:
- Freemium plan (5 vehicles, basic features)
- Professional plan (50 vehicles, advanced analytics)
- Enterprise plan (unlimited vehicles, custom integrations)
- Payment integration (Stripe, Razorpay)

Pricing Example:
🆓 Free     : 5 vehicles,  basic features
💎 Professional: 50 vehicles, analytics, 10 users
🏢 Enterprise : Unlimited, 24/7 support, API access
```

#### **5. 📱 Mobile App (React Native)**
```
Feature:
- iOS & Android app
- Driver app: Accept trips, start/end, record expenses
- Manager app: View fleet, analytics, alerts
- Push notifications
- Offline mode

Release: Q3 2024
```

#### **6. 🛣️ Route Optimization**
```
Feature:
- AI-based best route suggestions
- Multi-stop trip planning
- Dynamic traffic-aware routing
- Fuel-efficient routes

Example:
- Today: 3 deliveries (Surat → Ahmedabad → Baroda → Back)
- System suggests: Optimal route saves 45 km & 2 hours
- Fuel saved: Rs. 400
- Time saved: 2 hours = More trips possible
```

#### **7. 📊 Predictive Analytics**
```
Feature:
- Fuel consumption prediction
- Maintenance failure prediction
- Driver safety predictions
- Vehicle breakdown forecasting

Example:
- "Truck-12 has 87% chance of brake failure within 30 days"
- "Driver Rajesh's fuel consumption trending up 5%"
- Recommendation: Schedule preventive maintenance
```

#### **8. 🤝 Customer Portal**
```
Feature:
- Customers can track their deliveries
- Real-time GPS location sharing
- Delivery proof (photo/signature)
- Auto-generated invoices

Benefits:
✓ Customer satisfaction ↑
✓ Reduced customer inquiries ↓
✓ Professional image ✨
```

#### **9. 🔐 Advanced Security**
```
Feature:
- Two-factor authentication (2FA)
- Audit logs (who did what)
- Data encryption
- GDPR compliance
- Regular security audits

Why important:
- Prevent unauthorized access
- Compliance with regulations
- Protect customer data
```

#### **10. 🌐 Multi-Language Support**
```
Feature:
- English, Hindi, Gujarati, Marathi, Tamil support
- Auto-translation
- Localized time zones

Target: Support across India with local languages
```

---

## 📞 Support & Contact

### **For Questions**
For API documentation, feature requests, or bug reports, please contact our technical team.

### **Developer Resources**
- **Base API URL**: `http://localhost:3000/api`
- **Frontend URL**: `http://localhost:5173`
- **Database**: MongoDB (local/Atlas)

---

## 📄 License & Rights

**FleetFlow** © 2024 - All rights reserved.

This is a proprietary SaaS platform designed for logistics and fleet management. Unauthorized copying or distribution is prohibited.

---

## 🎯 Summary

**FleetFlow** is a comprehensive, production-ready fleet management system that helps logistics companies:

✅ Manage vehicles efficiently
✅ Track trips in real-time
✅ Optimize expenses
✅ Monitor driver performance
✅ Generate actionable analytics
✅ Improve profitability

Perfect for portfolio showcase, developer onboarding, and SaaS product presentations!

---

**Happy Fleet Management! 🚀**

