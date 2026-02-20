const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client
// process.env.SUPABASE_URL and process.env.SUPABASE_KEY will be set in Vercel settings
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  try {
    // Query the 'flight_data' table
    const { data, error } = await supabase
      .from('flight_data')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Return the data as JSON
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
