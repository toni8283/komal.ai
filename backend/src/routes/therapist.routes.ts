import { Router } from 'express';
import { TherapistController } from '../controllers/therapist.controller.js';

const router = Router();

router.get('/', TherapistController.getAll);
router.get('/:id', TherapistController.getById);

export default router;

