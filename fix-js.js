const fs = require('fs');

['assets/index.js', 'assets/minecraft.js'].forEach(f => {
    if (fs.existsSync(f)) {
        let js = fs.readFileSync(f, 'utf8');
        
        js = js.replace(/if \(savedTheme !== 'dark'\) \{\n\s*localStorage\.setItem\('fixmo-theme', 'light'\);\n\s*\}/g, 
        `if (!savedTheme) {
          localStorage.setItem('fixmo-theme', 'dark');
        }`);
        
        fs.writeFileSync(f, js);
    }
});

