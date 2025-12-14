// src/routes/negocio.routes.ts 

import { Router } from 'express';
import { 
    getNegocioHeaderController, 
    getNegocioProductsController,
    getNegocioPostsController
} from '../controllers/negocio.controller';

const router = Router();

// 1. Endpoint: GET /api/v1/negocio/{id}/info (Header)
router.get('/:id/info', getNegocioHeaderController); 

// 2. Endpoint: GET /api/v1/negocio/{id}/products (Catálogo)
router.get('/:id/products', getNegocioProductsController); 

// 3. Endpoint: GET /api/v1/negocio/{id}/posts (Novedades)
router.get('/:id/posts', getNegocioPostsController); // <-- NUEVA RUTA

export default router;