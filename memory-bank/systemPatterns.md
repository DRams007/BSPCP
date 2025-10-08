# System Patterns and Architecture

## Architecture Overview

### Monolithic Architecture with Separate Concerns
The BSPCP platform uses a monolithic architecture with clear separation between frontend and backend components, with planned mobile admin extension:

- **Web Frontend**: Single-page React application (SPA)
- **Mobile Frontend**: React Native application for admin portal
- **Backend**: RESTful API server
- **Database**: PostgreSQL with direct SQL access
- **File Storage**: Local filesystem for uploads and backups

### Component Architecture

#### Frontend Patterns
- **Page-Based Routing**: Flat routing structure with pages corresponding to routes
- **Component Composition**: Pages composed from shared components
- **Custom Hooks**: Business logic extracted into reusable hooks
- **UI Component Library**: shadcn/ui for consistent design system
- **Form Management**: React Hook Form with Zod schemas for validation
- **State Management**: React Query for server state, local state with useState/useReducer

#### Backend Patterns
- **Route Organization**: Feature-based route grouping
- **Middleware Chain**: Authentication, validation, error handling
- **Service Layer**: Business logic separated from route handlers
- **Direct SQL Access**: No ORM, parameterized queries for data access
- **File Upload Pipeline**: Multer processing with local storage

## Key Technical Decisions

### 1. Monolithic vs Microservices
**Decision**: Single monolithic application
**Rationale**:
- Lower complexity for current scale
- Easier deployment and maintenance
- Team size and requirements don't justify microservices overhead
- Future migration possible if scaling demands it

### 2. SQL over ORM
**Decision**: Direct PostgreSQL SQL queries with pg driver
**Rationale**:
- Full control over query optimization
- Complex joins and reporting queries
- Smaller bundle size (no ORM overhead)
- Team comfort with SQL
- Cost of learning curve avoided

### 3. Local File Storage
**Decision**: Server-side local storage for uploads
**Rationale**:
- Simpler initial implementation
- Lower cost for current usage
- Backup/archive functionality built-in
- Scalability concerns documented but acceptable for MVP

### 4. JWT Authentication
**Decision**: Stateless JWT tokens with bcrypt hashing
**Rationale**:
- Scalable across multiple servers
- Standard industry practice
- No server-side session storage required
- Mobile app compatibility (future-proofing)

### 5. React Query for State Management
**Decision**: TanStack Query for server state
**Rationale**:
- Optimized for server state patterns
- Built-in caching, synchronization, and error handling
- Reduces boilerplate compared to Redux
- Excellent developer experience with TypeScript

## Component Relationships

### Frontend Architecture
```
App.tsx (Root)
├── Router Configuration
├── Auth Context (future consideration)
└── Page Components

Page Components
├── Layout Components (Navigation, Footer, etc.)
├── Feature Components (Counsellor list, booking forms, etc.)
├── UI Components (shadcn/ui primitives)
└── Shared Components (Loading, Error states, etc.)
```

### Backend Architecture
```
Server (Express)
├── Middleware Stack (CORS, JSON parsing, auth)
├── Route Groups (auth, members, admin, payments)
├── Service Layer (business logic)
├── Database Layer (queries and connections)
└── File System (uploads, backups)
```

### Data Flow Patterns

#### API Request Flow
1. Client makes HTTP request with JWT token
2. Route middleware validates authentication
3. Route handler delegates to service layer
4. Service executes database queries
5. Response formatted and returned
6. React Query caches and updates UI

#### File Upload Flow
1. Client submits multipart form
2. Multer processes file on server
3. File stored in local uploads/ directory
4. Database record created with file reference
5. Client receives success response

#### Admin Content Flow
1. Admin edits content forms
2. React Hook Form validates with Zod
3. Form data submitted to API
4. Database update with transaction safety
5. Cache invalidated in React Query
6. UI updates automatically

## Design Patterns Implemented

### 1. Container Pattern
- **Components**: Page components act as containers
- **Logic**: Business logic extracted to custom hooks
- **Presentation**: UI components focused on rendering
- **Benefit**: Better testability and reusability

### 2. Service Layer Pattern
- **Purpose**: Separate business logic from HTTP concerns
- **Implementation**: Service functions in server/lib/
- **Benefit**: Unit testable business logic, API-agnostic

### 3. Repository Pattern (Simplified)
- **Data Access**: Direct SQL queries grouped by feature
- **Interface**: Consistent query function signatures
- **Benefit**: Centralized data access patterns without ORM

### 4. Middleware Chain Pattern
- **Request Processing**: Authentication, validation, error handling
- **Composition**: Express middleware system
- **Benefit**: Cross-cutting concerns handled consistently

### 5. Form Validation Pattern
- **Schema**: Zod schemas for type-safe validation
- **Integration**: React Hook Form with Zod resolver
- **UI Feedback**: Real-time validation with error display
- **Benefit**: Consistent validation across client and server

## Critical Implementation Paths

### User Authentication Flow
1. Login form submission → password verification
2. JWT token generation → client storage
3. Protected route access → token validation
4. Token refresh → seamless session management

### Counsellor Discovery Flow
1. Counsellor data loading → React Query cache
2. Search/filter parameters → API query
3. Results rendering → virtualized list (future optimization)
4. Profile access → detailed view loading

### Membership Management Flow
1. Application submission → file upload processing
2. Admin review → status update
3. Payment processing → confirmation
4. Member activation → email notification

### Admin Content Management Flow
1. Content editing → form validation
2. Media upload → file processing
3. Publication → cache invalidation
4. Frontend update → automatic re-fetch

## Error Handling Patterns

- **Client Errors**: React error boundaries, promise rejections
- **Server Errors**: Express error middleware, consistent response format
- **Database Errors**: Transaction rollbacks, meaningful error messages
- **Network Errors**: Retry logic in React Query, offline support

## Performance Optimization Patterns

- **Bundle Splitting**: Vite automatic chunking
- **Image Optimization**: Next.js-style future consideration
- **Query Optimization**: SQL EXPLAIN plans, indexes
- **Caching**: React Query for client-side, database indexes for server
- **Lazy Loading**: Route-based and component-based splitting

## Security Patterns

- **Input Validation**: Client and server-side with Zod
- **Authentication**: JWT with httpOnly considerations
- **Authorization**: Route-level middleware guards
- **Data Sanitization**: Prepared statements, escaped HTML
- **CORS Configuration**: Domain-whitelist approach
