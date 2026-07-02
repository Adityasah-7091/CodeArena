import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src = path.join(__dirname, 'node_modules', 'monaco-editor', 'min', 'vs');
const dest = path.join(__dirname, 'public', 'vs');

function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    let entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

if (fs.existsSync(src)) {
    try {
        copyDir(src, dest);
        console.log('Monaco assets copied successfully to public/vs');
    } catch (err) {
        console.error('Failed to copy Monaco assets:', err);
    }
} else {
    console.error('Source monaco-editor directory not found! Make sure you ran npm install.');
}
