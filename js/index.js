import { getPanoramaData, setFixedCameraLimits } from './dataHandler.js';
import { createPanoramas, createHotspotActions } from './viewerLogic.js';

async function initializeViewer() {
  const viewerContainer = document.getElementById('container');

  // Inicializa el visor de PANOLENS
  const viewer = new PANOLENS.Viewer({
    container: viewerContainer,
    controlBar: true,
    autoRotate: false, // Cambiar a true si deseas una rotación automática
    output: 'console', // Muestra información en la consola (útil para depuración)
  });

  // Desactiva el zoom en el visor
  const controls = viewer.getControl();
  if (controls) {
    controls.enableZoom = false;
  } else {
    console.warn('Controles de la cámara no disponibles.');
  }

  // Ruta del endpoint de la API
  const apiURL = 'https://v5-tisaleo360.onrender.com/api/data';

  try {
    // 1. Cargar los datos desde la API
    const data = await getPanoramaData(apiURL);

    // 2. Crear panoramas con los datos obtenidos
    const panoramas = createPanoramas(data);

    // 3. Agregar cada panorama al visor
    panoramas.forEach((panorama) => {
      viewer.add(panorama.image);
    });

    // 4. Configurar hotspots para conectar panoramas o mostrar información
    createHotspotActions(data, panoramas, viewer);

    // 5. Aplicar límites de movimiento de la cámara
    setFixedCameraLimits(viewer);

    console.log('Visor inicializado con éxito.');
  } catch (error) {
    console.error('Error inicializando la aplicación:', error);
  }
}

// Inicializar la aplicación
initializeViewer();
