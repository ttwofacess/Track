// Cargar datos desde localStorage al iniciar
// Sanitiza y valida nombres de categoría
function sanitizeCategoryName(name) {
    if (typeof name !== 'string') return '';
    name = name.trim();
    if (!name) return '';
    // Limitar longitud y eliminar caracteres que permitan HTML
    if (name.length > 50) name = name.slice(0, 50);
    name = name.replace(/[<>]/g, '');
    // Normalizar espacios consecutivos
    name = name.replace(/\s+/g, ' ');
    return name;
}

// Sanitiza y valida el monto (amount)
function sanitizeAmount(value) {
    let amount = parseFloat(value);
    if (isNaN(amount) || !isFinite(amount)) return NaN;
    // Asegurar que sea positivo (los gastos suelen serlo)
    amount = Math.abs(amount);
    // Limitar a un rango razonable y 2 decimales
    if (amount > 9999999.99) amount = 9999999.99;
    return Math.round(amount * 100) / 100;
}

// Sanitiza y valida la fecha (date)
function sanitizeDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;
    
    // Validar formato YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) return null;

    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    // Verificar si la fecha es válida (ej: no 30 de febrero)
    if (isNaN(date.getTime()) || 
        date.getFullYear() !== year || 
        date.getMonth() !== month - 1 || 
        date.getDate() !== day) {
        return null;
    }

    // Rango: No más de 10 años atrás, no más de 1 año en el futuro
    const now = new Date();
    const minDate = new Date();
    minDate.setFullYear(now.getFullYear() - 10);
    const maxDate = new Date();
    maxDate.setFullYear(now.getFullYear() + 1);

    if (date < minDate || date > maxDate) return null;

    return dateStr;
}

// Sanitiza y valida la descripción
function sanitizeDescription(text) {
    if (typeof text !== 'string') return '';
    // Eliminar espacios al inicio/final
    text = text.trim();
    if (!text) return '';
    // Limitar longitud
    if (text.length > 200) text = text.slice(0, 200);
    // Eliminar etiquetas HTML para prevenir inyecciones básicas
    text = text.replace(/[<>]/g, '');
    // Normalizar espacios internos
    text = text.replace(/\s+/g, ' ');
    return text;
}

// Sanitiza y valida el período (period)
function sanitizePeriod(period) {
    const validPeriods = ['daily', 'weekly', 'monthly', 'total'];
    return validPeriods.includes(period) ? period : 'daily';
}

// Cargar y sanitizar datos desde localStorage al iniciar
let rawCategories = JSON.parse(localStorage.getItem('categories')) || [];
let categories = Array.isArray(rawCategories)
    ? rawCategories.map(sanitizeCategoryName).filter((c, i, arr) => c && arr.indexOf(c) === i)
    : [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let editingExpenseId = null;

// Función para renderizar categorías
function renderCategories() {
    const categoryList = document.getElementById('categoryList');
    const categorySelect = document.getElementById('category');
    
    if (!categoryList || !categorySelect) return;

    // Limpiar
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
        editBtn.addEventListener('click', function() { editCategory(index); });

        const delBtn = document.createElement('button');
        delBtn.className = 'btn-delete';
        delBtn.textContent = 'Eliminar';
        delBtn.addEventListener('click', function() { deleteCategory(index); });

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

// Función para editar una categoría
function editCategory(index) {
    const current = categories[index] || '';
    const newNameRaw = prompt("Editar nombre de la categoría:", current);
    if (newNameRaw === null) return; // cancel
    const newName = sanitizeCategoryName(newNameRaw);
    if (!newName) return alert('Nombre de categoría inválido.');
    if (newName === current) return;
    if (categories.includes(newName)) return alert('Esa categoría ya existe.');
    categories[index] = newName;
    localStorage.setItem('categories', JSON.stringify(categories));
    renderCategories();
    renderExpenses();
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
    const datePickerContainer = document.getElementById('datePickerContainer');
    
    if (!periodSelect || !specificDateInput) return;
    
    // Sanitización y validación del período
    const rawPeriod = periodSelect.value;
    const period = sanitizePeriod(rawPeriod);
    
    // Si el valor era inválido (ej. inyectado por consola), sincronizamos la UI
    if (rawPeriod !== period) {
        periodSelect.value = period;
    }
    
    // Mostrar u ocultar el selector de fecha
    if (period === 'daily' || period === 'weekly' || period === 'monthly') {
        datePickerContainer.style.display = 'block';
    } else {
        datePickerContainer.style.display = 'none';
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Determinar la fecha de referencia para el filtro
    let targetDate = today;
    const rawDate = specificDateInput.value;
    const sanitizedDateStr = sanitizeDate(rawDate);

    if (sanitizedDateStr) {
        const [year, month, day] = sanitizedDateStr.split('-').map(Number);
        targetDate = new Date(year, month - 1, day);
    } else {
        // Si el valor en el input es inválido, forzamos la fecha de hoy
        const todayStr = today.toISOString().split('T')[0];
        if (rawDate !== todayStr) {
            specificDateInput.value = todayStr;
        }
    }

    let total = 0;

    expenses.forEach(expense => {
        const [year, month, day] = expense.date.split('-').map(Number);
        const expenseDate = new Date(year, month - 1, day);
        
        let include = false;

        if (period === 'daily') {
            include = expenseDate.getTime() === targetDate.getTime();
        } else if (period === 'weekly') {
            const startOfWeek = new Date(targetDate);
            startOfWeek.setDate(targetDate.getDate() - targetDate.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            
            include = expenseDate >= startOfWeek && expenseDate <= endOfWeek;
        } else if (period === 'monthly') {
            include = expenseDate.getMonth() === targetDate.getMonth() && 
                      expenseDate.getFullYear() === targetDate.getFullYear();
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
        editBtn.addEventListener('click', function() { editExpense(expense.id); });

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Eliminar';
        delBtn.addEventListener('click', function() { deleteExpense(expense.id); });

        btnGroup.appendChild(editBtn);
        btnGroup.appendChild(delBtn);

        li.appendChild(details);
        li.appendChild(btnGroup);
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
    const raw = prompt("Ingrese el nombre de la categoría:");
    if (raw === null) return; // cancel
    const categoryName = sanitizeCategoryName(raw);
    if (!categoryName) return alert('Nombre de categoría inválido.');
    if (categories.includes(categoryName)) return alert('Esa categoría ya existe.');
    categories.push(categoryName);
    localStorage.setItem('categories', JSON.stringify(categories));
    renderCategories();
}

// Función para guardar (crear o editar) un gasto
function saveExpense() {
    const rawCategory = document.getElementById('category').value;
    const amountRaw = document.getElementById('amount').value;
    const amount = sanitizeAmount(amountRaw);
    const dateRaw = document.getElementById('date').value;
    const date = sanitizeDate(dateRaw);
    const rawDescription = document.getElementById('description').value;
    const description = sanitizeDescription(rawDescription);

    // Sanitize category and ensure it exists in the canonical categories list
    const category = sanitizeCategoryName(rawCategory);
    if (!category || !categories.includes(category)) {
        return alert('Categoría inválida. Seleccione una categoría válida.');
    }
    if (isNaN(amount) || amount <= 0) {
        return alert('Ingrese un monto válido y positivo (ej. 10.50).');
    }
    if (!date) {
        return alert('La fecha es inválida o está fuera de rango (máx. 10 años atrás o 1 año futuro).');
    }

    if (editingExpenseId) {
        const index = expenses.findIndex(e => e.id === editingExpenseId);
        if (index !== -1) {
            expenses[index] = { ...expenses[index], category, amount, date, description };
        }
        editingExpenseId = null;
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

    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderExpenses();
    const form = document.getElementById('expenseForm');
    if (form) form.reset();
}

// Event Listeners
document.getElementById('addCategoryBtn').addEventListener('click', addCategory);

// Funcionalidad de Toggle para secciones
document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const target = document.getElementById(targetId);
        if (target) {
            target.classList.toggle('hidden');
            this.textContent = target.classList.contains('hidden') ? 'Mostrar' : 'Ocultar';
        }
    });
});

// Validación y sanitización del input 'amount' en tiempo real
const amountInput = document.getElementById('amount');
if (amountInput) {
    // Evitar caracteres no numéricos innecesarios
    amountInput.addEventListener('keydown', function(e) {
        if (['e', 'E', '+', '-'].includes(e.key)) {
            e.preventDefault();
        }
    });

    // Asegurar 2 decimales al perder el foco (blur)
    amountInput.addEventListener('blur', function() {
        const val = sanitizeAmount(this.value);
        if (!isNaN(val)) {
            this.value = val.toFixed(2);
        }
    });
}

document.getElementById('expenseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveExpense();
});
document.getElementById('periodSelect').addEventListener('change', renderExpenses);
document.getElementById('specificDate').addEventListener('change', renderExpenses);

// Inicialización
const today = new Date();
const todayStr = today.toISOString().split('T')[0];

// Límites de fecha: 10 años atrás, 1 año futuro
const minDate = new Date();
minDate.setFullYear(today.getFullYear() - 10);
const maxDate = new Date();
maxDate.setFullYear(today.getFullYear() + 1);

const minDateStr = minDate.toISOString().split('T')[0];
const maxDateStr = maxDate.toISOString().split('T')[0];

const dateInput = document.getElementById('date');
if (dateInput) {
    dateInput.min = minDateStr;
    dateInput.max = maxDateStr;
    dateInput.value = todayStr; // Valor por defecto: hoy
}

const specificDateInput = document.getElementById('specificDate');
if (specificDateInput) {
    specificDateInput.min = minDateStr;
    specificDateInput.max = maxDateStr;
    specificDateInput.value = todayStr;
}

renderCategories();
renderExpenses();

// ── LÓGICA DE LA MODAL DE DONACIÓN ──
const donateButton = document.getElementById('donateButton');
const modal        = document.getElementById('donateModal');
const closeButton  = document.querySelector('.close-button');

if (donateButton && modal && closeButton) {
    // Abrir modal
    donateButton.onclick = () => { modal.style.display = 'block'; };

    // Cerrar con el botón ×
    closeButton.onclick = () => { modal.style.display = 'none'; };

    // Cerrar al hacer clic fuera del contenido
    window.addEventListener('click', (event) => {
        if (event.target === modal) modal.style.display = 'none';
    });
}

// Copiar dirección al portapapeles
document.querySelectorAll('.copy-button').forEach(button => {
    button.addEventListener('click', (event) => {
        const input = event.target
            .previousElementSibling   // .crypto-info
            .querySelector('input');
        
        if (input) {
            input.select();
            input.setSelectionRange(0, 99999); // Para móviles
            
            try {
                navigator.clipboard.writeText(input.value).then(() => {
                    const originalText = button.textContent;
                    button.textContent = '¡Copiado!';
                    button.style.backgroundColor = 'var(--success)';
                    setTimeout(() => { 
                        button.textContent = originalText;
                        button.style.backgroundColor = '';
                    }, 2000);
                });
            } catch (err) {
                // Fallback para navegadores antiguos
                document.execCommand('copy');
                const originalText = button.textContent;
                button.textContent = '¡Copiado!';
                setTimeout(() => { button.textContent = originalText; }, 2000);
            }
        }
    });
});

// Theme toggle: apply and persist theme (uses data-theme on <html>)
const themeToggle = document.getElementById('themeToggle');
function applyTheme(theme){
    if(theme === 'dark'){
        document.documentElement.setAttribute('data-theme','dark');
        if(themeToggle){ themeToggle.textContent = '☀️'; themeToggle.setAttribute('aria-pressed','true'); }
    } else {
        document.documentElement.removeAttribute('data-theme');
        if(themeToggle){ themeToggle.textContent = '🌙'; themeToggle.setAttribute('aria-pressed','false'); }
    }
}

// Initialize theme from localStorage or prefers-color-scheme
const savedTheme = localStorage.getItem('theme');
if(savedTheme){ applyTheme(savedTheme); }
else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
}

if(themeToggle){
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const next = isDark ? 'light' : 'dark';
        applyTheme(next);
        try{ localStorage.setItem('theme', next); }catch(e){}
    });
}
