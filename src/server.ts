import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { authenticate, requireRole } from './middleware/auth';
import { routes } from './routes';

const app = express();
app.use(cors());
app.use(express.json());

// Main App Router Prefix
app.use('/api', routes);

// Base route for visual confirmation
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; padding: 2rem;">
      <h1 style="color: #2c3e50;">Finance Dashboard Backend is Running</h1>
      <p>The API is active and listening for requests.</p>
      <h3>Available Endpoint Prefixes:</h3>
      <ul>
        <li><code>/api/auth/*</code></li>
        <li><code>/api/users/*</code></li>
        <li><code>/api/records/*</code></li>
        <li><code>/api/analytics/*</code></li>
      </ul>
      <p><em>Please refer to the <strong>README.md</strong> file for detailed documentation and request payloads.</em></p>
    </div>
  `);
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
