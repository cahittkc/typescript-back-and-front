import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';
import { authenticate } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { CreateProjectDto, UpdateProjectDto, AssignFreelancerDto, CompleteProjectDto, CancelProjectDto, RateProjectDto, GetProjectsQueryDto } from '../dtos/project.dto';

const router = Router();
const projectController = new ProjectController();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     tags: [Projects]
 *     summary: Create a new project
 *     description: Create a new project. Only clients can create projects.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectDto'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only clients can create projects
 */
router.post('/',
    validateRequest(CreateProjectDto),
    projectController.createProject
);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     tags: [Projects]
 *     summary: Get all projects
 *     description: Retrieve all projects with pagination and optional filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/ProjectStatus'
 *         description: Filter by project status
 *       - in: query
 *         name: category
 *         schema:
 *           $ref: '#/components/schemas/ProjectCategory'
 *         description: Filter by project category
 *       - in: query
 *         name: minBudget
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum budget amount
 *       - in: query
 *         name: maxBudget
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum budget amount
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by deadline start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by deadline end date
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         projects:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Project'
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: number
 *                               example: 100
 *                             totalPages:
 *                               type: number
 *                               example: 10
 *                             currentPage:
 *                               type: number
 *                               example: 1
 *                             limit:
 *                               type: number
 *                               example: 10
 *                             hasNextPage:
 *                               type: boolean
 *                               example: true
 *                             hasPreviousPage:
 *                               type: boolean
 *                               example: false
 *       401:
 *         description: Unauthorized
 */
router.get('/', validateRequest(GetProjectsQueryDto), projectController.getAllProjects);

/**
 * @swagger
 * /api/projects/my-projects:
 *   get:
 *     tags: [Projects]
 *     summary: Get user's projects
 *     description: Retrieve all projects created by the client or assigned to the freelancer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 */
router.get('/my-projects', projectController.getMyProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Get project by ID
 *     description: Retrieve a project by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.get('/:id', projectController.getProjectById);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     tags: [Projects]
 *     summary: Update project
 *     description: Update a project. Only the project owner can update it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProjectDto'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only project owner can update the project
 *       404:
 *         description: Project not found
 */
router.put('/:id',
    validateRequest(UpdateProjectDto),
    projectController.updateProject
);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     tags: [Projects]
 *     summary: Delete project
 *     description: Delete a project. Only the project owner can delete it and only if it's in OPEN status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only project owner can delete the project or project is not in OPEN status
 *       404:
 *         description: Project not found
 */
router.delete('/:id', projectController.deleteProject);

/**
 * @swagger
 * /api/projects/{id}/assign:
 *   post:
 *     tags: [Projects]
 *     summary: Assign freelancer to project
 *     description: Assign a freelancer to a project. Only the project owner can assign freelancers.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignFreelancerDto'
 *     responses:
 *       200:
 *         description: Freelancer assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only project owner can assign freelancers
 *       404:
 *         description: Project or freelancer not found
 */
router.post('/:id/assign',
    validateRequest(AssignFreelancerDto),
    projectController.assignFreelancer
);

/**
 * @swagger
 * /api/projects/{id}/complete:
 *   post:
 *     tags: [Projects]
 *     summary: Complete project
 *     description: Mark a project as complete. Only the project owner can complete it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompleteProjectDto'
 *     responses:
 *       200:
 *         description: Project marked as complete
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only project owner can complete the project
 *       404:
 *         description: Project not found
 */
router.post('/:id/complete',
    validateRequest(CompleteProjectDto),
    projectController.completeProject
);

/**
 * @swagger
 * /api/projects/{id}/cancel:
 *   post:
 *     tags: [Projects]
 *     summary: Cancel project
 *     description: Cancel a project. Only the project owner can cancel it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelProjectDto'
 *     responses:
 *       200:
 *         description: Project cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only project owner can cancel the project
 *       404:
 *         description: Project not found
 */
router.post('/:id/cancel',
    validateRequest(CancelProjectDto),
    projectController.cancelProject
);

/**
 * @swagger
 * /api/projects/{id}/rate:
 *   post:
 *     tags: [Projects]
 *     summary: Rate project
 *     description: Rate a completed project. Both client and freelancer can rate the project.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RateProjectDto'
 *     responses:
 *       200:
 *         description: Project rated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only project participants can rate the project
 *       404:
 *         description: Project not found
 */
router.post('/:id/rate',
    validateRequest(RateProjectDto),
    projectController.rateProject
);

export default router; 