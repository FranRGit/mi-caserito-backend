// src/services/producto.service.ts
import supabaseClient from '../config/supabase'; 
import { CreateProductDTO } from '../dtos/producto.dto';
import { Tables, TablesInsert } from '../types/database.types'; 
// No es necesario importar PostgrestError de '@supabase/supabase-js' ya que
// la variable error ya tiene ese tipo si usas try/catch correctamente.

// Tipamos la respuesta de la función
type ProductResponse = Tables<'PRODUCTO'>;

export async function createProductService(productData: CreateProductDTO): Promise<ProductResponse> {
    
    // Aseguramos que los datos se ajusten a la estructura de inserción
    const productInsertData: TablesInsert<'PRODUCTO'> = productData;

    const { data: newProduct, error } = await supabaseClient // USAMOS LA VARIABLE IMPORTADA
        .from('PRODUCTO') 
        .insert([productInsertData])
        .select() 
        .single();

    if (error) {
        // Manejo de errores específico (e.g., foreign key violation)
        if (error.code === '23503') { 
            throw new Error(`Error de validación de datos: ${error.message} (ID de Negocio/Categoría no válido).`);
        }
        
        throw new Error(`Error al publicar el producto: ${error.message}`);
    }

    return newProduct;
}