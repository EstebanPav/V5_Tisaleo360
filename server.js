const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors()); // Habilitar CORS para permitir solicitudes cruzadas
app.use(express.json()); // Parsear JSON
app.use(compression()); // Reducir tamaño de respuestas

// Configuración manual de Content Security Policy (CSP)
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
  imgSrc: ["'self'", "*", "data:"], // Permite imágenes de cualquier dominio
  mediaSrc: ["'self'", "*"], // Permite audios y videos de cualquier dominio
  connectSrc: ["'self'", "*"], // Permite conexiones a cualquier dominio (útil para APIs y sockets)
  styleSrc: ["'self'", "'unsafe-inline'"]
};



// Aplicar CSP manualmente
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: cspDirectives
    }
  })
);

app.use(morgan('combined')); // Logging profesional para seguimiento

// Límite de solicitudes por IP para evitar abuso
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 200, // Máximo 200 solicitudes por IP
  standardHeaders: true, // Incluir información en encabezados estándar
  legacyHeaders: false, // Deshabilitar encabezados antiguos
});
app.use(limiter);

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Tiempo de espera para conectarse al servidor
  })
  .then(() => console.log('✅ Conexión exitosa a MongoDB'))
  .catch((err) => {
    console.error('❌ Error al conectar con MongoDB:', err);
    process.exit(1); // Salir si no se puede conectar a la base de datos
  });

// Definir rutas API antes de los archivos estáticos
app.get('/api/data', async (req, res) => {
  try {
    const data = await mongoose.connection.db.collection('models').find().toArray();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener los datos.' });
  }
});

// Endpoint para obtener datos específicos por ID
app.get('/api/data/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const scene = await mongoose.connection.db.collection('models').findOne({ id });
    if (scene) {
      res.status(200).json(scene);
    } else {
      res.status(404).json({ error: 'Escena no encontrada.' });
    }
  } catch (error) {
    console.error('Error al obtener la escena:', error);
    res.status(500).json({ error: 'Error interno del servidor al buscar la escena.' });
  }
});

// Rutas de archivos estáticos
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/icons', express.static(path.join(__dirname, 'icons')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));
app.use('/photos', express.static(path.join(__dirname, 'photos')));

// Servir archivos estáticos después de definir las rutas API
app.use(express.static(path.join(__dirname)));

// Manejador de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('❌ Error inesperado:', err);
  res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor.' });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
