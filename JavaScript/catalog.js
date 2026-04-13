const range = document.getElementById('priceRange');
const minPrice = document.getElementById('minPrice');
const productsContainer = document.getElementById('products');
const searchInput = document.getElementById('searchInput');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const categoriesContainer = document.getElementById('categories');
const maxPriceSpan = document.querySelector('.price-range span:last-child');

let visibleCount = 8; 
const STEP = 4; 

let allMedicines = [];
let activeCategory = null;
let filteredMedicines = [];

fetch('categories.json')
    .then(res => res.json())
    .then(categories => {
        categoriesContainer.innerHTML = '';

        categories.forEach(cat => {
            const button = document.createElement('button');

            button.textContent = `+${cat.name}`;
            button.dataset.id = cat.id;

            categoriesContainer.appendChild(button);
        });
    })
    .catch(err => {
        console.error('Помилка завантаження категорій:', err);
    });

categoriesContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        const id = Number(e.target.dataset.id);

        document.querySelectorAll('.categories button').forEach(btn => {
            btn.classList.remove('active');
        });

        if (activeCategory === id) {
            activeCategory = null;
        } else {
            activeCategory = id;
            e.target.classList.add('active');
        }

        visibleCount = 8;
        applyFilters();
    }
});

range.addEventListener('input', function () {
    minPrice.textContent = range.value;

    const value = (this.value - this.min) / (this.max - this.min) * 100;
    this.style.background = `linear-gradient(to right, #5BBCD9 ${value}%, #d9d9d9 ${value}%)`;

    applyFilters();
});

function renderProducts(items) {
    productsContainer.innerHTML = '';

    if (items.length === 0) {
        productsContainer.innerHTML = `<p>Нічого не знайдено</p>`;
        loadMoreBtn.style.display = "none";
        return;
    }

    const visibleItems = items.slice(0, visibleCount);

    visibleItems.forEach(medicine => {
        const card = document.createElement('div');
        card.classList.add('product');

        card.innerHTML = `
            <img src="${medicine.image}" alt="">
            <h3>${medicine.tradeName}</h3>
            <p>${medicine.price} грн</p>
        `;

        productsContainer.appendChild(card);
    });

    if (visibleCount >= items.length) {
        loadMoreBtn.style.display = "none";
    } else {
        loadMoreBtn.style.display = "block";
    }
}

loadMoreBtn.addEventListener('click', () => {
    visibleCount += STEP;
    renderProducts(filteredMedicines); 
});

searchInput.addEventListener('input', () => {
    visibleCount = 8;
    applyFilters();
});

function applyFilters() {
    const maxPrice = Number(range.value);
    const searchValue = searchInput.value.toLowerCase().trim();

    filteredMedicines = allMedicines.filter(item => {
        const name = String(item.tradeName || "").toLowerCase();

        const matchesPrice = Number(item.price) <= maxPrice;
        const matchesSearch = name.includes(searchValue);

        return matchesPrice && matchesSearch;
    });

    if (activeCategory !== null) {
        filteredMedicines = filteredMedicines.filter(item =>
            Number(item.categoryID) === activeCategory
        );
    }

    renderProducts(filteredMedicines);
}

async function loadMedicines() {
    const res = await fetch('http://localhost:3000/medicines');
    allMedicines = await res.json();

    const maxPriceValue = Math.max(...allMedicines.map(item => Number(item.price)));

    range.max = maxPriceValue;

    maxPriceSpan.textContent = maxPriceValue;

    range.value = 300;

    minPrice.textContent = range.value;
    if (allMedicines.length === 0) return;

    applyFilters();
}

loadMedicines();