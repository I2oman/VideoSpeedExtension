document.addEventListener("DOMContentLoaded", () => {
  const speedOptions = document.querySelectorAll(".speed-option");

  // Function to highlight the selected speed option
  function highlightCurrentSpeed(currentSpeed) {
    speedOptions.forEach((option) => {
      const speed = option.getAttribute("data-speed");
      option.classList.toggle("selected", parseFloat(speed) === currentSpeed);
    });
  }

  // Get the current video playback speed from the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: getCurrentVideoSpeed,
      },
      (results) => {
        if (results && results[0] && results[0].result != null) {
          const currentSpeed = results[0].result;
          highlightCurrentSpeed(currentSpeed);
        } else {
          console.log("No video playback speed retrieved or no video found.");
        }
      },
    );
  });

  // Enable Netflix ad popup speed handling in the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: enableNetflixAdPopupSpeedControl,
    });
  });

  // Event listener for speed option clicks
  speedOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const speed = parseFloat(option.getAttribute("data-speed"));

      // Set the video speed in the active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: setVideoSpeed,
          args: [speed],
        });
      });

      // Update the UI to highlight the selected speed
      highlightCurrentSpeed(speed);
    });
  });
});

// Function injected into the page to get the current video speed
function getCurrentVideoSpeed() {
  const videos = document.querySelectorAll("video");

  if (videos.length > 0) {
    return videos[0].playbackRate;
  }

  return null;
}

// Function injected into the page to set the video speed
function setVideoSpeed(speed) {
  const videos = document.querySelectorAll("video");

  videos.forEach((video) => {
    video.playbackRate = speed;
  });
}

// Function injected into the page to handle Netflix ad popup speed
function enableNetflixAdPopupSpeedControl() {
  const AD_SPEED = 16;
  const NORMAL_SPEED = 1;
  const RESET_DELAY_DIVIDER = 16;

  if (window.__netflixAdPopupSpeedControlEnabled) {
    return;
  }

  window.__netflixAdPopupSpeedControlEnabled = true;
  window.__netflixAdPopupResetTimeoutId = null;
  window.__netflixAdPopupLastDetectedSeconds = null;

  function parseAdSeconds(timeText) {
    const cleanText = String(timeText || "").trim();

    if (!cleanText) {
      return null;
    }

    if (cleanText.includes(":")) {
      const parts = cleanText.split(":").map((part) => Number(part));

      if (parts.some((part) => Number.isNaN(part))) {
        return null;
      }

      if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
      }

      if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      }

      return null;
    }

    const seconds = Number(cleanText.replace(/[^\d.]/g, ""));

    return Number.isNaN(seconds) ? null : seconds;
  }

  function setAllVideosSpeed(speed) {
    document.querySelectorAll("video").forEach((video) => {
      video.playbackRate = speed;
    });
  }

  function clearScheduledReset() {
    if (window.__netflixAdPopupResetTimeoutId !== null) {
      clearTimeout(window.__netflixAdPopupResetTimeoutId);
      window.__netflixAdPopupResetTimeoutId = null;
    }
  }

  function scheduleSpeedReset(seconds) {
    clearScheduledReset();

    const resetDelayMs = (seconds / RESET_DELAY_DIVIDER) * 1000;

    window.__netflixAdPopupResetTimeoutId = setTimeout(() => {
      setAllVideosSpeed(NORMAL_SPEED);
      window.__netflixAdPopupResetTimeoutId = null;
      window.__netflixAdPopupLastDetectedSeconds = null;
    }, resetDelayMs);
  }

  function handleNetflixAdPopup() {
    const adTimeElement = document.querySelector('[data-uia="ads-info-time"]');

    if (!adTimeElement) {
      return;
    }

    const seconds = parseAdSeconds(adTimeElement.textContent);

    if (seconds === null || seconds <= 0) {
      return;
    }

    if (window.__netflixAdPopupLastDetectedSeconds === seconds) {
      return;
    }

    window.__netflixAdPopupLastDetectedSeconds = seconds;

    setAllVideosSpeed(AD_SPEED);
    scheduleSpeedReset(seconds);
  }

  handleNetflixAdPopup();

  const observer = new MutationObserver(handleNetflixAdPopup);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}
