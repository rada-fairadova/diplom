import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicket } from '../../context/TicketContext';
import OrderSteps from '../../components/OrderSteps/OrderSteps';
import './ConfirmationPage.css';

function ConfirmationPage() {
  const navigate = useNavigate();
  const { 
    orderDetails,
    selectedTrain,
    selectedWagon,
    selectedSeats,
    passengers,
    total,
    resetOrder
  } = useTicket();

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Проверка наличия данных заказа
  useEffect(() => {
    if (!orderDetails && (!selectedTrain || !selectedWagon || selectedSeats.length === 0)) {
      navigate('/payment');
    }
  }, [orderDetails, selectedTrain, selectedWagon, selectedSeats.length, navigate]);

  const formatPrice = (price) => {
    return price.toLocaleString('ru-RU');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getDocumentInfo = (passenger) => {
    if (passenger.documentType === 'passport') {
      return `Паспорт РФ ${passenger.documentSeries} ${passenger.documentNumber}`;
    } else if (passenger.documentType === 'birthCertificate') {
      return `Свидетельство о рождении ${passenger.documentNumber}`;
    }
    return '';
  };

  const handleConfirm = async () => {
    setLoading(true);
    
    try {
      // Симуляция подтверждения заказа
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsConfirmed(true);
      
      // Переход на страницу успеха через 2 секунды
      setTimeout(() => {
        navigate('/success');
      }, 2000);
    } catch (error) {
      console.error('Ошибка подтверждения заказа:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (step) => {
    switch (step) {
      case 'tickets':
        navigate('/search');
        break;
      case 'passengers':
        navigate('/passengers');
        break;
      case 'payment':
        navigate('/payment');
        break;
      default:
        break;
    }
  };

  if (!selectedTrain || !selectedWagon || selectedSeats.length === 0) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-page__error">
          <h2>Данные заказа отсутствуют</h2>
          <p>Пожалуйста, вернитесь и заполните данные заказа</p>
          <button onClick={() => navigate('/')}>
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  const orderData = orderDetails || {
    id: `TEMP-${Date.now()}`,
    train: selectedTrain,
    wagon: selectedWagon,
    seats: selectedSeats,
    passengers: passengers,
    total: total,
    date: new Date().toISOString()
  };

  return (
    <div className="confirmation-page">
      <OrderSteps />

      <div className="confirmation-page__container">
        {isConfirmed ? (
          <div className="confirmation-success">
            <div className="confirmation-success__icon">✅</div>
            <h2 className="confirmation-success__title">Заказ успешно подтвержден!</h2>
            <p className="confirmation-success__message">
              Ваш заказ №{orderData.id} подтвержден.
              <br />
              Перенаправляем на страницу успешного заказа...
            </p>
            <div className="confirmation-success__loader">
              <div className="confirmation-success__loader-bar"></div>
            </div>
          </div>
        ) : (
          <>
            <main className="confirmation-page__main">
              <h1 className="confirmation-page__title">Подтверждение заказа</h1>
              <p className="confirmation-page__subtitle">
                Пожалуйста, проверьте все данные перед подтверждением
              </p>

              {/* Информация о заказе */}
              <div className="confirmation-details">
                {/* Номер заказа */}
                <div className="confirmation-order-number">
                  <span className="confirmation-order-number__label">Номер заказа:</span>
                  <span className="confirmation-order-number__value">{orderData.id}</span>
                </div>

                {/* Детали поездки */}
                <div className="confirmation-section">
                  <div className="confirmation-section__header">
                    <h2 className="confirmation-section__title">Детали поездки</h2>
                    <button 
                      className="confirmation-section__edit"
                      onClick={() => handleEdit('tickets')}
                    >
                      Изменить
                    </button>
                  </div>
                  
                  <div className="confirmation-trip">
                    {/* Туда */}
                    <div className="confirmation-direction">
                      <h3 className="confirmation-direction__title">Туда</h3>
                      
                      <div className="confirmation-direction__content">
                        <div className="confirmation-direction__date">
                          {formatDate(selectedTrain.departureTime)}
                        </div>
                        
                        <div className="confirmation-direction__train">
                          <div className="confirmation-direction__train-number">
                            Поезд №{selectedTrain.number}
                          </div>
                          <div className="confirmation-direction__train-name">
                            {selectedTrain.name}
                          </div>
                        </div>
                        
                        <div className="confirmation-direction__route">
                          <div className="confirmation-direction__stations">
                            <div className="confirmation-direction__station">
                              <div className="confirmation-direction__station-city">
                                {selectedTrain.fromCity}
                              </div>
                              <div className="confirmation-direction__station-name">
                                {selectedTrain.fromStation}
                              </div>
                              <div className="confirmation-direction__station-time">
                                {formatTime(selectedTrain.departureTime)}
                              </div>
                            </div>
                            
                            <div className="confirmation-direction__arrow">→</div>
                            
                            <div className="confirmation-direction__station">
                              <div className="confirmation-direction__station-city">
                                {selectedTrain.toCity}
                              </div>
                              <div className="confirmation-direction__station-name">
                                {selectedTrain.toStation}
                              </div>
                              <div className="confirmation-direction__station-time">
                                {formatTime(selectedTrain.arrivalTime)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="confirmation-direction__duration">
                            В пути: {Math.floor(selectedTrain.duration / 60)} ч {selectedTrain.duration % 60} мин
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Места */}
                    <div className="confirmation-seats">
                      <h3 className="confirmation-seats__title">Места</h3>
                      
                      <div className="confirmation-seats__content">
                        <div className="confirmation-seats__wagon">
                          <span>Вагон:</span>
                          <strong>№{selectedWagon.number}</strong>
                          <span className="confirmation-seats__wagon-type">
                            ({selectedWagon.type === 'sitting' ? 'Сидячий' :
                              selectedWagon.type === 'platzkart' ? 'Плацкарт' :
                              selectedWagon.type === 'coupe' ? 'Купе' : 'Люкс'})
                          </span>
                        </div>
                        
                        <div className="confirmation-seats__numbers">
                          <span>Места:</span>
                          <strong>{selectedSeats.join(', ')}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Пассажиры */}
                <div className="confirmation-section">
                  <div className="confirmation-section__header">
                    <h2 className="confirmation-section__title">Пассажиры</h2>
                    <button 
                      className="confirmation-section__edit"
                      onClick={() => handleEdit('passengers')}
                    >
                      Изменить
                    </button>
                  </div>
                  
                  <div className="confirmation-passengers">
                    {passengers.map((passenger, index) => (
                      <div key={index} className="confirmation-passenger">
                        <div className="confirmation-passenger__header">
                          <h3 className="confirmation-passenger__number">
                            Пассажир {index + 1} ({passenger.type === 'adult' ? 'Взрослый' : 'Детский'})
                          </h3>
                          <div className="confirmation-passenger__seat">
                            Место: {selectedSeats[index]}
                          </div>
                        </div>
                        
                        <div className="confirmation-passenger__details">
                          <div className="confirmation-passenger__personal">
                            <div className="confirmation-passenger__name">
                              {passenger.lastName} {passenger.firstName} {passenger.middleName}
                            </div>
                            <div className="confirmation-passenger__info">
                              <span>
                                {passenger.gender === 'male' ? 'Мужской' : 'Женский'}, 
                                родился(ась): {formatDate(passenger.birthDate)}
                              </span>
                              {passenger.limitedMobility && (
                                <span className="confirmation-passenger__mobility">
                                  (ограниченная подвижность)
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="confirmation-passenger__document">
                            {getDocumentInfo(passenger)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Оплата */}
                <div className="confirmation-section">
                  <div className="confirmation-section__header">
                    <h2 className="confirmation-section__title">Оплата</h2>
                    <button 
                      className="confirmation-section__edit"
                      onClick={() => handleEdit('payment')}
                    >
                      Изменить
                    </button>
                  </div>
                  
                  <div className="confirmation-payment">
                    <div className="confirmation-payment__method">
                      <span>Способ оплаты:</span>
                      <strong>
                        {orderData.paymentMethod === 'card' ? 'Банковской картой' :
                         orderData.paymentMethod === 'paypal' ? 'PayPal' :
                         orderData.paymentMethod === 'qiwi' ? 'QIWI Wallet' :
                         orderData.paymentMethod === 'cash' ? 'Наличными' : 'Онлайн'}
                      </strong>
                    </div>
                    
                    <div className="confirmation-payment__status">
                      <span>Статус:</span>
                      <span className="confirmation-payment__status-badge confirmation-payment__status-badge--pending">
                        Ожидает оплаты
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Итоговая стоимость */}
              <div className="confirmation-total">
                <div className="confirmation-total__label">Общая стоимость:</div>
                <div className="confirmation-total__price">{formatPrice(total)} ₽</div>
              </div>

              {/* Кнопка подтверждения */}
              <div className="confirmation-actions">
                <button
                  className="confirmation-actions__confirm"
                  onClick={handleConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="confirmation-actions__spinner"></span>
                      Подтверждение...
                    </>
                  ) : (
                    'Подтвердить заказ'
                  )}
                </button>
                
                <button
                  className="confirmation-actions__cancel"
                  onClick={() => navigate('/payment')}
                  disabled={loading}
                >
                  ← Вернуться к оплате
                </button>
              </div>
            </main>

            {/* Боковая панель */}
            <aside className="confirmation-page__sidebar">
              {/* Контактная информация */}
              <div className="confirmation-contacts">
                <h3 className="confirmation-contacts__title">Контактная информация</h3>
                
                <div className="confirmation-contacts__content">
                  <div className="confirmation-contacts__email">
                    <div className="confirmation-contacts__label">E-mail для билетов:</div>
                    <div className="confirmation-contacts__value">
                      {passengers[0]?.email || 'inbox@mail.ru'}
                    </div>
                  </div>
                  
                  <div className="confirmation-contacts__phone">
                    <div className="confirmation-contacts__label">Телефон для связи:</div>
                    <div className="confirmation-contacts__value">
                      {passengers[0]?.phone || '+7 (953) 322-18-18'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Важная информация */}
              <div className="confirmation-info">
                <h3 className="confirmation-info__title">Важная информация</h3>
                
                <div className="confirmation-info__list">
                  <div className="confirmation-info__item">
                    <div className="confirmation-info__icon">📧</div>
                    <div className="confirmation-info__text">
                      Билеты будут отправлены на указанный e-mail после оплаты
                    </div>
                  </div>
                  
                  <div className="confirmation-info__item">
                    <div className="confirmation-info__icon">🖨️</div>
                    <div className="confirmation-info__text">
                      Распечатайте и сохраняйте билеты до даты поездки
                    </div>
                  </div>
                  
                  <div className="confirmation-info__item">
                    <div className="confirmation-info__icon">🎫</div>
                    <div className="confirmation-info__text">
                      Предъявите распечатанные билеты при посадке
                    </div>
                  </div>
                  
                  <div className="confirmation-info__item">
                    <div className="confirmation-info__icon">⏰</div>
                    <div className="confirmation-info__text">
                      Прибывайте на вокзал минимум за 40 минут до отправления
                    </div>
                  </div>
                </div>
              </div>

              {/* Поддержка */}
              <div className="confirmation-support">
                <h3 className="confirmation-support__title">Вопросы по заказу?</h3>
                
                <div className="confirmation-support__contacts">
                  <a href="tel:88000000000" className="confirmation-support__phone">
                    📞 8 (800) 000-00-00
                  </a>
                  <a href="mailto:support@train-tickets.ru" className="confirmation-support__email">
                    ✉️ support@train-tickets.ru
                  </a>
                </div>
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}

export default ConfirmationPage;
