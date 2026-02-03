import express from 'express'; // Force Rebuild 2026-02-03
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import aiRoutes from './routes/aiRoutes';
import { dbConnect } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Connect to DB and start server
dbConnect().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
