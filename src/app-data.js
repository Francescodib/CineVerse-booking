// Dati dell'applicazione
const APP_DATA = {
  films: [
    {
      id: 1,
      title: "Avengers: Endgame",
      genre: "Azione",
      duration: "181 min",
      description: "L'epico finale della saga degli Avengers",
      poster: "../assets/img/avengers.jpg",
      showtimes: [
        { time: "15:30", type: "pomeridiano", availability: "limited" },
        { time: "18:00", type: "pomeridiano", availability: "limited" },
      ],
    },
    {
      id: 2,
      title: "Il Padrino",
      genre: "Drammatico",
      duration: "175 min",
      description: "Il capolavoro di Francis Ford Coppola",
      poster: "../assets/img/il-padrino.jpg",
      showtimes: [
        { time: "16:00", type: "pomeridiano", availability: "available" },
        { time: "19:30", type: "serale", availability: "available" },
      ],
    },
    {
      id: 3,
      title: "Inception",
      genre: "Fantascienza",
      duration: "148 min",
      description: "Un thriller onirico di Christopher Nolan",
      poster: "../assets/img/inception.jpg",
      showtimes: [
        { time: "15:00", type: "pomeridiano", availability: "limited" },
        { time: "18:30", type: "serale", availability: "available" },
        { time: "21:45", type: "serale", availability: "full" },
      ],
    },
    {
      id: 4,
      title: "La La Land",
      genre: "Romantico",
      duration: "128 min",
      description: "Una storia d'amore moderna a Los Angeles",
      poster: "../assets/img/lalaland.jpg",
      showtimes: [
        { time: "14:30", type: "pomeridiano", availability: "available" },
        { time: "17:00", type: "pomeridiano", availability: "available" },
      ],
    },
    {
      id: 5,
      title: "Parasite",
      genre: "Thriller",
      duration: "132 min",
      description: "Il vincitore dell'Oscar di Bong Joon-ho",
      poster: "../assets/img/parasite.jpg",
      showtimes: [
        { time: "19:00", type: "serale", availability: "available" },
        { time: "22:00", type: "serale", availability: "limited" },
      ],
    },
    {
      id: 6,
      title: "Dune",
      genre: "Fantascienza",
      duration: "155 min",
      description: "L'epico adattamento del romanzo di Frank Herbert",
      poster: "../assets/img/dune.jpg",
      showtimes: [
        { time: "18:45", type: "serale", availability: "limited" },
        { time: "21:30", type: "serale", availability: "available" },
      ],
    },
  ],
  initialOccupiedSeats: {
    // Formato: "filmId_orario": [array di posti occupati]

    "1_15:30": [2, 3, 5, 6, 12, 13, 19, 20, 27, 28, 34, 35, 47, 48, 82, 83, 84, 85],
    "1_18:00": [1, 2, 7, 8, 16, 17, 25, 26, 40, 41, 55, 56, 71, 72],
    "2_16:00": [3, 4, 10, 11, 18, 19, 31, 32, 46, 47, 60, 61],
    "2_19:30": [5, 6, 14, 15, 21, 22, 33, 34, 50, 51, 66, 67, 78, 79],
    "3_15:00": [1, 2, 13, 14, 30, 31, 45, 46, 59, 60, 74, 75, 89, 90],
    "3_18:30": [4, 5, 20, 21, 35, 36, 50, 51, 65, 66, 80, 81],
    "3_21:45": [6, 7, 18, 19, 33, 34, 48, 49, 63, 64, 78, 79],
    "4_14:30": [8, 9, 22, 23, 37, 38, 52, 53, 67, 68, 82, 83],
    "4_17:00": [10, 11, 27, 28, 39, 40, 54, 55, 69, 70, 84, 85],
    "5_19:00": [12, 13, 29, 30, 42, 43, 57, 58, 72, 73, 87, 88],
    "5_22:00": [14, 15, 31, 32, 44, 45, 59, 60, 74, 75, 89, 90],
    "6_18:45": [1, 2, 16, 17, 33, 34, 48, 49, 63, 64, 78, 79],
    "6_21:30": [3, 4, 18, 19, 35, 36, 50, 51, 65, 66, 80, 81],
  },
  currentBooking: {
    film: null,
    showtime: null,
    seats: [],
    ticketTypes: {},
    total: 0,
  },
  currentStep: 1,
  ticketPrices: {
    full: 12.0,
    reduced: 8.5,
  },
};

export default APP_DATA;
