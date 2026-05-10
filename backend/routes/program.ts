import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all programs for user
router.get('/', authenticateToken, async (req: any, res) => {
    try {
        const programs = await prisma.program.findMany({
            where: { userId: req.user.id },
            include: { days: { orderBy: { order: 'asc' } } },
            orderBy: { createdAt: 'desc' }
        });

        const formatted = programs.map(p => ({
            ...p,
            days: p.days.map(d => ({
                ...d,
                exercises: JSON.parse(d.exercises)
            }))
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching programs:', error);
        res.status(500).json({ error: 'Error fetching programs' });
    }
});

// Create a program
router.post('/', authenticateToken, async (req: any, res) => {
    try {
        const { name, description, difficulty, durationWeeks, days } = req.body;

        const program = await prisma.program.create({
            data: {
                userId: req.user.id,
                name,
                description: description || null,
                difficulty: difficulty || null,
                durationWeeks: durationWeeks || null,
                days: {
                    create: (days || []).map((d: any, i: number) => ({
                        name: d.name,
                        order: d.order ?? i,
                        exercises: JSON.stringify(d.exercises || [])
                    }))
                }
            },
            include: { days: { orderBy: { order: 'asc' } } }
        });

        const formatted = {
            ...program,
            days: program.days.map(d => ({
                ...d,
                exercises: JSON.parse(d.exercises)
            }))
        };

        res.json(formatted);
    } catch (error) {
        console.error('Error creating program:', error);
        res.status(500).json({ error: 'Error creating program' });
    }
});

// Update a program
router.put('/:id', authenticateToken, async (req: any, res) => {
    try {
        const { name, description, difficulty, durationWeeks, days } = req.body;

        const existing = await prisma.program.findFirst({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!existing) {
            res.status(404).json({ error: 'Program not found' });
            return;
        }

        if (days) {
            await prisma.programDay.deleteMany({ where: { programId: req.params.id } });
        }

        const program = await prisma.program.update({
            where: { id: req.params.id },
            data: {
                name,
                description: description ?? existing.description,
                difficulty: difficulty ?? existing.difficulty,
                durationWeeks: durationWeeks ?? existing.durationWeeks,
                ...(days ? {
                    days: {
                        create: days.map((d: any, i: number) => ({
                            name: d.name,
                            order: d.order ?? i,
                            exercises: JSON.stringify(d.exercises || [])
                        }))
                    }
                } : {})
            },
            include: { days: { orderBy: { order: 'asc' } } }
        });

        const formatted = {
            ...program,
            days: program.days.map(d => ({
                ...d,
                exercises: JSON.parse(d.exercises)
            }))
        };

        res.json(formatted);
    } catch (error) {
        console.error('Error updating program:', error);
        res.status(500).json({ error: 'Error updating program' });
    }
});

// Delete a program
router.delete('/:id', authenticateToken, async (req: any, res) => {
    try {
        const result = await prisma.program.deleteMany({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (result.count === 0) {
            res.status(404).json({ error: 'Program not found' });
            return;
        }
        res.json({ message: 'Program deleted' });
    } catch (error) {
        console.error('Error deleting program:', error);
        res.status(500).json({ error: 'Error deleting program' });
    }
});

export default router;
