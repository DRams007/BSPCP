# BSPCP - Botswana Society for Professional Counsellors & Psychotherapists

A web application connecting individuals with qualified mental health professionals in Botswana.

## Features

- **Find Counsellors**: Browse and connect with licensed counsellors and psychotherapists
- **Membership Management**: Professional membership system for BSPCP members
- **Admin Dashboard**: Complete administrative interface for managing content, members, and applications
- **Testimonials**: Client feedback and success stories
- **News & Events**: Latest updates from the counselling community

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI Framework**: shadcn/ui, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Authentication**: JWT tokens

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm
- PostgreSQL database

### Customizing the Favicon

Replace the `public/favicon.ico` file with your own BSPCP logo to customize the browser tab icon.

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bspcp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database and other configuration settings
```

4. Set up the database:
```bash
npm run db:setup
```

5. Start the development server:
```bash
npm run dev
```

## Usage

### Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Database Management

The application uses sample seed data for initial setup. Run database setup scripts located in the `server/` directory.

## Project Structure

```
├── public/              # Static assets
├── src/                 # React application
│   ├── components/      # Reusable React components
│   ├── pages/          # Page components
│   └── types/          # TypeScript type definitions
├── server/              # Backend Node.js server
└── dist/               # Production build output
```

## Contributing

This project is maintained by the BSPCP development team. For contributions, please contact the administrators through the admin panel or GitHub repository.

## License

Copyright Botswana Society for Professional Counsellors & Psychotherapists. All rights reserved.
