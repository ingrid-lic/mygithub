import React from "react";
import { useNavigate } from "react-router-dom";
import { useCard } from "../context/CardContext"; // 카드 데이터를 가져오는 컨텍스트
import "./CardList.css"; // 스타일링 CSS

const CardList = () => {
  const navigate = useNavigate();
  const { cardList } = useCard(); // 카드 목록을 가져옴

  // 카드가 없을 경우 처리
  if (cardList.length === 0) {
    return <p>저장된 카드가 없습니다.</p>;
  }

  // 마지막 카드 정보 추출
  const latestCard = cardList[cardList.length - 1]; // 마지막으로 추가된 카드
  const displayCardNumber = latestCard.number.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-$2-****-****');
  const displayExpiry = latestCard.expiry.length === 4
    ? `${latestCard.expiry.slice(0, 2)}/${latestCard.expiry.slice(2)}`
    : latestCard.expiry;

  // 카드 추가 페이지로 이동
  const handleAddCard = () => {
    navigate("/card-add");
  };

  // 결제 처리 시 메시지 출력
  const handlePayment = () => {
    alert('결제 준비중입니다.');
  };

  return (
    <div className="card-form-container">
      <div className="card-form-header">
        <span className="card-title">보유카드</span>
        <button className="close-button">x</button>
      </div>

      <div className="card-form-subtext">
        현재 카드 목록
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

      {/* 카드 추가 버튼 */}
      <div className="card-add-area" onClick={handleAddCard}>
        <div className="card-placeholder">
          <span className="plus-icon">+</span>
        </div>
      </div>
    </div>
  );
};

export default CardList;