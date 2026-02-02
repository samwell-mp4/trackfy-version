require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function createAdmin() {
    console.log('Creating admin user...');

    const email = 'admin@google.com';
    const password = 'admin123';
    const usuario = 'Admin';
    const role = 'admin'; // Giving admin role just in case

    try {
        // 1. Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (existingUser) {
            console.log('User already exists:', existingUser);
            return;
        }

        // 2. Insert user
        const { data, error } = await supabase
            .from('users')
            .insert([{
                email,
                password,
                usuario,
                role
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating user:', error);
        } else {
            console.log('✅ User created successfully:');
            console.log(data);
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

createAdmin();
