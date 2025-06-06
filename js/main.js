// js/main.js

// --- GLOBALE DATENSTRUKTUREN ---
const allShiftData = {
    "2025-W23": [ { name: "Natalia", Mo: "10-17 Uhr*", Di: "10-17 Uhr", Mi: "Urlaub", Do: "Urlaub", Fr: "10-17 Uhr", Sa: "/", So: "/", privateNotes: { Mo: "Einarbeitung neuer Kollege" } }, { name: "Max M.", Mo: "08-15 Uhr", Di: "/", Mi: "08-15 Uhr", Do: "08-15 Uhr", Fr: "/", Sa: "10-14 Uhr", So: "/" }, { name: "Julia S.", Mo: "/", Di: "14:30-19", Mi: "14-20 Uhr", Do: "14-20 Uhr", Fr: "/", Sa: "10-18 Uhr", So: "10-18 Uhr" } ],
    "2025-W24": [ { name: "Natalia", Mo: "10-18 Uhr", Di: "10-18 Uhr", Mi: "Team-Meeting 9 Uhr", Do: "/", Fr: "10-16 Uhr", Sa: "/", So: "/" }, { name: "Max M.", Mo: "/", Di: "09-16 Uhr", Mi: "09-16 Uhr", Do: "09-16 Uhr", Fr: "/", Sa: "Urlaub", So: "Urlaub" }, { name: "Julia S.", Mo: "10-17 Uhr", Di: "/", Mi: "10-17 Uhr", Do: "10-17 Uhr", Fr: "10-17 Uhr", Sa: "/", So: "/" } ],
    "2025-W22": [ { name: "Natalia", Mo: "Urlaub", Di: "Urlaub", Mi: "Urlaub", Do: "Urlaub", Fr: "Urlaub", Sa: "/", So: "/" }, { name: "Max M.", Mo: "09-17 Uhr", Di: "09-17 Uhr", Mi: "/", Do: "/", Fr: "09-17 Uhr", Sa: "09-17 Uhr", So: "/" } ],
    "2025-W25": [ { name: "Natalia", Mo: "10-17 Uhr", Di: "10-17 Uhr", Mi: "10-14 Uhr", Do: "10-14 Uhr", Fr: "/", Sa: "/", So: "/" }, { name: "Max M.", Mo: "08-16 Uhr", Di: "08-16 Uhr", Mi: "/", Do: "/", Fr: "08-12 Uhr", Sa: "Urlaub", So: "Urlaub" } ],
    "2025-W26": [ { name: "Natalia", Mo: "/", Di: "/", Mi: "12-20 Uhr", Do: "12-20 Uhr", Fr: "12-20 Uhr*", Sa: "/", So: "/", privateNotes: { Fr: "Inventurvorbereitung" } }, { name: "Max M.", Mo: "Urlaub", Di: "Urlaub", Mi: "09-17 Uhr", Do: "09-17 Uhr", Fr: "09-17 Uhr", Sa: "/", So: "/" } ]
};
// const importantInfosData = [ ... ]; // WIRD GELÖSCHT!
const loggedInEmployee = { id: 1, name: "Natalia Rostova", vacationDaysAnnual: 28 };

let vacationRequestsData = [];
try {
    const storedRequests = localStorage.getItem('vacationRequests');
    if (storedRequests) {
        vacationRequestsData = JSON.parse(storedRequests);
    }
} catch (e) {
    console.error("Fehler beim Laden der Urlaubsanträge aus localStorage (main.js):", e);
    vacationRequestsData = [];
}
let nextVacationRequestId = 1;
if (vacationRequestsData.length > 0) {
    nextVacationRequestId = Math.max(...vacationRequestsData.map(req => req.id), 0) + 1;
}

// --- GLOBALE HILFSFUNKTIONEN ---
function getDateOfISOWeek(w, y) {
    const d = new Date(y, 0, 4); const dayOfWeekJan4th = d.getDay() === 0 ? 7 : d.getDay();
    const jan4th = new Date(y, 0, 4);
    const mondayOfFirstWeek = new Date(jan4th.setDate(jan4th.getDate() - dayOfWeekJan4th + 1));
    const targetDate = new Date(mondayOfFirstWeek); targetDate.setDate(mondayOfFirstWeek.getDate() + (w - 1) * 7); return targetDate;
}
function getISOWeek(date) {
    const tempDate = new Date(date.valueOf()); const dayNum = (date.getDay() + 6) % 7;
    tempDate.setDate(tempDate.getDate() - dayNum + 3); const firstThursday = tempDate.valueOf();
    tempDate.setMonth(0, 1); if (tempDate.getDay() !== 4) { tempDate.setMonth(0, 1 + ((4 - tempDate.getDay()) + 7) % 7); }
    return 1 + Math.ceil((firstThursday - tempDate) / 604800000);
}
function formatNumber(num) { return num < 10 ? '0' + num : num; }
function formatDateForDisplay(dateString) {
    if (!dateString) return ''; const dateObj = new Date(dateString);
    return `${formatNumber(dateObj.getDate())}.${formatNumber(dateObj.getMonth() + 1)}.${dateObj.getFullYear()}`;
}

// --- HAUPTCODE NACH LADEN DES DOMS ---
document.addEventListener('DOMContentLoaded', function() {
    // --- DOM-ELEMENTE ---
    const currentWeekDisplay = document.getElementById('currentWeekDisplay');
    const prevWeekBtn = document.getElementById('prevWeekBtn');
    const nextWeekBtn = document.getElementById('nextWeekBtn');
    const dienstplanBody = document.getElementById('dienstplan-body');
    const yearInput = document.getElementById('yearInput');
    const weekInput = document.getElementById('weekInput');
    const goToWeekBtn = document.getElementById('goToWeekBtn');
    const dayHeaders = [
        document.getElementById('header-mo'), document.getElementById('header-di'),
        document.getElementById('header-mi'), document.getElementById('header-do'),
        document.getElementById('header-fr'), document.getElementById('header-sa'),
        document.getElementById('header-so')
    ];
    const dayNamesShort = ["Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa.", "So."];
    const dayKeys = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

    const noteModal = document.getElementById('noteModal');
    const noteModalTitle = document.getElementById('noteModalTitle');
    const noteModalText = document.getElementById('noteModalText');
    const closeNoteModalBtn = document.getElementById('closeNoteModalBtn');

    const employeeNameForHoursDisplay = document.getElementById('employeeNameForHours');
    const currentMonthForHoursDisplay = document.getElementById('currentMonthForHours');
    const totalMonthlyHoursDisplay = document.getElementById('totalMonthlyHours');
    const infoContentDiv = document.querySelector('.info-header .info-content');

    const vacationEmployeeNameDisplay = document.getElementById('vacationEmployeeName');
    const vacationCurrentYearDisplay = document.getElementById('vacationCurrentYear');
    const vacationTotalDisplay = document.getElementById('vacationTotal');
    const vacationTakenDisplay = document.getElementById('vacationTaken');
    const vacationRemainingDisplay = document.getElementById('vacationRemaining');
    const openVacationRequestModalBtn = document.getElementById('openVacationRequestModalBtn');
    const vacationRequestModal = document.getElementById('vacationRequestModal');
    const closeVacationRequestModalBtn = document.getElementById('closeVacationRequestModalBtn');
    const cancelVacationRequestBtn = document.getElementById('cancelVacationRequestBtn');
    const vacationRequestForm = document.getElementById('vacationRequestForm');
    const vacationStartDateInput = document.getElementById('vacationStartDate');
    const vacationEndDateInput = document.getElementById('vacationEndDate');
    const vacationReasonInput = document.getElementById('vacationReason');

    // DOM-Elemente für das generische Modal
    const generalModal = document.getElementById('generalModal');
    const generalModalTitle = document.getElementById('generalModalTitle');
    const generalModalMessage = document.getElementById('generalModalMessage');
    const generalModalActions = document.getElementById('generalModalActions');
    const closeGeneralModalBtn = document.getElementById('closeGeneralModalBtn');
    let generalConfirmCallback = null;
    let generalCancelCallback = null;

    let currentDate = new Date();

    // --- FUNKTIONEN ---
    function showGeneralModal(title, message, type = 'info', onConfirm = null, onCancel = null) {
        if (!generalModal || !generalModalTitle || !generalModalMessage || !generalModalActions) {
            console.error("Generisches Modal oder dessen Elemente nicht gefunden!");
            alert(`${title}\n\n${message}`); // Fallback
            if (type === 'confirm' && onConfirm && window.confirm("Fortfahren? (Fallback Confirm)")) onConfirm(); else if (type === 'confirm' && onCancel) onCancel();
            return;
        }
        generalModalTitle.textContent = title;
        generalModalMessage.textContent = message;
        generalModalActions.innerHTML = '';
        const modalContent = generalModal.querySelector('.modal-content');
        if(modalContent) {
            modalContent.classList.remove('modal-info', 'modal-success', 'modal-error', 'modal-confirm');
            modalContent.classList.add(`modal-${type}`);
        }
        generalConfirmCallback = onConfirm; generalCancelCallback = onCancel;
        if (type === 'confirm') {
            const confirmBtn = document.createElement('button'); confirmBtn.textContent = 'Ja';
            confirmBtn.classList.add('btn-primary');
            confirmBtn.addEventListener('click', () => { if (generalConfirmCallback) generalConfirmCallback(); generalConfirmCallback = null; generalCancelCallback = null; closeGeneralModal(); });
            generalModalActions.appendChild(confirmBtn);
            const cancelBtn = document.createElement('button'); cancelBtn.textContent = 'Nein';
            cancelBtn.classList.add('btn-secondary');
            cancelBtn.addEventListener('click', () => { if (generalCancelCallback) generalCancelCallback(); generalConfirmCallback = null; generalCancelCallback = null; closeGeneralModal(); });
            generalModalActions.appendChild(cancelBtn);
        } else {
            const okBtn = document.createElement('button'); okBtn.textContent = 'OK';
            okBtn.classList.add('btn-primary');
            okBtn.addEventListener('click', () => { generalConfirmCallback = null; generalCancelCallback = null; closeGeneralModal(); });
            generalModalActions.appendChild(okBtn);
        }
        if(generalModal) generalModal.classList.add('show');
    }
    function closeGeneralModal() {
        if (generalModal) {
            const modalContent = generalModal.querySelector('.modal-content');
            if(modalContent) modalContent.classList.remove('modal-info', 'modal-success', 'modal-error', 'modal-confirm');
            generalModal.classList.remove('show');
        }
        // Nicht automatisch onCancel hier aufrufen, das passiert bei den Button-Klicks oder X/Overlay
        generalConfirmCallback = null; generalCancelCallback = null;
    }
    if (closeGeneralModalBtn) {
        closeGeneralModalBtn.addEventListener('click', () => { if (generalCancelCallback) generalCancelCallback(); closeGeneralModal(); });
    }
    if (generalModal) {
        generalModal.addEventListener('click', function(event) { if (event.target === generalModal) { if (generalCancelCallback) generalCancelCallback(); closeGeneralModal(); } });
    }

    // ANGEPASSTE Funktion zum Laden der "Wichtigen Infos" via API
    async function loadImportantInfos() {
        if (!infoContentDiv) return;
        infoContentDiv.innerHTML = '<p style="color: #6c757d;">Lade Infos...</p>'; // Ladezustand anzeigen

        try {
            const response = await fetch('/api/get-infos');
            if (!response.ok) {
                // Wenn die Antwort vom Server nicht OK ist (z.B. Status 500)
                throw new Error(`HTTP-Fehler! Status: ${response.status}`);
            }

            const infos = await response.json(); // Wandelt die Antwort in ein JavaScript-Array um

            infoContentDiv.innerHTML = ''; // Ladezustand entfernen

            if (infos && infos.length > 0) {
                const ul = document.createElement('ul');
                ul.style.listStyleType = 'disc';
                ul.style.paddingLeft = '20px';

                infos.forEach(info => { // Iteriert über die Daten aus der Datenbank
                    const li = document.createElement('li');
                    li.textContent = info.info_text; // Greift auf die Spalte 'info_text' zu
                    li.style.marginBottom = '8px';
                    ul.appendChild(li);
                });
                infoContentDiv.appendChild(ul);
            } else {
                infoContentDiv.innerHTML = '<p>Aktuell keine wichtigen Informationen vorhanden.</p>';
            }
        } catch (error) {
            console.error("Fehler beim Abrufen der wichtigen Infos:", error);
            infoContentDiv.innerHTML = '<p style="color: #dc3545;">Fehler beim Laden der Informationen.</p>';
        }
    }

    function calculateShiftDuration(timeString) {
        if (!timeString || typeof timeString !== 'string') return 0;
        const cleanedTime = timeString.replace(/Uhr/gi, '').replace('*', '').trim();
        const parts = cleanedTime.split('-');
        if (parts.length !== 2) return 0;

        const parseTime = (timePart) => {
            let [hours, minutes] = timePart.split(':');
            hours = parseInt(hours, 10);
            minutes = minutes ? parseInt(minutes, 10) : 0;
            if (isNaN(hours) || isNaN(minutes)) return null;
            return hours + minutes / 60;
        };

        const start = parseTime(parts[0]);
        const end = parseTime(parts[1]);

        if (start === null || end === null) return 0;
        const duration = end - start;
        return duration > 0 ? duration : 0;
    }

    function updateMonthlyHours(year, month, employeeName) {
        if (!employeeNameForHoursDisplay || !currentMonthForHoursDisplay || !totalMonthlyHoursDisplay) return;

        const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
        employeeNameForHoursDisplay.textContent = employeeName;
        currentMonthForHoursDisplay.textContent = `${monthNames[month]} ${year}`;

        let totalHours = 0;
        for (const weekKey in allShiftData) {
            const weekYear = parseInt(weekKey.split('-W')[0]);
            const weekNumber = parseInt(weekKey.split('-W')[1]);

            // Finde den Montag der jeweiligen Woche um den Monat zu bestimmen
            const firstDayOfWeek = getDateOfISOWeek(weekNumber, weekYear);
            
            if (weekYear === year && firstDayOfWeek.getMonth() === month) {
                const weekData = allShiftData[weekKey];
                const employeeWeekData = weekData.find(e => e.name === employeeName);
                if (employeeWeekData) {
                    dayKeys.forEach(day => {
                        totalHours += calculateShiftDuration(employeeWeekData[day]);
                    });
                }
            }
        }
        totalMonthlyHoursDisplay.textContent = totalHours.toFixed(2);
    }
    
    function calculateTakenVacationDays(employeeName, targetYear) {
        let takenDays = 0;
        vacationRequestsData.forEach(req => {
            const requestYear = new Date(req.startDate).getFullYear();
            if (req.employeeName === employeeName && req.status === 'genehmigt' && requestYear === targetYear) {
                takenDays += req.requestedDays;
            }
        });
        return takenDays;
    }
    
    function displayVacationBalance() {
        if (!vacationEmployeeNameDisplay || !vacationCurrentYearDisplay || !vacationTotalDisplay || !vacationTakenDisplay || !vacationRemainingDisplay) return;
        
        const currentYear = new Date().getFullYear();
        const takenDays = calculateTakenVacationDays(loggedInEmployee.name, currentYear);
        const remainingDays = loggedInEmployee.vacationDaysAnnual - takenDays;

        vacationEmployeeNameDisplay.textContent = loggedInEmployee.name;
        vacationCurrentYearDisplay.textContent = currentYear;
        vacationTotalDisplay.textContent = loggedInEmployee.vacationDaysAnnual;
        vacationTakenDisplay.textContent = takenDays;
        vacationRemainingDisplay.textContent = remainingDays;
    }

    function openNoteModal(title, text) {
        if(noteModalTitle) noteModalTitle.textContent = title;
        if(noteModalText) noteModalText.textContent = text;
        if(noteModal) noteModal.classList.add('show');
    }

    function closeNoteModal() { if(noteModal) noteModal.classList.remove('show'); }
    if (closeNoteModalBtn) { closeNoteModalBtn.addEventListener('click', closeNoteModal); }
    if (noteModal) { noteModal.addEventListener('click', (event) => { if (event.target === noteModal) { closeNoteModal(); } }); }
    
    function openVacationRequestModal() {
        if (!vacationRequestModal || !vacationRequestForm || !vacationStartDateInput || !vacationEndDateInput) return;
        vacationRequestForm.reset();
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        vacationStartDateInput.min = todayString;
        vacationEndDateInput.min = todayString;
        if (vacationRequestModal) vacationRequestModal.classList.add('show');
    }
    function closeVacationRequestModal() { if (vacationRequestModal) vacationRequestModal.classList.remove('show'); }

    if (openVacationRequestModalBtn) { openVacationRequestModalBtn.addEventListener('click', openVacationRequestModal); }
    const actualCloseVacationRequestModalBtn = document.getElementById('closeVacationRequestModalBtn');
    if (actualCloseVacationRequestModalBtn) { actualCloseVacationRequestModalBtn.addEventListener('click', closeVacationRequestModal); }
    if (cancelVacationRequestBtn) { cancelVacationRequestBtn.addEventListener('click', closeVacationRequestModal); }
    if (vacationRequestModal) { vacationRequestModal.addEventListener('click', function(event) { if (event.target === vacationRequestModal) { closeVacationRequestModal(); } }); }

    function renderShiftPlan(shiftsForCurrentWeek) {
        if (!dienstplanBody) return;
        dienstplanBody.innerHTML = '';

        if (!shiftsForCurrentWeek || shiftsForCurrentWeek.length === 0) {
            const row = dienstplanBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 8;
            cell.textContent = "Für diese Woche ist kein Dienstplan verfügbar.";
            cell.style.textAlign = "center";
            cell.style.padding = "20px";
            return;
        }

        shiftsForCurrentWeek.forEach(employee => {
            const row = dienstplanBody.insertRow();
            row.insertCell().textContent = employee.name;
            dayKeys.forEach(dayKey => {
                const cell = row.insertCell();
                const shiftText = employee[dayKey] || '/';
                cell.textContent = shiftText;
                cell.style.textAlign = 'center';
                if (shiftText.toLowerCase() === 'urlaub') {
                    cell.classList.add('shift-urlaub');
                } else if (shiftText !== '/' && shiftText.includes('*')) {
                    cell.classList.add('has-note');
                    cell.addEventListener('click', () => {
                        const note = employee.privateNotes ? employee.privateNotes[dayKey] : "Keine Notiz vorhanden.";
                        openNoteModal(`Notiz für ${employee.name} am ${dayKey}`, note);
                    });
                }
            });
        });
    }

    function displayWeek(date) {
        const year = date.getFullYear();
        const week = getISOWeek(date);
        const month = date.getMonth();

        if(currentWeekDisplay) currentWeekDisplay.textContent = `Kalenderwoche ${week} / ${year}`;
        if(yearInput) yearInput.value = year;
        if(weekInput) weekInput.value = week;

        const monday = new Date(date);
        monday.setDate(date.getDate() - (date.getDay() + 6) % 7);

        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(monday);
            currentDay.setDate(monday.getDate() + i);
            if(dayHeaders[i]) dayHeaders[i].innerHTML = `${dayNamesShort[i]} <small>(${formatNumber(currentDay.getDate())}.${formatNumber(currentDay.getMonth() + 1)}.)</small>`;
        }
        
        const weekKey = `${year}-W${week}`;
        const shiftsForWeek = allShiftData[weekKey];
        renderShiftPlan(shiftsForWeek);
        updateMonthlyHours(year, month, loggedInEmployee.name);
        displayVacationBalance();
    }

    if(prevWeekBtn) { prevWeekBtn.addEventListener('click', function() { currentDate.setDate(currentDate.getDate() - 7); displayWeek(currentDate); }); }
    if(nextWeekBtn) { nextWeekBtn.addEventListener('click', function() { currentDate.setDate(currentDate.getDate() + 7); displayWeek(currentDate); }); }
    if(goToWeekBtn) {
        goToWeekBtn.addEventListener('click', function() {
            const yearVal = parseInt(yearInput.value);
            const weekVal = parseInt(weekInput.value);
            if (!isNaN(yearVal) && !isNaN(weekVal) && weekVal >= 1 && weekVal <= 53 && yearVal >=1900 && yearVal <= 2100) {
                currentDate = getDateOfISOWeek(weekVal, yearVal);
                displayWeek(currentDate);
            } else {
                showGeneralModal("Ungültige Eingabe", "Bitte geben Sie ein gültiges Jahr (1900-2100) und eine gültige Kalenderwoche (1-53) ein.", "error");
            }
        });
    }
    
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
            if (generalModal && generalModal.classList.contains('show')) { // generalModal zuerst prüfen
                if (generalCancelCallback) generalCancelCallback();
                closeGeneralModal();
            } else if (noteModal && noteModal.classList.contains('show')) {
                closeNoteModal();
            } else if (vacationRequestModal && vacationRequestModal.classList.contains('show')) {
                closeVacationRequestModal();
            }
        }
    });

    function submitVacationRequest(requestDetails) { // Hilfsfunktion zum Einreichen
        const newRequest = {
            id: nextVacationRequestId++, employeeId: loggedInEmployee.id,
            employeeName: loggedInEmployee.name, startDate: requestDetails.startDate, endDate: requestDetails.endDate,
            reason: requestDetails.reason, requestedDays: requestDetails.requestedDays, status: "beantragt"
        };
        vacationRequestsData.push(newRequest);
        try {
            localStorage.setItem('vacationRequests', JSON.stringify(vacationRequestsData));
            console.log("Urlaubsanträge im localStorage gespeichert (main.js).");
        } catch (e) {
            console.error("Fehler beim Speichern im localStorage (main.js):", e);
            showGeneralModal("Speicherfehler", "Der Urlaubsantrag konnte nicht lokal gespeichert werden.", "error");
        }
        console.log("Neuer Urlaubsantrag:", newRequest);
        showGeneralModal(
            "Antrag eingereicht",
            `Ihr Urlaubsantrag für den Zeitraum ${formatDateForDisplay(newRequest.startDate)} bis ${formatDateForDisplay(newRequest.endDate)} (${newRequest.requestedDays} Tage) wurde eingereicht und wird nun geprüft.`,
            "success"
        );
        closeVacationRequestModal();
    }

    if (vacationRequestForm) {
        vacationRequestForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const startDate = vacationStartDateInput.value;
            const endDate = vacationEndDateInput.value;
            const reason = vacationReasonInput.value.trim();

            if (!startDate || !endDate) {
                showGeneralModal("Fehlende Eingabe", "Bitte geben Sie ein Start- und Enddatum für Ihren Urlaub an.", "error"); return;
            }
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const startDateObj = new Date(startDate); const endDateObj = new Date(endDate);
            if (startDateObj < today) {
                showGeneralModal("Ungültiges Datum", "Das Startdatum darf nicht in der Vergangenheit liegen.", "error"); return;
            }
            if (endDateObj < startDateObj) {
                showGeneralModal("Ungültiges Datum", "Das Enddatum darf nicht vor dem Startdatum liegen.", "error"); return;
            }
            const timeDiff = endDateObj.getTime() - startDateObj.getTime();
            const requestedDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
            const vacationStartYear = startDateObj.getFullYear();
            const takenDaysCurrentYear = calculateTakenVacationDays(loggedInEmployee.name, vacationStartYear);
            const remainingDaysCurrentYear = loggedInEmployee.vacationDaysAnnual - takenDaysCurrentYear;
            const requestDetailsForSubmission = {startDate, endDate, reason, requestedDays};

            if (requestedDays > remainingDaysCurrentYear) {
                showGeneralModal(
                    "Urlaubsanspruch prüfen",
                    `Sie beantragen ${requestedDays} Tage für ${vacationStartYear}, haben aber nur noch ${remainingDaysCurrentYear} Tage Resturlaub für dieses Jahr.\nMöchten Sie den Antrag trotzdem stellen?`,
                    "confirm",
                    () => { submitVacationRequest(requestDetailsForSubmission); },
                    () => { console.log("Urlaubsantrag wegen Überschreitung nicht gestellt."); }
                );
            } else {
                submitVacationRequest(requestDetailsForSubmission);
            }
        });
    }

    // Initiale Aufrufe
    loadImportantInfos(); // Ruft jetzt die neue asynchrone Funktion auf
    displayWeek(currentDate);

}); // Ende DOMContentLoaded