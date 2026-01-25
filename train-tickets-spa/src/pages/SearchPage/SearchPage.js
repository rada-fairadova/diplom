import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTicket } from '../../context/TicketContext';
import OrderSteps from '../../components/OrderSteps/OrderSteps';
import TrainCard from '../../components/TrainCard/TrainCard';
import LastTickets from '../../components/LastTickets/LastTickets';
import './SearchPage.css';

// Моковые данные поездов
const mockTrains = [
  {
    id: '116C',
    number: '116C',
    name: 'Адлер → Санкт-Петербург',
    fromCity: 'Москва',
    fromStation: 'Курский вокзал',
    toCity: 'Санкт-Петербург',
    toStation: 'Ладожский вокзал',
    departureTime: '2023-08-30T00:10:00',
    arrivalTime: '2023-08-30T09:52:00',
    departureDate: '30.08.2023',
    arrivalDate: '30.08.2023',
    duration: 582, // 9 часов 42 минуты
    wagons: [
      { type: 'sitting', price: 1920, availableSeats: 35 },
      { type: 'platzkart', price: 2530, availableSeats: 24 },
      { type: 'coupe', price: 3820, availableSeats: 15 },
      { type: 'lux', price: 4950, availableSeats: 8 }
    ],
    hasWifi: true,
    hasConditioner: true,
    hasLinens: true,
    selectingCount: 19
  },
  {
    id: '117C',
    number: '117C',
    name: 'Москва → Казань',
    fromCity: 'Москва',
    fromStation: 'Казанский вокзал',
    toCity: 'Казань',
    toStation: 'Казанский вокзал',
    departureTime: '2023-08-30T11:30:00',
    arrivalTime: '2023-08-30T20:15:00',
    departureDate: '30.08.2023',
    arrivalDate: '30.08.2023',
    duration: 525, // 8 часов 45 минут
    wagons: [
      { type: 'sitting', price: 1800, availableSeats: 42 },
      { type: 'platzkart', price: 2400, availableSeats: 32 },
      { type: 'coupe', price: 3600, availableSeats: 18 }
    ],
    hasWifi: false,
    hasConditioner: true,
    hasLinens: true,
    selectingCount: 7
  },
  {
    id: '118C',
    number: '118C',
    name: 'Москва → Нижний Новгород',
    fromCity: 'Москва',
    fromStation: 'Курский вокзал',
    toCity: 'Нижний Новгород',
    toStation: 'Московский вокзал',
    departureTime: '2023-08-30T15:45:00',
    arrivalTime: '2023-08-30T21:30:00',
    departureDate: '30.08.2023',
    arrivalDate: '30.08.2023',
    duration: 345, // 5 часов 45 минут
    wagons: [
      { type: 'sitting', price: 1500, availableSeats: 28 },
      { type: 'platzkart', price: 2200, availableSeats: 20 },
      { type: 'coupe', price: 3200, availableSeats: 12 }
    ],
    hasWifi: true,
    hasConditioner: true,
    hasLinens: false,
    selectingCount: 3
  },
  {
    id: '119C',
    number: '119C',
    name: 'Москва → Сочи',
    fromCity: 'Москва',
    fromStation: 'Курский вокзал',
    toCity: 'Сочи',
    toStation: 'Сочи',
    departureTime: '2023-08-30T19:20:00',
    arrivalTime: '2023-08-31T10:45:00',
    departureDate: '30.08.2023',
    arrivalDate: '31.08.2023',
    duration: 925, // 15 часов 25 минут
    wagons: [
      { type: 'sitting', price: 2100, availableSeats: 15 },
      { type: 'platzkart', price: 3500, availableSeats: 18 },
      { type: 'coupe', price: 5200, availableSeats: 10 },
      { type: 'lux', price: 7800, availableSeats: 4 }
    ],
    hasWifi: true,
    hasConditioner: true,
    hasLinens: true,
    selectingCount: 12
  }
];

// Ценовые категории
const priceRanges = [
  { id: 'all', label: 'Любая цена', min: 0, max: Infinity },
  { id: 'budget', label: 'до 2500 ₽', min: 0, max: 2500 },
  { id: 'medium', label: '2500 - 4000 ₽', min: 2500, max: 4000 },
  { id: 'premium', label: 'от 4000 ₽', min: 4000, max: Infinity },
];

// Типы вагонов
const wagonTypes = [
  { id: 'all', label: 'Все типы', icon: '🚂' },
  { id: 'sitting', label: 'Сидячий', icon: '💺' },
  { id: 'platzkart', label: 'Плацкарт', icon: '🛌' },
  { id: 'coupe', label: 'Купе', icon: '🚂' },
  { id: 'lux', label: 'Люкс', icon: '⭐' },
];

function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchParams, setSelectedTrain, setSelectedWagon, setSelectedSeats } = useTicket();
  const [trains, setTrains] = useState([]);
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    priceRange: 'all',
    wagonType: 'all',
    departureTime: 'any',
    hasWifi: false,
    hasConditioner: false,
    hasLinens: false
  });
  const [sortBy, setSortBy] = useState('departureTime');

  useEffect(() => {
    // Симуляция загрузки данных
    setLoading(true);
    setTimeout(() => {
      setTrains(mockTrains);
      setFilteredTrains(mockTrains);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Фильтрация поездов
    let filtered = [...trains];
    
    // Фильтр по типу вагона
    if (filters.wagonType !== 'all') {
      filtered = filtered.filter(train => {
        // Проверяем, есть ли в поезде вагоны выбранного типа
        const hasWagonType = train.wagons.some(wagon => wagon.type === filters.wagonType);
        return hasWagonType;
      });
    }

    // Фильтр по ценовому диапазону
    const priceRange = priceRanges.find(range => range.id === filters.priceRange);
    if (priceRange && priceRange.id !== 'all') {
      filtered = filtered.filter(train => {
        // Находим минимальную цену среди вагонов нужного типа (если тип выбран) или среди всех вагонов
        const relevantWagons = filters.wagonType !== 'all' 
          ? train.wagons.filter(wagon => wagon.type === filters.wagonType)
          : train.wagons;
        
        if (relevantWagons.length === 0) return false;
        
        const minPrice = Math.min(...relevantWagons.map(wagon => wagon.price));
        return minPrice >= priceRange.min && minPrice <= priceRange.max;
      });
    }

    // Фильтр по времени отправления
    if (filters.departureTime !== 'any') {
      filtered = filtered.filter(train => {
        const hour = new Date(train.departureTime).getHours();
        if (filters.departureTime === 'morning') return hour >= 5 && hour < 12;
        if (filters.departureTime === 'day') return hour >= 12 && hour < 18;
        if (filters.departureTime === 'evening') return hour >= 18 && hour < 23;
        if (filters.departureTime === 'night') return hour >= 23 || hour < 5;
        return true;
      });
    }

    // Фильтр по услугам
    if (filters.hasWifi) {
      filtered = filtered.filter(train => train.hasWifi);
    }
    if (filters.hasConditioner) {
      filtered = filtered.filter(train => train.hasConditioner);
    }
    if (filters.hasLinens) {
      filtered = filtered.filter(train => train.hasLinens);
    }

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          const priceA = getTrainMinPrice(a, filters.wagonType);
          const priceB = getTrainMinPrice(b, filters.wagonType);
          return priceA - priceB;
        case 'price-desc':
          const priceADesc = getTrainMinPrice(a, filters.wagonType);
          const priceBDesc = getTrainMinPrice(b, filters.wagonType);
          return priceBDesc - priceADesc;
        case 'duration':
          return a.duration - b.duration;
        case 'departureTime':
        default:
          return new Date(a.departureTime) - new Date(b.departureTime);
      }
    });

    setFilteredTrains(filtered);
  }, [trains, filters, sortBy]);

  // Функция для получения минимальной цены поезда с учетом типа вагона
  const getTrainMinPrice = (train, wagonType) => {
    const relevantWagons = wagonType !== 'all' 
      ? train.wagons.filter(wagon => wagon.type === wagonType)
      : train.wagons;
    
    if (relevantWagons.length === 0) return Infinity;
    
    return Math.min(...relevantWagons.map(wagon => wagon.price));
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleResetFilters = () => {
    setFilters({
      priceRange: 'all',
      wagonType: 'all',
      departureTime: 'any',
      hasWifi: false,
      hasConditioner: false,
      hasLinens: false
    });
  };

  const handleTrainSelect = (train) => {
    // Сохраняем выбранный поезд в контекст
    setSelectedTrain(train);
    
    // Выбираем первый доступный вагон по умолчанию
    if (train.wagons && train.wagons.length > 0) {
      setSelectedWagon(train.wagons[0]);
    }
    
    // Сбрасываем выбранные места
    setSelectedSeats([]);
    
    navigate('/seats');
  };

  // Функция для обработки клика на последний билет
  const handleLastTicketClick = (ticketData) => {
    console.log('Клик на последний билет:', ticketData);
    
    // Создаем объект поезда из данных билета
    const trainFromTicket = {
      id: `${ticketData.trainNumber}-${Date.now()}`,
      number: ticketData.trainNumber,
      name: `${ticketData.fromCity} → ${ticketData.toCity}`,
      fromCity: ticketData.fromCity,
      fromStation: ticketData.fromStation,
      toCity: ticketData.toCity,
      toStation: ticketData.toStation,
      departureTime: ticketData.departureDate ? 
        `${ticketData.departureDate}T${ticketData.departureTime || '00:00'}:00` : 
        '2023-12-31T00:00:00',
      arrivalTime: ticketData.arrivalDate ? 
        `${ticketData.arrivalDate}T${ticketData.arrivalTime || '00:00'}:00` : 
        '2023-12-31T23:59:00',
      departureDate: ticketData.departureDate || '31.12.2023',
      arrivalDate: ticketData.arrivalDate || '31.12.2023',
      duration: ticketData.duration || 300,
      wagons: ticketData.wagonType ? [
        { 
          type: ticketData.wagonType.toLowerCase(), 
          price: ticketData.price || 2000, 
          availableSeats: 10 
        }
      ] : [
        { type: 'coupe', price: ticketData.price || 2000, availableSeats: 10 }
      ],
      hasWifi: true,
      hasConditioner: true,
      hasLinens: true,
      selectingCount: 5
    };
    
    // Сохраняем в контекст
    setSelectedTrain(trainFromTicket);
    
    // Выбираем первый вагон
    if (trainFromTicket.wagons && trainFromTicket.wagons.length > 0) {
      setSelectedWagon(trainFromTicket.wagons[0]);
    }
    
    // Сбрасываем выбранные места
    setSelectedSeats([]);
    
    // Переходим на страницу выбора мест
    navigate('/seats');
  };

  const timeRanges = [
    { value: 'any', label: 'Любое время' },
    { value: 'morning', label: 'Утро (5:00 - 12:00)' },
    { value: 'day', label: 'День (12:00 - 18:00)' },
    { value: 'evening', label: 'Вечер (18:00 - 23:00)' },
    { value: 'night', label: 'Ночь (23:00 - 5:00)' }
  ];

  const sortOptions = [
    { value: 'departureTime', label: 'По времени отправления' },
    { value: 'price-asc', label: 'По цене (сначала дешевые)' },
    { value: 'price-desc', label: 'По цене (сначала дорогие)' },
    { value: 'duration', label: 'По времени в пути' }
  ];

  return (
    <div className="search-page">
      <OrderSteps />

      <div className="search-page__container">
        {/* Боковая панель с фильтрами */}
        <aside className="search-page__sidebar">
          <div className="filters">
            <h3 className="filters__title">Фильтры</h3>

            {/* Тип вагона */}
            <div className="filters__section">
              <h4 className="filters__section-title">Тип вагона</h4>
              <div className="filters__options filters__options--grid">
                {wagonTypes.map(type => (
                  <button
                    key={type.id}
                    className={`filters__option-btn ${filters.wagonType === type.id ? 'active' : ''}`}
                    onClick={() => handleFilterChange('wagonType', type.id)}
                  >
                    <span className="filters__option-icon">{type.icon}</span>
                    <span className="filters__option-label">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ценовой диапазон */}
            <div className="filters__section">
              <h4 className="filters__section-title">Ценовой диапазон</h4>
              <div className="filters__options filters__options--grid">
                {priceRanges.map(range => (
                  <button
                    key={range.id}
                    className={`filters__option-btn ${filters.priceRange === range.id ? 'active' : ''}`}
                    onClick={() => handleFilterChange('priceRange', range.id)}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Время отправления */}
            <div className="filters__section">
              <h4 className="filters__section-title">Время отправления</h4>
              <div className="filters__options">
                {timeRanges.map(range => (
                  <label key={range.value} className="filters__option">
                    <input
                      type="radio"
                      name="departureTime"
                      value={range.value}
                      checked={filters.departureTime === range.value}
                      onChange={(e) => handleFilterChange('departureTime', e.target.value)}
                      className="filters__radio"
                    />
                    <span className="filters__option-label">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Услуги */}
            <div className="filters__section">
              <h4 className="filters__section-title">Услуги</h4>
              <div className="filters__options">
                <label className="filters__option filters__option--checkbox">
                  <input
                    type="checkbox"
                    checked={filters.hasWifi}
                    onChange={(e) => handleFilterChange('hasWifi', e.target.checked)}
                    className="filters__checkbox"
                  />
                  <span className="filters__option-label">
                    <span className="filters__option-icon">📶</span>
                    Wi-Fi
                  </span>
                </label>
                <label className="filters__option filters__option--checkbox">
                  <input
                    type="checkbox"
                    checked={filters.hasConditioner}
                    onChange={(e) => handleFilterChange('hasConditioner', e.target.checked)}
                    className="filters__checkbox"
                  />
                  <span className="filters__option-label">
                    <span className="filters__option-icon">❄️</span>
                    Кондиционер
                  </span>
                </label>
                <label className="filters__option filters__option--checkbox">
                  <input
                    type="checkbox"
                    checked={filters.hasLinens}
                    onChange={(e) => handleFilterChange('hasLinens', e.target.checked)}
                    className="filters__checkbox"
                  />
                  <span className="filters__option-label">
                    <span className="filters__option-icon">🛏️</span>
                    Белье включено
                  </span>
                </label>
              </div>
            </div>

            <button 
              className="filters__reset"
              onClick={handleResetFilters}
            >
              Сбросить все фильтры
            </button>
          </div>

          {/* Последние билеты */}
          <div className="sidebar__last-tickets">
            <LastTickets onTicketClick={handleLastTicketClick} />
          </div>
        </aside>

        {/* Основной контент */}
        <main className="search-page__main">
          {/* Заголовок с результатами */}
          <div className="search-results__header">
            <div className="search-results__title-wrapper">
              <h2 className="search-results__title">
                Найдено {filteredTrains.length} поездов
                {searchParams && (
                  <span className="search-results__route">
                    {searchParams.from} → {searchParams.to}
                  </span>
                )}
              </h2>
              
              {filteredTrains.length > 0 && (
                <div className="search-results__stats">
                  <div className="search-results__stat">
                    <span className="search-results__stat-label">Средняя цена:</span>
                    <span className="search-results__stat-value">
                      {(() => {
                        const validPrices = filteredTrains
                          .map(train => {
                            const price = getTrainMinPrice(train, filters.wagonType);
                            return price === Infinity ? null : price;
                          })
                          .filter(price => price !== null);
                        
                        if (validPrices.length === 0) return '— ₽';
                        
                        const average = validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length;
                        return `${Math.round(average).toLocaleString('ru-RU')} ₽`;
                      })()}
                    </span>
                  </div>
                  <div className="search-results__stat">
                    <span className="search-results__stat-label">Среднее время в пути:</span>
                    <span className="search-results__stat-value">
                      {filteredTrains.length > 0 
                        ? `${Math.round(filteredTrains.reduce((sum, train) => sum + train.duration, 0) / filteredTrains.length / 60)} ч`
                        : '—'
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Сортировка */}
            <div className="search-results__sort">
              <select 
                className="search-results__sort-select"
                value={sortBy}
                onChange={handleSortChange}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Статистика фильтров */}
          {(filters.wagonType !== 'all' || filters.priceRange !== 'all' || filters.departureTime !== 'any' || filters.hasWifi || filters.hasConditioner || filters.hasLinens) && (
            <div className="filters-summary">
              <div className="filters-summary__title">Примененные фильтры:</div>
              <div className="filters-summary__tags">
                {filters.wagonType !== 'all' && (
                  <div className="filters-summary__tag">
                    <span className="filters-summary__tag-text">
                      {wagonTypes.find(t => t.id === filters.wagonType)?.label}
                    </span>
                    <button 
                      className="filters-summary__tag-remove"
                      onClick={() => handleFilterChange('wagonType', 'all')}
                    >
                      ×
                    </button>
                  </div>
                )}
                {filters.priceRange !== 'all' && (
                  <div className="filters-summary__tag">
                    <span className="filters-summary__tag-text">
                      {priceRanges.find(r => r.id === filters.priceRange)?.label}
                    </span>
                    <button 
                      className="filters-summary__tag-remove"
                      onClick={() => handleFilterChange('priceRange', 'all')}
                    >
                      ×
                    </button>
                  </div>
                )}
                {filters.departureTime !== 'any' && (
                  <div className="filters-summary__tag">
                    <span className="filters-summary__tag-text">
                      {timeRanges.find(t => t.value === filters.departureTime)?.label}
                    </span>
                    <button 
                      className="filters-summary__tag-remove"
                      onClick={() => handleFilterChange('departureTime', 'any')}
                    >
                      ×
                    </button>
                  </div>
                )}
                {(filters.hasWifi || filters.hasConditioner || filters.hasLinens) && (
                  <div className="filters-summary__tag">
                    <span className="filters-summary__tag-text">
                      {[
                        filters.hasWifi && 'Wi-Fi',
                        filters.hasConditioner && 'Кондиционер',
                        filters.hasLinens && 'Белье'
                      ].filter(Boolean).join(', ')}
                    </span>
                    <button 
                      className="filters-summary__tag-remove"
                      onClick={() => {
                        handleFilterChange('hasWifi', false);
                        handleFilterChange('hasConditioner', false);
                        handleFilterChange('hasLinens', false);
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
                <button 
                  className="filters-summary__clear-all"
                  onClick={handleResetFilters}
                >
                  Очистить все
                </button>
              </div>
            </div>
          )}

          {/* Результаты поиска */}
          <div className="search-results">
            {loading ? (
              <div className="search-results__loading">
                <div className="loading-spinner"></div>
                <p>Идет поиск поездов...</p>
              </div>
            ) : filteredTrains.length > 0 ? (
              filteredTrains.map(train => {
                // Получаем минимальную цену для этого поезда с учетом типа вагона
                const minPrice = getTrainMinPrice(train, filters.wagonType);
                const hasValidPrice = minPrice !== Infinity;
                
                return (
                  <TrainCard 
                    key={train.id}
                    train={train}
                    onSelect={handleTrainSelect}
                    // Передаем информацию о фильтрах для отображения правильных цен
                    filteredWagonType={filters.wagonType !== 'all' ? filters.wagonType : null}
                    showPriceRange={hasValidPrice}
                  />
                );
              })
            ) : (
              <div className="search-results__empty">
                <div className="search-results__empty-icon">🔍</div>
                <h3 className="search-results__empty-title">Поезда не найдены</h3>
                <p className="search-results__empty-text">
                  Попробуйте изменить параметры фильтров
                </p>
                <button 
                  className="search-results__empty-button"
                  onClick={handleResetFilters}
                >
                  Сбросить фильтры
                </button>
              </div>
            )}
          </div>

          {/* Пагинация */}
          {filteredTrains.length > 0 && (
            <div className="search-results__pagination">
              <button className="pagination__button pagination__button--prev" disabled>
                ← Назад
              </button>
              <div className="pagination__pages">
                <button className="pagination__page pagination__page--active">1</button>
                <button className="pagination__page">2</button>
                <button className="pagination__page">3</button>
              </div>
              <button className="pagination__button pagination__button--next">
                Далее →
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default SearchPage;
