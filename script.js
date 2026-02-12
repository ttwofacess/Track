// Cargar datos desde localStorage al iniciar
let categories = JSON.parse(localStorage.getItem('categories')) || [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// Función para renderizar categorías
function renderCategories() {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = '';
    
    categories.forEach((category, index) => {
        const div = document.createElement('div');
        div.className = 'category';
        div.innerHTML = `
            <span>${category}</span>
            <button class="btn-edit" onclick="editCategory(${index})">Editar</button>
            <button class="btn-delete" onclick="deleteCategory(${index})">Eliminar</button>
        `;
        categoryList.appendChild(div);
    });
}

// Función para renderizar gastos
function renderExpenses() {
    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = '';
    
    expenses.forEach(expense => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="expense-details">
                <strong>${expense.category}</strong><br>
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

// Función para agregar un gasto
function addExpense() {
    const category = document.getElementById('category').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;

    if (!category || isNaN(amount) || !date) return;

    const expense = {
        id: Date.now(),
        category,
        amount,
        date,
        description
    };

    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderExpenses();
    document.getElementById('expenseForm').reset();
}

// Función para manejar eventos
document.getElementById('addCategoryBtn').addEventListener('click', addCategory);
document.getElementById('expenseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    addExpense();
});

// Renderizar al cargar la página
renderCategories();
renderExpenses();
