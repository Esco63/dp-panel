// api/get-infos.js

// Importiert die notwendigen Funktionen aus der Supabase-Bibliothek
import { createClient } from '@supabase/supabase-js';

// Dies ist die eigentliche Serverless Function.
// Sie muss als "default" exportiert werden, damit Vercel sie erkennt.
export default async function handler(request, response) {
    // Erstellt den Supabase-Client mit den sicheren Umgebungsvariablen von Vercel
    // Diese haben wir im vorherigen Schritt im Vercel-Projekt angelegt
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY
    );

    try {
        // Führe die Datenbankabfrage aus: 
        // Wähle alle Spalten (*) aus der Tabelle 'important_infos'
        const { data, error } = await supabase
            .from('important_infos')
            .select('*')
            .order('created_at', { ascending: false }); // Optional: Neueste Infos zuerst

        // Wenn bei der Datenbankabfrage ein Fehler auftritt, gib ihn in der Konsole aus
        // und sende eine Fehlermeldung mit Statuscode 500 zurück.
        if (error) {
            console.error('Supabase Error:', error);
            return response.status(500).json({ error: 'Fehler beim Abrufen der Daten.' });
        }

        // Wenn alles gut ging, sende die abgerufenen Daten (data)
        // mit dem Statuscode 200 (OK) als JSON-Antwort zurück.
        return response.status(200).json(data);

    } catch (e) {
        console.error('Unerwarteter Handler Error:', e);
        // Fängt andere, unerwartete Fehler in der Funktion ab
        return response.status(500).json({ error: 'Ein unerwarteter Fehler ist aufgetreten.' });
    }
}