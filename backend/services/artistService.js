const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// --- Artists ---

async function listArtists(userId) {
    console.log('Listing artists for user:', userId);
    const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('user_id', userId)
        .order('name');

    if (error) {
        console.error('Error listing artists:', error);
        throw error;
    }
    console.log('Artists found:', data?.length);
    return data;
}

async function createArtist(userId, artistData) {
    console.log('Creating artist for user:', userId, 'Data:', artistData);
    const { data, error } = await supabase
        .from('artists')
        .insert([{ ...artistData, user_id: userId }])
        .select()
        .single();

    if (error) {
        console.error('Error creating artist:', error);
        throw error;
    }
    console.log('Artist created:', data);
    return data;
}

async function updateArtist(userId, artistId, updates) {
    const { data, error } = await supabase
        .from('artists')
        .update(updates)
        .eq('id', artistId)
        .eq('user_id', userId) // Security check
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function deleteArtist(userId, artistId) {
    const { error } = await supabase
        .from('artists')
        .delete()
        .eq('id', artistId)
        .eq('user_id', userId);

    if (error) throw error;
    return true;
}

// --- Tracks ---

async function listTracks(userId, artistId = null) {
    let query = supabase
        .from('tracks')
        .select('*, artists(name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (artistId) {
        query = query.eq('artist_id', artistId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

async function getTrack(userId, trackId) {
    const { data, error } = await supabase
        .from('tracks')
        .select('*, artists(*)')
        .eq('id', trackId)
        .eq('user_id', userId)
        .single();

    if (error) throw error;
    return data;
}

async function createTrack(userId, trackData) {
    const { data, error } = await supabase
        .from('tracks')
        .insert([{ ...trackData, user_id: userId }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function updateTrack(userId, trackId, updates) {
    const { data, error } = await supabase
        .from('tracks')
        .update(updates)
        .eq('id', trackId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function deleteTrack(userId, trackId) {
    const { error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', trackId)
        .eq('user_id', userId);

    if (error) throw error;
    return true;
}

module.exports = {
    listArtists,
    createArtist,
    updateArtist,
    deleteArtist,
    listTracks,
    getTrack,
    createTrack,
    updateTrack,
    deleteTrack
};
