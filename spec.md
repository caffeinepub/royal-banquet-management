# Royal Banquet Management System

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- **Customer Portal** (public-facing): Hall photo gallery, food menu info, event types (weddings, receptions, birthdays, corporate), booking form with confirmation popup, view own booking details, view quotation, select menu, upload documents, pay advance/balance, track event status, give feedback
- **Branch Manager Portal** (authenticated): All bookings list, hall info + available seats, customer details (name, phone, event type), lead management, schedule property visits, create bookings, assign vendors, manage event checklist, generate invoices, update payments, view operational staff requests
- **Operations/Kitchen Staff Portal** (authenticated): View event schedule, view guest count per event, view assigned menu, auto raw material requirements calculation, update stock usage, send stock request to branch manager
- **Owner / Super Admin Portal** (authenticated): View all branches, revenue analytics, performance dashboards, payment reports, staff management, pricing control
- **Single shared backend** for all portals: bookings, halls, stock, staff requests, users/roles, payments, feedback

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
- User roles: owner, branch_manager, operations_staff, customer
- Hall data: id, name, capacity, available seats, images, branch
- Booking data: id, customer info (name, phone, email), event type, date, hall, guest count, menu selection, status, payment status, quotation amount, advance paid, balance
- Menu data: food categories and items
- Stock data: item name, quantity, unit, minimum threshold
- Stock requests: staff member, item, quantity requested, status, timestamp
- Leads data: contact info, visit scheduled, notes
- Vendor data: name, service type, contact
- Checklist items per booking
- Invoice data per booking
- Feedback: booking id, rating, comment
- Payment records: booking id, amount, type (advance/balance), date
- Staff data: name, role, branch, contact
- Branch data: name, location, manager
- Analytics: revenue by period, booking counts, occupancy rates

### Frontend
- Route-based navigation: `/` (customer portal), `/manager` (branch manager), `/staff` (operations), `/owner` (super admin)
- Customer Portal: hero with hall gallery, event types section, food menu section, booking form, booking confirmation popup, customer login to track booking
- Branch Manager Portal: dashboard with booking stats, bookings table, leads management, hall overview, vendor assignment, checklist per booking, invoice generation, payment tracking, staff requests panel
- Operations Staff Portal: today's events list, guest counts, menus per event, stock inventory table, stock usage update, stock request form
- Owner Portal: multi-branch overview, revenue charts, performance metrics, payment reports, staff management table, pricing control panel
- Role-based login/access control using authorization component
