import { createPanoramas, createHotspotActions } from './viewerLogic.js';
import { updateAudioControl } from './audioLogic.js';
import { getPanoramaData, setFixedCameraLimits } from './dataHandler.js';



async function initializeViewer() {
  const viewerContainer = document.getElementById('container');

  const viewer = new PANOLENS.Viewer({
    container: viewerContainer,
    controlBar: true,
    autoRotate: true,
    autoRotateSpeed: 1.5,
    output: 'console',
  });

  const visitedScenes = new Set();
  let currentAudio = null;

  const stopCurrentAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
  };

  try {
    const data = await getPanoramaData();
    const panoramas = createPanoramas(data);

    panoramas.forEach((panorama, index) => {
      viewer.add(panorama.image);

      panorama.image.addEventListener('enter', () => {
        stopCurrentAudio();
        updateAudioControl(panorama.audio, stopCurrentAudio);

        if (!visitedScenes.has(panorama.id) && panorama.audio) {
          setTimeout(() => {
            currentAudio = new Audio(panorama.audio);
            currentAudio.play().catch(err => console.warn('Autoplay blocked:', err));
            visitedScenes.add(panorama.id);
          }, 5000);
        }
      });

      if (index === 0) {
        viewer.setPanorama(panorama.image);
        updateAudioControl(panorama.audio, stopCurrentAudio);

        if (panorama.audio) {
          setTimeout(() => {
            currentAudio = new Audio(panorama.audio);
            currentAudio.play().catch(err => console.warn('Autoplay blocked:', err));
            visitedScenes.add(panorama.id);
          }, 5000);
        }
      }
    });

    createHotspotActions(data, panoramas, viewer);
    setFixedCameraLimits(viewer);

    console.log('Viewer initialized successfully.');
  } catch (error) {
    console.error('Error initializing viewer:', error);
  }
}

initializeViewer();
