const fs = require('fs');
let css = fs.readFileSync('assets/minecraft.css', 'utf8');
css = css.replace(/background:\s*rgba\(14,\s*20,\s*30,\s*0\.7\);/g, 'background: var(--card-bg);');
css = css.replace(/background:\s*linear-gradient\(180deg,\s*rgba\(22,\s*30,\s*45,\s*0\.9\),\s*rgba\(15,\s*22,\s*35,\s*0\.85\)\);/g, 'background: var(--card-bg-gradient);');
fs.writeFileSync('assets/minecraft.css', css);

