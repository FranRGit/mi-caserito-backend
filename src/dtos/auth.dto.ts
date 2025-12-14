import { User, Session } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

type TipoUsuarioEnum = Database["public"]["Enums"]["tipo_usuario_enum"];
type GeneroEnum = Database["public"]["Enums"]["genero_enum"];
type PerfilRow = Database["public"]["Tables"]["PERFILES"]["Row"];

export interface RegisterUserDTO {
    // --- DATOS OBLIGATORIOS (Usuario) ---
    email: string;
    password: string;
    tipo_usuario: TipoUsuarioEnum;
    nombre: string;
    apellido: string;
    
    // --- DATOS OPCIONALES (Cliente) ---
    ciudad_residencia?: string; 
    telefono?: string;        
    genero?: GeneroEnum;    
    fecha_nacimiento?: string;

    // ---Negocio - Solo si es vendedor) ---
    nombre_negocio?: string;
    id_categoria_negocio?: number;
    ruc?: string;
    descripcion?: string;
    telefono_negocio?: string;
    
    // Ubicación Negocio 
    ciudad_negocio?: string;
    latitud?: number;  
    longitud?: number; 
    referencia?: string; 
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User | null;
    session: Session | null;
    perfil?: PerfilRow | null;
}