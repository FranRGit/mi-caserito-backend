// src/controllers/producto.controller.ts
import { Request, Response } from 'express';
import { createProductService } from '../services/producto.service';
import { CreateProductDTO } from '../dtos/producto.dto';

// 

export async function createProductController(req: Request, res: Response) {
    try {
        // Asignamos el cuerpo de la petición al DTO para tipado
        const productData: CreateProductDTO = req.body;
        
        // --- Validaciones (Simplificadas) ---
        if (!productData.id_negocio || !productData.nombre || productData.precio_base === undefined) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Faltan campos obligatorios: id_negocio, nombre, y precio_base.' 
            });
        }

        // --- Lógica del Servicio ---
        const newProduct = await createProductService(productData);

        // --- Respuesta de Éxito ---
        return res.status(201).json({ 
            status: 'success', 
            message: 'Producto publicado exitosamente.',
            data: newProduct 
        });

    } catch (error) {
        console.error('Error en createProductController:', error);
        
        // Determina el código de estado basado en el error
        let statusCode = 500;
        if (error instanceof Error && error.message.includes("ID no encontrado o inválido")) {
            statusCode = 404;
        }

        return res.status(statusCode).json({ 
            status: 'error', 
            message: error instanceof Error ? error.message : 'Error interno del servidor.'
        });
    }
}