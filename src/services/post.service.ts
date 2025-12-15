// src/services/post.service.ts

import { createClient } from '@supabase/supabase-js';
import { CreatePostDTO } from '../dtos/post.dto';
import { Tables, TablesInsert } from '../types/database.types';

type PostResponse = Tables<'POSTS'>;

export async function createPostService(
  postData: CreatePostDTO,
  accessToken: string
): Promise<PostResponse> {

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );

  const { data, error } = await supabase
    .from('POSTS')
    .insert(postData)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al publicar el post: ${error.message}`);
  }

  return data;
}
