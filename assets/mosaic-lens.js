/* MosaicLens — Originkit (vanilla JS port, portfolio colour palette) */
;(function () {
  'use strict'

  var MAX_DPR = 2
  var LAYERS  = 74
  var GAIN    = 0.54
  var TIERS   = 4

  var VERT_SRC = [
    '#version 300 es',
    'const vec2 P[3]=vec2[3](vec2(-1.0,-1.0),vec2(3.0,-1.0),vec2(-1.0,3.0));',
    'void main(){gl_Position=vec4(P[gl_VertexID],0.0,1.0);}',
  ].join('\n')

  var FIELD_SRC = [
    '#version 300 es',
    'precision highp float;',
    'uniform vec2  uRes;',
    'uniform float uTime;',
    'uniform vec3  uC1;',
    'uniform vec3  uC2;',
    'uniform float uSize;',
    'uniform float uAngle;',
    'out vec4 o;',
    'const float LAYERS    = ' + LAYERS.toFixed(1)  + ';',
    'const float GAIN      = ' + GAIN.toFixed(3)    + ';',
    'const vec2  CENTRE    = vec2(-0.25,-0.56);',
    'const float TILT      = -2.2;',
    'const float ZOOM      = 1.05;',
    'const float THETA     = 2.12;',
    'const float SHEAR     = 0.956;',
    'const float SHRINK    = 0.949;',
    'const vec2  WARP_FREQ = vec2(0.58,2.8);',
    'const vec2  WARP_AMP  = vec2(0.16,0.034);',
    'const vec2  ASPECT    = vec2(1.65,0.22);',
    'const float OFFSET    = 0.31;',
    'const float GLOW      = 0.0021;',
    'const float SOFT      = 0.0019;',
    'const float FALLOFF   = 0.37;',
    'const float PHASE     = 64.0;',
    'const float CYCLE     = 0.16;',
    'const float HUE_TRAVEL= 2.0;',
    'mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,s,-s,c);}',
    'void main(){',
    '  vec2 R=uRes;',
    '  vec2 pos=(gl_FragCoord.xy-0.5*R)/R.y;',
    '  pos=rot(uAngle)*pos/uSize;',
    '  float t=uTime*0.49+PHASE;',
    '  float breath=(-sin(uTime*0.735)+sin(uTime*0.49+1.0))*0.25+0.5;',
    '  vec2 u=rot(TILT)*((pos-CENTRE)*(ZOOM-breath*0.085));',
    '  mat2 fold=mat2(cos(THETA),sin(THETA),-SHEAR,cos(THETA));',
    '  vec3 col=vec3(0.0);',
    '  for(float i=1.0;i<=LAYERS;i+=1.0){',
    '    u.x-=sin(u.y*WARP_FREQ.x+t+i*0.007)*WARP_AMP.x;',
    '    u.y-=sin(u.x*WARP_FREQ.y-t+i*0.02)*WARP_AMP.y;',
    '    u=fold*u*SHRINK;',
    '    vec2 q=(u-vec2(OFFSET+breath*0.1,0.0))*ASPECT;',
    '    float g=GLOW/(dot(q,q)+SOFT)*(0.25+breath*0.4);',
    '    float r=length(u);',
    '    float k=sin(i*CYCLE+t*1.2+r*HUE_TRAVEL)*0.5+0.5;',
    '    col+=g*mix(uC1,uC2,k)*(0.62+0.5*k)*exp2(-r*FALLOFF);',
    '  }',
    '  vec3 x=max(col*GAIN,0.0);',
    '  col=(x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14);',
    '  col=pow(clamp(col,0.0,1.0),vec3(0.85,0.92,0.98));',
    '  col*=1.0-smoothstep(0.5,1.6,length(pos))*0.07;',
    '  o=vec4(col,1.0);',
    '}',
  ].join('\n')

  var FINISH_SRC = [
    '#version 300 es',
    'precision highp float;',
    'uniform sampler2D uField;',
    'uniform vec2  uRes;',
    'uniform float uTime;',
    'uniform vec3  uBg;',
    'uniform float uPaper;',
    'uniform vec2  uMouse;',
    'uniform float uOn;',
    'uniform float uReach;',
    'uniform float uTile;',
    'out vec4 o;',
    'const float TIERS=' + TIERS.toFixed(1) + ';',
    'float ign(vec2 p,float f){p+=5.588238*mod(f,64.0);return fract(52.9829189*fract(0.06711056*p.x+0.00583715*p.y));}',
    'vec3 scene(vec2 uv){return texture(uField,clamp(uv,0.0,1.0)).rgb;}',
    'vec3 mosaic(vec2 frag,vec2 uv){',
    '  float base=uTile;',
    '  float tier=0.0;',
    '  if(uOn>1e-4){',
    '    vec2 cc=(floor(frag/base)+0.5)*base;',
    '    vec2 d=(cc-uMouse)/uReach;',
    '    float w=uOn*exp(-dot(d,d));',
    '    tier=floor(min(w*(TIERS+1.0),TIERS));',
    '  }',
    '  if(tier>=TIERS)return scene(uv);',
    '  float cell=base/exp2(tier);',
    '  vec2 c=(floor(frag/cell)+0.5)*cell;',
    '  vec3 s=scene((c+cell*vec2(-0.25,-0.25))/uRes)+scene((c+cell*vec2(0.25,-0.25))/uRes)',
    '        +scene((c+cell*vec2(-0.25,0.25))/uRes)+scene((c+cell*vec2(0.25,0.25))/uRes);',
    '  return s*0.25;',
    '}',
    'void main(){',
    '  vec2 frag=gl_FragCoord.xy;',
    '  vec3 L=max(mosaic(frag,frag/uRes),0.0);',
    '  vec3 dark=uBg+L*(1.0-uBg);',
    '  float strength=clamp(max(L.r,max(L.g,L.b)),0.0,1.0);',
    '  vec3 paper=uBg*(1.0-strength)+L*0.96;',
    '  vec3 col=mix(dark,paper,uPaper);',
    '  col+=(ign(frag,floor(uTime*24.0))-0.5)/255.0;',
    '  o=vec4(clamp(col,0.0,1.0),1.0);',
    '}',
  ].join('\n')

  /* ── helpers ── */
  function clampN(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v }

  function makeShader(gl, type, src, label) {
    var sh = gl.createShader(type)
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error('MosaicLens ' + label + ':', gl.getShaderInfoLog(sh))
      gl.deleteShader(sh)
      return null
    }
    return sh
  }

  function linkProgram(gl, fragSrc, label) {
    var vs = makeShader(gl, gl.VERTEX_SHADER,   VERT_SRC, label + '-vert')
    var fs = makeShader(gl, gl.FRAGMENT_SHADER, fragSrc,  label + '-frag')
    if (!vs || !fs) return null
    var prog = gl.createProgram()
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('MosaicLens ' + label + ' link:', gl.getProgramInfoLog(prog))
      gl.deleteProgram(prog)
      return null
    }
    return prog
  }

  function getUniforms(gl, prog, names) {
    var out = {}
    for (var i = 0; i < names.length; i++) out[names[i]] = gl.getUniformLocation(prog, names[i])
    return out
  }

  function createTarget(gl) {
    var fbo = gl.createFramebuffer()
    var tex = null, w = 0, h = 0
    var half = !!gl.getExtension('EXT_color_buffer_float')
    return {
      fbo: fbo,
      texture: function () { return tex },
      width:   function () { return w },
      height:  function () { return h },
      resize: function (nw, nh) {
        if (nw === w && nh === h && tex) return
        for (var attempt = 0; attempt < 2; attempt++) {
          if (tex) gl.deleteTexture(tex)
          tex = gl.createTexture()
          gl.bindTexture(gl.TEXTURE_2D, tex)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
          var fmt  = half ? gl.RGBA16F      : gl.RGBA8
          var type = half ? gl.HALF_FLOAT   : gl.UNSIGNED_BYTE
          gl.texImage2D(gl.TEXTURE_2D, 0, fmt, nw, nh, 0, gl.RGBA, type, null)
          gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
          var ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE
          gl.bindFramebuffer(gl.FRAMEBUFFER, null)
          if (ok || !half) break
          half = false
        }
        w = nw; h = nh
      },
      dispose: function () {
        if (tex) gl.deleteTexture(tex)
        gl.deleteFramebuffer(fbo)
      }
    }
  }

  /* ── init ── */
  function init(canvas, root, opts) {
    /* Portfolio palette:
       color1 = white    (#edf3ff → near-white text colour)
       color2 = sky-blue (#7dd3fc → --accent-2)
       bg     = dark     (#070b14 → --bg)                  */
    var c1  = opts.color1     || [0.929, 0.953, 1.000]   // #edf3ff
    var c2  = opts.color2     || [0.490, 0.827, 0.988]   // #7dd3fc
    var bg  = opts.background || [0.027, 0.043, 0.078]   // #070b14
    var spd = opts.speed      !== undefined ? opts.speed  : 1.0
    var sz  = opts.size       !== undefined ? opts.size   : 1.53
    var ang = opts.angle      !== undefined ? opts.angle  : 0.0
    var til = opts.tile       !== undefined ? opts.tile   : 10
    var hov = opts.hover      !== undefined ? opts.hover  : 0.88
    var rch = opts.reach      !== undefined ? opts.reach  : 279

    var gl = canvas.getContext('webgl2', {
      antialias: false, alpha: false, depth: false, stencil: false,
    })
    if (!gl) { console.warn('MosaicLens: WebGL2 not available'); return null }

    var fieldProg  = linkProgram(gl, FIELD_SRC,  'field')
    var finishProg = linkProgram(gl, FINISH_SRC, 'finish')
    if (!fieldProg || !finishProg) return null

    var uf = getUniforms(gl, fieldProg,  ['uRes','uTime','uC1','uC2','uSize','uAngle'])
    var un = getUniforms(gl, finishProg, ['uField','uRes','uTime','uBg','uPaper','uMouse','uOn','uReach','uTile'])
    var vao    = gl.createVertexArray()
    gl.bindVertexArray(vao)
    var target = createTarget(gl)

    var mx = 0, my = 0, on = 0
    var ptrX = 0, ptrY = 0, ptrInside = false
    var raf = 0, last = -1, clock = 0

    function readPtr(e) {
      var r = root.getBoundingClientRect()
      var sx = root.offsetWidth  / (r.width  || 1)
      var sy = root.offsetHeight / (r.height || 1)
      ptrX = (e.clientX - r.left) * sx
      ptrY = (e.clientY - r.top)  * sy
      ptrInside = e.clientX >= r.left && e.clientX <= r.right &&
                  e.clientY >= r.top  && e.clientY <= r.bottom
    }
    function ptrOut(e) { if (!e.relatedTarget) ptrInside = false }
    window.addEventListener('pointermove',  readPtr, { passive: true })
    window.addEventListener('pointerdown',  readPtr, { passive: true })
    document.addEventListener('pointerout', ptrOut)

    function render(now) {
      raf = requestAnimationFrame(render)
      var dt = last < 0 ? 0 : clampN((now - last) / 1000, 0, 0.05)
      last  = now
      clock = (clock + dt * spd) % 3600

      var dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      var cw = canvas.clientWidth  || 1
      var ch = canvas.clientHeight || 1
      var bw = Math.max(1, Math.round(cw * dpr))
      var bh = Math.max(1, Math.round(ch * dpr))
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width  = bw
        canvas.height = bh
      }
      target.resize(Math.max(1, Math.round(bw / 2)), Math.max(1, Math.round(bh / 2)))

      var present = ptrInside ? 1 : 0
      if (present && on < 0.02) { mx = ptrX; my = ptrY }
      on += (present - on) * (1 - Math.exp(-dt * 5))
      var k = 1 - Math.exp(-dt * 16)
      mx += (ptrX - mx) * k
      my += (ptrY - my) * k

      var bgLum = 0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2]
      var sx = bw / cw, sy = bh / ch

      /* field pass (half-res) */
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo)
      gl.viewport(0, 0, target.width(), target.height())
      gl.useProgram(fieldProg)
      gl.uniform2f(uf.uRes,   target.width(), target.height())
      gl.uniform1f(uf.uTime,  clock)
      gl.uniform3f(uf.uC1,    c1[0], c1[1], c1[2])
      gl.uniform3f(uf.uC2,    c2[0], c2[1], c2[2])
      gl.uniform1f(uf.uSize,  sz)
      gl.uniform1f(uf.uAngle, ang)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      /* finish pass (full-res + mosaic) */
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, bw, bh)
      gl.useProgram(finishProg)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, target.texture())
      gl.uniform1i(un.uField,  0)
      gl.uniform2f(un.uRes,    bw, bh)
      gl.uniform1f(un.uTime,   clock)
      gl.uniform3f(un.uBg,     bg[0], bg[1], bg[2])
      gl.uniform1f(un.uPaper,  clampN((bgLum - 0.35) / 0.3, 0, 1))
      gl.uniform2f(un.uMouse,  mx * sx, bh - my * sy)
      gl.uniform1f(un.uOn,     on * hov)
      gl.uniform1f(un.uReach,  rch * sy)
      gl.uniform1f(un.uTile,   Math.max(1, Math.round(til * dpr)))
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    raf = requestAnimationFrame(render)

    return function dispose() {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove',  readPtr)
      window.removeEventListener('pointerdown',  readPtr)
      document.removeEventListener('pointerout', ptrOut)
      target.dispose()
      gl.deleteVertexArray(vao)
      gl.deleteProgram(fieldProg)
      gl.deleteProgram(finishProg)
    }
  }

  /* ── boot ── */
  function boot() {
    var canvas = document.getElementById('mosaic-lens')
    if (!canvas) return
    var root = canvas.parentElement
    init(canvas, root, {
      /* white → sky-blue flow on dark portfolio background */
      color1:     [0.929, 0.953, 1.000],  /* #edf3ff  --text near-white  */
      color2:     [0.490, 0.827, 0.988],  /* #7dd3fc  --accent-2 sky     */
      background: [0.027, 0.043, 0.078],  /* #070b14  --bg dark          */
      speed: 1.0,
      size:  1.53,
      angle: 0.0,
      tile:  10,
      hover: 0.88,
      reach: 279,
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
