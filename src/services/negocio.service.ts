// src/services/negocio.service.ts

import supabaseClient from '../config/supabase';
import { Tables } from '../types/database.types';

// Tipos para la respuesta del Header
type NegocioResponse = Tables<'NEGOCIO'> & {
    PERFILES: Tables<'PERFILES'> | null;
    CATEGORIA_NEGOCIO: Tables<'CATEGORIA_NEGOCIO'> | null;
};

// Tipos para la respuesta
type ProductListResponse = (Tables<'PRODUCTO'> & {
    CATEGORIA_PRODUCTO: Tables<'CATEGORIA_PRODUCTO'> | null;
})[]; // Esperamos un array de productos


/**
 * Obtiene la información básica del negocio (Header del Perfil).
 */
export async function getNegocioHeaderService(negocioId: number): Promise<NegocioResponse> {
    
    // Usamos .select() con JOIN implícito (PostgreSQL JOIN) para obtener 
    // la información del Negocio, su Perfil (dueño) y la Categoría.
    const { data, error } = await supabaseClient
        .from('NEGOCIO')
        .select(`
            *,
            PERFILES (id_usuario, nombre, apellido, profile_url, email),
            CATEGORIA_NEGOCIO (nombre)
        `)
        .eq('id_negocio', negocioId)
        .single(); // Esperamos un solo resultado

    if (error) {
        // Podría ser un error de base de datos o de permisos
        throw new Error(`Error al buscar el negocio: ${error.message}`);
    }

    if (!data) {
        throw new Error(`Negocio con ID ${negocioId} no encontrado.`);
    }

    // El resultado de Supabase es un objeto plano, pero lo tipamos con la estructura de JOIN
    return data as NegocioResponse;
}
/**
 * Obtiene el catálogo de productos activos para un negocio específico.
 */

export async function getNegocioProductsService(negocioId: number): Promise<ProductListResponse> {
    
    const { data, error } = await supabaseClient
        .from('PRODUCTO')
        .select(`
            *,
            CATEGORIA_PRODUCTO (nombre, categoria_url)
        `)
        .eq('id_negocio', negocioId) // Filtra por el ID del negocio
        .eq('activo', true)         // Filtra solo los productos activos
        .order('nombre', { ascending: true }); // Ordena por nombre (opcional)

    if (error) {
        throw new Error(`Error al obtener el catálogo de productos: ${error.message}`);
    }

    // Aunque la consulta devuelve un array, lo tipamos para mayor claridad
    return data as ProductListResponse;
}


// Tipos para la respuesta del listado de Posts
type PostsListResponse = Tables<'POSTS'>[];

/**
 * Obtiene el listado de posts activos publicados por el dueño del negocio.
 * Se une (JOIN) a la tabla NEGOCIO para buscar el id_usuario.
 */
export async function getNegocioPostsService(negocioId: number): Promise<PostsListResponse> {
    
    // 1. Primero, obtener el id_usuario del negocio
    const { data: negocio, error: negError } = await supabaseClient
        .from('NEGOCIO')
        .select('id_usuario')
        .eq('id_negocio', negocioId)
        .single();

    if (negError || !negocio) {
        throw new Error(`Negocio con ID ${negocioId} no encontrado.`);
    }
    
    const userId = negocio.id_usuario;

    // 2. Usar el id_usuario para obtener los posts
    const { data: posts, error: postsError } = await supabaseClient
        .from('POSTS')
        .select('*')
        .eq('id_usuario', userId) // Filtra por el dueño del negocio
        .eq('activo', true)      // Solo posts activos
        .order('fecha_creacion', { ascending: false }); // Los más nuevos primero

    if (postsError) {
        throw new Error(`Error al obtener los posts del negocio: ${postsError.message}`);
    }

    // El resultado es un array de Posts
    return posts as PostsListResponse;
}