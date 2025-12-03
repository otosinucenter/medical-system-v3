/**
 * Timezone Helpers for Peru Time (America/Lima, UTC-5)
 * Centralizes all timezone conversion logic
 */

/**
 * Format a date to Peru time (YYYY-MM-DD)
 * @param {Date|string} date - ISO date string or Date object
 * @returns {string} Date in YYYY-MM-DD format (Peru timezone)
 */
export function formatToPeruDate(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Lima',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(dateObj);
}

/**
 * Format a date to Peru time (HH:MM)
 * @param {Date|string} date - ISO date string or Date object
 * @returns {string} Time in HH:MM format (Peru timezone, 24hr)
 */
export function formatToPeruTime(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'America/Lima',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(dateObj);
}

/**
 * Get next available appointment date (Mon, Wed, Fri)
 * @returns {string} Date in YYYY-MM-DD format
 */
export function getNextAvailableDate() {
    let date = new Date();

    // Valid days: 1 (Mon), 3 (Wed), 5 (Fri)
    while (![1, 3, 5].includes(date.getDay())) {
        date.setDate(date.getDate() + 1);
    }

    // Use local time components to avoid timezone shifts
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * Get next N valid appointment dates (Mon, Wed, Fri)
 * @param {number} count - Number of dates to return
 * @returns {Date[]} Array of Date objects
 */
export function getNextValidDates(count = 7) {
    const dates = [];
    let current = new Date();

    while (dates.length < count) {
        const dayOfWeek = current.getDay();

        // Valid days: 1 (Mon), 3 (Wed), 5 (Fri)
        if ([1, 3, 5].includes(dayOfWeek)) {
            dates.push(new Date(current));
        }

        current.setDate(current.getDate() + 1);
    }

    return dates;
}

/**
 * Get current date/time in Peru timezone
 * @returns {string} ISO string with forced Peru timezone
 */
export function getNowInPeru() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Return ISO string with Peru offset
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}-05:00`;
}

/**
 * Create appointment date with forced Peru timezone
 * @param {string} date - YYYY-MM-DD
 * @param {string} time - HH:MM
 * @returns {Date} Date object
 */
export function createPeruAppointmentDate(date, time) {
    // Force Peru timezone by appending -05:00
    return new Date(`${date}T${time}:00-05:00`);
}
