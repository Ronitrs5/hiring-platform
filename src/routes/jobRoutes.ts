import { Router } from 'express';
import jobController from '../controllers/jobController';
import { validateRequest, jobSchemas } from '../middleware/validation';

const router = Router();

// Job CRUD routes
router.post('/', 
  validateRequest(jobSchemas.create),
  jobController.createJob
);

router.get('/', 
  jobController.getJobs
);

router.get('/stats', 
  jobController.getJobStats
);

router.get('/department/:department', 
  jobController.getJobsByDepartment
);

router.get('/:id', 
  jobController.getJobById
);

router.put('/:id', 
  validateRequest(jobSchemas.update),
  jobController.updateJob
);

router.delete('/:id', 
  jobController.deleteJob
);

// Job applications route
router.get('/:id/applications', 
  jobController.getJobApplications
);

export default router;