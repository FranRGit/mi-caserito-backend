import { Request, Response, NextFunction } from 'express';
// Importamos el cliente de Supabase configurado
import supabaseClient from '../config/supabase'; 

// Extendemos la interfaz Request de Express para que TypeScript sepa
// que podemos añadir un 'user' al objeto de solicitud (req.user)
export interface AuthenticatedRequest extends Request {
    user?: { // Aquí guardaremos la información del usuario autenticado
        id: string; // El id_usuario (UUID)
        email: string;
        role: string; // Por ejemplo: 'vendedor' o 'cliente'
    };
}

// 💡 Este middleware se asegura de que la solicitud sea de un USUARIO VÁLIDO
export const authMiddleware = async (
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
) => {
    // 1. Obtener la cabecera de autorización
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            status: 'error', 
            message: 'Acceso denegado. Se requiere un token Bearer.' 
        });
    }

    // 2. Extraer el token (eliminar "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
        // 3. Verificar el token usando Supabase
        // Supabase verifica la validez del JWT (firma, expiración)
        const { data, error } = await supabaseClient.auth.getUser(token);

        if (error || !data?.user) {
            // Si el token es inválido o ha expirado
            return res.status(401).json({ 
                status: 'error', 
                message: 'Token inválido o expirado. Vuelva a iniciar sesión.' 
            });
        }
        
        const user = data.user;

        // 4. Obtener el perfil del usuario para obtener el rol ('vendedor'/'cliente')
        // *Este paso es vital para la AUTORIZACIÓN (saber si es vendedor)*
        const { data: perfilData, error: perfilError } = await supabaseClient
            .from('PERFILES')
            .select('id_usuario, email, tipo_usuario') // 'tipo_usuario' es clave
            .eq('id_usuario', user.id)
            .single();

        if (perfilError || !perfilData) {
             return res.status(404).json({ 
                status: 'error', 
                message: 'Perfil de usuario no encontrado en la base de datos.' 
            });
        }

        // 5. Inyectar la información del usuario autenticado en el objeto de solicitud (req)
        req.user = {
            id: perfilData.id_usuario,
            email: perfilData.email,
            role: perfilData.tipo_usuario || 'cliente', // Asumimos 'cliente' si no tiene rol
        };
        
        // 6. Pasar al siguiente middleware o al controlador
        next(); 

    } catch (error) {
        console.error('Error en authMiddleware:', error);
        return res.status(500).json({ 
            status: 'error', 
            message: 'Error interno del servidor durante la autenticación.' 
        });
    }
};