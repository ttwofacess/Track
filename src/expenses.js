import { sanitizePeriod, sanitizeDate } from './sanitizers.js';
import { saveExpenses } from './storage.js';

// Render expenses in the UI
export function renderExpenses(expenses, categories, onSummaryUpdate) {
    const expenseList = document.getElementById('expenseList');
    if (!expenseList) return;
    expenseList.innerHTML = '';

    const periodSelect = document.getElementById('periodSelect');
    const specificDateInput = document.getElementById('specificDate');

    if (!periodSelect || !specificDateInput) return;

    const period = sanitizePeriod(periodSelect.value);
    const sanitizedDateStr = sanitizeDate(specificDateInput.value);

    let targetDate = null;
    if (sanitizedDateStr) {
        const [year, month, day] = sanitizedDateStr.split('-').map(Number);
        targetDate = new Date(year, month - 1, day);
    }

    const filteredExpenses = expenses.filter(expense => {
        if (period === 'total') return false;
        if (!targetDate) return false;

        const [year, month, day] = expense.date.split('-').map(Number);
        const expenseDate = new Date(year, month - 1, day);

        if (period === 'daily') {
            return expenseDate.getTime() === targetDate.getTime();
        } else if (period === 'weekly') {
            const startOfWeek = new Date(targetDate);
            startOfWeek.setDate(targetDate.getDate() - targetDate.getDay());
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            return expenseDate >= startOfWeek && expenseDate <= endOfWeek;
        } else if (period === 'monthly') {
            return expenseDate.getMonth() === targetDate.getMonth() &&
                   expenseDate.getFullYear() === targetDate.getFullYear();
        }
        return false;
    });

    filteredExpenses.forEach(expense => {
        const li = document.createElement('li');

        const details = document.createElement('div');
        details.className = 'expense-details';

        const strong = document.createElement('strong');
        strong.textContent = expense.category;
        details.appendChild(strong);

        const text = document.createTextNode(' - $' + Number(expense.amount).toFixed(2));
        details.appendChild(text);

        details.appendChild(document.createElement('br'));

        const small = document.createElement('small');
        small.textContent = expense.date;
        details.appendChild(small);

        details.appendChild(document.createElement('br'));

        const em = document.createElement('em');
        em.textContent = expense.description || '';
        details.appendChild(em);

        const btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Editar';
        editBtn.addEventListener('click', function() { editExpense(expense.id, expenses); });

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Eliminar';
        delBtn.addEventListener('click', function() { deleteExpense(expense.id, expenses); });

        btnGroup.appendChild(editBtn);
        btnGroup.appendChild(delBtn);

        li.appendChild(details);
        li.appendChild(btnGroup);
        expenseList.appendChild(li);
    });

    // Update summary after rendering expenses
    if (onSummaryUpdate) onSummaryUpdate();
}

// Edit an expense
function editExpense(id, expenses) {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;

    document.getElementById('category').value = expense.category;
    document.getElementById('amount').value = expense.amount;
    document.getElementById('date').value = expense.date;
    document.getElementById('description').value = expense.description;

    window.editingExpenseId = id;
    document.querySelector('#expenseForm button[type="submit"]').textContent = 'Actualizar Gasto';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Delete an expense
function deleteExpense(id, expenses) {
    if (confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
        const filtered = expenses.filter(e => e.id !== id);
        expenses.length = 0;
        expenses.push(...filtered);
        saveExpenses(expenses);
        renderExpenses(expenses, []);
    }
}

// Save an expense (create or update)
export function saveExpense(expenses, categories, onRenderExpenses) {
    const rawCategory = document.getElementById('category').value;
    const amountRaw = document.getElementById('amount').value;
    const amount = parseFloat(amountRaw);
    const dateRaw = document.getElementById('date').value;
    const date = sanitizeDate(dateRaw);
    const rawDescription = document.getElementById('description').value;
    const description = rawDescription.trim();

    // Sanitize category and ensure it exists in the canonical categories list
    const category = rawCategory.trim();
    if (!category || !categories.includes(category)) {
        return alert('Categoría inválida. Seleccione una categoría válida.');
    }
    if (isNaN(amount) || amount <= 0) {
        return alert('Ingrese un monto válido y positivo (ej. 10.50).');
    }
    if (!date) {
        return alert('La fecha es inválida o está fuera de rango (máx. 10 años atrás o 1 año futuro).');
    }

    if (window.editingExpenseId) {
        const index = expenses.findIndex(e => e.id === window.editingExpenseId);
        if (index !== -1) {
            expenses[index] = { ...expenses[index], category, amount, date, description };
        }
        window.editingExpenseId = null;
        const submitBtn = document.querySelector('#expenseForm button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Agregar Gasto';
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

    saveExpenses(expenses);
    if (onRenderExpenses) onRenderExpenses();
    const form = document.getElementById('expenseForm');
    if (form) form.reset();
}
