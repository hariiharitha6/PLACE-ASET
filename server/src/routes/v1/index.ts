import { Router } from 'express';
import authRoutes from './auth.routes';
import healthRoutes from './health.routes';
import usersRoutes from './users.routes';
import dashboardRoutes from './dashboard.routes';
import questionsRoutes from './questions.routes';
import challengesRoutes from './challenges.routes';
import practiceRoutes from './practice.routes';
import leaderboardRoutes from './leaderboard.routes';
import resourcesRoutes from './resources.routes';
import communityRoutes from './community.routes';
import logsRoutes from './logs.routes';
import gamificationRoutes from './gamification.routes';

const v1Router = Router();

// Health check
v1Router.use('/health', healthRoutes);

// Auth routes
v1Router.use('/auth', authRoutes);

// Users routes
v1Router.use('/users', usersRoutes);

// Dashboard routes
v1Router.use('/dashboard', dashboardRoutes);

// Questions routes
v1Router.use('/questions', questionsRoutes);

// Challenges routes
v1Router.use('/challenges', challengesRoutes);

// Practice routes
v1Router.use('/practice', practiceRoutes);

// Leaderboard & Gamification routes
v1Router.use('/leaderboard', leaderboardRoutes);
v1Router.use('/', gamificationRoutes); // Mounts /achievements and /badges directly

// Resources routes
v1Router.use('/resources', resourcesRoutes);

// Community routes
v1Router.use('/community', communityRoutes);

// Logs routes
v1Router.use('/logs', logsRoutes);

export default v1Router;
