/**
 * Sobe backend (3001) + frontend webpack (3000) juntos.
 * Uso: npm start
 */
const { spawn } = require('child_process');
const path = require('path');

const kids = [];
const root = path.join(__dirname, '..');

function run(name, cmd, args, color) {
  const kid = spawn(cmd, args, { cwd: root, shell: false, stdio: ['ignore', 'pipe', 'pipe'] });
  const tag = `\x1b[${color}m[${name}]\x1b[0m `;
  const pipe = (stream, out) => {
    let buf = '';
    stream.on('data', (chunk) => {
      buf += chunk.toString();
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) out.write(tag + line + '\n');
    });
  };
  pipe(kid.stdout, process.stdout);
  pipe(kid.stderr, process.stderr);
  kid.on('exit', (code) => {
    console.log(tag + 'encerrado (code ' + code + ')');
    shutdown(code || 0);
  });
  kids.push(kid);
  return kid;
}

function shutdown(code) {
  for (const k of kids) {
    if (!k.killed) k.kill('SIGTERM');
  }
  setTimeout(() => process.exit(code), 300);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

run('api', process.execPath, ['server/index.js'], '35');
run('ui', process.execPath, [
  path.join(root, 'node_modules', 'webpack', 'bin', 'webpack.js'),
  'serve',
  '--mode',
  'development',
  '--host',
  '0.0.0.0',
  '--port',
  '3000',
  '--hot',
], '36');
