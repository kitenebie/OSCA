export const adaptSmsTemplate = (text: string, recipientType: 'individual' | 'barangay' | 'all') => {
  if (recipientType === 'individual') return text;
  const greeting = recipientType === 'all' ? 'seniors of Juban' : '';
  const adapted = text.replace(/\[name\]/g, greeting).replace(/\s+!/g, '!');
  return recipientType === 'all' ? adapted.replace(/\[barangay\]\s*/g, '') : adapted;
};
