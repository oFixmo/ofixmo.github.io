const fs = require('fs');

const replacements = {
    'â€”': '—', // Em dash
    'â€“': '–', // En dash
    'â€™': '’', // Right single quote (apostrophe)
    'â€¢': '•', // Bullet
    'Â·': '·', // Middle dot
    'Ã—': '×'
};

function fixFile(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    for (const [bad, good] of Object.entries(replacements)) {
        if (content.includes(bad)) {
            content = content.split(bad).join(good);
            changed = true;
        }
    }
    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed ' + file);
    }
}

['index.html', 'minecraft.html', 'assets/index.css', 'assets/minecraft.css', 'assets/mosaic-lens.js'].forEach(fixFile);
