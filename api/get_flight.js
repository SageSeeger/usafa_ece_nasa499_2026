/* api/get_flight.js
   Returns all telemetry rows for a given upload session (identified by
   its uploaded_at timestamp), ordered by rtc_utc ascending.
   Usage: GET /api/get_flight?uploaded_at=<ISO timestamp> */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { uploaded_at } = req.query;
    if (!uploaded_at) {
        return res.status(400).json({ error: 'uploaded_at query parameter is required' });
    }

    try {
        const { data, error } = await supabase
            .from('flight_telemetry')
            .select('rtc_utc, battery_temp_c, pm_voltage_v, pm_power_w, pm_current_a')
            .eq('uploaded_at', uploaded_at)
            .order('rtc_utc', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
