'use client'

import { createContext, useContext, useState } from "react";

interface DropdownContextType {
  isBurgerDropdownOpen: boolean;
  toggleBurgerDropdown: () => void;
  closeBurgerDropdown: () => void;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

export const DropdownProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBurgerDropdownOpen, setBurgerDropdownOpen] = useState(false);

  const toggleBurgerDropdown = () => {
    setBurgerDropdownOpen((prev) => !prev);
  };

  const closeBurgerDropdown = () => {
    setBurgerDropdownOpen(false);
  };

  return (
    <DropdownContext.Provider
      value={{
        isBurgerDropdownOpen,
        toggleBurgerDropdown,
        closeBurgerDropdown,
      }}
    >
      {children}
    </DropdownContext.Provider>
  );
};

export const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("useDropdown must be used within a DropdownProvider");
  }
  return context;
};
