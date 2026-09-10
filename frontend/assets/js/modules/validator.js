const validator = {
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  },

  isNotEmpty(val) {
    return val !== null && val !== undefined && String(val).trim() !== '';
  },

  isMinLength(val, min) {
    return String(val).trim().length >= min;
  },

  doMatch(val1, val2) {
    return val1 === val2;
  }
};
