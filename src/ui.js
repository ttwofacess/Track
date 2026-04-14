import { sanitizeAmount, sanitizeDate } from './sanitizers.js';

// Initialize date inputs with min/max constraints and default values
export function initDateInputs() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Date limits: 10 years back, 1 year future
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
        dateInput.value = todayStr; // Default value: today
    }

    const specificDateInput = document.getElementById('specificDate');
    if (specificDateInput) {
        specificDateInput.min = minDateStr;
        specificDateInput.max = maxDateStr;
        specificDateInput.value = todayStr;
    }
}

// Initialize amount input validation
export function initAmountInput() {
    const amountInput = document.getElementById('amount');
    if (amountInput) {
        // Prevent non-numeric characters
        amountInput.addEventListener('keydown', function(e) {
            if (['e', 'E', '+', '-'].includes(e.key)) {
                e.preventDefault();
            }
        });

        // Ensure 2 decimals on blur
        amountInput.addEventListener('blur', function() {
            const val = sanitizeAmount(this.value);
            if (!isNaN(val)) {
                this.value = val.toFixed(2);
            }
        });
    }
}

// Initialize section toggle functionality
export function initToggleSections() {
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
}
