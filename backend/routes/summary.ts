import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get weekly summaries for user
router.get('/', authenticateToken, async (req: any, res) => {
    try {
        const summaries = await prisma.weeklySummary.findMany({
            where: { userId: req.user.id },
            orderBy: { weekStart: 'desc' },
            take: 10,
        });

        const formatted = summaries.map((s) => ({
            id: s.id,
            weekStart: s.weekStart.toISOString(),
            weekEnd: s.weekEnd.toISOString(),
            summary: s.summary,
            stats: JSON.parse(s.stats),
            createdAt: s.createdAt.toISOString(),
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching summaries:', error);
        res.status(500).json({ error: 'Error fetching summaries' });
    }
});

// Generate a weekly summary (simplified — actual AI generation is in the AI route)
router.post('/generate', authenticateToken, async (req: any, res) => {
    try {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 7);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(now);
        weekEnd.setHours(23, 59, 59, 999);

        // Get workouts for the past week
        const workouts = await prisma.workout.findMany({
            where: {
                userId: req.user.id,
                date: { gte: weekStart, lte: weekEnd },
            },
            include: { exercises: true },
        });

        const totalWorkouts = workouts.length;
        const totalExercises = workouts.reduce((acc, w) => acc + w.exercises.length, 0);
        const totalSets = workouts.reduce(
            (acc, w) =>
                acc +
                w.exercises.reduce((a, e) => {
                    const sets = JSON.parse(e.sets);
                    return a + (Array.isArray(sets) ? sets.length : 0);
                }, 0),
            0
        );

        const stats = {
            totalWorkouts,
            totalExercises,
            totalSets,
        };

        const summaryText = totalWorkouts > 0
            ? `You completed ${totalWorkouts} workout${totalWorkouts > 1 ? 's' : ''} this week with ${totalExercises} exercises and ${totalSets} sets. Keep up the great work!`
            : 'No workouts recorded this week. Try to get at least a few sessions in next week!';

        const summary = await prisma.weeklySummary.create({
            data: {
                userId: req.user.id,
                weekStart,
                weekEnd,
                summary: summaryText,
                stats: JSON.stringify(stats),
            },
        });

        res.json({
            id: summary.id,
            weekStart: summary.weekStart.toISOString(),
            weekEnd: summary.weekEnd.toISOString(),
            summary: summary.summary,
            stats,
            createdAt: summary.createdAt.toISOString(),
        });
    } catch (error) {
        console.error('Error generating summary:', error);
        res.status(500).json({ error: 'Error generating summary' });
    }
});

export default router;
