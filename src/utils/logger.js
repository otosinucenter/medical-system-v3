/**
 * Conditional Logger
 * Only logs in development mode, silent in production
 */

const isDev = import.meta.env.DEV;

export const logger = {
    log: (...args) => {
        if (isDev) console.log(...args);
    },

    error: (...args) => {
        if (isDev) console.error(...args);
    },

    warn: (...args) => {
        if (isDev) console.warn(...args);
    },

    info: (...args) => {
        if (isDev) console.info(...args);
    },

    // Always log critical errors (even in production)
    critical: (...args) => {
        console.error('[CRITICAL]', ...args);
    }
};

export default logger;
