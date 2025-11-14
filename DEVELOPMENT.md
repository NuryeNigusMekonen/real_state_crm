#  Real Estate CRM - Development Guide

##  Team jobs

###  Gedion - Backend Core & Security
**Branch:** `feature/backend-core`
**First Tasks:**
1. Create Spring Boot project in `/backend`
2. Setup basic Spring Security
3. Create User entity with id, username, email, password
4. Implement JWT authentication
5. Create login/register APIs

###  Rediet - Property Management APIs  
**Branch:** `feature/backend-properties`
**First Tasks:**
1. Create Property entities (Site, Building, Unit, Owner)
2. Implement CRUD APIs for properties
3. Create database relationships
4. Add property search functionality

###  Nardos - Frontend Foundation & UI
**Branch:** `feature/frontend-core`
**First Tasks:**
1. Create React + TypeScript app in `/frontend`
2. Setup React Router for navigation
3. Create login/register pages
4. Build main layout components
5. Setup API client for backend communication

###  Nebiyat - Property Management UI
**Branch:** `feature/frontend-properties`
**First Tasks:**
1. Create property listing pages
2. Build property creation/editing forms
3. Implement property search UI
4. Create data tables for properties
5. Add responsive design

###  Nurye - Leads & Analytics
**Branch:** `feature/leads-analytics`
**First Tasks:**
1. Design Lead entity (id, name, email, status, source)
2. Create lead management APIs
3. Build lead dashboard UI
4. Implement basic analytics

##  Development Workflow

### 1. Clone Repository
```bash
git clone https://github.com/NuryeNigusMekonen/real_state_crm.git
cd real_state_crm