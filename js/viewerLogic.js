/**
 * Create panoramas from processed data
 * @param {Array} data - Array of scene data
 * @returns {Array} - Array of panoramas with ID, ImagePanorama instance, and audio
 */
const createPanoramas = (data) =>
  data.map(({ id, src, spots }) => ({
    id,
    image: new PANOLENS.ImagePanorama(src),
    audio: spots.find((spot) => spot.contentType === "audio")?.content || null,
  }));

/**
 * Show an interactive and professional info box when clicking on an infospot
 * @param {Object} spot - The infospot data
 * @param {Object} viewer - The PANOLENS viewer instance
 * @param {string} content - The content to display in the info box
 */
function showInfoBox(spot, viewer, content) {
  // Remove any existing info boxes
  const existingBox = document.querySelector('.info-box-container');
  if (existingBox) existingBox.remove();

  // Create the main container
  const container = document.createElement('div');
  container.className = 'info-box-container';

  // Create the info box content
  const infoBox = document.createElement('div');
  infoBox.className = 'info-box';
  infoBox.innerHTML = `
    <h2>Información Turística</h2>
    <p>${content}</p>
    <button class="close-info-box">Cerrar</button>
  `;

  // Add close button functionality
  const closeButton = infoBox.querySelector('.close-info-box');
  closeButton.addEventListener('click', () => container.remove());

  // Add the info box to the container
  container.appendChild(infoBox);
  document.body.appendChild(container);
}

/**
 * Configure actions for hotspots and infospots
 * @param {Array} data - Array of scene data
 * @param {Array} panoramas - Array of created panoramas
 * @param {Object} viewer - PANOLENS viewer instance
 */
function createHotspotActions(data, panoramas, viewer) {
  const actionHandlers = {
    infospot: (spot, newSpot) => {
      const action = () => showInfoBox(spot, viewer, spot.content);
      newSpot.addEventListener('click', action);
    },
    hotspot: (spot, newSpot) => {
      const target = panoramas.find((p) => p.id === spot.target);
      if (target) {
        newSpot.addEventListener('click', () => {
          viewer.setPanorama(target.image);
          updateAudioControl(target.audio); // Update audio controls for the target panorama
        });
      } else {
        console.error(`Target panorama "${spot.target}" not found.`);
      }
    },
  };

  data.forEach(({ id, spots }) => {
    const panorama = panoramas.find((p) => p.id === id)?.image;
    if (!panorama) {
      return console.error(`Panorama for scene "${id}" not found.`);
    }

    spots.forEach((spot) => {
      if (!spot.position || !spot.type) {
        return console.error("Spot data is incomplete:", spot);
      }

      const newSpot = new PANOLENS.Infospot(
        spot.size || 300,
        spot.icon || "/icons/information.png"
      );
      newSpot.position.set(spot.position.x, spot.position.y, spot.position.z);

      const handler = actionHandlers[spot.type];
      if (handler) {
        handler(spot, newSpot);
        panorama.add(newSpot);
      } else {
        console.error(`Unsupported spot type: "${spot.type}"`);
      }
    });
  });
}

/**
 * Update the audio controls dynamically for the current panorama
 * @param {string} audioUrl - URL of the audio file
 */
function updateAudioControl(audioUrl) {
  const audioContainer = document.querySelector('.audio-control-container');
  if (audioContainer) audioContainer.remove(); // Remove existing controls if present

  const container = document.createElement('div');
  container.classList.add('audio-control-container');

  if (!audioUrl) {
    container.innerHTML = `<p class="no-audio-message">No hay audio disponible para este panorama</p>`;
    document.body.appendChild(container);
    return;
  }

  const audio = new Audio(audioUrl);
  const createButton = (text, className, onClick) => {
    const button = document.createElement('button');
    button.className = `audio-button ${className}`;
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
  };

  const playButton = createButton("Reproducir audio", "play-button", () => audio.play());
  const stopButton = createButton("Detener audio", "stop-button", () => {
    audio.pause();
    audio.currentTime = 0;
  });

  container.append(playButton, stopButton);
  document.body.appendChild(container);
}

export { createPanoramas, createHotspotActions, updateAudioControl };
