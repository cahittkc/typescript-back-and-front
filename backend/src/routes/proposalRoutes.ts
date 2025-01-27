import { Router } from 'express';
import { ProposalController } from '../controllers/ProposalController';
import { authenticate } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { CreateProposalDto, UpdateProposalDto } from '../dtos/proposal.dto';

const router = Router();
const proposalController = new ProposalController();

// All routes require authentication
router.use(authenticate);

// Create a new proposal
router.post('/', validateRequest(CreateProposalDto), proposalController.createProposal);

// Get my proposals
router.get('/my-proposals', proposalController.getMyProposals);

// Get proposals for a project
router.get('/project/:projectId', proposalController.getProjectProposals);

// Update proposal
router.put('/:id', validateRequest(UpdateProposalDto), proposalController.updateProposal);

// Accept proposal
router.post('/:id/accept', proposalController.acceptProposal);

// Reject proposal
router.post('/:id/reject', proposalController.rejectProposal);

// Withdraw proposal
router.post('/:id/withdraw', proposalController.withdrawProposal);

export default router; 