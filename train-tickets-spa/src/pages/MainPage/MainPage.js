import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TicketSearch from '../../components/TicketSearch/TicketSearch';
import LastTickets from '../../components/LastTickets/LastTickets';
import { useTicket } from '../../context/TicketContext';
import './MainPage.css';

// Импортируем изображения
import avatar1 from '../../assets/images/image1.png';
import avatar2 from '../../assets/images/image2.png';
import svg1 from '../../assets/svg/Subtract.svg';
import svg2 from '../../assets/svg/Subtract-2.svg';
import svg3 from '../../assets/svg/Subtract-3.svg';

function MainPage() {
  const navigate = useNavigate();
  const { setSelectedTrain, setSelectedWagon, setSelectedSeats } = useTicket();

  // Функция для обработки клика на последний билет
  const handleLastTicketClick = (ticketData) => {
    console.log('Клик на последний билет на главной странице:', ticketData);
    
    // Создаем объект поезда из данных билета
    const trainFromTicket = {
      id: `${ticketData.trainNumber}-${Date.now()}`,
      number: ticketData.trainNumber,
      name: `${ticketData.fromCity} → ${ticketData.toCity}`,
      fromCity: ticketData.fromCity,
      fromStation: ticketData.fromStation || `${ticketData.fromCity} вокзал`,
      toCity: ticketData.toCity,
      toStation: ticketData.toStation || `${ticketData.toCity} вокзал`,
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

  return (
    <div className="main-page">
      
      {/* Hero секция */}
      <section className="hero">
        <div className="hero__content">
          <h1 className="hero__title">Вся жизнь - путешествие!</h1>
          <p className="hero__subtitle">
            Найдите и забронируйте железнодорожные билеты онлайн
          </p>
          <TicketSearch />
        </div>
      </section>

      {/* О нас */}
      <section id="about" className="about">
        <div className="about__container">
          <h2 className="about__title">О НАС</h2>
          <div className="about__content">
            <div className="about__text">
              <p>
                Мы рады видеть вас! Мы работаем для Вас с 2003 года. 
                18 лет мы наблюдаем, как с каждым днем все больше людей 
                заказывают жд билеты через интернет.
              </p>
              <p>
                Сегодня можно заказать железнодорожные билеты онлайн всего в 2 клика, 
                но стоит ли это делать? Мы расскажем о преимуществах заказа через интернет.
              </p>
              <div className="about__advantages">
                <div className="about__advantage">
                  <span className="about__advantage-icon">🎯</span>
                  <div className="about__advantage-text">
                    <strong>Покупать жд билеты дешево можно за 90 суток до отправления поезда.</strong>
                  </div>
                </div>
                <div className="about__advantage">
                  <span className="about__advantage-icon">📊</span>
                  <div className="about__advantage-text">
                    <strong>Благодаря динамическому ценообразованию цена на билеты в это время самая низкая.</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="about__image">
              <div className="about__image-placeholder">
                🚂
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Как это работает */}
      <section id="how-it-works" className="how-it-works">
        <div className="how-it-works__container">
          <h2 className="how-it-works__title">КАК ЭТО РАБОТАЕТ</h2>
          <div className="how-it-works__steps">
            <div className="how-it-works__step">
              <div className="how-it-works__step-number">
                <img 
                    src={svg1}
                    alt="1"
                    className='svg-icon'
                  />
              </div>
              <h3 className="how-it-works__step-title">Удобный заказ на сайте</h3>
              <p className="how-it-works__step-description">
                Простой и интуитивно понятный интерфейс позволяет быстро найти 
                и забронировать нужные билеты
              </p>
            </div>
            <div className="how-it-works__step">
              <div className="how-it-works__step-number">
                <img 
                    src={svg2}
                    alt="2"
                    className='svg-icon'
                  />
              </div>
              <h3 className="how-it-works__step-title">Нет необходимости ехать в офис</h3>
              <p className="how-it-works__step-description">
                Заказывайте билеты из дома, офиса или в дороге через мобильное приложение
              </p>
            </div>
            <div className="how-it-works__step">
              <div className="how-it-works__step-number">
                <img 
                    src={svg3}
                    alt="3"
                    className='svg-icon'
                  />
              </div>
              <h3 className="how-it-works__step-title">Огромный выбор направлений</h3>
              <p className="how-it-works__step-description">
                Билеты на поезда по всей России и странам СНГ
              </p>
            </div>
          </div>
          <Link to="/search" className="how-it-works__cta">
            Узнать больше →
          </Link>
        </div>
      </section>

      {/* Последние билеты */}
      <section className="last-tickets-section">
        <LastTickets onTicketClick={handleLastTicketClick} />
      </section>

      {/* Отзывы */}
      <section id="reviews" className="reviews">
        <div className="reviews__container">
          <h2 className="reviews__title">ОТЗЫВЫ</h2>
          <div className="reviews__list">
            <div className="review">
              <div className="review__header">
                <div className="review__avatar">
                  <img 
                    src={avatar2}
                    alt="Екатерина Вальнова"
                    className="review__avatar-image"
                    onError={(e) => {
                      // Если изображение не загрузилось
                      e.target.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'review__avatar-fallback';
                      fallback.textContent = 'ЕВ';
                      e.target.parentElement.appendChild(fallback);
                    }}
                  />
                </div>
                <div className="review__author-info">
                  <h3 className="review__author">Екатерина Вальнова</h3>
                  <div className="review__rating">★★★★★</div>
                </div>
              </div>
              <blockquote className="review__text">
                "Доброжелательные подсказки на всех этапах помогут правильно заполнить 
                поля и без затруднений купить авиа или ж/д билет, даже если вы заказываете 
                онлайн билет впервые."
              </blockquote>
            </div>
            <div className="review">
              <div className="review__header">
                <div className="review__avatar">
                  <img 
                    src={avatar1}
                    alt="Евгений Стрыкало"
                    className="review__avatar-image"
                    onError={(e) => {
                      // Если изображение не загрузилось
                      e.target.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'review__avatar-fallback';
                      fallback.textContent = 'ЕС';
                      e.target.parentElement.appendChild(fallback);
                    }}
                  />
                </div>
                <div className="review__author-info">
                  <h3 className="review__author">Евгений Стрыкало</h3>
                  <div className="review__rating">★★★★★</div>
                </div>
              </div>
              <blockquote className="review__text">
                "СМС-сопровождение до посадки. Сразу после оплаты ж/д билетов и за 3 часа 
                до отправления мы пришлем вам СМС-напоминание о поездке."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default MainPage;
