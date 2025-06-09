export const API_BASE_URL = 'https://smrc.onrender.com';

export const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    ...defaultHeaders,
    'Authorization': token ? `Bearer ${token}` : ''
  };
}; 