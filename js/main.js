/* Shared behavior: mobile nav, hero film control, scroll reveal */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Mobile nav toggle */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");

  function setNav(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        setNav(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setNav(false);
        toggle.focus();
      }
    });
  }

  /* Hero film: plays only when motion is welcome; poster shows otherwise */
  const video = document.querySelector(".hero__video");
  const rec = document.querySelector(".hero__rec");

  if (video && rec) {
    const label = rec.querySelector(".hero__rec-label");

    function setPaused(paused) {
      rec.setAttribute("aria-pressed", String(paused));
      label.textContent = paused ? "Play video" : "Pause video";
    }

    rec.hidden = false;

    if (reduceMotion) {
      setPaused(true);
    } else {
      video.preload = "auto";
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          setPaused(true);
        });
      }
    }

    rec.addEventListener("click", function () {
      if (video.paused) {
        video.play();
        setPaused(false);
      } else {
        video.pause();
        setPaused(true);
      }
    });
  }

  /* Scroll reveal */
  const revealEls = document.querySelectorAll("[data-reveal]");

  if (!reduceMotion && "IntersectionObserver" in window && revealEls.length) {
    document.documentElement.classList.add("js-reveal");
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }
})();
