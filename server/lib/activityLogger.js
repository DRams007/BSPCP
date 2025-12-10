
/**
 * Log an activity to the admin_activities table
 * 
 * @param {Object} pool - Database pool connection
 * @param {Object} activity - Activity details
 * @param {string} activity.type - Activity type (e.g., 'application_submitted', 'payment_verified')
 * @param {string} activity.title - Short title for the activity
 * @param {string} activity.message - Detailed message
 * @param {string} [activity.priority='medium'] - Priority ('low', 'medium', 'high')
 * @param {string} [activity.relatedEntity] - Entity type (e.g., 'member', 'content')
 * @param {string} [activity.relatedId] - Entity ID
 * @param {string} [activity.adminId] - ID of the admin who performed the action (optional)
 * @param {Object} [activity.details] - Additional JSON details
 */
export async function logAdminActivity(pool, activity) {
    try {
        const {
            type,
            title,
            message,
            priority = 'medium',
            relatedEntity = null,
            relatedId = null,
            adminId = null,
            details = {}
        } = activity;

        const query = `
      INSERT INTO admin_activities (
        activity_type, title, message, priority, 
        related_entity, related_id, admin_id, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

        const values = [
            type,
            title,
            message,
            priority,
            relatedEntity,
            relatedId,
            adminId,
            JSON.stringify(details)
        ];

        const result = await pool.query(query, values);
        return result.rows[0].id;
    } catch (error) {
        console.error('❌ Failed to log admin activity:', error.message);
        // Don't throw - we don't want to break the main flow if logging fails
        return null;
    }
}
