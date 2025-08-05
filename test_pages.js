import React, { createContext, useState, useContext } from "react";

// 1. Context 생성
const CardContext = createContext();

// 2. 외부에서 사용하기 위한 Hook
export const useCards = () => useContext(CardContext);

// 3. Provider 정의
export const CardProvider = ({ children }) => {
  const [registeredCards, setRegisteredCards] = useState([]);

  // 카드 추가 함수
  const addCard = (card) => {
    setRegisteredCards((prev) => [
      ...prev,
      { ...card, id: Date.now() + Math.random() }, // 고유 id 부여
    ]);
  };

  // 카드 삭제 함수
  const deleteCard = (id) => {
    setRegisteredCards((prev) => prev.filter((card) => card.id !== id));
  };

  // 전달할 상태와 함수들
  const value = { registeredCards, addCard, deleteCard };

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
};