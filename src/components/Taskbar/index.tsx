import React, { useState } from 'react'
import { TaskbarProps } from '../../types/types'
import Toolbar from '../Toolbar'
import { XIcon, Download, MoveLeft, Share2, X, XCircle, PlusCircle } from 'lucide-react'
import ToolButton from '../Toolbar/ToolButton'
import { useAuth } from '../../context/AuthContext'
import { removeEmailFromShareList } from '../../utils/utils'

const Taskbar: React.FC<TaskbarProps> = ({
  handleBackButton,
  fileName,
  setFileName,
  downloadBoard,
  saveBoard,
  onShare,
  undo,
  redo,
  clearCanvas,
  permission,
  sharedUsers,
  setSharedUsers,
  handlePermissionChange,
}) => {
  const isReadOnly = permission === 'view'
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareEmail, setShareEmail] = useState('')
  const [sharePermission, setSharePermission] = useState<'view' | 'edit'>('view')
  const [fName, setFName] = useState<string>(fileName)

  const { user, board } = useAuth();

  const handleRemoveShareEmail = async (email: string) => {
    if (board) {
      const resp = await removeEmailFromShareList(board._id, email)
      if(resp) setSharedUsers((prev) => prev.filter((u) => u.email !== email))
    }
  }

  const handleFileRename = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
      setFileName(fName)
    }
  } 

  const handleShareToEmail = () => {
    if (onShare && shareEmail && sharePermission) {
    onShare(shareEmail, sharePermission);
    setShareEmail('');
    setSharePermission('view');
    }
  }

  return (
    <div className="w-full px-10 flex justify-between">
      <div className="flex gap-2">
        <div className="flex items-center gap-2 z-[999] bg-white rounded-xl shadow-sm border border-gray-200 w-10 h-10 dark:bg-stone-900 dark:border-stone-800 dark:shadow-md transition-all duration-300ms ease">
          <ToolButton icon={<MoveLeft size={20} strokeWidth={1.5} />} title="Back" onClick={handleBackButton} />
        </div>
        <div className="flex items-center gap-2 z-[999] p-2 bg-white rounded-xl shadow-sm border border-gray-200 h-10 dark:bg-stone-900 dark:border-stone-800 dark:shadow-md">
          <input
            type="text"
            value={fName}
            onChange={(e) => setFName(e.target.value)}
            onKeyDown={(e) => handleFileRename(e)}
            placeholder="Unnamed"
            disabled={isReadOnly}
            className={`px-2 py-1 text-sm text-[#999] border-gray-800 transition-all duration-300ms ease focus:outline-none focus:border-b-2 focus:text-black dark:bg-stone-900 dark:border-stone-800 dark:shadow-md ${
              isReadOnly
                ? 'text-gray-400 cursor-not-allowed'
                : 'dark:text-[#606060] dark:focus:border-[#606060] dark:focus:text-white'
            }`}
          />
        </div>
      </div>

      {!isReadOnly && (
        <Toolbar 
          saveBoard={saveBoard}
          undo={undo}
          redo={redo}
          clearCanvas={clearCanvas}
        />
      )}

      <div className="flex items-center gap-2 z-[100] transition-all duration-300ms ease">
        {!isReadOnly && (
          board?.userId == user?._id || sharedUsers.some((sharedUser) => sharedUser.email === user?.email)) && (
          <div className="h-10 w-10 flex transition-all duration-300ms ease items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-100 dark:bg-stone-900 dark:border-stone-800 dark:shadow-md dark:text-[#606060] dark:hover:bg-stone-800 dark:hover:text-[#b1b1b1]">
            <button onClick={() => setShowShareModal(true)}>
              <Share2 size={20} strokeWidth={1.5} />
            </button>
          </div>
        )}
        <div className="h-10 w-10 flex transition-all duration-300ms ease items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-100 dark:bg-stone-900 dark:border-stone-800 dark:shadow-md dark:text-[#606060] dark:hover:bg-stone-800 dark:hover:text-[#b1b1b1]">
          <button onClick={downloadBoard}>
            <Download size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[999]">
            <div className="bg-white px-6 py-5 rounded-3xl shadow-md dark:bg-stone-800 w-96 flex flex-col gap-5">
                <div className="w-full flex flex-row justify-between items-center">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">Share Board</div>
                    <ToolButton icon={<XIcon size={20} strokeWidth={1.5} />} onClick={() => setShowShareModal(!showShareModal)} title={'Close'} 
                        style='text-red-600 hover:bg-red-600 font-bold text-lg  transition-all duration-300ms ease hover:transition-[all 300ms ease] hover:text-white hover:rounded-full p-[1px]'
                    />
                </div>
            <div className="space-y-2 max-h-52 overflow-y-auto">
                {sharedUsers.map((user) => (
                <div key={user.email} className="flex items-center justify-between gap-2">
                    <button
                        onClick={() =>handleRemoveShareEmail(user.email)}
                        className="text-stone-500 hover:text-red-700 font-bold text-lg hover:transition-[all 150ms ease] transition-all duration-150ms ease"
                        title="Remove"
                    >
                    {<XCircle size={20} strokeWidth={1.5}/>}
                    </button>
                    <div className='flex flex-row justify-between items-center gap-2 w-full rounded-xl'>
                        <span className="truncate px-2 py-1 bg-[#ddd] text-[#555] w-full rounded-xl dark:bg-[#000]">{user.email}</span>
                            <select
                                value={user.permission}
                                onChange={(e) =>
                                    handlePermissionChange(user.email, e.target.value as 'view' | 'edit')
                                }
                                className="rounded p-1 dark:bg-stone-700 dark:text-white cursor-pointer px-2 py-1 bg-[#eee] rounded-xl focus:outline-none hover:bg-[#ddd]"
                            >
                                <option value="view">View</option>
                                <option value="edit">Edit</option>
                            </select>
                    </div>
                </div>
                ))}
                <div className="flex items-center gap-2">
                    <button
                    onClick={handleShareToEmail}
                    className="text-stone-500 transition-all duration-150ms ease font-bold text-lg hover:text-green-700 transition-[all 150ms ease] "
                    >
                    <PlusCircle size={20} strokeWidth={1.5}/>
                    </button>
                    <input
                        type="email"
                        placeholder="Enter email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        onKeyDown={(e) => 
                          { if(e.key === 'Enter') { 
                              e.currentTarget.blur()
                             handleShareToEmail()
                          }}}
                        className="truncate px-2 py-1 bg-[#eee] border-2 border-[#eee] w-full rounded-xl focus:outline-none focus:bg-white focus:transition[all 300ms ease] transition-[all 300ms ease] dark:bg-[#111] dark:border-[#141414] dark:text-[#eee]"
                    />
                    <select
                        value={sharePermission}
                        onChange={(e) => setSharePermission(e.target.value as 'view' | 'edit')}
                        className="rounded p-1 dark:bg-stone-700 dark:text-white cursor-pointer px-2 py-1 bg-[#eee] rounded-xl focus:outline-none hover:bg-[#ddd]"
                    >
                        <option value="edit">Edit</option>
                        <option value="view">View</option>
                    </select>
                </div>
            </div>
            </div>
        </div>
        )}

    </div>
  )
}

export default Taskbar
