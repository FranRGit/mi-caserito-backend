const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 1. Configuración de Middlewares
app.use(cors());
app.use(express.json()); 

// 2. Conexión a Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 3. Cargar Swagger (Tu documentación)
// Guarda tu código YAML corregido en un archivo 'swagger.yaml' en la raíz
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 4. Ejemplo de Ruta (Test)
app.get('/', (req, res) => {
  res.send('🚀 API Mi Caserito funcionando. Ve a /api-docs para ver la documentación.');
});

// Arrancar servidor
app.listen(port, () => {
  console.log(`Server corriendo en http://localhost:${port}`);
  console.log(`Documentación en http://localhost:${port}/api-docs`);
});