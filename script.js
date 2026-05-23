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

function renderCharacters(text) {
  readerText.textContent = "";

  const fragment = document.createDocumentFragment();
  let characterIndex = 0;
  const words = text.split(" ");

  words.forEach((word, wordIndex) => {
    const wordSpan = document.createElement("span");
    wordSpan.className = "word";

    [...word].forEach((character) => {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = character;
      span.style.animationDelay = `${Math.min(characterIndex * 4, 520)}ms`;
      wordSpan.appendChild(span);
      characterIndex += 1;
    });

    fragment.appendChild(wordSpan);

    if (wordIndex < words.length - 1) {
      fragment.append(" ");
      characterIndex += 1;
    }
  });

  readerText.appendChild(fragment);
}

function renderBook(index) {
  const book = books[index];
  const theme = siteThemes[book.mode] || siteThemes.light;
  const pageBackground = `color-mix(in srgb, ${book.backgroundColor} 78%, #000 22%)`;
  const deviceGlow = `color-mix(in srgb, ${book.backgroundColor} 62%, #fff 38%)`;

  root.style.setProperty("--shell", pageBackground);
  root.style.setProperty("--device-glow", deviceGlow);
  root.style.setProperty("--site-ink", theme.siteInk);
  root.style.setProperty("--site-muted", theme.siteMuted);
  root.style.setProperty("--site-accent", theme.siteAccent);
  root.style.setProperty("--chrome-bg", theme.chromeBg);
  root.style.setProperty("--chrome-border", theme.chromeBorder);
  root.style.setProperty("--chrome-shadow", theme.chromeShadow);
  root.style.setProperty("--brand-mark-bg", theme.brandMarkBg);
  phone.style.setProperty("--reader-bg", book.backgroundColor);
  phone.style.setProperty("--reader-ink", book.textColor);
  cover.style.setProperty("--cover-bg", book.coverColor);
  cover.style.setProperty("--cover-image", book.coverImage ? `url("${book.coverImage}")` : "none");

  cover.classList.remove("is-changing");
  void cover.offsetWidth;
  cover.classList.add("is-changing");

  renderCharacters(book.content);
}

function scheduleCycle() {
  cycleTimer = window.setInterval(() => {
    activeIndex = (activeIndex + 1) % books.length;
    renderBook(activeIndex);
  }, 5600);
}

renderBook(activeIndex);

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  scheduleCycle();
} else {
  window.clearInterval(cycleTimer);
}
