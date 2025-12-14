import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import supabase from './config/supabase';
import path from 'path'; 
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import authRoutes from './routes/auth.routes';

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

//Rutas de autenticación
app.use('/api/v1/auth', authRoutes); 

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`📄 Documentación disponible en http://localhost:${PORT}/api-docs`);
});