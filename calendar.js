/**
 * Calendar Logic for Viktoriia Barybina
 * Updated to support manual data entry for specific dates.
 */

document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.getElementById('calendarGrid');
    const monthDisplay = document.getElementById('monthDisplay');
    const yearSelect = document.getElementById('yearSelect');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const dobInput = document.getElementById('dobInput');

    let currentDate = new Date(2026, 0, 1); // Set default to Jan 2026

    const months = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];

    /**
     * БАЗА ДАННЫХ КАЛЕНДАРЯ
     * Формат: "ГОД-МЕСЯЦ": { "ДЕНЬ": { text: "Текст", color: "green/blue/yellow" } }
     * Примечание: Январь = 0, Февраль = 1, ... Декабрь = 11
     */
    const calendarData = {
        "2026-0": { // Январь 2026
            "1": { text: "Удели внимание здоровью", color: "1" },
            "5": { text: "Прояви мудрую позицию", color: "2" },
            "8": { text: "Ставь себя на первое место", color: "3" },
            "13": { text: "Разговор по душам", color: "4" },
            "20": { text: "Будь не идеальной", color: "1" },
            "25": { text: "Не бойся нового", color: "2" },
            "30": { text: "Контролируй эмоции", color: "3" }
        },
        "2026-1": { // Февраль 2026
            "1": { text: "Доверяй ощущениям", color: "1" },
            "14": { text: "Прояви терпимость", color: "2" },
            "20": { text: "Ставь новые цели", color: "3" }
        }
        // Добавляйте новые месяцы сюда...
    };

    // Populate year select
    function populateYearSelect() {
        const years = [2024, 2025, 2026, 2027, 2028];
        const currentYearValue = 2026;
        years.forEach(y => {
            const option = document.createElement('option');
            option.value = y;
            option.textContent = y;
            if (y === currentYearValue) option.selected = true;
            yearSelect.appendChild(option);
        });
    }

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const dataKey = `${year}-${month}`;

        // Update display: Month only
        monthDisplay.textContent = months[month];
        yearSelect.value = year;

        // Clear grid (keep headers)
        const items = calendarGrid.querySelectorAll('.calendar-day:not(.calendar-header)');
        items.forEach(item => item.remove());

        // Get first day of month and total days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Adjust for Monday start (JS default is Sun=0)
        const startOffset = firstDay === 0 ? 6 : firstDay - 1;

        // Add empty cells for offset
        for (let i = 0; i < startOffset; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyCell);
        }

        // Add days
        for (let day = 1; day <= daysInMonth; day++) {
            const gridPosition = startOffset + day; // 1-indexed position in the grid

            if (gridPosition > 35) {
                // If we exceed 35 cells (5 rows * 7 days), we split the cell 1 week before
                const targetDay = day - 7;
                // Find already created cell for that day
                const existingCells = calendarGrid.querySelectorAll('.calendar-day:not(.calendar-header):not(.empty)');
                const prevCell = existingCells[targetDay - 1];

                if (prevCell) {
                    prevCell.classList.add('split-cell');

                    const splitDay = document.createElement('span');
                    splitDay.className = 'day-number-split';
                    splitDay.textContent = day;
                    prevCell.appendChild(splitDay);

                    // If the split day has data
                    if (calendarData[dataKey] && calendarData[dataKey][day]) {
                        const entry = calendarData[dataKey][day];
                        const pill = document.createElement('div');
                        pill.className = `day-pill pill-split pill-${entry.color}`;
                        pill.textContent = entry.text;
                        prevCell.appendChild(pill);
                    }
                }
                continue;
            }

            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';

            const dayNum = document.createElement('span');
            dayNum.className = 'day-number';
            dayNum.textContent = day;
            dayCell.appendChild(dayNum);

            // Проверяем, есть ли данные для этого конкретного дня
            if (calendarData[dataKey] && calendarData[dataKey][day]) {
                const entry = calendarData[dataKey][day];
                const pill = document.createElement('div');
                pill.className = `day-pill pill-${entry.color}`;
                pill.textContent = entry.text;
                dayCell.appendChild(pill);
            }

            calendarGrid.appendChild(dayCell);
        }

        // Fill remaining cells to ensure exactly 35 cells (5 rows)
        const totalCells = calendarGrid.querySelectorAll('.calendar-day:not(.calendar-header)').length;
        const requiredCells = 35;

        if (totalCells < requiredCells) {
            for (let i = 0; i < (requiredCells - totalCells); i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'calendar-day empty';
                calendarGrid.appendChild(emptyCell);
            }
        }
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    yearSelect.addEventListener('change', (e) => {
        currentDate.setFullYear(parseInt(e.target.value));
        renderCalendar();
    });

    dobInput.addEventListener('input', () => {
        renderCalendar();
    });

    populateYearSelect();
    renderCalendar();
});
