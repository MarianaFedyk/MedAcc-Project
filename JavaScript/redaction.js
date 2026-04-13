const searchBtn = document.querySelector('.search button');
const searchInput = document.querySelector('.inputMed');
const saveBtn = document.querySelector('.save');
const deleteBtn = document.querySelector('.delete');

let currentMedicine = null;

searchBtn?.addEventListener('click', async () => {
    const name = searchInput.value.trim();
    if (!name) return;

    try {
        const res = await fetch(`http://localhost:3000/medicine?name=${name}`);
        const medicine = await res.json();

        if (!medicine || medicine.error) {
            alert("Не знайдено");
            return;
        }

        currentMedicine = medicine;
        fillForm(medicine);

    } catch (err) {
        console.error(err);
        alert("Помилка сервера");
    }
});

function fillForm(m) {
    document.getElementById('categorySelect').value = String(m.categoryID);
    document.getElementById('activeSubstances').value = m.activeSubstances || "";
    document.getElementById('form').value = m.form || "";
    document.getElementById('dosage').value = m.dosage || "";
    document.getElementById('packQuantity').value = m.packQuantity || "";
    document.getElementById('stockQuantity').value = m.stockQuantity || "";
    document.getElementById('tradeName').value = m.tradeName || "";
    document.getElementById('price').value = m.price || "";
    document.getElementById('indications').value = m.indications || "";

    updatePhotoBlock(m.image);
}

saveBtn?.addEventListener('click', async () => {
    try {
        const updated = getFormData();

        const res = await fetch('http://localhost:3000/medicine', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(updated)
        });

        const result = await res.json();
        alert(result.message);

    } catch (err) {
        console.error(err);
        alert("Помилка при збереженні");
    }
});

deleteBtn?.addEventListener('click', async () => {
    const name = document.getElementById('tradeName').value;
    if (!name) return;

    try {
        const res = await fetch('http://localhost:3000/medicine', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // 🔥 ОБОВ’ЯЗКОВО
    body: JSON.stringify({ tradeName: name })
});

        const result = await res.json();
        alert(result.message);

        resetForm();

        // 🔥 додай це
        const preview = document.getElementById('preview');
        const text = document.querySelector('#photoBlock span');
        resetImage(preview, text);

    } catch (err) {
        console.error(err);
        alert("Помилка при видаленні");
    }
});

function getFormData() {
    return {
        image: document.getElementById('preview')?.src || "",
        categoryID: Number(document.getElementById('categorySelect').value) || 0,
        activeSubstances: document.getElementById('activeSubstances').value,
        form: document.getElementById('form').value,
        dosage: document.getElementById('dosage').value,
        packQuantity: document.getElementById('packQuantity').value,
        stockQuantity: document.getElementById('stockQuantity').value,
        tradeName: document.getElementById('tradeName').value,
        price: Number(document.getElementById('price').value) || 0,
        indications: document.getElementById('indications').value
    };
}

document.addEventListener("DOMContentLoaded", () => {

    const elements = {
        photoBlock: document.getElementById('photoBlock'),
        popup: document.getElementById('popup'),
        closeBtn: document.getElementById('closePopup'),
        saveBtn: document.getElementById('saveImg'),
        imgInput: document.getElementById('imgInput'),
        preview: document.getElementById('preview'),
        text: document.querySelector('#photoBlock span'),

        addBtn: document.querySelector('.add'),
        categorySelect: document.getElementById('categorySelect')
    };

    initPopup(elements);
    initImagePreview(elements);
    loadCategories(elements.categorySelect);
    initAddMedicine(elements);
});

function updatePhotoBlock(imageUrl) {
    const preview = document.getElementById('preview');
    const text = document.querySelector('#photoBlock span');

    if (!imageUrl) {
        resetImage(preview, text);
        return;
    }

    preview.src = imageUrl;
    preview.style.display = 'block';
    if (text) text.style.display = 'none';
}

function initPopup({ photoBlock, popup, closeBtn, saveBtn, imgInput }) {
    photoBlock?.addEventListener('click', () => popup?.classList.add('active'));
    closeBtn?.addEventListener('click', () => popup?.classList.remove('active'));

    saveBtn?.addEventListener('click', () => {
        const url = imgInput.value.trim();
        if (!url) return;

        updatePhotoBlock(url);
        popup.classList.remove('active');
    });
}

function initImagePreview({ preview, text }) {
    if (!preview) return;

    preview.onerror = () => {
    if (!preview.src || preview.src === window.location.href) return;
    alert("Неправильне посилання");
    resetImage(preview, text);
};
}

function resetImage(preview, text) {
    preview.src = "";
    preview.style.display = "none";
    if (text) text.style.display = "block";
}

async function loadCategories(select) {
    if (!select) return;

    try {
        const res = await fetch('http://localhost:3000/categories');
        const categories = await res.json();

        console.log("Категорії:", categories); 

        if (!Array.isArray(categories)) {
            console.error("Невірний формат категорій");
            return;
        }

        select.innerHTML = '<option value="">Оберіть категорію</option>';

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = String(cat.id);
            option.textContent = cat.name;
            select.appendChild(option);
        });

    } catch (err) {
        console.error("Помилка завантаження категорій:", err);
    }
}

function initAddMedicine({ addBtn, categorySelect, preview, text }) {
    if (!addBtn) return;

    addBtn.addEventListener('click', async () => {

        const medicineData = getFormData();

        try {
            const response = await fetch('http://localhost:3000/add-medicine', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include', // 🔥
            body: JSON.stringify(medicineData)
        });

            const result = await response.json();

            if (response.ok) {
                alert('Успішно збережено!');
                resetForm();
                resetImage(preview, text);
            } else {
                alert(result.message);
            }

        } catch (error) {
            console.error(error);
            alert('Сервер недоступний');
        }
    });
}


function resetForm() {
    document.querySelectorAll('input').forEach(i => i.value = '');
    
    const textarea = document.getElementById("indications");
    if (textarea) textarea.value = '';

    // 🔥 очищаємо фото
    const preview = document.getElementById('preview');
    const text = document.querySelector('#photoBlock span');
    resetImage(preview, text);
}