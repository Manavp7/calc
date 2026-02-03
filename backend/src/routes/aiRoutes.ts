import express from 'express';
import { analyzeProjectComplexity } from '../controllers/aiController';

const router = express.Router();

router.post('/analyze-complexity', analyzeProjectComplexity);

export default router;
