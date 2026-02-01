import React, { createContext, useState, useContext } from "react";

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);

  return (
    <MenuContext.Provider
      value={{ menuItems, setMenuItems, orders, setOrders }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => useContext(MenuContext);
