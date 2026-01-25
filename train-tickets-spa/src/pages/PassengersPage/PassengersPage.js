import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicket } from '../../context/TicketContext';
import OrderSteps from '../../components/OrderSteps/OrderSteps';
import PassengerForm from '../../components/PassengerForm/PassengerForm';
import './PassengersPage.css';

function PassengersPage() {
  const navigate = useNavigate();
  const { 
    selectedTrain,
    selectedWagon,
    selectedSeats,
    passengers,
    addPassenger,
    updatePassenger,
    removePassenger,
    total
  } = useTicket();

  const [currentPassengerIndex, setCurrentPassengerIndex] = useState(0);
  const [errors, setErrors] = useState({});

  // Инициализация пассажиров по количеству выбранных мест
  useEffect(() => {
    if (selectedSeats.length > 0 && passengers.length === 0) {
      // Создаем пустые формы для всех выбранных мест
      const newPassengers = Array(selectedSeats.length).fill(null).map(() => ({
        type: 'adult',
        lastName: '',
        firstName: '',
        middleName: '',
        gender: 'male',
        birthDate: '',
        documentType: 'passport',
        documentSeries: '',
        documentNumber: '',
        limitedMobility: false
      }));
      
      newPassengers.forEach(passenger => {
        addPassenger(passenger);
      });
    }
  }, [selectedSeats.length, passengers.length, addPassenger]);

  const validatePassenger = (passenger) => {
    const errors = {};
    
    if (!passenger.lastName.trim()) {
      errors.lastName = 'Введите фамилию';
    }
    
    if (!passenger.firstName.trim()) {
      errors.firstName = 'Введите имя';
    }
    
    if (!passenger.birthDate) {
      errors.birthDate = 'Введите дату рождения';
    } else {
      const birthDate = new Date(passenger.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (passenger.type === 'child' && age >= 10) {
        errors.birthDate = 'Для детского билета возраст должен быть меньше 10 лет';
      }
      
      if (passenger.type === 'adult' && age < 10) {
        errors.birthDate = 'Для взрослого билета возраст должен быть от 10 лет';
      }
    }
    
    if (passenger.documentType === 'passport') {
      if (!/^\d{4}$/.test(passenger.documentSeries)) {
        errors.documentSeries = 'Серия паспорта должна содержать 4 цифры';
      }
      
      if (!/^\d{6}$/.test(passenger.documentNumber)) {
        errors.documentNumber = 'Номер паспорта должен содержать 6 цифр';
      }
    }
    
    if (passenger.documentType === 'birthCertificate') {
      if (!/^[IVX]+-[А-Я]{2}-\d{6}$/.test(passenger.documentNumber)) {
        errors.documentNumber = 'Формат: Римские цифры-Две буквы-Шесть цифр (например: VIII-ЫП-123456)';
      }
    }
    
    return errors;
  };

  const handleSavePassenger = (passengerData) => {
    const validationErrors = validatePassenger(passengerData);
    
    if (Object.keys(validationErrors).length === 0) {
      if (currentPassengerIndex < passengers.length) {
        updatePassenger(currentPassengerIndex, passengerData);
      } else {
        addPassenger(passengerData);
      }
      
      setErrors({});
      
      // Переходим к следующему пассажиру или к оплате
      if (currentPassengerIndex < selectedSeats.length - 1) {
        setCurrentPassengerIndex(currentPassengerIndex + 1);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const handleNext = () => {
    // Проверяем, что все пассажиры заполнены
    if (passengers.length !== selectedSeats.length) {
      alert(`Необходимо заполнить данные для всех ${selectedSeats.length} пассажиров`);
      return;
    }
    
    // Проверяем валидность всех пассажиров
    const allValid = passengers.every(passenger => {
      const errors = validatePassenger(passenger);
      return Object.keys(errors).length === 0;
    });
    
    if (!allValid) {
      alert('Пожалуйста, проверьте правильность заполнения данных всех пассажиров');
      return;
    }
    
    navigate('/payment');
  };

  const handleAddPassenger = () => {
    if (passengers.length < selectedSeats.length) {
      const newPassenger = {
        type: 'adult',
        lastName: '',
        firstName: '',
        middleName: '',
        gender: 'male',
        birthDate: '',
        documentType: 'passport',
        documentSeries: '',
        documentNumber: '',
        limitedMobility: false
      };
      addPassenger(newPassenger);
      setCurrentPassengerIndex(passengers.length);
    }
  };

  const handleRemovePassenger = (index) => {
    if (passengers.length > 1) {
      removePassenger(index);
      if (currentPassengerIndex >= index) {
        setCurrentPassengerIndex(Math.max(0, currentPassengerIndex - 1));
      }
    }
  };

  const formatPrice = (price) => {
    return price.toLocaleString('ru-RU');
  };

  if (!selectedTrain || !selectedWagon || selectedSeats.length === 0) {
    return (
      <div className="passengers-page">
        <div className="passengers-page__error">
          <h2>Данные неполные</h2>
          <p>Пожалуйста, вернитесь и выберите поезд, вагон и места</p>
          <button onClick={() => navigate('/search')}>
            Вернуться к выбору поезда
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="passengers-page">
      <OrderSteps />

      <div className="passengers-page__container">
        <main className="passengers-page__main">
          {/* Детали поездки */}
          <div className="trip-details">
            <h2 className="trip-details__title">ДЕТАЛИ ПОЕЗДКИ</h2>
            
            <div className="trip-details__content">
              {/* Туда */}
              <div className="trip-details__direction">
                <h3 className="trip-details__direction-title">Туда</h3>
                <div className="trip-details__direction-content">
                  <div className="trip-details__date">{selectedTrain.departureDate}</div>
                  <div className="trip-details__train-info">
                    <div className="trip-details__train-number">
                      № Поезда: <strong>{selectedTrain.number}</strong>
                    </div>
                    <div className="trip-details__train-name">{selectedTrain.name}</div>
                  </div>
                  <div className="trip-details__route">
                    <div className="trip-details__route-time">
                      {selectedTrain.departureTime} → {selectedTrain.arrivalTime}
                    </div>
                    <div className="trip-details__route-stations">
                      <div className="trip-details__station">
                        <div className="trip-details__station-city">{selectedTrain.fromCity}</div>
                        <div className="trip-details__station-name">{selectedTrain.fromStation}</div>
                      </div>
                      <div className="trip-details__station">
                        <div className="trip-details__station-city">{selectedTrain.toCity}</div>
                        <div className="trip-details__station-name">{selectedTrain.toStation}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Пассажиры */}
              <div className="trip-details__passengers">
                <h3 className="trip-details__passengers-title">Пассажиры</h3>
                <div className="trip-details__passengers-list">
                  <div className="trip-details__passenger-type">
                    <span>Взрослых: {passengers.filter(p => p.type === 'adult').length}</span>
                    <span className="trip-details__passenger-price">
                      {formatPrice(selectedWagon.price * passengers.filter(p => p.type === 'adult').length)} ₽
                    </span>
                  </div>
                  <div className="trip-details__passenger-type">
                    <span>Детей: {passengers.filter(p => p.type === 'child').length}</span>
                    <span className="trip-details__passenger-price">
                      {formatPrice(Math.round(selectedWagon.price * 0.6 * passengers.filter(p => p.type === 'child').length))} ₽
                    </span>
                  </div>
                </div>
              </div>

              {/* Итог */}
              <div className="trip-details__total">
                <div className="trip-details__total-label">ИТОГ:</div>
                <div className="trip-details__total-price">{formatPrice(total)} ₽</div>
              </div>
            </div>
          </div>

          {/* Формы пассажиров */}
          <div className="passengers-forms">
            <h2 className="passengers-forms__title">
              Пассажир {currentPassengerIndex + 1} из {selectedSeats.length}
            </h2>
            
            <div className="passengers-forms__progress">
              <div 
                className="passengers-forms__progress-bar"
                style={{ width: `${((currentPassengerIndex + 1) / selectedSeats.length) * 100}%` }}
              ></div>
            </div>

            {passengers[currentPassengerIndex] && (
              <PassengerForm
                key={currentPassengerIndex}
                passengerNumber={currentPassengerIndex + 1}
                onSave={handleSavePassenger}
                initialData={passengers[currentPassengerIndex]}
              />
            )}

            {/* Ошибки */}
            {Object.keys(errors).length > 0 && (
              <div className="passengers-forms__errors">
                <h4 className="passengers-forms__errors-title">Исправьте ошибки:</h4>
                <ul className="passengers-forms__errors-list">
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field} className="passengers-forms__error">
                      {message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Управление пассажирами */}
            <div className="passengers-controls">
              <div className="passengers-controls__navigation">
                <button
                  className="passengers-controls__button passengers-controls__button--prev"
                  onClick={() => setCurrentPassengerIndex(Math.max(0, currentPassengerIndex - 1))}
                  disabled={currentPassengerIndex === 0}
                >
                  ← Предыдущий
                </button>
                
                <div className="passengers-controls__indicators">
                  {passengers.map((_, index) => (
                    <button
                      key={index}
                      className={`passengers-controls__indicator ${index === currentPassengerIndex ? 'passengers-controls__indicator--active' : ''}`}
                      onClick={() => setCurrentPassengerIndex(index)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                
                <button
                  className="passengers-controls__button passengers-controls__button--next"
                  onClick={() => {
                    if (currentPassengerIndex < passengers.length - 1) {
                      setCurrentPassengerIndex(currentPassengerIndex + 1);
                    } else if (passengers.length < selectedSeats.length) {
                      handleAddPassenger();
                    }
                  }}
                  disabled={currentPassengerIndex === passengers.length - 1 && passengers.length === selectedSeats.length}
                >
                  {currentPassengerIndex < passengers.length - 1 ? 'Следующий →' : 'Добавить пассажира'}
                </button>
              </div>

              {passengers.length > 1 && (
                <button
                  className="passengers-controls__remove"
                  onClick={() => handleRemovePassenger(currentPassengerIndex)}
                >
                  Удалить текущего пассажира
                </button>
              )}
            </div>
          </div>

          {/* Кнопка продолжения */}
          <div className="passengers-action">
            <button 
              className="passengers-action__continue"
              onClick={handleNext}
              disabled={passengers.length !== selectedSeats.length}
            >
              Перейти к оплате
            </button>
            <p className="passengers-action__hint">
              * Для продолжения необходимо заполнить данные всех {selectedSeats.length} пассажиров
            </p>
          </div>
        </main>

        {/* Боковая панель */}
        <aside className="passengers-page__sidebar">
          {/* Сводная информация */}
          <div className="passengers-summary">
            <h3 className="passengers-summary__title">Сводная информация</h3>
            
            <div className="passengers-summary__content">
              <div className="passengers-summary__item">
                <span className="passengers-summary__label">Поезд:</span>
                <span className="passengers-summary__value">{selectedTrain.number}</span>
              </div>
              
              <div className="passengers-summary__item">
                <span className="passengers-summary__label">Вагон:</span>
                <span className="passengers-summary__value">№{selectedWagon.number}</span>
              </div>
              
              <div className="passengers-summary__item">
                <span className="passengers-summary__label">Места:</span>
                <span className="passengers-summary__value">
                  {selectedSeats.join(', ')}
                </span>
              </div>
              
              <div className="passengers-summary__item">
                <span className="passengers-summary__label">Пассажиров:</span>
                <span className="passengers-summary__value">
                  {passengers.length} из {selectedSeats.length}
                </span>
              </div>
              
              <div className="passengers-summary__item passengers-summary__item--total">
                <span className="passengers-summary__label">Общая стоимость:</span>
                <span className="passengers-summary__value passengers-summary__value--price">
                  {formatPrice(total)} ₽
                </span>
              </div>
            </div>
          </div>

          {/* Подсказки */}
          <div className="passengers-hints">
            <h4 className="passengers-hints__title">Важная информация</h4>
            
            <div className="passengers-hints__list">
              <div className="passengers-hint">
                <div className="passengers-hint__icon">📋</div>
                <div className="passengers-hint__text">
                  <strong>Точность данных:</strong> Убедитесь, что все данные пассажиров указаны точно как в документах
                </div>
              </div>
              
              <div className="passengers-hint">
                <div className="passengers-hint__icon">👶</div>
                <div className="passengers-hint__text">
                  <strong>Детские билеты:</strong> Для детей до 10 лет предоставляется скидка 50-65% от стоимости взрослого билета
                </div>
              </div>
              
              <div className="passengers-hint">
                <div className="passengers-hint__icon">♿</div>
                <div className="passengers-hint__text">
                  <strong>Ограниченная подвижность:</strong> Отметьте этот пункт, если пассажиру требуется специальная помощь
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default PassengersPage;
