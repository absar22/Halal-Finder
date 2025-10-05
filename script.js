 
    let searchHistory = [];

    // Load history from memory
    function loadHistory() {
      const historySection = document.getElementById('history-section');
      const historyList = document.getElementById('history-list');
      
      if (searchHistory.length === 0) {
        historySection.classList.add('hidden');
        return;
      }

      historySection.classList.remove('hidden');
      historyList.innerHTML = '';

      searchHistory.slice(-5).reverse().forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
          <img src="${item.image || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22><rect width=%2250%22 height=%2250%22 fill=%22%23ddd%22/></svg>'}" class="history-img" alt="${item.name}" />
          <div class="history-info">
            <div class="history-name">${item.name}</div>
            <div class="history-time">${item.time}</div>
          </div>
          <div>${item.statusEmoji}</div>
        `;
        historyItem.addEventListener('click', () => {
          document.getElementById('product-input').value = item.barcode || item.name;
          document.getElementById('product-form').dispatchEvent(new Event('submit'));
        });
        historyList.appendChild(historyItem);
      });
    }

    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        const type = this.dataset.tab;
        const input = document.getElementById('product-input');
        if (type === 'barcode') {
          input.placeholder = 'Enter barcode number...';
        } else {
          input.placeholder = 'Enter product name...';
        }
      });
    });

    // Clear history
    document.getElementById('clear-history').addEventListener('click', () => {
      searchHistory = [];
      loadHistory();
    });

    // Problematic ingredients database
    const haramIngredients = ['pork', 'gelatin', 'gelatine', 'lard', 'bacon', 'ham', 'pepperoni', 'prosciutto'];
    const doubtfulIngredients = ['alcohol', 'wine', 'beer', 'emulsifier', 'e471', 'e472', 'e473', 'e474', 'e475', 'e476', 'e477', 'flavouring', 'glycerin', 'glycerol', 'mono-diglycerides', 'monoglycerides', 'diglycerides'];

    function analyzeIngredients(ingredientsText) {
      if (!ingredientsText) return { status: 'unknown', details: [] };
      
      const ingredients = ingredientsText.toLowerCase().split(',').map(i => i.trim());
      const details = [];
      let status = 'halal';

      ingredients.forEach(ingredient => {
        const item = { name: ingredient, flag: 'safe' };
        
        for (const haram of haramIngredients) {
          if (ingredient.includes(haram)) {
            item.flag = 'haram';
            status = 'haram';
            break;
          }
        }
        
        if (item.flag === 'safe' && status !== 'haram') {
          for (const doubtful of doubtfulIngredients) {
            if (ingredient.includes(doubtful)) {
              item.flag = 'doubtful';
              if (status !== 'haram') status = 'doubtful';
              break;
            }
          }
        }
        
        details.push(item);
      });

      return { status, details };
    }

    document.getElementById('product-form').addEventListener('submit', async function (e) {
      e.preventDefault();

      const input = document.getElementById('product-input').value.trim();
      const resultDiv = document.getElementById('result');
      const loadingDiv = document.getElementById('loading');

      if (!input) return;

      resultDiv.classList.add('hidden');
      loadingDiv.classList.remove('hidden');

      try {
        let response;
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
          alert('Product not found! Try a different barcode or product name.');
          loadingDiv.classList.add('hidden');
          return;
        }

        // Display product information
        document.getElementById('product-name').textContent = product.product_name || 'Unknown Product';
        document.getElementById('product-image').src = product.image_small_url || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><rect width=%22120%22 height=%22120%22 fill=%22%23ddd%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-size=%2220%22>No Image</text></svg>';
        
        // Nutri-score
        document.getElementById('nutriscore').textContent = (product.nutriscore_grade || 'N/A').toUpperCase();
        
        // Analyze ingredients
        const ingredientsText = product.ingredients_text || '';
        const analysis = analyzeIngredients(ingredientsText);
        
        document.getElementById('ingredients-count').textContent = analysis.details.length || 0;

        // Display status
        const statusDiv = document.getElementById('halal-status');
        let statusClass = '';
        let statusText = '';
        let statusEmoji = '';

        if (analysis.status === 'haram') {
          statusClass = 'status-haram';
          statusText = 'Haram ❌';
          statusEmoji = '❌';
        } else if (analysis.status === 'doubtful') {
          statusClass = 'status-doubtful';
          statusText = 'Doubtful ⚠️';
          statusEmoji = '⚠️';
        } else if (analysis.status === 'unknown' || ingredientsText.trim() === '') {
          statusClass = 'status-unknown';
          statusText = 'Unknown ❓';
          statusEmoji = '❓';
        } else {
          statusClass = 'status-halal';
          statusText = 'Halal ✅';
          statusEmoji = '✅';
        }

        statusDiv.innerHTML = `<span class="status-badge ${statusClass}">${statusText}</span>`;

        // Display ingredients list
        const ingredientsList = document.getElementById('ingredients-list');
        ingredientsList.innerHTML = '';
        
        if (analysis.details.length > 0) {
          analysis.details.forEach(item => {
            const li = document.createElement('li');
            li.className = `ingredient-item ${item.flag === 'haram' || item.flag === 'doubtful' ? 'warning' : 'safe'}`;
            li.innerHTML = `${item.name} ${item.flag === 'haram' ? '❌' : item.flag === 'doubtful' ? '⚠️' : '✓'}`;
            ingredientsList.appendChild(li);
          });
        } else {
          ingredientsList.innerHTML = '<li class="ingredient-item">No ingredient information available</li>';
        }

        // Additional info
        const additionalInfo = document.getElementById('additional-info');
        additionalInfo.innerHTML = `
          <p><strong>Brand:</strong> ${product.brands || 'N/A'}</p>
          <p><strong>Categories:</strong> ${product.categories || 'N/A'}</p>
          <p><strong>Countries:</strong> ${product.countries || 'N/A'}</p>
        `;

        // Add to history
        searchHistory.push({
          name: product.product_name || 'Unknown',
          barcode: product.code || input,
          image: product.image_small_url,
          statusEmoji: statusEmoji,
          time: new Date().toLocaleTimeString()
        });

        loadHistory();
        loadingDiv.classList.add('hidden');
        resultDiv.classList.remove('hidden');

      } catch (err) {
        console.error(err);
        alert('An error occurred while fetching product data. Please try again.');
        loadingDiv.classList.add('hidden');
      }
    });

    // Load history on page load
    loadHistory();
  

