const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
<<<<<<< HEAD
const authRoutes = require('./routes/auth.routes');
const healthRoutes = require('./routes/health.routes');
=======
>>>>>>> origin/main
const taskRoutes = require('./routes/task.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

<<<<<<< HEAD
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/tasks', taskRoutes);

=======
app.use('/api/tasks', taskRoutes);

// TODO (Sumit): mount /api/auth routes here once auth.routes.js is ready
// TODO (Sumit): mount health.routes.js here once it has real content

>>>>>>> origin/main
app.use(errorHandler);

module.exports = app;
