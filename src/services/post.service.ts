// src/services/post.service.ts

import supabaseClient from '../config/supabase'; 
import { CreatePostDTO } from '../dtos/post.dto';
import { Tables, TablesInsert } from '../types/database.types'; 

type PostResponse = Tables<'POSTS'>;

export async function createPostService(postData: CreatePostDTO): Promise<PostResponse> {
    
    const postInsertData: TablesInsert<'POSTS'> = postData;

    const { data: newPost, error } = await supabaseClient
        .from('POSTS') 
        .insert([postInsertData])
        .select() 
        .single();

    if (error) {
        if (error.code === '23503') { 
            throw new Error(`Error de validación de datos: ${error.message} (ID de Usuario no válido).`);
        }
        
        throw new Error(`Error al publicar el post: ${error.message}`);
    }

    return newPost;
}