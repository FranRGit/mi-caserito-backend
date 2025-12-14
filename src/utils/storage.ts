import supabase from '../config/supabase';

/**
 * Sube un archivo a Supabase Storage y retorna la URL pública.
 * @param file El archivo recibido por Multer (en memoria)
 * @param bucket Nombre del bucket en Supabase (ej. 'images')
 * @param folder Nombre de la carpeta dentro del bucket (ej. 'dni', 'profile')
 */
export const uploadFileToSupabase = async (
    file: Express.Multer.File, 
    bucket: string, 
    folder: string
): Promise<string> => {
    try {
        // 1. Generar nombre único: carpeta/timestamp-nombreOriginalLimpio
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        // 2. Subir a Supabase
        const { error: uploadError } = await supabase
            .storage
            .from(bucket)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (uploadError) {
            throw new Error(`Error subiendo imagen a Supabase: ${uploadError.message}`);
        }

        // 3. Obtener URL pública
        const { data: { publicUrl } } = supabase
            .storage
            .from(bucket)
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error: any) {
        console.error('Error en uploadFileToSupabase:', error.message);
        throw new Error('No se pudo subir la imagen.');
    }
};
