import supabase from '../config/supabase';

/**
 * Uploads a file to Supabase Storage.
 * @param file Multer file object
 * @param bucket Supabase bucket name
 * @param isPublic Whether to return a public URL or the internal path
 */
export const uploadFileToSupabase = async (
    file: Express.Multer.File,
    bucket: string,
    isPublic: boolean = true
): Promise<string | null> => {
    if (!file) return null;

    try {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}_${file.originalname.replace(/\s/g, '_')}`;

        const { error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) {
            console.error(`Error uploading to ${bucket}:`, error.message);
            throw new Error(`Failed to upload image to ${bucket}`);
        }

        if (isPublic) {
            const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
            return data.publicUrl;
        } else {
            return fileName;
        }
    } catch (error: any) {
        throw error;
    }
};
