import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCard } from '../context/CardContext';
import './CardAdd.css';

function CardAdd() {
  const navigate = useNavigate();

  const [cardNum1, setCardNum1] = useState('');
  const [cardNum2, setCardNum2] = useState('');
  const [cardNum3, setCardNum3] = useState('');
  const [cardNum4, setCardNum4] = useState('');

  const [expiryRaw, setExpiryRaw] = useState('');
  const [expiryDisplay, setExpiryDisplay] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [securityCodeRaw, setSecurityCodeRaw] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');

  const allFieldsFilled =
    cardNum1.length === 4 &&
    cardNum2.length === 4 &&
    cardNum3.length === 4 &&
    cardNum4.length === 4 &&
    expiryRaw.length === 4 &&
    ownerName.trim() !== '' &&
    securityCodeRaw.length === 3 &&
    password1 &&
    password2;


  const {addCard}=useCard();
    
  const handleSubmit = (e) => {
    e.preventDefault();

    const newCard = {
      number: `${cardNum1}${cardNum2}${cardNum3}${cardNum4}`,
      expiry: expiryRaw,
      owner: ownerName,
      securityCode: securityCodeRaw,
      password: `${password1}${password2}`,
    };

    addCard(newCard);

    navigate('/card-list');
  };


  const goBack = () => {
    navigate('/card-form');
  };

  const handleCardNumChange = (value, idx) => {
    const sanitized = value.replace(/[^0-9]/g, '').slice(0, 4);
    const setters = [setCardNum1, setCardNum2, setCardNum3, setCardNum4];
    setters[idx](sanitized);
  };

  const handleExpiryChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setExpiryRaw(raw);
    setExpiryDisplay(raw.length >= 3 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw);
  };

  const displayCardNumber = `${cardNum1 || ''} ${cardNum2 || ''} ${cardNum3 || ''} ${cardNum4 || ''}`;

  return (
    <div className="card-add-container">
      <div className="header">
        
        <button className="prev-button" onClick={goBack}><h4>{'< 카드 추가'}</h4></button>
      </div>

      <div className="card-visual">
        <div className="card-chip" />
        <div className="card-info-display">
          <span className="display-number">{displayCardNumber}</span>
          <span className="display-owner">{ownerName || 'NAME'}</span>
          <span className="display-expiry">{expiryDisplay || 'MM/YY'}</span>
        </div>
      </div>

      <form className="card-form" onSubmit={handleSubmit}>
        <label>카드 번호
        <div className='card-input-row'>
          {[cardNum1, cardNum2, cardNum3, cardNum4].map((val, idx) => (
            <input className='card-input-box'
              key={idx}
              type={idx < 2 ? 'text' : 'password'}
              value={val}
              onChange={(e) => handleCardNumChange(e.target.value, idx)}
              maxLength="4"
              placeholder="0000"
              required
            />
          ))}
        </div>
        </label>

        <label>만료일 (MM/YY)
          <input className='card-input-box'
            type="text"
            value={expiryDisplay}
            onChange={handleExpiryChange}
            maxLength="5"
            placeholder="MM/YY"
            required
          />
        </label>

        <label>카드 소유자 이름
          <input
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="카드에 표시된 이름과 동일하게 입력하세요."
            required
          />
        </label>

        <label>보안코드 (CVC)
          <input className='card-input-box'
            type="password"
            value={securityCodeRaw}
            onChange={(e) => setSecurityCodeRaw(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
            maxLength="3"
            placeholder="***"
            required
          />
        </label>

        <label>카드 비밀번호 (앞 2자리)</label>
        <div className="password-fields">
          <input
            type="password"
            maxLength="1"
            value={password1}
            onChange={(e) => setPassword1(e.target.value)}
            placeholder="*"
            required
          />
          <input
            type="password"
            maxLength="1"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            placeholder="*"
            required
          />
        </div>

        {allFieldsFilled && (
          <button type="submit" className="submit-button">작성 완료</button>
        )}
      </form>
    </div>
  );
}

export default CardAdd;
