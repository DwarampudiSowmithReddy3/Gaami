const { spawn } = require('child_process');
const os = require('os');

console.log("Starting full application workflow...");

// Determine the correct npm command for Windows vs Mac/Linux
const npmCmd = os.platform() === 'win32' ? 'npm.cmd' : 'npm';

// Spawn the backend server
const backend = spawn(npmCmd, ['start'], { cwd: './backend', stdio: 'inherit', shell: true });

// Spawn the frontend server
const frontend = spawn(npmCmd, ['start'], { cwd: './frontend', stdio: 'inherit', shell: true });

// Handle any startup errors
backend.on('error', (err) => console.error('Failed to start backend server:', err));
frontend.on('error', (err) => console.error('Failed to start frontend server:', err));

console.log("Both servers have been launched!");
