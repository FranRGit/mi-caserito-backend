// src/controllers/post.controller.ts

import { Response } from 'express';
import { createPostService } from '../services/post.service';
import { CreatePostDTO } from '../dtos/post.dto';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export async function createPostController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    // 1️⃣ Validar que el middleware haya inyectado el usuario
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado.',
      });
    }

    // 2️⃣ Obtener el token Bearer (OBLIGATORIO para RLS)
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Token de autorización no proporcionado.',
      });
    }

    const accessToken = authHeader.split(' ')[1];

    // 3️⃣ Obtener datos del body
    const { imagen_url, descripcion, activo } = req.body;

    // 4️⃣ Validaciones básicas
    if (!imagen_url) {
      return res.status(400).json({
        status: 'error',
        message: 'El campo imagen_url es obligatorio.',
      });
    }

    // 5️⃣ Construir DTO (id_usuario viene del token, NO del body)
    const postData: CreatePostDTO = {
      id_usuario: req.user.id,
      imagen_url,
      descripcion,
      activo,
    };

    // 6️⃣ Llamar al service pasando el TOKEN
    const newPost = await createPostService(postData, accessToken);

    // 7️⃣ Respuesta exitosa
    return res.status(201).json({
      status: 'success',
      message: 'Post publicado exitosamente.',
      data: newPost,
    });

  } catch (error: any) {
    console.error('Error en createPostController:', error);

    return res.status(400).json({
      status: 'error',
      message: error.message || 'Error interno del servidor.',
    });
  }
}
