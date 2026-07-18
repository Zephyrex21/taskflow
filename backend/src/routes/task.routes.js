const express = require('express');
const mockAuth = require('../middleware/mockAuth');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
} = require('../controllers/taskController');

const router = express.Router();

// TEMP: using mockAuth until Sumit's verifyToken middleware is merged.
// Swap the import above to '../middleware/verifyToken' when it's ready.
router.use(mockAuth);

router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/status', updateTaskStatus);

module.exports = router;
