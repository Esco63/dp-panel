// /api/delete-info.js
import { createClient } from '@supabase/supabase-js';

// Initialisiere den Supabase-Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    // Wir verwenden POST, da das Senden von Daten im Body eines DELETE-Requests
    // manchmal zu Problemen führen kann. POST ist hier eine robustere Wahl.
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        // Hole die ID aus dem Body der Anfrage
        const { id } = req.body;

        // Validierung: Stelle sicher, dass eine ID vorhanden und eine Zahl ist
        if (!id || typeof id !== 'number') {
            return res.status(400).json({ error: 'Eine gültige, numerische ID ist erforderlich.' });
        }

        // Lösche den Eintrag aus der 'important_infos' Tabelle, wo die ID übereinstimmt
        const { error } = await supabase
            .from('important_infos')
            .delete()
            .match({ id: id });

        // Fehlerbehandlung bei der Datenbankoperation
        if (error) {
            console.error('Supabase Error:', error);
            throw error;
        }

        // Erfolgsantwort
        res.status(200).json({ message: `Info mit ID ${id} erfolgreich gelöscht.` });

    } catch (error) {
        // Allgemeine Fehlerbehandlung
        res.status(500).json({ error: 'Ein interner Serverfehler ist aufgetreten.', details: error.message });
    }
}