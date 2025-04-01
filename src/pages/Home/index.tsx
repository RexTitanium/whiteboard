import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import BoardTabs from '../../components/Board/BoardTabs';
import BoardCard from '../../components/Board/BoardCard';
import NewBoardCard from '../../components/Board/NewBoardCard';
import SearchBar from '../../components/SearchBar';
import { Moon, Sun, XIcon } from 'lucide-react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import Login from '../Login';
import Register from '../Register';
import { Board } from '../../types/types';
import ToolButton from '../../components/Toolbar/ToolButton';

const Home: React.FC = () => {
  const [boards, setBoards] = useState<Record<string, { name: string; data: string; shared?: boolean }>>({});

  const [activeTab, setActiveTab] = useState<'recent' | 'shared' | 'all'>('recent');
  const [recentBoardIds, setRecentBoardIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState<boolean>(document.documentElement.classList.contains('dark'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [signInView, setSignInView] = useState<'login' | 'register'>('login')

  useEffect(() => {
    if (!user) {
      setBoards({});
      setRecentBoardIds([]);
      return;
    }
    fetchBoardsAndRecents();
  }, [user]);




  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark((prev) => !prev);
  };

  const getUniqueBoardName = (base = 'Untitled') => {
    let name = base;
    let count = 1;
    const existingNames = Object.values(boards).map(b => b.name);
    while (existingNames.includes(name)) {
      name = `${base} (${count++})`;
    }
    return name;
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleCreate = async () => {
    try {
      const res = await api.post('/boards/createBoard', {
        name: getUniqueBoardName(),
      });

      const createdBoard = res.data;
      const id = createdBoard._id;

      const newBoards = {
        ...boards,
        [id]: { name: createdBoard.name, data: createdBoard.data },
      };
      setBoards(newBoards);
      localStorage.setItem('savedBoards', JSON.stringify(newBoards));

      const updated = [id, ...recentBoardIds.filter(bid => bid !== id)].slice(0, 10);
      setRecentBoardIds(updated);
      localStorage.setItem('recentBoards', JSON.stringify(updated));

      navigate(`/board/${id}`);
    } catch (err) {
      console.error('Error creating board', err);
    }
  };


  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/boards/${id}`);
      const updated = { ...boards };
      delete updated[id];
      setBoards(updated);

      const updatedRecents = recentBoardIds.filter(bid => bid !== id);
      setRecentBoardIds(updatedRecents);
      localStorage.setItem('recentBoards', JSON.stringify(updatedRecents));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const openBoard = async (id: string) => {
    try {
      await api.post(`/boards/${id}/recent`);
    } catch (err) {
      console.warn('Could not update recent', err);
    }
    navigate(`/board/${id}`);
  };


  let filteredBoards = Object.entries(boards).filter(([id, board]) => {
     if (activeTab === 'shared') return (board as any).shared;
    if (activeTab === 'recent') return recentBoardIds.includes(id);
    return true;
  });

  if (activeTab === 'recent') {
    filteredBoards.sort((a, b) => recentBoardIds.indexOf(a[0]) - recentBoardIds.indexOf(b[0]));
  }

  if (searchQuery.trim()) {
    filteredBoards = filteredBoards.filter(([_, board]) =>
      board.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const fetchBoardsAndRecents = async () => {
    try {
      const [boardsRes, recentsRes, sharedRes] = await Promise.all([
        api.get('/boards'),
        api.get('/auth/recents'), 
        api.get('/boards/shared'),
      ]);

      const boardsFromApi: Record<string, { name: string; data: string; shared?: boolean }> = {};

      boardsRes.data.forEach((board: any) => {
        boardsFromApi[board._id] = { name: board.name, data: board.data, shared: board.shared || false };
      });

      sharedRes.data.forEach((board: any) => {
        boardsFromApi[board._id] = {
          name: `${board.name} (Shared)`,
          data: board.data,
          shared: true,
        };
      });


      setBoards(boardsFromApi);

      const recentIds = recentsRes.data.map((board: any) => board._id);
      setRecentBoardIds(recentIds);
    } catch (err) {
      console.error('Error loading boards, recents, or shared:', err);
    }
  };



  return (
    <div className="p-6 dark:bg-[#0f0f0f] min-h-screen transition-colors duration-300">
      <div className="flex justify-between items-center mb-4">
        <img src={'/images/logo.png'} className='h-[6.5vh] ml-4'/>
        <div className='flex flex-row gap-2'>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <button onClick={handleLogout} className="text-red-500 text-sm hover:underline">Logout</button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => setShowSignInModal(true)} className="bg-[#ddd] text-[#555] hover:bg-[#bbb] hover:text-[#222] dark:bg-[#222] transition-all duration-300 ease rounded-xl dark:text-white px-5 dark:hover:bg-[#000] hover:transition-[all 300ms ease]">Create Account/Sign In</button>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-stone-800 transition text-black dark:text-white"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        
      </div>
      <BoardTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab !== 'recent' && <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}

      <div className="flex gap-8 flex-wrap mt-4">
        <NewBoardCard onClick={handleCreate} />
        {filteredBoards.map(([id, { name, data }]) => (
          <BoardCard
            key={id}
            id={id}
            name={name}
            data={data}
            onSelect={openBoard}
            onDelete={handleDelete}
          />
        ))}
      </div>
      
      {/* Login Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="flex flex-row gap-10 h-[50vh] w-[50vw] justify-center items-center bg-white rounded-2xl shadow-lg dark:bg-black">
            <div className='relative w-full h-full flex justify-center items-center'>
              <ToolButton icon={<XIcon size={16} strokeWidth={1.5} />} onClick={() => setShowSignInModal(false)} title={'Close'} 
                        style='text-red-600 hover:bg-red-600 font-bold text-lg z-[999] transition-all duration-300ms ease hover:transition-[all 300ms ease] hover:text-white hover:rounded-full p-[1px] absolute top-2 right-2'
              />
              <div
                className={`absolute top-[5%] h-[90%] w-[50%] rounded-3xl overflow-hidden z-[100] transition-transform duration-500 ease-in-out ${
                  signInView === 'register' ? 'translate-x-[45%]' : '-translate-x-[45%]'
                }`}
              >
                <img src="/images/holder_login.jpg" className="object-cover w-full h-full" />
              </div>
              <div className='grid grid-cols-2 gap-10 w-full p-4 justify-center'>
                {signInView === 'login' ?
                <div></div>
                :
                  <Register
                    changePage = {() => setSignInView((prev) => (prev === 'login' ? 'register':'login'))}
                    onSuccess={() => {
                      setShowSignInModal(false);
                    }}
                  />
                }
                {signInView === 'register' ?
                <div></div>
                :
                <Login
                  changePage = {() => setSignInView((prev) => (prev === 'login' ? 'register':'login'))}
                  onSuccess={() => {
                    fetchBoardsAndRecents();
                    setShowSignInModal(false);
                  }}
              />}
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
