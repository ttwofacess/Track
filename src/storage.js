import { sanitizeCategoryName, sanitizeAmount, sanitizeDate, sanitizeDescription } from './sanitizers.js';

// Load data from localStorage
export function loadCategories() {
    const rawCategories = JSON.parse(localStorage.getItem('categories')) || [];
    return Array.isArray(rawCategories)
        ? rawCategories.map(sanitizeCategoryName).filter((c, i, arr) => c && arr.indexOf(c) === i)
        : [];
}

export function loadExpenses() {
    return JSON.parse(localStorage.getItem('expenses')) || [];
}

// Save data to localStorage
export function saveCategories(categories) {
    localStorage.setItem('categories', JSON.stringify(categories));
}

export function saveExpenses(expenses) {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Export data to JSON file
export function exportData(categories, expenses) {
    const data = {
        categories: categories,
        expenses: expenses,
        exportDate: new Date().toISOString(),
        version: "1.0"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gastos_hormiga_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import data from JSON file
export function importData(event, onImportSuccess) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            // Basic structure validation
            if (!data.categories || !data.expenses || !Array.isArray(data.categories) || !Array.isArray(data.expenses)) {
                throw new Error("El archivo no tiene el formato correcto de Gastos Hormiga.");
            }

            if (!confirm("Al importar, se reemplazarán todas tus categorías y gastos actuales por los del archivo. ¿Deseas continuar?")) {
                event.target.value = '';
                return;
            }

            // Sanitize imported categories
            const importedCategories = data.categories
                .map(sanitizeCategoryName)
                .filter((c, i, arr) => c && arr.indexOf(c) === i);

            if (importedCategories.length === 0) {
                throw new Error("No se encontraron categorías válidas en el archivo.");
            }

            // Sanitize imported expenses
            const importedExpenses = data.expenses.map(exp => {
                return {
                    id: Number(exp.id) || Date.now() + Math.random(),
                    category: sanitizeCategoryName(exp.category),
                    amount: sanitizeAmount(exp.amount),
                    date: sanitizeDate(exp.date),
                    description: sanitizeDescription(exp.description)
                };
            }).filter(exp =>
                exp.category &&
                importedCategories.includes(exp.category) &&
                !isNaN(exp.amount) &&
                exp.date
            );

            onImportSuccess(importedCategories, importedExpenses);

            alert(`Importación exitosa: ${importedCategories.length} categorías y ${importedExpenses.length} gastos cargados.`);
        } catch (err) {
            alert("Error al importar: " + err.message);
        }
    };
    reader.readAsText(file);
    // Clear input to allow loading the same file again
    event.target.value = '';
}
