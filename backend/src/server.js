import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDatabase from './config/database.js';
import searchRoutes from './routes/searchRoutes.js';
import newsfeedRoutes from './routes/newsfeedRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import blacklistRoutes from './routes/blacklistRoutes.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { generalLimiter } from './middlewares/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDatabase();

app.use(cors());
app.use(generalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'Cyber Security Handbook API',
    version: '1.0.0',
    endpoints: {
      search: '/api/search/check?url=example.com',
      bulkSearch: 'POST /api/search/bulk-check',
      newsfeed: '/api/newsfeed',
      topScams: '/api/newsfeed/top',
      submitReport: 'POST /api/reports',
      uploadImages: 'POST /api/upload',
      statistics: '/api/stats',
      blacklist: '/api/blacklist',
    },
  });
});

app.use('/api/search', searchRoutes);
app.use('/api/newsfeed', newsfeedRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/blacklist', blacklistRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
