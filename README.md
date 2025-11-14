Here's a clean, professional README.md for your project:

# Real Estate CRM

A full-stack Customer Relationship Management system for real estate agencies built with Spring Boot backend and React TypeScript frontend.

## Project Overview

This is a team project developed by 5 developers, each responsible for specific components of the system. The application provides comprehensive property management, lead tracking, and analytics capabilities for real estate professionals.

## Team Members

- **Gedion** - Backend Core & Security
- **Rediet** - Property Management APIs  
- **Nardos** - Frontend Foundation & UI
- **Nebiyat** - Property Management UI
- **Nurye** - Leads & Analytics

## Technology Stack

### Backend
- Java 17
- Spring Boot 3.x
- Spring Security with JWT
- MySQL Database
- Maven

### Frontend
- React 18
- TypeScript
- React Router
- Axios for API calls
- Modern CSS

### DevOps
- Docker
- Docker Compose

## Features

- **User Authentication** - Secure login/register with JWT
- **Property Management** - Complete CRUD for sites, buildings, units, and owners
- **Lead Management** - Track potential clients and conversions
- **Analytics Dashboard** - Insights and reporting
- **Responsive UI** - Works on desktop and mobile devices

## Quick Start

### Prerequisites
- Java 17+
- Node.js 16+
- MySQL 8.0+
- Docker (optional)

### Running with Docker (Recommended)
```bash
# Clone the repository
git clone https://github.com/NuryeNigusMekonen/real_state_crm.git
cd real_state_crm

# Start all services
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- MySQL: localhost:3306

### Manual Setup
```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend (in new terminal)
cd frontend
npm install
npm start
```

## Project Structure

```
real_state_crm/
├── backend/                 # Spring Boot application
│   ├── src/main/java/
│   │   └── com/realestatecrm/
│   │       ├── config/      # Security & application config
│   │       ├── entity/      # JPA entities
│   │       ├── service/     # Business logic
│   │       ├── controller/  # REST API endpoints
│   │       └── repository/  # Data access layer
│   └── src/main/resources/  # Application properties
├── frontend/                # React TypeScript application
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Page components
│       ├── hooks/           # Custom React hooks
│       ├── types/           # TypeScript definitions
│       └── api/             # API client services
└── docker-compose.yml       # Container orchestration
```

## Development Guide

For detailed development instructions, team responsibilities, and workflow guidelines, please see [DEVELOPMENT.md](DEVELOPMENT.md).

### Key Development Notes:
- Each team member works on their dedicated feature branch
- Follow the merge order specified in DEVELOPMENT.md
- Code reviews are required before merging
- Maintain clean commit history and descriptive messages

## API Documentation

Once the application is running, API documentation is available at:
- Swagger UI: http://localhost:8080/swagger-ui.html
- API Endpoints: http://localhost:8080/api

## Database Schema

The application uses a relational database with the following main entities:
- Users (Authentication & authorization)
- Sites, Buildings, BuildingUnits (Property hierarchy)
- Owners (Property ownership)
- Leads (Customer management)
- CommissionRecords (Sales tracking)

## Contributing

This is a team project following specific development workflows. Please refer to the DEVELOPMENT.md file for contribution guidelines and team coordination procedures.

## License

This project is developed for educational purposes as part of a team collaboration exercise.

## Support

For technical issues or questions about specific components, please contact the respective team member responsible for that area of the application.

---

**Built with collaboration and best practices in mind.**