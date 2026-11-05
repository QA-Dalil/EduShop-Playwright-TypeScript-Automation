export const customer = {
  email: process.env.EDUSHOP_CUSTOMER_EMAIL ?? 'customer@test.com',
  password: process.env.EDUSHOP_CUSTOMER_PASSWORD ?? 'Customer123!'
};

export const apiBaseURL = process.env.EDUSHOP_API_URL ?? 'http://localhost:5000';
