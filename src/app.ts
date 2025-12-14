import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import supabase from './config/supabase';
import path from 'path'; 
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import authRoutes from './routes/auth.routes';
import productoRoutes from './routes/producto.routes';
import postRoutes from './routes/post.routes';
import negocioRoutes from './routes/negocio.routes';
import discoverRoutes from './routes/discover.routes'; 
import homeRoutes from './routes/home.routes'; 



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
const swaggerPath = path.join(__dirname, '../swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);

// Ruta para la documentación
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req: Request, res: Response) => {
  res.send('Servidor TS funcionando 🚀. Ve a /api-docs para ver la documentación.');
});

// Rutas de autenticación
app.use('/api/v1/auth', authRoutes); 

// Rutas de Gestión de Vendedor
app.use('/api/v1/products', productoRoutes);

// REGISTRAMOS LAS RUTAS DE POSTS
app.use('/api/v1/posts', postRoutes);

// RUTAS DEL PERFIL DE NEGOCIO
app.use('/api/v1/negocio', negocioRoutes);

// RUTAS DE HOME/DISCOVER
app.use('/api/v1/discover', discoverRoutes); 

// RUTAS DE HOME
app.use('/api/v1/home', homeRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`📄 Documentación disponible en http://localhost:${PORT}/api-docs`);
});