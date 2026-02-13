// Cargar datos desde localStorage al iniciar
let categories = JSON.parse(localStorage.getItem('categories')) || [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// Función para renderizar categorías
function renderCategories() {
    const categoryList = document.getElementById('categoryList');
    const categorySelect = document.getElementById('category');
    
    if (!categoryList || !categorySelect) return;

    categoryList.innerHTML = '';
    categorySelect.innerHTML = '<option value="">Seleccionar categoría</option>';
    
    categories.forEach((category, index) => {
        const div = document.createElement('div');
        div.className = 'category';
        div.innerHTML = `
            <span>${category}</span>
            <div class="category-buttons">
                <button class="btn-edit" onclick="editCategory(${index})">Editar</button>
                <button class="btn-delete" onclick="deleteCategory(${index})">Eliminar</button>
            </div>
        `;
        categoryList.appendChild(div);

        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Función para editar una categoría
function editCategory(index) {
    const newName = prompt("Editar nombre de la categoría:", categories[index]);
    if (newName && newName !== categories[index]) {
        if (!categories.includes(newName)) {
            categories[index] = newName;
            localStorage.setItem('categories', JSON.stringify(categories));
            renderCategories();
            renderExpenses(); // Re-renderizar gastos para reflejar cambios si fuera necesario
        } else {
            alert("Esa categoría ya existe.");
        }
    }
}

// Función para eliminar una categoría
function deleteCategory(index) {
    if (confirm(`¿Estás seguro de eliminar la categoría "${categories[index]}"?`)) {
        categories.splice(index, 1);
        localStorage.setItem('categories', JSON.stringify(categories));
        renderCategories();
    }
}

let editingExpenseId = null;

// Función para actualizar el resumen de gastos
function updateSummary() {
    const periodSelect = document.getElementById('periodSelect');
    if (!periodSelect) return;
    
    const period = periodSelect.value;
    const now = new Date();
    // Ajustar 'now' para ignorar la hora en comparaciones diarias
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let total = 0;

    expenses.forEach(expense => {
        // El input date devuelve YYYY-MM-DD, lo tratamos como fecha local
        const [year, month, day] = expense.date.split('-').map(Number);
        const expenseDate = new Date(year, month - 1, day);
        
        let include = false;

        if (period === 'daily') {
            include = expenseDate.getTime() === today.getTime();
        } else if (period === 'weekly') {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay()); // Inicio de semana (Domingo)
            include = expenseDate >= startOfWeek;
        } else if (period === 'monthly') {
            include = expenseDate.getMonth() === today.getMonth() && 
                      expenseDate.getFullYear() === today.getFullYear();
        } else if (period === 'total') {
            include = true;
        }

        if (include) {
            total += expense.amount;
        }
    });

    document.getElementById('totalAmount').textContent = `$${total.toFixed(2)}`;
}

// Renderizar gastos
function renderExpenses() {
    const expenseList = document.getElementById('expenseList');
    if (!expenseList) return;
    expenseList.innerHTML = '';
    
    expenses.forEach(expense => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="expense-details">
                <strong>${expense.category}</strong> - $${expense.amount.toFixed(2)}<br>
                <small>${expense.date}</small><br>
                <em>${expense.description}</em>
            </div>
            <div class="btn-group">
                <button onclick="editExpense(${expense.id})">Editar</button>
                <button onclick="deleteExpense(${expense.id})">Eliminar</button>
            </div>
        `;
        expenseList.appendChild(li);
    });
    updateSummary(); // Actualizar resumen al renderizar gastos
}

// ... (resto de funciones)

// Función para manejar eventos
document.getElementById('addCategoryBtn').addEventListener('click', addCategory);
document.getElementById('expenseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveExpense();
});
document.getElementById('periodSelect').addEventListener('change', updateSummary);

// Renderizar al cargar la página
renderCategories();
renderExpenses();
