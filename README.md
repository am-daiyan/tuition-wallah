# Tuition Wallah Connect

Lovable Prompt — Tuition Wallah Full-Fledged Website

Build a complete, production-ready, fully functional website for “Tuition Wallah”, a home-tuition platform connecting students with teachers.

The website should not be a simple landing page or visual prototype. Build the complete working product, including frontend, backend/database, authentication, dashboards, forms, teacher management, tuition management, admin panel, email notifications, reviews, complaints, and replacement-teacher workflow.

IMPORTANT LOGO INSTRUCTION

I will provide the official Tuition Wallah logo separately as an image/SVG file.

Do NOT create, generate, redesign, recreate, replace, or invent a logo.

Do not use an AI-generated logo or placeholder logo.

When I provide the logo, use that exact logo throughout the website wherever appropriate.

1. DESIGN & VISUAL DIRECTION

The website must look:

Premium

Modern

Aesthetic

Sexy

Cool

Professional

Clean

Trustworthy

Education-focused without looking childish

Modern enough to feel like a real startup/product

Avoid generic AI-generated website aesthetics.

Do not make it look like a basic school website.

Use strong visual hierarchy, excellent typography, attractive spacing, modern cards, subtle animations, smooth transitions, tasteful gradients, premium buttons, elegant sections, and responsive layouts.

The design should feel like a professional modern education-tech platform.

Use animations sparingly and intelligently. Nothing should feel excessive, distracting, or gimmicky.

The website must be:

Fully responsive

Mobile-first

Tablet responsive

Desktop responsive

Accessible

Fast-loading

Consistent throughout

2. BRAND INFORMATION

Brand:

TUITION WALLAH

Main tagline:

“Find the Right Tutor, Build a Better Future.”

Service:

Home Tuition

Classes:

Class 1 to 12

Boards:

CBSE

ICSE

U.P. Board

Key brand messaging:

Quality Teaching

Better Concepts

Brighter Future

Experienced Teachers

Concept Clarity

Regular Assessment

Personal Attention

Main contact:

8081918275

Location:

Vikas Nagar, Bargdwa, Gorakhpur

Closing message:

“YOUR SUCCESS IS OUR MISSION”

3. USER TYPES

There are only three major account types:

Student

The parent and student are treated as one user/account.

There must NOT be a separate parent account or parent dashboard.

Teacher

Teachers can register and create their teaching profile.

Admin

Admin manages the entire platform through an admin dashboard.

4. REGISTRATION & LOGIN

Student Registration

Use the terminology:

Register

Do NOT use a separate “Sign Up” button.

Student registration should collect the required information, including relevant details such as:

Student name

Mobile number

Email if required

Class

Board

Subjects/tuition requirement

Location

Preferred timing

Teaching mode

Other necessary tuition details

Do not unnecessarily ask for excessive information.

Student Login

Use:

Login

Login should be based on mobile number.

There should be:

NO User ID

NO username system

NO separate student ID login

Prefer a secure mobile-number + OTP authentication flow if supported by the chosen backend/service.

5. ADMIN EMAIL NOTIFICATIONS

This is an important requirement.

Whenever a user submits an important registration/request, the information should automatically be sent to the admin's configured email address.

The admin email should be configurable through environment variables/settings rather than hardcoded into the frontend.

At minimum, send an email notification for:

New Student Registration

Send the student's submitted registration details to the admin email.

New Teacher Registration

Send the teacher's submitted registration/application details to the admin email.

New Complaint

Send complaint details to the admin email.

Teacher Replacement Request

Send replacement-request details to the admin email.

Other Important Requests

Notify the admin whenever an important action requires administrative attention.

Email sending must be implemented properly using a reliable transactional email approach/backend service. Do not create a fake frontend-only email system.

6. STUDENT DASHBOARD

Keep the student dashboard simple and useful.

Do NOT turn this into an LMS.

The dashboard should contain:

Student profile/details

Current teacher

Previous teachers

Current tuition information

Account information

Tuition-related requests/status

Complaint/request status where applicable

DO NOT BUILD:

Class-wise notes

Test series

Student performance analytics

Academic LMS

Separate parent dashboard

These are intentionally NOT part of the product.

7. FIND A TEACHER

Create a dedicated Find a Teacher experience.

Students should be able to browse and search teachers.

Provide useful filters such as:

Class

Subject

Board

Location

Experience

Availability

Teaching mode

Rating

Teacher cards should be attractive and informative.

Example information:

Teacher name

Profile photo

Subjects

Classes

Experience

Location

Availability

Teaching mode

Rating

Verified status

CTA:

View Profile

8. TEACHER PROFILE

Each teacher should have a professional public profile.

Include:

Profile photo

Name

Qualification

Teaching experience

Subjects

Classes

Boards

Location

Availability

Teaching mode

Ratings

Reviews

Verification status

Add a clear:

✓ Verified Teacher

badge only after the admin has approved/verified the teacher.

9. TEACHER AVAILABILITY

Teacher profiles must show availability.

Teachers should be able to specify:

Available days

Available time slots

Teaching mode

Preferred teaching location where applicable

Example:

Available: Monday–Saturday
Time: 4 PM–8 PM
Mode: Home Tuition / Online

Students should be able to use availability as a search filter.

10. BECOME A TEACHER

Create a dedicated:

Become a Teacher

page.

Teacher registration/application should collect relevant information such as:

Name

Mobile number

Email

Profile photo

Qualification

Teaching experience

Subjects

Classes

Boards

Location

Availability

Teaching mode

Other necessary information

Teacher application workflow:

Register → Submit Profile → Admin Review → Interview → Approval → Teacher Profile Active

The teacher's registration/application should also trigger an email notification to the admin.

11. ADMIN TEACHER APPROVAL

Teachers should NOT automatically become verified just by registering.

Admin should be able to:

View application

Review details

Approve

Reject

Mark as verified

Manage teacher profile

Manage availability

Change status

Possible statuses:

Pending

Under Review

Interview

Approved

Rejected

Suspended

Only approved teachers should appear as active/verified teachers where appropriate.

12. TUITION REQUEST / MATCHING SYSTEM

Add a simple but powerful:

Post Your Tuition Requirement

feature.

A student can submit:

Class

Board

Subject

Location

Preferred days

Preferred time

Teaching mode

Additional requirements

Example:

Class: 10
Board: CBSE
Subject: Mathematics
Location: Bargdwa
Time: 5–7 PM
Mode: Home Tuition

The request should be visible to the admin.

Admin can then find and assign/recommend an appropriate teacher.

13. TUITION SCHEDULING

Provide tuition scheduling functionality.

Manage:

Student

Teacher

Days

Time

Start date

Teaching mode

Status

Support:

Home Tuition

Teacher visits the student's location.

Online Tuition

Virtual teaching/meeting, including Zoom where applicable.

14. STUDENT ↔ TEACHER COMMUNICATION

There is no separate parent communication system.

Communication is:

Student ↔ Teacher

Support relevant communication methods such as:

Phone

WhatsApp

Zoom/virtual meeting

Home-visit coordination

Do not build an unnecessarily complicated internal chat system unless it is required for the core functionality.

15. TEACHER REVIEWS & RATINGS

Students should be able to review teachers.

Allow:

Star rating

Written review

Display reviews on teacher profiles.

Admin should be able to moderate/remove inappropriate reviews.

16. COMPLAINT / PROBLEM SYSTEM

Create a simple complaint system.

Students should be able to submit problems regarding:

Teacher

Tuition

Scheduling

Communication

Other issues

Each complaint should have:

Complaint details

Date

Student

Relevant teacher

Status

Admin can manage complaint status.

Possible statuses:

Open

Under Review

Resolved

Closed

New complaints should trigger an admin email notification.

17. REPLACEMENT TEACHER SYSTEM

This is one of the most important features.

Students must be able to request a teacher replacement.

CTA:

Request Teacher Replacement

Student submits:

Current teacher

Reason

Preferred replacement requirements

Preferred timing

Additional information

Workflow:

Student Request → Admin Notification → Admin Reviews → Suitable Teacher Selected → Replacement Assigned

The previous teacher should NOT disappear from the student's history.

They should remain under:

Previous Teachers

This history should be visible in the student's dashboard.

18. ADMIN DASHBOARD

Build a proper, professional admin dashboard.

Admin should be able to manage:

Students

View students

View student details

View current teacher

View previous teachers

Manage accounts

Teachers

View teachers

View applications

Approve/reject

Verify teachers

Manage profiles

Manage availability

Tuition

View tuition requests

Assign teachers

Manage schedules

View active tuition

Replacement Requests

View requests

Review reason

Select replacement

Assign new teacher

Complaints

View complaints

Update status

Resolve complaints

Reviews

View reviews

Moderate reviews

Remove inappropriate reviews

Registrations

View all recent registrations

View registration details

Email/Notification Status

Where technically possible, show important notification/request statuses.

The admin dashboard should be secure and accessible only to authorized admins.

19. CONTACT SECTION

Include:

TUITION WALLAH

Phone: 8081918275

Location: Vikas Nagar, Bargdwa, Gorakhpur

Provide clear CTAs for contacting Tuition Wallah.

20. SOCIAL MEDIA

Include links/icons for:

WhatsApp

Instagram

Facebook

YouTube

Use actual configurable links/placeholders that can easily be replaced with the customer's real social URLs.

Do not invent fake social-media URLs.

21. WEBSITE PAGES

At minimum, create:

Home

Find a Teacher

Teacher Profile

Become a Teacher

Register

Login

Student Dashboard

Post Tuition Requirement

Complaints / Support

About

Contact

Admin Dashboard

Add appropriate legal/basic pages if required for a production website, such as:

Privacy Policy

Terms & Conditions

22. NAVIGATION

Create a clean modern navbar.

Suggested navigation:

Home | Find a Teacher | Become a Teacher | About | Contact | Login | Register

For logged-in users, intelligently replace public actions with:

Dashboard | Profile | Logout

Make navigation responsive on mobile.

23. DATABASE / BACKEND

Do not make this a static frontend.

Implement a proper backend/database architecture for:

Users

Students

Teachers

Teacher applications

Teacher availability

Tuition requests

Tuition assignments

Schedules

Reviews

Complaints

Replacement requests

Previous teacher history

Admin management

Notification/email records where appropriate

Use proper relationships between entities.

Do not duplicate data unnecessarily.

24. SECURITY

Implement proper:

Authentication

Authorization

Protected routes

Admin-only routes

Input validation

Server-side validation

Secure password/OTP handling where applicable

Protection against unauthorized access

Secure environment variables

Proper error handling

Students must never be able to access admin data.

Teachers must only be able to access information they are authorized to access.

25. RESPONSIVENESS

The website must work properly on:

Mobile phones

Tablets

Laptops

Desktop monitors

Do not simply shrink the desktop design for mobile.

Create proper responsive layouts.

26. UX REQUIREMENTS

The website should feel polished and production-ready.

Use:

Loading states

Empty states

Success messages

Error messages

Form validation

Confirmation dialogs where necessary

Skeleton/loading UI where useful

Clear CTA hierarchy

Accessible forms

Helpful error messages

Never leave the user wondering whether an action worked.

27. NO FAKE FUNCTIONALITY

This is extremely important.

Do NOT create buttons that merely look functional.

Every major action must actually work.

For example:

Register must actually register the user.

Login must actually authenticate.

Teacher search must actually search/filter database records.

Teacher application must actually save.

Admin must actually see registrations.

Complaint submission must actually save.

Replacement request must actually save.

Reviews must actually save.

Email notifications must actually be sent.

Dashboard data must come from the database.

Do not use fake/demo data as the final implementation.

Seed/demo data may be used temporarily during development, but the system must work with real user data.

28. ERROR-FREE IMPLEMENTATION

Before considering the project complete:

Test every form

Test registration

Test login

Test logout

Test teacher registration

Test teacher approval

Test teacher search/filtering

Test availability

Test tuition requests

Test scheduling

Test reviews

Test complaints

Test replacement requests

Test admin dashboard

Test email notifications

Test mobile responsiveness

Test protected routes

Test edge cases

Fix all console errors, broken links, broken routes, database errors, validation issues, and obvious UI bugs.

Do not leave TODOs or unfinished core functionality.

29. DESIGN QUALITY BAR

The final result should look like a real commercial product, not a generated template.

Prioritize:

Premium typography

Strong visual hierarchy

Excellent spacing

Modern cards

Beautiful teacher profiles

Attractive search experience

Smooth micro-interactions

Subtle animations

Professional dashboard

Consistent design system

High-quality responsive layouts

Avoid:

Excessive gradients

Excessive rounded cards

Cartoonish education graphics

Random illustrations

Excessive animations

Clutter

Generic stock-looking layouts

AI-looking design patterns

Keep the design aesthetic, sexy, cool, modern and professional while still being trustworthy and appropriate for an education business.

30. FINAL PRODUCT STRUCTURE

The core business flow should be:

STUDENT

Register → Login with Mobile → Dashboard → Find Teacher → Filter → View Teacher → Submit/Select Tuition → Schedule → Learn → Review

TEACHER

Register → Submit Profile → Admin Review → Interview → Approval → Verified Profile → Set Availability → Receive Students → Teach

ADMIN

Admin Login → Dashboard → Manage Students → Manage Teachers → Approve Teachers → Manage Tuition → Manage Complaints → Manage Replacement Requests → Manage Reviews → Monitor Registrations

IMPORTANT

Every important registration/request should notify the configured admin email.

Final instruction

Build this as a complete, polished, production-ready Tuition Wallah platform, not merely a UI mockup.

Use the requirements above as the source of truth.

Where a detail is not specified, choose the most sensible professional implementation rather than inventing unnecessary features.

Do not add an LMS, class-wise notes, test series, student performance analytics, or a separate parent account/dashboard.

Do not create or invent the logo. I have provided the official logo separately and it must be used exactly as provided.

The final website should be visually impressive, highly aesthetic ,sexy , fully responsive, functional end-to-end, connected to a real backend/database, and thoroughly tested for obvious bugs before completion.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tuition-wallah.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/399cd761-d128-4f13-98d1-468d29788243).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
