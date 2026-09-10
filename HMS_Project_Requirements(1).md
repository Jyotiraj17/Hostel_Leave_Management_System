# HMS — Hostel Management System
## Project Requirements & Website Specification

**Project Name:** HMS  
**Full Name:** Hostel Management System  
**Document Version:** 1.0  
**Purpose:** Functional and technical baseline for developing the HMS website.

---

# 1. Project Overview

HMS (Hostel Management System) is a role-based web application designed to manage hostel operations digitally.

The system has three user roles:

1. **Admin**
2. **Warden**
3. **Student**

Each role has different permissions and dashboard features.

The system will manage:

- User authentication
- Student management
- Warden management
- Room management
- Leave management
- Complaint management
- Announcements
- Student profiles
- Reports
- Password management

**Important:** The system will NOT contain a notification system.

---

# 2. Main Goals

The main goals of HMS are:

- Digitize hostel management.
- Provide secure role-based access.
- Allow administrators to manage students, wardens and rooms.
- Allow wardens to manage students and daily hostel activities.
- Allow students to manage their own profile and hostel-related requests.
- Make leave management simple and trackable.
- Provide complaint tracking.
- Provide hostel announcements.
- Maintain accurate hostel records.
- Reduce manual paperwork.

---

# 3. User Roles

## 3.1 Admin

Admin has the highest level of access.

### Admin Permissions

- View admin dashboard.
- Manage students.
- Add students.
- Edit students.
- View student details.
- Delete/deactivate students.
- Manage wardens.
- Add wardens.
- Edit wardens.
- View warden details.
- Delete/deactivate wardens.
- Manage hostel rooms.
- Add rooms.
- Edit rooms.
- Delete/deactivate rooms.
- Assign students to rooms.
- Change room assignments.
- View all leave records.
- View all complaints.
- Manage announcements.
- Generate reports.
- View hostel statistics.
- Manage hostel settings.
- Change password.
- Logout.

---

# 4. Warden

Warden manages day-to-day hostel activities.

## 4.1 Warden Permissions

- View warden dashboard.
- Add student.
- View student list.
- Search students.
- Edit student information.
- View student details.
- Assign students to rooms.
- Change student room.
- View leave requests.
- Approve leave requests.
- Reject leave requests.
- View leave history.
- Manage complaints.
- Update complaint status.
- Create announcements.
- Edit announcements.
- Delete announcements.
- View hostel/student statistics.
- Change password.
- Logout.

---

# 5. Student

Students have limited access to their own information and hostel services.

## 5.1 Student Permissions

- View student dashboard.
- View own profile.
- Edit allowed profile information.
- Change password.
- View own room information.
- Apply for leave.
- View leave history.
- View leave request status.
- Cancel pending leave request.
- Submit complaints.
- View complaint status.
- View hostel announcements.
- Logout.

Students must NOT be able to:

- View other students' private information.
- Change their roll number.
- Change their room assignment.
- Approve their own leave.
- Delete hostel records.
- Manage other users.

---

# 6. Authentication System

The website will have a common login page for all three roles.

## 6.1 Login

Login fields:

- Gmail/Email
- Password

Buttons/links:

- Login
- Forgot Password
- Change Password

The user does not manually select a role during login.

The system determines the user's role from the authenticated account.

### Login Flow

```text
Enter Email + Password
        |
        v
Authentication
        |
        v
Check User Role
        |
   +----+----+----+
   |         |    |
 Admin    Warden Student
   |         |    |
   v         v    v
Dashboard Dashboard Dashboard
```

---

# 7. Forgot Password

Forgot Password must work through the user's registered Gmail/email.

## Flow

```text
User clicks "Forgot Password"
          |
          v
Enter registered Gmail/email
          |
          v
System verifies account
          |
          v
Password reset link sent to Gmail
          |
          v
User opens reset link
          |
          v
Set new password
```

The system should not display or reveal the existing password.

---

# 8. Change Password

Logged-in users can change their password.

Fields:

- Current Password
- New Password
- Confirm New Password

Validation:

- Current password must be correct.
- New password must satisfy password requirements.
- New password and confirmation must match.
- New password should not be empty.

---

# 9. Admin Dashboard

The Admin Dashboard should provide an overview of the hostel.

## Statistics

Display cards for:

- Total Students
- Total Wardens
- Total Rooms
- Occupied Rooms
- Available Rooms
- Pending Leave Requests
- Active Complaints

## Dashboard Sections

- Recent students
- Recent leave requests
- Recent complaints
- Recent announcements
- Hostel occupancy summary
- Quick action buttons

---

# 10. Warden Dashboard

The Warden Dashboard should show hostel activity.

## Statistics

Display:

- Total Students
- Present Students
- Students on Leave
- Pending Leave Requests
- Open Complaints
- Room Occupancy

## Dashboard Sections

- Recent leave requests
- Recent complaints
- Recent students
- Recent announcements
- Quick actions

---

# 11. Student Dashboard

The Student Dashboard should show the student's personal hostel information.

## Dashboard Information

- Student name
- Roll Number
- Room Number
- Hostel/Block
- Current leave status
- Pending leave requests
- Complaint status
- Recent announcements

## Quick Actions

- View Profile
- Apply Leave
- Leave History
- Submit Complaint
- My Room

---

# 12. Student Management

Student management is available to Admin and Warden.

## Student Information

Each student record should contain:

- Student ID
- Full Name
- Roll Number
- Email/Gmail
- Phone Number
- Department
- Year
- Gender
- Hostel
- Block
- Room Number
- Guardian Name
- Guardian Phone
- Address
- Profile Photo
- Account Status
- Created Date
- Updated Date

## Student Actions

Admin/Warden can:

- Add student
- View student
- Search student
- Edit student
- Assign room
- Change room
- Deactivate student

Admin can additionally:

- Delete/deactivate student records

---

# 13. Student Profile Management

Students can view and update their profile.

## Profile Fields

### Read-only / Controlled Fields

- Full Name
- Roll Number
- Email
- Department
- Year
- Gender
- Hostel
- Block
- Room Number

### Editable Fields

- Phone Number
- Address
- Guardian Name
- Guardian Phone
- Profile Photo

Room assignment and roll number must be controlled by Admin/Warden.

---

# 14. Warden Management

Only Admin can manage wardens.

## Warden Information

- Warden ID
- Full Name
- Email/Gmail
- Phone Number
- Assigned Hostel/Block
- Account Status
- Created Date
- Updated Date

## Admin Actions

- Add warden
- View warden
- Edit warden
- Assign hostel/block
- Deactivate warden
- Delete/deactivate account

---

# 15. Room Management

Admin manages rooms. Warden can view and assign students according to permissions.

## Room Information

- Room ID
- Room Number
- Hostel/Block
- Floor
- Capacity
- Current Occupants
- Available Beds
- Room Status

## Room Status

Possible statuses:

- Available
- Partially Occupied
- Full
- Maintenance

## Example

```text
Block A
Room 101
Capacity: 4
Occupied: 3
Available: 1
Status: Partially Occupied
```

---

# 16. Leave Management

Leave management is one of the main modules.

## 16.1 Student Leave Application

Students can submit:

- Leave Type
- Start Date
- End Date
- Reason
- Destination
- Address during leave
- Emergency Contact
- Additional Remarks

The system automatically stores:

- Leave ID
- Student ID
- Application Date
- Current Status

## Leave Status

Possible statuses:

- Pending
- Approved
- Rejected
- Cancelled

---

# 17. Leave Approval Workflow

```text
Student applies for leave
          |
          v
Leave Status = Pending
          |
          v
Warden reviews request
       /       \
      /         \
 Approve       Reject
    |             |
    v             v
Approved       Rejected
```

The student can view the updated status from the dashboard and leave history.

Students can cancel only their own pending leave request.

---

# 18. Leave History

Students can view their own leave history.

Information:

- Leave ID
- Start Date
- End Date
- Leave Type
- Reason
- Status
- Applied Date
- Warden Remarks

Admin and Warden can view relevant leave records according to their permissions.

---

# 19. Complaint Management

Students can submit hostel-related complaints.

## Complaint Categories

- Electrical
- Plumbing
- Cleaning
- Wi-Fi/Internet
- Food
- Room Maintenance
- Furniture
- Security
- Other

## Complaint Information

- Complaint ID
- Student
- Roll Number
- Room Number
- Category
- Subject
- Description
- Date Submitted
- Status
- Remarks
- Resolved Date

## Complaint Status

- Pending
- In Progress
- Resolved
- Rejected

---

# 20. Complaint Workflow

```text
Student submits complaint
          |
          v
       Pending
          |
          v
       Warden
          |
          v
     In Progress
          |
          v
       Resolved
```

The student can view the current status of their complaint.

---

# 21. Announcement Management

Admin and Warden can create hostel announcements.

## Announcement Fields

- Announcement ID
- Title
- Description
- Created By
- Date
- Priority
- Expiry Date
- Status

## Priority

- Normal
- Important
- Urgent

Students can view active announcements.

Admin/Warden can:

- Create announcement
- Edit announcement
- Delete announcement
- Set expiry date

---

# 22. Reports

Admin should have a Reports section.

Possible reports:

- Student list
- Warden list
- Room occupancy
- Available rooms
- Leave report
- Approved leave report
- Rejected leave report
- Complaint report
- Resolved complaint report
- Hostel occupancy summary

Reports can later support:

- Search
- Filter
- Date range
- Export to PDF
- Export to Excel/CSV

---

# 23. Search and Filtering

The system should provide search functionality where useful.

## Student Search

Search by:

- Name
- Roll Number
- Email
- Room Number
- Department

## Leave Search

Filter by:

- Student
- Roll Number
- Status
- Date range
- Leave type

## Complaint Search

Filter by:

- Student
- Category
- Status
- Date range

## Room Search

Filter by:

- Room Number
- Block
- Floor
- Status

---

# 24. Authorization Rules

Role-based access control must be implemented.

## Admin

```text
Full System Access
```

## Warden

```text
Hostel Operations Access
```

## Student

```text
Own Data + Hostel Services
```

A user must never be able to access another role's restricted pages by manually changing a URL.

For example:

```text
/student/dashboard
/warden/dashboard
/admin/dashboard
```

A student attempting to access `/admin/dashboard` must be denied.

Authorization must be checked on the backend as well as the frontend.

---

# 25. Data Relationships

Basic relationship structure:

```text
User
 |
 +---- Admin
 |
 +---- Warden
 |
 +---- Student
          |
          +---- Room
          |
          +---- Leave Requests
          |
          +---- Complaints
```

Room:

```text
Room
 |
 +---- Block
 |
 +---- Students
```

---

# 26. Suggested Database Collections/Tables

The system should use the following main entities:

```text
users
students
wardens
rooms
leave_requests
complaints
announcements
```

Optional/future entities:

```text
hostels
blocks
audit_logs
```

**No notifications table/collection is required.**

---

# 27. Suggested User Data

```text
users
-------------------------
id
email
role
status
created_at
updated_at
```

Authentication passwords should be handled securely by the authentication system. Do not store plain-text passwords.

---

# 28. Suggested Student Data

```text
students
-------------------------
id
user_id
full_name
roll_no
email
phone
department
year
gender
hostel
block
room_id
guardian_name
guardian_phone
address
profile_photo
status
created_at
updated_at
```

---

# 29. Suggested Warden Data

```text
wardens
-------------------------
id
user_id
full_name
email
phone
hostel
block
status
created_at
updated_at
```

---

# 30. Suggested Room Data

```text
rooms
-------------------------
id
room_number
hostel
block
floor
capacity
status
created_at
updated_at
```

Current occupancy should be calculated from active room assignments where practical.

---

# 31. Suggested Leave Data

```text
leave_requests
-------------------------
id
student_id
leave_type
start_date
end_date
reason
destination
leave_address
emergency_contact
remarks
status
applied_at
reviewed_by
reviewed_at
```

---

# 32. Suggested Complaint Data

```text
complaints
-------------------------
id
student_id
category
subject
description
status
remarks
created_at
updated_at
resolved_at
```

---

# 33. Suggested Announcement Data

```text
announcements
-------------------------
id
title
description
created_by
priority
created_at
expiry_date
status
```

---

# 34. Website Navigation

## Admin Sidebar

```text
Dashboard
Students
Wardens
Rooms
Leave Records
Complaints
Announcements
Reports
Profile
Change Password
Logout
```

## Warden Sidebar

```text
Dashboard
Students
Rooms
Leave Requests
Complaints
Announcements
Profile
Change Password
Logout
```

## Student Sidebar

```text
Dashboard
My Profile
My Room
Apply Leave
Leave History
Complaints
Announcements
Change Password
Logout
```

---

# 35. Common Website Pages

```text
/
├── Login
├── Forgot Password
├── Reset Password
│
├── Admin
│   ├── Dashboard
│   ├── Students
│   ├── Wardens
│   ├── Rooms
│   ├── Leaves
│   ├── Complaints
│   ├── Announcements
│   ├── Reports
│   ├── Profile
│   └── Change Password
│
├── Warden
│   ├── Dashboard
│   ├── Students
│   ├── Rooms
│   ├── Leaves
│   ├── Complaints
│   ├── Announcements
│   ├── Profile
│   └── Change Password
│
└── Student
    ├── Dashboard
    ├── Profile
    ├── My Room
    ├── Apply Leave
    ├── Leave History
    ├── Complaints
    ├── Announcements
    └── Change Password
```

---

# 36. Security Requirements

The application should implement:

- Secure authentication.
- Role-based authorization.
- Backend authorization checks.
- Password hashing/authentication through a secure authentication provider.
- No plain-text password storage.
- Protected API endpoints.
- Input validation.
- Server-side validation.
- Client-side validation.
- Session/token validation.
- Logout functionality.
- Protection against unauthorized record access.
- Unique email accounts.
- Unique student roll numbers.
- Appropriate error handling.

---

# 37. Validation Requirements

## Student

- Full name required.
- Roll number required and unique.
- Email required and valid.
- Phone number must be valid.
- Department required.
- Year required.
- Room assignment must respect room capacity.

## Leave

- Leave type required.
- Start date required.
- End date required.
- End date cannot be before start date.
- Reason required.
- Required destination/contact information must be provided.

## Complaint

- Category required.
- Subject required.
- Description required.

## Password

- Current password required for change-password.
- New password required.
- Confirm password required.
- New password and confirmation must match.

---

# 38. Error Handling

The system should show clear messages for:

- Invalid login credentials.
- Unauthorized access.
- User not found.
- Duplicate roll number.
- Duplicate email.
- Room capacity exceeded.
- Invalid leave dates.
- Failed leave submission.
- Failed complaint submission.
- Failed profile update.
- Password mismatch.
- Incorrect current password.
- Invalid/expired reset link.
- Server/database errors.

Do not expose sensitive technical errors to normal users.

---

# 39. UI/UX Requirements

The website should be:

- Modern
- Clean
- Responsive
- Easy to navigate
- Mobile-friendly
- Desktop-friendly
- Accessible
- Consistent across all dashboards

Use a common design system for:

- Buttons
- Cards
- Tables
- Forms
- Modals
- Alerts
- Sidebar
- Navbar
- Status badges

---

# 40. Dashboard Design

Each dashboard should use:

- Sidebar navigation
- Top navigation/header
- Profile area
- Statistics cards
- Tables
- Recent activity sections
- Quick action buttons

Use color-coded status badges.

Example:

```text
Pending     → Warning style
Approved    → Success style
Rejected    → Error style
In Progress → Information style
Resolved    → Success style
```

---

# 41. Responsive Design

The website must work properly on:

- Desktop
- Laptop
- Tablet
- Mobile

Sidebar behavior:

```text
Desktop
Sidebar visible

Mobile
Sidebar collapses
     |
     v
Hamburger menu
```

Tables should become horizontally scrollable or responsive on small screens.

---

# 42. Important Business Rules

1. Every user must have one defined role.
2. Users cannot change their own role.
3. Students cannot access Admin/Warden dashboards.
4. Warden cannot access Admin-only management functions.
5. Roll Number must be unique.
6. Email must be unique.
7. A room cannot exceed its capacity.
8. Students cannot approve their own leave.
9. Students can only view their own leave history.
10. Students can only view their own complaints.
11. Students cannot modify their room assignment.
12. Only authorized users can modify records.
13. Expired announcements should not appear as active announcements.
14. A leave request must have valid dates.
15. Passwords must never be stored as plain text.
16. The system does not contain a notification module.

---

# 43. Future Features

These features are NOT required for the first version but can be added later:

- Attendance management
- Mess/food management
- Visitor management
- Gate pass management
- Fee management
- Payment tracking
- QR-based student identification
- QR-based room verification
- PDF/Excel report generation
- Advanced analytics
- Audit logs
- Multiple hostel support
- Multiple campus support

---

# 44. Development Phases

## Phase 1 — Project Setup

- Create project
- Configure frontend
- Configure backend
- Configure database
- Configure authentication
- Set environment variables

## Phase 2 — Authentication

- Login
- Logout
- Role detection
- Forgot password
- Reset password
- Change password
- Protected routes

## Phase 3 — Admin

- Admin dashboard
- Student management
- Warden management
- Room management

## Phase 4 — Warden

- Warden dashboard
- Student management
- Room assignment
- Leave management
- Complaint management
- Announcements

## Phase 5 — Student

- Student dashboard
- Profile
- Room details
- Leave application
- Leave history
- Complaints
- Announcements

## Phase 6 — Reports & Refinement

- Reports
- Search
- Filtering
- Validation
- Security
- Responsive design
- Error handling
- Testing

---

# 45. Final Feature List

## Authentication

- [x] Login
- [x] Role-based access
- [x] Logout
- [x] Forgot Password through Gmail/email
- [x] Reset Password
- [x] Change Password

## Admin

- [x] Dashboard
- [x] Student Management
- [x] Warden Management
- [x] Room Management
- [x] Leave Records
- [x] Complaints
- [x] Announcements
- [x] Reports
- [x] Profile

## Warden

- [x] Dashboard
- [x] Add Student
- [x] Student Management
- [x] Room Assignment
- [x] Leave Approval/Rejection
- [x] Leave History
- [x] Complaint Management
- [x] Announcements
- [x] Profile

## Student

- [x] Dashboard
- [x] Profile
- [x] Roll Number
- [x] My Room
- [x] Apply Leave
- [x] Leave History
- [x] Cancel Pending Leave
- [x] Submit Complaint
- [x] Complaint Status
- [x] Announcements
- [x] Change Password

## Explicitly Excluded

- [x] Notification System is NOT included.

---

# 46. Recommended Technology Architecture

The exact technology stack can be finalized before implementation.

Recommended architecture:

```text
Frontend
   |
   | HTTP/REST API
   v
Backend
   |
   v
Database

Authentication
   |
   v
Role-Based Authorization
```

A possible modern stack:

```text
Frontend  → HTML-CSS-JS
Backend   → Node.js + Express.js
Database  → MongoDB
Auth      → JWT + secure password hashing
```

```



---

# 47. Core System Flow

```text
                    HMS
                     |
                  Login
                     |
              Authentication
                     |
             Check User Role
                     |
        +------------+------------+
        |            |            |
      Admin        Warden       Student
        |            |            |
        v            v            v
   Admin Panel   Warden Panel  Student Panel
        |            |            |
        |            |            |
        +------------+------------+
                     |
             Shared Hostel Data
                     |
       +-------------+-------------+
       |             |             |
     Rooms         Leaves      Complaints
       |             |             |
       +-------------+-------------+
                     |
              Announcements
```

---

# 48. Important Development Rule

HMS should be developed **module by module**.

Do not generate the entire application blindly in one step.

Recommended order:

```text
1. Project Architecture
2. Database Design
3. Authentication
4. Role-Based Authorization
5. Admin Dashboard
6. Student Management
7. Warden Management
8. Room Management
9. Leave Management
10. Complaint Management
11. Announcements
12. Student Dashboard/Profile
13. Reports
14. Validation & Security
15. Responsive UI
16. Testing
17. Deployment
```

This document should be treated as the **single source of truth for the initial HMS website requirements**.
