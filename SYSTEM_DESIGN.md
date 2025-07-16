# System Design Document
## Academic Management Platform

### Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [System Components](#system-components)
4. [Database Design](#database-design)
5. [API Design](#api-design)
6. [Authentication & Authorization](#authentication--authorization)
7. [File Management](#file-management)
8. [AI Integration](#ai-integration)
9. [Real-time Features](#real-time-features)
10. [Deployment Architecture](#deployment-architecture)
11. [Security Considerations](#security-considerations)
12. [Performance & Scalability](#performance--scalability)

---

## Overview

The Academic Management Platform is a full-stack university CRM system designed to manage the complete academic lifecycle including user management, course administration, assignment workflows, and AI-powered features. The system follows a modular monolithic architecture with clear separation of concerns.

### Key Requirements
- Role-based access control (Student, Lecturer, Admin)
- Course lifecycle management
- Assignment submission and grading workflow
- AI-powered course recommendations and syllabus generation
- Real-time notifications
- File upload and management
- Scalable and maintainable codebase

---

## Architecture

### High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web Browser]
        Mobile[Mobile App]
    end
    
    subgraph "Load Balancer"
        LB[Nginx/Load Balancer]
    end
    
    subgraph "Frontend Layer"
        FE[Next.js Frontend<br/>Port 3000]
    end
    
    subgraph "Backend Layer"
        API[NestJS API Server<br/>Port 3001]
        WS[WebSocket Server<br/>Real-time Events]
    end
    
    subgraph "External Services"
        OpenAI[OpenAI API<br/>GPT-4]
        Email[Email Service<br/>Notifications]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL<br/>Database)]
        Redis[(Redis Cache<br/>Sessions)]
        FS[File System<br/>Uploads]
    end
    
    Web --> LB
    Mobile --> LB
    LB --> FE
    FE --> API
    API --> WS
    API --> OpenAI
    API --> Email
    API --> DB
    API --> Redis
    API --> FS
    
    style FE fill:#e1f5fe
    style API fill:#f3e5f5
    style DB fill:#e8f5e8
    style OpenAI fill:#fff3e0
```

### Architecture Pattern: Modular Monolith

The system follows a **Modular Monolith** pattern with the following benefits:
- **Simplified Deployment**: Single deployable unit
- **Consistent Data**: ACID transactions across modules
- **Development Speed**: Faster development and testing
- **Clear Boundaries**: Well-defined module interfaces
- **Future Migration**: Easy to extract microservices later

---

## System Components

### Frontend Architecture (Next.js)

```mermaid
graph TB
    subgraph "Next.js Frontend"
        subgraph "App Router"
            Pages[Pages<br/>Route Handlers]
            API[API Routes<br/>Server Actions]
        end
        
        subgraph "State Management"
            Redux[Redux Toolkit<br/>Global State]
            Context[React Context<br/>User Session]
        end
        
        subgraph "Components"
            UI[UI Components<br/>Reusable]
            Forms[Form Components<br/>Validation]
            Layout[Layout Components<br/>Navigation]
        end
        
        subgraph "Hooks & Utils"
            Hooks[Custom Hooks<br/>Business Logic]
            Utils[Utility Functions<br/>Helpers]
        end
    end
    
    Pages --> Redux
    API --> Context
    UI --> Hooks
    Forms --> Utils
    
    style Pages fill:#e3f2fd
    style Redux fill:#f1f8e9
    style UI fill:#fce4ec
```

### Backend Architecture (NestJS)

```mermaid
graph TB
    subgraph "NestJS Backend"
        subgraph "Controllers"
            AuthC[Auth Controller]
            CourseC[Course Controller]
            AssignC[Assignment Controller]
            AIC[AI Controller]
        end
        
        subgraph "Services"
            AuthS[Auth Service]
            CourseS[Course Service]
            AssignS[Assignment Service]
            AIS[AI Service]
        end
        
        subgraph "Guards & Middleware"
            JWTGuard[JWT Guard]
            RoleGuard[Role Guard]
            FileGuard[File Guard]
        end
        
        subgraph "Data Layer"
            Entities[TypeORM Entities]
            Repos[Repositories]
            Migrations[Database Migrations]
        end
    end
    
    AuthC --> AuthS
    CourseC --> CourseS
    AssignC --> AssignS
    AIC --> AIS
    
    AuthS --> JWTGuard
    CourseS --> RoleGuard
    AssignS --> FileGuard
    
    AuthS --> Entities
    CourseS --> Repos
    AssignS --> Migrations
    
    style AuthC fill:#e8f5e8
    style AuthS fill:#f3e5f5
    style JWTGuard fill:#fff3e0
    style Entities fill:#e1f5fe
```

---

## Database Design

### Entity Relationship Diagram

```mermaid
erDiagram
    USER {
        uuid id PK
        string email UK
        string password
        string firstName
        string lastName
        enum role
        timestamp createdAt
        timestamp updatedAt
    }
    
    COURSE {
        uuid id PK
        string title
        string description
        int credits
        uuid lecturerId FK
        string syllabusPath
        timestamp createdAt
        timestamp updatedAt
    }
    
    ENROLLMENT {
        uuid id PK
        uuid courseId FK
        uuid studentId FK
        enum status
        timestamp enrolledAt
        timestamp approvedAt
    }
    
    ASSIGNMENT {
        uuid id PK
        uuid courseId FK
        uuid studentId FK
        string title
        text description
        string filePath
        float grade
        timestamp submittedAt
        timestamp gradedAt
    }
    
    NOTIFICATION {
        uuid id PK
        uuid userId FK
        string type
        string title
        text message
        boolean isRead
        timestamp createdAt
    }
    
    USER ||--o{ COURSE : "teaches"
    USER ||--o{ ENROLLMENT : "enrolls"
    USER ||--o{ ASSIGNMENT : "submits"
    USER ||--o{ NOTIFICATION : "receives"
    COURSE ||--o{ ENROLLMENT : "has"
    COURSE ||--o{ ASSIGNMENT : "contains"
    
    USER {
        STUDENT "Can enroll in courses"
        LECTURER "Can create courses"
        ADMIN "Can manage all"
    }
    
    ENROLLMENT {
        PENDING "Awaiting approval"
        APPROVED "Active enrollment"
        REJECTED "Denied enrollment"
        DROPPED "Student withdrew"
    }
```

### Database Schema Details

#### User Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE user_role AS ENUM ('STUDENT', 'LECTURER', 'ADMIN');
```

#### Course Table
```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL DEFAULT 3,
    lecturer_id UUID REFERENCES users(id),
    syllabus_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Design

### RESTful API Structure

```mermaid
graph TB
    subgraph "Authentication API"
        AuthPost[POST /auth/register]
        AuthLogin[POST /auth/login]
        AuthProfile[GET /auth/profile]
    end
    
    subgraph "Course Management API"
        CourseList[GET /courses]
        CourseCreate[POST /courses]
        CourseDetail[GET /courses/:id]
        CourseUpdate[PUT /courses/:id]
        CourseDelete[DELETE /courses/:id]
    end
    
    subgraph "Enrollment API"
        EnrollCreate[POST /enrollments]
        EnrollList[GET /enrollments]
        EnrollUpdate[PUT /enrollments/:id/status]
    end
    
    subgraph "Assignment API"
        AssignSubmit[POST /assignments]
        AssignList[GET /assignments/course/:id]
        AssignGrade[PUT /assignments/:id/grade]
    end
    
    subgraph "AI Integration API"
        AIRecommend[POST /ai/recommend]
        AISyllabus[POST /ai/syllabus]
    end
    
    style AuthPost fill:#e8f5e8
    style CourseList fill:#e1f5fe
    style EnrollCreate fill:#f3e5f5
    style AssignSubmit fill:#fff3e0
    style AIRecommend fill:#fce4ec
```

### API Response Format

```typescript
// Success Response
interface APIResponse<T> {
    success: true;
    data: T;
    message?: string;
    timestamp: string;
}

// Error Response
interface APIError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp: string;
}

// Paginated Response
interface PaginatedResponse<T> {
    success: true;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
```

---

## Authentication & Authorization

### JWT Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant Frontend
    participant Backend
    participant Database
    
    Client->>Frontend: Enter credentials
    Frontend->>Backend: POST /auth/login
    Backend->>Database: Validate user
    Database-->>Backend: User data
    Backend-->>Frontend: JWT token + user info
    Frontend->>Client: Redirect to dashboard
    
    Note over Frontend: Store JWT in httpOnly cookie
    
    Client->>Frontend: Access protected route
    Frontend->>Backend: API call with JWT
    Backend->>Backend: Validate JWT
    Backend-->>Frontend: Protected data
    Frontend->>Client: Render protected content
```

### Role-Based Access Control (RBAC)

```mermaid
graph TB
    subgraph "Role Hierarchy"
        Admin[Admin<br/>Full Access]
        Lecturer[Lecturer<br/>Course Management]
        Student[Student<br/>Course Enrollment]
    end
    
    subgraph "Permissions"
        AdminPerms[• User Management<br/>• Course Approval<br/>• System Settings<br/>• Analytics]
        LecturerPerms[• Create Courses<br/>• Grade Assignments<br/>• Manage Enrollments<br/>• Upload Syllabus]
        StudentPerms[• Enroll in Courses<br/>• Submit Assignments<br/>• View Grades<br/>• Access Materials]
    end
    
    Admin --> AdminPerms
    Lecturer --> LecturerPerms
    Student --> StudentPerms
    
    Admin -.-> LecturerPerms
    Admin -.-> StudentPerms
    
    style Admin fill:#ffcdd2
    style Lecturer fill:#c8e6c9
    style Student fill:#bbdefb
```

---

## File Management

### File Upload Architecture

```mermaid
graph TB
    subgraph "File Upload Flow"
        Client[Client Upload]
        Multer[Multer Middleware]
        Validation[File Validation]
        Storage[Local Storage]
        Database[Database Record]
    end
    
    subgraph "File Types"
        Syllabus[Syllabus Files<br/>PDF, DOCX]
        Assignments[Assignment Files<br/>PDF, DOCX, TXT]
        Transcripts[Generated Transcripts<br/>PDF]
    end
    
    Client --> Multer
    Multer --> Validation
    Validation --> Storage
    Storage --> Database
    
    Validation --> Syllabus
    Validation --> Assignments
    Validation --> Transcripts
    
    style Client fill:#e1f5fe
    style Storage fill:#f3e5f5
    style Database fill:#e8f5e8
```

### File Storage Structure

```
uploads/
├── syllabi/
│   ├── {courseId}/
│   │   └── {timestamp}-{filename}
├── assignments/
│   ├── {courseId}/
│   │   ├── {studentId}/
│   │   │   └── {assignmentId}-{filename}
└── transcripts/
    ├── {studentId}/
    │   └── {timestamp}-transcript.pdf
```

---

## AI Integration

### AI Service Architecture

```mermaid
graph TB
    subgraph "AI Integration Layer"
        Controller[AI Controller]
        Service[AI Service]
        Provider[AI Provider]
    end
    
    subgraph "AI Features"
        Recommend[Course Recommendations]
        Syllabus[Syllabus Generation]
        Plagiarism[Plagiarism Detection]
    end
    
    subgraph "External AI Services"
        OpenAI[OpenAI GPT-4]
        MockAI[Mock AI Service]
    end
    
    Controller --> Service
    Service --> Provider
    
    Service --> Recommend
    Service --> Syllabus
    Service --> Plagiarism
    
    Provider --> OpenAI
    Provider --> MockAI
    
    style Controller fill:#e1f5fe
    style OpenAI fill:#fff3e0
    style MockAI fill:#f3e5f5
```

### AI Workflow Examples

#### Course Recommendation Flow
```typescript
interface RecommendationRequest {
    studentId: string;
    interests: string[];
    completedCourses: string[];
}

interface RecommendationResponse {
    courses: {
        id: string;
        title: string;
        description: string;
        matchScore: number;
        reasons: string[];
    }[];
}
```

#### Syllabus Generation Flow
```typescript
interface SyllabusRequest {
    courseTitle: string;
    description: string;
    credits: number;
    duration: string;
}

interface SyllabusResponse {
    syllabus: {
        overview: string;
        objectives: string[];
        schedule: WeeklySchedule[];
        assessments: Assessment[];
        resources: Resource[];
    };
}
```

---

## Real-time Features

### WebSocket Architecture

```mermaid
graph TB
    subgraph "WebSocket Flow"
        Client[Client Connection]
        Gateway[WebSocket Gateway]
        Handler[Event Handler]
        Emitter[Event Emitter]
    end
    
    subgraph "Real-time Events"
        Enrollment[Enrollment Updates]
        Grades[Grade Notifications]
        Assignments[Assignment Status]
        System[System Messages]
    end
    
    Client <--> Gateway
    Gateway --> Handler
    Handler --> Emitter
    
    Emitter --> Enrollment
    Emitter --> Grades
    Emitter --> Assignments
    Emitter --> System
    
    style Client fill:#e1f5fe
    style Gateway fill:#f3e5f5
    style Handler fill:#e8f5e8
```

### Event Types

```typescript
enum SocketEvents {
    ENROLLMENT_APPROVED = 'enrollment.approved',
    ENROLLMENT_REJECTED = 'enrollment.rejected',
    ASSIGNMENT_GRADED = 'assignment.graded',
    COURSE_UPDATED = 'course.updated',
    SYSTEM_NOTIFICATION = 'system.notification'
}

interface SocketPayload {
    userId: string;
    event: SocketEvents;
    data: any;
    timestamp: string;
}
```

---

## Deployment Architecture

### Docker Container Architecture

```mermaid
graph TB
    subgraph "Docker Compose Stack"
        subgraph "Frontend Container"
            NextApp[Next.js App<br/>Port 3000]
        end
        
        subgraph "Backend Container"
            NestApp[NestJS API<br/>Port 3001]
        end
        
        subgraph "Database Container"
            PostgresDB[PostgreSQL<br/>Port 5432]
        end
        
        subgraph "Cache Container"
            RedisCache[Redis<br/>Port 6379]
        end
        
        subgraph "Reverse Proxy"
            Nginx[Nginx<br/>Port 80/443]
        end
    end
    
    subgraph "External Services"
        OpenAI[OpenAI API]
        Email[Email Service]
    end
    
    Nginx --> NextApp
    NextApp --> NestApp
    NestApp --> PostgresDB
    NestApp --> RedisCache
    NestApp --> OpenAI
    NestApp --> Email
    
    style NextApp fill:#e1f5fe
    style NestApp fill:#f3e5f5
    style PostgresDB fill:#e8f5e8
    style RedisCache fill:#fff3e0
```

### Production Deployment Options

```mermaid
graph TB
    subgraph "Cloud Deployment"
        subgraph "Option 1: Platform Services"
            Vercel[Vercel<br/>Frontend]
            Railway[Railway<br/>Backend]
            Neon[Neon<br/>Database]
        end
        
        subgraph "Option 2: Container Platform"
            Render[Render<br/>Full Stack]
            Railway2[Railway<br/>Database]
        end
        
        subgraph "Option 3: Self-Hosted"
            VPS[VPS/Dedicated<br/>Full Stack]
            Docker[Docker Compose]
        end
    end
    
    style Vercel fill:#e1f5fe
    style Railway fill:#f3e5f5
    style Neon fill:#e8f5e8
    style Render fill:#fff3e0
```

---

## Security Considerations

### Security Layers

```mermaid
graph TB
    subgraph "Security Architecture"
        subgraph "Authentication Layer"
            JWT[JWT Tokens]
            Refresh[Refresh Tokens]
            Session[Session Management]
        end
        
        subgraph "Authorization Layer"
            RBAC[Role-Based Access]
            Guards[Route Guards]
            Middleware[Auth Middleware]
        end
        
        subgraph "Data Protection"
            Encryption[Data Encryption]
            Validation[Input Validation]
            Sanitization[Data Sanitization]
        end
        
        subgraph "Infrastructure Security"
            HTTPS[HTTPS/TLS]
            CORS[CORS Policy]
            RateLimit[Rate Limiting]
        end
    end
    
    JWT --> RBAC
    RBAC --> Encryption
    Encryption --> HTTPS
    
    style JWT fill:#ffcdd2
    style RBAC fill:#c8e6c9
    style Encryption fill:#bbdefb
    style HTTPS fill:#d7ccc8
```

### Security Measures

1. **Authentication Security**
   - JWT tokens with short expiration
   - Refresh token rotation
   - Secure cookie storage
   - Password hashing with bcrypt

2. **Authorization Security**
   - Role-based access control
   - Route-level guards
   - Resource-level permissions
   - API endpoint protection

3. **Data Security**
   - Input validation and sanitization
   - SQL injection prevention
   - XSS protection
   - File upload validation

4. **Infrastructure Security**
   - HTTPS enforcement
   - CORS configuration
   - Rate limiting
   - Environment variable protection

---

## Performance & Scalability

### Performance Optimization

```mermaid
graph TB
    subgraph "Performance Strategies"
        subgraph "Frontend Optimization"
            CodeSplit[Code Splitting]
            LazyLoad[Lazy Loading]
            ImageOpt[Image Optimization]
            Caching[Browser Caching]
        end
        
        subgraph "Backend Optimization"
            QueryOpt[Query Optimization]
            Indexing[Database Indexing]
            Compression[Response Compression]
            ConnPool[Connection Pooling]
        end
        
        subgraph "Infrastructure"
            CDN[CDN Distribution]
            LoadBalance[Load Balancing]
            Monitoring[Performance Monitoring]
        end
    end
    
    CodeSplit --> QueryOpt
    QueryOpt --> CDN
    
    style CodeSplit fill:#e1f5fe
    style QueryOpt fill:#f3e5f5
    style CDN fill:#e8f5e8
```

### Scalability Considerations

1. **Horizontal Scaling**
   - Stateless application design
   - Load balancer configuration
   - Database clustering
   - Microservices migration path

2. **Vertical Scaling**
   - Resource optimization
   - Memory management
   - CPU utilization
   - Database tuning

3. **Caching Strategy**
   - Redis for session storage
   - Database query caching
   - Static asset caching
   - API response caching

4. **Monitoring & Observability**
   - Application metrics
   - Database performance
   - Error tracking
   - User analytics

---

## Conclusion

This system design provides a robust, scalable, and maintainable architecture for the Academic Management Platform. The modular monolith approach ensures rapid development while maintaining the flexibility to evolve into microservices as the system grows.

### Key Design Decisions

1. **Modular Monolith**: Balances simplicity with scalability
2. **TypeScript**: Ensures type safety across the stack
3. **Docker**: Provides consistent deployment environments
4. **JWT Authentication**: Stateless and scalable security
5. **PostgreSQL**: ACID compliance for academic data
6. **Real-time Features**: Enhanced user experience
7. **AI Integration**: Future-ready with mock fallbacks

### Future Enhancements

- Microservices migration
- Advanced analytics dashboard
- Mobile application support
- Integration with external LMS
- Advanced AI features
- Multi-tenant support

This design document serves as a comprehensive guide for development, deployment, and maintenance of the Academic Management Platform.