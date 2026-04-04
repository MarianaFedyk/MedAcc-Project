document.addEventListener("DOMContentLoaded", () => {

    const elements = {
        photoBlock: document.getElementById('photoBlock'),
        popup: document.getElementById('popup'),
        closeBtn: document.getElementById('closePopup'),
        saveBtn: document.getElementById('saveImg'),
        imgInput: document.getElementById('imgInput'),
        preview: document.getElementById('preview'),
        text: document.getElementById('photoBlock')?.querySelector('span'),

        addBtn: document.querySelector('.add'),
        categorySelect: document.getElementById('categorySelect')
    };

    initPopup(elements);
    initImagePreview(elements);
    loadCategories(elements.categorySelect);
    initAddMedicine(elements);

});


function initPopup({ photoBlock, popup, closeBtn, saveBtn, imgInput, preview, text }) {

    if (photoBlock && popup) {
        photoBlock.onclick = () => popup.classList.add('active');
    }

    if (closeBtn && popup) {
        closeBtn.onclick = () => popup.classList.remove('active');
    }

    if (saveBtn) {
        saveBtn.onclick = () => {
            const url = imgInput.value.trim();
            if (!url) return;

            preview.src = url;
            preview.style.display = "block";
            if (text) text.style.display = "none";

            popup.classList.remove('active');
        };
    }
}

function initImagePreview({ preview, text }) {
    if (!preview) return;

   preview.onerror = () => {
    if (!preview.src) return; 

    alert("Неправильне посилання на зображення");
    resetImage(preview, text);
};
}

function resetImage(preview, text) {
    preview.onerror = null; 

    preview.src = "";
    preview.style.display = "none";

    if (text) text.style.display = "block";
}

async function loadCategories(select) {
    try {
        const res = await fetch('http://localhost:3000/categories');
        const categories = await res.json();

        select.innerHTML = '<option value="">Оберіть категорію</option>';

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
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

        const medicineData = {
            image: preview?.src || "",
            categoryID: Number(categorySelect?.value || 0),
            activeSubstances: document.getElementById('activeSubstances')?.value || "",
            form: document.getElementById('form')?.value || "",
            dosage: document.getElementById('dosage')?.value || "",
            packQuantity: document.getElementById('packQuantity')?.value || "",
            stockQuantity: document.getElementById('stockQuantity')?.value || "",
            tradeName: document.getElementById('tradeName')?.value || "",
            price: Number(document.getElementById('price')?.value || 0),
            indications: document.getElementById("indications")?.value || ""
        };

        console.log("Відправляємо:", medicineData);

        try {
            const response = await fetch('http://localhost:3000/add-medicine', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(medicineData)
            });

            const result = await response.json();

            if (response.ok) {
                alert('Успішно збережено!');

                resetForm();
                resetImage(preview, text); 

            } else {
                alert('Помилка: ' + result.message);
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
}