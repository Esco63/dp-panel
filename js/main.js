// js/main.js

// --- GLOBALE DATENSTRUKTUREN ---
const allShiftData = {
    "2025-W23": [ { name: "Natalia", Mo: "10-17 Uhr*", Di: "10-17 Uhr", Mi: "Urlaub", Do: "Urlaub", Fr: "10-17 Uhr", Sa: "/", So: "/", privateNotes: { Mo: "Einarbeitung neuer Kollege" } }, { name: "Max M.", Mo: "08-15 Uhr", Di: "/", Mi: "08-15 Uhr", Do: "08-15 Uhr", Fr: "/", Sa: "10-14 Uhr", So: "/" }, { name: "Julia S.", Mo: "/", Di: "14:30-19", Mi: "14-20 Uhr", Do: "14-20 Uhr", Fr: "/", Sa: "10-18 Uhr", So: "10-18 Uhr" } ], "2025-W24": [ { name: "Natalia", Mo: "10-18 Uhr", Di: "10-18 Uhr", Mi: "Team-Meeting 9 Uhr", Do: "/", Fr: "10-16 Uhr", Sa: "/", So: "/" }, { name: "Max M.", Mo: "/", Di: "09-16 Uhr", Mi: "09-16 Uhr", Do: "09-16 Uhr", Fr: "/", Sa: "Urlaub", So: "Urlaub" }, { name: "Julia S.", Mo: "10-17 Uhr", Di: "/", Mi: "10-17 Uhr", Do: "10-17 Uhr", Fr: "10-17 Uhr", Sa: "/", So: "/" } ], "2025-W22": [ { name: "Natalia", Mo: "Urlaub", Di: "Urlaub", Mi: "Urlaub", Do: "Urlaub", Fr: "Urlaub", Sa: "/", So: "/" }, { name: "Max M.", Mo: "09-17 Uhr", Di: "09-17 Uhr", Mi: "/", Do: "/", Fr: "09-17 Uhr", Sa: "09-17 Uhr", So: "/" } ], "2025-W25": [ { name: "Natalia", Mo: "10-17 Uhr", Di: "10-17 Uhr", Mi: "10-14 Uhr", Do: "10-14 Uhr", Fr: "/", Sa: "/", So: "/" }, { name: "Max M.", Mo: "08-16 Uhr", Di: "08-16 Uhr", Mi: "/", Do: "/", Fr: "08-12 Uhr", Sa: "Urlaub", So: "Urlaub" } ], "2025-W26": [ { name: "Natalia", Mo: "/", Di: "/", Mi: "12-20 Uhr", Do: "12-20 Uhr", Fr: "12-20 Uhr*", Sa: "/", So: "/", privateNotes: { Fr: "Inventurvorbereitung" } }, { name: "Max M.", Mo: "Urlaub", Di: "Urlaub", Mi: "09-17 Uhr", Do: "09-17 Uhr", Fr: "09-17 Uhr", Sa: "/", So: "/" } ]
};
const importantInfosData = [
    "Bitte die Schokolade der Marke X um 30% reduzieren (Ablaufdatum naht).", "Team-Meeting am kommenden Freitag um 09:00 Uhr im Pausenraum. Thema: Quartalsziele.", "Neue Kaffeemaschine ist eingetroffen und betriebsbereit!", "Denkt an die fristgerechte Einreichung der Urlaubsanträge für das 3. Quartal."
];
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

    function loadImportantInfos() { /* ... (Code bleibt gleich) ... */ }
    function calculateShiftDuration(timeString) { /* ... (Code bleibt gleich) ... */ }
    function updateMonthlyHours(year, month, employeeName) { /* ... (Code bleibt gleich) ... */ }
    function calculateTakenVacationDays(employeeName, targetYear) { /* ... (Code bleibt gleich) ... */ }
    function displayVacationBalance() { /* ... (Code bleibt gleich) ... */ }
    function openNoteModal(title, text) { /* ... (Code bleibt gleich) ... */ }
    function closeNoteModal() { /* ... (Code bleibt gleich) ... */ }
    if (closeNoteModalBtn) { /* ... (Code bleibt gleich) ... */ }
    if (noteModal) { /* ... (Code bleibt gleich) ... */ }
    
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

    function renderShiftPlan(shiftsForCurrentWeek) { /* ... (Code bleibt gleich) ... */ }

    function displayWeek(date) { /* ... (Code bleibt gleich, ruft displayVacationBalance & updateMonthlyHours) ... */ }

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
    loadImportantInfos();
    displayWeek(currentDate); 

}); // Ende DOMContentLoaded