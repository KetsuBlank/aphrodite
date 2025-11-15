// Валидация телефона
function validatePhone(phone) {
    const phoneRegex = /^(\+38|38|0)?\d{9}$/;
    const cleanedPhone = phone.replace(/\D/g, '');
    return phoneRegex.test(cleanedPhone) && cleanedPhone.length >= 9;
}

// Обработчик для телефона
document.getElementById('phone').addEventListener('input', function(e) {
    const phone = e.target.value;
    const phoneGroup = document.getElementById('phoneGroup');
    const phoneError = document.getElementById('phoneError');
    
    if (phone === '') {
        phoneGroup.classList.remove('error', 'success');
        phoneError.style.display = 'none';
        return;
    }
    
    if (validatePhone(phone)) {
        phoneGroup.classList.remove('error');
        phoneGroup.classList.add('success');
        phoneError.style.display = 'none';
    } else {
        phoneGroup.classList.remove('success');
        phoneGroup.classList.add('error');
        phoneError.style.display = 'block';
    }
});

// Обработка формы
document.getElementById('orderForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        service: document.getElementById('product').value,
        budget: document.getElementById('quantity').value,
        deadline: '',
        message: document.getElementById('message').value
    };
    
    // Валидация обязательных полей
    if (!formData.name || !formData.phone || !formData.service) {
        alert('Будь ласка, заповніть обовʼязкові поля');
        return;
    }
    
    // Валидация телефона
    if (formData.phone && !validatePhone(formData.phone)) {
        alert('Будь ласка, введіть коректний номер телефону');
        return;
    }
    
    const submitBtn = this.querySelector('.btn-primary');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';
    submitBtn.disabled = true;

    try {
        const response = await fetch('/api/send.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        console.log('Ответ сервера:', data);
        
        if (data.success) {
            alert('✅ Заявку успішно відправлено!');
            document.getElementById('orderForm').reset();
            
            // Закрываем модалку
            const bookingModal = document.getElementById('bookingModal');
            const modalOverlay = document.getElementById('modalOverlay');
            if (bookingModal) bookingModal.classList.remove('active');
            if (modalOverlay) modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            alert('❌ Помилка: ' + (data.error || 'Невідома помилка'));
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('❌ Помилка мережі. Спробуйте ще раз.');
    }
    
    // Восстанавливаем кнопку
    btnText.style.display = 'block';
    btnLoading.style.display = 'none';
    submitBtn.disabled = false;
});

// Остальной функционал сайта
class VeterinaCosmetics {
    constructor() {
        this.currentCategory = 'all';
        this.products = [];
        this.filteredProducts = [];
        this.sortBy = 'default';
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
    init() {
        try {
            this.setupPreloader();
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

    setupEventListeners() {
        this.setupNavigation();
        this.setupBookingModal();
        this.setupMobileMenu();
        this.setupProducts();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav__link');
        navLinks.forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const category = e.target.dataset.category;
                this.showCategory(category);
                navLinks.forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', e => {
                const category = e.currentTarget.dataset.category;
                this.showCategory(category);
                navLinks.forEach(l => {
                    l.classList.remove('active');
                    if (l.dataset.category === category) l.classList.add('active');
                });
            });
        });
        const catalogBtn = document.getElementById('catalogBtn');
        if (catalogBtn) catalogBtn.addEventListener('click', () => this.showCategory('all'));
    }

    setupBookingModal() {
        const bookingToggle = document.getElementById('bookingToggle');
        const closeBooking = document.getElementById('closeBooking');
        const modalOverlay = document.getElementById('modalOverlay');

        if (bookingToggle) bookingToggle.addEventListener('click', () => this.toggleBooking());
        if (closeBooking) closeBooking.addEventListener('click', () => this.toggleBooking());
        if (modalOverlay) modalOverlay.addEventListener('click', () => this.closeAllModals());
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
            sortSelect.addEventListener('change', e => {
                this.sortBy = e.target.value;
                this.sortProducts();
            });
        }
    }

    loadProducts() {
        this.showLoadingState();
        setTimeout(() => {
            this.products = this.currentCategory === 'all' ? this.productsData : this.productsData.filter(p => p.category === this.currentCategory);
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
            grid.innerHTML = `<div class="no-products" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--border-color); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text-light); margin-bottom: 1rem;">Товари не знайдено</h3>
                <button class="btn-primary" onclick="veterina.showCategory('all')">Переглянути всі товари</button>
            </div>`;
            return;
        }
        grid.innerHTML = this.filteredProducts.map(product => this.createProductCard(product)).join('');
    }

    createProductCard(product) {
        return `<div class="product-card" onclick="veterina.quickBook('${product.name}')">
            ${product.isNew ? `<div class="product-badge new">NEW</div>` : ''}
            <div class="product-image">${product.image}</div>
            <div class="product-content">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-brand">${product.brand}</div>
                <div class="product-price"><span class="price-current">${this.formatPrice(product.price)}</span></div>
                <div class="product-actions">
                    <button class="add-to-cart" onclick="event.stopPropagation(); veterina.quickBook('${product.name}')">
                        ${!product.inStock ? 'Немає в наявності' : 'Забронювати'}
                    </button>
                </div>
            </div>
        </div>`;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH', minimumFractionDigits: 0 }).format(price);
    }

    sortProducts() {
        let sorted = [...this.filteredProducts];
        switch(this.sortBy) {
            case 'price-asc': sorted.sort((a,b)=>a.price-b.price); break;
            case 'price-desc': sorted.sort((a,b)=>b.price-a.price); break;
            case 'name': sorted.sort((a,b)=>a.name.localeCompare(b.name)); break;
            default: break;
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
        if (nav && burger && window.innerWidth <= 768) { nav.classList.remove('active'); burger.classList.remove('active'); document.body.style.overflow = ''; }
    }

    quickBook(productName) {
        const productSelect = document.getElementById('product');
        if (productSelect) {
            const optionExists = Array.from(productSelect.options).some(option => option.value === productName);
            if (optionExists) productSelect.value = productName;
            else { const newOption = new Option(productName, productName); productSelect.add(newOption); productSelect.value = productName; }
        }
        this.toggleBooking(true);
    }

    toggleBooking(show=null) {
        const bookingModal = document.getElementById('bookingModal');
        const modalOverlay = document.getElementById('modalOverlay');
        if (show===null) show=!bookingModal?.classList.contains('active');
        if (bookingModal && modalOverlay) {
            if(show){bookingModal.classList.add('active');modalOverlay.classList.add('active');document.body.style.overflow='hidden';}
            else{bookingModal.classList.remove('active');modalOverlay.classList.remove('active');document.body.style.overflow='';}
        }
    }

    closeAllModals() {
        const modals=document.querySelectorAll('.booking-modal');
        const modalOverlay=document.getElementById('modalOverlay');
        modals.forEach(modal=>modal.classList.remove('active'));
        if(modalOverlay) modalOverlay.classList.remove('active');
        document.body.style.overflow='';
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded',()=>{window.veterina=new VeterinaCosmetics();});

// Глобальная функция для onclick в HTML
window.showCategory=(category)=>veterina?.showCategory(category);