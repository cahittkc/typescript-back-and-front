import { Router, RequestHandler } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const userController = new UserController();

// Protected Routes - require authentication
router.use(authenticate as RequestHandler);

// Create a new user
router.post('/', userController.createUser as RequestHandler);

// Get all users
router.get('/', userController.getAllUsers as RequestHandler);

// Get user by ID
router.get('/:id', userController.getUserById as RequestHandler);

// Update user
router.put('/:id', userController.updateUser as RequestHandler);

// Delete user
router.delete('/:id', userController.deleteUser as RequestHandler);

export default router; 