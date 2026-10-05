/* Video reels: muted by default, load and play only while on screen, one reel with sound at a time */
(function () {
  "use strict";

  const reels = Array.prototype.slice.call(document.querySelectorAll("[data-reel]"));
  if (!reels.length) {
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const items = reels.map(function (reel) {
    const item = {
      reel: reel,
      video: reel.querySelector(".reel__video"),
      play: reel.querySelector(".reel__play"),
      sound: reel.querySelector(".reel__sound"),
      userPaused: false,
      inView: false
    };
    item.playLabel = item.play.querySelector(".reel__label");
    return item;
  });

  function load(item) {
    if (!item.video.getAttribute("src")) {
      item.video.src = item.video.dataset.src;
    }
  }

  function start(item) {
    load(item);
    const attempt = item.video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {
        syncPlay(item);
      });
    }
  }

  function syncPlay(item) {
    const paused = item.video.paused;
    item.playLabel.textContent = paused ? "Play" : "Pause";
    item.reel.classList.toggle("is-playing", !paused);
  }

  function setSound(item, on) {
    item.video.muted = !on;
    item.sound.setAttribute("aria-pressed", String(on));
  }

  items.forEach(function (item) {
    item.reel.querySelector(".reel__controls").hidden = false;
    item.video.muted = true;

    item.video.addEventListener("play", function () {
      syncPlay(item);
    });
    item.video.addEventListener("pause", function () {
      syncPlay(item);
    });

    item.play.addEventListener("click", function () {
      if (item.video.paused) {
        item.userPaused = false;
        start(item);
      } else {
        item.userPaused = true;
        item.video.pause();
      }
    });

    item.sound.addEventListener("click", function () {
      const turnOn = item.sound.getAttribute("aria-pressed") !== "true";
      items.forEach(function (other) {
        if (other !== item) {
          setSound(other, false);
        }
      });
      setSound(item, turnOn);
      if (turnOn && item.video.paused) {
        item.userPaused = false;
        start(item);
      }
    });
  });

  if (!("IntersectionObserver" in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        const item = items[reels.indexOf(entry.target)];
        item.inView = entry.isIntersecting;
        if (item.inView) {
          if (!reduceMotion && !item.userPaused) {
            start(item);
          }
        } else if (!item.video.paused) {
          item.video.pause();
        }
      });
    },
    { threshold: 0.5 }
  );

  reels.forEach(function (reel) {
    observer.observe(reel);
  });
})();
