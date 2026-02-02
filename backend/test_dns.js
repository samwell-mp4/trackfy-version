const dns = require('dns');

const hostname = 'okciydlceoohrkuqqeet.supabase.co';

console.log(`Attempting to resolve ${hostname}...`);

dns.lookup(hostname, (err, address, family) => {
    if (err) {
        console.error('DNS Lookup Error:', err);
    } else {
        console.log(`Address: ${address}, Family: IPv${family}`);
    }
});
