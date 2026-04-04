const range = document.getElementById('priceRange');
const minPrice = document.getElementById('minPrice');
const productsContainer = document.getElementById('products');
const buttons = document.querySelectorAll('.categories button');
const searchInput = document.getElementById('searchInput');
const loadMoreBtn = document.getElementById('loadMoreBtn');

let visibleCount = 8; 
const STEP = 4; 

let allMedicines = [];
let activeCategory = null;
let filteredMedicines = [];

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

    applyFilters(); 
}

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);

        if (activeCategory === id) {
            activeCategory = null;
        } else {
            activeCategory = id;
        }

        visibleCount = 8;
        applyFilters();
    });
});

loadMedicines();