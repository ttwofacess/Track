import { sanitizePeriod, sanitizeDate } from './sanitizers.js';

// Update the expense summary based on period and date filters
export function updateSummary(expenses) {
    const periodSelect = document.getElementById('periodSelect');
    const specificDateInput = document.getElementById('specificDate');
    const datePickerContainer = document.getElementById('datePickerContainer');

    if (!periodSelect || !specificDateInput) return;

    // Sanitize and validate the period
    const rawPeriod = periodSelect.value;
    const period = sanitizePeriod(rawPeriod);

    // If the value was invalid (e.g. injected via console), sync UI
    if (rawPeriod !== period) {
        periodSelect.value = period;
    }

    // Show or hide the date picker
    if (period === 'daily' || period === 'weekly' || period === 'monthly') {
        datePickerContainer.style.display = 'block';
    } else {
        datePickerContainer.style.display = 'none';
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Determine the reference date for filtering
    let targetDate = today;
    const rawDate = specificDateInput.value;
    const sanitizedDateStr = sanitizeDate(rawDate);

    if (sanitizedDateStr) {
        const [year, month, day] = sanitizedDateStr.split('-').map(Number);
        targetDate = new Date(year, month - 1, day);
    } else {
        // If the input value is invalid, force today's date
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
