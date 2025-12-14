// src/routes/producto.routes.ts 
import { Router } from 'express';
import { createProductController } from '../controllers/producto.controller';
import { authMiddleware } from '../middleware/auth.middleware'; 
import { isVendedorMiddleware } from '../middleware/isVendedor.middleware';

const router = Router();

// Endpoint: POST /api/v1/products
router.post('/', 
    authMiddleware,       // 1. Verifica que haya un token y sea válido
    isVendedorMiddleware, // 2. Verifica que el usuario autenticado sea 'vendedor'
    createProductController // 3. Ejecuta la lógica si los dos anteriores pasan
); 

export default router;