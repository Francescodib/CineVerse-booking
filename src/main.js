    const films = [
        { id: 1, title: 'Film A', duration: '120 min', description: 'Descrizione del Film A' },
        { id: 2, title: 'Film B', duration: '90 min', description: 'Descrizione del Film B' },
        { id: 3, title: 'Film C', duration: '150 min', description: 'Descrizione del Film C' },
        { id: 4, title: 'Film D', duration: '110 min', description: 'Descrizione del Film D' },
        { id: 5, title: 'Film E', duration: '100 min', description: 'Descrizione del Film E' },
    ];
    
    
    const rows = 10;
    const cols = 15;
    const container = document.getElementById('seats');
    const numberOfTickets = document.getElementById('numberOfTickets');
    

    // Simuliamo alcuni posti già occupati
    const occupiedSeats = [2, 5, 12, 19, 27];

    for (let i = 0; i < rows * cols; i++) {
      const btn = document.createElement('button');
        btn.classList.add('seat');
        btn.innerHTML = '<i class="bi bi-person-fill"></i>'; // Mostra il numero del posto
        btn.dataset.index = i+1;

      if (occupiedSeats.includes(i)) {
        btn.classList.add('occupied');
        btn.disabled = true;
       
      } else {
        btn.classList.add('free');
      }

      container.appendChild(btn);
    }

    container.addEventListener('click', (event) => {
      // closest uses the nearrest parent including the icon if clicked
        const button = event.target.closest('button');
        // if the button isn't found, return
        if (!button || !container.contains(button)) return;
        
        if (button.classList.contains('free')) {
            button.classList.toggle('selected');
            updateTicketCount();
        }
    });

    function updateTicketCount() {
      const selectedSeats = document.querySelectorAll('.seat.selected');
      numberOfTickets.value = selectedSeats.length;

      const selectedIndexes = Array.from(selectedSeats).map(seat => seat.dataset.index);

      //populate list of selected seats
      const selectedSeatsList = document.getElementById('selectedList');
          selectedSeatsList.textContent = selectedIndexes.length > 0
            ? 'Posti selezionati: ' + selectedIndexes.join(', ')
            : 'Posti selezionati: nessuno';

        //populate hidden form
        const selectedSeatsInput = document.getElementById('selectedSeatsInput');
        selectedSeatsInput.value = selectedIndexes.join(',');
    }

