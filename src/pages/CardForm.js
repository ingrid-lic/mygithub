import React from "react";
import { useNavigate } from "react-router-dom";
import "./CardForm.css";

const CardForm = () => {
  const navigate = useNavigate();

  const handleAddCard = () => {
    navigate("/card-add");
  };

  return (
    <div className="card-form-container">
      <div className="card-form-header">
        <span className="card-title">보유카드</span>
        <button className="close-button">x</button>
      </div>

      <div className="card-form-subtext">
        새로운 카드를 등록해주세요.
      </div>

      <div className="card-add-area" onClick={handleAddCard}>
        <div className="card-placeholder">
          <span className="plus-icon">+</span>
        </div>
      </div>
    </div>
  );
};

export default CardForm;
