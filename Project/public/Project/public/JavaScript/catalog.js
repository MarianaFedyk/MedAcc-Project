const range = document.getElementById('priceRange');
const minPrice = document.getElementById('minPrice');

range.addEventListener('input', function () {
    minPrice.textContent = range.value;
});


range.addEventListener('input', function () {
    const value = (this.value - this.min) / (this.max - this.min) * 100;
    this.style.background = `linear-gradient(to right, #5BBCD9 ${value}%, #d9d9d9 ${value}%)`;
});


fetch("medecine.json")
  .then(response => response.json())
  .then(data => {

    const products = document.getElementById("products");

    data.forEach(medicine => {

      const card = document.createElement("div");
      card.classList.add("product");

      card.innerHTML = `
        <img src="${medicine.image}" alt="">
        <h3>${medicine.tradeName}</h3>
        <p>${medicine.price} грн</p>
      `;

      products.appendChild(card);

    });

  })
  .catch(error => console.error("Помилка:", error));