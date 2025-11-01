import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { calculateEstimate } from './services/calculationService.js';
import type { PricingData } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';

// Helper function to load all pricing JSON files
async function loadAllPricingData(): Promise<PricingData> {
  const pricingDir = path.resolve(__dirname, isProd ? 'dist/api/pricing' : 'public/api/pricing');
  const files = await fs.readdir(pricingDir);
  const pricingData: Partial<PricingData> = {};
  for (const file of files) {
    if (file.endsWith('.json')) {
      const serviceName = file.replace('.json', '') as keyof PricingData;
      const filePath = path.join(pricingDir, file);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      pricingData[serviceName] = JSON.parse(fileContent);
    }
  }
  return pricingData as PricingData;
}

// Helper function to create a translation function (simplified for backend)
async function createTFunction(vite?: any): Promise<(key: string) => string> {
    let translations: any;
    if (!isProd && vite) {
        // In dev, load through vite to get hot-reloading on translation files
        const enModule = await vite.ssrLoadModule('/i18n/en.json');
        translations = { en: enModule };
    } else {
        // In prod, read from file system
        const enPath = path.resolve(__dirname, 'dist/i18n/en.json');
        const enContent = await fs.readFile(enPath, 'utf-8');
        translations = { en: JSON.parse(enContent) };
    }
    
    return (key: string) => {
        const keys = key.split('.');
        let result = translations.en;
        for (const k of keys) {
            result = result?.[k];
            if (result === undefined) return key;
        }
        return result || key;
    };
}


async function startServer() {
  const app = express();
  
  // Configure JSON parser with better error handling
  app.use(express.json({
    strict: true,
    limit: '10mb'
  }));
  
  // Error handler for JSON parsing errors
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      console.error('JSON Parse Error:', err.message);
      return res.status(400).json({ 
        error: 'Invalid JSON format',
        message: err.message 
      });
    }
    next(err);
  });

  let vite: any;

  // Load data and create `t` function first
  const pricingData = await loadAllPricingData();

  if (!isProd) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
  }

  const t = await createTFunction(vite);

  // API endpoint - MUST be before Vite middleware
  app.post('/api/calculate', async (req, res) => {
    try {
      // Log request details for debugging
      console.log('Received request:', {
        contentType: req.get('Content-Type'),
        body: req.body
      });
      
      if (!req.body || !req.body.items) {
          return res.status(400).json({ error: 'Invalid request body', details: 'Missing items field' });
      }
      const result = calculateEstimate(req.body, pricingData, t);
      res.json(result);
    } catch (error) {
      console.error('Calculation Error:', error);
      res.status(500).json({ error: 'An internal error occurred during calculation.' });
    }
  });

  // Vite middleware should come after API routes
  if (!isProd) {
    // Use vite's connect instance as middleware
    app.use(vite.middlewares);
  } else {
    // In production, serve built files
    app.use(express.static(path.resolve(__dirname, 'dist')));
  }

  // For production, serve index.html for any other route
  if (isProd) {
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

startServer();
