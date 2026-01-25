import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicket } from '../../context/TicketContext';
import './OrderSuccessPage.css';

function OrderSuccessPage() {
  const navigate = useNavigate();
  const { orderDetails, resetTicket } = useTicket(); // Изменили resetOrder на resetTicket
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);

  useEffect(() => {
    // Если нет данных заказа, перенаправляем на главную
    if (!orderDetails) {
      navigate('/');
    }

    // Через 5 минут сбрасываем состояние заказа
    const timer = setTimeout(() => {
      resetTicket(); // Изменили resetOrder на resetTicket
    }, 5 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [orderDetails, navigate, resetTicket]); // Изменили resetOrder на resetTicket

  const handleRatingClick = (value) => {
    if (!isRatingSubmitted) {
      setRating(value);
      // В реальном приложении здесь был бы запрос к API
      setTimeout(() => {
        setIsRatingSubmitted(true);
      }, 500);
    }
  };

  const handleRatingHover = (value) => {
    if (!isRatingSubmitted) {
      setHoverRating(value);
    }
  };

  const handleRatingLeave = () => {
    if (!isRatingSubmitted) {
      setHoverRating(0);
    }
  };

  const handleReturnHome = () => {
    resetTicket(); // Изменили resetOrder на resetTicket
    navigate('/');
  };

  const handlePrintTickets = () => {
    window.print();
  };

  if (!orderDetails) {
    return null;
  }

  const formatPrice = (price) => {
    return price.toLocaleString('ru-RU');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getPassengerName = () => {
    const firstPassenger = orderDetails.passengers[0];
    if (firstPassenger) {
      return `${firstPassenger.firstName} ${firstPassenger.middleName}`;
    }
    return '';
  };

  return (
    <div className="order-success-page">
      <div className="order-success-page__container">
        {/* Основное содержимое */}
        <div className="order-success">
          {/* Заголовок */}
          <div className="order-success__header">
            <div className="order-success__icon">🎉</div>
            <h1 className="order-success__title">Благодарим Вас за заказ!</h1>
            <p className="order-success__subtitle">
              Ваш заказ успешно оформлен и оплачен
            </p>
          </div>

          {/* Информация о заказе */}
          <div className="order-success__info">
            <div className="order-success__order-number">
              <span className="order-success__info-label">Номер заказа:</span>
              <span className="order-success__order-value">{orderDetails.id}</span>
            </div>
            
            <div className="order-success__order-total">
              <span className="order-success__info-label">Сумма заказа:</span>
              <span className="order-success__total-value">
                {formatPrice(orderDetails.total)} ₽
              </span>
            </div>
            
            <div className="order-success__order-date">
              <span className="order-success__info-label">Дата и время заказа:</span>
              <span className="order-success__date-value">
                {formatDate(orderDetails.date)}
              </span>
            </div>
          </div>

          {/* Сообщение для пользователя */}
          <div className="order-success__message">
            <div className="order-success__greeting">
              {getPassengerName()}!
            </div>
            <p className="order-success__text">
              Ваш заказ успешно оформлен. В ближайшее время с вами свяжется 
              наш оператор для подтверждения.
            </p>
            <p className="order-success__text">
              Благодарим Вас за оказанное доверие и желаем приятного путешествия!
            </p>
          </div>

          {/* Инструкции */}
          <div className="order-success__instructions">
            <h2 className="order-success__instructions-title">
              Что делать дальше?
            </h2>
            
            <div className="order-success__instructions-list">
              <div className="order-success__instruction">
                <div className="order-success__instruction-icon">📧</div>
                <div className="order-success__instruction-content">
                  <h3 className="order-success__instruction-title">
                    Билеты отправлены на e-mail
                  </h3>
                  <p className="order-success__instruction-text">
                    Электронные билеты отправлены на указанный при оформлении 
                    e-mail адрес. Проверьте папку «Входящие» и «Спам».
                  </p>
                </div>
              </div>
              
              <div className="order-success__instruction">
                <div className="order-success__instruction-icon">🖨️</div>
                <div className="order-success__instruction-content">
                  <h3 className="order-success__instruction-title">
                    Распечатайте билеты
                  </h3>
                  <p className="order-success__instruction-text">
                    Распечатайте и сохраняйте билеты до даты поездки. 
                    При утере билетов обратитесь в службу поддержки.
                  </p>
                </div>
              </div>
              
              <div className="order-success__instruction">
                <div className="order-success__instruction-icon">🎫</div>
                <div className="order-success__instruction-content">
                  <h3 className="order-success__instruction-title">
                    Предъявите при посадке
                  </h3>
                  <p className="order-success__instruction-text">
                    Предъявите распечатанные билеты и документ, удостоверяющий 
                    личность, при посадке на поезд.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="order-success__actions">
            <button 
              className="order-success__action order-success__action--print"
              onClick={handlePrintTickets}
            >
              🖨️ Распечатать билеты
            </button>
            
            <button 
              className="order-success__action order-success__action--email"
              onClick={() => window.location.href = 'mailto:'}
            >
              📧 Отправить на e-mail
            </button>
            
            <button 
              className="order-success__action order-success__action--home"
              onClick={handleReturnHome}
            >
              🏠 Вернуться на главную
            </button>
          </div>

          {/* Оценка сервиса */}
          <div className="order-success__rating">
            <h2 className="order-success__rating-title">
              Оцените наш сервис
            </h2>
            
            {isRatingSubmitted ? (
              <div className="order-success__rating-thanks">
                <div className="order-success__rating-thanks-icon">❤️</div>
                <p className="order-success__rating-thanks-text">
                  Спасибо за вашу оценку! Мы ценим ваше мнение.
                </p>
              </div>
            ) : (
              <>
                <div className="order-success__rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`order-success__rating-star ${
                        star <= (hoverRating || rating) 
                          ? 'order-success__rating-star--active' 
                          : ''
                      }`}
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => handleRatingHover(star)}
                      onMouseLeave={handleRatingLeave}
                      aria-label={`Оценить на ${star} звезд`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                
                <div className="order-success__rating-labels">
                  <span className="order-success__rating-label">Плохо</span>
                  <span className="order-success__rating-label">Отлично</span>
                </div>
              </>
            )}
          </div>

          {/* Детали поездки (для печати) */}
          <div className="order-success__print-details">
            <h2 className="order-success__print-title">Детали поездки</h2>
            
            <div className="order-success__print-trip">
              <div className="order-success__print-train">
                <strong>Поезд:</strong> №{orderDetails.train.number} {orderDetails.train.name}
              </div>
              
              <div className="order-success__print-route">
                <div className="order-success__print-station">
                  <strong>Отправление:</strong> {orderDetails.train.fromCity}, 
                  {orderDetails.train.fromStation} - {orderDetails.train.departureTime}
                </div>
                
                <div className="order-success__print-station">
                  <strong>Прибытие:</strong> {orderDetails.train.toCity}, 
                  {orderDetails.train.toStation} - {orderDetails.train.arrivalTime}
                </div>
              </div>
              
              <div className="order-success__print-wagon">
                <strong>Вагон:</strong> №{orderDetails.wagon.number}, 
                Места: {orderDetails.seats.join(', ')}
              </div>
            </div>
            
            <div className="order-success__print-passengers">
              <h3 className="order-success__print-passengers-title">Пассажиры:</h3>
              {orderDetails.passengers.map((passenger, index) => (
                <div key={index} className="order-success__print-passenger">
                  {passenger.lastName} {passenger.firstName} {passenger.middleName}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Боковая панель */}
        <aside className="order-success-page__sidebar">
          {/* Контакты поддержки */}
          <div className="order-success__support">
            <h3 className="order-success__support-title">Поддержка</h3>
            
            <div className="order-success__support-contacts">
              <a href="tel:88000000000" className="order-success__support-phone">
                📞 8 (800) 000-00-00
              </a>
              <a href="mailto:support@train-tickets.ru" className="order-success__support-email">
                ✉️ support@train-tickets.ru
              </a>
            </div>
            
            <div className="order-success__support-hours">
              <div className="order-success__support-hours-icon">🕒</div>
              <div className="order-success__support-hours-text">
                Круглосуточная поддержка
              </div>
            </div>
          </div>

          {/* Дополнительная информация */}
          <div className="order-success__additional">
            <h3 className="order-success__additional-title">Полезная информация</h3>
            
            <div className="order-success__additional-list">
              <a href="#" className="order-success__additional-link">
                📋 Правила перевозки
              </a>
              <a href="#" className="order-success__additional-link">
                💼 Возврат билетов
              </a>
              <a href="#" className="order-success__additional-link">
                📱 Мобильное приложение
              </a>
              <a href="#" className="order-success__additional-link">
                ❓ Частые вопросы
              </a>
            </div>
          </div>

          {/* QR-код */}
          <div className="order-success__qr">
            <div className="order-success__qr-code">
              {/* Здесь будет QR-код */}
              <div className="order-success__qr-placeholder">
                [QR-код]
              </div>
            </div>
            <p className="order-success__qr-text">
              Отсканируйте для сохранения в телефон
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
