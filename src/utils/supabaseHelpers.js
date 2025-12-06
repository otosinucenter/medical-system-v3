/**
 * Supabase Query Helpers
 * Provides safe wrappers for database operations with consistent error handling
 */

import logger from './logger';

/**
 * Safe query wrapper with error handling and logging
 * @param {Function} queryFn - Async function that returns {data, error}
 * @param {string} context - Description of operation for logging
 * @returns {Promise<Object>} {data, error}
 */
export async function safeQuery(queryFn, context) {
    try {
        const result = await queryFn();

        if (result.error) {
            logger.error(`${context} error:`, result.error);
        }

        return result;
    } catch (err) {
        logger.critical(`${context} exception:`, err);
        return { data: null, error: err };
    }
}

/**
 * Safe update with optimistic UI pattern
 * @param {Function} updateFn - Async update function
 * @param {Function} optimisticUpdate - Function to update local state
 * @param {Function} revertFn - Function to revert on error
 * @param {string} context - Description for logging
 */
export async function optimisticUpdate(updateFn, optimisticUpdate, revertFn, context) {
    // Apply optimistic update immediately
    optimisticUpdate();

    try {
        const { error } = await updateFn();

        if (error) {
            logger.error(`${context} failed, reverting:`, error);
            revertFn();
            return { success: false, error };
        }

        return { success: true };
    } catch (err) {
        logger.critical(`${context} exception, reverting:`, err);
        revertFn();
        return { success: false, error: err };
    }
}

/**
 * Batch update with progress tracking
 * @param {Array} items - Items to update
 * @param {Function} updateFn - Function to update single item
 * @param {number} batchSize - Number of concurrent updates
 * @returns {Promise<Object>} {success: number, failed: number, errors: []}
 */
export async function batchUpdate(items, updateFn, batchSize = 5) {
    const results = { success: 0, failed: 0, errors: [] };

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const promises = batch.map(item => updateFn(item));

        const batchResults = await Promise.allSettled(promises);

        batchResults.forEach((result, index) => {
            if (result.status === 'fulfilled' && !result.value.error) {
                results.success++;
            } else {
                results.failed++;
                results.errors.push({
                    item: batch[index],
                    error: result.reason || result.value.error
                });
            }
        });
    }

    if (results.failed > 0) {
        logger.warn(`Batch update completed: ${results.success} success, ${results.failed} failed`);
    }

    return results;
}
