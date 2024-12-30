const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const compression = require('compression');
const path = require('path'); // Para manejar rutas de archivos estáticos
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(compression()); // Habilitar compresión para respuestas

// Servir archivos estáticos desde las nuevas ubicaciones
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
  .then(() => console.log('Conectado a MongoDB Atlas AMIGO MIO :3'))
  .catch((err) => console.error('Error conectando a MongoDB:', err));

// API endpoint para obtener datos desde la colección "scenes"
app.get('/api/data', async (req, res) => {
  try {
    const data = await mongoose.connection.db.collection('models').find().toArray();
    res.json(data);
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    res.status(500).json({ error: 'Error al obtener los datos de la base de datos.' });
  }
});

// Endpoint genérico para servir el frontend
app.use(express.static(path.join(__dirname)));

// Manejador para todas las rutas desconocidas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
