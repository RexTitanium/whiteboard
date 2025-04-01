import api from '../api/api';
import { Board } from '../types/types';

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

export const getBoardData = async (id: string): Promise<Board | null> => {
  try {
    const response = await api.get(`/boards/${id}`);
    return response.data || null;
  } catch (err) {
    console.error(`Error fetching Board for ${id}:`, err);
    return null;
  }
}

export const removeEmailFromShareList = async(id: string, email: string): Promise<string | null> => {
  console.log(id)
  console.log(email)
  const res = await api.delete(`/boards/${id}/share`, {
    data: { email: email },
  });

  return res.data.message || null
}
