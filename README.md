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
- ✅ Start/End workout sessions with a real-time timer
- ✅ Add exercises from the library
- ✅ Log sets, reps, and weights (new sets pre-fill from the previous one)
- ✅ Mark sets as completed
- ✅ Save workouts with custom names
- ✅ View workout history and per-workout detail (volume, sets, duration)
- ✅ Delete workouts
- ✅ Offline-first: workouts save locally and sync in the background

### Exercise Library
- ✅ 21 exercises across 8 muscle groups
- ✅ Search, plus difficulty and equipment tags
- ✅ Detail view with photos, step-by-step instructions, form tips, and video tutorials

### Programs
- ✅ 4 built-in coach programs (Push Pull Legs, 5x5 Strength, Beginner, Upper/Lower)
- ✅ Custom program builder with multi-day splits and suggested sets/reps
- ✅ Edit and delete your own programs
- ✅ Start a workout straight from a program day, pre-filled

### Health & Activity
- ✅ Live step tracking from the device pedometer, with 30-day history
- ✅ Activity rings for Move / Exercise / Stand
- ✅ Personalized calorie maths (Mifflin-St Jeor BMR, weight-scaled step calories)
- ✅ Editable daily goals for steps, calories, exercise minutes, and stand hours
- ✅ Dedicated Steps and Calories breakdown screens

### AI Features
- ✅ AI coach chat backed by your real training data, body metrics, and activity
- ✅ 5 selectable models (GPT-4o, GPT-4o Mini, Claude Sonnet, Gemini Flash, DeepSeek V3)
- ✅ Medical profile — injuries, conditions and allergies are factored into every answer
- ✅ Quick-prompt suggestions and saved conversation history
- ✅ Offline fallback covering 25+ topics when no AI provider is configured
- ✅ Daily motivational quotes
- ✅ Weekly AI summary of your training

### Notifications
- ✅ Daily motivation, quirky fitness facts, diet tips, and workout reminders
- ✅ Per-category toggles and a configurable reminder time

### User Experience
- ✅ Clean, modern UI design
- ✅ Light and dark themes
- ✅ Pull-to-refresh content
- ✅ Draggable floating AI button available across the app
- ✅ Profile with body metrics, BMI, protein and maintenance-calorie targets

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
# Required
DATABASE_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/ai-workout-tracker"
JWT_SECRET="your-secret-key"
PORT=3000

# AI Coach providers — add at least one, otherwise the coach falls back
# to its built-in offline responses instead of calling a live model.
OPENAI_API_KEY="sk-..."        # GPT-4o, GPT-4o Mini
ANTHROPIC_API_KEY="sk-ant-..." # Claude Sonnet
GEMINI_API_KEY="..."           # Gemini Flash (the app's default model)
DEEPSEEK_API_KEY="..."         # DeepSeek V3

# Optional — password-reset emails. Without it, the reset code is
# returned in the API response instead of being emailed.
RESEND_API_KEY="re_..."
```

### Step 5: Generate Prisma Client
```bash
cd backend
npx prisma generate
```

### Step 6: Start the Backend Server
```bash
cd backend
npm run dev
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

### Account & Profile

#### Request a Password Reset Code
```http
POST /auth/forgot-password
Content-Type: application/json

{ "email": "user@example.com" }
```
Emails a 6-digit code (valid 1 hour). If `RESEND_API_KEY` is not set, the code
is returned in the response body instead so you can still test the flow.

#### Reset the Password
```http
POST /auth/reset-password
Content-Type: application/json

{ "token": "123456", "newPassword": "newpassword123" }
```

#### Get / Update Profile (Requires Authentication)
```http
GET  /auth/profile
PUT  /auth/profile

{ "name": "John Doe", "height": 180, "weight": 75, "gender": "male" }
```
Height, weight and gender drive the BMI, BMR and calorie targets shown in the
app and given to the AI coach.

---

### AI Coach (Requires Authentication)

#### Send a Message
```http
POST /ai/chat
Content-Type: application/json

{
  "message": "What should I train today?",
  "model": "gemini-flash",
  "healthContext": { "todaySteps": 8200, "stepGoal": 10000 }
}
```
`model` accepts `gpt-4o`, `gpt-4o-mini`, `claude-sonnet`, `gemini-flash` or
`deepseek-v3`, and defaults to `gemini-flash`. The server builds the prompt from
the user's workout history, body metrics and the supplied `healthContext`. If the
provider call fails, it returns a built-in offline response rather than an error.

**Response:**
```json
{ "response": "Based on your last session..." }
```

#### Chat History
```http
GET    /ai/history     # all messages, oldest first
DELETE /ai/history     # clear the conversation
```

---

### Programs (Requires Authentication)

```http
GET    /programs       # list the user's programs
POST   /programs       # create
PUT    /programs/:id   # update
DELETE /programs/:id   # delete
```

**Create/update body:**
```json
{
  "name": "My Push Pull Legs",
  "description": "6-day split",
  "difficulty": "Intermediate",
  "durationWeeks": 8,
  "days": [
    {
      "name": "Push Day",
      "exercises": [
        { "exerciseId": "1", "name": "Bench Press", "suggestedSets": 4, "suggestedReps": 8 }
      ]
    }
  ]
}
```

---

### Weekly Summary (Requires Authentication)

```http
GET  /summary           # last 10 weekly summaries
POST /summary/generate  # build a summary for the past 7 days
```

---

## 📁 Project Structure

```
AI-Workout-Tracker/
├── src/
│   ├── screens/          # App screens
│   ├── components/       # Charts, activity rings, floating AI button
│   ├── store/            # Zustand state stores
│   ├── context/          # Theme provider
│   ├── navigation/       # React Navigation setup
│   ├── constants/        # API URL, exercise library, coach programs
│   └── lib/              # Health calculations, notifications, pedometer sync
├── backend/
│   ├── routes/           # Express routes (auth, workouts, ai, programs, summary)
│   ├── middleware/       # Auth middleware
│   ├── prisma/           # Database schema
│   └── server.ts         # Entry point
├── App.tsx               # Root component
├── render.yaml           # Backend deployment blueprint
└── package.json
```

---

## 👤 Author

**Shivam Tiwari**

---

## 📄 License

This project is for educational purposes.
