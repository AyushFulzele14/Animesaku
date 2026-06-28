const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const WATCH_DIR = __dirname;
const DEBOUNCE_MS = 5000; // Wait 5 seconds after the last change before pushing
const IGNORED_PATHS = [
  'node_modules',
  '.git',
  '.bolt',
  'dist',
  '.env',
  'package-lock.json',
  'git-autopush.js'
];

let timeoutId = null;
let changedFiles = new Set();

function shouldIgnore(filePath) {
  return IGNORED_PATHS.some(ignored => filePath.includes(ignored));
}

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: WATCH_DIR }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout || stderr);
    });
  });
}

async function syncToGitHub() {
  console.log(`\n[${new Date().toLocaleTimeString()}] Syncing changes to GitHub...`);
  try {
    // 1. Stage changes
    await runCommand('git add .');
    console.log('Staged changes.');

    // 2. Commit changes
    const filesList = Array.from(changedFiles).map(f => path.basename(f)).join(', ');
    const commitMessage = `Auto-sync changes: ${filesList || 'updates'}`;
    const commitOutput = await runCommand(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);
    console.log(commitOutput.trim());

    // 3. Push changes
    console.log('Pushing to GitHub origin main...');
    const pushOutput = await runCommand('git push origin main');
    console.log('Push completed successfully!');
    
    // Clear list of changed files
    changedFiles.clear();
  } catch (error) {
    if (error.message.includes('nothing to commit')) {
      console.log('Nothing to commit, working tree clean.');
    } else {
      console.error('Error during git sync:', error.message);
    }
  }
}

function handleFileChange(eventType, filename) {
  if (!filename || shouldIgnore(filename)) return;

  changedFiles.add(filename);
  console.log(`[File Change] Detected modification in: ${filename}`);

  // Clear existing timeout to debounce pushes
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  // Set new timeout
  timeoutId = setTimeout(() => {
    syncToGitHub();
  }, DEBOUNCE_MS);
}

// Start watching
console.log(`Starting Git Live Watcher in: ${WATCH_DIR}`);
console.log(`Changes will be auto-pushed to GitHub after ${DEBOUNCE_MS / 1000} seconds of inactivity.`);

fs.watch(WATCH_DIR, { recursive: true }, handleFileChange);
