export const validateName = (name) => {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return {
      isValid: false,
      status: 400,
      message: "Missing or empty name parameter"
    };
  }

  return {
    isValid: true,
    value: name.trim()
  };
};