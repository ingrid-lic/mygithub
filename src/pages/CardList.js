import React from "react";
import { useNavigate } from "react-router-dom";
import { useCard } from "../context/CardContext"; 
import "./CardList.css"; 

const CardList = () => {
  const navigate = useNavigate();
  const { cardList } = useCard(); 

  if (cardList.length === 0) {
    return <p><h3>현재 등록된 카드가 없습니다.</h3></p>;
  }

  const latestCard = cardList[cardList.length - 1];
  const displayCardNumber = latestCard.number.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-$2-****-****');
  const displayExpiry = latestCard.expiry.length === 4
    ? `${latestCard.expiry.slice(0, 2)}/${latestCard.expiry.slice(2)}`
    : latestCard.expiry;

  const handleAddCard = () => {
    navigate("/card-add");
  };

  const handlePayment = () => {
    navigate("/payment-complete");
  };


  return (
    <div className="card-form-container">
      <div className="card-form-header">
        <span className="card-title">보유 카드</span>
        <button className="close-button">x</button>
      </div>

      <div className="card-form-subtext">
        현재 등록된 카드
      </div>

      <div className="card-visual">
        <div className="card-chip" />
        <div className="card-info-display">
          <span className="display-number">{displayCardNumber}</span>
          <span className="display-owner">{latestCard.owner}</span>
          <span className="display-expiry">{displayExpiry}</span>
        </div>
      </div>

      <div className="card-payment-button">
        <button
          className="styled-payment-button"
          onClick={handlePayment}
        >
          이 카드로 결제하기
        </button>
      </div>

      <div className="card-add-area" onClick={handleAddCard}>
        <div className="card-placeholder">
          <span className="plus-icon">+</span>
        </div>
      </div>
    </div>
  );
};

export default CardList;