import React from "react";

type Props = {
  onButtonClick: () => void;
  children: React.ReactNode;
};

export const BpmButton: React.FC<Props> = ({ onButtonClick, children }) => {
  return (
    <button onPointerDown={onButtonClick}>
      <div
        className="
        relative flex place-items-center 
        before:absolute 
        before:h-[300px]
        before:w-[480px] 
        before:-translate-x-1/2
        before:rounded-full 
        before:blur-2xl
        before:content-[''] 
        after:absolute
        after:-z-20
        after:h-[180px]
        after:w-[240px] 
        after:translate-x-1/3 
        after:bg-gradient-conic
        after:blur-3xl 
        after:content-[''] 
        before:bg-gradient-to-br 
        before:from-transparent 
        before:to-zinc-800 
        before:opacity-10 
        after:from-sky-900
        after:via-[#1d4ed8] 
        after:opacity-50
        z-[-1]"
      >
        {children}
      </div>
    </button>
  );
};