const showcase = document.querySelector("[data-reader-showcase]");
const books = window.AfterglowBooks || [];

if (showcase && books.length) {
  const readerDevice = showcase.querySelector("[data-reader-device]");
  const bookRail = showcase.querySelector("[data-book-rail]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const readerImages = books.map((book, index) => {
    const image = document.createElement("img");
    image.className = "reader-image";
    image.dataset.src = book.screen;
    image.alt = `${book.title} reading view`;
    image.width = 1074;
    image.height = 2328;
    image.decoding = "async";
    image.loading = index === 0 ? "eager" : "lazy";
    image.fetchPriority = index === 0 ? "high" : "low";
    image.dataset.position = index === 0 ? "active" : "inactive";
    image.setAttribute("aria-hidden", String(index !== 0));
    readerDevice.append(image);
    return image;
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

  function hydrateBook(index) {
    const readerImage = readerImages[index];
    const coverArtwork = coverArtworks[index];

    if (!readerImage.src) readerImage.src = readerImage.dataset.src;
    if (!coverArtwork.style.getPropertyValue("--cover-image")) {
      coverArtwork.style.setProperty("--cover-image", coverArtwork.dataset.coverImage);
    }
  }

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

    hydrateBook(index);
    hydrateBook((index + 1) % books.length);
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
