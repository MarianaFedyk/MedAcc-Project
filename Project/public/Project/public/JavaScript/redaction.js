document.addEventListener("DOMContentLoaded", function () {
    const photoBlock = document.getElementById('photoBlock');
    const popup = document.getElementById('popup');
    const closeBtn = document.getElementById('closePopup');
    const saveBtn = document.getElementById('saveImg');
    const imgInput = document.getElementById('imgInput');
    const preview = document.getElementById('preview');
    const text = photoBlock.querySelector('span');

    photoBlock.onclick = function () {
        popup.classList.add('active');
    };

    closeBtn.onclick = function () {
        popup.classList.remove('active');
    };

    saveBtn.onclick = function () {
        const url = imgInput.value.trim();

        if (url !== "") {
            preview.src = url;
            preview.style.display = "block";
            text.style.display = "none";
            popup.classList.remove('active');
        }
    };

    preview.onerror = function() {
        alert("Неправильне посилання на зображення");
        preview.style.display = "none";
        text.style.display = "block";
    };
});


const addBtn = document.querySelector('.add');

addBtn.addEventListener('click', async () => {
    const inputs = document.querySelectorAll('input');
    const previewImg = document.getElementById('preview');

    const medicineData = {
        image: previewImg ? previewImg.src : "",
        category: inputs[2] ? inputs[2].value : "",           
        activeSubstances: inputs[3] ? inputs[3].value : "",   
        form: inputs[4] ? inputs[4].value : "",               
        dosage: inputs[5] ? inputs[5].value : "",             
        packQuantity: inputs[6] ? inputs[6].value : "",       
        stockQuantity: inputs[7] ? inputs[7].value : "",      
        tradeName: inputs[8] ? inputs[8].value : "",          
        price: inputs[9] ? inputs[9].value : "",              
        indications: document.getElementById("indications").value || ""      
    };


    console.log("Відправляємо дані:", medicineData); 

    try {
        const response = await fetch('http://localhost:3000/add-medicine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(medicineData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Успішно збережено в medecine.json!');
            inputs.forEach(input => input.value = '');
            document.getElementById("indications").value = ''; 
        } else {
            alert('Помилка сервера: ' + result.message);
        }
    } catch (error) {
        console.error('Помилка:', error);
        alert('Не вдалося з’єднатися з сервером. Перевірте, чи запущено node server.js');
    }
});

const photoBlock = document.getElementById('photoBlock');
const popup = document.getElementById('popup');
if (photoBlock) {
    photoBlock.onclick = () => popup.style.display = 'block';
}

const saveImgBtn = document.getElementById('saveImg');
if (saveImgBtn) {
    saveImgBtn.onclick = () => {
        const imgInput = document.getElementById('imgInput');
        document.getElementById('preview').src = imgInput.value;
        popup.style.display = 'none';
    };
}

const closePopupBtn = document.getElementById('closePopup');
if (closePopupBtn) {
    closePopupBtn.onclick = () => popup.style.display = 'none';
}