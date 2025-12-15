// src/services/discover.service.ts (COMPLETAMENTE CORREGIDO)

import supabaseClient from '../config/supabase';
import { Tables } from '../types/database.types';

// Definiciones de tipos para la respuesta de la API
// ---------------------------------------------------------------------

export interface SearchResultData {
    type: 'product' | 'business' | 'post';
    data: { [key: string]: any }; 
}

export interface SearchResponse {
    data: SearchResultData[];
    pagination: { has_more: boolean };
}

export interface FeedResponse extends SearchResponse {}

// Constantes
const ITEMS_PER_PAGE_SEARCH = 20; 
const ITEMS_PER_PAGE_FEED = 30; 

// === 1. SERVICIO DE BÚSQUEDA (searchService) ===
// --------------------------------------------------

export async function searchService(
    query: string, 
    filter: 'all' | 'business' | 'product', 
    page: number
): Promise<SearchResponse> {
    
    const limit = ITEMS_PER_PAGE_SEARCH;
    const offset = (page - 1) * limit;
    let results: SearchResultData[] = [];
    let hasMore = false;

    // --- 1. Búsqueda de Productos (Filtro 'all' o 'product') ---
    if (filter === 'all' || filter === 'product') {
        const { data: products, error } = await supabaseClient
            .from('PRODUCTO')
            .select(`
                id_producto,
                nombre,
                precio_base,
                image_url,
                NEGOCIO (nombre_negocio)
            `) // Sintaxis de JOIN
            .ilike('nombre', `%${query}%`)
            .limit(limit + 1) 
            .range(offset, offset + limit); 

        if (error) throw new Error(`Error en búsqueda de productos: ${error.message}`);
        
        if (products && products.length > limit) {
            hasMore = true;
            products.pop();
        }

        // CORRECCIÓN: Usamos 'as any[]' para el resultado del JOIN antes de mapear
        const productResults = (products as any[] | null)?.map(p => ({
            type: 'product' as const,
            data: {
                // p.NEGOCIO es el objeto anidado del JOIN
                ...p, 
                nombre_negocio: p.NEGOCIO?.nombre_negocio,
                NEGOCIO: undefined 
            }
        })) || [];
        
        results = [...results, ...productResults];
    }
    
    // --- 2. Búsqueda de Negocios (Filtro 'all' o 'business') ---
    if (filter === 'all' || filter === 'business') {
        const { data: negocios, error } = await supabaseClient
            .from('NEGOCIO')
            .select(`
                id_negocio,
                nombre_negocio,
                descripcion,
                calificacion_promedio
            `)
            .ilike('nombre_negocio', `%${query}%`)
            .limit(limit + 1)
            .range(offset, offset + limit);

        if (error) throw new Error(`Error en búsqueda de negocios: ${error.message}`);

        if (negocios && negocios.length > limit) {
            hasMore = true;
            negocios.pop();
        }

        const businessResults = (negocios as Tables<'NEGOCIO'>[] | null)?.map(n => ({
            type: 'business' as const,
            data: { ...n }
        })) || [];
        
        if (filter === 'business') {
             results = businessResults;
        } else if (filter === 'all') {
             results = [...results, ...businessResults];
        }
    }
    
    return { data: results, pagination: { has_more: hasMore } };
}


// === 2. SERVICIO DE HOME FEED (getHomeFeedService) ===
// -----------------------------------------------------

export async function getHomeFeedService(page: number): Promise<FeedResponse> {
    const totalLimit = ITEMS_PER_PAGE_FEED;
    const halfLimit = Math.ceil(totalLimit / 2);
    const offset = (page - 1) * halfLimit;

    let hasMore = false;

    // 🔥 PRODUCTOS EN PROMOCIÓN (ordenados por fecha_inicio)
    const { data: promociones, error: promoError } = await supabaseClient
        .from('PROMOCION_PRODUCTO')
        .select(`
            id_promocion,
            fecha_inicio,
            fecha_fin,
            PRODUCTO (
                id_producto,
                nombre,
                precio_base,
                precio_promocional,
                image_url,
                NEGOCIO (nombre_negocio)
            )
        `)
        .eq('activa', true)
        .order('fecha_inicio', { ascending: false })
        .limit(halfLimit + 1)
        .range(offset, offset + halfLimit);

    if (promoError) {
        throw new Error(`Error al obtener promociones: ${promoError.message}`);
    }

    if (promociones && promociones.length > halfLimit) {
        hasMore = true;
        promociones.pop();
    }

    const productItems = (promociones as any[] | null)?.map(p => ({
        type: 'product' as const,
        data: {
            ...p.PRODUCTO,
            nombre_negocio: p.PRODUCTO?.NEGOCIO?.nombre_negocio
        }
    })) || [];

    // 👉 Aquí luego puedes mezclar POSTS si quieres
    return {
        data: productItems.slice(0, totalLimit),
        pagination: { has_more: hasMore }
    };
}
// === 3. SERVICIO DE CATEGORÍAS (getBusinessCategoriesService) ===
// -----------------------------------------------------------------

type CategoriaNegocioResponse = Tables<'CATEGORIA_NEGOCIO'>[];

/**
 * Obtiene el listado de categorías de negocio activas para el módulo Discover.
 */
export async function getBusinessCategoriesService(): Promise<CategoriaNegocioResponse> {
    
    const { data, error } = await supabaseClient
        .from('CATEGORIA_NEGOCIO')
        .select('*')
        .eq('activo', true) 
        .order('nombre', { ascending: true });

    if (error) {
        throw new Error(`Error al obtener las categorías de negocio: ${error.message}`);
    }

    return data as CategoriaNegocioResponse;
}