/**
 * Admin Audit Logger Helper
 * Provides standardized audit logging for admin actions across all endpoints
 */

/**
 * Log an admin action to the admin_audit_log table
 * @param {Object} pool - Database connection pool
 * @param {Object} params - Logging parameters
 * @param {string} params.adminId - UUID of the admin performing the action
 * @param {string} params.action - Action type (e.g., 'create_content', 'delete_member')
 * @param {string} params.resourceType - Type of resource (e.g., 'content', 'testimonial', 'member')
 * @param {string} [params.resourceId] - ID of the affected resource
 * @param {Object} [params.oldValues] - Previous state for change tracking
 * @param {Object} [params.newValues] - New state for change tracking
 * @param {string} [params.details] - Additional context/details
 * @param {Object} [params.req] - Express request object (for IP and user-agent)
 * @param {string} [params.status='success'] - Status of the action (success, failed, warning)
 * @returns {Promise<boolean>} - True if logging succeeded, false otherwise
 */
export async function logAdminAudit(pool, params) {
    const {
        adminId,
        action,
        resourceType,
        resourceId = null,
        oldValues = null,
        newValues = null,
        details = null,
        req = null,
        status = 'success'
    } = params;

    try {
        const client = await pool.connect();

        await client.query(
            `INSERT INTO admin_audit_log (
        admin_id, action, resource_type, resource_id, 
        old_values, new_values, ip_address, user_agent, status, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
                adminId,
                action,
                resourceType,
                resourceId,
                oldValues ? JSON.stringify(oldValues) : null,
                newValues ? JSON.stringify(newValues) : null,
                req?.ip || null,
                req?.get?.('User-Agent') || null,
                status,
                details
            ]
        );

        client.release();
        return true;
    } catch (error) {
        console.error('Error logging admin audit:', error);
        // Don't throw - audit logging shouldn't break main functionality
        return false;
    }
}

export default logAdminAudit;
