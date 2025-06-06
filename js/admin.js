// js/admin.js

// --- GLOBALE DATEN (Client-seitig für das Admin Panel) ---
let adminImportantInfos = [
    "Bitte die Schokolade der Marke X um 30% reduzieren (Ablaufdatum naht).",
    "Team-Meeting am kommenden Freitag um 09:00 Uhr im Pausenraum. Thema: Quartalsziele.",
    "Neue Kaffeemaschine ist eingetroffen und betriebsbereit!",
    "Denkt an die fristgerechte Einreichung der Urlaubsanträge für das 3. Quartal."
];
let adminEmployeesData = [
    // DATENSTRUKTUR ERWEITERT: vacationDaysTaken, initialisiert mit 0
    { id: 1, name: "Natalia Rostova", email: "natalia@example.com", role: "Mitarbeiterin", vacationDaysAnnual: 28, vacationDaysTaken: 5 }, // Bsp: 5 Tage schon genommen
    { id: 2, name: "Max Mustermann", email: "max@example.com", role: "Mitarbeiter", vacationDaysAnnual: 25, vacationDaysTaken: 0 },
    { id: 3, name: "Julia Schmidt", email: "julia@example.com", role: "Admin", vacationDaysAnnual: 30, vacationDaysTaken: 10 } // Bsp: 10 Tage schon genommen
];
let nextEmployeeId = 4; 
const allShiftData = { 
    "2025-W23": [ { name: "Natalia", Mo: "10-17 Uhr*", Di: "10-17 Uhr", Mi: "Urlaub", Do: "Urlaub", Fr: "10-17 Uhr", Sa: "/", So: "/", privateNotes: { Mo: "Einarbeitung neuer Kollege" } }, { name: "Max M.", Mo: "08-15 Uhr", Di: "/", Mi: "08-15 Uhr", Do: "08-15 Uhr", Fr: "/", Sa: "10-14 Uhr", So: "/" }, { name: "Julia S.", Mo: "/", Di: "14:30-19 Uhr", Mi: "14-20 Uhr", Do: "14-20 Uhr", Fr: "/", Sa: "10-18 Uhr", So: "10-18 Uhr" } ], "2025-W24": [ { name: "Natalia", Mo: "10-18 Uhr", Di: "10-18 Uhr", Mi: "Team-Meeting 9 Uhr", Do: "/", Fr: "10-16 Uhr", Sa: "/", So: "/" }, { name: "Max M.", Mo: "/", Di: "09-16 Uhr", Mi: "09-16 Uhr", Do: "09-16 Uhr", Fr: "/", Sa: "Urlaub", So: "Urlaub" }, { name: "Julia S.", Mo: "10-17 Uhr", Di: "/", Mi: "10-17 Uhr", Do: "10-17 Uhr", Fr: "10-17 Uhr", Sa: "/", So: "/" } ], "2025-W22": [ { name: "Natalia", Mo: "Urlaub", Di: "Urlaub", Mi: "Urlaub", Do: "Urlaub", Fr: "Urlaub", Sa: "/", So: "/" }, { name: "Max M.", Mo: "09-17 Uhr", Di: "09-17 Uhr", Mi: "/", Do: "/", Fr: "09-17 Uhr", Sa: "09-17 Uhr", So: "/" } ], "2025-W25": [ { name: "Natalia", Mo: "10-17 Uhr", Di: "10-17 Uhr", Mi: "10-14 Uhr", Do: "10-14 Uhr", Fr: "/", Sa: "/", So: "/" }, { name: "Max M.", Mo: "08-16 Uhr", Di: "08-16 Uhr", Mi: "/", Do: "/", Fr: "08-12 Uhr", Sa: "Urlaub", So: "Urlaub" } ], "2025-W26": [ { name: "Natalia", Mo: "/", Di: "/", Mi: "12-20 Uhr", Do: "12-20 Uhr", Fr: "12-20 Uhr*", Sa: "/", So: "/", privateNotes: { Fr: "Inventurvorbereitung" } }, { name: "Max M.", Mo: "Urlaub", Di: "Urlaub", Mi: "09-17 Uhr", Do: "09-17 Uhr", Fr: "09-17 Uhr", Sa: "/", So: "/" } ]
};
// Daten für Urlaubsanträge
let adminVacationRequestsData = [
    { id: 1, employeeId: 1, employeeName: "Natalia Rostova", startDate: "2025-07-21", endDate: "2025-07-25", reason: "Sommerurlaub", requestedDays: 5, status: "beantragt" },
    { id: 2, employeeId: 2, employeeName: "Max Mustermann", startDate: "2025-08-04", endDate: "2025-08-08", reason: "Familienbesuch", requestedDays: 5, status: "beantragt" },
    { id: 3, employeeId: 1, employeeName: "Natalia Rostova", startDate: "2025-06-02", endDate: "2025-06-03", reason: "Kurztrip", requestedDays: 2, status: "genehmigt" }
];
let nextAdminVacationRequestId = 4; 


// --- HILFSFUNKTIONEN (Global für admin.js) ---
function getDateOfISOWeek(w, y) {
    const d = new Date(y, 0, 4); 
    const dayOfWeekJan4th = d.getDay() === 0 ? 7 : d.getDay(); 
    const jan4th = new Date(y, 0, 4);
    const mondayOfFirstWeek = new Date(jan4th.setDate(jan4th.getDate() - dayOfWeekJan4th + 1));
    const targetDate = new Date(mondayOfFirstWeek);
    targetDate.setDate(mondayOfFirstWeek.getDate() + (w - 1) * 7);
    return targetDate;
}

// --- HAUPTCODE NACH LADEN DES DOMS ---
document.addEventListener('DOMContentLoaded', function() {
    // --- DOM-ELEMENTE ---
    const sidebarNavLinks = document.querySelectorAll('.sidebar-nav a[data-section]');
    const adminSections = document.querySelectorAll('.admin-section');
    const adminMainHeader = document.querySelector('.admin-main-content .admin-header h1');
    const addInfoForm = document.getElementById('addInfoForm');
    const newInfoTextInput = document.getElementById('newInfoText');
    const importantInfosListUL = document.getElementById('importantInfosListUL');
    const openAddEmployeeModalBtn = document.getElementById('openAddEmployeeModalBtn');
    const employeesTableBody = document.getElementById('employeesTableBody');
    const employeeModal = document.getElementById('employeeModal');
    const employeeModalTitle = document.getElementById('employeeModalTitle');
    const closeEmployeeModalBtn = document.getElementById('closeEmployeeModalBtn');
    const cancelEmployeeBtn = document.getElementById('cancelEmployeeBtn');
    const employeeForm = document.getElementById('employeeForm');
    const employeeIdInput = document.getElementById('employeeId');
    const employeeNameInput = document.getElementById('employeeName');
    const employeeEmailInput = document.getElementById('employeeEmail');
    const employeeRoleInput = document.getElementById('employeeRole');
    const employeeVacationDaysInput = document.getElementById('employeeVacationDays');
    const statEmployeeCountEl = document.getElementById('statEmployeeCount');
    const statInfoCountEl = document.getElementById('statInfoCount');
    const statPlannedWeeksCountEl = document.getElementById('statPlannedWeeksCount');
    const adminPrevWeekBtn = document.getElementById('adminPrevWeekBtn');
    const adminNextWeekBtn = document.getElementById('adminNextWeekBtn');
    const adminCurrentWeekDisplay = document.getElementById('adminCurrentWeekDisplay');
    const adminYearInput = document.getElementById('adminYearInput');
    const adminWeekInput = document.getElementById('adminWeekInput');
    const adminGoToWeekBtn = document.getElementById('adminGoToWeekBtn');
    const adminShiftsTableBody = document.getElementById('adminShiftsTableBody');
    const adminDayHeaders = [
        document.getElementById('adminHeaderMo'), document.getElementById('adminHeaderDi'),
        document.getElementById('adminHeaderMi'), document.getElementById('adminHeaderDo'),
        document.getElementById('adminHeaderFr'), document.getElementById('adminHeaderSa'),
        document.getElementById('adminHeaderSo')
    ];
    const adminDayNameKeys = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    const adminDayNamesShortDisplay = ["Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa.", "So."];
    let currentAdminShiftDate = new Date();
    const shiftEditModal = document.getElementById('shiftEditModal');
    const shiftEditModalTitle = document.getElementById('shiftEditModalTitle');
    const closeShiftEditModalBtn = document.getElementById('closeShiftEditModalBtn'); // ID ist doppelt, sollte für shiftEditModal spezifisch sein
    const cancelShiftEditBtn = document.getElementById('cancelShiftEditBtn'); // ID ist doppelt
    const shiftEditForm = document.getElementById('shiftEditForm');
    const shiftEditEmployeeNameHidden = document.getElementById('shiftEditEmployeeNameHidden');
    const shiftEditDayKeyHidden = document.getElementById('shiftEditDayKeyHidden');
    const shiftEditYearHidden = document.getElementById('shiftEditYearHidden');
    const shiftEditIsoWeekHidden = document.getElementById('shiftEditIsoWeekHidden');
    const shiftEditEmployeeNameDisplay = document.getElementById('shiftEditEmployeeNameDisplay');
    const shiftEditDayDisplay = document.getElementById('shiftEditDayDisplay');
    const shiftEditTextInput = document.getElementById('shiftEditTextInput');
    const shiftEditPrivateNoteInput = document.getElementById('shiftEditPrivateNoteInput');
    const shiftTextSuggestionsDatalist = document.getElementById('shiftTextSuggestions');
    const vacationRequestsTableBody = document.getElementById('vacationRequestsTableBody');

    // --- LOKALE HILFSFUNKTIONEN für DOMContentLoaded ---
    function formatAdminNumber(num) { return num < 10 ? '0' + num : num; }
    function getAdminISOWeek(date) { 
        const tempDate = new Date(date.valueOf()); const dayNum = (date.getDay() + 6) % 7;
        tempDate.setDate(tempDate.getDate() - dayNum + 3); const firstThursday = tempDate.valueOf();
        tempDate.setMonth(0, 1); if (tempDate.getDay() !== 4) { tempDate.setMonth(0, 1 + ((4 - tempDate.getDay()) + 7) % 7); }
        return 1 + Math.ceil((firstThursday - tempDate) / 604800000);
    }
    function formatDateForDisplay(dateString) { 
        if (!dateString) return 'N/A'; const dateObj = new Date(dateString);
        return `${formatAdminNumber(dateObj.getDate())}.${formatAdminNumber(dateObj.getMonth() + 1)}.${dateObj.getFullYear()}`;
    }

    // --- FUNKTIONEN FÜR "WICHTIGE INFOS VERWALTEN" ---
    function renderImportantInfosList() { 
        if (!importantInfosListUL) return; importantInfosListUL.innerHTML = ''; 
        if (adminImportantInfos.length === 0) { const li = document.createElement('li'); li.textContent = "Keine Infos vorhanden."; li.style.textAlign = "center"; li.style.padding = "10px"; importantInfosListUL.appendChild(li); return; }
        adminImportantInfos.forEach((infoText, index) => { const li = document.createElement('li'); const textSpan = document.createElement('span'); textSpan.textContent = infoText; textSpan.style.flexGrow = "1"; const deleteBtn = document.createElement('button'); deleteBtn.textContent = 'Löschen'; deleteBtn.classList.add('delete-info-btn'); deleteBtn.dataset.index = index; deleteBtn.addEventListener('click', function() { adminImportantInfos.splice(parseInt(this.dataset.index, 10), 1); renderImportantInfosList(); }); li.appendChild(textSpan); li.appendChild(deleteBtn); importantInfosListUL.appendChild(li); });
    }
    if (addInfoForm) { 
        addInfoForm.addEventListener('submit', function(event) { event.preventDefault(); if (newInfoTextInput) { const newText = newInfoTextInput.value.trim(); if (newText) { adminImportantInfos.push(newText); newInfoTextInput.value = ''; renderImportantInfosList(); } else { alert("Bitte geben Sie einen Text für die Info ein."); } } });
    }

    // --- FUNKTIONEN FÜR "MITARBEITER VERWALTEN" ---
    function openEmployeeModal(mode = 'add', employee = null) { 
        if (!employeeForm || !employeeIdInput || !employeeModalTitle || !employeeNameInput || !employeeEmailInput || !employeeRoleInput || !employeeVacationDaysInput || !employeeModal) return;
        employeeForm.reset(); employeeIdInput.value = ''; employeeVacationDaysInput.value = 25; 
        if (mode === 'add') { employeeModalTitle.textContent = 'Neuen Mitarbeiter anlegen';
        } else if (mode === 'edit' && employee) {
            employeeModalTitle.textContent = 'Mitarbeiter bearbeiten'; employeeIdInput.value = employee.id;
            employeeNameInput.value = employee.name; employeeEmailInput.value = employee.email; employeeRoleInput.value = employee.role;
            employeeVacationDaysInput.value = employee.vacationDaysAnnual !== undefined ? employee.vacationDaysAnnual : 25;
        }
        if (employeeModal) employeeModal.classList.add('show');
    }
    function closeEmployeeModal() { if (employeeModal) employeeModal.classList.remove('show'); }
    function renderEmployeeTable() { 
        if (!employeesTableBody) return; employeesTableBody.innerHTML = ''; 
        if (adminEmployeesData.length === 0) { 
            const row = employeesTableBody.insertRow(); const cell = row.insertCell(); cell.colSpan = 6; 
            cell.textContent = "Keine Mitarbeiter vorhanden."; cell.style.textAlign = "center"; cell.style.padding = "20px"; return; 
        } 
        adminEmployeesData.forEach(employee => { 
            const row = employeesTableBody.insertRow(); 
            row.insertCell().textContent = employee.id; 
            row.insertCell().textContent = employee.name; 
            row.insertCell().textContent = employee.email; 
            row.insertCell().textContent = employee.role;
            const vacationCell = row.insertCell();
            const annual = employee.vacationDaysAnnual !== undefined ? employee.vacationDaysAnnual : 0;
            const taken = employee.vacationDaysTaken !== undefined ? employee.vacationDaysTaken : 0;
            const remaining = annual - taken;
            vacationCell.textContent = `${annual} / ${taken} / ${remaining}`;
            const actionsCell = row.insertCell(); actionsCell.classList.add('action-buttons'); 
            const editBtn = document.createElement('button'); editBtn.textContent = 'Bearbeiten'; 
            editBtn.classList.add('edit-btn'); editBtn.addEventListener('click', () => openEmployeeModal('edit', employee)); 
            actionsCell.appendChild(editBtn); 
            const deleteBtn = document.createElement('button'); deleteBtn.textContent = 'Löschen'; 
            deleteBtn.classList.add('delete-btn'); 
            deleteBtn.addEventListener('click', () => { 
                if (confirm(`Möchten Sie ${employee.name} wirklich löschen?`)) { 
                    adminEmployeesData = adminEmployeesData.filter(emp => emp.id !== employee.id); renderEmployeeTable(); 
                } 
            }); actionsCell.appendChild(deleteBtn); 
        });
    }
    if (openAddEmployeeModalBtn) { openAddEmployeeModalBtn.addEventListener('click', () => openEmployeeModal('add')); }
    // ACHTUNG: closeEmployeeModalBtn ist die ID für den Schließen-Button im *Mitarbeiter*-Modal
    // Für das Schicht-Modal ist es closeShiftEditModalBtn
    const actualCloseEmployeeModalBtn = document.getElementById('closeEmployeeModalBtn'); 
    if (actualCloseEmployeeModalBtn) { actualCloseEmployeeModalBtn.addEventListener('click', closeEmployeeModal); }
    if (cancelEmployeeBtn) { cancelEmployeeBtn.addEventListener('click', closeEmployeeModal); }
    if (employeeModal) { employeeModal.addEventListener('click', function(event) { if (event.target === employeeModal) { closeEmployeeModal(); } }); }
    if (employeeForm) { 
        employeeForm.addEventListener('submit', function(event) {
            event.preventDefault(); const id = employeeIdInput.value ? parseInt(employeeIdInput.value, 10) : null;
            const name = employeeNameInput.value.trim(); const email = employeeEmailInput.value.trim(); 
            const role = employeeRoleInput.value; const vacationDaysAnnual = parseInt(employeeVacationDaysInput.value, 10);
            if (!name || !email) { alert("Name und E-Mail dürfen nicht leer sein."); return; }
            if (isNaN(vacationDaysAnnual) || vacationDaysAnnual < 0) { alert("Bitte geben Sie eine gültige Anzahl an Urlaubstagen pro Jahr ein."); return;}
            if (id) { 
                const employeeIndex = adminEmployeesData.findIndex(emp => emp.id === id);
                if (employeeIndex > -1) {
                    const existingTakenDays = adminEmployeesData[employeeIndex].vacationDaysTaken || 0;
                    adminEmployeesData[employeeIndex] = { id, name, email, role, vacationDaysAnnual, vacationDaysTaken: existingTakenDays }; 
                }
            } else { 
                adminEmployeesData.push({ id: nextEmployeeId++, name, email, role, vacationDaysAnnual, vacationDaysTaken: 0 }); 
            } 
            renderEmployeeTable(); closeEmployeeModal(); 
        });
    }

    // --- FUNKTIONEN FÜR ADMIN DASHBOARD ("ÜBERSICHT") ---
    function renderAdminDashboardStats() { 
        if (statEmployeeCountEl) { statEmployeeCountEl.textContent = adminEmployeesData.length; } if (statInfoCountEl) { statInfoCountEl.textContent = adminImportantInfos.length; } if (statPlannedWeeksCountEl) { statPlannedWeeksCountEl.textContent = Object.keys(allShiftData).length; } const statCardLinks = document.querySelectorAll('.stat-card .stat-link[data-section]'); statCardLinks.forEach(link => { const newLink = link.cloneNode(true); link.parentNode.replaceChild(newLink, link); newLink.addEventListener('click', function(event) { event.preventDefault(); const sectionId = this.dataset.section; const correspondingSidebarLink = document.querySelector(`.sidebar-nav a[data-section="${sectionId}"]`); showSection(sectionId, correspondingSidebarLink); }); });
    }

    // --- FUNKTIONEN FÜR "SCHICHTPLAN BEARBEITEN" ---
    function populateShiftSuggestions() {
        if (!shiftTextSuggestionsDatalist) return;
        shiftTextSuggestionsDatalist.innerHTML = ''; 
        const uniqueShiftTexts = new Set();
        const standardNonTimeEntries = ["/", "urlaub", "frei"]; 
        for (const weekKey in allShiftData) {
            if (allShiftData.hasOwnProperty(weekKey)) {
                allShiftData[weekKey].forEach(employeeShift => {
                    adminDayNameKeys.forEach(dayKey => {
                        const shiftText = employeeShift[dayKey];
                        if (shiftText && typeof shiftText === 'string') {
                            const cleanedShiftText = shiftText.replace(/\*$/, '').trim(); 
                            if (cleanedShiftText && !standardNonTimeEntries.includes(cleanedShiftText.toLowerCase()) && cleanedShiftText.includes('-') && cleanedShiftText.match(/^\d{1,2}(:\d{2})?\s*-\s*\d{1,2}(:\d{2})?(\s*Uhr)?$/i)) {
                                uniqueShiftTexts.add(cleanedShiftText + (cleanedShiftText.toLowerCase().includes('uhr') ? '' : ' Uhr'));
                            }
                        }
                    });
                });
            }
        }
        const sortedSuggestions = Array.from(uniqueShiftTexts).sort();
        sortedSuggestions.forEach(text => {
            const option = document.createElement('option');
            option.value = text;
            shiftTextSuggestionsDatalist.appendChild(option);
        });
    }
    function openShiftEditModal(employeeName, dayKey, currentShiftText, currentPrivateNote, year, isoWeek) {
        if (!shiftEditModal || !shiftEditEmployeeNameDisplay || !shiftEditDayDisplay || !shiftEditTextInput || !shiftEditPrivateNoteInput ||
            !shiftEditEmployeeNameHidden || !shiftEditDayKeyHidden || !shiftEditYearHidden || !shiftEditIsoWeekHidden) {
            console.error("Eines der Modal-Elemente für Schichtbearbeitung wurde nicht gefunden!"); return;
        }
        populateShiftSuggestions(); 
        shiftEditEmployeeNameHidden.value = employeeName; shiftEditDayKeyHidden.value = dayKey;
        shiftEditYearHidden.value = year; shiftEditIsoWeekHidden.value = isoWeek;
        shiftEditEmployeeNameDisplay.textContent = employeeName;
        const displayDayNames = {"Mo": "Montag", "Di": "Dienstag", "Mi": "Mittwoch", "Do": "Donnerstag", "Fr": "Freitag", "Sa": "Samstag", "So": "Sonntag"};
        shiftEditDayDisplay.textContent = displayDayNames[dayKey] || dayKey; 
        shiftEditTextInput.value = currentShiftText.replace(/\*$/, '');
        shiftEditPrivateNoteInput.value = currentPrivateNote || '';
        if (shiftEditModal) shiftEditModal.classList.add('show');
    }
    function closeShiftEditModal() { if (shiftEditModal) shiftEditModal.classList.remove('show'); }
    
    // ACHTUNG: IDs closeShiftEditModalBtn und cancelShiftEditBtn sind doppelt belegt durch Mitarbeiter-Modal
    // Stelle sicher, dass die IDs in admin.html für die Schicht-Modal-Buttons eindeutig sind,
    // z.B. closeShiftModalBtnInternal, cancelShiftModalBtnInternal
    const actualCloseShiftEditModalBtn = document.getElementById('closeShiftEditModalBtn'); // Sollte die ID des X-Buttons im Schicht-Modal sein
    const actualCancelShiftEditBtn = document.getElementById('cancelShiftEditBtn'); // Sollte die ID des Abbrechen-Buttons im Schicht-Modal sein

    if (actualCloseShiftEditModalBtn) { actualCloseShiftEditModalBtn.addEventListener('click', closeShiftEditModal); }
    if (actualCancelShiftEditBtn) { actualCancelShiftEditBtn.addEventListener('click', closeShiftEditModal); }
    
    if (shiftEditModal) {
        shiftEditModal.addEventListener('click', function(event) { if (event.target === shiftEditModal) { closeShiftEditModal(); } });
    }
    if (shiftEditForm) {
        shiftEditForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            const employeeName = shiftEditEmployeeNameHidden.value;
            const dayKey = shiftEditDayKeyHidden.value;
            const year = parseInt(shiftEditYearHidden.value, 10);
            const isoWeek = parseInt(shiftEditIsoWeekHidden.value, 10);
            let newShiftText = shiftEditTextInput.value.trim();
            const newPrivateNote = shiftEditPrivateNoteInput.value.trim();

            if (!employeeName || !dayKey || isNaN(year) || isNaN(isoWeek)) {
                alert("Fehler: Kontextinformationen für die Schicht sind unvollständig."); return;
            }
            if (newShiftText === "") {
                if(confirm('Möchtest du die Schicht wirklich leeren? Verwende "/" für "frei". Ansonsten Abbrechen.')){
                    newShiftText = "/"; 
                } else { return; }
            }
            const weekKeyToUpdate = `${year}-W${isoWeek}`;
            if (!allShiftData[weekKeyToUpdate]) { allShiftData[weekKeyToUpdate] = []; }
            let employeeShiftEntry = allShiftData[weekKeyToUpdate].find(s => s.name === employeeName);
            if (!employeeShiftEntry) {
                employeeShiftEntry = { name: employeeName, Mo: "/", Di: "/", Mi: "/", Do: "/", Fr: "/", Sa: "/", So: "/", privateNotes: {} };
                allShiftData[weekKeyToUpdate].push(employeeShiftEntry);
            }
            employeeShiftEntry.privateNotes = employeeShiftEntry.privateNotes || {};
            if (newPrivateNote) {
                employeeShiftEntry.privateNotes[dayKey] = newPrivateNote;
                if (!newShiftText.endsWith('*') && newShiftText !== "/" && newShiftText.toLowerCase() !== "urlaub") {
                    newShiftText += '*';
                }
            } else {
                if (employeeShiftEntry.privateNotes && employeeShiftEntry.privateNotes[dayKey]) {
                    delete employeeShiftEntry.privateNotes[dayKey];
                }
                if (employeeShiftEntry.privateNotes && Object.keys(employeeShiftEntry.privateNotes).length === 0) {
                    delete employeeShiftEntry.privateNotes;
                }
                newShiftText = newShiftText.replace(/\*$/, '');
            }
            employeeShiftEntry[dayKey] = newShiftText;
            // console.log("Aktualisierte allShiftData:", JSON.parse(JSON.stringify(allShiftData))); 
            displayAdminShiftWeek(currentAdminShiftDate); 
            closeShiftEditModal();
        });
    }
    function renderAdminShiftPlanTable(dateForWeek) { 
        if (!adminShiftsTableBody) return; adminShiftsTableBody.innerHTML = '';
        const mondayOfView = new Date(dateForWeek); const dayOfWeek = mondayOfView.getDay();
        const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; mondayOfView.setDate(mondayOfView.getDate() + offset);
        const year = mondayOfView.getFullYear(); const isoWeek = getAdminISOWeek(mondayOfView);
        const weekKeyData = `${year}-W${isoWeek}`; const shiftsForThisWeek = allShiftData[weekKeyData];
        if (adminEmployeesData.length === 0) { const row = adminShiftsTableBody.insertRow(); const cell = row.insertCell(); cell.colSpan = 8; cell.textContent = "Keine Mitarbeiter im System vorhanden."; row.style.textAlign = "center"; cell.style.padding = "20px"; return; }
        adminEmployeesData.forEach(employee => {
            const row = adminShiftsTableBody.insertRow(); const nameCell = row.insertCell(); nameCell.textContent = employee.name; nameCell.style.fontWeight = "500";
            let employeeShiftsInWeekData = null; if (shiftsForThisWeek) { employeeShiftsInWeekData = shiftsForThisWeek.find(s => s.name === employee.name); }
            adminDayNameKeys.forEach(dayKey => {
                const shiftCell = row.insertCell();
                const currentShiftText = employeeShiftsInWeekData && employeeShiftsInWeekData[dayKey] ? employeeShiftsInWeekData[dayKey] : "/";
                let currentPrivateNote = ""; if (employeeShiftsInWeekData && employeeShiftsInWeekData.privateNotes && employeeShiftsInWeekData.privateNotes[dayKey]) { currentPrivateNote = employeeShiftsInWeekData.privateNotes[dayKey]; }
                shiftCell.textContent = currentShiftText; shiftCell.style.textAlign = "center"; 
                if (currentShiftText.toLowerCase() === "urlaub") { shiftCell.classList.add('shift-urlaub'); }
                if (currentShiftText.includes('*') || currentPrivateNote) { shiftCell.classList.add('has-private-note'); }
                shiftCell.addEventListener('click', () => { 
                    openShiftEditModal(employee.name, dayKey, currentShiftText, currentPrivateNote, year, isoWeek);
                });
            });
        });
        if (adminEmployeesData.length > 0 && !shiftsForThisWeek && adminShiftsTableBody.rows.length > 0) { const firstEmployeeRow = adminShiftsTableBody.rows[0]; if (firstEmployeeRow && firstEmployeeRow.cells.length > 1) { firstEmployeeRow.cells[1].textContent = "Keine Schichtdaten für diese Woche vorhanden."; firstEmployeeRow.cells[1].colSpan = 7; for(let k=2; k < 8; k++){ if(firstEmployeeRow.cells[k]) firstEmployeeRow.cells[k].style.display = 'none';}} }
    }
    function displayAdminShiftWeek(date) { 
        const currentDayOfWeek = date.getDay(); const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek; const monday = new Date(date); monday.setDate(date.getDate() + mondayOffset); const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6); if (adminCurrentWeekDisplay) { const mondayFormattedNav = `${formatAdminNumber(monday.getDate())}. ${monday.toLocaleDateString('de-DE', { month: 'short' })}`; const sundayFormattedNav = `${formatAdminNumber(sunday.getDate())}. ${sunday.toLocaleDateString('de-DE', { month: 'short' })}`; adminCurrentWeekDisplay.textContent = `Woche: ${mondayFormattedNav} - ${sundayFormattedNav}`; } for (let i = 0; i < 7; i++) { const dayInCycle = new Date(monday); dayInCycle.setDate(monday.getDate() + i); const dayOfMonth = formatAdminNumber(dayInCycle.getDate()); const month = formatAdminNumber(dayInCycle.getMonth() + 1); if (adminDayHeaders[i]) { adminDayHeaders[i].innerHTML = `${adminDayNamesShortDisplay[i]}<br><small class="date-in-header">${dayOfMonth}.${month}.</small>`; } } renderAdminShiftPlanTable(monday);
    }

    if (adminPrevWeekBtn) { adminPrevWeekBtn.addEventListener('click', function() { currentAdminShiftDate.setDate(currentAdminShiftDate.getDate() - 7); displayAdminShiftWeek(currentAdminShiftDate); }); }
    if (adminNextWeekBtn) { adminNextWeekBtn.addEventListener('click', function() { currentAdminShiftDate.setDate(currentAdminShiftDate.getDate() + 7); displayAdminShiftWeek(currentAdminShiftDate); }); }
    if (adminGoToWeekBtn) { adminGoToWeekBtn.addEventListener('click', function() { const year = parseInt(adminYearInput.value); const week = parseInt(adminWeekInput.value); if (!isNaN(year) && !isNaN(week) && week >= 1 && week <= 53 && year >=1900 && year <= 2100) { currentAdminShiftDate = getDateOfISOWeek(week, year); displayAdminShiftWeek(currentAdminShiftDate); } else { alert("Bitte geben Sie ein gültiges Jahr und eine gültige Kalenderwoche ein."); } }); }
    
    // --- FUNKTIONEN für Urlaubsantragsverwaltung ---
    function renderVacationRequestsTable() {
        if (!vacationRequestsTableBody) return;
        vacationRequestsTableBody.innerHTML = '';
        try {
            const storedRequests = localStorage.getItem('vacationRequests');
            if (storedRequests) {
                adminVacationRequestsData = JSON.parse(storedRequests);
            } else {
                console.log("Keine Anträge im localStorage für Admin, verwende ggf. initial definierte Beispiele oder leeres Array.");
            }
        } catch (e) {
            console.error("Fehler beim Laden der Urlaubsanträge aus localStorage für Admin in renderVacationRequestsTable:", e);
            adminVacationRequestsData = []; 
        }
        if (adminVacationRequestsData.length === 0) { 
            const row = vacationRequestsTableBody.insertRow(); const cell = row.insertCell(); cell.colSpan = 8; 
            cell.textContent = "Keine Urlaubsanträge vorhanden."; cell.style.textAlign = "center"; cell.style.padding = "20px"; return;
        }
        adminVacationRequestsData.forEach(request => { 
            const row = vacationRequestsTableBody.insertRow();
            row.insertCell().textContent = request.id;
            row.insertCell().textContent = request.employeeName;
            row.insertCell().textContent = formatDateForDisplay(request.startDate);
            row.insertCell().textContent = formatDateForDisplay(request.endDate);
            row.insertCell().textContent = request.requestedDays;
            row.insertCell().textContent = request.reason || "-"; 
            const statusCell = row.insertCell();
            statusCell.textContent = request.status;
            statusCell.className = `status-${request.status.toLowerCase()}`; 
            const actionsCell = row.insertCell(); actionsCell.classList.add('action-buttons');
            if (request.status === "beantragt") {
                const approveBtn = document.createElement('button'); approveBtn.textContent = 'Genehmigen';
                approveBtn.classList.add('btn-success'); approveBtn.addEventListener('click', () => handleVacationRequest(request.id, 'genehmigt'));
                actionsCell.appendChild(approveBtn);
                const rejectBtn = document.createElement('button'); rejectBtn.textContent = 'Ablehnen';
                rejectBtn.classList.add('btn-danger'); rejectBtn.addEventListener('click', () => handleVacationRequest(request.id, 'abgelehnt'));
                actionsCell.appendChild(rejectBtn);
            } else { actionsCell.textContent = "-"; }
        });
    }

    function handleVacationRequest(requestId, newStatus) {
        const requestIndex = adminVacationRequestsData.findIndex(req => req.id === requestId);
        if (requestIndex === -1) return;

        const request = adminVacationRequestsData[requestIndex];
        const oldStatus = request.status;
        request.status = newStatus;

        const employeeIndex = adminEmployeesData.findIndex(emp => emp.id === request.employeeId || emp.name === request.employeeName);

        if (newStatus === 'genehmigt') {
            if (employeeIndex > -1) {
                adminEmployeesData[employeeIndex].vacationDaysTaken = (adminEmployeesData[employeeIndex].vacationDaysTaken || 0) + request.requestedDays;
            }
            let currentDateIter = new Date(request.startDate);
            const endDateObj = new Date(request.endDate);
            while (currentDateIter <= endDateObj) {
                const year = currentDateIter.getFullYear(); const isoWeek = getAdminISOWeek(currentDateIter);
                const dayOfWeekJS = currentDateIter.getDay(); const dayKeyLookup = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
                const dayKey = dayKeyLookup[dayOfWeekJS]; const weekKeyToUpdate = `${year}-W${isoWeek}`;
                if (!allShiftData[weekKeyToUpdate]) { allShiftData[weekKeyToUpdate] = []; }
                let employeeShiftEntry = allShiftData[weekKeyToUpdate].find(s => s.name === request.employeeName);
                if (!employeeShiftEntry) {
                    employeeShiftEntry = { name: request.employeeName, Mo: "/", Di: "/", Mi: "/", Do: "/", Fr: "/", Sa: "/", So: "/", privateNotes: {} };
                    allShiftData[weekKeyToUpdate].push(employeeShiftEntry);
                }
                if (employeeShiftEntry.privateNotes && employeeShiftEntry.privateNotes[dayKey]) {
                    delete employeeShiftEntry.privateNotes[dayKey];
                    if (Object.keys(employeeShiftEntry.privateNotes).length === 0) { delete employeeShiftEntry.privateNotes; }
                }
                employeeShiftEntry[dayKey] = "Urlaub";
                currentDateIter.setDate(currentDateIter.getDate() + 1);
            }
        } else if (newStatus === 'abgelehnt' && oldStatus === 'genehmigt') {
            if (employeeIndex > -1) {
                adminEmployeesData[employeeIndex].vacationDaysTaken = Math.max(0, (adminEmployeesData[employeeIndex].vacationDaysTaken || 0) - request.requestedDays);
            }
            let currentDateIter = new Date(request.startDate);
            const endDateObj = new Date(request.endDate);
            while (currentDateIter <= endDateObj) {
                const year = currentDateIter.getFullYear(); const isoWeek = getAdminISOWeek(currentDateIter);
                const dayOfWeekJS = currentDateIter.getDay(); const dayKeyLookup = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
                const dayKey = dayKeyLookup[dayOfWeekJS]; const weekKeyToUpdate = `${year}-W${isoWeek}`;
                if (allShiftData[weekKeyToUpdate]) {
                    let employeeShiftEntry = allShiftData[weekKeyToUpdate].find(s => s.name === request.employeeName);
                    if (employeeShiftEntry && employeeShiftEntry[dayKey] === "Urlaub") {
                        employeeShiftEntry[dayKey] = "/"; 
                    }
                }
                currentDateIter.setDate(currentDateIter.getDate() + 1);
            }
        }
        try {
            localStorage.setItem('vacationRequests', JSON.stringify(adminVacationRequestsData));
        } catch (e) { console.error("Fehler beim Speichern der Urlaubsanträge im localStorage (Admin):", e); }

        renderVacationRequestsTable();
        if (document.getElementById('admin-section-employees').classList.contains('active-section')) { renderEmployeeTable(); }
        if (document.getElementById('admin-section-shifts').classList.contains('active-section')) { displayAdminShiftWeek(currentAdminShiftDate); }
        if (document.getElementById('admin-section-dashboard').classList.contains('active-section')) { renderAdminDashboardStats(); }
    }

    // --- ALLGEMEINE ADMIN-PANEL NAVIGATION & INITIALISIERUNG ---
    document.addEventListener('keydown', function(event) { 
        if (event.key === "Escape") {
            if (employeeModal && employeeModal.classList.contains('show')) { closeEmployeeModal(); }
            if (shiftEditModal && shiftEditModal.classList.contains('show')) { closeShiftEditModal(); }
        }
    });
    
    function showSection(sectionId, linkElement) { 
        adminSections.forEach(section => { if(section) section.classList.remove('active-section'); });
        sidebarNavLinks.forEach(navLink => { if(navLink) navLink.classList.remove('active-link'); });
        const targetSection = document.getElementById(`admin-section-${sectionId}`);
        if (targetSection) {
            targetSection.classList.add('active-section');
            if (linkElement) { linkElement.classList.add('active-link'); }
            if (adminMainHeader) {
                if (linkElement) { adminMainHeader.textContent = linkElement.textContent; }
                else if (sectionId === 'dashboard') { adminMainHeader.textContent = "Übersicht"; }
            }
            if (sectionId === 'infos') { renderImportantInfosList(); }
            else if (sectionId === 'employees') { renderEmployeeTable(); }
            else if (sectionId === 'dashboard') { renderAdminDashboardStats(); }
            else if (sectionId === 'shifts') { populateShiftSuggestions(); displayAdminShiftWeek(currentAdminShiftDate); }
            else if (sectionId === 'vacationrequests') { 
                try {
                    const storedRequests = localStorage.getItem('vacationRequests');
                    if (storedRequests) {
                        adminVacationRequestsData = JSON.parse(storedRequests);
                    } else if (adminVacationRequestsData.length === 0) { 
                        console.log("Keine Anträge im localStorage, lade Standard-Beispiele für Admin.");
                    }
                } catch (e) {
                    console.error("Fehler beim Laden von Urlaubsanträgen aus localStorage in showSection:", e);
                    adminVacationRequestsData = [];
                }
                renderVacationRequestsTable(); 
            }
        } else { console.warn(`Sektion mit ID admin-section-${sectionId} nicht gefunden.`); }
    }

    sidebarNavLinks.forEach(link => { if (link.getAttribute('href') === 'login.html') { return; } link.addEventListener('click', function(event) { event.preventDefault(); const sectionId = this.dataset.section; showSection(sectionId, this); }); });
    const initialLink = document.querySelector('.sidebar-nav a[data-section="dashboard"]');
    if (initialLink) { showSection('dashboard', initialLink); }
    else { if (sidebarNavLinks.length > 0 && sidebarNavLinks[0].dataset.section) { if (sidebarNavLinks[0].getAttribute('href') !== 'login.html') { showSection(sidebarNavLinks[0].dataset.section, sidebarNavLinks[0]); } } }

});