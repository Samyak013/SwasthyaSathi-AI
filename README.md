# SwasthyaSathi-AI 🏥

An AI-powered healthcare platform that integrates ABHA (Ayushman Bharat Health Account) to provide comprehensive healthcare services for doctors, patients, and pharmacies.

## Features ✨

### For Patients
- **ABHA Login Integration**: Secure login using Ayushman Bharat Health Account
- **Health Records Timeline**: View complete medical history
- **Prescription Management**: Receive and manage digital prescriptions
- **Appointment Booking**: Schedule appointments with doctors
- **Emergency SOS**: One-tap emergency alerts
- **AI Health Assistant**: Get health advice from AI chatbot
- **Medicine Reminders**: Automatic medication reminders

### For Doctors
- **Doctor Dashboard**: Manage patient appointments and records
- **Create Prescriptions**: Digital prescription generation with QR codes
- **Health Record Access**: View patient health records with consent
- **Diagnosis Suggestions**: AI-powered diagnosis assistant
- **Patient Search**: Find patients by ABHA ID
- **Analytics**: View patient demographics and health trends

### For Pharmacies
- **Pharmacy Portal**: Manage prescriptions
- **QR Verification**: Verify prescriptions using QR codes
- **Inventory Management**: Track medicine stock
- **Order Processing**: Process prescription orders

### Core Features
- **Drug Interaction Checking**: AI validates medicine combinations
- **Health Record Summary**: Generate comprehensive health summaries
- **Real-time Chat**: WebSocket-based messaging between users
- **Analytics Dashboard**: Health statistics and trends
- **Consent Management**: ABHA consent handling
- **Digital Signatures**: Secure prescription signing

## Tech Stack 🛠️

### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Shadcn/ui**: Component library
- **React Hook Form**: Form management
- **TanStack Query**: Data fetching
- **Recharts**: Data visualization
- **Wouter**: Routing
- **Framer Motion**: Animations

### Backend
- **Express.js**: Server framework
- **Node.js**: Runtime
- **Drizzle ORM**: Database ORM
- **Zod**: Schema validation
- **WebSocket**: Real-time communication
- **OpenAI API**: AI features

### Database
- **Neon Serverless PostgreSQL**: Cloud database
- **Drizzle Kit**: Schema management

## Setup & Installation 🚀

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database (or use Neon for serverless)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Samyak013/SwasthyaSathi-AI.git
cd SwasthyaSathi-AI
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up the database**
```bash
npm run db:push
```

5. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:5000` in your browser.

## Environment Variables 📋

```
DATABASE_URL=postgresql://user:password@host:port/database
OPENAI_API_KEY=sk-your-api-key-here
NEON_API_KEY=your-neon-api-key
PORT=5000
NODE_ENV=development
```

## Available Scripts 📝

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:push          # Push schema changes to database
npm run db:studio        # Open Drizzle Studio

# Type checking
npm run check            # Run TypeScript type checker
```

## Project Structure 📁

```
SwasthyaSathi-AI/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities
│   │   └── ui/           # Shadcn components
│   ├── index.html        # HTML entry
│   └── public/           # Static assets
├── server/               # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   ├── openai.ts         # OpenAI integrations
│   └── seed.ts           # Database seeding
├── shared/               # Shared code
│   └── schema.ts         # Database schema
├── netlify.toml          # Netlify configuration
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind configuration
└── package.json          # Dependencies
```

## Sample Credentials 🔑

For testing, the following credentials are seeded:

**Doctor**
- ABHA ID: `22-1234-5678-9012`

**Patients**
- Patient 1 ABHA ID: `22-1111-2222-3333`
- Patient 2 ABHA ID: `22-4444-5555-6666`

**Pharmacy**
- ABHA ID: `22-8888-9999-0000`

*Note: OTP will be logged to console in development mode*

## API Documentation 📚

### Authentication
```
POST /api/auth/register
POST /api/auth/send-otp
POST /api/auth/verify-otp
```

### Users
```
GET /api/users/:id
GET /api/doctors
GET /api/doctors/search/:abhaId
```

### Prescriptions
```
POST /api/prescriptions
GET /api/prescriptions/patient/:patientId
POST /api/prescriptions/:id/dispense
GET /api/prescriptions/verify/:qrCode
```

### Health Records
```
POST /api/health-records
GET /api/health-records/patient/:patientId
```

### AI Features
```
POST /api/ai/diagnose
POST /api/ai/chat
POST /api/ai/interactions
```

### WebSocket
```
ws://localhost:5000/ws
```

## Deployment 🌐

### Netlify
See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Local Deployment
```bash
npm run build
npm start
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## Features Highlights 🌟

### ABHA Integration
- Secure authentication using Ayushman Bharat Health Account
- Consent-based health record sharing
- Digital signature support for prescriptions

### AI Capabilities
- Drug interaction checking
- Diagnosis suggestions
- Health record summarization
- Natural language health assistant

### Data Security
- Digital signatures on prescriptions
- Consent management
- Encrypted sensitive data
- Secure WebSocket communication

### Real-time Features
- Live chat between doctors and patients
- Real-time appointment updates
- Push-ready architecture for notifications

## Development Workflow 👨‍💻

### Running Tests
```bash
npm run test              # Run test suite
npm run test:watch       # Watch mode
```

### Code Quality
```bash
npm run lint             # Lint code
npm run format           # Format code
npm run check            # Type checking
```

### Database Management
```bash
npm run db:studio        # Open database GUI
npm run db:push          # Apply schema changes
npm run db:seed          # Reseed database
```

## Troubleshooting 🔧

### Port Already in Use
Solution: Change PORT in `.env` file

### Database Connection Failed
Solution: Verify DATABASE_URL and ensure database is running

### OpenAI API Errors
Solution: Add OPENAI_API_KEY to .env file (features work without it)

### Vite Hot Reload Not Working
Solution: Restart dev server `npm run dev`

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is licensed under the MIT License - see the LICENSE file for details.

## Support & Contact 💬

For issues, questions, or suggestions:
- GitHub Issues: [Create an issue](https://github.com/Samyak013/SwasthyaSathi-AI/issues)
- Email: contact@swasthyasathi.com

## Roadmap 🗺️

- [ ] Mobile app (React Native)
- [ ] Video consultation
- [ ] Lab integration
- [ ] Insurance claims
- [ ] Advanced analytics
- [ ] Multi-language support

## Acknowledgments 🙏

- [Ayushman Bharat Program](https://ayushman.gov.in/)
- [Shadcn/ui](https://shadcnui.com)
- [OpenAI](https://openai.com)
- [Neon](https://neon.tech)

---

Made with ❤️ for healthcare
