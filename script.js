// Cargar datos desde localStorage al iniciar
let categories = JSON.parse(localStorage.getItem('categories')) || [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let editingExpenseId = null;

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
            renderExpenses();
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

// Función para actualizar el resumen de gastos
function updateSummary() {
    const periodSelect = document.getElementById('periodSelect');
    const specificDateInput = document.getElementById('specificDate');
    const dailyPicker = document.getElementById('dailyPicker');
    
    if (!periodSelect || !specificDateInput) return;
    
    const period = periodSelect.value;
    
    // Mostrar u ocultar el selector de fecha
    if (period === 'daily') {
        dailyPicker.style.display = 'block';
    } else {
        dailyPicker.style.display = 'none';
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Determinar la fecha de referencia para el filtro diario
    let targetDate = today;
    if (period === 'daily' && specificDateInput.value) {
        const [year, month, day] = specificDateInput.value.split('-').map(Number);
        targetDate = new Date(year, month - 1, day);
    }

    let total = 0;

    expenses.forEach(expense => {
        const [year, month, day] = expense.date.split('-').map(Number);
        const expenseDate = new Date(year, month - 1, day);
        
        let include = false;

        if (period === 'daily') {
            include = expenseDate.getTime() === targetDate.getTime();
        } else if (period === 'weekly') {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
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

// Función para renderizar gastos
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
    updateSummary();
}

// Función para editar un gasto
function editExpense(id) {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;

    document.getElementById('category').value = expense.category;
    document.getElementById('amount').value = expense.amount;
    document.getElementById('date').value = expense.date;
    document.getElementById('description').value = expense.description;

    editingExpenseId = id;
    document.querySelector('#expenseForm button[type="submit"]').textContent = 'Actualizar Gasto';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Función para eliminar un gasto
function deleteExpense(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
        expenses = expenses.filter(e => e.id !== id);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        renderExpenses();
    }
}

// Función para agregar una categoría
function addCategory() {
    const categoryName = prompt("Ingrese el nombre de la categoría:");
    if (categoryName && !categories.includes(categoryName)) {
        categories.push(categoryName);
        localStorage.setItem('categories', JSON.stringify(categories));
        renderCategories();
    }
}

// Función para guardar (crear o editar) un gasto
function saveExpense() {
    const category = document.getElementById('category').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;

    if (!category || isNaN(amount) || !date) return;

    if (editingExpenseId) {
        const index = expenses.findIndex(e => e.id === editingExpenseId);
        if (index !== -1) {
            expenses[index] = { ...expenses[index], category, amount, date, description };
        }
        editingExpenseId = null;
        document.querySelector('#expenseForm button[type="submit"]').textContent = 'Agregar Gasto';
    } else {
        const expense = {
            id: Date.now(),
            category,
            amount,
            date,
            description
        };
        expenses.push(expense);
    }

    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderExpenses();
    document.getElementById('expenseForm').reset();
}

// Event Listeners
document.getElementById('addCategoryBtn').addEventListener('click', addCategory);
document.getElementById('expenseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveExpense();
});
document.getElementById('periodSelect').addEventListener('change', updateSummary);
document.getElementById('specificDate').addEventListener('change', updateSummary);

// Inicialización
const todayStr = new Date().toISOString().split('T')[0];
document.getElementById('specificDate').value = todayStr;

renderCategories();
renderExpenses();
