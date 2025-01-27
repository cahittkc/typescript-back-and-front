import 'reflect-metadata';
import express, { Express, Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';
import { successResponse, errorResponse } from './utils/responseHandler';
import { ApiError } from './utils/ApiError';
import { AppDataSource } from './config/database';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import proposalRoutes from './routes/proposalRoutes';
import roleRoutes from './routes/roleRoutes';
import { loggingMiddleware } from './middleware/loggingMiddleware';
import { StatusCodes } from 'http-status-codes';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

const app: Express = express();
const port = process.env.PORT || 3000;

// Initialize TypeORM
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
    })
    .catch((error) => {
        console.error("Error during Data Source initialization:", error);
        process.exit(1);
    });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(loggingMiddleware);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Freelancer Platform API Documentation',
    customfavIcon: '/favicon.ico'
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/roles', roleRoutes);

// Test route
const homeHandler: RequestHandler = (_req, res) => {
    successResponse(res, { message: 'TypeScript Backend API is running!' });
};
app.get('/', homeHandler);

// Database test route
const dbTestHandler: RequestHandler = async (_req, res, next) => {
    try {
        const result = await AppDataSource.query('SELECT NOW()');
        successResponse(
            res,
            { timestamp: result[0].now },
            'Database connection successful!'
        );
    } catch (error: any) {
        next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Database connection failed: ' + error.message));
    }
};
app.get('/db-test', dbTestHandler);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({ status: 'ok' });
});

// 404 handler - should be after all routes
const notFoundHandler: RequestHandler = (_req, res) => {
    errorResponse(res, 'Route not found', StatusCodes.NOT_FOUND);
};
app.use(notFoundHandler);

// Global error handler - should be the last middleware
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    errorHandler(err, req, res, next);
};
app.use(globalErrorHandler);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
}); 