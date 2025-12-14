// src/routes/post.routes.ts

import { Router } from 'express';
import { createPostController } from '../controllers/post.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { isVendedorMiddleware } from '../middleware/isVendedor.middleware';

const router = Router();

// Endpoint: POST /api/v1/posts
router.post('/', 
    authMiddleware,       // 1. Verifica si está logueado
    isVendedorMiddleware, // 2. Verifica si tiene el rol 'vendedor'
    createPostController
); 

export default router;