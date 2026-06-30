const { spawn } = require('child_process');

function start(name, args) {
  const proc = spawn('npm', args, { shell: true });

  proc.stdout.on('data', chunk => {
    process.stdout.write(`[${name}] ${chunk}`);
  });
  proc.stderr.on('data', chunk => {
    process.stderr.write(`[${name}] ${chunk}`);
  });
  proc.on('close', code => {
    console.log(`[${name}] exited with code ${code}`);
  });
  return proc;
}

start('backend', ['run', 'dev', '--prefix', 'backend']);
start('frontend', ['run', 'dev', '--prefix', 'frontend']);
