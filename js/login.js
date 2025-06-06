// js/login.js

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Verhindert das Standard-Absenden des Formulars (Seiten-Neuladen)

            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');

            if (usernameInput && passwordInput) {
                const username = usernameInput.value;
                const password = passwordInput.value;

                console.log(`Login-Versuch mit:`);
                console.log(`Benutzername / E-Mail: ${username}`);
                console.log(`Passwort: ${password}`); // Im echten Einsatz nie das Passwort loggen!

                // Hier würde später die eigentliche Login-Logik folgen:
                // 1. Daten an ein Backend senden
                // 2. Antwort vom Backend verarbeiten
                // 3. Bei Erfolg: Weiterleitung zum Dashboard (index.html)
                //    z.B. window.location.href = 'index.html';
                // 4. Bei Fehler: Fehlermeldung anzeigen

                // Für Demozwecke leiten wir nach einem Klick einfach mal weiter (ohne echte Prüfung)
                // Entferne oder kommentiere das aus, wenn du es noch nicht willst.
                if (username && password) { // Sehr einfache "Prüfung"
                    alert('Login-Daten empfangen (keine echte Prüfung!). Weiterleitung zum Dashboard...');
                    window.location.href = 'index.html'; // Weiterleitung zur Dashboard-Seite
                } else {
                    alert('Bitte Benutzername und Passwort eingeben.');
                }
            }
        });
    }
});