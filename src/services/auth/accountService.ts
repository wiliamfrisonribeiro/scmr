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

export const updateAccountDetails = async (accountId: string, details: {
  street: string;
  city: string;
  cep: string;
  phone: string;
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/details`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(details)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating account details:', error);
    throw error;
  }
};

export const getAccountDetails = async (accountId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/details`, {
      method: 'GET',
      headers: defaultHeaders
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching account details:', error);
    throw error;
  }
};

export const getAllAccounts = async () => {
  try {
 

    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    

    const requestOptions: RequestInit = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow" as RequestRedirect
    };

    const response = await fetch(`${API_BASE_URL}/accounts`, requestOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching all accounts:', error);
    throw error;
  }
}; 