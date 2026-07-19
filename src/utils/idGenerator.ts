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

export const renderBarcodeBits = (text: string) => {
  const clean = text.toUpperCase().replace(/[^A-Z0-9\-\.\s\$\/\+\%]/g, '');
  const data = `*${clean}*`;
  
  const CODE39_MAP: Record<string, string> = {
    '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
    '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
    '8': '100100100', '9': '001100100', 'A': '100001001', 'B': '001001001',
    'C': '101001000', 'D': '000011001', 'E': '100011000', 'F': '001011000',
    'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
    'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
    'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
    'S': '001000110', 'T': '000010110', 'U': '110000001', 'V': '011000001',
    'W': '111000000', 'X': '010010001', 'Y': '110010000', 'Z': '011010000',
    '-': '010000101', '.': '110000100', ' ': '011000100', '*': '010010100',
    '$': '010101000', '/': '010100010', '+': '010001010', '%': '000101010'
  };

  let x = 0;
  const bars: { x: number; width: number; isBlack: boolean }[] = [];
  
  for (let i = 0; i < data.length; i++) {
    const char = data[i];
    const pattern = CODE39_MAP[char] || CODE39_MAP['*'];
    for (let j = 0; j < 9; j++) {
      const isBlack = (j % 2 === 0);
      const isWide = pattern[j] === '1';
      const width = isWide ? 3.5 : 1.2;
      bars.push({ x, width, isBlack });
      x += width;
    }
    bars.push({ x, width: 1.2, isBlack: false });
    x += 1.2;
  }

  return { bars, totalWidth: x };
};

