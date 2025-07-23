// Get all necessary elements from the DOM
const offStateControls = document.getElementById("off-state-controls");
const onStateControls = document.getElementById("on-state-controls");
const durationSelect = document.getElementById("duration-select");
const turnOnBtn = document.getElementById("turn-on-btn");
const turnOffBtn = document.getElementById("turn-off-btn");
const statusMessage = document.getElementById("status-message");
const body = document.body;

let countdownInterval = null;
let videoTrack = null;

// Function to switch which UI controls are visible
const setUiState = (isFlashlightOn) => {
  if (isFlashlightOn) {
    offStateControls.classList.add("hidden");
    onStateControls.classList.remove("hidden");
    body.classList.add("light-on");
  } else {
    onStateControls.classList.add("hidden");
    offStateControls.classList.remove("hidden");
    body.classList.remove("light-on");
  }
};

// Main function to turn the flashlight OFF
const turnOffFlashlight = () => {
  clearInterval(countdownInterval); // Stop any active timer

  if (videoTrack) {
    videoTrack.applyConstraints({ advanced: [{ torch: false }] });
    videoTrack.stop();
    videoTrack = null;
  }
  setUiState(false);
};

// Main function to turn the flashlight ON
const turnOnFlashlight = async () => {
  // Check for browser support
  if (
    !("mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices)
  ) {
    alert("Sorry, your browser does not support the flashlight API.");
    return;
  }

  const duration = parseInt(durationSelect.value, 10);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    videoTrack = stream.getVideoTracks()[0];
    await videoTrack.applyConstraints({ advanced: [{ torch: true }] });

    // Flashlight is on, now update UI and start timer if needed
    setUiState(true);

    if (duration === Infinity) {
      statusMessage.textContent = "Flashlight is On";
    } else {
      let secondsLeft = duration;
      statusMessage.textContent = `Turning off in ${secondsLeft} seconds...`;

      countdownInterval = setInterval(() => {
        secondsLeft--;
        statusMessage.textContent = `Turning off in ${secondsLeft} seconds...`;
        if (secondsLeft <= 0) {
          turnOffFlashlight();
        }
      }, 1000);
    }
  } catch (err) {
    console.error("Flashlight Error:", err);
    alert("Could not access the flashlight. Please allow camera permissions.");
    setUiState(false); // Make sure UI is in the correct state on error
  }
};

// Add click event listeners to the buttons
turnOnBtn.addEventListener("click", turnOnFlashlight);
turnOffBtn.addEventListener("click", turnOffFlashlight);
