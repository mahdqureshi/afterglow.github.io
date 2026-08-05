const showcase = document.querySelector("[data-reader-showcase]");
const books = window.AfterglowBooks || [];

if (showcase && books.length) {
  const readerDevice = showcase.querySelector("[data-reader-device]");
  const bookRail = showcase.querySelector("[data-book-rail]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const readerImages = books.map((book, index) => {
    const image = document.createElement("img");
    image.className = "reader-image";
    image.src = book.screen;
    image.alt = `${book.title} reading view`;
    image.dataset.position = index === 0 ? "active" : "inactive";
    image.setAttribute("aria-hidden", String(index !== 0));
    readerDevice.append(image);
    return image;
  });

  const covers = books.map((book, index) => {
    const cover = document.createElement("div");
    const artwork = document.createElement("span");
    cover.className = "cover-choice";
    cover.dataset.position = index === 0 ? "active" : "inactive";
    artwork.className = "cover-art cover-art--image";
    artwork.style.setProperty("--cover-image", `url("${book.cover}")`);
    cover.append(artwork);
    bookRail.append(cover);
    return cover;
  });

  let activeIndex = 0;
  let cycleTimer;
  let exitTimer;
  let isVisible = false;

  function positionReader(index, previousIndex, animate) {
    readerImages.forEach((element, elementIndex) => {
      element.dataset.position = elementIndex === index ? "active" : "inactive";
      element.setAttribute("aria-hidden", String(elementIndex !== index));
    });

    if (animate && previousIndex !== index) {
      readerImages[previousIndex].dataset.position = "exiting";
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

    showcase.style.setProperty("--theme-glow", books[index].glow);
    window.clearTimeout(exitTimer);
    positionReader(index, previousIndex, shouldAnimate);
    positionCovers(index, previousIndex, shouldAnimate);

    exitTimer = window.setTimeout(() => {
      [...readerImages, ...covers].forEach((element) => {
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

  new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    if (isVisible) startCycle();
    else stopCycle();
  }, { threshold: 0.2 }).observe(showcase);

  showSlide(0, false);
}
