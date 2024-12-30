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
  const apiURL = 'http://localhost:3000/api/data';

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



// // Function for navigation (if needed elsewhere in your app)
// function navigate(url) {
//   window.location.href = url;
// }

// import { getPanoramaData, setFixedCameraLimits } from "./dataHandler.js";
// import { createPanoramas, createHotspotActions } from "./viewerLogic.js";

// // Get the container element for the viewer
// const container = document.querySelector("#container");

// // Create the PANOLENS viewer instance
// const viewer = new PANOLENS.Viewer({
//   container: container,
//   controlBar: true,
//   cameraFov: 75,
//   autoHideInfospot: false,
// });

// // Disable zoom functionality in the viewer
// viewer.getControl().enableZoom = false;

// // Use API endpoint to fetch panorama data from your MongoDB
// const jsonURL = "/api/data";

// async function app() {
//   try {
//     // Fetch panorama data from API
//     const data = await getPanoramaData(jsonURL);

//     // Create panoramas and hotspots
//     const panoramas = createPanoramas(data);
//     createHotspotActions(data, panoramas, viewer);

//     // Add panoramas to the viewer
//     panoramas.forEach((panorama) => viewer.add(panorama.image));

//     // Apply fixed camera limits after adding panoramas
//     setFixedCameraLimits(viewer);
//   } catch (error) {
//     console.error("Error initializing the application:", error);
//   }
// }

// // Initialize the application
// app();
