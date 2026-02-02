import express from 'express';
import { createProject, getProjects, getKPIs } from '../controllers/projectController';

const router = express.Router();

router.post('/', createProject);
router.get('/', getProjects);
router.get('/kpis', getKPIs);

export default router;
