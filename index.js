require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ── Swagger / OpenAPI setup ──────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Student Microservice API',
      version: '1.0.0',
      description:
        'RESTful API for managing students. Supports CRUD operations and inter-service communication with the Exam Microservice.',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Local server',
      },
    ],
    components: {
      schemas: {
        Student: {
          type: 'object',
          required: ['studentId', 'name', 'email'],
          properties: {
            studentId: { type: 'string', example: 'S001' },
            name: { type: 'string', example: 'Ada Lovelace' },
            email: { type: 'string', format: 'email', example: 'ada@example.com' },
            age: { type: 'number', example: 20 },
            batch: { type: 'string', example: '2026' },
            major: { type: 'string', example: 'Software Engineering' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  },
  // Scan these files for JSDoc @swagger annotations
  apis: ['./routes/studentRoutes.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// ─────────────────────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Student Service is running' });
});

app.use('/api/students', studentRoutes);

if (!MONGO_URI) {
  console.error('Missing MONGO_URI in environment');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });