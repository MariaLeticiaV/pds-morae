function digitsOnly(value, limit) {
  return String(value ?? '').replace(/\D/g, '').slice(0, limit);
}

export function maskCpf(value) {
  const digits = digitsOnly(value, 11);

  if (digits.length > 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  if (digits.length > 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  if (digits.length > 3) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }
  return digits;
}

export function maskCep(value) {
  const digits = digitsOnly(value, 8);
  return digits.length > 5
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : digits;
}

export function maskCellPhone(value) {
  const digits = digitsOnly(value, 11);
  if (digits.length <= 2) {
    return digits.length === 2 ? `(${digits})` : digits ? `(${digits}` : '';
  }

  const areaCode = digits.slice(0, 2);
  const number = digits.slice(2);
  const firstPartLength = digits.length > 10 ? 5 : 4;
  const firstPart = number.slice(0, firstPartLength);
  const lastPart = number.slice(firstPartLength);

  return `(${areaCode}) ${firstPart}${lastPart ? `-${lastPart}` : ''}`;
}
