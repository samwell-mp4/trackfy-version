require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkUsers() {
    console.log('Checking users...');

    // Check specifically for the email in the screenshot
    const emailToCheck = 'seu@email.com';
    const { data: specificUser, error: specificError } = await supabase
        .from('users')
        .select('*')
        .eq('email', emailToCheck);

    if (specificError) {
        console.error('Error checking specific user:', specificError);
    } else {
        if (specificUser && specificUser.length > 0) {
            console.log(`User '${emailToCheck}' FOUND.`);
            console.log('User details:', specificUser[0]);
        } else {
            console.log(`User '${emailToCheck}' NOT FOUND.`);
        }
    }

    // List all users
    const { data: allUsers, error: listError } = await supabase
        .from('users')
        .select('id, email, usuario, role');

    if (listError) {
        console.error('Error listing users:', listError);
    } else {
        console.log(`\nTotal users found: ${allUsers.length}`);
        allUsers.forEach(u => console.log(`- ${u.email} (${u.usuario}) [${u.role}]`));
    }
}

checkUsers();
