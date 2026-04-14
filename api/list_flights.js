/* api/list_flights.js
   Returns a list of distinct upload sessions from flight_telemetry,
   ordered by most recent first. Each entry has the uploaded_at timestamp
   and the number of rows in that upload. */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get all rows with just the uploaded_at column, then group in JS
        const { data, error } = await supabase
            .from('flight_telemetry')
            .select('uploaded_at')
            .order('uploaded_at', { ascending: false });

        if (error) throw error;

        // Group by uploaded_at to get distinct sessions + row counts
        const sessionMap = {};
        for (const row of data) {
            const key = row.uploaded_at;
            sessionMap[key] = (sessionMap[key] || 0) + 1;
        }

        const sessions = Object.entries(sessionMap).map(([uploaded_at, row_count]) => ({
            uploaded_at,
            row_count
        }));

        res.status(200).json(sessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
