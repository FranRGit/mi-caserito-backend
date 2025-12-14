// src/dtos/post.dto.ts

import { TablesInsert } from '../types/database.types'; 

export interface CreatePostDTO {
    // CAMPO OBLIGATORIO: id_usuario debe venir del req.user inyectado por el middleware
    // Pero lo incluimos aquí para tipar el objeto de inserción.
    id_usuario: TablesInsert<'POSTS'>['id_usuario']; // UUID del usuario que crea el post
    
    // CAMPO OBLIGATORIO (Según tu definición de POSTS)
    imagen_url: TablesInsert<'POSTS'>['imagen_url']; // URL de la imagen del post

    // CAMPOS OPCIONALES
    descripcion?: TablesInsert<'POSTS'>['descripcion'];
    activo?: TablesInsert<'POSTS'>['activo']; // Default es TRUE
}