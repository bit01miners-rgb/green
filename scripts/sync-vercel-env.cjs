
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const envPath = path.resolve(__dirname, '..', '.env');

// Parse args
const args = process.argv.slice(2);
let token = process.env.VERCEL_TOKEN;

// simple arg parser
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--token' && args[i + 1]) {
        token = args[i + 1];
        i++;
    }
}

if (!fs.existsSync(envPath)) {
    console.error('.env file not found');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split(/\r?\n/);

const vars = {};
lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        vars[key] = value;
    }
});

console.log(`Found ${Object.keys(vars).length} variables in .env`);
if (token) console.log('Using provided Vercel Token.');
else console.warn('Warning: No VERCEL_TOKEN found. Using default login.');

for (const [key, value] of Object.entries(vars)) {
    if (key === 'PORT' || key === 'NODE_ENV') continue;
    if (!value) continue;

    console.log(`Processing ${key}...`);

    // Construct args
    const baseArgs = ['env'];
    const rmArgs = [...baseArgs, 'rm', key, 'production', '-y'];
    const addArgs = [...baseArgs, 'add', key, 'production'];

    if (token) {
        rmArgs.push('--token', token);
        addArgs.push('--token', token);
    }

    // Remove
    try {
        spawnSync('vercel', rmArgs, { stdio: 'ignore', shell: true });
    } catch (e) { }

    // Add
    try {
        const add = spawnSync('vercel', addArgs, {
            input: value,
            encoding: 'utf-8',
            stdio: ['pipe', 'inherit', 'inherit'],
            shell: true
        });

        if (add.status === 0) {
            console.log(`✅ Added ${key}`);
        } else {
            console.error(`❌ Failed to add ${key} (Exit Code: ${add.status})`);
        }
    } catch (e) {
        console.error(`❌ Exception adding ${key}: ${e.message}`);
    }
}

console.log('Done!');
