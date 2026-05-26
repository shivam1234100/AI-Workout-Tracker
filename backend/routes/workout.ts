import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all workouts for user
router.get('/', authenticateToken, async (req: any, res) => {
    try {
        const workouts = await prisma.workout.findMany({
            where: { userId: req.user.id },
            include: { exercises: true },
            orderBy: { date: 'desc' },
        });

        const formatted = workouts.map((w) => ({
            id: w.id,
            name: w.name,
            date: w.date.toISOString(),
            startTime: w.startTime ? w.startTime.getTime() : null,
            endTime: w.endTime ? w.endTime.getTime() : null,
            exercises: w.exercises.map((e) => ({
                id: e.id,
                exerciseId: e.id,
                name: e.name,
                sets: JSON.parse(e.sets),
            })),
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching workouts:', error);
        res.status(500).json({ error: 'Error fetching workouts' });
    }
});

// Create a workout
router.post('/', authenticateToken, async (req: any, res) => {
    try {
        const { name, startTime, endTime, exercises } = req.body;

        const workout = await prisma.workout.create({
            data: {
                userId: req.user.id,
                name: name || `Workout ${new Date().toLocaleDateString()}`,
                date: new Date(),
                startTime: startTime ? new Date(startTime) : null,
                endTime: endTime ? new Date(endTime) : null,
                exercises: {
                    create: (exercises || []).map((e: any) => ({
                        name: e.name,
                        sets: JSON.stringify(e.sets || []),
                    })),
                },
            },
            include: { exercises: true },
        });

        const formatted = {
            id: workout.id,
            name: workout.name,
            date: workout.date.toISOString(),
            startTime: workout.startTime ? workout.startTime.getTime() : null,
            endTime: workout.endTime ? workout.endTime.getTime() : null,
            exercises: workout.exercises.map((e) => ({
                id: e.id,
                exerciseId: e.id,
                name: e.name,
                sets: JSON.parse(e.sets),
            })),
        };

        res.json(formatted);
    } catch (error) {
        console.error('Error creating workout:', error);
        res.status(500).json({ error: 'Error creating workout' });
    }
});

// Delete a workout
router.delete('/:id', authenticateToken, async (req: any, res) => {
    try {
        const result = await prisma.workout.deleteMany({
            where: { id: req.params.id, userId: req.user.id },
        });

        if (result.count === 0) {
            res.status(404).json({ error: 'Workout not found' });
            return;
        }

        res.json({ message: 'Workout deleted' });
    } catch (error) {
        console.error('Error deleting workout:', error);
        res.status(500).json({ error: 'Error deleting workout' });
    }
});

export default router;
