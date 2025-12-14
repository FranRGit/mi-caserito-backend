// src/dtos/producto.dto.ts
import { Enums, TablesInsert } from '../types/database.types'; 

export interface CreateProductDTO {
    // CAMPO OBLIGATORIO para la inserción
    id_negocio: TablesInsert<'PRODUCTO'>['id_negocio'];
    id_categoria_producto: TablesInsert<'PRODUCTO'>['id_categoria_producto'];
    nombre: TablesInsert<'PRODUCTO'>['nombre'];
    precio_base: TablesInsert<'PRODUCTO'>['precio_base']; 

    // CAMPOS OPCIONALES
    descripcion?: TablesInsert<'PRODUCTO'>['descripcion'];
    precio_promocional?: TablesInsert<'PRODUCTO'>['precio_promocional'];
    stock?: TablesInsert<'PRODUCTO'>['stock']; 
    // Usamos el tipo Enums para el estado
    estado?: Enums<'estado_producto_enum'>; 
    destacado?: TablesInsert<'PRODUCTO'>['destacado']; 
    activo?: TablesInsert<'PRODUCTO'>['activo']; 
    image_url?: TablesInsert<'PRODUCTO'>['image_url'];
}