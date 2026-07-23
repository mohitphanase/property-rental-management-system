export const validateLogin = (email, password) => {
  if (!email.trim()) {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return "Enter a valid email";
  }

  if (!password.trim()) {
    return "Password is required";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }

  return null;
};

export const validateRegister = (
  name,
  email,
  phone,
  password,
  confirmPassword
) => {
  if (!name.trim()) {
    return "Name is required";
  }

  if (!email.trim()) {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return "Enter a valid email";
  }

  if (!phone.trim()) {
    return "Phone number is required";
  }

  if (!/^[0-9]{10}$/.test(phone)) {
    return "Phone number must be 10 digits";
  }

  if (!password.trim()) {
    return "Password is required";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match";
  }

  return null;
};