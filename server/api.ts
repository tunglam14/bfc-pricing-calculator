import express, { Request, Response } from 'express';
import cors from 'cors';
import { calculateTotalPrice } from '../services/calculationService';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint
app.post('/api/calculate', async (req: Request, res: Response) => {
  try {
    const request = req.body;
    
    // Validate request
    if (!request.items || !Array.isArray(request.items) || request.items.length === 0) {
      return res.status(400).json({
        error: 'Invalid request: items array is required and must not be empty'
      });
    }

    // Calculate prices
    const result = calculateTotalPrice(request);
    
    res.json(result);
  } catch (error: any) {
    console.error('Error calculating prices:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

