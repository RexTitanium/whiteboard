

import React, { ReactElement } from 'react';

interface LoaderProps {
    style?: string,
    color?:string,
    width?:number,
    height?:number,
    borderSize?: number
}

const Loader:React.FC<LoaderProps> = ({style='', color='border-stone-500',width=12, height=12, borderSize=4}) => {
    return(
        <div className={`${style} flex items-center justify-center w-[-webkit-fill-available] h-[-webkit-fill-available] bg-transparent`}>
            <div className={`w-${width} h-${height} border-${borderSize} ${color} border-t-transparent rounded-full animate-spin`}></div>
        </div>
    )
}

export default Loader