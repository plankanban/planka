const { spawnSync } = require('child_process');
const path = require('path');

const VENV_PATH = path.join(__dirname, '.venv');
const REQUIREMENTS_PATH = path.join(__dirname, 'requirements.txt');

const PYTHON_PATH =
  process.platform === 'win32'
    ? path.join(VENV_PATH, 'Scripts', 'python.exe')
    : path.join(VENV_PATH, 'bin', 'python');

const getSystemPythonCommand = () => {
  let result = spawnSync('python3', ['--version'], { stdio: 'ignore' });
  if (result.status === 0) return 'python3';

  result = spawnSync('python', ['--version'], { stdio: 'ignore' });
  if (result.status === 0) return 'python';

  throw new Error('Python is not installed or not in PATH');
};

const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status);
};

run(getSystemPythonCommand(), ['-m', 'venv', VENV_PATH]);
run(PYTHON_PATH, ['-m', 'pip', 'install', '-r', REQUIREMENTS_PATH]);
