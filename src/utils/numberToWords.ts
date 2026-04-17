export const numberToWords = (num: number): string => {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

  const convert_thousands = (n: number): string => {
    if (n >= 1000) return convert_hundreds(Math.floor(n / 1000)) + ' thousand ' + convert_hundreds(n % 1000);
    else return convert_hundreds(n);
  };

  const convert_hundreds = (n: number): string => {
    if (n > 99) return ones[Math.floor(n / 100)] + ' hundred ' + convert_tens(n % 100);
    else return convert_tens(n);
  };

  const convert_tens = (n: number): string => {
    if (n < 10) return ones[n];
    else if (n >= 10 && n < 20) return teens[n - 10];
    else {
      return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    }
  };

  if (num === 0) return 'zero';
  const result = convert_thousands(num);
  return (result.trim() + ' Rupees Only').toUpperCase();
};
