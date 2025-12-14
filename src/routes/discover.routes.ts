// src/routes/discover.routes.ts (Actualizado)

import { Router } from 'express';
import { getBusinessCategoriesController, searchController } from '../controllers/discover.controller';

const router = Router();

// 1. Endpoint: GET /api/v1/discover/categories/business
router.get('/categories/business', getBusinessCategoriesController); 

// 2. Endpoint: GET /api/v1/discover/search
router.get('/search', searchController); // <-- NUEVA RUTA

export default router;

