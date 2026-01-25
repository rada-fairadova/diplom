import axios from 'axios';

const API_BASE_URL = 'https://api.example.com/train-tickets'; // Замените на реальный URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const trainApi = {
  // Поиск билетов
  async searchTickets(params) {
    try {
      const response = await api.get('/search', { params });
      return response.data;
    } catch (error) {
      console.error('Search tickets error:', error);
      throw error;
    }
  },

  // Получение деталей поезда
  async getTrainDetails(trainId) {
    try {
      const response = await api.get(`/trains/${trainId}`);
      return response.data;
    } catch (error) {
      console.error('Get train details error:', error);
      throw error;
    }
  },

  // Получение мест в вагоне
  async getWagonSeats(wagonId) {
    try {
      const response = await api.get(`/wagons/${wagonId}/seats`);
      return response.data;
    } catch (error) {
      console.error('Get wagon seats error:', error);
      throw error;
    }
  },

  // Бронирование места
  async bookSeat(seatId, passengerData) {
    try {
      const response = await api.post('/booking', {
        seatId,
        passenger: passengerData
      });
      return response.data;
    } catch (error) {
      console.error('Book seat error:', error);
      throw error;
    }
  },

  // Оплата
  async processPayment(orderId, paymentData) {
    try {
      const response = await api.post(`/orders/${orderId}/payment`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Process payment error:', error);
      throw error;
    }
  },

  // Подтверждение заказа
  async confirmOrder(orderId) {
    try {
      const response = await api.post(`/orders/${orderId}/confirm`);
      return response.data;
    } catch (error) {
      console.error('Confirm order error:', error);
      throw error;
    }
  }
};

export default api;
