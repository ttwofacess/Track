import { loadCategories, loadExpenses, saveCategories, saveExpenses, exportData, importData } from './storage.js';
import { renderCategories, addCategory } from './categories.js';
import { renderExpenses, saveExpense } from './expenses.js';
import { updateSummary } from './summary.js';
import { initDonationModal, initCopyButtons } from './modal.js';
import { initTheme } from './theme.js';
import { initDateInputs, initAmountInput, initToggleSections } from './ui.js';

// Global state
let categories = loadCategories();
let expenses = loadExpenses();
window.editingExpenseId = null;

// Callback for category changes to trigger expense re-render
window.onCategoriesChanged = function() {
    renderExpenses(expenses, categories, () => updateSummary(expenses));
};

// Initialize theme
initTheme();

// Initialize UI components
initDateInputs();
initAmountInput();
initToggleSections();

// Initialize modal and copy buttons
initDonationModal();
initCopyButtons();

// Render initial state
renderCategories(categories);
renderExpenses(expenses, categories, () => updateSummary(expenses));

// Event Listeners
document.getElementById('addCategoryBtn').addEventListener('click', () => {
    addCategory(categories);
});

document.getElementById('exportBtn').addEventListener('click', () => {
    exportData(categories, expenses);
});

document.getElementById('importFile').addEventListener('change', (event) => {
    importData(event, (importedCategories, importedExpenses) => {
        categories = importedCategories;
        expenses = importedExpenses;
        saveCategories(categories);
        saveExpenses(expenses);
        renderCategories(categories);
        renderExpenses(expenses, categories, () => updateSummary(expenses));
    });
});

document.getElementById('expenseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveExpense(expenses, categories, () => {
        renderExpenses(expenses, categories, () => updateSummary(expenses));
    });
});

document.getElementById('periodSelect').addEventListener('change', () => {
    renderExpenses(expenses, categories, () => updateSummary(expenses));
});

document.getElementById('specificDate').addEventListener('change', () => {
    renderExpenses(expenses, categories, () => updateSummary(expenses));
});
