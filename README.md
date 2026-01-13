# 🏋️ AI Workout Tracker

A full-stack mobile application for tracking workouts with AI-powered coaching assistance. Built with React Native (Expo) and Node.js/Express backend.

---

## 📋 Problem Statement

Fitness enthusiasts often struggle to:
- **Track workouts consistently** across different exercises and sessions
- **Remember workout history** including sets, reps, and weights used
- **Get personalized guidance** without hiring expensive personal trainers
- **Stay motivated** with their fitness journey

**AI Workout Tracker** solves these problems by providing a comprehensive workout logging system with AI-powered coaching, all in one mobile app.

---

## 🛠️ Tech Stack

### Frontend (Mobile App)
| Technology | Purpose |
|------------|---------|
| **React Native** | Cross-platform mobile development |
| **Expo** | Development framework & tooling |
| **TypeScript** | Type-safe JavaScript |
| **Zustand** | State management |
| **NativeWind** | Tailwind CSS for React Native |
| **React Navigation** | Screen navigation |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **Prisma ORM** | Database management |
| **MongoDB Atlas** | Cloud database |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |

### External APIs
| Service | Purpose |
|---------|---------|
| **OpenAI GPT** | AI coaching & content generation |

---

## ✨ Features Implemented

### Authentication
- ✅ User Registration with email & password
- ✅ Secure Login with JWT tokens
- ✅ Password hashing (bcrypt)
- ✅ Persistent sessions

### Workout Tracking
- ✅ Start/End workout sessions
- ✅ Add exercises from library
- ✅ Log sets, reps, and weights
- ✅ Mark sets as completed
- ✅ Save workouts with custom names
- ✅ View workout history
- ✅ Delete workouts

### AI Features
- ✅ AI-powered workout coach chat
- ✅ Daily motivational quotes
- ✅ Fitness tips & articles

### User Experience
- ✅ Clean, modern UI design
- ✅ Dark mode support
- ✅ Pull-to-refresh content
- ✅ Real-time workout timer

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo Go app on your phone
- MongoDB Atlas account (or local MongoDB)

### Step 1: Clone the Repository
```bash
git clone https://github.com/shivam1234100/AI-Workout-Tracker.git
cd AI-Workout-Tracker
```

### Step 2: Install Frontend Dependencies
```bash
npm install
```

### Step 3: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 4: Configure Environment Variables
Create `backend/.env` file:
```env
DATABASE_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/ai-workout-tracker"
JWT_SECRET="your-secret-key"
PORT=3000
```

### Step 5: Generate Prisma Client
```bash
cd backend
npx prisma generate
```

### Step 6: Start the Backend Server
```bash
cd backend
npx tsc && node dist/server.js
```
You should see: `Server running on http://localhost:3000`

### Step 7: Update API URL (for physical device)
Edit `src/constants/api.ts` and replace the IP with your computer's local IP:
```typescript
export const API_URL = 'http://YOUR_LOCAL_IP:3000';
```

### Step 8: Start the Mobile App
```bash
# In a new terminal, from the project root
npx expo start -c
```

### Step 9: Run on Your Phone
- Open **Expo Go** app on your phone
- Scan the QR code
- Make sure your phone is on the same WiFi as your computer

---

## 📡 API Documentation

Base URL: `http://localhost:3000`

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

### Workouts (Requires Authentication)

All workout endpoints require the `Authorization` header:
```http
Authorization: Bearer <jwt_token>
```

#### Get All Workouts
```http
GET /workouts
```

**Response:**
```json
[
  {
    "id": "workout_id",
    "name": "Leg Day",
    "date": "2024-01-13T10:00:00.000Z",
    "startTime": "2024-01-13T10:00:00.000Z",
    "endTime": "2024-01-13T11:00:00.000Z",
    "exercises": [
      {
        "id": "exercise_id",
        "name": "Squat",
        "sets": [
          { "reps": 10, "weight": 100, "completed": true }
        ]
      }
    ]
  }
]
```

#### Create Workout
```http
POST /workouts
Content-Type: application/json

{
  "name": "Push Day",
  "startTime": "2024-01-13T10:00:00.000Z",
  "endTime": "2024-01-13T11:00:00.000Z",
  "exercises": [
    {
      "name": "Bench Press",
      "sets": [
        { "reps": 10, "weight": 60, "completed": true },
        { "reps": 8, "weight": 70, "completed": true }
      ]
    }
  ]
}
```

#### Delete Workout
```http
DELETE /workouts/:id
```

**Response:**
```json
{
  "message": "Workout deleted"
}
```

---

## 📁 Project Structure

```
AI-Workout-Tracker/
├── src/
│   ├── screens/          # App screens
│   ├── store/            # Zustand state stores
│   ├── navigation/       # React Navigation setup
│   ├── constants/        # API URL, etc.
│   └── lib/              # Utilities (OpenAI, etc.)
├── backend/
│   ├── routes/           # Express routes
│   ├── middleware/       # Auth middleware
│   ├── prisma/           # Database schema
│   └── server.ts         # Entry point
├── App.tsx               # Root component
└── package.json
```

---

## 👤 Author

**Shivam Tiwari**

---

## 📄 License

This project is for educational purposes.
