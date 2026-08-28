export const ROLES = {
  CUSTOMER: 'customer',
  SALON_OWNER: 'salon_owner',
  SALON_MANAGER: 'salon_manager',
  STAFF: 'staff',
  ADMIN: 'admin'
};

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
};

export const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show'
};

export const STATUS_COLORS = {
  pending: 'warning',
  confirmed: 'primary',
  completed: 'success',
  cancelled: 'danger',
  no_show: 'secondary'
};

export const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

export const DAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

export const PLACEHOLDER_IMAGES = {
  salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=500&fit=crop',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  service: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop',
  hero: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&h=900&fit=crop'
};

export const CANCELLATION_REASONS = [
  'Schedule conflict',
  'Found another salon',
  'Personal reasons',
  'Weather conditions',
  'Health issues',
  'Other'
];
