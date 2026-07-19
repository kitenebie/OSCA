export const calculateAge = (birthdateStr: string): number => {
  const today = new Date();
  const birthDate = new Date(birthdateStr);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const formatOSCANumber = (seq: number): string => {
  const year = new Date().getFullYear();
  const paddedSeq = String(seq).padStart(4, '0');
  return `OSCA-CAR-${year}-${paddedSeq}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
