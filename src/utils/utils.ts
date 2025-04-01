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
  try {
  const res = await api.delete(`/boards/${id}/share`, {
    data: { email: email },
  });
  
  return res.data.message || null
  }catch (err) {
    console.error(`Error Renaming File: ${err}`);
    return null
  }

}

export const renameFile = async(id: string, newFileName: string): Promise<string> => {
  try {
      await api.put(`/boards/${id}`, { name: newFileName });
      return `Renamed Board to ${newFileName}`
    } catch (err) {
      console.error('Failed to rename board:', err);
      return `Failed to rename board`
    }
}