const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const compression = require('compression');
const path = require('path'); // Para manejar rutas de archivos estáticos
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Habilitar CORS
app.use(express.json()); // Parsear JSON
app.use(compression()); // Habilitar compresión para respuestas

// Servir archivos estáticos desde las carpetas indicadas
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/icons', express.static(path.join(__dirname, 'icons')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));
app.use('/photos', express.static(path.join(__dirname, 'photos')));

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch((err) => {
    console.error('Error conectando a MongoDB:', err);
    process.exit(1); // Salir si no se puede conectar
  });

// Endpoint para obtener datos desde la colección "scenes"
app.get('/api/data', async (req, res) => {
  try {
    const data = await mongoose.connection.db.collection('models').find().toArray(); // Cambiado a 'scenes'
    res.json(data);
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    res.status(500).json({ error: 'Error al obtener los datos de la base de datos.' });
  }
});

// Servir archivos estáticos desde la raíz del proyecto
app.use(express.static(path.join(__dirname)));

// Manejador genérico para servir `index.html` en rutas desconocidas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
