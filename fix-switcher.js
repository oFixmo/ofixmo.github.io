const fs = require('fs');

['index.html', 'minecraft.html'].forEach(f => {
    let html = fs.readFileSync(f, 'utf8');
    
    if (f === 'index.html') {
        html = html.replace(/<div class="page-switcher"[\s\S]*?<\/div>/g, 
        `<div class="page-switcher" aria-label="Page switcher" style="gap: 12px; margin-top: 32px; display: flex;">
              <a class="btn primary hover-target" href="index.html">Developer</a>
              <a class="btn hover-target" href="minecraft.html">Minecraft</a>
            </div>`);
    } else {
        html = html.replace(/<div class="page-switcher"[\s\S]*?<\/div>/g, 
        `<div class="page-switcher" aria-label="Page switcher" style="gap: 12px; margin-top: 32px; display: flex;">
              <a class="btn hover-target" href="index.html">Developer</a>
              <a class="btn primary hover-target" href="minecraft.html">Minecraft</a>
            </div>`);
    }

    fs.writeFileSync(f, html);
});

// Remove old page-switcher css that adds the dot
['assets/index.css', 'assets/minecraft.css'].forEach(f => {
    let css = fs.readFileSync(f, 'utf8');
    
    css = css.replace(/\.page-switcher a \{[\s\S]*?pointer-events: none;\n      \}/g, '');
    
    fs.writeFileSync(f, css);
});

