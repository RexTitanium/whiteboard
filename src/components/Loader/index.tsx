

import React, { ReactElement } from 'react';

const Loader:React.FC = () => {
    return(
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black">
            <div className="w-12 h-12 border-4 border-stone-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )
}

export default Loader