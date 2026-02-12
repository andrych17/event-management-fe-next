# GMS Frontend

Frontend for Event Management System built with Next.js 15, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios

## Struktur Folder

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   │   └── configs/       # Configuration management page
│   ├── login/             # Login page
│   ├── preview/           # Gallery preview page
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
│
├── components/            # Reusable React components
│   └── admin/            # Admin-specific components
│       └── Sidebar.tsx   # Admin sidebar navigation
│
├── contexts/             # React Context providers
│   └── AuthContext.tsx   # Authentication context
│
├── lib/                  # Utility functions and configurations
│   ├── api.ts           # Axios instance configuration
│   └── dateFormat.ts    # Date formatting utilities
│
└── public/              # Static assets
```

## Setup & Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint

Or using pnpm:
- `pnpm dev` - Start development server
- `pnpm build` - Build production bundle
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Features

### Authentication
- Login with email/password
- Protected routes with middleware
- Session management with JWT token from Sanctum

### Admin Panel
- Event management dashboard
- Create, edit, and delete events
- Configuration management (system settings)
- Live preview of event display

### Public Event Display
- Responsive event slideshow
- Auto-rotating promotional events
- Interactive floor map modal
- Customizable display based on configurations

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000/api` |

## Notes

- App uses App Router (not Pages Router)
- Authentication uses JWT token stored in localStorage
- All API calls go through axios instance in `lib/api.ts`
- Event images support base64 and URL formats
- Responsive design optimized for both desktop and mobile
- Floor map modal for interactive location display
