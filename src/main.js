import StorageManager from './local_storage.js';
import APP_DATA from './app-data.js';

// Gestore dell'applicazione
class CineVerseApp {
    constructor() {
        this.seatClickHandler = null; // Riferimento al gestore eventi
        this.init();
    }

    init() {
        this.renderMovies();
        this.setupEventListeners();
        this.updateAvailability();
    }

    setupEventListeners() {
        // Filtri orario
        document.querySelectorAll('#timeFilters .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterByTime(e.target.dataset.time));
        });

        // Bottone continua
        document.getElementById('continueToSeats').addEventListener('click', () => {
            if (APP_DATA.currentBooking.film && APP_DATA.currentBooking.showtime) {
                this.goToStep(2);
            }
        });

        // Bottone continua al pagamento
        document.getElementById('continueToPayment').addEventListener('click', () => {
            if (APP_DATA.currentBooking.seats.length > 0) {
                this.goToStep(3);
            }
        });

        // Bottone completa pagamento
        document.getElementById('completePayment').addEventListener('click', () => {
            this.processPayment();
        });

        document.getElementById('backToMovies').addEventListener('click', () => {
            this.goToStep(1);
        });

        document.getElementById('backToSeats').addEventListener('click', () => {
            this.goToStep(2);
        });
    }

    renderMovies() {
        const grid = document.getElementById('moviesGrid');
        grid.innerHTML = '';
        // Genera card con ciclo forEach
        APP_DATA.films.forEach(film => {
            const movieCard = this.createMovieCard(film);
            grid.appendChild(movieCard);
        });
    }

    createMovieCard(film) {
        const col = document.createElement('div');
        col.className = 'col-lg-3 col-md-6 mb-4';

        const showtimesHTML = film.showtimes.map(showtime => 
            `<button class="showtime-btn" data-film="${film.id}" data-time="${showtime.time}">
                ${showtime.time}
            </button>`
        ).join('');

        const availabilityClass = this.getAvailabilityClass(film);
        const availabilityText = this.getAvailabilityText(film);

        col.innerHTML = `
            <div class="movie-card" data-film="${film.id}">
                <div class="movie-poster">
                    <img src="${film.poster}" alt="${film.title} Poster">
                </div>
                <div class="movie-info">
                    <div class="movie-title">${film.title}</div>
                    <div class="movie-genre">${film.genre}</div>
                    <div class="movie-duration"><i class="bi bi-clock"></i> ${film.duration}</div>
                    <div class="showtimes mb-3">
                        ${showtimesHTML}
                    </div>
                    <div class="availability">
                        <div class="availability-dot ${availabilityClass}"></div>
                        ${availabilityText}
                    </div>
                </div>
            </div>
        `;

        // Event listeners per i pulsanti degli orari
        col.querySelectorAll('.showtime-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectShowtime(film.id, e.target.dataset.time);
            });
        });

        return col;
    }

    getAvailabilityClass(film) {
        const totalAvailable = film.showtimes.filter(s => s.availability === 'available').length;
        const totalLimited = film.showtimes.filter(s => s.availability === 'limited').length;
        
        if (totalAvailable > 0) return 'available';
        if (totalLimited > 0) return 'limited';
        return 'full';
    }

    getAvailabilityText(film) {
        const availableCount = film.showtimes.filter(s => s.availability === 'available').length;
        const limitedCount = film.showtimes.filter(s => s.availability === 'limited').length;
        
        if (availableCount > 0) return 'Molti posti disponibili';
        if (limitedCount > 0) return 'Pochi posti rimasti';
        return 'Tutto esaurito';
    }

    selectShowtime(filmId, time) {
        // Rimuovi selezioni precedenti
        document.querySelectorAll('.showtime-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        document.querySelectorAll('.movie-card').forEach(card => {
            card.style.border = 'none';
        });

        // Seleziona nuovo orario
        const selectedBtn = document.querySelector(`[data-film="${filmId}"][data-time="${time}"]`);
        const selectedCard = document.querySelector(`[data-film="${filmId}"]`);
        
        selectedBtn.classList.add('selected');
        selectedCard.style.border = '3px solid var(--accent-gold)';

        // Aggiorna dati prenotazione
        APP_DATA.currentBooking.film = APP_DATA.films.find(f => f.id == filmId);
        APP_DATA.currentBooking.showtime = time;

        // Abilita bottone continua
        document.getElementById('continueToSeats').disabled = false;

        // Salva in localStorage
        StorageManager.saveBooking(APP_DATA.currentBooking);
    }

    filterByTime(timeType) {
        // Aggiorna UI filtri
        document.querySelectorAll('#timeFilters .filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.time === timeType);
        });

        // Filtra film
        const movieCards = document.querySelectorAll('.movie-card');
        movieCards.forEach(card => {
            const filmId = card.dataset.film;
            const film = APP_DATA.films.find(f => f.id == filmId);
            
            let show = timeType === 'all';
            if (!show) {
                show = film.showtimes.some(s => s.type === timeType);
            }
            
            card.closest('.col-lg-3').style.display = show ? 'block' : 'none';
        });
    }

    updateAvailability() {
        // Simula aggiornamento disponibilità basato su localStorage
        APP_DATA.films.forEach(film => {
            film.showtimes.forEach(showtime => {
                const occupiedSeats = StorageManager.getOccupiedSeats(film.id, showtime.time);
                const totalSeats = 150; // 10 righe x 15 posti
                const occupiedCount = occupiedSeats.length;
                
                if (occupiedCount >= totalSeats) {
                    showtime.availability = 'full';
                } else if (occupiedCount > totalSeats * 0.7) {
                    showtime.availability = 'limited';
                } else {
                    showtime.availability = 'available';
                }
            });
        });
    }

    goToStep(step) {
        // Aggiorna step corrente
        APP_DATA.currentStep = step;

        // Se torniamo al step 1, pulisci la selezione corrente
        if (step === 1) {
            // Rimuovi selezioni visive precedenti
            document.querySelectorAll('.showtime-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            document.querySelectorAll('.movie-card').forEach(card => {
                card.style.border = 'none';
            });
            
            // Reset della prenotazione quando si torna al primo step
            APP_DATA.currentBooking = {
                film: null,
                showtime: null,
                seats: [],
                ticketTypes: {},
                total: 0
            };
        }

        // Aggiorna progress bar
        const progressBar = document.getElementById('progressBar');
        progressBar.style.width = `${(step / 3) * 100}%`;

        // Aggiorna indicatori step
        document.querySelectorAll('.step').forEach((stepEl, index) => {
            stepEl.classList.remove('active', 'completed');
            
            if (index + 1 === step) {
                stepEl.classList.add('active');
            } else if (index + 1 < step) {
                stepEl.classList.add('completed');
            }
        });

        // Mostra/nascondi schermate
        document.querySelectorAll('.movie-selection-screen, .seat-selection-screen, .payment-screen').forEach(screen => {
            screen.style.display = 'none';
        });

        switch(step) {
            case 1:
                document.getElementById('movieSelectionScreen').style.display = 'block';                
                break;
            case 2:
                document.getElementById('seatSelectionScreen').style.display = 'block';
                this.initSeatSelection();
                break;
            case 3:
                document.getElementById('paymentScreen').style.display = 'block';
                this.initPayment();
                break;
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    initSeatSelection() {
        const { film, showtime } = APP_DATA.currentBooking;
        
        // Genera griglia posti SOLO se non esiste già o se è cambiato film/orario
        const container = document.getElementById('seats');
        const needsRegeneration = container.innerHTML === '' || 
                                container.dataset.filmId != film.id || 
                                container.dataset.showtime != showtime;

        if (needsRegeneration) {
            this.generateSeatsGrid();
        } else {
            // Se la griglia esiste già, ripristina solo la selezione
            this.restoreSeatSelection();
        }
        
        // Aggiorna riepilogo
        this.updateBookingSummary();
    }

    generateSeatsGrid() {
        const container = document.getElementById('seats');
        container.innerHTML = '';

        const { film, showtime } = APP_DATA.currentBooking;
        
        // Marca il container con film e orario correnti
        container.dataset.filmId = film.id;
        container.dataset.showtime = showtime;

        const occupiedSeats = StorageManager.getOccupiedSeats(film.id, showtime);

        const rows = 10;
        const cols = 15;

        // Rimuovi event listener precedente se esiste
        if (this.seatClickHandler) {
            container.removeEventListener('click', this.seatClickHandler);
        }

        // Crea nuovo gestore eventi
        this.seatClickHandler = (event) => {
            const button = event.target.closest('button');
            if (!button || !container.contains(button)) return;
            
            if (button.classList.contains('free') || button.classList.contains('selected')) {
                console.log('Posto cliccato:', button.dataset.index);
                button.classList.toggle('selected');
                this.updateTicketCount();
                this.updateTicketTypes();
                this.updateBookingSummary();
            }
        };

        // Usa ciclo for per generare i posti
        for (let i = 0; i < rows * cols; i++) {
            const btn = document.createElement('button');
            btn.classList.add('seat');
            btn.innerHTML = '<i class="bi bi-person-fill"></i>';
            btn.dataset.index = i + 1;

            if (occupiedSeats.includes(i + 1)) {
                btn.classList.add('occupied');
                btn.disabled = true;
            } else {
                btn.classList.add('free');
            }

            container.appendChild(btn);
        }

        // Aggiungi il nuovo event listener
        container.addEventListener('click', this.seatClickHandler);

        // Ripristina la selezione se esistono posti già selezionati
        this.restoreSeatSelection();
    }

    restoreSeatSelection() {
        const { seats } = APP_DATA.currentBooking;
        
        // Ripristina la selezione visiva dei posti
        seats.forEach(seatNumber => {
            const seatElement = document.querySelector(`[data-index="${seatNumber}"]`);
            if (seatElement && seatElement.classList.contains('free')) {
                seatElement.classList.add('selected');
            }
        });

        // Aggiorna il contatore e la lista
        this.updateTicketCount();
    }

    updateTicketCount() {
        const selectedSeats = document.querySelectorAll('button.seat.selected');
        console.log("Posti selezionati ", selectedSeats);
        const selectedIndexes = Array.from(selectedSeats).map(seat => parseInt(seat.dataset.index));

        // Aggiorna la lista dei posti selezionati
        const selectedSeatsList = document.getElementById('selectedList');
        selectedSeatsList.textContent = selectedIndexes.length > 0
            ? 'Posti selezionati: ' + selectedIndexes.join(', ')
            : 'Posti selezionati: nessuno';

        // Aggiorna dati prenotazione
        APP_DATA.currentBooking.seats = selectedIndexes;

        // Abilita/disabilita bottone continua
        document.getElementById('continueToPayment').disabled = selectedIndexes.length === 0;

        // Salva in localStorage
        StorageManager.saveBooking(APP_DATA.currentBooking);
    }

    updateTicketTypes() {
        const selectedSeats = document.querySelectorAll('.seat.selected');
        console.log("Posti selezionati per tipi: ", selectedSeats);
        
        // Crea un nuovo oggetto per i tipi biglietti basato sui posti attualmente selezionati
        const newTicketTypes = {};
        
        selectedSeats.forEach(seat => {
            const seatNumber = seat.dataset.index;
            // Mantieni il tipo precedente se esiste, altrimenti usa 'full'
            newTicketTypes[seatNumber] = APP_DATA.currentBooking.ticketTypes[seatNumber] || 'full';
        });

        // Aggiorna i tipi biglietti
        APP_DATA.currentBooking.ticketTypes = newTicketTypes;
    }

    updateBookingSummary() {
        const { film, showtime, seats, ticketTypes } = APP_DATA.currentBooking;
        const summary = document.getElementById('bookingSummary');

        if (!film || !showtime || seats.length === 0) {
            summary.innerHTML = '<p class="text-muted">Seleziona i posti per vedere il riepilogo</p>';
            return;
        }

        let total = 0;
        let summaryHTML = `
            <div class="mb-3">
                <h6><i class="bi bi-camera-reels"></i> ${film.title}</h6>
                <small class="text-muted">${film.genre} • ${film.duration}</small>
            </div>
            <div class="mb-3">
                <h6><i class="bi bi-clock"></i> Orario: ${showtime}</h6>
            </div>
            <div class="mb-3">
                <h6><i class="bi bi-geo-alt"></i> Posti Selezionati</h6>
        `;

        seats.forEach(seatNumber => {
            const ticketType = ticketTypes[seatNumber] || 'full';
            const price = APP_DATA.ticketPrices[ticketType];
            total += price;

            console.log(`Posto ${seatNumber} - Tipo: ${ticketType} - Prezzo: €${price.toFixed(2)}`);

            summaryHTML += `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span>Posto ${seatNumber}</span>
                    <div>
                        <select class="form-select form-select-sm ticket-type-select" style="width: auto; display: inline-block;" data-seat="${seatNumber}">
                            <option value="full" ${ticketType === 'full' ? 'selected' : ''}>Intero €${APP_DATA.ticketPrices.full.toFixed(2)}</option>
                            <option value="reduced" ${ticketType === 'reduced' ? 'selected' : ''}>Ridotto €${APP_DATA.ticketPrices.reduced.toFixed(2)}</option>
                        </select>
                    </div>
                </div>
            `;
        });

        summaryHTML += `
            </div>
            <hr>
            <div class="d-flex justify-content-between">
                <strong>Totale:</strong>
                <strong>€${total.toFixed(2)}</strong>
            </div>
        `;

        summary.innerHTML = summaryHTML;
        APP_DATA.currentBooking.total = total;

        // Riapplica event listeners per i select dei tipi biglietto
        summary.querySelectorAll('.ticket-type-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const seatNumber = e.target.dataset.seat;
                const ticketType = e.target.value;
                this.updateTicketType(seatNumber, ticketType);
            });
        });

        // Salva in localStorage
        StorageManager.saveBooking(APP_DATA.currentBooking);
    }

    updateTicketType(seatNumber, ticketType) {
        APP_DATA.currentBooking.ticketTypes[seatNumber] = ticketType;
        this.updateBookingSummary();
    }

    initPayment() {
        const { film, showtime, seats, ticketTypes, total } = APP_DATA.currentBooking;
        const finalSummary = document.getElementById('finalSummary');

        let ticketDetails = '';
        seats.forEach(seatNumber => {
            const ticketType = ticketTypes[seatNumber];
            const price = APP_DATA.ticketPrices[ticketType];
            const typeLabel = ticketType === 'full' ? 'Intero' : 'Ridotto';
            ticketDetails += `
                <div class="d-flex justify-content-between">
                    <span>Posto ${seatNumber} - ${typeLabel}</span>
                    <span>€${price.toFixed(2)}</span>
                </div>
            `;
        });

        finalSummary.innerHTML = `
            <div class="alert alert-info">
                <h5><i class="bi bi-info-circle"></i> Riepilogo Finale</h5>
                <div class="mb-3">
                    <strong>Film:</strong> ${film.title}<br>
                    <strong>Orario:</strong> ${showtime}<br>
                    <strong>Biglietti:</strong> ${seats.length}
                </div>
                <div class="mb-3">
                    ${ticketDetails}
                </div>
                <hr>
                <div class="d-flex justify-content-between">
                    <strong>Totale da Pagare:</strong>
                    <strong class="text-primary">€${total.toFixed(2)}</strong>
                </div>
            </div>
        `;
    }

    processPayment() {
        const form = document.getElementById('paymentForm');
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Simula elaborazione pagamento
        const continueBtn = document.getElementById('completePayment');
        const originalText = continueBtn.innerHTML;
        
        continueBtn.disabled = true;
        continueBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Elaborazione...';

        setTimeout(() => {
            // Salva solo i nuovi posti prenotati (non quelli già configurati)
            const { film, showtime, seats } = APP_DATA.currentBooking;
            StorageManager.setOccupiedSeats(film.id, showtime, seats);

            // Mostra successo
            this.showPaymentSuccess();

            // Reset
            continueBtn.disabled = false;
            continueBtn.innerHTML = originalText;
            
        }, 3000);
    }

    showPaymentSuccess() {
        const bookingCode = 'CV' + Math.random().toString(36).substr(2, 8).toUpperCase();
        const { film, showtime, seats, total } = APP_DATA.currentBooking;

        const successModal = `
            <div class="modal fade" id="successModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content bg-dark text-light">
                        <div class="modal-header border-success">
                            <h5 class="modal-title text-success">
                                <i class="bi bi-check-circle-fill"></i> Pagamento Completato!
                            </h5>
                        </div>
                        <div class="modal-body text-center">
                            <div class="alert alert-success">
                                <h4>🎉 Prenotazione Confermata!</h4>
                                <p class="mb-0">La tua prenotazione è stata completata con successo</p>
                            </div>
                            
                            <div class="card bg-secondary text-light mb-4">
                                <div class="card-header">
                                    <h6><i class="bi bi-ticket-perforated"></i> Dettagli Prenotazione</h6>
                                </div>
                                <div class="card-body">
                                    <div class="row text-start">
                                        <div class="col-6"><strong>Film:</strong></div>
                                        <div class="col-6">${film.title}</div>
                                        <div class="col-6"><strong>Orario:</strong></div>
                                        <div class="col-6">${showtime}</div>
                                        <div class="col-6"><strong>Posti:</strong></div>
                                        <div class="col-6">${seats.join(', ')}</div>
                                        <div class="col-6"><strong>Totale:</strong></div>
                                        <div class="col-6">€${total.toFixed(2)}</div>
                                        <div class="col-6"><strong>Codice:</strong></div>
                                        <div class="col-6 text-warning">${bookingCode}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <p class="text-muted">
                                <i class="bi bi-envelope"></i> 
                                Ti abbiamo inviato una email di conferma con tutti i dettagli
                            </p>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-success" onclick="location.reload()">
                                <i class="bi bi-house"></i> Torna alla Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', successModal);
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();

        // Pulisci dati prenotazione
        StorageManager.clearBooking();
        APP_DATA.currentBooking = { film: null, showtime: null, seats: [], ticketTypes: {}, total: 0 };
    }
}

// Funzioni globali
function goToStep(step) {
    app.goToStep(step);
}

// Funzione per resettare tutti i posti prenotati (mantenendo quelli iniziali)
function resetAllBookings() {
    APP_DATA.films.forEach(film => {
        film.showtimes.forEach(showtime => {
            StorageManager.clearBookedSeats(film.id, showtime.time);
        });
    });
    location.reload();
}

// Funzione per vedere statistiche occupazione
function getOccupancyStats() {
    const stats = {};
    APP_DATA.films.forEach(film => {
        film.showtimes.forEach(showtime => {
            const key = `${film.title} - ${showtime.time}`;
            const totalOccupied = StorageManager.getOccupiedSeats(film.id, showtime.time).length;
            const onlyBooked = StorageManager.getBookedSeatsOnly(film.id, showtime.time).length;
            const initial = APP_DATA.initialOccupiedSeats[`${film.id}_${showtime.time}`]?.length || 0;
            
            stats[key] = {
                totaleOccupati: totalOccupied,
                prenotatiOnline: onlyBooked,
                occupatiIniziali: initial,
                postiLiberi: 150 - totalOccupied
            };
        });
    });
    return stats;
}

// Inizializza app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CineVerseApp();
});