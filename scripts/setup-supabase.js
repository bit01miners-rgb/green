
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Determine env file path
const envPath = path.resolve(__dirname, '..', '.env');

async function setup() {
    console.log('----- Supabase Setup -----');
    console.log('Please ensure you have your Supabase Database URL and Keys ready.');
    console.log('');

    // Read existing .env
    let existingEnv = {};
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim();
                if (key && value) {
                    existingEnv[key] = value;
                }
            }
        });
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

    const dbUrl = await askQuestion(`Enter Database URL (Transaction Pooler or Session) [${existingEnv.DATABASE_URL || 'Press Enter'}]: `);
    const supabaseUrl = await askQuestion(`Enter Supabase URL [${existingEnv.SUPABASE_URL || 'Press Enter'}]: `);
    const anonKey = await askQuestion(`Enter Supabase Anon Key [${existingEnv.SUPABASE_ANON_KEY || 'Press Enter'}]: `);
    const serviceKey = await askQuestion(`Enter Supabase Service Key [${existingEnv.SUPABASE_SERVICE_ROLE_KEY || 'Press Enter'}]: `);

    // Update .env content
    const newEnv = {
        ...existingEnv,
        DATABASE_URL: dbUrl || existingEnv.DATABASE_URL,
        SUPABASE_URL: supabaseUrl || existingEnv.SUPABASE_URL,
        SUPABASE_ANON_KEY: anonKey || existingEnv.SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: serviceKey || existingEnv.SUPABASE_SERVICE_ROLE_KEY,
    };

    const envString = Object.entries(newEnv)
        .filter(([k, v]) => v !== undefined && v !== '')
        .map(([k, v]) => `${k}=${v}`)
        .join('\n');

    fs.writeFileSync(envPath, envString);
    console.log('.env updated successfully.');

    console.log('Running database migrations (drizzle-kit push)...');
    try {
        execSync('npm run db:push', { stdio: 'inherit' });
        console.log('Migrations completed successfully.');
    } catch (error) {
        console.error('Migration failed. verify your connection string in .env and try again.');
        // Don't exit process with error so user can still see output
    }

    console.log('Setup complete!');
    rl.close();
}

setup();
