import { API_BASE_URL, defaultHeaders } from './config';
 

interface CreateAccountData {
  name: string;
  email: string;
  cpf: string;
  birthday: string;
  account_group_id: string;
  password: string;
}

export const createAccount = async (accountData: CreateAccountData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/accounts`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(accountData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
}; 