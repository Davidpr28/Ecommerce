// Variables globales para almacenar productos y carrito
let products = [];
let cart = [];
let selectedProduct = null;

// Función para formatear números a moneda
function formatCurrency(num) {
  return num.toFixed(2);
}

// Función para actualizar la notificación del carrito
function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  document.getElementById('cart-count').innerText = count;
}

// Función para actualizar el contenido del carrito en el modal
function renderCart() {
  const cartItemsContainer = document.getElementById('cart-items');
  cartItemsContainer.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('d-flex', 'justify-content-between', 'border-bottom', 'py-2');
    div.innerHTML = `<span>${item.product.title} x ${item.quantity}</span><span>$${formatCurrency(item.product.price * item.quantity)}</span>`;
    cartItemsContainer.appendChild(div);
    total += item.product.price * item.quantity;
  });
  document.getElementById('cart-total').innerText = formatCurrency(total);
}

// Función para generar las tarjetas de productos
function renderProducts(filteredProducts = products) {
  const container = document.getElementById('product-container');
  container.innerHTML = '';
  filteredProducts.forEach(product => {
    const col = document.createElement('div');
    col.className = 'col-md-4 col-sm-6 mb-4';
    col.innerHTML = `
      <div class="card h-100">
        <img src="${product.image}" class="card-img-top" alt="${product.title}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${product.title}</h5>
          <p class="card-text">$${formatCurrency(product.price)}</p>
          <button class="btn btn-primary mt-auto add-to-cart-btn" data-product-id="${product.id}">
            Añadir al carrito
          </button>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

// Función para cargar productos desde la FakeStore API
function loadProducts() {
  fetch('https://fakestoreapi.com/products')
    .then(res => res.json())
    .then(data => {
      products = data;
      renderProducts();
    })
    .catch(err => console.error('Error al cargar productos:', err));
}

// Evento para capturar clic en "Añadir al carrito"
document.addEventListener('click', function(e) {
  if(e.target && e.target.classList.contains('add-to-cart-btn')) {
    const productId = e.target.getAttribute('data-product-id');
    selectedProduct = products.find(p => p.id == productId);
    // Abrir modal para seleccionar cantidad
    $('#quantityModal').modal('show');
  }
});

// Evento para confirmar cantidad y agregar al carrito
document.getElementById('add-to-cart-confirm').addEventListener('click', function() {
  const quantity = parseInt(document.getElementById('quantity-input').value);
  if(selectedProduct && quantity > 0) {
    // Verificar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.product.id === selectedProduct.id);
    if(existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ product: selectedProduct, quantity });
    }
    updateCartCount();
    renderCart();
    // Resetear el input de cantidad
    document.getElementById('quantity-input').value = 1;
  }
});

// Función para filtrar productos en base al input de búsqueda
document.getElementById('search-input').addEventListener('input', function(e) {
  const searchTerm = e.target.value.toLowerCase();
  const filtered = products.filter(product => {
    return product.title.toLowerCase().includes(searchTerm) || product.category.toLowerCase().includes(searchTerm);
  });
  renderProducts(filtered);
});

// Evento para el formulario de pago y generación de factura PDF
document.getElementById('payment-form').addEventListener('submit', function(e) {
  e.preventDefault();
  // Capturar datos del formulario
  const payerName = document.getElementById('payer-name').value;
  const cardNumber = document.getElementById('card-number').value;
  const cardExpiration = document.getElementById('card-expiration').value;
  const cardCVV = document.getElementById('card-cvv').value;
  
  // Calcular total de la compra
  let total = 0;
  cart.forEach(item => {
    total += item.product.price * item.quantity;
  });
  
  // Crear PDF con jsPDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Factura de Compra', 20, 20);
  doc.setFontSize(12);
  doc.text(`Nombre: ${payerName}`, 20, 30);
  doc.text(`Tarjeta: ${cardNumber}`, 20, 40);
  doc.text(`Expiración: ${cardExpiration}  CVV: ${cardCVV}`, 20, 50);
  doc.text('Detalle de productos:', 20, 60);
  let yPos = 70;
  cart.forEach(item => {
    const line = `${item.product.title} x ${item.quantity} - $${formatCurrency(item.product.price * item.quantity)}`;
    doc.text(line, 20, yPos);
    yPos += 10;
  });
  doc.text(`Total: $${formatCurrency(total)}`, 20, yPos + 10);
  // Guardar PDF
  doc.save('factura.pdf');
  // Reiniciar el carrito
  cart = [];
  updateCartCount();
  renderCart();
  // Resetear formulario de pago
  document.getElementById('payment-form').reset();
  // Mostrar mensaje de éxito
  alert('¡Compra exitosa! Se ha generado tu factura en PDF.');
});

// Cargar productos al iniciar la página
document.addEventListener('DOMContentLoaded', loadProducts);
