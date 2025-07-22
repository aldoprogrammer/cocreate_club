const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Load all path files dynamically
const baseSwagger = YAML.load('./swagger/swagger.yaml');
baseSwagger.paths = {};

const pathsDir = path.join(__dirname, 'swagger', 'paths');
fs.readdirSync(pathsDir).forEach((file) => {
  const fullPath = path.join(pathsDir, file);
  const doc = YAML.load(fullPath);
  Object.assign(baseSwagger.paths, doc);
});

// Routes
app.use('/users', require('./routes/users'));

// Swagger docs
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(baseSwagger));

// npx nodemon index.js

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at: ${HOST}:${PORT}`);
  console.log(`📘 Swagger docs available at: ${HOST}:${PORT}/api-docs`);
});