import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string; // "as string" asegura que existe
const supabaseKey = process.env.SUPABASE_KEY as string;

// Le pasamos <Database> para que sepa autocompletar tus tablas
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;