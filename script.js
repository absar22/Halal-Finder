document.getElementById('product-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const input = document.getElementById('product-input').value.trim();
  const resultDiv = document.getElementById('result');
  const nameField = document.getElementById('product-name');
  const statusField = document.getElementById('halal-status');
  const imageField = document.getElementById('product-image');
  const ingredientsField = document.getElementById('ingredients');

  if (!input) return;

  resultDiv.classList.add('hidden');
  nameField.textContent = '';
  statusField.textContent = '';
  imageField.src = '';
  ingredientsField.textContent = '';

  try {
    let response;

    // Check if input is only digits without using RegEx
    let isBarcode = true;
    for (let i = 0; i < input.length; i++) {
      if (input[i] < '0' || input[i] > '9') {
        isBarcode = false;
        break;
      }
    }

    if (isBarcode) {
      response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${input}.json`);
    } else {
      response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(input)}&search_simple=1&action=process&json=1`);
    }

    const data = await response.json();
    let product;

    if (data.product) {
      product = data.product;
    } else if (data.products && data.products.length > 0) {
      product = data.products[0];
    } else {
      alert('Product not found!');
      return;
    }

    nameField.textContent = product.product_name || 'N/A';
    imageField.src = product.image_small_url || '';
    ingredientsField.textContent = product.ingredients_text || 'No ingredient info';

    const ingredients = (product.ingredients_text || '').toLowerCase();
    if (ingredients.includes('pork') || ingredients.includes('gelatin')) {
      statusField.textContent = 'Haram ❌';
      statusField.style.color = 'red';
    } else if (ingredients.includes('alcohol') || ingredients.includes('emulsifier') || ingredients.includes('flavouring')) {
      statusField.textContent = 'Doubtful ⚠️';
      statusField.style.color = 'orange';
    } else if (ingredients.trim() === '') {
      statusField.textContent = 'Unknown ❓';
      statusField.style.color = 'gray';
    } else {
      statusField.textContent = 'Halal ✅';
      statusField.style.color = 'green';
    }

    resultDiv.classList.remove('hidden');
  } catch (err) {
    console.error(err);
    alert('An error occurred while fetching product data.');
  }
});
