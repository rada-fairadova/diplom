import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTicket } from '../../context/TicketContext';
import OrderSteps from '../../components/OrderSteps/OrderSteps';
import TrainCard from '../../components/TrainCard/TrainCard';
import LastTickets from '../../components/LastTickets/LastTickets';
import './SearchPage.css';

// API базовый URL
const API_BASE_URL = 'https://students.netoservices.ru/fe-diplom';

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
  { id: 'first', label: 'Люкс', icon: '⭐' },
  { id: 'second', label: 'Купе', icon: '🚂' },
  { id: 'third', label: 'Плацкарт', icon: '🛌' },
  { id: 'fourth', label: 'Сидячий', icon: '💺' },
];

function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchParams, setSelectedTrain, setSelectedWagon, setSelectedSeats } = useTicket();
  const [trains, setTrains] = useState([]);
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    // Получаем параметры поиска из контекста или из URL
    const fetchTrains = async () => {
      if (!searchParams) {
        setError('Параметры поиска не указаны');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Формируем параметры для API
        const params = new URLSearchParams({
          from_city_id: searchParams.fromId || '',
          to_city_id: searchParams.toId || '',
          date_start: searchParams.departureDate || '',
          date_end: searchParams.departureDate || '',
          have_first_class: true,
          have_second_class: true,
          have_third_class: true,
          have_fourth_class: true,
          have_wifi: false,
          have_air_conditioning: false,
          have_express: false
        });

        console.log('Fetching trains with params:', params.toString());

        const response = await fetch(`${API_BASE_URL}/routes?${params}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Ошибка API: ${response.status}`);
        }

        const data = await response.json();
        console.log('API response:', data);

        if (data && Array.isArray(data.items)) {
          const formattedTrains = data.items.map(item => ({
            id: item.departure._id || item.departure.train._id,
            number: item.departure.train._id || item.departure.train.name,
            name: `${item.departure.from.city.name} → ${item.departure.to.city.name}`,
            fromCity: item.departure.from.city.name,
            fromStation: item.departure.from.railway_station_name,
            toCity: item.departure.to.city.name,
            toStation: item.departure.to.railway_station_name,
            departureTime: item.departure.from.datetime,
            arrivalTime: item.departure.to.datetime,
            departureDate: new Date(item.departure.from.datetime).toLocaleDateString('ru-RU'),
            arrivalDate: new Date(item.departure.to.datetime).toLocaleDateString('ru-RU'),
            duration: item.departure.duration || Math.round(
              (new Date(item.departure.to.datetime) - new Date(item.departure.from.datetime)) / 60000
            ),
            priceInfo: item.departure, // Сохраняем всю информацию о ценах
            wagons: [
              ...(item.departure.have_first_class ? [{
                type: 'first',
                price: item.departure.price_info?.first?.bottom_price || 0,
                availableSeats: item.departure.available_seats_info?.first || 0,
                topPrice: item.departure.price_info?.first?.top_price || 0
              }] : []),
              ...(item.departure.have_second_class ? [{
                type: 'second',
                price: item.departure.price_info?.second?.bottom_price || 0,
                availableSeats: item.departure.available_seats_info?.second || 0,
                topPrice: item.departure.price_info?.second?.top_price || 0
              }] : []),
              ...(item.departure.have_third_class ? [{
                type: 'third',
                price: item.departure.price_info?.third?.bottom_price || 0,
                availableSeats: item.departure.available_seats_info?.third || 0,
                topPrice: item.departure.price_info?.third?.top_price || 0
              }] : []),
              ...(item.departure.have_fourth_class ? [{
                type: 'fourth',
                price: item.departure.price_info?.fourth?.bottom_price || 0,
                availableSeats: item.departure.available_seats_info?.fourth || 0,
                topPrice: item.departure.price_info?.fourth?.top_price || 0
              }] : [])
            ].filter(wagon => wagon.price > 0), // Фильтруем вагоны с нулевой ценой
            hasWifi: item.departure.have_wifi,
            hasConditioner: item.departure.have_air_conditioning,
            hasLinens: item.departure.have_linens_included,
            selectingCount: Math.floor(Math.random() * 20) + 1 // Генерируем случайное число
          }));

          setTrains(formattedTrains);
          setFilteredTrains(formattedTrains);
        } else {
          setTrains([]);
          setFilteredTrains([]);
        }
      } catch (err) {
        console.error('Ошибка при загрузке поездов:', err);
        setError('Не удалось загрузить поезда. Пожалуйста, попробуйте позже.');
        // Временно используем моковые данные для демонстрации
        setTrains(getMockTrains());
        setFilteredTrains(getMockTrains());
      } finally {
        setLoading(false);
      }
    };

    fetchTrains();
  }, [searchParams]);

  useEffect(() => {
    // Фильтрация поездов
    let filtered = [...trains];
    
    // Фильтр по типу вагона
    if (filters.wagonType !== 'all') {
      filtered = filtered.filter(train => {
        return train.wagons.some(wagon => wagon.type === filters.wagonType);
      });
    }

    // Фильтр по ценовому диапазону
    const priceRange = priceRanges.find(range => range.id === filters.priceRange);
    if (priceRange && priceRange.id !== 'all') {
      filtered = filtered.filter(train => {
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

  const handleTrainSelect = async (train) => {
    try {
      // Загружаем детальную информацию о поезде
      const response = await fetch(`${API_BASE_URL}/routes/${train.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Не удалось загрузить детальную информацию о поезде');
      }

      const trainDetails = await response.json();
      
      // Сохраняем выбранный поезд в контекст
      const selectedTrain = {
        id: train.id,
        number: train.number,
        name: train.name,
        fromCity: train.fromCity,
        fromStation: train.fromStation,
        toCity: train.toCity,
        toStation: train.toStation,
        departureTime: train.departureTime,
        arrivalTime: train.arrivalTime,
        departureDate: train.departureDate,
        arrivalDate: train.arrivalDate,
        duration: train.duration,
        hasWifi: train.hasWifi,
        hasConditioner: train.hasConditioner,
        hasLinens: train.hasLinens,
        priceInfo: train.priceInfo,
        detailedInfo: trainDetails
      };
      
      setSelectedTrain(selectedTrain);
      
      // Переходим на страницу выбора мест
      navigate('/seats');
    } catch (error) {
      console.error('Ошибка при выборе поезда:', error);
      // Если API не работает, используем базовые данные
      const selectedTrain = {
        id: train.id,
        number: train.number,
        name: train.name,
        fromCity: train.fromCity,
        fromStation: train.fromStation,
        toCity: train.toCity,
        toStation: train.toStation,
        departureTime: train.departureTime,
        arrivalTime: train.arrivalTime,
        departureDate: train.departureDate,
        arrivalDate: train.arrivalDate,
        duration: train.duration,
        hasWifi: train.hasWifi,
        hasConditioner: train.hasConditioner,
        hasLinens: train.hasLinens,
        priceInfo: train.priceInfo
      };
      
      setSelectedTrain(selectedTrain);
      navigate('/seats');
    }
  };

  // Функция для обработки клика на последний билет
  const handleLastTicketClick = (ticketData) => {
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
        new Date().toISOString(),
      arrivalTime: ticketData.arrivalDate ? 
        `${ticketData.arrivalDate}T${ticketData.arrivalTime || '00:00'}:00` : 
        new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      departureDate: ticketData.departureDate || new Date().toLocaleDateString('ru-RU'),
      arrivalDate: ticketData.arrivalDate || new Date(Date.now() + 5 * 60 * 60 * 1000).toLocaleDateString('ru-RU'),
      duration: ticketData.duration || 300,
      wagons: ticketData.wagonType ? [
        { 
          type: ticketData.wagonType.toLowerCase(), 
          price: ticketData.price || 2000, 
          availableSeats: 10 
        }
      ] : [
        { type: 'second', price: ticketData.price || 2000, availableSeats: 10 }
      ],
      hasWifi: true,
      hasConditioner: true,
      hasLinens: true,
      selectingCount: 5
    };
    
    setSelectedTrain(trainFromTicket);
    navigate('/seats');
  };

  // Функция для получения моковых данных (на случай ошибки API)
  const getMockTrains = () => {
    return [
      {
        id: '116C',
        number: '116C',
        name: 'Москва → Санкт-Петербург',
        fromCity: 'Москва',
        fromStation: 'Ленинградский вокзал',
        toCity: 'Санкт-Петербург',
        toStation: 'Московский вокзал',
        departureTime: '2024-12-30T22:30:00',
        arrivalTime: '2024-12-31T08:45:00',
        departureDate: '30.12.2024',
        arrivalDate: '31.12.2024',
        duration: 615, // 10 часов 15 минут
        wagons: [
          { type: 'fourth', price: 1920, availableSeats: 35 },
          { type: 'third', price: 2530, availableSeats: 24 },
          { type: 'second', price: 3820, availableSeats: 15 },
          { type: 'first', price: 4950, availableSeats: 8 }
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
        departureTime: '2024-12-30T11:30:00',
        arrivalTime: '2024-12-30T20:15:00',
        departureDate: '30.12.2024',
        arrivalDate: '30.12.2024',
        duration: 525, // 8 часов 45 минут
        wagons: [
          { type: 'fourth', price: 1800, availableSeats: 42 },
          { type: 'third', price: 2400, availableSeats: 32 },
          { type: 'second', price: 3600, availableSeats: 18 }
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
        departureTime: '2024-12-30T15:45:00',
        arrivalTime: '2024-12-30T21:30:00',
        departureDate: '30.12.2024',
        arrivalDate: '30.12.2024',
        duration: 345, // 5 часов 45 минут
        wagons: [
          { type: 'fourth', price: 1500, availableSeats: 28 },
          { type: 'third', price: 2200, availableSeats: 20 },
          { type: 'second', price: 3200, availableSeats: 12 }
        ],
        hasWifi: true,
        hasConditioner: true,
        hasLinens: false,
        selectingCount: 3
      }
    ];
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

          {/* Сообщение об ошибке */}
          {error && (
            <div className="search-results__error">
              <div className="search-results__error-icon">⚠️</div>
              <div className="search-results__error-text">{error}</div>
            </div>
          )}

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
                const minPrice = getTrainMinPrice(train, filters.wagonType);
                const hasValidPrice = minPrice !== Infinity;
                
                return (
                  <TrainCard 
                    key={train.id}
                    train={train}
                    onSelect={handleTrainSelect}
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
                  {error ? error : 'Попробуйте изменить параметры фильтров или даты'}
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
