const fs = require('fs');

let js = fs.readFileSync('assets/mosaic-lens.js', 'utf8');

// Modify boot function to observe theme changes
const bootScript = `
  /* ── boot ── */
  function boot() {
    var canvas = document.getElementById('mosaic-lens')
    if (!canvas) return
    var root = canvas.parentElement
    
    var opts = {
      color1: [0.4, 0.4, 0.4],
      color2: [0.15, 0.15, 0.15],
      background: [0.02, 0.02, 0.02],
      speed: 1.0,
      size:  1.53,
      angle: 0.0,
      tile:  10,
      hover: 0.88,
      reach: 279,
    };
    
    init(canvas, root, opts);
    
    function updateTheme() {
        if (document.body.classList.contains('theme-light')) {
            // Brown + light
            opts.color1[0] = 0.8; opts.color1[1] = 0.7; opts.color1[2] = 0.6; // Light Brown/Tan
            opts.color2[0] = 0.9; opts.color2[1] = 0.85; opts.color2[2] = 0.8; // Very Light Brown
            opts.background[0] = 0.97; opts.background[1] = 0.97; opts.background[2] = 0.97; // Light bg
        } else {
            // Dark (current brown + black)
            opts.color1[0] = 0.4; opts.color1[1] = 0.35; opts.color1[2] = 0.3; // Darker brown
            opts.color2[0] = 0.15; opts.color2[1] = 0.15; opts.color2[2] = 0.15; // Blackish
            opts.background[0] = 0.02; opts.background[1] = 0.02; opts.background[2] = 0.02; // Dark bg
        }
    }
    
    // Initial update and observe class changes on body
    updateTheme();
    var observer = new MutationObserver(updateTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') {`;

js = js.replace(/\/\* ── boot ── \*\/[\s\S]*?if \(document\.readyState === 'loading'\) \{/, bootScript);

// Also we need to modify init() to read from opts array directly on every frame so it picks up mutations
js = js.replace(/gl\.uniform3f\(uf\.uC1,\s*c1\[0\],\s*c1\[1\],\s*c1\[2\]\)/g, "gl.uniform3f(uf.uC1, opts.color1[0], opts.color1[1], opts.color1[2])");
js = js.replace(/gl\.uniform3f\(uf\.uC2,\s*c2\[0\],\s*c2\[1\],\s*c2\[2\]\)/g, "gl.uniform3f(uf.uC2, opts.color2[0], opts.color2[1], opts.color2[2])");
js = js.replace(/gl\.uniform3f\(un\.uBg,\s*bg\[0\],\s*bg\[1\],\s*bg\[2\]\)/g, "gl.uniform3f(un.uBg, opts.background[0], opts.background[1], opts.background[2])");
// Fix paper calculation inside render loop to use opts.background
js = js.replace(/var bgLum = 0\.2126 \* bg\[0\] \+ 0\.7152 \* bg\[1\] \+ 0\.0722 \* bg\[2\]/g, "var bgLum = 0.2126 * opts.background[0] + 0.7152 * opts.background[1] + 0.0722 * opts.background[2]");


fs.writeFileSync('assets/mosaic-lens.js', js);

