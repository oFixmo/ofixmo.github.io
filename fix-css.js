const fs = require('fs');

['assets/index.css', 'assets/minecraft.css'].forEach(f => {
    let css = fs.readFileSync(f, 'utf8');

    // Fix showcase z-index in both files
    css = css.replace(/\.showcase-main::before \{[\s\S]*?background: var\(--bg\);\n      \}/g, `.showcase-main::before {
        content: "";
        position: absolute;
        inset: 18% auto auto 14%;
        width: 280px;
        height: 280px;
        border-radius: 50%;
        background: var(--bg);
        z-index: 0;
      }`);
      
    css = css.replace(/\.showcase-main h3 \{/g, `.showcase-main h3 {
        position: relative; z-index: 1;`);
        
    css = css.replace(/\.showcase-main p \{/g, `.showcase-main p {
        position: relative; z-index: 1;`);
        
    css = css.replace(/\.showcase-main \.metric-row \{/g, `.showcase-main .metric-row {
        position: relative; z-index: 1;`);
        
    // Add light mode variables
    if (!css.includes('.theme-light {')) {
        css = css.replace(':root {', `:root {
        --bg: #050505;
        --bg-2: #0a0a0a;
        --panel: rgba(255, 255, 255, 0.03);
        --line: rgba(255, 255, 255, 0.08);
        --muted: #888;
        --text: #f8f8f8;
        --accent: #fff;
        --accent-2: #aaa;
      }
      
      .theme-light {
        --bg: #f8f8f8;
        --bg-2: #efefef;
        --panel: rgba(0, 0, 0, 0.03);
        --line: rgba(0, 0, 0, 0.12);
        --muted: #555;
        --text: #050505;
        --accent: #000;
        --accent-2: #333;
      }
      
      /* old root */ :root_disabled {`);
    }

    fs.writeFileSync(f, css);
});

