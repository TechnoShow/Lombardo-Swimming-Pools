(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
    });
  });

  const setActive = () => {
    const map = [
      ["hero", "#top"],
      ["about", "#about"],
      ["services", "#services"],
      ["portfolio", "#portfolio"],
      ["contact", "#contact"],
    ];
    const y = window.scrollY + 140;
    let href = "#top";
    for (const [id, link] of map) {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= y) href = link;
    }
    nav?.querySelectorAll("a").forEach((a) => {
      a.classList.toggle("is-active", a.getAttribute("href") === href);
    });
  };
  window.addEventListener("scroll", setActive, { passive: true });

  const loadFrames = (src, count) => {
    const images = [];
    for (let i = 1; i <= count; i += 1) {
      const img = new Image();
      img.src = `${src}/${String(i).padStart(3, "0")}.jpg`;
      images.push(img);
    }
    return images;
  };

  const heroFrames = loadFrames("assets/frames/hero", 60);
  const buildFrames = loadFrames("assets/frames/build", 61);

  const setupScrub = (section, frames) => {
    const canvas = section.querySelector("[data-scrub-canvas]");
    const video = section.querySelector("[data-scrub-video]");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const size = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(section.clientWidth * ratio);
      canvas.height = Math.floor(section.clientHeight * ratio);
      canvas.style.width = `${section.clientWidth}px`;
      canvas.style.height = `${section.clientHeight}px`;
    };
    size();
    window.addEventListener("resize", size);

    const drawImage = (img) => {
      if (!img || !img.complete || !img.naturalWidth) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    const progressOf = () => {
      const rect = section.getBoundingClientRect();
      const span = window.innerHeight + rect.height;
      return Math.min(1, Math.max(0, (window.innerHeight - rect.top) / span));
    };

    const update = () => {
      const progress = progressOf();
      if (frames && frames.length) {
        const index = Math.min(frames.length - 1, Math.floor(progress * (frames.length - 1)));
        drawImage(frames[index]);
        return;
      }
      if (video && video.duration) {
        const t = progress * Math.max(0, video.duration - 0.04);
        if (Math.abs(video.currentTime - t) > 0.03) video.currentTime = t;
        if (video.readyState >= 2) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    };

    frames?.forEach((img) => img.addEventListener("load", update));
    video?.addEventListener("loadeddata", update);
    video?.addEventListener("seeked", update);
    window.addEventListener("scroll", update, { passive: true });
    update();
  };

  setupScrub(document.getElementById("hero"), heroFrames);
  setupScrub(document.getElementById("portfolio"), buildFrames);

  const form = document.getElementById("consult-form");
  const status = document.getElementById("form-status");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.hidden = false;
    status.className = "form-status";
    status.textContent = "Sending…";
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        form.reset();
        status.classList.add("is-success");
        status.textContent = "Thank you. We received your consultation request.";
      } else {
        throw new Error("Form error");
      }
    } catch {
      status.classList.add("is-error");
      status.textContent = "We could not send that just now. Please call (704) 847-4648.";
    }
  });
})();
