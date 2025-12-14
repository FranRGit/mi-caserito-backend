// src/controllers/negocio.controller.ts

import { Request, Response } from 'express';
// Asegúrate de que el servicio esté importado correctamente
import { getNegocioHeaderService, getNegocioProductsService, getNegocioPostsService } from '../services/negocio.service'; 


// === 1. HEADER DEL PERFIL DEL NEGOCIO (GET /negocio/:id/info) ===
export async function getNegocioHeaderController(req: Request, res: Response) {
    try {
        const negocioId = parseInt(req.params.id); 

        if (isNaN(negocioId)) {
            return res.status(400).json({ status: 'error', message: 'ID de negocio inválido.' });
        }

        const negocioData = await getNegocioHeaderService(negocioId);

        return res.status(200).json({ 
            status: 'success', 
            data: negocioData 
        });

    } catch (error) {
        console.error('Error en getNegocioHeaderController:', error);
        
        let statusCode = 500;
        if (error instanceof Error && error.message.includes("no encontrado")) {
            statusCode = 404;
        }

        return res.status(statusCode).json({ 
            status: 'error', 
            message: error instanceof Error ? error.message : 'Error interno del servidor.'
        });
    }
}

// === 2. CATÁLOGO DE PRODUCTOS (GET /negocio/:id/products) ===
export async function getNegocioProductsController(req: Request, res: Response) {
    try {
        const negocioId = parseInt(req.params.id); 

        if (isNaN(negocioId)) {
            return res.status(400).json({ status: 'error', message: 'ID de negocio inválido.' });
        }

        const products = await getNegocioProductsService(negocioId);

        if (products.length === 0) {
             return res.status(200).json({ 
                status: 'success', 
                message: 'El negocio no tiene productos activos.',
                data: []
            });
        }

        return res.status(200).json({ 
            status: 'success', 
            data: products 
        });

    } catch (error) {
        console.error('Error en getNegocioProductsController:', error);
        
        return res.status(500).json({ 
            status: 'error', 
            message: error instanceof Error ? error.message : 'Error interno del servidor.'
        });
    }
}



/**
 * Obtiene el listado de posts (novedades) de un negocio por su ID.
 * GET /negocio/:id/posts
 */
export async function getNegocioPostsController(req: Request, res: Response) {
    try {
        const negocioId = parseInt(req.params.id); 

        if (isNaN(negocioId)) {
            return res.status(400).json({ status: 'error', message: 'ID de negocio inválido.' });
        }

        const posts = await getNegocioPostsService(negocioId);

        if (posts.length === 0) {
             return res.status(200).json({ 
                status: 'success', 
                message: 'El negocio no tiene posts activos.',
                data: []
            });
        }

        return res.status(200).json({ 
            status: 'success', 
            data: posts 
        });

    } catch (error) {
        console.error('Error en getNegocioPostsController:', error);
        
        let statusCode = 500;
        if (error instanceof Error && error.message.includes("no encontrado")) {
            statusCode = 404;
        }

        return res.status(statusCode).json({ 
            status: 'error', 
            message: error instanceof Error ? error.message : 'Error interno del servidor.'
        });
    }
}