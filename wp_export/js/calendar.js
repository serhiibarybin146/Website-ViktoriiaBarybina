/**
 * Personal Numerological Calendar - Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return; // Only run on calendar page

    /* ——— DATA & CONFIG ——— */
    // Note: In a real WP scenario, this data might come from `wp_localize_script` object.
    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

    const calendarData = {
        3: { energy: "3 Энергия", type: "img" }, // 3rd of month example
        // ... (truncated sample)
    };

    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();

    renderCalendar(currentMonth, currentYear);

    function renderCalendar(month, year) {
        calendarGrid.innerHTML = '';

        // Header info update
        const monthDisplay = document.getElementById('currentMonthDisplay');
        if (monthDisplay) {
            monthDisplay.textContent = `${monthNames[month]} ${year}`;
        }

        // Days calculation
        const firstDay = new Date(year, month, 1).getDay(); // 0(Sun) - 6(Sat)
        // Convert to Mon=0, Sun=6
        // Sun(0) -> 6, Mon(1) -> 0...
        const startOffset = (firstDay === 0 ? 6 : firstDay - 1);

        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // 1. Empty entries for start offset
        for (let i = 0; i < startOffset; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyCell);
        }

        // 2. Days
        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-day';

            // Layout depends on data presence
            const dayData = calendarData[day];

            // Use split-cell layout structure if implementing energy + pill
            // Or simplified for now.
            // Using the structure from original calendar.js:

            // Grid Position check for split logic (bottom row)
            // Current index = startOffset + day - 1
            const gridIdx = startOffset + day - 1;
            const rowIndex = Math.floor(gridIdx / 7);

            // Default Inner HTML
            let inner = `<span class="day-number">${day}</span>`;

            // Add pill if mocked data exists
            if (dayData) {
                // ... logic for pills
            }

            // Structure:
            const dayNum = document.createElement('span');
            dayNum.className = 'day-number';
            dayNum.textContent = day;
            cell.appendChild(dayNum);

            // Pill mock
            const pill = document.createElement('div');
            pill.className = 'day-pill pill-green';
            pill.textContent = '10 • Поток';
            cell.appendChild(pill);

            calendarGrid.appendChild(cell);
        }

        // 3. Fill remaining cells to match grid (Total 35 or 42)
        // We enforce 5 rows = 35 cells usually in CSS, but logic should fill.
        const totalCells = startOffset + daysInMonth;
        const remaining = 35 - totalCells; // Fixed 5 rows as per CSS
        if (remaining > 0) {
            for (let i = 0; i < remaining; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'calendar-day empty';
                calendarGrid.appendChild(emptyCell);
            }
        }
    }
});
