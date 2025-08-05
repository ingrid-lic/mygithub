import React, { createContext, useContext, useState } from 'react';

const CardContext = createContext();

export const useCard = () => useContext(CardContext);

export const CardProvider = ({ children }) => {
  const [cardList, setCardList] = useState([]);

  const addCard = (card) => {
    setCardList((prev) => [...prev, card]);
  };

  return (
    <CardContext.Provider value={{ cardList, addCard }}>
      {children}
    </CardContext.Provider>
  );
};
