import { Request, Response, NextFunction } from 'express';
// Importamos la interfaz extendida del archivo anterior (si está en un archivo separado)
// interface AuthenticatedRequest extends Request { user?: { id: string; role: string; }; } 
import { AuthenticatedRequest } from '../middleware/auth.middleware'; 
// 💡 Este middleware se asegura de que el usuario tenga el rol 'vendedor'
export const isVendedorMiddleware = (
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
) => {
    // 1. El req.user ya fue inyectado por authMiddleware
    if (!req.user) {
        // Esto no debería pasar si authMiddleware se ejecuta primero
        return res.status(401).json({ 
            status: 'error', 
            message: 'Error de autenticación: Usuario no identificado.' 
        });
    }

    // 2. Verificar el rol
    if (req.user.role !== 'vendedor') {
        return res.status(403).json({ 
            status: 'error', 
            message: 'Permiso denegado. Solo los vendedores pueden realizar esta acción.' 
        });
    }

    // 3. Si es vendedor, pasa al siguiente paso
    next();
};