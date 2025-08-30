import React, { createContext, useState, useContext } from "react";

// 1. Context ����
const CardContext = createContext();

// 2. �ܺο��� ����ϱ� ���� Hook
export const useCards = () => useContext(CardContext);

// 3. Provider ����
export const CardProvider = ({ children }) => {
  const [registeredCards, setRegisteredCards] = useState([]);

  // ī�� �߰� �Լ�
  const addCard = (card) => {
    setRegisteredCards((prev) => [
      ...prev,
      { ...card, id: Date.now() + Math.random() }, // ���� id �ο�
    ]);
  };

  // ī�� ���� �Լ�
  const deleteCard = (id) => {
    setRegisteredCards((prev) => prev.filter((card) => card.id !== id));
  };

  // ������ ���¿� �Լ���
  const value = { registeredCards, addCard, deleteCard };

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
};