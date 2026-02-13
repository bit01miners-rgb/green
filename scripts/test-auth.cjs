
const fetch = require('node-fetch'); // Or native fetch in Node 18+

// Helper to handle fetch in different node versions
const request = async (url, method, body) => {
    try {
        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (body) options.body = JSON.stringify(body);

        const res = await fetch(url, options);
        const data = await res.json();
        return { status: res.status, data };
    } catch (e) {
        return { error: e.message };
    }
};

async function testAuth() {
    console.log('--- Testing Authentication ---');
    const baseUrl = 'http://localhost:5000/api/auth';
    const timestamp = Date.now();
    const email = `test_${timestamp}@example.com`;
    const password = 'Password123!';
    const username = `user_${timestamp}`;

    console.log(`1. Attempting Registration for ${email}...`);
    const regRes = await request(`${baseUrl}/register`, 'POST', {
        email,
        password,
        username,
        firstName: 'Test',
        lastName: 'User'
    });

    if (regRes.status === 201) {
        console.log('✅ Registration Successful');
        console.log('User ID:', regRes.data.id);
    } else {
        console.error('❌ Registration Failed:', regRes.status, regRes.data);
        return;
    }

    console.log(`2. Attempting Login for ${email}...`);
    const loginRes = await request(`${baseUrl}/login`, 'POST', {
        email,
        password
    });

    if (loginRes.status === 200) {
        console.log('✅ Login Successful');
        console.log('User:', loginRes.data.email);
    } else {
        console.error('❌ Login Failed:', loginRes.status, loginRes.data);
    }

    console.log('--- Auth Test Complete ---');
}

testAuth();
