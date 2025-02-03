/**
 * Create or update the audio controls dynamically for the current panorama
 * @param {string} audioUrl - URL of the audio file
 * @param {Function} stopCurrentAudio - Function to stop the currently playing audio
 */
function updateAudioControl(audioUrl, stopCurrentAudio) {
  const TEXTS = {
    play: "Reproducir audio",
    stop: "Detener audio",
    noAudio: "No hay audio disponible para este panorama.",
  };

  // Remove existing controls if present
  document.querySelector(".audio-control-container")?.remove();

  const audioContainer = document.createElement("div");
  audioContainer.classList.add("audio-control-container");

  if (!audioUrl) {
    audioContainer.innerHTML = `<p class="no-audio-message">${TEXTS.noAudio}</p>`;
    document.body.appendChild(audioContainer);
    return;
  }

  const audio = new Audio(audioUrl);

  const playButton = document.createElement("button");
  playButton.className = "audio-button play-button";
  playButton.textContent = TEXTS.play;
  playButton.onclick = () => {
    stopCurrentAudio();
    audio.play();
  };

  const stopButton = document.createElement("button");
  stopButton.className = "audio-button stop-button";
  stopButton.textContent = TEXTS.stop;
  stopButton.onclick = () => {
    audio.pause();
    audio.currentTime = 0;
  };

  audioContainer.append(playButton, stopButton);
  document.body.appendChild(audioContainer);
}

export { updateAudioControl };
