// src/routes/home.routes.ts (CREAR ARCHIVO)

import { Router } from 'express';
import { getHomeFeedController } from '../controllers/discover.controller'; // Usamos el controlador de discover

const router = Router();

// Endpoint: GET /api/v1/home/feed
router.get('/feed', getHomeFeedController); 

export default router;