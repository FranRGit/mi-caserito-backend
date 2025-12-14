// src/controllers/post.controller.ts

import { Response } from 'express';
import { createPostService } from '../services/post.service';
import { CreatePostDTO } from '../dtos/post.dto';
import { AuthenticatedRequest } from '../middleware/auth.middleware'; // Importamos la interfaz correcta

export async function createPostController(req: AuthenticatedRequest, res: Response) {
    try {
        // 1. Obtener el ID del usuario VENDEDOR autenticado (inyectado por authMiddleware)
        const userId = req.user?.id; 

        // 2. Obtener el resto de los datos del cuerpo
        const { imagen_url, descripcion, activo } = req.body;
        
        // 3. Validaciones obligatorias
        if (!userId || !imagen_url) {
            // Este caso sólo ocurre si el middleware pasa pero no hay user, o falta imagen_url
            return res.status(400).json({ 
                status: 'error', 
                message: 'Faltan campos obligatorios: id_usuario (token) e imagen_url.' 
            });
        }

        const postData: CreatePostDTO = {
            id_usuario: userId,
            imagen_url,
            descripcion,
            activo
        };

        // 4. Llama al servicio
        const newPost = await createPostService(postData);

        // 5. Respuesta exitosa
        return res.status(201).json({ 
            status: 'success', 
            message: 'Post publicado exitosamente.',
            data: newPost 
        });

    } catch (error) {
        console.error('Error en createPostController:', error);
        
        let statusCode = 500;
        if (error instanceof Error && error.message.includes("ID de Usuario no válido")) {
            statusCode = 404;
        }

        return res.status(statusCode).json({ 
            status: 'error', 
            message: error instanceof Error ? error.message : 'Error interno del servidor.'
        });
    }
}