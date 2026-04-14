/* api/upload_xlsx.js */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ error: 'records must be a non-empty array' });
    }

    try {
        // Insert in batches of 500 to avoid payload limits
        const BATCH_SIZE = 500;
        let totalInserted = 0;

        for (let i = 0; i < records.length; i += BATCH_SIZE) {
            const batch = records.slice(i, i + BATCH_SIZE);
            const { data, error } = await supabase
                .from('flight_telemetry')
                .insert(batch)
                .select();

            if (error) throw error;
            totalInserted += data.length;
        }

        res.status(200).json({ inserted: totalInserted });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
