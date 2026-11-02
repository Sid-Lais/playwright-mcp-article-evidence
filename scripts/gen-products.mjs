// Generates pages/products.html: 60 cards, each with image, price, size picker, Add to cart, details link.
import { writeFileSync } from 'node:fs';
const cards = [];
for (let n = 1; n <= 60; n++) {
  const price = `$${40 + n}.99`; // card 3 => $43.99
  cards.push(`    <li class="card">
      <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="Trail Shoe Model ${n}">
      <h2>Trail Shoe Model ${n}</h2>
      <p class="price">${price}</p>
      <label>Size <select aria-label="Size for Trail Shoe Model ${n}"><option>8</option><option>9</option><option>10</option></select></label>
      <button type="button">Add to cart</button>
      <a href="/p/${n}">Details</a>
    </li>`);
}
writeFileSync(new URL('../pages/products.html', import.meta.url),
`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Products</title></head>
<body><main><h1>Products</h1>
  <ul>
${cards.join('\n')}
  </ul>
</main></body></html>
`);
