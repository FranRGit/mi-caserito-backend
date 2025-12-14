// src/controllers/discover.controller.ts

import { Request, Response } from 'express';
// Importamos TODOS los servicios necesarios de un solo lugar
import { 
    getBusinessCategoriesService, 
    searchService, 
    getHomeFeedService 
} from '../services/discover.service'; 


// === 1. CONTROLADOR DE CATEGORÍAS (GET /discover/categories/business) ===
/**
 * Obtiene el listado de categorías de negocio.
 */
export async function getBusinessCategoriesController(req: Request, res: Response) {
    try {
        const categories = await getBusinessCategoriesService();

        return res.status(200).json({ 
            status: 'success', 
            data: categories 
        });

    } catch (error) {
        console.error('Error en getBusinessCategoriesController:', error);
        
        return res.status(500).json({ 
            status: 'error', 
            message: error instanceof Error ? error.message : 'Error interno del servidor.'
        });
    }
}


// === 2. CONTROLADOR DEL BUSCADOR (GET /discover/search) ===
/**
 * Buscador con Filtros.
 * GET /discover/search?q=texto&filter=all&page=1
 */
export async function searchController(req: Request, res: Response) {
    try {
        const { q, filter, page } = req.query;

        // Validación de query
        const queryText = (q as string || '').trim();
        if (!queryText) {
            return res.status(400).json({ status: 'error', message: 'El parámetro "q" es obligatorio para la búsqueda.' });
        }

        // Validación y default de filtros y paginación
        const filterType: 'all' | 'business' | 'product' = (filter as 'all' | 'business' | 'product') || 'all';
        const pageNumber = parseInt(page as string) || 1;
        
        if (!['all', 'business', 'product'].includes(filterType)) {
             return res.status(400).json({ status: 'error', message: 'Filtro inválido. Use: all, business, o product.' });
        }

        const results = await searchService(queryText, filterType, pageNumber);

        return res.status(200).json({ 
            status: 'success', 
            data: results.data,
            pagination: results.pagination
        });

    } catch (error) {
        console.error('Error en searchController:', error);
        
        return res.status(500).json({ 
            status: 'error', 
            message: error instanceof Error ? error.message : 'Error interno del servidor.'
        });
    }
}


// === 3. CONTROLADOR DEL HOME FEED (GET /home/feed) ===
/**
 * Feed Principal (Mixto).
 * GET /home/feed?page=1
 */
export async function getHomeFeedController(req: Request, res: Response) {
    try {
        const pageNumber = parseInt(req.query.page as string) || 1;
        
        const feed = await getHomeFeedService(pageNumber);

        return res.status(200).json({ 
            status: 'success', 
            data: feed.data,
            pagination: feed.pagination
        });

    } catch (error) {
        console.error('Error en getHomeFeedController:', error);
        
        return res.status(500).json({ 
            status: 'error', 
            message: error instanceof Error ? error.message : 'Error interno del servidor.'
        });
    }
}