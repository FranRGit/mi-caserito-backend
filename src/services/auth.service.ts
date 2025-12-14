import supabase from '../config/supabase';
import { RegisterUserDTO, AuthResponse } from '../dtos/auth.dto';
import { uploadFileToSupabase } from '../utils/storage';

export const registerUser = async (data: RegisterUserDTO, files: any): Promise<AuthResponse> => {
    const {
        email, password, tipo_usuario, nombre, apellido,
        ciudad_residencia, telefono, genero, fecha_nacimiento,
        nombre_negocio, id_categoria_negocio, ruc, descripcion,
        telefono_negocio, latitud, longitud, referencia
    } = data;

    try {
        // 1. Upload Images
        let uploadedDniPath: string | null = null;
        let uploadedProfileUrl: string | null = null;

        if (files) {
            if (files['dni_image']) {
                uploadedDniPath = await uploadFileToSupabase(files['dni_image'][0], 'documents', false);
            }
            if (files['profile_image']) {
                uploadedProfileUrl = await uploadFileToSupabase(files['profile_image'][0], 'profiles', true);
            }
        }

        // 2. Create User (Auth)
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

        if (authError || !authData.user) throw new Error(`Auth Error: ${authError?.message}`);
        const userId = authData.user.id;

        // 3. Upsert Profile
        const { error: updateError } = await supabase
            .from('PERFILES')
            .upsert({
                id_usuario: userId,
                email, nombre, apellido, tipo_usuario,
                telefono: telefono || null,
                genero: genero || null,
                fecha_nacimiento: fecha_nacimiento || null,
                dni_url: uploadedDniPath, // Stores path for private access
                profile_url: uploadedProfileUrl, // Stores Public URL
                ciudad_residencia: ciudad_residencia || null
            }, { onConflict: 'id_usuario' });

        if (updateError) throw new Error(`Profile DB Error: ${updateError.message}`);

        // 4. Create Business (if applicable)
        if (tipo_usuario === 'vendedor') {
            const { error: negError } = await supabase.from('NEGOCIO').insert({
                id_usuario: userId,
                id_categoria_negocio: Number(id_categoria_negocio),
                nombre_negocio,
                ruc: ruc || null,
                descripcion: descripcion || null,
                telefono_negocio: telefono_negocio || null,
                latitud: Number(latitud || 0),
                longitud: Number(longitud || 0),
                referencias: referencia || null,
                direccion: referencia || "Pendiente",
                ciudad: ciudad_residencia || "Pendiente",
                verificado: !!ruc
            });

            if (negError) throw new Error(`Business DB Error: ${negError.message}`);
        }

        return { user: authData.user, session: authData.session };

    } catch (error: any) {
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