export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const formatTime = (date: string | Date) => {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
