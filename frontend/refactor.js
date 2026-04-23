const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'src', 'services');

fs.readdir(dirPath, (err, files) => {
    if (err) throw err;

    files.forEach(file => {
        if (!file.endsWith('.js') || file === 'apiClient.js') return;

        const filePath = path.join(dirPath, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Check if fetch is used
        if (content.includes('fetch(') || content.includes(' fetch(') || content.includes(' await fetch')) {
            // Replace fetch with apiClient
            content = content.replace(/\bfetch\(/g, 'apiClient(');
            
            // Add import if not present
            if (!content.includes('import apiClient')) {
                // Find first non-empty line or put it at top
                content = `import apiClient from './apiClient';\n${content}`;
            }

            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Refactored: ${file}`);
        }
    });
});
