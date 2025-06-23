import APP_DATA from './app-data.js';

// Gestione localStorage
class StorageManager {
     static getOccupiedSeats(filmId, showtime) {
        const key = `occupied_${filmId}_${showtime}`;
        const configKey = `${filmId}_${showtime}`;
        
        // Posti occupati iniziali dalla configurazione
        const initialSeats = APP_DATA.initialOccupiedSeats[configKey] || [];
        
        // Posti occupati aggiunti tramite prenotazioni (localStorage)
        const bookedSeats = JSON.parse(localStorage.getItem(key)) || [];
        
        // Combina e rimuovi duplicati
        const allOccupiedSeats = [...new Set([...initialSeats, ...bookedSeats])];
        
        return allOccupiedSeats;
    }

    static setOccupiedSeats(filmId, showtime, newSeats) {
        const key = `occupied_${filmId}_${showtime}`;
        
        // Salva solo i nuovi posti prenotati, non quelli iniziali
        const currentBookedSeats = JSON.parse(localStorage.getItem(key)) || [];
        const updatedBookedSeats = [...new Set([...currentBookedSeats, ...newSeats])];
        
        localStorage.setItem(key, JSON.stringify(updatedBookedSeats));
    }

    // Metodo per resettare solo le prenotazioni localStorage
    static clearBookedSeats(filmId, showtime) {
        const key = `occupied_${filmId}_${showtime}`;
        localStorage.removeItem(key);
    }

    // Metodo per ottenere solo i posti prenotati (senza quelli iniziali)
    static getBookedSeatsOnly(filmId, showtime) {
        const key = `occupied_${filmId}_${showtime}`;
        return JSON.parse(localStorage.getItem(key)) || [];
    }

    static saveBooking(booking) {
        localStorage.setItem('currentBooking', JSON.stringify(booking));
    }

    static getBooking() {
        return JSON.parse(localStorage.getItem('currentBooking')) || {};
    }

    static clearBooking() {
        localStorage.removeItem('currentBooking');
    }
}

export default StorageManager;