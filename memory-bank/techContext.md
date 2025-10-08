# Technical Context

## Technology Stack

### Web Frontend
- **Framework**: React 18.3 with TypeScript 5.5
- **Build Tool**: Vite 5.4 (with SWC plugin for fast compilation)
- **UI Framework**: shadcn/ui (built on Radix UI primitives) with Tailwind CSS 3.4
- **State Management**: React Query (TanStack) for server state
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Routing**: React Router DOM 6.26
- **Styling**: Tailwind CSS with custom component variants
- **Carousels**: Embla Carousel with autoplay
- **Charts**: Recharts for admin dashboard visualizations

### Mobile Frontend (Admin Portal)
- **Framework**: React Native with TypeScript
- **Navigation**: React Navigation (Stack + Tab navigation)
- **State Management**: Redux Toolkit + React Query
- **UI Framework**: React Native Paper or custom component library
- **Authentication**: Keychain (iOS)/KeyStore (Android) for secure token storage
- **Offline Storage**: Realm or WatermelonDB
- **File Handling**: React Native Document Picker, Image Picker
- **Notifications**: React Native Firebase for push notifications
- **Network**: Axios with retry logic and interceptors

### Backend
- **Runtime**: Node.js (v18+ required)
- **Framework**: Express.js 5.1 (with ES modules)
- **Database**: PostgreSQL 16 with pg driver
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Uploads**: Multer for handling file uploads
- **Email**: Nodemailer for SMTP email sending
- **Email Templates**: Basic HTML/CSS email templates
- **Archiving**: Archiver for creating ZIP backups

### Development Tools
- **Linting**: ESLint 9 with React hooks and refresh plugins
- **Type Checking**: TypeScript with strict mode
- **CSS Processing**: PostCSS with Tailwind and Autoprefixer
- **Package Management**: npm (not yarn/pnpm)
- **Version Control**: Git

## Development Setup

### Prerequisites
- Node.js v18 or higher
- npm package manager
- PostgreSQL database server
- Git

### Installation Steps
1. Clone repository: `git clone <url>`
2. Install dependencies: `npm install`
3. Create environment file: `cp .env.example .env`
4. Configure database settings in `.env`
5. Run database setup: `npm run db:setup` (runs `node server/setupDatabase.js`)

### Development Commands
- `npm run dev`: Start Vite development server (frontend)
- `npm run build`: Production build
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint checks
- Server: `cd server && npm run dev` to start Express server with `--watch`

### Project Structure
```
├── src/                    # React TypeScript application
│   ├── components/         # Reusable React components
│   │   ├── ui/            # shadcn/ui components
│   │   └── [feature]/     # Feature-specific components
│   ├── pages/             # Route page components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and configurations
│   └── types/            # TypeScript type definitions
├── server/                # Node.js Express backend
│   ├── index.js          # Main server file
│   ├── lib/              # Backend utilities
│   ├── migrations/       # Database migration files
│   └── uploads/          # File upload storage
├── public/               # Static assets (images, etc.)
└── memory-bank/          # Project documentation
```

## Technical Constraints

### Environment Requirements
- Node.js LTS (v18+) - required for Express 5.x
- PostgreSQL 12+ for full feature support
- HTTPS for production (SSL certificate required)
- SMTP server access for email functionality

### Performance Considerations
- Frontend bundle optimized via Vite's chunk splitting
- Database connection pooling not implemented (may need for high traffic)
- File uploads stored locally (S3/cloud storage recommended for production)
- No caching layer (Redis recommended for session/data caching)

### Security Considerations
- JWT tokens with reasonable expiration (currently 24 hours)
- bcrypt password hashing with salt rounds (default 10)
- CORS configured for cross-origin requests
- Input validation via Zod schemas
- SQL injection protection via parameterized queries

### Deployment Constraints
- Single server architecture (monolithic)
- Database migrations handled via SQL scripts (no ORM migration tools)
- Manual backup processes (archiver for ZIP creation)
- No containerization (Docker) currently configured

## Dependencies Analysis

### Critical Dependencies
- React ecosystem: Must maintain compatibility between React Hook Form, React Query, and React Router
- Database: pg driver must match PostgreSQL version
- Email: Requires SMTP configuration (external service like SendGrid recommended)
- File handling: Local storage only (scalability concerns for production)

### Maintenance Concerns
- Multiple @radix-ui packages - need to keep versions synchronized
- Express 5.x - new major version, potential breaking changes
- TypeScript strict mode - may cause compilation issues with dependency updates

## Environment Variables

Required environment variables (to be documented in .env.example):
- DATABASE_URL: PostgreSQL connection string
- JWT_SECRET: Random string for token signing
- SMTP_*: Email configuration (host, port, user, pass)
- SESSION_SECRET: For session management
- FRONTEND_URL: For CORS and email links
