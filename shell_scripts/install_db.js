import { execSync } from 'child_process';

try {
    execSync('psql -v ON_ERROR_STOP=1 -f ./db/index.sql', { stdio: 'inherit' });
    execSync('psql -v ON_ERROR_STOP=1 -d gcms -f ./db/schema.sql', { stdio: 'inherit' });
    execSync('psql -v ON_ERROR_STOP=1 -d gcms -f ./db/seed_dev.sql', { stdio: 'inherit' });
} catch (err) {
    console.error('Database setup failed:', err);
    process.exit(1);
}
