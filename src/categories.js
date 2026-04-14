import { sanitizeCategoryName } from './sanitizers.js';
import { saveCategories } from './storage.js';

// Render categories in the UI
export function renderCategories(categories) {
    const categoryList = document.getElementById('categoryList');
    const categorySelect = document.getElementById('category');

    if (!categoryList || !categorySelect) return;

    // Clear
    categoryList.innerHTML = '';
    categorySelect.innerHTML = '<option value="">Seleccionar categoría</option>';

    categories.forEach((category, index) => {
        const div = document.createElement('div');
        div.className = 'category';

        const span = document.createElement('span');
        span.textContent = category;
        div.appendChild(span);

        const btns = document.createElement('div');
        btns.className = 'category-buttons';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn-edit';
        editBtn.textContent = 'Editar';
        editBtn.addEventListener('click', function() { editCategory(index, categories); });

        const delBtn = document.createElement('button');
        delBtn.className = 'btn-delete';
        delBtn.textContent = 'Eliminar';
        delBtn.addEventListener('click', function() { deleteCategory(index, categories); });

        btns.appendChild(editBtn);
        btns.appendChild(delBtn);
        div.appendChild(btns);

        categoryList.appendChild(div);

        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Edit a category
function editCategory(index, categories) {
    const current = categories[index] || '';
    const newNameRaw = prompt("Editar nombre de la categoría:", current);
    if (newNameRaw === null) return; // cancel
    const newName = sanitizeCategoryName(newNameRaw);
    if (!newName) return alert('Nombre de categoría inválido.');
    if (newName === current) return;
    if (categories.includes(newName)) return alert('Esa categoría ya existe.');
    categories[index] = newName;
    saveCategories(categories);
    renderCategories(categories);
    // Trigger expense re-render if callback is available
    if (window.onCategoriesChanged) window.onCategoriesChanged();
}

// Delete a category
function deleteCategory(index, categories) {
    if (confirm(`¿Estás seguro de eliminar la categoría "${categories[index]}"?`)) {
        categories.splice(index, 1);
        saveCategories(categories);
        renderCategories(categories);
    }
}

// Add a new category
export function addCategory(categories) {
    const raw = prompt("Ingrese el nombre de la categoría:");
    if (raw === null) return; // cancel
    const categoryName = sanitizeCategoryName(raw);
    if (!categoryName) return alert('Nombre de categoría inválido.');
    if (categories.includes(categoryName)) return alert('Esa categoría ya existe.');
    categories.push(categoryName);
    saveCategories(categories);
    renderCategories(categories);
}
