/* api/add_user.js */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        flight_number,
        drone_type,
        current_time,
        power_watts,
        current_amps,
        batteryTemp,
        ambiantTemp,
        airSpeed,
        windDirection_rad,
        windSpeed_mps
    } = req.body;

    if (!flight_number || !drone_type) {
        return res.status(400).json({ error: 'flight_number and drone_type are required' });
    }

    try {
        const { data, error } = await supabase
            .from('flight_data')
            .insert([{
                flight_number,
                drone_type,
                current_time,
                power_watts,
                current_amps,
                batteryTemp,
                ambiantTemp,
                airSpeed,
                windDirection_rad,
                windSpeed_mps
            }])
            .select();

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};