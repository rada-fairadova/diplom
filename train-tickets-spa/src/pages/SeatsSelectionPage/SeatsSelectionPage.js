import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTicket } from '../../context/TicketContext';
import './SeatsSelectionPage.css';

// Моковые данные вагонов
const mockWagons = [
  {
    id: 'sitting-1',
    number: 1,
    type: 'sitting',
    name: 'Сидячий',
    totalSeats: 60,
    availableSeats: 35,
    price: 1920,
    features: ['Сидячие места', 'Кондиционер', 'Розетки'],
    icon: '💺'
  },
  {
    id: 'platzkart-2',
    number: 2,
    type: 'platzkart',
    name: 'Плацкарт',
    totalSeats: 54,
    availableSeats: 24,
    price: 2530,
    features: ['54 места в вагоне', 'Белье включено', 'Общие розетки'],
    icon: '🛌'
  },
  {
    id: 'coupe-3',
    number: 3,
    type: 'coupe',
    name: 'Купе',
    totalSeats: 36,
    availableSeats: 15,
    price: 3820,
    features: ['4 места в купе', 'Кондиционер', 'Розетки', 'Белье включено'],
    icon: '🚂'
  },
  {
    id: 'lux-4',
    number: 4,
    type: 'lux',
    name: 'Люкс',
    totalSeats: 18,
    availableSeats: 8,
    price: 4950,
    features: ['2 места в купе', 'Кондиционер', 'Душ/туалет', 'ТВ', 'Белье включено'],
    icon: '⭐'
  }
];

function SeatsSelectionPage() {
  const navigate = useNavigate();
  const { setSelectedTrain, setSelectedWagon, setSelectedSeats } = useTicket();
  
  const [selectedWagon, setSelectedWagonState] = useState(null);
  const [selectedSeats, setSelectedSeatsState] = useState([]);
  const [wagons, setWagons] = useState(mockWagons);
  const [loading, setLoading] = useState(false);
  const [tripInfo] = useState({
    trainNumber: '123А',
    trainName: 'Стрела',
    fromCity: 'Москва',
    toCity: 'Санкт-Петербург',
    fromStation: 'Москва (Ленинградский вокзал)',
    toStation: 'Санкт-Петербург (Московский вокзал)',
    departureDate: '12 декабря 2024',
    arrivalDate: '13 декабря 2024',
    departureTime: '22:30',
    arrivalTime: '08:45'
  });

  // Фейковая загрузка данных
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
      if (!selectedWagon && wagons.length > 0) {
        setSelectedWagonState(wagons[0]); // Автоматически выбираем первый вагон
        console.log('Автоматически выбран первый вагон:', wagons[0]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleWagonSelect = (wagon) => {
    console.log('Выбран вагон:', wagon);
    setSelectedWagonState(wagon);
    setSelectedSeatsState([]);
  };

  const handleSeatSelect = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeatsState(selectedSeats.filter(s => s !== seatNumber));
    } else {
      if (selectedSeats.length < 4) {
        setSelectedSeatsState([...selectedSeats, seatNumber]);
      } else {
        alert('Максимальное количество мест для бронирования - 4');
      }
    }
  };

  const calculateTotalPrice = () => {
    if (!selectedWagon || selectedSeats.length === 0) return 0;
    return selectedWagon.price * selectedSeats.length;
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert('Пожалуйста, выберите хотя бы одно место');
      return;
    }
    
    // Сохраняем данные поезда в контекст
    const trainData = {
      number: tripInfo.trainNumber,
      name: tripInfo.trainName,
      fromCity: tripInfo.fromCity,
      toCity: tripInfo.toCity,
      fromStation: tripInfo.fromStation,
      toStation: tripInfo.toStation,
      departureDate: tripInfo.departureDate,
      arrivalDate: tripInfo.arrivalDate,
      departureTime: tripInfo.departureTime,
      arrivalTime: tripInfo.arrivalTime
    };
    
    setSelectedTrain(trainData);
    setSelectedWagon(selectedWagon);
    setSelectedSeats(selectedSeats);
    
    navigate('/passengers');
  };

  const formatPrice = (price) => {
    return price.toLocaleString('ru-RU');
  };

  const getWagonTypeName = (type) => {
    const types = {
      sitting: 'Сидячий',
      platzkart: 'Плацкарт',
      coupe: 'Купе',
      lux: 'Люкс'
    };
    return types[type] || type;
  };

  const isSeatAvailable = (seatNumber) => {
    const occupiedSeats = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30];
    return !occupiedSeats.includes(seatNumber);
  };

  if (loading) {
    return (
      <div className="seats-selection-page loading">
        <div className="loading-spinner"></div>
        <p>Загрузка доступных мест...</p>
      </div>
    );
  }

  return (
    <div className="seats-selection-page">
      {/* Шаги оформления */}
      <div className="booking-steps">
        <div className="step active">
          <div className="step-number">1</div>
          <div className="step-name">Маршрут</div>
        </div>
        <div className="step active">
          <div className="step-number">2</div>
          <div className="step-name">Поезд</div>
        </div>
        <div className="step active">
          <div className="step-number">3</div>
          <div className="step-name">Места</div>
        </div>
        <div className="step">
          <div className="step-number">4</div>
          <div className="step-name">Пассажиры</div>
        </div>
        <div className="step">
          <div className="step-number">5</div>
          <div className="step-name">Оплата</div>
        </div>
      </div>

      <div className="seats-selection-container">
        <main className="seats-selection-main">
          {/* Информация о поезде */}
          <div className="trip-summary">
            <h1 className="trip-summary__title">Выбор мест в вагоне</h1>
            <div className="trip-summary__info">
              <div className="trip-summary__train">
                <span className="train-number">Поезд №{tripInfo.trainNumber}</span>
                <span className="train-route">
                  {tripInfo.fromCity} → {tripInfo.toCity}
                </span>
              </div>
              
              <div className="trip-summary__details">
                <div className="trip-detail">
                  <div className="trip-detail__station">{tripInfo.fromStation}</div>
                  <div className="trip-detail__time">
                    {tripInfo.departureDate}, {tripInfo.departureTime}
                  </div>
                </div>
                
                <div className="trip-detail-separator">↓</div>
                
                <div className="trip-detail">
                  <div className="trip-detail__station">{tripInfo.toStation}</div>
                  <div className="trip-detail__time">
                    {tripInfo.arrivalDate}, {tripInfo.arrivalTime}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Выбор типа вагона */}
          <div className="wagon-type-section">
            <h2 className="section-title">Выберите тип вагона</h2>
            <p className="section-subtitle">Нажмите на карточку вагона для выбора</p>
            
            <div className="wagon-type-grid">
              {wagons.map(wagon => (
                <div 
                  key={wagon.id}
                  className={`wagon-type-card ${selectedWagon?.id === wagon.id ? 'selected' : ''}`}
                  onClick={() => handleWagonSelect(wagon)}
                >
                  <div className="wagon-type-icon">{wagon.icon}</div>
                  <div className="wagon-type-content">
                    <h3 className="wagon-type-name">{wagon.name}</h3>
                    <div className="wagon-type-price">{formatPrice(wagon.price)} ₽</div>
                    <div className="wagon-type-features">
                      {wagon.features.map((feature, index) => (
                        <div key={index} className="wagon-type-feature">
                          • {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="wagon-type-badge">
                    <span className="available-seats">
                      {wagon.availableSeats} мест
                    </span>
                  </div>
                  {selectedWagon?.id === wagon.id && (
                    <div className="wagon-selected-indicator">
                      <div className="wagon-selected-check">✓</div>
                      <span>Выбрано</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {selectedWagon && (
              <div className="selected-wagon-info">
                <div className="selected-wagon-summary">
                  <strong>Выбран:</strong> {selectedWagon.name} вагон №{selectedWagon.number} • 
                  Цена за место: {formatPrice(selectedWagon.price)} ₽ • 
                  Свободно мест: {selectedWagon.availableSeats}
                </div>
              </div>
            )}
          </div>

          {/* Выбор мест */}
          {selectedWagon ? (
            <div className="seat-selection-section">
              <div className="section-header">
                <h2>Выбор мест в вагоне №{selectedWagon.number}</h2>
                <div className="wagon-info-badge">
                  <span className="wagon-type">{getWagonTypeName(selectedWagon.type)}</span>
                  <span className="wagon-available">
                    Свободно: {selectedWagon.availableSeats} мест
                  </span>
                </div>
              </div>

              <div className="seat-map-container">
                <div className="seat-map-placeholder">
                  <div className="seat-map-message">
                    <h3>Схема выбора мест</h3>
                    <p>Выберите места на схеме ниже (максимум 4 места):</p>
                    
                    <div className="seat-map-grid">
                      {Array.from({ length: selectedWagon.totalSeats }, (_, i) => i + 1)
                        .slice(0, 30)
                        .map(seatNumber => {
                          const isSelected = selectedSeats.includes(seatNumber);
                          const isAvailable = isSeatAvailable(seatNumber);
                          
                          return (
                            <button
                              key={seatNumber}
                              className={`seat-button ${isSelected ? 'selected' : ''} ${!isAvailable ? 'unavailable' : 'available'}`}
                              onClick={() => handleSeatSelect(seatNumber)}
                              disabled={!isAvailable}
                            >
                              <span className="seat-number">{seatNumber}</span>
                              <span className="seat-price">
                                {selectedWagon.price.toLocaleString('ru-RU')} ₽
                              </span>
                            </button>
                          );
                        })}
                    </div>
                    
                    <div className="seat-map-legend">
                      <div className="legend-item">
                        <div className="legend-color available"></div>
                        <span>Свободно</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color selected"></div>
                        <span>Выбрано</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color unavailable"></div>
                        <span>Занято</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-wagon-selected">
              <div className="no-wagon-message">
                <div className="no-wagon-icon">🚂</div>
                <h3>Пожалуйста, выберите тип вагона</h3>
                <p>Чтобы продолжить выбор мест, сначала выберите тип вагона выше</p>
              </div>
            </div>
          )}

          {/* Информация о выборе */}
          <div className="selection-info-card">
            <div className="selection-info-content">
              <div className="selection-info-header">
                <h3>Ваш выбор</h3>
                {selectedSeats.length > 0 && (
                  <button 
                    className="clear-selection-btn"
                    onClick={() => setSelectedSeatsState([])}
                  >
                    Очистить выбор мест
                  </button>
                )}
              </div>
              
              <div className="selection-details">
                <div className="detail-row">
                  <span>Тип вагона:</span>
                  <span className="detail-value">
                    {selectedWagon?.name || 'Не выбран'}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span>Номер вагона:</span>
                  <span className="detail-value">
                    {selectedWagon?.number || '—'}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span>Цена за место:</span>
                  <span className="detail-value">
                    {selectedWagon ? formatPrice(selectedWagon.price) + ' ₽' : '—'}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span>Выбрано мест:</span>
                  <span className="detail-value highlight">
                    {selectedSeats.length} / 4
                  </span>
                </div>
                
                {selectedSeats.length > 0 && (
                  <div className="selected-seats-list">
                    <div className="seats-label">Выбранные места:</div>
                    <div className="seats-numbers">
                      {selectedSeats.sort((a, b) => a - b).map(seat => (
                        <span key={seat} className="seat-badge">
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="detail-row total">
                  <span>Общая стоимость:</span>
                  <span className="detail-value price">
                    {formatPrice(calculateTotalPrice())} ₽
                  </span>
                </div>
              </div>
              
              <button 
                className="continue-btn"
                onClick={handleContinue}
                disabled={!selectedWagon || selectedSeats.length === 0}
              >
                {!selectedWagon ? 'Выберите вагон' : 
                 selectedSeats.length === 0 ? 'Выберите места' : 
                 `Перейти к пассажирам (${formatPrice(calculateTotalPrice())} ₽)`}
              </button>
            </div>
          </div>
        </main>

        {/* Боковая панель */}
        <aside className="seats-selection-sidebar">
          {/* Статистика */}
          <div className="sidebar-card stats-card">
            <h3>Статистика выбора</h3>
            <div className="stats-content">
              <div className="stat-item">
                <div className="stat-label">Всего мест в вагоне:</div>
                <div className="stat-value">
                  {selectedWagon?.totalSeats || 0}
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-label">Свободно мест:</div>
                <div className="stat-value available">
                  {selectedWagon?.availableSeats || 0}
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-label">Занято мест:</div>
                <div className="stat-value occupied">
                  {(selectedWagon?.totalSeats || 0) - (selectedWagon?.availableSeats || 0)}
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-label">Вы выбрали:</div>
                <div className="stat-value selected">
                  {selectedSeats.length} мест
                </div>
              </div>
            </div>
          </div>

          {/* Подсказки */}
          <div className="sidebar-card tips-card">
            <h3>Полезные советы</h3>
            <ul className="tips-list">
              <li className="tip">
                <span className="tip-icon">💺</span>
                <span className="tip-text">
                  В сидячих вагонах места распределены по рядам
                </span>
              </li>
              <li className="tip">
                <span className="tip-icon">🚂</span>
                <span className="tip-text">
                  В купе места 1-2 слева, 3-4 справа
                </span>
              </li>
              <li className="tip">
                <span className="tip-icon">⭐</span>
                <span className="tip-text">
                  Люкс вагоны имеют повышенный комфорт
                </span>
              </li>
              <li className="tip">
                <span className="tip-icon">👥</span>
                <span className="tip-text">
                  19 человек сейчас выбирают места в этом поезде
                </span>
              </li>
            </ul>
          </div>

          {/* Часто задаваемые вопросы */}
          <div className="sidebar-card faq-card">
            <h3>Вопросы и ответы</h3>
            <div className="faq-content">
              <div className="faq-item">
                <div className="faq-question">Можно ли вернуть билет?</div>
                <div className="faq-answer">
                  Да, возврат возможен за 8 часов до отправления
                </div>
              </div>
              
              <div className="faq-item">
                <div className="faq-question">Есть ли Wi-Fi в поезде?</div>
                <div className="faq-answer">
                  В современных вагонах купе и люкс Wi-Fi обычно есть
                </div>
              </div>
              
              <div className="faq-item">
                <div className="faq-question">Детские места?</div>
                <div className="faq-answer">
                  Дети до 5 лет бесплатно, до 10 лет со скидкой
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default SeatsSelectionPage;
