/**
 * Cargar datos desde el endpoint de la API
 */
export async function getPanoramaData() {
  try {
    // Solicita los datos desde la API
    const response = await fetch('http://localhost:3000/api/data');
    if (!response.ok) {
      throw new Error('Error al obtener los datos');
    }
    const data = await response.json();

    // Procesa los datos para integrarlos con el visor
    return data.map((scene) => ({
      id: scene.id,
      src: scene.src,
      spots: scene.spots.map((spot) => ({
        ...spot,
        position: new THREE.Vector3(
          spot.position.x * 100,
          spot.position.y * 100,
          spot.position.z * 100
        ),
      })),
    }));
  } catch (error) {
    console.error('Error cargando los datos:', error);
    return [];
  }
}

/**
 * Establecer límites de movimiento de la cámara
 */
export function setFixedCameraLimits(viewer) {
  const controls = viewer.getControl();

  if (controls) {
    const offset = Math.PI / 2; // 90 degrees in radians (horizontal view)
    const angleRange = Math.PI / 6; // ~5 degrees in radians

    // Set limits for polar angle to allow slight upward/downward movement
    controls.maxPolarAngle = offset + angleRange; // 5 degrees up
    controls.minPolarAngle = offset - angleRange; // 5 degrees down

    controls.enableZoom = false;
    controls.update();
  } else {
    console.error("Camera controls not accessible.");
  }
}
