import * as yup from "yup";

const userSchema = yup.object().shape({
  firstName: yup.string().required().trim().min(3),
  lastName: yup.string().required().trim().min(3),
  email: yup.string().email().required().min(5),
  password: yup.string().required().min(6).max(14).trim(),
  address: yup.string().min(5).trim(),
  apartment: yup.string().min(5).trim(),
  city: yup.string().min(5).trim(),
  country: yup.string().min(5).trim(),
  phone: yup.string().min(7).trim(),
});

export default userSchema;
