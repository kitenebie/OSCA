export const capitalizeInput = (value: string) =>
  value.replace(/(^|\s)(\p{L})/gu, (_, space, letter) => space + letter.toUpperCase());
