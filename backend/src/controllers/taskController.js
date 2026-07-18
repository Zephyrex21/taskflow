const Task = require('../models/Task');

// POST /api/tasks
async function createTask(req, res, next) {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      userId: req.user.id,
    });

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

// GET /api/tasks  (supports ?status= and ?priority= filters)
async function getTasks(req, res, next) {
  try {
    const { status, priority } = req.query;
    const filter = { userId: req.user.id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
}

// GET /api/tasks/:id
async function getTaskById(req, res, next) {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

// PUT /api/tasks/:id
async function updateTask(req, res, next) {
  try {
    const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/tasks/:id
async function deleteTask(req, res, next) {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/tasks/:id/status
async function updateTaskStatus(req, res, next) {
  try {
    const { status } = req.body;

    if (!['todo', 'in-progress', 'done'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
};
