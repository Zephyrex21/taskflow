const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
} = require('../controllers/taskController');

const router = express.Router();

router.use(verifyToken);

router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/status', updateTaskStatus);

module.exports = router;
