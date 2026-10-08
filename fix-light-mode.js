const fs = require('fs');

['assets/index.css', 'assets/minecraft.css'].forEach(f => {
    if (!fs.existsSync(f)) return;
    let css = fs.readFileSync(f, 'utf8');

    // 1. Replace the root and theme-light completely to include new variables
    css = css.replace(/:root \{[\s\S]*?\.theme-light \{[\s\S]*?\}\n\s*\/\* old root \*\/ :root_disabled \{/g, `:root {
        --bg: #050505;
        --bg-2: #0a0a0a;
        --panel: rgba(255, 255, 255, 0.03);
        --line: rgba(255, 255, 255, 0.08);
        --muted: #888;
        --text: #f8f8f8;
        --accent: #fff;
        --accent-2: #aaa;

        --card-bg: rgba(13, 18, 28, 0.6);
        --card-bg-gradient: linear-gradient(180deg, rgba(18, 26, 42, 0.6), rgba(13, 18, 28, 0.7));
        --card-alt: rgba(15, 22, 34, 0.6);
        --card-metric: rgba(9, 13, 20, 0.5);
        --card-project: rgba(14, 20, 30, 0.6);
        --card-process: linear-gradient(180deg, rgba(16, 22, 34, 0.6), rgba(12, 16, 25, 0.7));
        --tag-bg: rgba(12, 18, 28, 0.6);
        --chip-bg: rgba(255, 255, 255, 0.06);
      }

      .theme-light {
        --bg: #f5f5f7;
        --bg-2: #ffffff;
        --panel: rgba(255, 255, 255, 0.7);
        --line: rgba(0, 0, 0, 0.08);
        --muted: #666;
        --text: #111;
        --accent: #000;
        --accent-2: #444;

        --card-bg: rgba(255, 255, 255, 0.7);
        --card-bg-gradient: linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(245, 245, 247, 0.9));
        --card-alt: rgba(255, 255, 255, 0.7);
        --card-metric: rgba(255, 255, 255, 0.6);
        --card-project: rgba(255, 255, 255, 0.8);
        --card-process: linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(245, 245, 247, 0.9));
        --tag-bg: rgba(0, 0, 0, 0.04);
        --chip-bg: rgba(0, 0, 0, 0.06);
      }
      
      /* disabled root */ :root_disabled {`);

    // 2. Replace hardcoded background colors in CSS with the new CSS variables
    css = css.replace(/background:\s*linear-gradient\(180deg,\s*rgba\(18,\s*26,\s*42,\s*0\.86\),\s*rgba\(13,\s*18,\s*28,\s*0\.9\)\);/g, 'background: var(--card-bg-gradient);');
    css = css.replace(/background:\s*rgba\(13,\s*18,\s*28,\s*0\.8\);/g, 'background: var(--card-bg);');
    css = css.replace(/background:\s*rgba\(9,\s*13,\s*20,\s*0\.55\);/g, 'background: var(--card-metric);');
    css = css.replace(/background:\s*rgba\(15,\s*22,\s*34,\s*0\.82\);/g, 'background: var(--card-alt);');
    css = css.replace(/background:\s*rgba\(14,\s*20,\s*30,\s*0\.8\);/g, 'background: var(--card-project);');
    css = css.replace(/background:\s*linear-gradient\(180deg,\s*rgba\(16,\s*22,\s*34,\s*0\.78\),\s*rgba\(12,\s*16,\s*25,\s*0\.8\)\);/g, 'background: var(--card-process);');
    css = css.replace(/background:\s*rgba\(12,\s*18,\s*28,\s*0\.8\);/g, 'background: var(--tag-bg);');
    
    // Chips/tags text color fix for light mode
    css = css.replace(/color:\s*#d5dbee;/g, 'color: var(--text);');
    css = css.replace(/color:\s*#e4ebf7;/g, 'color: var(--text);');
    
    // Other hardcoded text colors that don't adapt
    css = css.replace(/color:\s*#d9c9ff;/g, 'color: var(--accent-2);');
    css = css.replace(/color:\s*#d6c5ff;/g, 'color: var(--accent-2);');
    css = css.replace(/color:\s*#c4b5fd;/g, 'color: var(--accent-2);');

    // Button colors (glassy) need to be adaptive
    // For .btn, .btn-premium
    css = css.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.05\);/g, 'background: var(--chip-bg);');
    css = css.replace(/border:\s*1px\s*solid\s*rgba\(255,255,255,0\.1\);/g, 'border: 1px solid var(--line);');
    css = css.replace(/color:\s*#fff;/g, 'color: var(--text);');
    
    fs.writeFileSync(f, css);
});

// 3. Fix WebGL light mode background colors
let webgl = fs.readFileSync('assets/mosaic-lens.js', 'utf8');
webgl = webgl.replace(/if \(document\.body\.classList\.contains\('theme-light'\)\) \{[\s\S]*?\} else \{/, 
`if (document.body.classList.contains('theme-light')) {
            // Premium light silver / white
            opts.color1[0] = 0.98; opts.color1[1] = 0.98; opts.color1[2] = 0.99; // Pure whiteish
            opts.color2[0] = 0.85; opts.color2[1] = 0.86; opts.color2[2] = 0.88; // Silver/Grey
            opts.background[0] = 0.96; opts.background[1] = 0.96; opts.background[2] = 0.97; // Light grey-blue
        } else {`);
fs.writeFileSync('assets/mosaic-lens.js', webgl);

