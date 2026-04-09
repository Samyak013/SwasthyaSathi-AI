# Deployment Guide for SwasthyaSathi-AI

## Local Development

```bash
npm install
npm run dev
```

The app will run on `http://localhost:5000`

## Production Build

```bash
npm run build
npm start
```

## Docker Deployment

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

## Netlify Deployment

This project is configured for Netlify deployment. The app requires:

1. **Frontend**: Built automatically to `/dist/public`
2. **Backend**: Express.js server bundled to `/dist`

### Deployment Steps:

1. Push this repository to GitHub
2. Connect repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist/public`
5. Add environment variables:
   - `DATABASE_URL`: Your database connection string
   - `OPENAI_API_KEY`: OpenAI API key (optional, features work without it)
   - `NODE_ENV`: Set to `production`

### Important Note:

For full stack deployment on Netlify with the Express backend, you may need to:
- Use Netlify Functions for serverless deployment of the backend
- Or deploy the backend separately to services like:
  - Render (render.com)
  - Railway (railway.app)
  - Heroku (heroku.com) 
  - DigitalOcean App Platform (digitalocean.com)

### Alternative: Deploy as Full Stack

You can also deploy the entire application as a Node.js app on:
- **Render**: Deploy directly from this repository
- **Railway**: Simple configuration with automatic builds
- **DigitalOcean**: App Platform with Docker support

## Environment Variables

Create a `.env` file with:
```
DATABASE_URL=your_database_url
OPENAI_API_KEY=your_openai_api_key
PORT=5000
NODE_ENV=development
```

## Features

- ABHA Login Integration
- Doctor Dashboard
- Patient Dashboard  
- Pharmacy Portal
- Prescription Management
- Health Record Timeline
- AI ChatBot
- Emergency SOS
- Analytics Dashboard
- Real-time Chat (WebSocket)
- Prescription QR Codes
- Drug Interaction Checking
- Health Record Summary Generation

## API Documentation

Base URL: `/api`

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP

### Users
- `GET /api/users/:id` - Get user profile
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/search/:abhaId` - Search doctor by ABHA ID

### Prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions/patient/:patientId` - Get patient prescriptions
- `POST /api/prescriptions/:id/dispense` - Dispense prescription

### Health Records
- `POST /api/health-records` - Create health record
- `GET /api/health-records/patient/:patientId` - Get patient health records

### AI Features
- `POST /api/ai/diagnose` - Get diagnosis suggestions
- `POST /api/ai/chat` - Chat with health assistant
- `POST /api/ai/drug-interactions` - Check drug interactions

### WebSocket
- `ws://localhost:5000/ws` - Real-time chat connection

## Database Schema

The application uses Drizzle ORM with the following main tables:
- `users` - User accounts (doctors, patients, pharmacies)
- `doctors` - Doctor profiles
- `patients` - Patient profiles
- `pharmacies` - Pharmacy information
- `prescriptions` - Prescription records
- `health_records` - Patient health records
- `appointments` - Scheduled appointments
- `chat_messages` - Real-time chat messages
- `reminders` - Health reminders
- `consent_records` - ABHA consent records
- `emergency_alerts` - Emergency SOS records

## Troubleshooting

### Port Already in Use
- Change port in `.env`: `PORT=3000`

### Database Connection Issues
- Verify `DATABASE_URL` in environment variables
- Ensure database is running and accessible

### OpenAI API Errors
- If `OPENAI_API_KEY` is not set, AI features will use safe defaults
- Add your API key to enable full AI functionality

## Support

For issues or questions, please refer to the GitHub repository issues page.
