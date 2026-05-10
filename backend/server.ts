import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import workoutRoutes from './routes/workout';
import aiRoutes from './routes/ai';
import summaryRoutes from './routes/summary';
import programRoutes from './routes/program';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/workouts', workoutRoutes);
app.use('/ai', aiRoutes);
app.use('/summary', summaryRoutes);
app.use('/programs', programRoutes);

app.get('/', (req, res) => {
    res.send('AI Workout Tracker API is running');
});

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
