// ============================================================
// WALBOT - MAIN JAVASCRIPT
// ============================================================

// MOBILE HAMBURGER MENU
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('nav ul');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
        navMenu.classList.toggle('open');
        this.classList.toggle('active');
        this.setAttribute('aria-expanded', navMenu.classList.contains('open'));
    });

    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    document.addEventListener('click', e => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('open');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// ACTIVE PAGE HIGHLIGHT
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('nav a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
    }
});

// FAQ ACCORDION
const accordionBtns = document.querySelectorAll('.accordion-btn');
accordionBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        const content = this.nextElementSibling;
        const isOpen = this.classList.contains('active');

        accordionBtns.forEach(other => {
            if (other !== btn) {
                other.classList.remove('active');
                if (other.nextElementSibling) {
                    other.nextElementSibling.classList.remove('active');
                }
            }
        });

        this.classList.toggle('active', !isOpen);
        if (content) content.classList.toggle('active', !isOpen);
    });
});

// LIGHTBOX
function openLightbox(img) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    if (lightbox && lightboxImg) {
        lightbox.style.display = 'block';
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
});

// PRODUCT SEARCH, FILTER & SORT
const searchInput = document.getElementById('productSearch');
const categoryFilter = document.getElementById('categoryFilter');
const sortSelect = document.getElementById('sortProducts');
const productGrid = document.getElementById('productGrid');

function filterProducts() {
    if (!productGrid) return;

    const cards = Array.from(productGrid.querySelectorAll('.product-card'));
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
    const sortValue = sortSelect ? sortSelect.value : 'name';

    cards.forEach(card => {
        const name = (card.dataset.name || '').toLowerCase();
        const category = card.dataset.category || '';
        const matchesSearch = name.includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
        card.style.display = (matchesSearch && matchesCategory) ? 'block' : 'none';
    });

    const visibleCards = cards.filter(c => c.style.display !== 'none');
    visibleCards.sort((a, b) => {
        const priceA = parseFloat(a.dataset.price) || 0;
        const priceB = parseFloat(b.dataset.price) || 0;
        const nameA = (a.dataset.name || '').toLowerCase();
        const nameB = (b.dataset.name || '').toLowerCase();

        if (sortValue === 'price-low') return priceA - priceB;
        if (sortValue === 'price-high') return priceB - priceA;
        return nameA.localeCompare(nameB);
    });

    visibleCards.forEach(card => productGrid.appendChild(card));
}

if (searchInput) searchInput.addEventListener('keyup', filterProducts);
if (categoryFilter) categoryFilter.addEventListener('change', filterProducts);
if (sortSelect) sortSelect.addEventListener('change', filterProducts);

// SHOPPING CART
let cart = [];

function addToCart(productName, price) {
    const existing = cart.find(item => item.name === productName);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ name: productName, price: parseFloat(price), quantity: 1 });
    }
    renderCart();
    showToast(productName + ' added to cart');
}

function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    renderCart();
}

function updateQuantity(productName, change) {
    const item = cart.find(i => i.name === productName);
    if (!item) return;
    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(productName);
    } else {
        renderCart();
    }
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    if (!cartItems || !cartTotal) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotal.textContent = '0';
        return;
    }

    let html = '';
    let total = 0;
    cart.forEach(item => {
        const lineTotal = item.price * item.quantity;
        total += lineTotal;
        html += `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong><br>
                    <small>R${item.price} x ${item.quantity}</small>
                </div>
                <div style="display:flex;gap:0.5rem;align-items:center;">
                    <button class="qty-btn" onclick="updateQuantity('${item.name}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity('${item.name}', 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart('${item.name}')">X</button>
                </div>
            </div>
        `;
    });
    cartItems.innerHTML = html;
    cartTotal.textContent = total;
}

function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty.');
        return;
    }
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    showToast(`Order placed! ${count} item(s) for R${total}.`);
    cart = [];
    renderCart();
}

document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', function () {
        const product = this.dataset.product;
        const price = this.dataset.price;
        if (product && price) addToCart(product, price);
    });
});

// ENQUIRY FORM VALIDATION
function handleEnquiry(event) {
    event.preventDefault();

    const nameField = document.getElementById('enquiryName');
    const emailField = document.getElementById('enquiryEmail');
    const phoneField = document.getElementById('enquiryPhone');
    const typeField = document.getElementById('enquiryType');
    const messageField = document.getElementById('enquiryMessage');

    if (!nameField) return;

    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const phone = phoneField ? phoneField.value.trim() : '';
    const type = typeField ? typeField.value : '';
    const message = messageField.value.trim();

    let isValid = true;

    if (name.length < 3) {
        document.getElementById('enquiryNameError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('enquiryNameError').style.display = 'none';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('enquiryEmailError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('enquiryEmailError').style.display = 'none';
    }

    if (phone && !/^[0-9]{10}$/.test(phone)) {
        document.getElementById('enquiryPhoneError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('enquiryPhoneError').style.display = 'none';
    }

    if (!type) {
        isValid = false;
        showToast('Please select an enquiry type.');
    }

    if (message.length < 10) {
        document.getElementById('enquiryMessageError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('enquiryMessageError').style.display = 'none';
    }

    if (isValid) {
        const response = document.getElementById('enquiryResponse');
        response.style.display = 'block';
        response.innerHTML = `
            <h3>Thank you, ${name}!</h3>
            <p>Your enquiry about <strong>${type}</strong> has been received.</p>
            <p>We'll reply to <strong>${email}</strong> within 24 hours.</p>
        `;
        document.getElementById('enquiryForm').reset();
        response.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// CONTACT FORM VALIDATION
function handleContact(event) {
    event.preventDefault();

    const nameField = document.getElementById('contactName');
    const emailField = document.getElementById('contactEmail');
    const phoneField = document.getElementById('contactPhone');
    const subjectField = document.getElementById('contactSubject');
    const messageField = document.getElementById('contactMessage');

    if (!nameField) return;

    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const phone = phoneField ? phoneField.value.trim() : '';
    const subject = subjectField ? subjectField.value : '';
    const message = messageField.value.trim();

    let isValid = true;

    if (name.length < 3) {
        document.getElementById('contactNameError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('contactNameError').style.display = 'none';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('contactEmailError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('contactEmailError').style.display = 'none';
    }

    if (phone && !/^[0-9]{10}$/.test(phone)) {
        document.getElementById('contactPhoneError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('contactPhoneError').style.display = 'none';
    }

    if (!subject) {
        isValid = false;
        showToast('Please select a subject.');
    }

    if (message.length < 10) {
        document.getElementById('contactMessageError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('contactMessageError').style.display = 'none';
    }

    if (isValid) {
        const response = document.getElementById('contactResponse');
        response.style.display = 'block';
        response.innerHTML = `
            <h3>Message Sent!</h3>
            <p>Thank you, <strong>${name}</strong>.</p>
            <p>We'll reply to <strong>${email}</strong> within 24 hours.</p>
        `;
        document.getElementById('contactForm').reset();
        response.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// NEWSLETTER
function handleNewsletter(event) {
    event.preventDefault();

    const emailField = document.getElementById('newsletterEmail');
    const response = document.getElementById('newsletterResponse');
    if (!emailField) return;

    const email = emailField.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Please enter a valid email address.');
        return;
    }

    response.style.display = 'block';
    response.innerHTML = '<p>Thanks for subscribing!</p>';
    document.getElementById('newsletterForm').reset();
}

// CHARACTER COUNTERS
const enquiryMessage = document.getElementById('enquiryMessage');
const contactMessage = document.getElementById('contactMessage');

if (enquiryMessage) {
    enquiryMessage.addEventListener('input', function () {
        const counter = document.getElementById('enquiryCharCount');
        if (counter) counter.textContent = this.value.length + ' / 500 characters';
    });
}

if (contactMessage) {
    contactMessage.addEventListener('input', function () {
        const counter = document.getElementById('contactCharCount');
        if (counter) counter.textContent = this.value.length + ' / 1000 characters';
    });
}

// TOAST NOTIFICATIONS
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}