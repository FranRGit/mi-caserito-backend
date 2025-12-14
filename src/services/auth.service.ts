import supabase from '../config/supabase';
import { RegisterUserDTO, AuthResponse } from '../dtos/auth.dto';

/**
 * Función Auxiliar para subir archivos
 * @param file Archivo Multer
 * @param bucket Nombre del bucket ('profiles' o 'documents')
 * @param folder Carpeta interna (ej: 'dni', 'avatars')
 * @param isPublic Si es true, retorna URL pública. Si es false, retorna el PATH interno.
 */
const uploadToBucket = async (
    file: Express.Multer.File,
    bucket: string,
    folder: string,
    isPublic: boolean
): Promise<string | null> => {
    if (!file) return null;

    try {
        // 1. Generar nombre único para evitar colisiones
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        // 2. Subir el archivo (Service Role permite subir aunque sea privado)
        const { error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) {
            console.error(`Error subiendo a ${bucket}:`, error.message);
            throw new Error(`No se pudo subir la imagen a ${bucket}`);
        }

        // 3. Retornar el valor correcto según privacidad
        if (isPublic) {
            // Para PROFILES: Devolvemos la URL pública (accesible por todos)
            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
            return data.publicUrl;
        } else {
            // Para DOCUMENTS (DNI): Devolvemos SOLO EL PATH (ej: "dni/123.jpg")
            // No devolvemos URL porque es privado.
            return filePath;
        }

    } catch (error: any) {
        throw error;
    }
};

export const registerUser = async (data: RegisterUserDTO, files: any): Promise<AuthResponse> => {

    // 1. Desestructuramos datos del DTO
    const {
        email, password, tipo_usuario, nombre, apellido,
        ciudad_residencia, telefono, genero, fecha_nacimiento,
        // Datos de Negocio
        nombre_negocio, id_categoria_negocio, ruc, descripcion,
        telefono_negocio, latitud, longitud, referencia
    } = data;

    console.log(`🚀 Iniciando registro para: ${email}`);

    try {
        // --------------------------------------------------------
        // PASO 1: Auth (Crear Usuario)
        // --------------------------------------------------------
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nombre,
                    apellido,
                    tipo_usuario,
                    ciudad: ciudad_residencia || 'No especificada'
                }
            }
        });

        if (authError || !authData.user) throw new Error(`Error Auth: ${authError?.message}`);
        const userId = authData.user.id;

        // --------------------------------------------------------
        // PASO 2: Subida de Archivos (La parte nueva)
        // --------------------------------------------------------
        let dniPath = null;
        let profileUrl = null;

        if (files) {
            // A. Subir DNI (Bucket 'documents' - PRIVADO)
            if (files['dni_image']) {
                dniPath = await uploadToBucket(
                    files['dni_image'][0],
                    'documents', // Tu bucket privado
                    'dni',
                    false // isPublic = false -> Retorna PATH
                );
            }

            // B. Subir Perfil (Bucket 'profiles' - PÚBLICO)
            if (files['profile_image']) {
                profileUrl = await uploadToBucket(
                    files['profile_image'][0],
                    'profiles', // Tu bucket público
                    'avatars',
                    true // isPublic = true -> Retorna URL
                );
            }
        }

        // --------------------------------------------------------
        // PASO 3: Actualizar Base de Datos
        // --------------------------------------------------------
        const { error: updateError } = await supabase
            .from('PERFILES')
            .update({
                telefono: telefono || null,
                genero: genero || null,
                fecha_nacimiento: fecha_nacimiento || null,

                // Guardamos lo que nos devolvió el uploader
                dni_url: dniPath,       // Guarda: "dni/16482...jpg"
                profile_url: profileUrl, // Guarda: "https://supabase.../profiles/avatars/..."

                ciudad_residencia: ciudad_residencia || null
            })
            .eq('id_usuario', userId);

        if (updateError) throw new Error(`Error BD Perfil: ${updateError.message}`);

        // --------------------------------------------------------
        // PASO 4: Crear Negocio (Solo Vendedores)
        // --------------------------------------------------------
        if (tipo_usuario === 'vendedor') {
            if (!nombre_negocio || !id_categoria_negocio) throw new Error("Faltan datos negocio");

            const { error: negError } = await supabase
                .from('NEGOCIO')
                .insert({
                    id_usuario: userId,
                    id_categoria_negocio: Number(id_categoria_negocio),
                    nombre_negocio,
                    ruc: ruc || null,
                    descripcion: descripcion || null,
                    telefono_negocio: telefono_negocio || null,
                    latitud: Number(latitud || 0),
                    longitud: Number(longitud || 0),
                    referencias: referencia || null,
                    // Lógica de verificación automática si hay RUC
                    verificado: !!ruc
                });

            if (negError) {
                // Rollback si falla el negocio
                await supabase.auth.admin.deleteUser(userId);
                // Opcional: Borrar archivos subidos para limpiar (avanzado)
                throw new Error(`Error negocio: ${negError.message}`);
            }
        }

        return { user: authData.user, session: authData.session };

    } catch (error: any) {
        // Rollback general (Ojo: authData podría no existir si falló al inicio)
        console.error("❌ Error en registro:", error.message);
        throw error;
    }
};


export const loginUser = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw new Error(error.message);

    // Obtener Perfil
    const { data: perfil } = await supabase
        .from('PERFILES')
        .select('*')
        .eq('id_usuario', data.user?.id)
        .single();

    let negocio = null;
    if (perfil?.tipo_usuario === 'vendedor') {
        const { data: neg } = await supabase
            .from('NEGOCIO')
            .select('*')
            .eq('id_usuario', data.user?.id)
            .maybeSingle(); // maybeSingle no tira error si no existe
        negocio = neg;
    }

    return {
        session: data.session,
        user: data.user,
        perfil,
        negocio
    };
};