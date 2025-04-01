import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BoardTabs from '../../components/Board/BoardTabs';
import BoardCard from '../../components/Board/BoardCard';
import NewBoardCard from '../../components/Board/NewBoardCard';
import SearchBar from '../../components/SearchBar';
import { Moon, Sun, XIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBoard } from '../../context/BoardContext';
import Login from '../Login';
import Register from '../Register';
import ToolButton from '../../components/Toolbar/ToolButton';
import { deleteBoardById } from '../../utils/utils';

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recent' | 'shared' | 'all'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState<boolean>(document.documentElement.classList.contains('dark'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    allBoards: boards,
    recentBoardIds,
    handleDeleteBoard,
    fetchBoardsAndRecents,
    createNewBoard,
  } = useBoard();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [signInView, setSignInView] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (user) fetchBoardsAndRecents();
  }, [user]);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark((prev) => !prev);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleCreate = async () => {
    try {
      const id = await createNewBoard();
      navigate(`/board/${id}`);
    } catch (err) {
      console.log(err)
    }
  };

  const handleDelete = async (id: string) => {
    await handleDeleteBoard(id)
  };

  const openBoard = async (id: string) => {
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
                {signInView === 'login' ? <div></div> : (
                  <Register
                    changePage={() => setSignInView((prev) => (prev === 'login' ? 'register':'login'))}
                    onSuccess={() => setShowSignInModal(false)}
                  />
                )}
                {signInView === 'register' ? <div></div> : (
                  <Login
                    changePage={() => setSignInView((prev) => (prev === 'login' ? 'register':'login'))}
                    onSuccess={() => {
                      fetchBoardsAndRecents();
                      setShowSignInModal(false);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
