// /api/add-info.js
import { createClient } from '@supabase/supabase-js';

// Initialisiere den Supabase-Client
// Die Zugangsdaten werden sicher aus den Vercel Environment Variables geladen
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    // Erlaube nur POST-Anfragen, da wir Daten vom Frontend erhalten
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        // Hole den info_text aus dem Body der Anfrage
        const { info_text } = req.body;

        // Validierung: Stelle sicher, dass der Text nicht leer ist
        if (!info_text || info_text.trim() === '') {
            return res.status(400).json({ error: 'Der Infotext darf nicht leer sein.' });
        }

        // Füge die neue Information in die 'important_infos' Tabelle ein
        const { data, error } = await supabase
            .from('important_infos')
            .insert([
                { info_text: info_text.trim() }
            ])
            .select(); // .select() gibt den eingefügten Datensatz zurück

        // Fehlerbehandlung bei der Datenbankoperation
        if (error) {
            console.error('Supabase Error:', error);
            throw error;
        }

        // Erfolgsantwort: Sende den neu erstellten Eintrag zurück
        res.status(201).json({ message: 'Info erfolgreich hinzugefügt.', data: data[0] });

    } catch (error) {
        // Allgemeine Fehlerbehandlung
        res.status(500).json({ error: 'Ein interner Serverfehler ist aufgetreten.', details: error.message });
    }
}