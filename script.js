const showcase = document.querySelector("[data-reader-showcase]");
const books = window.AfterglowBooks || [];
const downloadShell = document.querySelector(".hero-tab-download-shell");

if (downloadShell && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  let cursorTimer;

  const restoreDownloadCursor = () => {
    window.clearTimeout(cursorTimer);
    downloadShell.classList.remove("is-cursor-hidden");
  };

  const scheduleDownloadCursorHide = () => {
    restoreDownloadCursor();
    cursorTimer = window.setTimeout(() => {
      downloadShell.classList.add("is-cursor-hidden");
    }, 2000);
  };

  downloadShell.addEventListener("mouseenter", scheduleDownloadCursorHide);
  downloadShell.addEventListener("mousemove", scheduleDownloadCursorHide);
  downloadShell.addEventListener("mouseleave", restoreDownloadCursor);
}

if (showcase && books.length) {
  const readerDevice = showcase.querySelector("[data-reader-device]");
  const bookRail = showcase.querySelector("[data-book-rail]");
  const themeToggle = showcase.querySelector("[data-reader-theme-toggle]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const readerFrames = books.map((book, index) => {
    const frame = document.createElement("div");
    frame.className = "reader-frame";
    frame.dataset.position = index === 0 ? "active" : "inactive";
    frame.setAttribute("aria-hidden", String(index !== 0));

    ["light", "dark"].forEach((theme) => {
      const image = document.createElement("img");
      image.className = "reader-theme-image";
      image.dataset.theme = theme;
      image.dataset.src = book.screens[theme];
      image.alt = theme === "light" ? `${book.title} reading view` : "";
      image.width = 1074;
      image.height = 2328;
      image.decoding = "async";
      image.loading = index === 0 ? "eager" : "lazy";
      image.fetchPriority = index === 0 && theme === "light" ? "high" : "low";
      frame.append(image);
    });

    readerDevice.append(frame);
    return frame;
  });

  const coverArtworks = [];
  const covers = books.map((book, index) => {
    const cover = document.createElement("div");
    const artwork = document.createElement("span");
    cover.className = "cover-choice";
    cover.dataset.position = index === 0 ? "active" : "inactive";
    artwork.className = "cover-art cover-art--image";
    artwork.dataset.coverImage = `url("${book.cover}")`;
    coverArtworks.push(artwork);
    cover.append(artwork);
    bookRail.append(cover);
    return cover;
  });

  let activeIndex = 0;
  let cycleTimer;
  let exitTimer;
  let isVisible = false;
  let readerTheme = "light";

  function hydrateBook(index) {
    const readerFrame = readerFrames[index];
    const coverArtwork = coverArtworks[index];

    readerFrame.querySelectorAll("[data-src]").forEach((image) => {
      if (!image.src) image.src = image.dataset.src;
    });
    if (!coverArtwork.style.getPropertyValue("--cover-image")) {
      coverArtwork.style.setProperty("--cover-image", coverArtwork.dataset.coverImage);
    }
  }

  function positionReader(index, previousIndex, animate) {
    readerFrames.forEach((element, elementIndex) => {
      element.dataset.position = elementIndex === index ? "active" : "inactive";
      element.setAttribute("aria-hidden", String(elementIndex !== index));
    });

    if (animate && previousIndex !== index) {
      readerFrames[previousIndex].dataset.position = "exiting";
    }
  }

  function setReaderTheme(theme) {
    if (theme !== "light" && theme !== "dark") return;

    readerTheme = theme;
    showcase.dataset.readerTheme = readerTheme;
    themeToggle.setAttribute("aria-label", `Switch to ${readerTheme === "light" ? "dark" : "light"} reader`);

    try {
      window.localStorage.setItem("afterglow-reader-theme", readerTheme);
    } catch (_) {
      // The switch still works when storage is unavailable (for example, private browsing).
    }
  }

  function positionCovers(index, previousIndex, animate) {
    covers.forEach((cover, coverIndex) => {
      const isIncoming = animate && coverIndex === index && previousIndex !== index;
      cover.dataset.position = coverIndex === index
        ? (isIncoming ? "entering" : "active")
        : "inactive";
      cover.setAttribute("aria-hidden", String(coverIndex !== index));
    });

    if (animate && previousIndex !== index) {
      covers[previousIndex].dataset.position = "exiting";
      void covers[index].offsetWidth;
      window.requestAnimationFrame(() => {
        if (covers[index].dataset.position === "entering") {
          covers[index].dataset.position = "active";
        }
      });
    }
  }

  function showSlide(index, animate = true) {
    const previousIndex = activeIndex;
    activeIndex = index;
    const shouldAnimate = animate && !reducedMotion.matches;

    hydrateBook(index);
    hydrateBook((index + 1) % books.length);
    showcase.style.setProperty("--theme-glow", books[index].glow);
    window.clearTimeout(exitTimer);
    positionReader(index, previousIndex, shouldAnimate);
    positionCovers(index, previousIndex, shouldAnimate);

    exitTimer = window.setTimeout(() => {
      [...readerFrames, ...covers].forEach((element) => {
        if (element.dataset.position === "exiting") element.dataset.position = "inactive";
      });
    }, 900);
  }

  function stopCycle() {
    window.clearInterval(cycleTimer);
  }

  function startCycle() {
    stopCycle();
    if (!reducedMotion.matches && isVisible) {
      cycleTimer = window.setInterval(() => showSlide((activeIndex + 1) % books.length), 2000);
    }
  }

  reducedMotion.addEventListener("change", startCycle);

  themeToggle.addEventListener("click", () => {
    setReaderTheme(readerTheme === "light" ? "dark" : "light");
  });

  new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    if (isVisible) startCycle();
    else stopCycle();
  }, { threshold: 0.2 }).observe(showcase);

  try {
    readerTheme = window.localStorage.getItem("afterglow-reader-theme") || readerTheme;
  } catch (_) {
    // Use the light reader when storage is unavailable.
  }

  setReaderTheme(readerTheme);
  showSlide(0, false);
}
