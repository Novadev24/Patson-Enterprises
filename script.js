// Sample Data
const products = [
  { id:1, name:"3-Seater Sofa (New)", category:"Furniture", price:45000, oldPrice:55000, image:"https://images.unsplash.com/photo-1555041469-1b7f41e3c283?q=80&w=800", desc:"Italian leather, brand new with warranty" },
  { id:2, name:"Toyota Premio 2018", category:"Cars", price:1850000, image:"https://images.unsplash.com/photo-1549317661-bd6c2d8d5455?q=80&w=800", desc:"Low mileage, accident free, original paint" },
  { id:3, name:"Prime Plot - Kitengela 1/8 Acre", category:"Land", price:3500000, image:"https://images.unsplash.com/photo-1592595896551-12b371d546d5?q=80&w=800", desc:"Ready title deed, near tarmac" },
  { id:4, name:"TVS Apache RTR 200", category:"Motorbikes", price:185000, image:"https://images.unsplash.com/photo-1558981806-69904c9d2f01?q=80&w=800", desc:"2023 model, logbook ready" },
  { id:5, name:"Samsung 55\" 4K Smart TV", category:"Electronics", price:68000, oldPrice:85000, image:"https://images.unsplash.com/photo-1593359677879-a4bb7f2a1a2c?q=80&w=800", desc:"Brand new sealed" },
  // Add more...
];

let cart = JSON.parse(localStorage.getItem("patsonCart")) || [];

function renderProducts(filter = "all", search = "") {
  const grid = document.getElementById("product-grid");
  let filtered = products;
  if (filter !== "all") filtered = products.filter(p => p.category === filter);
  if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  
  grid.innerHTML = filtered.map(p => `
    <div class="product-card" data-id="${p.id}">
      ${p.oldPrice ? `<div class="ribbon">SALE</div>` : ''}
      <div class="product-img"><img src="${p.image}" alt="${p.name}"></div>
      <div class="product-info">
        <h3 class="product-title">${p.name}</h3>
        <p style="color:#666; margin:0.5rem 0;">${p.desc}</p>
        <div class="product-price">
          KSh ${p.price.toLocaleString()}
          ${p.oldPrice ? `<span class="old-price">KSh ${p.oldPrice.toLocaleString()}</span>` : ''}
        </div>
        <button class="add-to-cart">Add to Cart</button>
      </div>
    </div>
  `).join("");

  attachProductEvents();
}

function attachProductEvents() {
  document.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.classList.contains("add-to-cart")) return;
      const id = card.dataset.id;
      const product = products.find(p => p.id == id);
      showModal(product);
    });
  });

  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.closest(".product-card").dataset.id;
      addToCart(id);
    });
  });
}

function addToCart(id) {
  const item = products.find(p => p.id == id);
  const existing = cart.find(c => c.id == id);
  if (existing) existing.qty++;
  else cart.push({ ...item, qty: 1 });
  saveCart();
  updateCartBadge();
  renderCart();
}

function showModal(product) {
  const modal = document.getElementById("detail-modal");
  const body = document.getElementById("modal-body");
  body.innerHTML = `
    <div class="modal-media">
      <img src="${product.image}" alt="${product.name}">
    </div>
    <div class="modal-details">
      <h2>${product.name}</h2>
      <p><strong>Category:</strong> ${product.category}</p>
      <p>${product.desc}</p>
      <div class="modal-price">KSh ${product.price.toLocaleString()}</div>
      <button class="add-to-cart btn-primary" style="margin-top:1rem; padding:14px 30px;">Add to Cart</button>
      <p style="margin-top:2rem;"><a href="https://wa.me/+254700000000?text=Hi,%20I'm%20interested%20in%20${encodeURIComponent(product.name)}" target="_blank"><i class="fab fa-whatsapp"></i> Chat on WhatsApp</a></p>
    </div>
  `;
  modal.style.display = "flex";

  body.querySelector(".add-to-cart").addEventListener("click", () => addToCart(product.id));
}

// Cart Functions
function renderCart() {
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  
  if (cart.length === 0) {
    container.innerHTML = "<p style='text-align:center; padding:2rem;'>Your cart is empty</p>";
    totalEl.textContent = "0";
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>KSh ${item.price.toLocaleString()} × ${item.qty}</p>
      </div>
      <div class="cart-item-price">KSh ${(item.price * item.qty).toLocaleString()}</div>
      <div class="qty-controls">
        <button class="qty-btn" data-id="${item.id}" data-change="-1">-</button>
        <span>${item.qty}</span>
        <button class="qty-btn" data-id="${item.id}" data-change="1">+</button>
        <i class="fas fa-trash remove-item" data-id="${item.id}"></i>
      </div>
    </div>
  `).join("");

  totalEl.textContent = cart.reduce((sum, i) => sum + i.price * i.qty, 0).toLocaleString();

  // Attach quantity & remove events
  document.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const change = parseInt(btn.dataset.change);
      const item = cart.find(c => c.id == id);
      item.qty += change;
      if (item.qty <= 0) removeFromCart(id);
      else saveCart();
      renderCart();
      updateCartBadge();
    });
  });

  document.querySelectorAll(".remove-item").forEach(icon => {
    icon.addEventListener("click", () => removeFromCart(icon.dataset.id));
  });
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id != id);
  saveCart();
  renderCart();
  updateCartBadge();
}

function saveCart() {
  localStorage.setItem("patsonCart", JSON.stringify(cart));
}

function updateCartBadge() {
  const badge = document.querySelector(".cart-badge");
  const total = cart.reduce((s,i) => s + i.qty, 0);
  badge.textContent = total;
}

// Event Listeners
document.getElementById("open-cart").addEventListener("click", () => {
  document.getElementById("cart-modal").style.display = "flex";
  renderCart();
});

document.getElementById("close-cart").addEventListener("click", () => {
  document.getElementById("cart-modal").style.display = "none";
});

document.getElementById("clear-cart").addEventListener("click", () => {
  cart = [];
  saveCart();
  renderCart();
  updateCartBadge();
});

// Close modals on outside click
window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none";
  }
});

// Mobile menu, categories, search, FAQ (same as before)
document.getElementById("menu-open-button").addEventListener("click", () => {
  document.getElementById("nav-menu").classList.add("active");
});
document.getElementById("menu-close-button").addEventListener("click", () => {
  document.getElementById("nav-menu").classList.remove("active");
});

document.querySelectorAll(".category-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts(btn.dataset.category);
  });
});

document.getElementById("search-input").addEventListener("input", (e) => {
  renderProducts(document.querySelector(".category-btn.active").dataset.category, e.target.value);
});

document.querySelectorAll(".faq-question").forEach(q => {
  q.addEventListener("click", () => {
    q.parentElement.classList.toggle("active");
  });
});

document.querySelector(".close-btn").addEventListener("click", () => {
  document.getElementById("detail-modal").style.display = "none";
});

// Contact form (basic alert for demo)
document.getElementById("contact-form").addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Thank you! We will contact you shortly via WhatsApp or phone.");
  e.target.reset();
});

// Init
renderProducts();
updateCartBadge();
renderCart();