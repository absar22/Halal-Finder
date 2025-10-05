# HalalScan Pro

Quick tool to check if products are halal by scanning barcodes or searching product names.

![HalalScan Screenshot](screenshot.png)

## What it does

- Search products by barcode or name
- Shows if it's Halal ✅, Haram ❌, or Doubtful ⚠️
- Lists all ingredients with flags
- Keeps history of your searches

## How to use

1. Open the HTML file in your browser
2. Type a barcode (like 737628064502) or product name
3. Hit Check
4. See the results

That's it.

## What gets flagged

**Haram stuff:** pork, gelatin, lard, bacon, ham

**Doubtful stuff:** alcohol, wine, certain emulsifiers (E471-E477), glycerin, some flavorings

If any haram ingredient is found = Haram status
If only doubtful ingredients = Doubtful status
If nothing suspicious = Halal status

## Tech stuff

Just HTML, CSS, and JavaScript. No frameworks needed.

Uses the Open Food Facts API to get product info: https://world.openfoodfacts.org/

Works on phones and desktops.

## Important

This is just a helper tool. Always:
- Check for official halal certifications on the package
- Ask your local imam if unsure
- Contact the manufacturer for details

The app only checks ingredient names, not where they come from. Gelatin could be from fish or pork - we can't tell the difference.

## Issues

- Needs internet to work
- Only as good as the Open Food Facts database
- Some products might not be listed
- History clears when you close the page

## Adding more ingredients

Edit these lines in the code:

```javascript
const haramIngredients = ['pork', 'gelatin', ...];
const doubtfulIngredients = ['alcohol', 'emulsifier', ...];
```

## Want to help?

Found a bug? Product not working? Ingredient missing? Just let me know.

---

Made for Muslims trying to eat halal. Hope it helps.