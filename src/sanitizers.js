// Sanitiza y valida nombres de categoría
export function sanitizeCategoryName(name) {
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
export function sanitizeAmount(value) {
    let amount = parseFloat(value);
    if (isNaN(amount) || !isFinite(amount)) return NaN;
    // Asegurar que sea positivo (los gastos suelen serlo)
    amount = Math.abs(amount);
    // Limitar a un rango razonable y 2 decimales
    if (amount > 9999999.99) amount = 9999999.99;
    return Math.round(amount * 100) / 100;
}

// Sanitiza y valida la fecha (date)
export function sanitizeDate(dateStr) {
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
export function sanitizeDescription(text) {
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
export function sanitizePeriod(period) {
    const validPeriods = ['daily', 'weekly', 'monthly', 'total'];
    return validPeriods.includes(period) ? period : 'daily';
}
