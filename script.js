const books = [
  {
    mode: "dark",
    backgroundColor: "#001c4a",
    textColor: "#FFDC03",
    coverColor: "#002D47",
    coverImage: "Covers/cover1.jpg",
    content:
      "The lamps along the old avenue woke one by one, each holding a little sun against the rain. Mara turned the page and found a note pressed flat as a leaf. The lamps along the old avenue woke one by one, each holding a little sun against the rain. Mara turned the page and found a note pressed flat as a leaf. The lamps along the old avenue woke one by one, each holding a little sun against the rain. Mara turned the page and found a note pressed flat as a leaf"
  },
  {
    mode: "dark",
    backgroundColor: "#150027",
    textColor: "#FF4BFF",
    coverColor: "#090011",
    coverImage: "Covers/cover2.jpg",
    content:
      "By morning the city had rearranged itself. Streets leaned into alleys, doors forgot their numbers, and every window reflected a harbor that was not there. By morning the city had rearranged itself. Streets leaned into alleys, doors forgot their numbers, and every window reflected a harbor that was not there. By morning the city had rearranged itself. Streets leaned into alleys, doors forgot their numbers, and every window reflected a harbor that was not there."
  },
  {
    mode: "dark",
    backgroundColor: "#580000",
    textColor: "#e9cd45",
    coverColor: "#8f73ad",
    coverImage: "",
    content:
      "There is a kind of attention that only arrives after midnight, when the world stops asking to be answered and begins, finally, to be read."
  }
];

const phone = document.querySelector("[data-phone]");
const readerText = document.querySelector("[data-reader-text]");
const cover = document.querySelector("[data-cover]");
const root = document.documentElement;

const siteThemes = {
  light: {
    siteInk: "#211d1a",
    siteMuted: "#74685f",
    siteAccent: "#2f766d",
    chromeBg: "rgb(255 250 242 / 48%)",
    chromeBorder: "rgb(255 255 255 / 52%)",
    chromeShadow: "rgb(59 43 27 / 16%)",
    brandMarkBg: "#8f563c"
  },
  dark: {
    siteInk: "#fbf7ef",
    siteMuted: "rgb(251 247 239 / 72%)",
    siteAccent: "#f0b878",
    chromeBg: "rgb(31 27 39 / 46%)",
    chromeBorder: "rgb(255 255 255 / 18%)",
    chromeShadow: "rgb(0 0 0 / 28%)",
    brandMarkBg: "#c36f47"
  }
};

let activeIndex = 0;
let cycleTimer;
let currentCoverState = {
  color: books[0].coverColor,
  image: books[0].coverImage
};
let currentReaderInk = books[0].textColor;

function hexToRgb(hexColor) {
  const hex = hexColor.replace("#", "");
  const value = Number.parseInt(hex.length === 3
    ? hex.split("").map((character) => character + character).join("")
    : hex, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function mixColors(firstColor, secondColor, firstWeight) {
  const first = hexToRgb(firstColor);
  const second = hexToRgb(secondColor);
  const secondWeight = 1 - firstWeight;

  return {
    r: Math.round(first.r * firstWeight + second.r * secondWeight),
    g: Math.round(first.g * firstWeight + second.g * secondWeight),
    b: Math.round(first.b * firstWeight + second.b * secondWeight)
  };
}

function rgbString(color, alpha = 1) {
  return `rgb(${color.r} ${color.g} ${color.b} / ${alpha})`;
}

function animatePassageSwap(previousText) {
  const easing = "cubic-bezier(0.22, 1, 0.36, 1)";
  const duration = 760;

  previousText.animate([
    { opacity: 1, transform: "translate3d(0, 0, 0)", filter: "blur(0)" },
    { opacity: 0, transform: "translate3d(-34px, 0, 0)", filter: "blur(5px)" }
  ], { duration, easing, fill: "forwards" }).finished
    .then(() => previousText.remove())
    .catch(() => previousText.remove());

  readerText.animate([
    { opacity: 0, transform: "translate3d(34px, 0, 0)", filter: "blur(5px)" },
    { opacity: 1, transform: "translate3d(0, 0, 0)", filter: "blur(0)" }
  ], { duration, easing, fill: "both" });
}

function renderCharacters(text, mode) {
  const shouldSwap = mode === "swap";
  const isInitial = mode === "initial";

  if (shouldSwap && readerText.textContent.trim()) {
    readerText.getAnimations().forEach((animation) => animation.cancel());
    const previousText = readerText.cloneNode(true);
    previousText.removeAttribute("data-reader-text");
    previousText.classList.remove("is-initial");
    previousText.style.color = currentReaderInk;
    readerText.before(previousText);
    animatePassageSwap(previousText);
  }

  readerText.classList.toggle("is-initial", isInitial);
  readerText.textContent = "";

  const fragment = document.createDocumentFragment();
  const words = text.split(" ");

  words.forEach((word, wordIndex) => {
    const wordSpan = document.createElement("span");
    wordSpan.className = "word";
    wordSpan.textContent = word;

    if (isInitial) {
      wordSpan.style.animationDelay = `${wordIndex * 10}ms`;
    }

    fragment.appendChild(wordSpan);

    if (wordIndex < words.length - 1) {
      fragment.append(" ");
    }
  });

  readerText.appendChild(fragment);
}

function setCoverArtwork(element, coverState) {
  element.style.setProperty("--cover-bg", coverState.color);
  element.style.setProperty("--cover-image", coverState.image ? `url("${coverState.image}")` : "none");
}

function renderCover(book, shouldAnimate) {
  const nextCoverState = {
    color: book.coverColor,
    image: book.coverImage
  };

  cover.getAnimations().forEach((animation) => animation.cancel());

  if (!shouldAnimate) {
    setCoverArtwork(cover, nextCoverState);
    currentCoverState = nextCoverState;
    return;
  }

  const previousCover = cover.cloneNode(true);
  previousCover.removeAttribute("data-cover");
  setCoverArtwork(previousCover, currentCoverState);
  cover.before(previousCover);

  setCoverArtwork(cover, nextCoverState);
  currentCoverState = nextCoverState;

  const easing = "cubic-bezier(0.22, 1, 0.36, 1)";
  const duration = 860;

  previousCover.animate([
    { opacity: 0.98, transform: "translate3d(0, 0, 0) scale(1)", filter: "blur(0)" },
    { opacity: 0, transform: "translate3d(-58px, 0, 0) scale(0.992)", filter: "blur(7px)" }
  ], { duration, easing, fill: "forwards" }).finished
    .then(() => previousCover.remove())
    .catch(() => previousCover.remove());

  cover.animate([
    { opacity: 0, transform: "translate3d(58px, 0, 0) scale(0.992)", filter: "blur(7px)" },
    { opacity: 0.98, transform: "translate3d(0, 0, 0) scale(1)", filter: "blur(0)" }
  ], { duration, easing, fill: "both" });
}

function updatePageFade() {
  const coverBottom = cover.getBoundingClientRect().bottom + window.scrollY;
  const phoneBottom = phone.getBoundingClientRect().bottom + window.scrollY;
  const deviceBottom = Math.max(phoneBottom, coverBottom);

  if (!deviceBottom) {
    return;
  }

  root.style.setProperty("--page-fade-start", `${deviceBottom + 120}px`);
  root.style.setProperty("--page-fade-end", `${deviceBottom + 460}px`);
}

function renderBook(index, options = {}) {
  const book = books[index];
  const shouldAnimate = options.animate !== false;
  const theme = siteThemes[book.mode] || siteThemes.light;
  const pageBackground = `color-mix(in srgb, ${book.backgroundColor} 78%, #000 22%)`;
  const deviceGlow = mixColors(book.textColor, book.backgroundColor, 0.68);

  root.style.setProperty("--shell", pageBackground);
  root.style.setProperty("--device-glow", rgbString(deviceGlow));
  root.style.setProperty("--device-glow-soft", rgbString(deviceGlow, 0.22));
  root.style.setProperty("--device-glow-core", rgbString(deviceGlow, 0.32));
  root.style.setProperty("--site-ink", theme.siteInk);
  root.style.setProperty("--site-muted", theme.siteMuted);
  root.style.setProperty("--site-accent", theme.siteAccent);
  root.style.setProperty("--chrome-bg", theme.chromeBg);
  root.style.setProperty("--chrome-border", theme.chromeBorder);
  root.style.setProperty("--chrome-shadow", theme.chromeShadow);
  root.style.setProperty("--brand-mark-bg", theme.brandMarkBg);
  phone.style.setProperty("--reader-bg", book.backgroundColor);
  phone.style.setProperty("--reader-ink", book.textColor);

  renderCover(book, shouldAnimate);
  renderCharacters(book.content, shouldAnimate ? "swap" : "initial");
  currentReaderInk = book.textColor;
}

function scheduleCycle() {
  cycleTimer = window.setInterval(() => {
    activeIndex = (activeIndex + 1) % books.length;
    renderBook(activeIndex);
  }, 5600);
}

renderBook(activeIndex, { animate: false });
updatePageFade();

window.addEventListener("resize", updatePageFade);

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  scheduleCycle();
} else {
  window.clearInterval(cycleTimer);
}
