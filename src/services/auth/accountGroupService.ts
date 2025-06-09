import { API_BASE_URL, defaultHeaders } from './config';

export interface AccountGroup {
  id: string;
  name: string;
  description: string;  
}

export const getAccountGroups = async (): Promise<AccountGroup[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/account-groups`, {
      method: 'GET',
      headers: defaultHeaders
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    
    return data;
  } catch (error) {
    console.error('Error fetching account groups:', error);
    throw error;
  }
}; 