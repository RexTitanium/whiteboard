import api from '../api/api';

/**
 * Fetch userId from email using backend API
 * @param email - Email of the user
 * @returns userId string or null
 */

export const getUserIdFromEmail = async (email: string): Promise<string | null> => {
  try {
    const response = await api.get(`/users/id-from-email`, {
      params: { email },
    });
    return response.data.userId || null;
  } catch (err) {
    console.error(`Error fetching userId for ${email}:`, err);
    return null;
  }
};
