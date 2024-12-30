/**
 * Create panoramas from processed data
 * @param {Array} data - Array of scene data
 * @returns {Array} - Array of panoramas with ID and ImagePanorama instance
 */
const createPanoramas = (data) =>
  data.map(({ id, src }) => ({
    id,
    image: new PANOLENS.ImagePanorama(src),
  }));

/**
 * Configure actions for hotspots and infospots
 * @param {Array} data - Array of scene data
 * @param {Array} panoramas - Array of created panoramas
 * @param {Object} viewer - PANOLENS viewer instance
 */
function createHotspotActions(data, panoramas, viewer) {
  const actionHandlers = {
    infospot: (spot, newSpot) => {
      const action = Array.isArray(spot.content)
        ? () => showInfoBox(newSpot, viewer, spot.content, true)
        : () => showInfoBox(newSpot, viewer, spot, false);
      newSpot.addEventListener('click', action);
    },
    hotspot: (spot, newSpot) => {
      const targetPanorama = panoramas.find((p) => p.id === spot.target)?.image;
      if (targetPanorama) {
        newSpot.addEventListener('click', () => viewer.setPanorama(targetPanorama));
      } else {
        console.error(`Target panorama "${spot.target}" not found for hotspot.`);
      }
    },
  };

  data.forEach(({ id, spots }) => {
    const panorama = panoramas.find((p) => p.id === id)?.image;
    if (!panorama) {
      console.error(`Panorama for scene "${id}" not found.`);
      return;
    }

    spots.forEach((spot) => {
      if (!spot.position || !spot.type) {
        console.error('Spot data is incomplete:', spot);
        return;
      }

      const newSpot = new PANOLENS.Infospot(
        spot.size || 300,
        spot.icon || '/icons/information.png'
      );
      newSpot.position.set(spot.position.x, spot.position.y, spot.position.z);

      const handler = actionHandlers[spot.type];
      if (handler) {
        handler(spot, newSpot);
      } else {
        console.error(`Unsupported spot type: "${spot.type}"`);
      }

      panorama.add(newSpot);
    });
  });
}

/**
 * Show info box for single or combined content
 */
function showInfoBox(infospot, viewer, data, isCombined) {
  const infoBox = getOrCreateElement('info-box', 'div', document.body);

  const contentTemplates = {
    info: (content) => `<p>${content}</p>`,
    image: (content) => `<img src="${content}" alt="Image" style="width: 100%;" />`,
    video: (content) => `<video controls style="width: 100%;"><source src="${content}" type="video/mp4"></video>`,
    audio: (content) => `<audio controls style="width: 100%;"><source src="${content}" type="audio/mp3"></audio>`,
  };

  const contentHTML = isCombined
    ? data
        .map(({ type, value }) =>
          contentTemplates[type]?.(value) || `<p>Unsupported content type</p>`
        )
        .join('')
    : contentTemplates[data.contentType]?.(data.content) || `<p>Unsupported content type</p>`;

  infoBox.innerHTML = `
    <div class="info-box-header">
      <h3>Information</h3>
      <button class="info-box-close">X</button>
    </div>
    <div class="info-box-content">${contentHTML}</div>
  `;

  updateInfoBoxPosition(infospot, infoBox, viewer);
  infoBox.querySelector('.info-box-close').addEventListener('click', () => {
    infoBox.remove();
  });
}

/**
 * Update the position of the info box based on the infospot
 */
function updateInfoBoxPosition(infospot, infoBox, viewer) {
  const vector = new THREE.Vector3();
  infospot.getWorldPosition(vector);
  vector.project(viewer.camera);

  Object.assign(infoBox.style, {
    position: 'absolute',
    left: `${(vector.x * 0.5 + 0.5) * window.innerWidth}px`,
    top: `${(-vector.y * 0.5 + 0.5) * window.innerHeight}px`,
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
  });
}

/**
 * Utility to get or create an element
 */
function getOrCreateElement(className, tag, parent) {
  let element = document.querySelector(`.${className}`);
  if (!element) {
    element = document.createElement(tag);
    element.className = className;
    parent.appendChild(element);
  }
  return element;
}

export { createPanoramas, createHotspotActions };
