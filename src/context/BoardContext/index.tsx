import React, { createContext, useContext, useState } from 'react';
import { Board } from '../../types/types';
import api from '../../api/api';
import { createBoard, deleteBoardById } from '../../utils/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

interface BoardContextType {
    board: Board | null;
    setBoard: React.Dispatch<React.SetStateAction<Board | null>>;
    allBoards: Record<string, Board>;
    setAllBoards: React.Dispatch<React.SetStateAction<Record<string, Board>>>;
    permission: 'view' | 'edit';
    setPermission: React.Dispatch<React.SetStateAction<'view' | 'edit'>>;
    sharedWith: { userId: string; email: string; permission: 'view' | 'edit' }[];
    setSharedWith: React.Dispatch<React.SetStateAction<{ userId: string; email: string; permission: 'view' | 'edit' }[]>>;
    recentBoardIds: string[],
    setRecentBoardIds: React.Dispatch<React.SetStateAction<string[]>>;
    fetchBoardsAndRecents: () => void;
    fetchBoardById: (id: string, userId: string, navigate: (path: string) => void) => void;
    handleDeleteBoard: (id:string) => void;
    createNewBoard: () => void;
}

const BoardContext = createContext<BoardContextType | null>(null);

export const BoardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {board, setBoard} = useAuth()
    const [allBoards, setAllBoards] = useState<Record<string, Board>>({});
    const [permission, setPermission] = useState<'view' | 'edit'>('edit');
    const [sharedWith, setSharedWith] = useState<BoardContextType['sharedWith']>([]);
    const [recentBoardIds, setRecentBoardIds] = useState<string[]>([]);

    const getUniqueBoardName = (base = 'Untitled') => {
        let name = base;
        let count = 1;
        const existingNames = Object.values(allBoards).map(b => b.name);
        while (existingNames.includes(name)) {
        name = `${base} (${count++})`;
        }
        return name;
    };


    const fetchBoardsAndRecents = async () => {
        try {
            const [boardsRes, recentsRes, sharedRes] = await Promise.all([
            api.get('/boards'),
            api.get('/auth/recents'), 
            api.get('/boards/shared'),
            ]);

            const boardsFromApi: Record<string, Board> = {};

            boardsRes.data.forEach((board: any) => {
            boardsFromApi[board._id] = { ...board };
            });

            sharedRes.data.forEach((board: any) => {
            boardsFromApi[board._id] = {
                ...board,
                name: `${board.name} (Shared)`,
                shared: true,
            };
            });

            setAllBoards(boardsFromApi);

            const recentIds = recentsRes.data.map((board: any) => board._id);
            setRecentBoardIds(recentIds);
        } catch (err) {
            console.error('Error loading boards/recents/shared:', err);
        }
    };

    const fetchBoardById = async (id: string, userId: string, navigate: (path: string) => void) => {
        try {
            setBoard(null);
            setPermission('view');
            setSharedWith([]);
            
            const res = await api.get(`/boards/${id}`);
            const boardData = res.data;

            setSharedWith(boardData.sharedWith);
            setBoard({
                _id: id,
                name: boardData.name,
                data: boardData.data,
                userId: boardData.userId,
            });
            setAllBoards((prev) => ({
                ...prev,
                [id]: {
                    _id: id,
                    name: boardData.name,
                    data: boardData.data,
                    userId: boardData.userId,
                },
                }));

            if (boardData.userId === userId) {
                setPermission('edit');
            } else {
                const sharedEntry = boardData.sharedWith?.find((entry: any) => entry.userId === userId);
                setPermission(sharedEntry?.permission || 'view');
            }
            return res
        } catch (err) {
            console.error(`Board Fetch Error: ${err}`)
            navigate('/')
        }
    };

    const createNewBoard = async () => {
        try {
            const data = await createBoard(getUniqueBoardName())
            const createdBoard = data;
            const id = createdBoard._id;

            const newBoards = {
                ...allBoards,
                [id]: { name: createdBoard.name, data: createdBoard.data },
            };
            setAllBoards(newBoards);
            localStorage.setItem('savedBoards', JSON.stringify(newBoards));

            const updated = [id, ...recentBoardIds.filter(bid => bid !== id)].slice(0, 10);
            setRecentBoardIds(updated);
            localStorage.setItem('recentBoards', JSON.stringify(updated));
            return id
        } catch (err) {
            console.log(err)
            return err
        }
    }

    const handleDeleteBoard = async(id:string) => {
        try {
            const resp = await deleteBoardById(id)
            const updated = { ...allBoards };
            delete updated[id];
            setAllBoards(updated);
            const updatedRecents = recentBoardIds.filter(bid => bid !== id);
            setRecentBoardIds(updatedRecents);
            localStorage.setItem('recentBoards', JSON.stringify(updatedRecents));
            console.log(resp)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <BoardContext.Provider value={{
        board,
        setBoard,
        allBoards,
        setAllBoards,
        permission,
        setPermission,
        sharedWith,
        setSharedWith,
        recentBoardIds,
        setRecentBoardIds,
        fetchBoardsAndRecents,
        fetchBoardById,
        createNewBoard,
        handleDeleteBoard,
        }}>
        {children}
        </BoardContext.Provider>
    );
};

export const useBoard = () => {
    const context = useContext(BoardContext);
    if (!context) throw new Error('useBoard must be used within a BoardProvider');
    return context;
};