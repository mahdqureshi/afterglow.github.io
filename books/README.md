# Books

Each folder is one carousel item:

```text
books/
  catalog.js                 # the carousel order, asset paths, and glow color
  your-book-id/
    reader.png               # the full reading-screen image
    cover.jpg                # the matching book cover
```

To add a book:

1. Duplicate one of the existing book folders and give it a short lowercase name, such as `books/the-dispossessed/`.
2. Replace `reader.png` and `cover.jpg` with your final assets. Other image formats are fine—update the extension in `catalog.js`.
3. Add one entry to `catalog.js`. Set `glow` with OKLCH, for example `oklch(0.68 0.19 285)`. The first value is lightness, the second is chroma, and the third is hue.

The order in `catalog.js` is the cycle order.
