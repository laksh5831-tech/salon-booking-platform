module.exports = {
  ROLES: {
    CUSTOMER: 'customer',
    SALON_OWNER: 'salon_owner',
    SALON_MANAGER: 'salon_manager',
    STAFF: 'staff',
    ADMIN: 'admin'
  },
  APPOINTMENT_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show'
  },
  DAYS_OF_WEEK: [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ],
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 50
  },
  CACHE_TTL: 300
};
