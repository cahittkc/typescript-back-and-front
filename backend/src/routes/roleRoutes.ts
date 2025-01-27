import { Router } from 'express';
import { RoleController } from '../controllers/RoleController';
import { authenticate } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { CreateRoleDto, UpdateRoleDto } from '../dtos/role.dto';

const router = Router();
const roleController = new RoleController();

/**
 * @swagger
 * /api/roles:
 *   get:
 *     tags: [Roles]
 *     summary: Get all roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all roles
 */
router.get('/', authenticate, roleController.getAllRoles);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     tags: [Roles]
 *     summary: Get role by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role details
 *       404:
 *         description: Role not found
 */
router.get('/:id', authenticate, roleController.getRoleById);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     tags: [Roles]
 *     summary: Create a new role (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoleDto'
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Invalid input or role already exists
 *       403:
 *         description: Only administrators can perform this action
 */
router.post('/', authenticate, requireAdmin, validateRequest(CreateRoleDto), roleController.createRole);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     tags: [Roles]
 *     summary: Update role description (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRoleDto'
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       404:
 *         description: Role not found
 *       403:
 *         description: Only administrators can perform this action
 */
router.put('/:id', authenticate, requireAdmin, validateRequest(UpdateRoleDto), roleController.updateRole);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     tags: [Roles]
 *     summary: Delete a role (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       403:
 *         description: Cannot delete default roles or only administrators can perform this action
 *       404:
 *         description: Role not found
 */
router.delete('/:id', authenticate, requireAdmin, roleController.deleteRole);

export default router; 