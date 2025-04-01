import api from "../../api/api";

export const uploadBoard = async (boardId: string, dataUrl: string): Promise<number> => {
  try {
    const response = await api.post(`/boards/${boardId}/upload`, { dataUrl });
    return response.status;
  } catch (err) {
    console.error('Failed to upload board:', err);
    return 500;
  }
};

export const shareBoard = async (
  boardId: string,
  email: string,
  permission: 'view' | 'edit'
): Promise<boolean> => {
  try {
    await api.post(`/boards/${boardId}/share`, { email, permission });
    return true;
  } catch (err) {
    console.error('Failed to share board:', err);
    return false;
  }
};

export const updateBoardPermission = async (
  boardId: string,
  email: string,
  permission: 'view' | 'edit'
): Promise<boolean> => {
  try {
    await api.post(`/boards/${boardId}/share`, { email, permission });
    return true;
  } catch (err) {
    console.error('Failed to update permission:', err);
    return false;
  }
};