export const formatDate = (dateString) => {
  if (!dateString) {
    return 'N/A';
  }
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) {
    return 'N/A';
  }
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return 'N/A';
  }
};
