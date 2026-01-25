import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicket } from '../../context/TicketContext';
import OrderSteps from '../../components/OrderSteps/OrderSteps';
import PaymentMethod from '../../components/PaymentMethod/PaymentMethod';
import './PaymentPage.css';

function PaymentPage() {
  const navigate = useNavigate();
  const { 
    selectedTrain,
    selectedWagon,
    selectedSeats,
    passengers,
    total,
    setOrder,
    cardData,
    setCardData
  } = useTicket();

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [agreement, setAgreement] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardFormValid, setCardFormValid] = useState(false);

  // Проверка наличия всех необходимых данных
  useEffect(() => {
    if (!selectedTrain || !selectedWagon || selectedSeats.length === 0 || passengers.length === 0) {
      navigate('/seats');
    }
  }, [selectedTrain, selectedWagon, selectedSeats.length, passengers.length, navigate]);

  // Проверка валидности данных карты
  useEffect(() => {
    if (paymentMethod === 'card') {
      const isValid = validateCardData();
      setCardFormValid(isValid);
    } else {
      setCardFormValid(true);
    }
  }, [paymentMethod, cardData]);

  const validateCardData = () => {
    if (!cardData.number || cardData.number.replace(/\s/g, '').length !== 16) {
      return false;
    }

    if (!cardData.expiry || !/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      return false;
    }

    if (!cardData.cvv || cardData.cvv.length !== 3) {
      return false;
    }

    if (!cardData.holder.trim()) {
      return false;
    }

    return true;
  };

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

  const getPassengerTypeCount = () => {
    const adults = passengers.filter(p => p.type === 'adult').length;
    const children = passengers.filter(p => p.type === 'child').length;
    return { adults, children };
  };

  const calculateDiscount = () => {
    const { children } = getPassengerTypeCount();
    const childPrice = Math.round(selectedWagon.price * 0.6);
    const adultPrice = selectedWagon.price;
    const regularTotal = (adultPrice + childPrice) * passengers.length;
    return regularTotal - total;
  };

  const handlePayment = async () => {
    if (!agreement) {
      setError('Необходимо согласиться с условиями предоставления услуги');
      return;
    }

    if (paymentMethod === 'card' && !cardFormValid) {
      setError('Заполните все поля данных карты корректно');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Симуляция платежа
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Создаем объект заказа
      const order = {
        id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        train: selectedTrain,
        wagon: selectedWagon,
        seats: selectedSeats,
        passengers: passengers,
        paymentMethod: paymentMethod,
        total: total,
        date: new Date().toISOString(),
        status: 'paid'
      };

      // Сохраняем заказ в контекст
      setOrder(order);
      
      // Переходим на страницу подтверждения
      navigate('/confirmation');
    } catch (err) {
      setError('Произошла ошибка при обработке платежа. Пожалуйста, попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const { adults, children } = getPassengerTypeCount();
  const discount = calculateDiscount();

  const handleCardDataChange = (newCardData) => {
    setCardData(newCardData);
  };

  const canProceed = agreement && (paymentMethod !== 'card' || cardFormValid);

  return (
    <div className="payment-page">
      <OrderSteps />

      <div className="payment-page__container">
        <main className="payment-page__main">
          {/* Информация о заказе */}
          <div className="order-summary">
            <h2 className="order-summary__title">Сводка заказа</h2>
            
            <div className="order-summary__content">
              {/* Информация о поездке */}
              <div className="order-summary__section">
                <h3 className="order-summary__section-title">Детали поездки</h3>
                
                <div className="order-summary__trip">
                  <div className="order-summary__trip-direction">
                    <div className="order-summary__trip-date">
                      {formatDate(selectedTrain.departureDate)}
                    </div>
                    <div className="order-summary__trip-info">
                      <div className="order-summary__train-number">
                        Поезд №{selectedTrain.number}
                      </div>
                      <div className="order-summary__train-name">
                        {selectedTrain.name}
                      </div>
                    </div>
                    <div className="order-summary__trip-route">
                      <div className="order-summary__route-stations">
                        <div className="order-summary__station">
                          <span className="order-summary__station-city">{selectedTrain.fromCity}</span>
                          <span className="order-summary__station-name">{selectedTrain.fromStation}</span>
                        </div>
                        <div className="order-summary__route-arrow">→</div>
                        <div className="order-summary__station">
                          <span className="order-summary__station-city">{selectedTrain.toCity}</span>
                          <span className="order-summary__station-name">{selectedTrain.toStation}</span>
                        </div>
                      </div>
                      <div className="order-summary__route-time">
                        {selectedTrain.departureTime} - {selectedTrain.arrivalTime}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Информация о пассажирах */}
              <div className="order-summary__section">
                <h3 className="order-summary__section-title">Пассажиры</h3>
                
                <div className="order-summary__passengers">
                  <div className="order-summary__passenger-count">
                    <span>Взрослых: {adults}</span>
                    <span className="order-summary__passenger-price">
                      {formatPrice(selectedWagon.price * adults)} ₽
                    </span>
                  </div>
                  
                  {children > 0 && (
                    <div className="order-summary__passenger-count">
                      <span>Детей: {children}</span>
                      <span className="order-summary__passenger-price">
                        {formatPrice(Math.round(selectedWagon.price * 0.6 * children))} ₽
                      </span>
                    </div>
                  )}
                  
                  {discount > 0 && (
                    <div className="order-summary__discount">
                      <span>Скидка на детские билеты:</span>
                      <span className="order-summary__discount-amount">
                        -{formatPrice(discount)} ₽
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Информация о местах */}
              <div className="order-summary__section">
                <h3 className="order-summary__section-title">Места в вагоне</h3>
                
                <div className="order-summary__seats">
                  <div className="order-summary__wagon-info">
                    <span>Вагон №{selectedWagon.number}</span>
                    <span className="order-summary__wagon-type">
                      {selectedWagon.type === 'sitting' ? 'Сидячий' :
                       selectedWagon.type === 'platzkart' ? 'Плацкарт' :
                       selectedWagon.type === 'coupe' ? 'Купе' : 'Люкс'}
                    </span>
                  </div>
                  
                  <div className="order-summary__seats-list">
                    <span>Места:</span>
                    <span className="order-summary__seats-numbers">
                      {selectedSeats.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Итоговая стоимость */}
            <div className="order-summary__total">
              <div className="order-summary__total-label">Общая стоимость:</div>
              <div className="order-summary__total-price">
                {formatPrice(total)} ₽
              </div>
            </div>
          </div>

          {/* Способ оплаты */}
          <div className="payment-methods-section">
            <PaymentMethod
              selectedMethod={paymentMethod}
              onSelect={setPaymentMethod}
              cardData={cardData}
              onCardDataChange={handleCardDataChange}
            />
          </div>

          {/* Соглашение */}
          <div className="payment-agreement">
            <label className="payment-agreement__checkbox">
              <input
                type="checkbox"
                checked={agreement}
                onChange={(e) => setAgreement(e.target.checked)}
                className="payment-agreement__input"
              />
              <span className="payment-agreement__text">
                Я согласен с <a href="#" className="payment-agreement__link">условиями предоставления услуги</a>, 
                <a href="#" className="payment-agreement__link"> политикой конфиденциальности</a> и даю согласие на 
                обработку персональных данных
              </span>
            </label>
          </div>

          {/* Ошибка */}
          {error && (
            <div className="payment-error">
              <div className="payment-error__icon">❌</div>
              <div className="payment-error__text">{error}</div>
            </div>
          )}

          {/* Кнопка оплаты */}
          <div className="payment-action">
            <button
              className="payment-action__button"
              onClick={handlePayment}
              disabled={!canProceed || loading}
            >
              {loading ? (
                <>
                  <span className="payment-action__spinner"></span>
                  Обработка платежа...
                </>
              ) : (
                `Оплатить ${formatPrice(total)} ₽`
              )}
            </button>
            
            <p className="payment-action__hint">
              {paymentMethod === 'card' && !cardFormValid && (
                <span className="payment-action__warning">
                  ⚠️ Заполните все поля данных карты
                </span>
              )}
              {!agreement && (
                <span className="payment-action__warning">
                  ⚠️ Необходимо согласиться с условиями
                </span>
              )}
              {canProceed && (
                'Нажимая кнопку «Оплатить», вы подтверждаете бронирование и оплату билетов'
              )}
            </p>
            
            <button
              className="payment-action__back"
              onClick={() => navigate('/passengers')}
              disabled={loading}
            >
              ← Вернуться к данным пассажиров
            </button>
          </div>
        </main>

        {/* Боковая панель */}
        <aside className="payment-page__sidebar">
          {/* Информация о безопасности */}
          <div className="payment-security">
            <h3 className="payment-security__title">Безопасность платежей</h3>
            
            <div className="payment-security__features">
              <div className="payment-security__feature">
                <div className="payment-security__feature-icon">🔒</div>
                <div className="payment-security__feature-text">
                  <div className="payment-security__feature-title">SSL-шифрование</div>
                  <div className="payment-security__feature-description">
                    Все данные защищены 256-битным шифрованием
                  </div>
                </div>
              </div>
              
              <div className="payment-security__feature">
                <div className="payment-security__feature-icon">🛡️</div>
                <div className="payment-security__feature-text">
                  <div className="payment-security__feature-title">Защита от мошенничества</div>
                  <div className="payment-security__feature-description">
                    Система автоматически проверяет все транзакции
                  </div>
                </div>
              </div>
              
              <div className="payment-security__feature">
                <div className="payment-security__feature-icon">🏦</div>
                <div className="payment-security__feature-text">
                  <div className="payment-security__feature-title">Банковский уровень</div>
                  <div className="payment-security__feature-description">
                    Соответствие стандартам PCI DSS
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Поддержка */}
          <div className="payment-support">
            <h3 className="payment-support__title">Нужна помощь?</h3>
            
            <div className="payment-support__contacts">
              <div className="payment-support__contact">
                <div className="payment-support__contact-icon">📞</div>
                <div className="payment-support__contact-info">
                  <div className="payment-support__contact-label">Телефон поддержки</div>
                  <a href="tel:88000000000" className="payment-support__contact-value">
                    8 (800) 000-00-00
                  </a>
                </div>
              </div>
              
              <div className="payment-support__contact">
                <div className="payment-support__contact-icon">✉️</div>
                <div className="payment-support__contact-info">
                  <div className="payment-support__contact-label">Электронная почта</div>
                  <a href="mailto:support@train-tickets.ru" className="payment-support__contact-value">
                    support@train-tickets.ru
                  </a>
                </div>
              </div>
              
              <div className="payment-support__contact">
                <div className="payment-support__contact-icon">🕒</div>
                <div className="payment-support__contact-info">
                  <div className="payment-support__contact-label">Время работы</div>
                  <div className="payment-support__contact-value">
                    Круглосуточно, 7 дней в неделю
                  </div>
                </div>
              </div>
            </div>
            
            <div className="payment-support__faq">
              <a href="#" className="payment-support__faq-link">
                Часто задаваемые вопросы →
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default PaymentPage;
