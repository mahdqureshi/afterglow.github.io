const books = [
  {
    mode: "dark",
    backgroundColor: "#001c4a",
    textColor: "#8fb9ff",
    coverColor: "#c9663d",
    coverImage: "",
    content:
      "The lamps along the old avenue woke one by one, each holding a little sun against the rain. Mara turned the page and found a note pressed flat as a leaf. The lamps along the old avenue woke one by one, each holding a little sun against the rain. Mara turned the page and found a note pressed flat as a leaf. The lamps along the old avenue woke one by one, each holding a little sun against the rain. Mara turned the page and found a note pressed flat as a leaf"
  },
  {
    mode: "dark",
    backgroundColor: "#420000",
    textColor: "#bf9a11",
    coverColor: "#427f78",
    coverImage: "",
    content:
      "By morning the city had rearranged itself. Streets leaned into alleys, doors forgot their numbers, and every window reflected a harbor that was not there. By morning the city had rearranged itself. Streets leaned into alleys, doors forgot their numbers, and every window reflected a harbor that was not there. By morning the city had rearranged itself. Streets leaned into alleys, doors forgot their numbers, and every window reflected a harbor that was not there."
  },
  {
    mode: "dark",
    backgroundColor: "#221d2e",
    textColor: "#f5ecff",
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

function renderCharacters(text, shouldAnimate) {
  if (shouldAnimate && readerText.textContent.trim()) {
    const previousText = readerText.cloneNode(true);
    previousText.removeAttribute("data-reader-text");
    previousText.classList.remove("is-entering");
    previousText.classList.add("is-leaving");
    previousText.style.color = currentReaderInk;
    readerText.before(previousText);
    previousText.addEventListener("animationend", () => previousText.remove(), { once: true });
  }

  readerText.classList.remove("is-entering");
  readerText.textContent = "";

  const fragment = document.createDocumentFragment();
  const words = text.split(" ");

  words.forEach((word, wordIndex) => {
    const wordSpan = document.createElement("span");
    wordSpan.className = "word";
    wordSpan.textContent = word;
    wordSpan.style.animationDelay = `${wordIndex * 10}ms`;

    fragment.appendChild(wordSpan);

    if (wordIndex < words.length - 1) {
      fragment.append(" ");
    }
  });

  readerText.appendChild(fragment);

  if (shouldAnimate) {
    void readerText.offsetWidth;
    readerText.classList.add("is-entering");
  }
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

  cover.classList.remove("is-entering");

  if (shouldAnimate) {
    const previousCover = cover.cloneNode(true);
    previousCover.removeAttribute("data-cover");
    previousCover.classList.remove("is-entering");
    previousCover.classList.add("is-leaving");
    setCoverArtwork(previousCover, currentCoverState);
    cover.before(previousCover);
    previousCover.addEventListener("animationend", () => previousCover.remove(), { once: true });
  }

  setCoverArtwork(cover, nextCoverState);
  currentCoverState = nextCoverState;

  if (shouldAnimate) {
    void cover.offsetWidth;
    cover.classList.add("is-entering");
  }
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
  renderCharacters(book.content, shouldAnimate);
  currentReaderInk = book.textColor;
}

function scheduleCycle() {
  cycleTimer = window.setInterval(() => {
    activeIndex = (activeIndex + 1) % books.length;
    renderBook(activeIndex);
  }, 5600);
}

renderBook(activeIndex, { animate: false });

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  scheduleCycle();
} else {
  window.clearInterval(cycleTimer);
}
