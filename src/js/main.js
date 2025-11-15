// ВЕТРИНА COSMETICS - Website with Telegram Booking
class VeterinaCosmetics {
    constructor() {
        this.currentCategory = 'all';
        this.products = [];
        this.filteredProducts = [];
        this.sortBy = 'default';
        this.apiReady = false; // флаг доступности Telegram

        this.productsData = this.initializeProductsData();
        this.init();
    }

    // Product Database
    brands = ['L\'Oreal', 'Nivea', 'Garnier', 'Dove', 'Maybelline', 'Revlon'];

    categories = {
        'face': 'Догляд за обличчям',
        'hair': 'Догляд за волоссям', 
        'body': 'Догляд за тілом',
        'makeup': 'Декоративна косметика'
    };

    initializeProductsData() {
        const allProducts = [];
        const categories = ['face', 'hair', 'body', 'makeup'];

        categories.forEach(category => {
            for (let i = 1; i <= 6; i++) {
                const brand = this.brands[Math.floor(Math.random() * this.brands.length)];
                const price = Math.floor(Math.random() * 1000) + 100;
                const isNew = Math.random() > 0.7;

                allProducts.push({
                    id: `${category}-${i}`,
                    name: `${this.getProductName(category, i)} ${brand}`,
                    category: category,
                    price: price,
                    image: this.getProductIcon(category),
                    brand: brand,
                    inStock: Math.random() > 0.1,
                    isNew: isNew
                });
            }
        });

        return allProducts;
    }

    getProductName(category, index) {
        const names = {
            'face': ['Крем для обличчя', 'Сироватка', 'Очисний гель', 'Нічна маска', 'Тонік', 'Гіалуронова кислота'],
            'hair': ['Шампунь', 'Кондиціонер', 'Маска для волосся', 'Спрей', 'Олія', 'Бальзам'],
            'body': ['Гель для душу', 'Лосйон для тіла', 'Скраб', 'Молочко', 'Деодорант', 'Крем для рук'],
            'makeup': ['Помада', 'Туш для вій', 'Тонова основа', 'Тіні для повік', 'Румяна', 'Пудра']
        };
        return names[category]?.[index % 6] || 'Косметичний засіб';
    }

    getProductIcon(category) {
        const icons = {
            'face': '🧴',
            'hair': '🚿', 
            'body': '🛁',
            'makeup': '💄'
        };
        return icons[category] || '⭐';
    }

    // Initialization
    async init() {
        try {
            this.setupPreloader();
            await this.checkAPI();
            this.loadProducts();
            this.setupEventListeners();
            console.log('✅ Veterina initialized');
        } catch (error) {
            console.error('❌ Init error:', error);
            this.hidePreloader();
        }
    }

    setupPreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            setTimeout(() => this.hidePreloader(), 1500);
        }
    }

    hidePreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('fade-out');
            setTimeout(() => preloader.remove(), 500);
        }
    }

    async checkAPI() {
        try {
            const response = await fetch('/api/check-env');
            const data = await response.json();

            if (data.status === 'READY') {
                this.apiReady = true;
            } else {
                this.apiReady = false;
                console.warn('⚠️ Telegram bot not configured. Booking will be disabled.');
            }
        } catch (error) {
            this.apiReady = false;
            console.warn('⚠️ Error checking API:', error);
        }
    }

    setupEventListeners() {
        this.setupNavigation();
        this.setupBooking();
        this.setupMobileMenu();
        this.setupProducts();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav__link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.dataset.category;
                this.showCategory(category);

                navLinks.forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.showCategory(category);

                navLinks.forEach(l => {
                    l.classList.remove('active');
                    if (l.dataset.category === category) l.classList.add('active');
                });
            });
        });

        const catalogBtn = document.getElementById('catalogBtn');
        if (catalogBtn) {
            catalogBtn.addEventListener('click', () => this.showCategory('all'));
        }
    }

    setupBooking() {
        const bookingToggle = document.getElementById('bookingToggle');
        const closeBooking = document.getElementById('closeBooking');
        const modalOverlay = document.getElementById('modalOverlay');

        if (bookingToggle) bookingToggle.addEventListener('click', () => this.toggleBooking());
        if (closeBooking) closeBooking.addEventListener('click', () => this.toggleBooking());
        if (modalOverlay) modalOverlay.addEventListener('click', () => this.closeAllModals());

        this.setupFormValidation();

        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => this.handleBooking(e));
        }
    }

    setupFormValidation() {
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => this.validatePhone(e.target.value));
        }
    }

    validatePhone(phone) {
        const phoneGroup = document.getElementById('phoneGroup');
        const phoneError = document.getElementById('phoneError');

        if (!phone) {
            phoneGroup.classList.remove('error', 'success');
            phoneError.style.display = 'none';
            return false;
        }

        const cleanedPhone = phone.replace(/\D/g, '');
        if (cleanedPhone.length >= 9 && cleanedPhone.length <= 12) {
            phoneGroup.classList.remove('error');
            phoneGroup.classList.add('success');
            phoneError.style.display = 'none';
            return true;
        } else {
            phoneGroup.classList.remove('success');
            phoneGroup.classList.add('error');
            phoneError.style.display = 'block';
            return false;
        }
    }

    setupMobileMenu() {
        const burger = document.getElementById('burgerToggle');
        const nav = document.querySelector('.nav');

        if (burger && nav) {
            burger.addEventListener('click', () => {
                nav.classList.toggle('active');
                burger.classList.toggle('active');
                document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
            });
        }
    }

    setupProducts() {
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.sortProducts();
            });
        }
    }

    loadProducts() {
        this.showLoadingState();

        setTimeout(() => {
            if (this.currentCategory === 'all') {
                this.products = this.productsData;
            } else {
                this.products = this.productsData.filter(p => p.category === this.currentCategory);
            }

            this.filteredProducts = [...this.products];
            this.sortProducts();
            this.displayProducts();
            this.hideLoadingState();
        }, 500);
    }

    showLoadingState() {
        const loading = document.getElementById('productsLoading');
        const grid = document.getElementById('products-grid');
        if (loading) loading.style.display = 'block';
        if (grid) grid.style.opacity = '0.5';
    }

    hideLoadingState() {
        const loading = document.getElementById('productsLoading');
        const grid = document.getElementById('products-grid');
        if (loading) loading.style.display = 'none';
        if (grid) grid.style.opacity = '1';
    }

    displayProducts() {
        const grid = document.getElementById('products-grid');
        if (!grid) return;

        if (this.filteredProducts.length === 0) {
            grid.innerHTML = `
                <div class="no-products" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fas fa-search" style="font-size: 3rem; color: var(--border-color); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-light); margin-bottom: 1rem;">Товари не знайдено</h3>
                    <button class="btn-primary" onclick="veterina.showCategory('all')">
                        Переглянути всі товари
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.filteredProducts.map(product => this.createProductCard(product)).join('');
    }

    createProductCard(product) {
        return `
            <div class="product-card" onclick="veterina.quickBook('${product.name}')">
                ${product.isNew ? `<div class="product-badge new">NEW</div>` : ''}
                <div class="product-image">${product.image}</div>
                <div class="product-content">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-brand">${product.brand}</div>
                    <div class="product-price">
                        <span class="price-current">${this.formatPrice(product.price)}</span>
                    </div>
                    <div class="product-actions">
                        <button class="add-to-cart" onclick="event.stopPropagation(); veterina.quickBook('${product.name}')">
                            ${!product.inStock ? 'Немає в наявності' : 'Забронювати'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH', minimumFractionDigits: 0 }).format(price);
    }

    sortProducts() {
        let sorted = [...this.filteredProducts];

        switch(this.sortBy) {
            case 'price-asc':
                sorted.sort((a,b) => a.price - b.price);
                break;
            case 'price-desc':
                sorted.sort((a,b) => b.price - a.price);
                break;
            case 'name':
                sorted.sort((a,b) => a.name.localeCompare(b.name));
                break;
        }

        this.filteredProducts = sorted;
        this.displayProducts();
    }

    showCategory(category) {
        this.currentCategory = category;

        const title = document.getElementById('section-title');
        if (title) title.textContent = category === 'all' ? 'Всі товари' : this.categories[category] || 'Товари';

        this.loadProducts();

        const nav = document.querySelector('.nav');
        const burger = document.getElementById('burgerToggle');
        if (nav && burger && window.innerWidth <= 768) {
            nav.classList.remove('active');
            burger.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    quickBook(productName) {
        if (!this.apiReady) {
            this.showNotification('error', '⚠️ Форма бронювання недоступна. Telegram бот не налаштований.');
            return;
        }

        const productSelect = document.getElementById('product');
        if (productSelect) {
            const optionExists = Array.from(productSelect.options).some(option => option.value === productName);
            if (!optionExists) productSelect.add(new Option(productName, productName));
            productSelect.value = productName;
        }
        this.toggleBooking(true);
    }

    toggleBooking(show = null) {
        const bookingModal = document.getElementById('bookingModal');
        const modalOverlay = document.getElementById('modalOverlay');

        if (show === null) show = !bookingModal?.classList.contains('active');

        if (bookingModal && modalOverlay) {
            if (show) {
                bookingModal.classList.add('active');
                modalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                bookingModal.classList.remove('active');
                modalOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    }

    closeAllModals() {
        document.querySelectorAll('.booking-modal').forEach(modal => modal.classList.remove('active'));
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    async handleBooking(e) {
        e.preventDefault();

        if (!this.apiReady) {
            this.showNotification('error', '⚠️ Форма бронювання недоступна. Telegram бот не налаштований.');
            return;
        }

        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            product: document.getElementById('product').value,
            quantity: document.getElementById('quantity').value,
            message: document.getElementById('message').value.trim()
        };

        if (!formData.name || !formData.phone || !formData.product) {
            this.showNotification('error', 'Заповніть обовʼязкові поля: імʼя, телефон та товар');
            return;
        }

        if (!this.validatePhone(formData.phone)) {
            this.showNotification('error', 'Будь ласка, введіть коректний номер телефону');
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        this.setButtonLoading(submitBtn, true);

        try {
            const response = await fetch('/api/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (data.success) {
                this.showNotification('success', data.message || '✅ Заявку успішно відправлено!');
                document.getElementById('bookingForm').reset();
                this.toggleBooking(false);
            } else {
                this.showNotification('error', data.error || '❌ Помилка відправки заявки');
            }
        } catch (error) {
            console.error('Помилка:', error);
            this.showNotification('error', '❌ Помилка мережі. Спробуйте ще раз.');
        }

        this.setButtonLoading(submitBtn, false);
    }

    setButtonLoading(button, isLoading) {
        if (!button) return;
        const btnText = button.querySelector('.btn-text');
        const btnLoading = button.querySelector('.btn-loading');

        if (isLoading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'flex';
            button.disabled = true;
        } else {
            btnText.style.display = 'flex';
            btnLoading.style.display = 'none';
            button.disabled = false;
        }
    }

    showNotification(type, message) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        container.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) notification.remove();
        }, 5000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.veterina = new VeterinaCosmetics();
});

// Global function for HTML onclick
window.showCategory = (category) => veterina?.showCategory(category);
