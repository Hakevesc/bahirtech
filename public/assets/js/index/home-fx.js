/* extracted from legacy/index.html — do not hand-edit; re-run npm run prepare:static */
window.HeroFX = (function(){
  var stage  = document.getElementById('stage');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var S = {
    reduce: !!reduce,
    px:0, py:0,     // raw pointer, -1..1 across the hero box
    x:0,  y:0,      // smoothed pointer
    over:false,     // pointer inside the hero box
    scroll:0,       // 0..1 across the hero stage height
    vel:0,          // decaying scroll velocity
    active:true     // hero on screen AND tab visible
  };
  if (!stage) return S;

  var lastY = window.pageYOffset, onScreen = true;

  function pointer(e){
    var r = stage.getBoundingClientRect();
    S.px = ((e.clientX - r.left) / r.width)  * 2 - 1;
    S.py = ((e.clientY - r.top)  / r.height) * 2 - 1;
    S.over = e.clientX >= r.left && e.clientX <= r.right &&
             e.clientY >= r.top  && e.clientY <= r.bottom;
  }
  window.addEventListener('pointermove', pointer, {passive:true});
  window.addEventListener('pointerdown', pointer, {passive:true});
  document.addEventListener('pointerleave', function(){ S.over = false; S.px = 0; S.py = 0; }, {passive:true});

  /* The stage is full-bleed again, so the scroll response is back on: it drives the
     globe's lift/shrink/tilt and the camera pull-back as the hero leaves. Those are all
     in-scene transforms, so nothing can expose an edge of the stage. */
  function scrolled(){
    var h = stage.offsetHeight || window.innerHeight;
    var y = window.pageYOffset;
    S.scroll = Math.max(0, Math.min(1, y / h));
    S.vel += (y - lastY) * 0.5;
    lastY = y;
  }
  window.addEventListener('scroll', scrolled, {passive:true});
  window.addEventListener('resize', scrolled, {passive:true});
  scrolled();

  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(e){ onScreen = e[0].isIntersecting; }, {threshold:0}).observe(stage);
  }

  /* The hero is pinned now, so its stage never stops intersecting and the observer
     above would keep all three WebGL loops running for the entire page. Once the next
     section's top reaches the viewport top the hero is completely hidden, so treat it
     as inactive from there on. */
  var cover = document.querySelector('.serve');
  function covered(){ return !!cover && window.pageYOffset >= cover.offsetTop; }

  (function loop(){
    requestAnimationFrame(loop);
    S.active = onScreen && !document.hidden && !covered();
    var k = S.reduce ? 1 : 0.065;
    S.x += (S.px - S.x) * k;
    S.y += (S.py - S.y) * k;
    S.vel *= 0.90;
    if (!S.active) return;
  })();

  return S;
})();

/* extracted from legacy/index.html — do not hand-edit; re-run npm run prepare:static */
(function(){
  var FX     = window.HeroFX;
  var canvas = document.getElementById('gl');
  var stage  = document.getElementById('stage');
  if (!canvas || !stage || !window.THREE) return;

  var W = stage.clientWidth, H = stage.clientHeight;

  var renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true, alpha:true, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W, H);

  var scene  = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(42, W/H, 0.1, 200);
  camera.position.set(0, 0.4, 11);

  function softDot(color, size, hardness){
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
    g.addColorStop(0, color); g.addColorStop(hardness, color); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,size,size);
    return new THREE.CanvasTexture(c);
  }

  /* ---------------- starfield (twinkles, parallaxes with the pointer) ---------------- */
  /* The mix used to be half lemon, and in a small panel that much saturated yellow is
     what read as "too colourful". Mostly pale now, with green as the occasional spark. */
  var STARS = 700;
  var sPos = [], sCol = [], sPhase = [], sSize = [];
  var cLemon = new THREE.Color(0xCFDE5D), cGreen = new THREE.Color(0xAAC638), cPale = new THREE.Color(0xE8ECFF);
  for (var i = 0; i < STARS; i++){
    sPos.push((Math.random()-0.5)*30, (Math.random()-0.5)*14, (Math.random()-0.5)*16 - 2);
    var r = Math.random();
    var c = r < 0.72 ? cPale : (r < 0.93 ? cGreen : cLemon);
    sCol.push(c.r, c.g, c.b);
    sPhase.push(Math.random());
    sSize.push(0.5 + Math.random()*1.6);
  }
  var starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sPos,3));
  starGeo.setAttribute('aCol',   new THREE.Float32BufferAttribute(sCol,3));
  starGeo.setAttribute('aPhase', new THREE.Float32BufferAttribute(sPhase,1));
  starGeo.setAttribute('aSize',  new THREE.Float32BufferAttribute(sSize,1));

  var starUni = { time:{value:0}, uPix:{value:renderer.getPixelRatio()} };
  var stars = new THREE.Points(starGeo, new THREE.ShaderMaterial({
    uniforms: starUni, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
    vertexShader: [
      'attribute vec3 aCol; attribute float aPhase; attribute float aSize;',
      'uniform float time; uniform float uPix;',
      'varying vec3 vCol; varying float vTw;',
      'void main(){',
      '  vCol = aCol;',
      '  vTw = 0.45 + 0.55*sin(time*1.4 + aPhase*6.2831);',
      '  vec4 mv = modelViewMatrix*vec4(position,1.0);',
      '  gl_PointSize = aSize*uPix*(46.0/max(0.001,-mv.z));',
      '  gl_Position = projectionMatrix*mv;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'varying vec3 vCol; varying float vTw;',
      'void main(){',
      '  float d = length(gl_PointCoord-vec2(0.5));',
      '  if(d>0.5) discard;',
      '  float a = smoothstep(0.5,0.0,d);',
      '  gl_FragColor = vec4(vCol*(0.55+0.85*vTw), a*(0.35+0.6*vTw));',
      '}'
    ].join('\n')
  }));
  scene.add(stars);

  /* ---------------- ocean: waves + cursor bulge + click/move ripples ---------------- */
  var MAXR = 8;
  var ripples = [];
  for (var ri = 0; ri < MAXR; ri++) ripples.push(new THREE.Vector3(0,0,-999));

  var oceanUni = {
    time:      {value:0},
    uMouse:    {value:new THREE.Vector2(0,0)},
    uMouseAmp: {value:0},
    uRipples:  {value:ripples},
    uScroll:   {value:0}
  };

  var oceanMat = new THREE.ShaderMaterial({
    // normal (not additive) blending — additive is what let the globe's lime halo
    // pile up on the water and read as a reflection
    uniforms: oceanUni, wireframe:true, transparent:true, blending:THREE.NormalBlending,
    vertexShader: [
      'uniform float time; uniform vec2 uMouse; uniform float uMouseAmp;',
      'uniform vec3 uRipples[8]; uniform float uScroll;',
      'varying float vH; varying float vRip;',
      'void main(){',
      '  vec3 pos = position;',
      '  float amp = 1.0 + uScroll*0.9;',
      // swell speeds roughly halved — same wave shapes, calmer water
      '  float w1 = sin(pos.x*0.60 + time*0.28)*0.22;',
      '  float w2 = sin(pos.y*0.90 + time*0.42)*0.12;',
      '  float w3 = sin((pos.x+pos.y)*0.35 + time*0.18)*0.15;',
      '  float w4 = sin(pos.x*1.70 - time*0.60)*0.05;',
      '  pos.z += (w1+w2+w3+w4)*amp;',
      // soft swell that follows the cursor — gentler and slower than the ambient waves
      '  float dm = distance(pos.xy, uMouse);',
      '  pos.z += uMouseAmp*0.34*exp(-dm*dm*0.06)*(0.6+0.4*sin(time*0.85 - dm*1.2));',
      // expanding ring ripples
      '  float rip = 0.0;',
      '  for(int i=0;i<8;i++){',
      '    vec3 r = uRipples[i];',
      '    float age = time - r.z;',
      // ripples spread at ~45% of the old speed, so the window they live in is widened to match
      '    if(r.z > 0.0 && age > 0.0 && age < 9.0){',
      '      float d = distance(pos.xy, r.xy);',
      '      float front = age*1.5;',
      '      float band = exp(-(d-front)*(d-front)*0.55);',
      '      rip += sin((d-front)*2.4)*band*exp(-age*0.38)*0.62;',
      '    }',
      '  }',
      '  pos.z += rip;',
      '  vH = pos.z; vRip = abs(rip);',
      '  gl_Position = projectionMatrix*modelViewMatrix*vec4(pos,1.0);',
      '}'
    ].join('\n'),
    fragmentShader: [
      'varying float vH; varying float vRip;',
      'void main(){',
      '  float t = clamp((vH+0.5)/1.0, 0.0, 1.0);',
      '  vec3 low  = vec3(0.09,0.12,0.32);',
      '  vec3 mid  = vec3(0.25,0.42,0.55);',
      '  vec3 high = vec3(0.42,0.56,0.49);',   // was lime (0.81,0.87,0.36) — pulled toward the blue mid tone
      '  vec3 col = mix(low, mid, smoothstep(0.0,0.55,t));',
      '  col = mix(col, high, smoothstep(0.5,1.0,t));',
      '  col += vec3(0.55,0.62,0.28)*clamp(vRip*1.3,0.0,1.0);',
      '  gl_FragColor = vec4(col, 0.5 + 0.35*t + 0.30*clamp(vRip,0.0,1.0));',
      '}'
    ].join('\n')
  });

  var ocean = new THREE.Mesh(new THREE.PlaneGeometry(34,16,140,70), oceanMat);
  ocean.rotation.x = -Math.PI/2.35;
  ocean.position.set(0,-2.78,1.5);   // lifted slightly — was -3.1
  scene.add(ocean);
  ocean.updateMatrixWorld(true);   // worldToLocal is used before the first render

  /* drifting motes just above the water */
  var motePos = [];
  for (var m = 0; m < 260; m++) motePos.push((Math.random()-0.5)*24, -3 + Math.random()*1.6, Math.random()*8 - 2);
  var moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute('position', new THREE.Float32BufferAttribute(motePos,3));
  var motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({
    size:0.05, map:softDot('rgba(170,198,56,1)',64,0.1), transparent:true,
    depthWrite:false, blending:THREE.AdditiveBlending, opacity:0.75
  }));
  scene.add(motes);

  /* ---------------- pointer -> ocean surface (math plane, no per-triangle raycast) ---- */
  var ray      = new THREE.Raycaster();
  var ndc      = new THREE.Vector2();
  var hitWorld = new THREE.Vector3();
  var oceanPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(
    new THREE.Vector3(0,0,1).applyQuaternion(ocean.quaternion), ocean.position
  );

  var T = 0;               // shader clock, shared with ripple spawning
  var lastSpawn = -1, spawnIdx = 0;

  // returns local plane coords of the pointer, or null when it misses the water
  function pointerOnWater(nx, ny){
    ndc.set(nx, -ny);
    ray.setFromCamera(ndc, camera);
    if (!ray.ray.intersectPlane(oceanPlane, hitWorld)) return null;
    var local = ocean.worldToLocal(hitWorld.clone());
    if (Math.abs(local.x) > 20 || Math.abs(local.y) > 10) return null;
    return local;
  }
  function spawnRipple(nx, ny, minGap){
    if (FX.reduce) return;
    if (T - lastSpawn < minGap) return;
    var p = pointerOnWater(nx, ny);
    if (!p) return;
    ripples[spawnIdx].set(p.x, p.y, T);
    spawnIdx = (spawnIdx + 1) % MAXR;
    lastSpawn = T;
  }
  // read the pointer off the event itself: this listener runs before the window-level
  // one in HeroFX, so FX.px/py would still hold the previous event's position
  function evNorm(e){
    var r = stage.getBoundingClientRect();
    return [((e.clientX - r.left)/r.width)*2 - 1, ((e.clientY - r.top)/r.height)*2 - 1];
  }
  stage.addEventListener('pointermove', function(e){ var n = evNorm(e); spawnRipple(n[0], n[1], 0.22); }, {passive:true});
  stage.addEventListener('pointerdown', function(e){ var n = evNorm(e); lastSpawn = -1; spawnRipple(n[0], n[1], 0); }, {passive:true});

  function onResize(){
    W = stage.clientWidth; H = stage.clientHeight;
    camera.aspect = W/H;
    camera.updateProjectionMatrix();
    renderer.setSize(W,H);
  }
  window.addEventListener('resize', onResize);

  var clock = new THREE.Clock();
  var mrot = 0;
  (function animate(){
    requestAnimationFrame(animate);
    if (!FX.active) return;

    T = clock.getElapsedTime();
    var p = FX.scroll;

    starUni.time.value  = FX.reduce ? 0 : T;
    oceanUni.time.value = FX.reduce ? 0 : T;
    oceanUni.uScroll.value += (p - oceanUni.uScroll.value) * 0.08;

    // cursor swell follows the pointer, fades out when it leaves the hero
    var hit = FX.over ? pointerOnWater(FX.x, FX.y) : null;
    if (hit) oceanUni.uMouse.value.set(hit.x, hit.y);
    oceanUni.uMouseAmp.value += ((hit ? 1 : 0) - oceanUni.uMouseAmp.value) * 0.025;

    if (!FX.reduce){
      scene.rotation.y = FX.x * 0.075;
      scene.rotation.x = FX.y * 0.024;
      mrot = Math.sin(T*0.05)*0.05;
      motes.rotation.y = mrot;
      stars.rotation.y = T * 0.006 + FX.x * 0.03;
    }

    camera.position.x = FX.x * 0.7;
    camera.position.y = 0.4 - FX.y * 0.45 - p * 1.1;
    camera.position.z = 11 - p * 1.4;
    camera.lookAt(0, -p * 0.8, 0);

    renderer.render(scene, camera);
  })();
})();

/* extracted from legacy/index.html — do not hand-edit; re-run npm run prepare:static */
(function(){
  var FX = window.HeroFX;
  var container = document.getElementById('globeContainer');
  if (!container || !window.THREE) return;

  /* Natural Earth 110m land, Douglas-Peucker simplified to 0.08deg, quantised to a
     1/8-degree grid, zigzag-varint delta encoded over a 64-char alphabet.
     Rings are '!' separated; longitudes are unwrapped past +/-180 at the antimeridian. */
  var LAND = "m8BgFHPhBCjBATEHGmCBUMQF!sKoFdBVGTKKGeBcJEH!ujCgGUHGJCNxBJ_BFlBATGCGiBEOGmBagBCYB!sdoIWBSCHFPDVCPGEESB!oboIYFdCVEMEQD!woBiJSDSCIHnCAPEJGKCsBB!43BwJCFFLlBFTAIGlBDLEAIcISBGKASKIOCIFUb!A0CQKcFWGYFYIuBCwBLyCH8BDuBEkCBoBF2CKEG_BCxBENGrBCEIMMDIZELGZEoBAkBCYF2BMOEFIrBI9CEJGTGLGFSWF0BCOFYCqBISEYCAGFGEGWCIDsBGsBC6BMYDYEWDqBCuBB6CASGSCUDUCQGcPQGSFWBUDqBCYAsBDIGRMTAJGHSMBoBAUBQFGDWB$BISDUAOOOHSBUAMFqBBSDOGGGQFWCQDKFWCgBIgCGOEKEEIBGTYAGAGOOEGFMIIUKWKIISIQAKGYEUKOCIDFFVHLCNAVHHFBFAFIFJBPBbRBFEFKDYJQRIFEFCNKRBJRLTBRJXF9BJNFpDBGFYBSDKFRFbCVDBLSFEFUFiBBwCPwCF4BJYNUG2BK$BIoBAoCFKIWEoBAiEMaERMAG_CDDGCMGEyBIoBIOI2BGwBCwCQcKGGREGGKG0BMMGIIMESBIDUBAGIISBEFSBqBGSBGFSG2CMOEKGMDQCWNSEGGQEWAGFOG0BCkBDSJQE4BAgBEOGgBEMEIIKGQBGFODSCWJQEGGgBIiBGmBKQBYKOAOEEGMEsBGeBMDCFYJUBWJQAOCMIuBHgBAORBDBFNDNFEHSCDHNLMDSBSCOMUKMO8BGMMMGcIKGUEQAeCSAMEIKOLMB$BBKCOAMDuBESByBaWFeNgBBiBEYKSAMEMDUJSCeHUBQAYKOCeDeCcBgBGgCCEICIKFCFMLOD6CEmBBMFDFKDkBH6BHSAKGoBNmBDIFSDOFQBqCB0BHMFBFJFTRTDJDTDHFVLJLBNIFEFIDeDGF1BFdANJBHPLWDIHiBJuBJkBFIHuBBQFsBEgCJAzC_zFA!k4BiSUJYDHHPAHGDFNFRCLEPETIPIVSMBYLUFIIGMOGMBOT!48BuTMFDFVFHGNFHGUKODKG!k9DkUXAAICKMFOBABDH!2iF0YQFWGIBCTFDBNDELJNCJMBMHOAGKA!wwFyYEHMIEHAFPTHFGHNALFNZTLPAJGRABGIMUQMEYOKIIMGECIKIEF!qxF$aMRAMGDELMFMBIGIBDNDHLADFAFPVLHBGHCKMFKPGAGMGCMAKHKCEVUFMGAIHODEN!ytF$hBFDTMVSBGIAIFiBZ!mzFqkBGDDHJBHCBGGGIBEC!A4kBTHBGaKDH!ytFylBCNDCDABEAMID!gzDomBETEHBHBDFKDFELBFDDBNjBvDbJVKDIAOFOBMCKIEAEIMCMHQAQEIEKICOGIAWSEIBIGBKKAKGIINEJ!4hFkmBGLMGMNBFENCHEBENBHGLSHWNBDIJGRIEGFECCRgBbENARINBNFVAHJZLHLTDNFHDLBPJFRANHPLNGJECIHDNJvBMJKFUHGPCGIDMHLNBIICKGIBMLNJFFLLGAIJMHGCETKLANIdBlBJPAPHNDDHFFXBNCVBJHDAPJVCZMAKICEEAQAKJQBKAIFMAEHGBMHOBGGFDOGDGFAINWCKEECIBIGMCLGKOGIGMGGCGBMGKCCEEAIASGIGEIKICQKOGNICFIGIGDCMIIEIICAEIBAEQEKFKJUBDKIMIEDEIKKGIBOCBIJGICKDIFODEAKDKEGAECIHFHFFDBCFLPCDMHOFSNGAIDCFQFKGGQIWDUCMEEBGGWGGEHCJEBAHGHAN!s2E8nBHATMOCOJAD!uqFioBPCDCCGKBIH!6qFmoBBBLOBIEAGLGH!m4E$nBLDBCAGIKQGCEeGGBFDdLLL!$0E$oBGDKCEHdDHAGIIAEG!u3E$oBBHXDVCAEOEKDKAOG!$pF6oBABZSCAIBMHEF!qwE0pBeBEGeHGJYBUJRFRGfCrBKHBbGDINAKQUBUFCF!s9E8pBHJBMGKEDAH!$nFypBDAHGFKDMCCCFMNIDBF!gmFoqBHADFPHHAVKAEOBKCCICACHIAGGIGBKKAEDAHFJ!05EorBFDLCBIQAEF!o7EurBGLNGhBCEIUCSF!ymF4qBDDHQPMLEGEULMLCH!i9EusBEZSJMSUIOAYJSD6BTUPCJaJEHNBEJOJKRIAAFMBDDQFAFLADEdETSJOTIXJCLLFHERANOPCDDTAGMKEDSHOdONAXQDHFBDGAILGSGKAAEXAFKNEHIWCIGaFCF!04E2tBNPLBNCpBBBLONKGeGBHFEHJNFQTDFORALHDFGIMPFDECGLKCQLDCpBJBFEEOBQFAFMGKEMKgBOKMDUBUAQMCD!s6EytBBNHCBJGHDBFKFUEMEGCHKBCF!$uEiqBRANOTMTYTiBNMJcNKJMLKPSBIkBDOPWROPQAOLKNMFFNIDGBCJGJMAIJDTAZ!$0E$tBSPRBFJANPLAPFXBGRHFKLAHGRFFILALCBUHEHOBOCQIKMFMEEOGCUEacOKMKIMGAIHCFWJAFJACHLFHNKPBF!m5EmxBCRDPFQHHELDFRIDMEIJIFHFCLJDGIMSMGHMECIMABMOHCN!0iEkwBNDHMBYGaMJObBPFD!y7BiyBNBDCGEAGICEAAL!g4EkyBPTJMIICKICBLMQBP!o1E2xBVPIMWUIQENLHHJ!$2E$yBKDKAAHHFJDAOBI!44EizBERLEENHDAMDADKKBAGJMQAEF!42EyzBDNNUMBGD!22Eo2BKDEECDDHGJDNJFBLELIBICUJBHEDAHNIFIDFJKNBHEAGGEDEBFHKDGAQGFCaGOKA!m5Bk2BDDTABGCCOAIBCB!yzB$1BFBHCJGCEIAOBIDCDJA!21B$2BOBCCOAIDEAEFICAFIAGFFFFCNABBFBBEFBFJDCBEJERAFDJGCEaBGCFIAGJCCEKA!mxEq2BNFNEAOIISEIAEFFHDJ!oMy2BDDBCAGDGEEAEKDIHLF!myBs4BGFOCeTODADMAMHBDLBrBAKIFEJCFEDKHBPGDCVEDCGEPCLJFABDHBHCIGEGICYIaBQF!ozB84BDADIFGCKGBGLAJ!y2Es4BFLHOBKKQMMIDNjB!izBq6BPDBGSCAD!q9Ei$BCFHHHEHDDHJEAIIIKAGGMD!qrD6$BLFCDPFHCDGIAEEKAQE!8lD8$BIFYAADICBDVBAETCEI!4hDkgCFLCFBHLGfKEISBcE!0$C0hCILBVFCHFFEAUDKKBIG!wgFy_BFLCHHLTHbAXRJGAMbDTHRAQLJZLHFGEQJEHKQGIKQIMKgBGQDScKFgBWKUBSGKSCIVANNPAP!4$CiiCDLHEDKEGKGCN!$hFijCMBMGCRXDNPXKHPRABQIMQAEWGMSPMF!m6BokCKBQCHHFATGDGGEGH!k7BylCHAVENIGCUDQHCB!ocolCHBZIFENGBGPCHICEqBHOLQFGJ!$9BsmCJNKEKDFDQDGCQDDLKCIRHNFAJCCODCRNJAMIPEvBABEKGHEOKQaKIOGIALN!0XgoCQCDRONHAHIFIHEDICEGB!6hFsmCQbXEJVQPALLKJLDMCQBSEMAWHOAWQIFIGCKZAPGP!02CknCdJVEOQJQiBUOASJJJELLN!sgD6oCJNRKBGYGGH!wNypCPFHEBIWIKBIDNH!w4CqqCRRiBCDLNNQBQTMBOZSBBJHFIHPHTAbDHEJHNCLFHCYSOCZEDGQEHKCKYBCKJKTCDEGIDEJHAQHIGSMMMBUC!mH$qCJBTIQCOBAF!syBisCFHHCDEIGGAED!ixBssCTJJADGMGWAAB!kE8sCKBKCOFOBLDRGNADAAG!uvB6tCCFICuBNCHKAMDNFXEJIPHVJFKVBOICOGOMB!4yCouCDLSJTL7BNhCIQGjBIeEBEhBEMKYCYJaIUDaIaA!i0ByuCRADIIIOCMDAFBBJF!AwvCoBLqBPBJKDDKsBBgBNPHZAAPHDNALGVEDIPCRBHGEGTDIHJFTHVCOHKNIDCFDFdErBLPBtBTFHXMpBNFGPFVCDJTPAFUDDXNAFNGFbHFRXDDPXPFMP6BIWOKAIaC4BmBcMOWTAJNnBRNUnBFnBZMJ7BFCMZCTHvBEzBFxDjCaBIJODKISAYRANLPBTHXXXDL1BtBVJJAJIVLBDFAFDFFCLHDJFJDHDAFBBQJOTEJARFHPDLFNBBICMFSMCLOFEBDFBAEHEEGECBEEIACJCHEVDLHRDKIDGMKHKNFRLJJPAHHILOBAFOFSMOFKACJVDHHPHHLSHGPUZALJFEHKDHZHBXlBPTrBbRBJFFEHHVHRBDPJBDMEGVGHDTLNPDLcjBOJKNIdBbNJRJNNTNFKGKLKNCFIHQNINACMNABRNjBCLKAGPENIHKBWTGJCLBFCPGDGNAFLAhBYBIHMDMDIAMBIFGDIPQBJDKGYAMEOFICSFIHoBHMbRREEUBQNSCGHCLMDKDOHKNACFFHFCBBLCBDJATDALHJXJPTbTAHXHFBFLEhBFPAZHBHLGDPFDJHDNONmBNYFePWJ0BASDQXJJCVUIGDGTOJEFKLMtCDhCKFUHCLBPHTEPOPEVkBHBJGFHJCCHADKXIDEFKFALKTAMEIECGFAHDJEFCAADOCWAmBkBCBDHCNIJIFWDMPEBADHNFDFLHCBDDHCJABHAJFBHDDJAFDAFHDHAJDTFDLnBNPLJAJFbFDDDABDXBDKAIFQDICAAICCBIBGDGBGHGHMDOLKHEJOAWJSHGHCFKCEFIDEFMRYHBEYDFHTDDLMLYABGPWpBKRQRDBAJWRGPDBCRGROJKREPeVkBhBBFHDMHCFIFIAOESCcIOAQEIGGABVBFFPPnBNVNRRV3BpBRRFLLHDFFBBJFFBLFDHTAJMFADDJALMZGDCFC3BCHJVJJhBNRPFDJJHDALGLENEABPBFEDBFHFfNFFAFEBFfDHNJVbbZLHRFHABFJEHDPEJBFARFLBJFHBFGFAHIABBEAKFKGEAMdwBLMFMN0BBcNULeNOBYCOMkBSYAUDGHUGKHaHKCCHSnBuBJQMiBDCIgBFKFCDIDCAEPFFCFDNAHKFMJKZAbFvBRNEbCTBZJHAPIbULKNIJIDSNQHGDKLKHABIFCDQCIFMHGICGMEIAIEICQDYCIDIHGAOGEGIBGGMKKECEKCIEKMGKQIGOCOMIEMMDUKYKKcOQaKAKFQAYDOKSCKGQG2BEIBOGSAGDKCSGMBBHOGCDHHAFGDDNJHEJIAEHGBSFICMBWHINkBJSHIEGIBMEIMIKCWDGFaFEDWAmBLUKOAMBEHEGMDMAIEEEACEIEMQcBMEIFGGGJALCLHXBLIRADFJBPIRAJQJKGMJISOaCGMeBUKSEaAcJYFSCOBSIEIDKJGHCbSRGNKMCOOJGYGAEbDJDNBNFAJIDQCBFRBVJHECGPGCCQGFEXEBGNBFJLLADHBDAFRHHFJIPOFDDRATNFIAERCRFKHHBHAHIDDEJIFFDQLAJNEEHJBGNJANIHWNSDIJGAICQJIfQNENMECHGAGJCDHFGAGGCNCLFAHBDGHOHINSLMAEDDDaJOHCDDFHINEFLKFBHFAHNHBEOEELQFCDILCFILALIZSDQVIHBHHHANJfEVDBJAJNJVDAFJHFNGHJHBJNBJNjBAJDFFHAFGDKPCFDHCHBCMBKFCDGAKIGEQDSAMFGWM6BFoBAIKCgBPSLIXGBKWEaDDSOFmBMEOcGIEOYWGMAEEMAEDKIBGBKFIAQGKOAGGOEBHDFCDIBDFDCLLEHCFQDAFQEIESFIF4BSQDCBOBEIWGDMCMIKOGOLMAEWFBJGAKoBGSBQASIPIdB1BHJINGCQHOIKQKuBUBGVIbDNLCJ3BZLVMLOHNRPDFbJNTCHNRAFONULWJKfRVDVIFQDmBOKqBOgBQkC0BmCiBkBGaAYMeAcCyBJTFSJQGaJsBB8BTMFCLRHZDnCMLBcLCXgBHCIJGKGoBJMEJMmBQOBQDIKLKIKLKsBFKHVBCJMFYEEK6CWMBPHUBMGeAWGUJSMRIIGwBFWD6BRKIPIAETCGGHOAEcOMQMCqBDCHNNKDELBVQJFJfVSDIGQEGIMIHKGKPCDIMQTOcKDMIAIJFNSDHMcGgBCeJNOBQcEmBBkBCNKSKUAeIqBCGEqBCMDkBKeBEIQGmBIcFVDkBBEHOEwBAkBHMFDH7BNLFsBFOEIJIEaCyBBEHkCBAM8BBaJGJHFULYHQSaHaEgBDMEaBLOWIwEJOJqBLgCCgBBOFBLUDUCcAgBBeCcNUENKIIyBDiBAuBHWF!mqByvCJFVELAVGOGKGcHOH!A4wCAJRBBGUG!A4wCQAWDABRDTAAK!4sB4vCAPUMUJFLQJSKKOCSuBDWHAHLHMHBHfLVBPEFHNLFHRJVBNFAJRBTNRRFLARWDQZWCeFQFKHUDSHsBBBNEPMRYNMEIQHaLIaISMKKBMJMTMSSFOFaMCsBFMGkBPEFcBALGTODMHWIQSKI0B1BFJUJOHaDKFINMBGFCRXLZDTNbBhBCnBANLTFpBjBOCaUiBOYCOHPJKdWHaCQSALMFTJjBJPFRLLCAOcMrBBCFPFhBLJJBBAHGJGAAGEDBDtBFNFYEEDVDJAACDDEBBJLLBEHECHEDCFPREMHGBMBFCJJCMFANEBEVJLPDJJHAHFDFPJRPBLELENIJAHIRBPDJDBHCDGFERgBEKDKNMFEPHJIJERBNCLAHDEDAFCDBBFCFBLALINBLEJANDNLPHHFDHAREFJZBbIRCLMLEHGHQDIHmBKKCKGEKAOEEcIYACBAHHJDJEBHTDEBAABCABLABBPBDDABFEBCCGBECQBGAIEIBICKBQJEDBFCFFJATBAALDDCDGLURBDIAEDICSIEESDIBKJIAMMICCSKIKAACOASMIGGAEDDJJBGFAHHJGLIAEMFGAMUGBIEEGJMAKJAFgBCKFMBIEAEoBCNFGFMBMHELIAQJKJAHGBQLSDCEOAQDSFQLEHECOlBIBALLLGFcBAPMKwBNIJDJUGeHYAYNURMDOAGFIdFZdfJRLNDAFLCdFjBFFBVPTDPLHDJRAXFLFRFRLNPBLCHBPDHLJRbXTHPJHFJRJLEJBNILBHKBHUNBLKFAHPTXJfBRAEHDLEHJFPBPGFFCNMFIGEJNDLJDPDHNALHFLQLQDFNRJLRNFFHEPMJVCVJBPFARGnBUDKEKHKBcIOQMXGOOGaSFIiBJEFTJCM0BGMDQBSIAU0BIYDYEMBUKUMkDAaDWPKBGfQbSLKFMCGNUd$BHIDKLMLGGGHQEMOKIMDGFFJGEEBQECEKGKBGUKBGGAAIEGICMSFEEIDQCEBOLMBIEGDADGHEFBDDJFBBIJFDHABKDDDCDGRCABJGDCCEACPKBEDECFDDDGDABECKFCEEdcCECDACBEDCBDJALGHANGJAPKRSHGNEHBLFHBlCYPMZGFIRKHKDGGCBGEEAELWNQPMHKNIDEEKHCJIDMHCRQAEHMFMAGLIFBHEBFETWVCFCAEJSRGNINCJIAMNADHDBADILKRMAMBITMBBDEJEHKGAGGCILKJETiBHWLKFCBEJCFENCDCBIPQLWAETUBMHKEMBODMGQEcDWHUAEYFINEEBMFOrBWbIJOCKTGBMTMAIJGNGDOTMJQnBCREhBQrBKVBdITGRDEJbDNFRDBKIQQEDETHLLVJMHPLfLDFZHDHTFJAtBNZFDEiBMSISCIGmBUEMIITDDCHFLIDDFIPHJAAKCGJGVDXMAKLGGKOIEIOCKDOIMAMEDIHCMGbDDBLCXAVCHITI6BQOABHiBANKTGJIPGVGIIeAUIEIQIuBIOAYIYDMFICaAADYDQCuCHUCoCJaHQBOIUEYBYIaEKHMEEIKBcNWKCLUEGESBYFmBFWBQAWHVHcBsBAMESJSIRGMGgBCMDQHSCcHaCWAAKOEYFAPKOOAGQPITICSSKWBQFWRNHeD!$gByxCHHiBGYHSIOFMPKILQOCQBSHOZ4BPBFZBKFDF5BGRAdFlCDHIVENBTOkBEWAWCfE3BBHGkBGXAbEOMKIqBKSD!4lB2xCNJZMGCWAMD!6zByxCCDhBARBVKAGIAkBBcH!4uByxCMJOOoBGcPBLgBGOGkBHWHCFeCQJoBFOFOPbFkBJaDYPYADLbRTGZQTBBHQJWHGDMPFLTGnBMmBXEFrBIhBITIGEvBQADtBBLGKK$BEDEEIWQDIHGXGfGKEPKNCNEHDbB7BE5BGNGQIVAFQOOQGoBEJJ!6nB$xCUDcCEDNHYHDNZFPCJGnBMAGgBBPKSI!6hF0xC7BCOGWCWFCD!srBsxCPLRAJQAGIIQEiBAeDXNTD!4d2wCpBHHIjBISSMKNK2BEWDqBBgBJ7BPTJAH!slFyyCRFZAdGEGmCF!mrBwyCHFXATEKIWEOFGD!yiF6yCNL5BAZDfKIMWCqBA6BH!4oBszCMHAHFLZBRCAKZABMSBYGWACC!8jBkzCGFQCQACHJH1BBnBHXABGiBGnCBXEWQQEsBFcJcAVOOGSBEF!42DswCHB1BCDIbEBIQEAIeONCmBODI4CS2BEcEeEMHLDnDPxBPxBdENeL!2qByzCQFgBAODDFeHsBBaE6BASFCHJDXBTCtCDZCpBGFIBIPIhBCREGGiBA!8f6zCBLLFNAdHZBVEcMgBKYAWC!irB4zCjBADGgBAKDBB!8iB8zCbFXGMEYCWBFD!smD$zCjBFbCKEHGgBEGFYD!mjBq0CTDZAACQGeD!iqBg0CVBNEFGBGeBUFFF!goBm0CGHZCbGhBAOEREBGqCHOF!yuEk0C5CFcWOC0BJDH!kjD80C0BLnBHHJNDHNTAhBKOGXEdOLMqBGKFWAGGYAUD!4mDm1CeFXHtBBtBEDEVARIyBEWDQEqBD!yzDo1CjBBBDRBREKEjBC4BCCDKEOCYBFD!gsEu0CjBBrBEbGLMVEqBKkBEeHkBPBN!wuB60CSDTFdLbAhBCRGAGOEdARGJGWMSCHEmBAUH2BFML!43By2CuCDcDADnBHlBBNDiBA_BNZNhBBJDvBAWBLDOHPFXDHFVDCDcAADpBJpBGvBD1BEBIeCHMKCqBHVKZEOGcEEGVGFI4BBYGjBC3BBbGNGREDGqCGYGUASDMIyBEwBAIAuBCmCB!usC42CkDLdFxEBID4BCwBFgBGMFPJoBGuCGwBBIH_BJJDxBDkBAfVCRSJXAZFcHENPBUNjBAUFFFtBDUJCHfIHDUDWJGNbBfOEJRHgCB1CZtBFRARFVRhBJ1BHNJALJJZNILPbVBXOfAPIJQbUHKBOVQGMLGQSYGGGEMpBJRGBKGKQAgBDpBOPBNESQJGfcTGAGpBKhBAxCBtBQqBGgBAjCEjBGCG2DQGGpBGOG2BMYCFGmBEwBEyBASFqBK$CNlBKCG2BK4BBUG4BCgEB";
  var CS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$_';
  var CMAP = {}; for (var ci = 0; ci < 64; ci++) CMAP[CS.charAt(ci)] = ci;

  function decodeLand(str){
    return str.split('!').map(function(seg){
      var i = 0, x = 0, y = 0, pts = [];
      function rd(){
        var v = 0, sh = 0, c;
        do { c = CMAP[seg.charAt(i++)]; v |= (c & 31) << sh; sh += 5; } while (c & 32);
        return (v & 1) ? -((v + 1) >> 1) : (v >> 1);
      }
      while (i < seg.length){ x += rd(); y += rd(); pts.push(x/8 - 180, y/8 - 90); }
      return pts;
    });
  }

  /* Rasterise the coastlines into an equirectangular mask.
     red = land fill, green = coastline stroke -> lets us light up shorelines. */
  var MW = 2048, MH = 1024;
  function buildMask(){
    var rings = decodeLand(LAND);
    var c = document.createElement('canvas');
    c.width = MW; c.height = MH;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,MW,MH);

    // only rings that actually cross the seam need the wrapped copies
    var jobs = rings.map(function(r){
      var lo = Infinity, hi = -Infinity;
      for (var i = 0; i < r.length; i += 2){ if (r[i] < lo) lo = r[i]; if (r[i] > hi) hi = r[i]; }
      return { pts:r, offs: (lo < -180 || hi > 180) ? [-360,0,360] : [0] };
    });

    function path(r, off){
      ctx.beginPath();
      for (var i = 0; i < r.length; i += 2){
        var x = (r[i] + off + 180)/360 * MW;
        var y = (90 - r[i+1])/180 * MH;
        if (i === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.closePath();
    }

    ctx.fillStyle = '#f00';
    jobs.forEach(function(j){ j.offs.forEach(function(o){ path(j.pts,o); ctx.fill(); }); });

    ctx.globalCompositeOperation = 'lighter';   // keep the red land flag under the stroke
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 3.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    jobs.forEach(function(j){ j.offs.forEach(function(o){ path(j.pts,o); ctx.stroke(); }); });
    ctx.globalCompositeOperation = 'source-over';

    return ctx.getImageData(0,0,MW,MH).data;
  }

  var MASK = buildMask();
  // 0 = ocean, 1 = land, 2 = coastline
  function sampleMask(u, v){
    var x = Math.floor(u * MW), y = Math.floor((1 - v) * MH);
    if (x < 0) x = 0; else if (x >= MW) x = MW - 1;
    if (y < 0) y = 0; else if (y >= MH) y = MH - 1;
    var i = (y * MW + x) * 4;
    if (MASK[i+1] > 100) return 2;
    return MASK[i] > 100 ? 1 : 0;
  }

  var isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  var scene  = new THREE.Scene();
  /* Apparent size is inversely proportional to camera distance, so pulling back from
     15.5 to 17.22 (15.5 / 0.9) renders the globe 10% smaller. Kept as a constant
     because the scroll response below offsets from the same number. */
  var CAM_Z = 17.22;
  var camera = new THREE.PerspectiveCamera(45, container.clientWidth/container.clientHeight, 0.1, 2000);
  camera.position.set(0, 0, CAM_Z);

  var renderer = new THREE.WebGLRenderer({antialias:true, alpha:true, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  var rad = 5;
  var pivot = new THREE.Group();        // pointer tilt + scroll transform
  var globeGroup = new THREE.Group();   // drag / auto rotation
  pivot.add(globeGroup);
  scene.add(pivot);

  /* lat/lon -> the globe's local space. This mirrors the mask's own mapping exactly:
     theta is the longitude in radians, phi is measured down from the north pole. Get
     this wrong and the marker lands in the sea. */
  function latLonToVec3(lat, lon, r){
    return new THREE.Vector3().setFromSphericalCoords(
      r, (90 - lat) * Math.PI / 180, lon * Math.PI / 180);
  }
  /* Ethiopia's national border, [lon, lat], simplified to ~45 points.
     The LAND blob above is coastlines only — Natural Earth's land polygons carry no
     internal country boundaries — so the outline has to be supplied separately. This
     is a hand-simplified approximation: right shape and extent (33.0-48.0E, 3.4-14.9N,
     the Ogaden point east, the Afar notch north-east), not a survey-grade boundary. */
  var ETH_BORDER = [
    [36.15,14.35],[37.10,14.45],[37.90,14.89],[38.55,14.50],[39.20,14.45],
    [39.85,14.20],[40.20,14.45],[41.10,13.50],[41.80,12.60],[42.35,12.45],
    [42.80,11.20],[43.00,10.40],[43.33, 9.55],[44.20, 8.90],[45.30, 8.50],
    [46.60, 8.20],[47.98, 8.00],[46.80, 6.60],[45.60, 5.50],[44.50, 4.90],
    [43.50, 4.60],[42.50, 4.30],[41.90, 3.98],[41.00, 4.10],[40.00, 4.30],
    [39.20, 3.50],[38.10, 3.62],[37.10, 4.30],[36.05, 4.45],[35.80, 5.10],
    [35.30, 5.50],[34.80, 6.50],[34.40, 7.20],[33.90, 7.70],[33.00, 7.95],
    [33.30, 8.50],[34.00, 9.50],[34.30,10.20],[34.60,10.80],[35.10,11.60],
    [35.50,12.30],[36.10,12.80],[36.40,13.40]
  ];
  var ETH_BB = (function(){
    var b=[Infinity,Infinity,-Infinity,-Infinity];
    ETH_BORDER.forEach(function(p){
      if(p[0]<b[0])b[0]=p[0]; if(p[1]<b[1])b[1]=p[1];
      if(p[0]>b[2])b[2]=p[0]; if(p[1]>b[3])b[3]=p[1];
    });
    return b;
  })();
  /* ray-cast point-in-polygon, bbox-gated so the 22k-point sweep stays cheap */
  function inEthiopia(lon, lat){
    if (lon < ETH_BB[0] || lon > ETH_BB[2] || lat < ETH_BB[1] || lat > ETH_BB[3]) return false;
    var inside = false;
    for (var i = 0, j = ETH_BORDER.length - 1; i < ETH_BORDER.length; j = i++){
      var xi = ETH_BORDER[i][0], yi = ETH_BORDER[i][1],
          xj = ETH_BORDER[j][0], yj = ETH_BORDER[j][1];
      if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }

  /* soft round sprite — the ocean script has its own copy, this scope needs one too */
  function dotTexture(color){
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0, color); g.addColorStop(0.35, color); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,64,64);
    return new THREE.CanvasTexture(c);
  }

  /* ---------------- point cloud sampled against the land mask ---------------- */
  /* Density pass, after the Stripe map reference: more rings and more points per ring,
     with a smaller dot size below, so the sphere reads as fine grain rather than as
     countable dots. Ring count rises alongside the total — raising only the total makes
     the grid dense along each ring but leaves the rings just as far apart.
     Note desiredTotal is nominal, not the delivered count: rings are weighted by
     sin(phi), so the sum lands at roughly 64% of it. 64000 yields ~41k candidates. */
  var ringCount    = isMobile ? 130 : 240;
  var desiredTotal = isMobile ? 24000 : 64000;
  var approxEq     = Math.max(4, Math.ceil(desiredTotal / ringCount));

  var pos = [], types = [], eths = [];
  var sph = new THREE.Spherical();
  for (var i = 0; i < ringCount; i++){
    var phi = (i + 0.5)/ringCount * Math.PI;
    var inRing = Math.max(3, Math.round(approxEq * Math.sin(phi)));
    for (var j = 0; j < inRing; j++){
      var theta = (j/inRing) * Math.PI * 2;
      var p = new THREE.Vector3().setFromSphericalCoords(rad, phi, theta);
      sph.setFromVector3(p);
      var u = (sph.theta + Math.PI)/(Math.PI*2);
      var v = 1 - sph.phi/Math.PI;
      var t = sampleMask(u, v);
      // thin the water harder now the overall count is up, so land still reads as land
      if (t === 0 && Math.random() > (isMobile ? 0.16 : 0.20)) continue;
      pos.push(p.x, p.y, p.z);
      types.push(t);
      eths.push(inEthiopia(u*360 - 180, v*180 - 90) ? 1 : 0);
    }
  }

  /* The global sampling only lands ~50 points inside a country this size, which reads
     as a smattering rather than a shape. This second pass fills Ethiopia on its own
     grid so the outline has something solid inside it. */
  var ethStep = isMobile ? 0.30 : 0.20;
  for (var la = ETH_BB[1]; la <= ETH_BB[3]; la += ethStep){
    for (var lo = ETH_BB[0]; lo <= ETH_BB[2]; lo += ethStep){
      if (!inEthiopia(lo, la)) continue;
      var q = latLonToVec3(la, lo, rad);
      pos.push(q.x, q.y, q.z);
      types.push(1);
      eths.push(1);
    }
  }

  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));
  geo.setAttribute('aType',    new THREE.Float32BufferAttribute(types,1));
  geo.setAttribute('aEth',     new THREE.Float32BufferAttribute(eths,1));

  var uMouse  = {value:new THREE.Vector2(0,0)};
  var uAspect = {value:container.clientWidth/Math.max(1,container.clientHeight)};
  var uTime   = {value:0};

  /* smaller than before (was 0.055) — finer dots are what make a dense field read as
     texture instead of as a cluster of blobs */
  var mat = new THREE.PointsMaterial({size:0.042, transparent:true, opacity:1});
  mat.onBeforeCompile = function(shader){
    shader.uniforms.uMouse  = uMouse;
    shader.uniforms.uAspect = uAspect;
    shader.uniforms.uTime   = uTime;

    shader.vertexShader = [
      'attribute float aType; attribute float aEth;',
      'uniform vec2 uMouse; uniform float uAspect; uniform float uTime;',
      'varying float vType; varying float vHot; varying float vLit; varying float vEth;',
      ''
    ].join('\n') + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace('gl_PointSize = size;', [
      '  vType = aType;',
      '  vec2 sndc = gl_Position.xy / max(0.0001, gl_Position.w);',
      '  vec2 dv = (sndc - uMouse) * vec2(uAspect, 1.0);',
      '  vHot = (1.0 - smoothstep(0.0, 0.34, length(dv))) * step(0.0, gl_Position.w);',
      '  vec3 nrm = normalize((modelViewMatrix * vec4(position, 0.0)).xyz);',
      '  vLit = 0.55 + 0.45 * dot(nrm, normalize(vec3(-0.35, 0.45, 0.82)));',
      '  float base = aType > 1.5 ? 3.0 : (aType > 0.5 ? 2.4 : 1.0);',
      '  float wave = 1.0 + 0.14 * sin(uTime * 1.5 + position.y * 0.9 + position.x * 0.6);',
      // per-point flag set on the CPU by point-in-polygon, so the highlight takes
      // Ethiopia's real outline instead of the circular blob a falloff produced
      '  vEth = aEth;',
      '  gl_PointSize = size * base * wave * (1.0 + vHot * 1.6 + vEth * 0.45);'
    ].join('\n'));

    shader.fragmentShader = [
      'varying float vType; varying float vHot; varying float vLit; varying float vEth;',
      ''
    ].join('\n') + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );', [
      '  float dd = length(gl_PointCoord - vec2(0.5));',
      '  if (dd > 0.5) discard;',
      '  float soft = smoothstep(0.5, 0.08, dd);',
      '  vec3 ocean = vec3(0.16, 0.21, 0.46);',
      '  vec3 land  = vec3(0.63, 0.76, 0.20);',
      '  vec3 coast = vec3(0.88, 0.94, 0.42);',
      '  vec3 col = vType > 1.5 ? coast : (vType > 0.5 ? land : ocean);',
      '  col *= vLit;',
      '  col = mix(col, vec3(1.0, 1.0, 0.88), vHot * 0.75);',
      // brand lemon #CFDE5D
      '  col = mix(col, vec3(0.812, 0.871, 0.365), vEth);',
      '  float a = (vType > 0.5 ? 0.96 : 0.40) * soft + vHot * 0.35 * soft + vEth * 0.30 * soft;',
      '  vec4 diffuseColor = vec4(col, opacity * clamp(a, 0.0, 1.0));'
    ].join('\n'));
  };
  globeGroup.add(new THREE.Points(geo, mat));

  /* opaque core: hides back-face points so the continents read cleanly */
  globeGroup.add(new THREE.Mesh(
    new THREE.SphereGeometry(rad*0.985, 64, 64),
    new THREE.MeshBasicMaterial({color:0x0E1436})
  ));

  /* ---------------- Ethiopia: marker, ping, and outbound routes ----------------
     The icosahedron wireframe that used to sit here has been removed — it drew
     polygonal lines straight across Africa and fought with everything below. */

  var ORIGIN = latLonToVec3(9.03, 38.74, rad * 1.004);

  /* where Bahir Tech delivers to — spread across every populated continent so the
     arcs leave Ethiopia in visibly different directions */
  var DESTINATIONS = [
    [51.51,  -0.13],   // London
    [40.71, -74.01],   // New York
    [25.20,  55.27],   // Dubai
    [ 1.35, 103.82],   // Singapore
    [-26.20, 28.05],   // Johannesburg
    [39.90, 116.41],   // Beijing
    [-23.55,-46.63]    // Sao Paulo
  ];

  /* A great-circle-ish arc lifted off the surface. Longer hops bow higher, so a
     transatlantic route clears the globe instead of scraping along it. */
  function routeCurve(a, b){
    var mid  = a.clone().add(b).multiplyScalar(0.5);
    var lift = rad + a.distanceTo(b) * 0.42;
    if (mid.lengthSq() < 1e-6) mid.copy(a);        // antipodal guard
    mid.normalize().multiplyScalar(lift);
    return new THREE.QuadraticBezierCurve3(a, mid, b);
  }

  /* Each route draws itself out of Addis rather than sitting there fully formed:
     setDrawRange reveals the line vertex by vertex, a comet head rides the growing
     tip, then the whole arc holds and fades before the next lap. Staggered per route
     so one is always departing. */
  var SEG = 88;                 // tubular segments per arc — the draw resolution
  var RADIAL = 6;               // sides of the tube
  var IDX_PER_SEG = RADIAL * 6; // TubeGeometry emits 6 indices per radial quad
  var CYCLE = 5.0;              // seconds for draw + hold + fade
  var ROUTE_ALPHA = 0.85;       // was 0.52 — the arcs were too faint to read
  var routes = [];
  DESTINATIONS.forEach(function(d, i){
    var curve = routeCurve(ORIGIN, latLonToVec3(d[0], d[1], rad * 1.004));
    /* A tube, not a line. LineBasicMaterial ignores `linewidth` on virtually every
       platform, so thickness has to come from real geometry. TubeGeometry emits its
       indices in order along the curve, which keeps setDrawRange usable as a draw-on
       reveal — see IDX_PER_SEG in the frame loop. */
    var g = new THREE.TubeGeometry(curve, SEG, 0.0196, RADIAL, false);
    var m = new THREE.MeshBasicMaterial({color:0xCFDE5D, transparent:true, opacity:0,
                                         depthWrite:false});
    g.setDrawRange(0, 0);
    globeGroup.add(new THREE.Mesh(g, m));
    routes.push({curve:curve, geo:g, mat:m, offset:(i / DESTINATIONS.length) * CYCLE});
  });

  /* one Points object carrying every travelling pulse, rather than one per route */
  var pulseArr = new Float32Array(routes.length * 3);
  var pulseGeo = new THREE.BufferGeometry();
  pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulseArr, 3));
  var pulses = new THREE.Points(pulseGeo, new THREE.PointsMaterial({
    size:0.30, map:dotTexture('rgba(236,245,180,1)'), transparent:true,
    depthWrite:false, blending:THREE.AdditiveBlending
  }));
  globeGroup.add(pulses);

  /* Ethiopia's outline, traced on the surface. This is what actually makes the country
     legible — the filled points alone read as a patch, the border gives it its shape. */
  var borderPts = ETH_BORDER.map(function(p){ return latLonToVec3(p[1], p[0], rad * 1.007); });
  borderPts.push(borderPts[0]);                       // close the ring
  globeGroup.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(borderPts),
    new THREE.LineBasicMaterial({color:0xCFDE5D, transparent:true, opacity:0.95, depthWrite:false})
  ));

  /* a small node where the routes leave Addis — no expanding ring, it swamped the shape */
  var originGeo = new THREE.BufferGeometry();
  originGeo.setAttribute('position', new THREE.Float32BufferAttribute(
    [ORIGIN.x, ORIGIN.y, ORIGIN.z], 3));
  globeGroup.add(new THREE.Points(originGeo, new THREE.PointsMaterial({
    size:0.17, map:dotTexture('rgba(238,246,190,1)'), transparent:true,
    depthWrite:false, blending:THREE.AdditiveBlending
  })));

  /* brand green rather than lemon, and a lower ceiling on the halo — see the clamp below */
  var atmoUni = {glowColor:{value:new THREE.Color(0xAAC638)}, uBoost:{value:0}};
  var atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(rad*1.1, 48, 48),
    new THREE.ShaderMaterial({
      transparent:true, side:THREE.BackSide, depthWrite:false, uniforms:atmoUni,
      vertexShader: [
        'varying vec3 vNormal;',
        'void main(){ vNormal = normalize(normalMatrix*normal);',
        '  gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }'
      ].join('\n'),
      fragmentShader: [
        'varying vec3 vNormal; uniform vec3 glowColor; uniform float uBoost;',
        'void main(){',
        '  float intensity = pow(0.55 - dot(vNormal, vec3(0,0,1.0)), 3.0);',
        '  gl_FragColor = vec4(glowColor, clamp(intensity*(1.0+uBoost),0.0,0.42));',
        '}'
      ].join('\n')
    })
  );
  pivot.add(atmosphere);

  var orbitRing = new THREE.Mesh(
    new THREE.TorusGeometry(rad*1.42, 0.012, 8, 128),
    new THREE.MeshBasicMaterial({color:0xAAC638, transparent:true, opacity:0.22})
  );
  orbitRing.rotation.x = Math.PI/2.3;
  orbitRing.rotation.y = 0.4;
  pivot.add(orbitRing);

  /* Open on Ethiopia rather than on longitude 0 (which faces the camera at rotation 0).
     Spinning the globe by -lon brings Addis round to face front; tilting by +lat lifts
     it from 9N up to the camera's eye line. */
  globeGroup.rotation.y = -38.74 * Math.PI / 180;
  globeGroup.rotation.x =   9.03 * Math.PI / 180;

  /* Rotation speed is a function of WHICH FACE is toward the camera, not of elapsed
     time — so it repeats every revolution instead of ramping once and staying fast.
     Ethiopia sits still-ish at ~2.1 deg/sec; the pace then rises like a volume knob
     up to 30 deg/sec as Africa rotates away, and holds there for the rest of the
     revolution. Time spent is inversely proportional to speed, so the globe dwells
     on Addis and hurries through everything else — the whole point of the globe. */
  var ETH_FACE_Y = -38.74 * Math.PI / 180;   // rotation.y at which Addis faces the camera
  var SPIN_SLOW    = 0.0006108;              // Ethiopia front  (~2.1 deg/sec)
  var SPIN_FAST    = 0.0087266;              // everywhere else  (~30 deg/sec)
  /* Volume-style ramp: slow while Addis faces the camera, then the speed rises smoothly
     (like turning a volume knob) and reaches 30 deg/sec only after Africa has rotated
     away and disappeared. After that the globe holds a steady 30 deg/sec. */
  var SLOW_HALF  = 100 * Math.PI / 180;

  var autoRotate = true;

  /* ---------------- drag to spin, with inertia ---------------- */
  var dragging = false, prevX = 0, prevY = 0, velX = 0, velY = 0, activeId = null;
  var el = renderer.domElement;

  el.addEventListener('pointerdown', function(e){
    dragging = true; autoRotate = false; activeId = e.pointerId;
    prevX = e.clientX; prevY = e.clientY; velX = velY = 0;
    container.classList.add('is-grabbing');
    if (el.setPointerCapture) { try { el.setPointerCapture(e.pointerId); } catch(err){} }
  });
  window.addEventListener('pointermove', function(e){
    if (!dragging) return;
    var dx = e.clientX - prevX, dy = e.clientY - prevY;
    globeGroup.rotation.y += dx * 0.005;
    globeGroup.rotation.x = Math.max(-1.1, Math.min(1.1, globeGroup.rotation.x + dy * 0.005));
    velX = dx * 0.005; velY = dy * 0.005;
    prevX = e.clientX; prevY = e.clientY;
  }, {passive:true});
  function endDrag(){
    if (!dragging) return;
    dragging = false; activeId = null;
    container.classList.remove('is-grabbing');
  }
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  function resize(){
    var w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w/h;
    uAspect.value = w/Math.max(1,h);
    camera.updateProjectionMatrix();
    renderer.setSize(w,h);
  }
  window.addEventListener('resize', resize);
  resize();

  /* ---------------- frame ---------------- */
  var clock = new THREE.Clock();
  var scrollEase = 0;

  (function animate(){
    requestAnimationFrame(animate);
    if (!FX.active) return;

    var t = clock.getElapsedTime();
    uTime.value = FX.reduce ? 0 : t;

    // pointer spotlight, in NDC (y flipped)
    uMouse.value.set(FX.over ? FX.x : 99, FX.over ? -FX.y : 99);

    // scroll: lift, shrink, tilt — and scroll velocity spins the globe
    scrollEase += (FX.scroll - scrollEase) * 0.08;
    pivot.position.y = scrollEase * 2.2;
    pivot.position.x = scrollEase * 0.9;
    pivot.rotation.z = scrollEase * 0.25;
    pivot.scale.setScalar(1 - scrollEase * 0.22);
    camera.position.z = CAM_Z + scrollEase * 2.0;
    atmoUni.uBoost.value = scrollEase * 0.5;

    if (!FX.reduce){
      /* Horizontal parallax only. The vertical tilt that used to track the pointer is
         gone: moving the mouse up and down no longer rolls the globe. Holding and
         dragging still rotates it vertically — that is handled in the drag listener. */
      pivot.rotation.y += (( FX.x * 0.20) - pivot.rotation.y) * 0.05;

      if (autoRotate && !dragging){
        /* NB: this factor must NOT be called `t` — `var` is function-scoped, so it
           would shadow the clock on the first line of this frame and the routes below
           would end up driven by the rotation speed instead of by elapsed seconds.
           Slow only within SLOW_HALF of Ethiopia facing us; everywhere else, including
           South America and the Pacific, runs at full speed. */
        var off  = globeGroup.rotation.y - ETH_FACE_Y;
        var dist = Math.abs(Math.atan2(Math.sin(off), Math.cos(off)));   // wrap to [0,PI]
        var k    = Math.min(1, dist / SLOW_HALF);
        var spin = SPIN_SLOW + (SPIN_FAST - SPIN_SLOW) * (k * k * (3 - 2 * k));
        globeGroup.rotation.y += spin + FX.vel * 0.00035;
      } else if (!dragging){
        globeGroup.rotation.y += velX;
        globeGroup.rotation.x += velY;
        velX *= 0.94; velY *= 0.94;
        if (Math.abs(velX) < 0.00005 && Math.abs(velY) < 0.00005){
          autoRotate = true;
        }
      }
      orbitRing.rotation.z += 0.0009;
    }

    /* Routes run off the wall clock and sit OUTSIDE the rotation block on purpose:
       they must keep their own pace whether the globe is spinning slowly, being
       dragged, or sitting under the pointer.
       draw (0-55%) -> hold (55-78%) -> fade (78-100%), staggered per route. */
    if (!FX.reduce){
      for (var i = 0; i < routes.length; i++){
        var R = routes[i];
        var p = ((t + R.offset) % CYCLE) / CYCLE;
        var grow, alpha;
        if (p < 0.55){
          grow  = p / 0.55;
          grow  = grow * grow * (3 - 2 * grow);        // ease in-out
          alpha = ROUTE_ALPHA;
        } else if (p < 0.78){
          grow = 1; alpha = ROUTE_ALPHA;
        } else {
          grow = 1; alpha = ROUTE_ALPHA * (1 - (p - 0.78) / 0.22);
        }
        // one ring of faces per tubular segment, so the reveal stays segment-aligned
        R.geo.setDrawRange(0, Math.max(1, Math.round(grow * SEG)) * IDX_PER_SEG);
        R.mat.opacity = alpha;

        /* the comet head rides the tip while drawing; parked at the sphere's centre
           otherwise, where the opaque core hides it */
        if (p < 0.55){
          var q = R.curve.getPointAt(Math.min(1, grow));
          pulseArr[i*3] = q.x; pulseArr[i*3+1] = q.y; pulseArr[i*3+2] = q.z;
        } else {
          pulseArr[i*3] = 0; pulseArr[i*3+1] = 0; pulseArr[i*3+2] = 0;
        }
      }
      pulseGeo.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
  })();
})();

/* extracted from legacy/index.html — do not hand-edit; re-run npm run prepare:static */
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- services: two levels of tabs, walked automatically ----
     The left rail picks the practice, the pill bar inside the panel picks one item of it.
     Both are real tablists: click, arrow keys, Home and End, with focus following the
     selection as the ARIA tabs pattern expects. Visibility is the `hidden` attribute
     rather than a class, so a hidden panel leaves the accessibility tree as well.

     On top of that, a 15-second walk through every item: the pills of one practice in
     order, then on to the next practice. See AUTO below for what stops it. */
  (function(){
    var cats = [].slice.call(document.querySelectorAll('.srv-cat'));
    var panels = [].slice.call(document.querySelectorAll('.srv-panel'));
    var section = document.getElementById('services-section');
    if(!cats.length || cats.length !== panels.length) return;

    /* One tablist's worth of wiring, used for both levels. `onPick` is where the two
       differ: the practice rail also has to tell the 3D icon to swap. */
    function tablist(tabs, targets, onPick){
      var current = 0;

      function select(i, moveFocus){
        tabs.forEach(function(t, j){
          var on = j === i;
          t.classList.toggle('is-active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          t.tabIndex = on ? 0 : -1;
        });
        targets.forEach(function(el, j){
          var on = j === i;
          el.classList.toggle('is-active', on);
          if(on) el.removeAttribute('hidden');
          else el.setAttribute('hidden', '');
        });
        current = i;
        if(moveFocus) tabs[i].focus();
        if(onPick) onPick(i);
      }

      tabs.forEach(function(t, i){
        t.addEventListener('click', function(){ select(i); });
        t.addEventListener('keydown', function(e){
          var last = tabs.length - 1, next = -1;
          /* Both rails are navigated with either axis: the practice rail is vertical and
             the pill bar horizontal, but guessing wrong should not leave a reader stuck. */
          if(e.key === 'ArrowDown' || e.key === 'ArrowRight') next = i === last ? 0 : i + 1;
          else if(e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = i === 0 ? last : i - 1;
          else if(e.key === 'Home') next = 0;
          else if(e.key === 'End') next = last;
          else return;
          e.preventDefault();
          select(next, true);
        });
      });

      return {select:select, count:tabs.length, index:function(){ return current; }};
    }

    /* the practice rail. The 3D icon listens for srv:change rather than being reached
       into directly, which is the same contract the scroll version used. */
    var rail = tablist(cats, panels, function(i){
      document.dispatchEvent(new CustomEvent('srv:change', {detail:{index:i}}));
    });

    /* one pill bar per panel */
    var bars = [];
    panels.forEach(function(panel){
      var tabs = [].slice.call(panel.querySelectorAll('.srv-tab'));
      var cards = [].slice.call(panel.querySelectorAll('.srv-card'));
      if(!tabs.length || tabs.length !== cards.length) return;
      var bar = panel.querySelector('.srv-tabs');

      var ctl = tablist(tabs, cards, function(i){
        /* Keep the chosen pill inside the bar's own scroll box — it scrolls sideways on
           narrow screens. Scrolling the bar directly rather than via scrollIntoView,
           because that would also move the page when the section is only part way in
           view, and the auto-walk would then drag the reader down the page. */
        if(!bar) return;
        var t = tabs[i];
        var left = t.offsetLeft - (bar.clientWidth - t.offsetWidth) / 2;
        if(bar.scrollTo) bar.scrollTo({left:left, behavior: reduce ? 'auto' : 'smooth'});
        else bar.scrollLeft = left;
      });

      /* Re-assert the markup's starting state. Without this a panel that was never
         opened keeps whatever `hidden` attributes the HTML shipped with, which is
         correct — but it also means a stale `.is-active` class would go unnoticed. */
      var start = tabs.indexOf(panel.querySelector('.srv-tab.is-active'));
      ctl.select(start < 0 ? 0 : start);
      bars.push(ctl);
    });

    /* ---- AUTO: one item every 15 seconds ----
       It advances through the current practice's pills, then rolls on to the next
       practice and starts at its first item, so a full lap covers all of them.

       It gives way to the reader in four ways: it never starts under
       prefers-reduced-motion, it holds while the pointer is over the section or focus is
       inside it, it holds while the section is off screen or the tab is in the
       background, and it stops for good the moment anyone picks a tab themselves —
       nothing yanks the panel out from under someone who is reading it. */
    if(reduce || bars.length !== panels.length) return;

    var DWELL = 15000;
    var timer = null, hovered = false, focused = false, onScreen = true, stopped = false;

    function advance(){
      var c = rail.index(), pills = bars[c];
      if(pills.index() < pills.count - 1){
        pills.select(pills.index() + 1);
      } else {
        var next = (c + 1) % cats.length;
        rail.select(next);
        bars[next].select(0);                       // each practice starts from its first item
      }
    }

    function run(){
      if(timer || stopped || hovered || focused || !onScreen || document.hidden) return;
      timer = setInterval(advance, DWELL);
    }
    function hold(){
      if(!timer) return;
      clearInterval(timer);
      timer = null;
    }
    /* a fresh interval on resume, so the item on screen gets its full 15 seconds rather
       than whatever was left of the one that was interrupted */
    function resume(){ hold(); run(); }

    section.addEventListener('mouseenter', function(){ hovered = true; hold(); });
    section.addEventListener('mouseleave', function(){ hovered = false; run(); });
    section.addEventListener('focusin',  function(){ focused = true; hold(); });
    section.addEventListener('focusout', function(){ focused = false; run(); });
    document.addEventListener('visibilitychange', function(){
      if(document.hidden) hold(); else resume();
    });

    /* capture phase: this has to win whether the tab handler above stops propagation or
       not, and a keyboard pick counts as taking control just as much as a click does */
    ['click','keydown'].forEach(function(ev){
      section.addEventListener(ev, function(e){
        var t = e.target;
        if(t && t.closest && t.closest('.srv-cat,.srv-tab')){
          stopped = true;
          hold();
        }
      }, true);
    });

    if('IntersectionObserver' in window){
      new IntersectionObserver(function(en){
        onScreen = en[0].isIntersecting;
        if(onScreen) run(); else hold();
      }, {threshold:0.15}).observe(section);
    }
    run();
  })();

  /* ---- scroll reveal ---- */
  /* ---- scroll parallax for the Problems cards ----
     Writes --py rather than `transform` directly, so it cannot collide with the reveal
     system (which sets transform on the elements it animates) or with the hover states.
     Note .pcard is deliberately NOT in the reveal groups below for that same reason. */
  (function(){
    if (reduce) return;
    var items = [].slice.call(document.querySelectorAll('[data-parallax]'));
    if (!items.length) return;
    var ticking = false;

    function frame(){
      ticking = false;
      var vh = window.innerHeight;
      for (var i = 0; i < items.length; i++){
        var el = items[i], r = el.getBoundingClientRect();
        // skip anything nowhere near the viewport — this runs on every scroll frame
        if (r.bottom < -200 || r.top > vh + 200) continue;
        // -1 entering from the bottom, +1 leaving past the top
        var p = ((vh - r.top) / (vh + r.height)) * 2 - 1;
        if (p < -1) p = -1; else if (p > 1) p = 1;
        var depth = parseFloat(el.getAttribute('data-parallax')) || 0;
        el.style.setProperty('--py', (-p * depth).toFixed(2) + 'px');
      }
    }
    function onScroll(){
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(frame);
    }
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onScroll, {passive:true});
    frame();
  })();

  /* ---- hero scrub, after the Craft Silicon pattern ----
     Their hero is pinned (ScrollTrigger pin+scrub over a 16-viewport runway) and the
     PAGE does not move — the hero's contents animate against scroll position instead.
     Ours is already pinned by `position:sticky`, so this only supplies the scrub: it
     publishes progress through the hero as --hp and lets CSS do the transform.
     Kept to a one-viewport runway rather than sixteen, so the first real content is
     still one scroll away — raise HERO_RUNWAY if a longer sequence is wanted. */
  (function(){
    var hero = document.querySelector('.hero');
    if (!hero || reduce) return;
    var HERO_RUNWAY = 1;            // in hero-heights
    var ticking = false;

    function frame(){
      ticking = false;
      var span = hero.offsetHeight * HERO_RUNWAY;
      var p = span ? window.pageYOffset / span : 0;
      if (p < 0) p = 0; else if (p > 1) p = 1;
      hero.style.setProperty('--hp', p.toFixed(4));
    }
    function onScroll(){
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(frame);
    }
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onScroll, {passive:true});
    frame();
  })();

  var groups = ['.hero__copy > *','.hero__aside > *','.scard','.problems__head','.problems__body > *',
                '.services__head > *','.srv-cats','.srv-panels','.cta__panel','.why__head > *',
                '.wcard','.why__foot','.contact__head','.cform','.ft__grid > *'];
  var targets = [];
  groups.forEach(function(sel){
    Array.prototype.forEach.call(document.querySelectorAll(sel), function(el, i){
      el.setAttribute('data-reveal','');
      el.style.setProperty('--d', Math.min(i,3) * 70 + 'ms');
      targets.push(el);
    });
  });

  if(reduce){
    targets.forEach(function(el){ el.classList.add('is-in'); });
  } else {
    /* A plain scroll sweep rather than an IntersectionObserver. The reveal hides
       real copy, so the one thing it must never do is leave a section blank —
       and an observer that misses an entry (throttled background tab, an anchor
       jump, a stalled callback) does exactly that, with no second chance. This
       re-checks on every scroll and resize, so anything on screen is always
       shown. 24 elements and a rAF guard: the cost is nil. */
    var sweep = function(){
      var limit = window.innerHeight - 60;
      targets = targets.filter(function(el){
        if(el.getBoundingClientRect().top < limit){ el.classList.add('is-in'); return false; }
        return true;
      });
      if(!targets.length){
        window.removeEventListener('scroll', sweep);
        window.removeEventListener('resize', sweep);
        window.removeEventListener('load', sweep);
      }
    };
    window.addEventListener('scroll', sweep, {passive:true});
    window.addEventListener('resize', sweep);
    /* a late webfont or image can shift the layout after first paint */
    window.addEventListener('load', sweep);
    sweep();
  }

  /* ---- the contact form is front-end only for now: confirm in place ---- */
  function wire(id, doneText){
    var form = document.getElementById(id);
    if(!form) return;
    var btn = form.querySelector('button[type="submit"]'), original = btn ? btn.textContent : '';
    form.addEventListener('submit', function(e){
      e.preventDefault();
      this.reset();
      if(!btn) return;
      form.classList.add('is-sent');
      btn.textContent = doneText;
      setTimeout(function(){ btn.textContent = original; form.classList.remove('is-sent'); }, 2600);
    });
  }
  /* #newsForm lives in the footer, which is inline on the page now; site-chrome.js
     wires it the same for every page. Only the contact form is on this page's own
     markup. */
  wire('contactForm', 'Message Sent');
})();

/* extracted from legacy/index.html — do not hand-edit; re-run npm run prepare:static */
(function(){
  var host = document.getElementById('supportDock');
  if(!host || !window.THREE) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SIZE   = host.clientWidth || 68;

  var renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(SIZE, SIZE);
  renderer.outputEncoding = THREE.sRGBEncoding;      // r128 spelling
  host.appendChild(renderer.domElement);

  var scene  = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 9.2);

  /* The disc behind the icon is gone, so the shell is blue-black rather than white —
     white had relied on that dark background and would dissolve against the light
     sections. Rim lights are pushed harder than the original's to keep the silhouette
     legible where it passes over the dark hero. */
  var GREEN = 0xAAC638, LEMON = 0xCFDE5D, SHELL = 0x1B2144;

  scene.add(new THREE.HemisphereLight(0xC9D4F0, 0x0B1030, 0.75));
  var key = new THREE.DirectionalLight(0xffffff, 1.0);  key.position.set(-4, 6, 8);  scene.add(key);
  var rim = new THREE.DirectionalLight(LEMON, 1.05);    rim.position.set(-6, 2, -6);  scene.add(rim);
  var rim2= new THREE.DirectionalLight(0x9FB8FF, 0.75); rim2.position.set(6, -2, -6); scene.add(rim2);

  /* Matte, to match the globe. MeshStandardMaterial is a PBR shader — its specular
     lobe is what produced the glossy moulded-plastic highlights of the original.
     Lambert is diffuse only: no specular term at all, so there is nothing to catch a
     highlight, while shading still describes the form. Going all the way to
     MeshBasicMaterial (what the globe itself uses) would be flat and unlit, which
     collapses a headset and a sphere into one unreadable silhouette at this size. */
  var greenMat = new THREE.MeshLambertMaterial({color:GREEN});
  var whiteMat = new THREE.MeshLambertMaterial({color:SHELL});

  function D(deg){ return deg * Math.PI / 180; }
  var root = new THREE.Group(); scene.add(root);
  var headset = new THREE.Group(); root.add(headset);
  var bubble  = new THREE.Group(); root.add(bubble);

  /* r128 has no CapsuleGeometry — build one from a cylinder and two hemispheres */
  function capsule(r, len, mat){
    var g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 18), mat));
    var a = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), mat); a.position.y =  len/2;
    var b = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), mat); b.position.y = -len/2;
    g.add(a); g.add(b);
    return g;
  }

  /* Open arc for the white frame. This MUST use class syntax: THREE.Curve is an ES6
     class in the r128 build, and an ES6 class constructor cannot be invoked via
     Curve.call(this) — the ES5 subclassing pattern throws
     "Class constructor cannot be invoked without 'new'". */
  class ArcCurve extends THREE.Curve {
    constructor(r, a0, sweep){ super(); this.r = r; this.a0 = a0; this.sweep = sweep; }
    getPoint(t, target){
      target = target || new THREE.Vector3();
      var a = this.a0 + this.sweep * t;
      return target.set(Math.cos(a) * this.r, Math.sin(a) * this.r, 0);
    }
  }

  var R_BUB = 1.55, R_RING = 2.37, T_RING = 0.145;
  var MIC_A = D(-76), RING_ARC = D(320), A_END = MIC_A + RING_ARC;

  var ringGeo = new THREE.TubeGeometry(new ArcCurve(R_RING, A_END, -RING_ARC), 200, T_RING, 12, false);
  headset.add(new THREE.Mesh(ringGeo, whiteMat));
  var ringTotal = ringGeo.index.count;
  ringGeo.setDrawRange(0, 0);

  var endCap = new THREE.Mesh(new THREE.SphereGeometry(T_RING, 16, 12), whiteMat);
  endCap.position.set(Math.cos(A_END) * R_RING, Math.sin(A_END) * R_RING, 0);
  headset.add(endCap);

  var bandGroup = new THREE.Group();
  var B_R = 2.42, B_T = 0.27, bStart = D(46), bArc = D(88);
  var band = new THREE.Mesh(new THREE.TorusGeometry(B_R, B_T, 16, 60, bArc), greenMat);
  band.rotation.z = bStart; band.scale.z = 0.9;
  bandGroup.add(band);
  [bStart, bStart + bArc].forEach(function(a){
    var c = new THREE.Mesh(new THREE.SphereGeometry(B_T, 18, 12), greenMat);
    c.position.set(Math.cos(a) * B_R, Math.sin(a) * B_R, 0); c.scale.z = 0.9;
    bandGroup.add(c);
  });
  headset.add(bandGroup);

  function makeCup(s){
    var g = new THREE.Group();
    var body = capsule(0.53, 0.62, whiteMat);
    var pad  = capsule(0.47, 0.60, greenMat); pad.position.x = s * 0.30;
    var cap  = capsule(0.36, 0.46, whiteMat); cap.position.x = s * 0.56;
    g.add(body); g.add(pad); g.add(cap);
    g.position.set(s * 2.35, 0, 0);
    headset.add(g);
    return g;
  }
  var cupL = makeCup(-1), cupR = makeCup(1);

  var micTip = capsule(0.245, 0.50, greenMat);
  micTip.rotation.z = MIC_A;
  micTip.position.set(Math.cos(MIC_A) * R_RING * 0.97, Math.sin(MIC_A) * R_RING * 0.97, 0);
  headset.add(micTip);

  bubble.add(new THREE.Mesh(new THREE.SphereGeometry(R_BUB, 40, 28), whiteMat));
  var tail = new THREE.Mesh(new THREE.ConeGeometry(0.58, 1.15, 24), whiteMat);
  tail.rotation.z = D(151); tail.position.set(-0.82, -1.50, 0);
  bubble.add(tail);

  /* dots on both faces, so the icon still reads while it sways */
  var dots = [];
  [1, -1].forEach(function(side){
    [-0.78, 0, 0.78].forEach(function(x, i){
      var y = 0.10;
      var z = Math.sqrt(Math.max(0, R_BUB*R_BUB - x*x - y*y)) * side * 0.97;
      var d = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 14), greenMat);
      d.position.set(x, y, z); d.scale.setScalar(0.0001); d.userData.order = i;
      bubble.add(d); dots.push(d);
    });
  });

  /* ---- hand-rolled easing, replacing the GSAP timeline ---- */
  function cl(v){ return v < 0 ? 0 : (v > 1 ? 1 : v); }
  function seg(t, start, dur){ return cl((t - start) / dur); }
  function outBack(x){ var c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
  function inOut(x){ return x < 0.5 ? 2*x*x : 1 - Math.pow(-2*x + 2, 2) / 2; }

  var INTRO_END = 2.15, DOT_CYCLE = 3.6;

  function pose(t){
    ringGeo.setDrawRange(0, Math.floor(inOut(seg(t, 0, 1.0)) * ringTotal));
    endCap.scale.setScalar(outBack(seg(t, 0.85, 0.35)) || 0.0001);

    var b = seg(t, 0.50, 0.70), be = outBack(b);
    bandGroup.position.y = (1 - be) * 1.6;
    bandGroup.scale.setScalar(0.5 + 0.5 * be);

    var c = outBack(seg(t, 0.55, 0.70));
    cupL.position.x = -2.35 - (1 - c) * 2.45;
    cupR.position.x =  2.35 + (1 - c) * 2.45;

    micTip.scale.setScalar(Math.max(0.0001, outBack(seg(t, 0.90, 0.50))));
    bubble.scale.setScalar(Math.max(0.0001, outBack(seg(t, 1.05, 1.05))));

    /* typing dots: staggered in, hold, staggered out, repeating */
    var dt = t - INTRO_END;
    for (var i = 0; i < dots.length; i++){
      var d = dots[i], o = d.userData.order, s;
      if (dt < 0){ s = 0.0001; }
      else {
        var ph = dt % DOT_CYCLE;
        var up = outBack(seg(ph, o * 0.22, 0.50));
        var dn = 1 - inOut(seg(ph, 2.30 + o * 0.09, 0.32));
        s = Math.max(0.0001, Math.min(up, dn));
        d.position.y = 0.10 + Math.sin((dt + o * 0.16) * 4.2) * 0.06;
      }
      d.scale.setScalar(s);
    }
  }

  var clock = new THREE.Clock();
  /* Rotation comes in bursts rather than a constant sway: a full turn over SPIN_DUR,
     then a pause until the next interval. Ending on a full 2PI means the resting pose
     is identical to the starting one, so the hold has no visible snap. */
  var SPIN_EVERY = 5.5, SPIN_DUR = 1.6;

  function onResize(){
    var s = host.clientWidth || SIZE;
    if (s === SIZE) return;
    SIZE = s; renderer.setSize(SIZE, SIZE);
  }
  window.addEventListener('resize', onResize, {passive:true});

  if (reduce){
    pose(99);                                   // settled pose, no motion
    dots.forEach(function(d){ d.scale.setScalar(1); });
    renderer.render(scene, camera);
    return;                                     // no rAF loop at all
  }

  (function frame(){
    requestAnimationFrame(frame);
    if (document.hidden) return;
    var t = clock.getElapsedTime();
    pose(t);
    /* burst-spin: one full turn, then rest until the next interval */
    var ph = (t % SPIN_EVERY) / SPIN_DUR;
    root.rotation.y = ph < 1 ? inOut(ph) * Math.PI * 2 : 0;
    root.rotation.x = Math.sin(t * 0.45) * 0.03 + 0.02;
    root.position.y = Math.sin(t * 1.2) * 0.07;
    renderer.render(scene, camera);
  })();
})();

/* extracted from legacy/index.html — do not hand-edit; re-run npm run prepare:static */
(function(){
  var host = document.getElementById('srvIcon');
  if(!host || !window.THREE) return;

  /* The column is display:none below 901px. Allocating a WebGL context there would cost
     memory on exactly the devices that can least afford it, for something that never
     renders — so the build waits until the column actually has a box.

     What matters is WHEN that gets tested. The original asked `host.offsetParent` inline
     and, on a null answer, waited for a resize: a reading taken mid-parse is not reliable,
     and a desktop that answered null was never going to fire a resize, so the icon never
     built at all. So the test is deferred out of parsing and retried from three
     independent wake-ups — a task, the load event, and resize. None of them depends on
     the compositor, which rules out the whole class of "never built" failure.

     `attempt` is idempotent, so it does not matter how many of them fire — and a short
     bounded poll backs them up, for a layout that settles late without announcing it. */
  var built = false, poll = null, tries = 0;
  function attempt(){
    if(built || !host.offsetParent) return false;
    built = true;
    clearInterval(poll);
    window.removeEventListener('resize', attempt);
    window.removeEventListener('load', attempt);
    build();
    return true;
  }
  setTimeout(attempt, 0);                              // after parse, out of the parser's way
  window.addEventListener('load', attempt, {passive:true});
  window.addEventListener('resize', attempt, {passive:true});   // narrow -> wide, later on
  /* ~5s ceiling, then it gives up and leaves the resize listener to it — long enough for a
     slow first layout, short enough that a genuinely narrow screen is not polled forever */
  poll = setInterval(function(){ if(attempt() || ++tries > 12) clearInterval(poll); }, 400);

  function build(){
  /* Blue and blue-black across all three marks. Green survives in exactly one place —
     the blinking server LEDs — which is what makes them read as live activity rather
     than as more structure. BLACK is for the shield's tick, where blue-black would not
     separate from the blue body it sits on. */
  var BLUE = 0x2D6BE4, BLUE_LT = 0x7FA8F5, BLUE_BLK = 0x141A3E, BLACK = 0x0B0E1C;
  var GREEN = 0xAAC638, LED_DIM = 0x25305E;   // the LED's off state, not a third colour
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var size = Math.max(160, Math.min(288, host.clientWidth || 260));
  var renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(size, size);
  host.appendChild(renderer.domElement);

  var scene  = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(5.8, 5.0, 7.4);
  camera.lookAt(0.05, 0.35, 0);

  /* Matte materials — Lambert has zero specular shine / glare. Only marks 02 and 03
     use them; 01 is built from unlit Points and Basic materials, like the hero globe. */
  var matBlue   = new THREE.MeshLambertMaterial({color:BLUE});
  var matBlueLt = new THREE.MeshLambertMaterial({color:BLUE_LT});
  var matBlueBlk= new THREE.MeshLambertMaterial({color:BLUE_BLK});
  var matBlack  = new THREE.MeshLambertMaterial({color:BLACK});
  /* the rack's blade LEDs blink between these two — the one place green survives */
  var matGreen  = new THREE.MeshLambertMaterial({color:GREEN});
  var matLedDim = new THREE.MeshLambertMaterial({color:LED_DIM});

  scene.add(new THREE.HemisphereLight(0xffffff, 0x48547a, 0.95));
  var key = new THREE.DirectionalLight(0xffffff, 1.0); key.position.set(7, 12, 9); scene.add(key);
  var fill = new THREE.DirectionalLight(0x7e8ea6, 0.45); fill.position.set(-6, 3, -5); scene.add(fill);

  var groups = [];
  var animUpdaters = [];
  function make(){ var g = new THREE.Group(); g.visible = false; scene.add(g); groups.push(g); return g; }

  /* ---- 01 IT Infrastructure & Networking: a solid rack, a solid cloud, two uplinks ----
     Built from the same matte Lambert solids as the </> and shield marks that follow, so
     the three read as one set. It is a mark rather than a model: one chassis, four blades
     and a cloud, at a weight that survives being drawn 288px wide. The only moving parts
     are the green blade LEDs, a cube climbing each uplink, and the cloud's drift. */
  (function(){
    var g = make();
    g.position.set(-0.25, -0.15, 0);

    function box(w, h, d, mat, x, y, z){
      var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      g.add(m);
      return m;
    }

    var TX = -0.85, TZ = 0;                       // tower centre
    var TW = 1.94, TH = 2.86, TD = 1.86;          // chassis
    var BASE_Y = -1.34, FLOOR = BASE_Y + 0.09;

    /* base slab, then the chassis sitting on it */
    box(TW + 0.42, 0.18, TD + 0.34, matBlueBlk, TX, BASE_Y, TZ);
    box(TW, TH, TD, matBlueBlk, TX, FLOOR + TH / 2, TZ);
    /* a blue cap, so the tower is not one unbroken block from base to top */
    box(TW + 0.1, 0.16, TD + 0.1, matBlue, TX, FLOOR + TH + 0.08, TZ);

    /* four blades, proud of the front and right faces, each with an LED at its end */
    var leds = [];
    [-0.37, 0.29, 0.95, 1.61].forEach(function(y, i){
      box(TW * 0.9, 0.4, 0.14, matBlue, TX, y, TZ + TD / 2 + 0.06);      // front face
      box(0.14, 0.4, TD * 0.9, matBlue, TX + TW / 2 + 0.06, y, TZ);      // right face

      var f = box(0.15, 0.15, 0.1, matGreen, TX + TW * 0.33, y, TZ + TD / 2 + 0.17);
      var r = box(0.1, 0.15, 0.15, matGreen, TX + TW / 2 + 0.17, y, TZ + TD * 0.3);
      leds.push({mesh:f, speed:2.2 + i * 0.55, offset:i * 1.3});
      leds.push({mesh:r, speed:2.6 + i * 0.42, offset:i * 1.7 + 0.6});
    });

    /* the cloud: the same extruded silhouette this mark has always used, in blue */
    var cloudGroup = new THREE.Group();
    var CLOUD_Y = 2.66;
    cloudGroup.position.set(1.74, CLOUD_Y, 0.26);
    cloudGroup.rotation.set(-0.1, 0.5, 0.03);       // turned toward the camera's azimuth
    g.add(cloudGroup);

    var cs = new THREE.Shape();
    cs.moveTo(-0.9, -0.45);
    cs.lineTo(0.9, -0.45);
    cs.bezierCurveTo(1.35, -0.45, 1.45, -0.05, 1.35, 0.35);
    cs.bezierCurveTo(1.45, 0.8, 1.05, 1.15, 0.65, 1.15);
    cs.bezierCurveTo(0.5, 1.55, -0.2, 1.6, -0.45, 1.3);
    cs.bezierCurveTo(-0.85, 1.35, -1.2, 1.05, -1.15, 0.65);
    cs.bezierCurveTo(-1.45, 0.4, -1.45, -0.1, -1.2, -0.45);
    cs.lineTo(-0.9, -0.45);
    cs.closePath();
    var cloudGeo = new THREE.ExtrudeGeometry(cs, {
      depth:0.5, bevelEnabled:true, bevelSegments:3, steps:1, bevelSize:0.13, bevelThickness:0.13
    });
    cloudGeo.center();
    var cloudMesh = new THREE.Mesh(cloudGeo, matBlue);
    cloudMesh.scale.setScalar(0.76);
    cloudGroup.add(cloudMesh);

    /* Two uplinks: an L of solid bars from the floor beside the tower up to the cloud,
       with a cube climbing each. Drawn as geometry rather than lines because
       LineBasicMaterial ignores linewidth on nearly every platform. */
    var START_X = TX + TW / 2 + 0.28, TURN_X = 1.32, TOP_Y = CLOUD_Y - 0.72;
    var BAR = 0.1;
    var packets = [];
    [-0.2, 0.22].forEach(function(lz, i){
      var hLen = TURN_X - START_X;
      box(hLen, BAR, BAR, matBlue, START_X + hLen / 2, FLOOR, lz);
      var vLen = TOP_Y - FLOOR;
      box(BAR, vLen, BAR, matBlue, TURN_X, FLOOR + vLen / 2, lz);
      var cube = box(0.19, 0.19, 0.19, matBlueLt, START_X, FLOOR, lz);
      packets.push({mesh:cube, hLen:hLen, vLen:vLen, lz:lz, speed:0.34 + i * 0.05, offset:i * 0.5});
    });

    if (reduce) return;                             // built pose is the settled pose

    animUpdaters[0] = function(t){
      cloudGroup.position.y = CLOUD_Y + Math.sin(t * 1.6) * 0.07;

      for (var p = 0; p < packets.length; p++){
        var pk = packets[p], total = pk.hLen + pk.vLen;
        var dist = ((t * pk.speed + pk.offset) % 1) * total;
        if (dist < pk.hLen) pk.mesh.position.set(START_X + dist, FLOOR, pk.lz);
        else pk.mesh.position.set(TURN_X, FLOOR + (dist - pk.hLen), pk.lz);
      }

      /* the blink: swapping the material rather than tinting one, which is what the rest
         of this file does and what keeps every LED sharing two materials */
      for (var i = 0; i < leds.length; i++){
        var d = leds[i];
        d.mesh.material = Math.sin(t * d.speed + d.offset) > 0.05 ? matGreen : matLedDim;
      }
    };
  })();

  /* ---- 02 developer: the </> mark, built from beams ---- */
  (function(){
    var g = make();
    function beam(len, x, y, rot, mat){
      var m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.42, 0.42), mat);
      m.position.set(x, y, 0); m.rotation.z = rot;
      return m;
    }
    var D2R = Math.PI / 180;
    // left chevron
    g.add(beam(1.9, -1.35,  0.62,  135 * D2R, matBlue));
    g.add(beam(1.9, -1.35, -0.62, -135 * D2R, matBlue));
    // right chevron
    g.add(beam(1.9,  1.35,  0.62,  45 * D2R, matBlue));
    g.add(beam(1.9,  1.35, -0.62, -45 * D2R, matBlue));
    // the slash between them, blue-black so it separates from the chevrons it crosses
    g.add(beam(3.0, 0, 0, 72 * D2R, matBlueBlk));
  })();

  /* ---- 03 cyber shield: an extruded shield with a tick ---- */
  (function(){
    var g = make();
    var s = new THREE.Shape();
    s.moveTo(0, 2.0);
    s.lineTo(-1.55, 1.25);
    s.lineTo(-1.55, -0.3);
    s.quadraticCurveTo(-1.5, -1.65, 0, -2.15);
    s.quadraticCurveTo(1.5, -1.65, 1.55, -0.3);
    s.lineTo(1.55, 1.25);
    s.closePath();
    var body = new THREE.Mesh(new THREE.ExtrudeGeometry(s, {
      depth:0.42, bevelEnabled:true, bevelSize:0.07, bevelThickness:0.07, bevelSegments:2
    }), matBlue);
    body.position.z = -0.2;
    g.add(body);
    // tick, sitting proud of the face. Black, not blue-black: on a blue body the two
    // blues sit too close to read as separate shapes at this size.
    function stroke(len, x, y, rot){
      var m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.3, 0.3), matBlack);
      m.position.set(x, y, 0.42); m.rotation.z = rot;
      return m;
    }
    g.add(stroke(1.0, -0.42, -0.28, -50 * Math.PI/180));
    g.add(stroke(1.75, 0.34, 0.13,  50 * Math.PI/180));
  })();

  var active = 0;
  groups[0].visible = true;

  document.addEventListener('srv:change', function(e){
    var i = e.detail && e.detail.index;
    if(typeof i !== 'number' || i < 0 || i >= groups.length || i === active) return;
    groups[active].visible = false;
    active = i;
    groups[active].visible = true;
    groups[active].rotation.y = -0.3;
  });

  function resize(){
    var s = Math.max(160, Math.min(288, host.clientWidth || 260));
    renderer.setSize(s, s);
  }
  window.addEventListener('resize', resize);

  /* only render while the section is actually on screen */
  var onScreen = true;
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(en){ onScreen = en[0].isIntersecting; },
      {threshold:0}).observe(host);
  }

  // Mouse parallax interaction
  var mouseX = 0, mouseY = 0, targetRotX = 0, targetRotY = 0;
  host.addEventListener('mousemove', function(e){
    var rect = host.getBoundingClientRect();
    var x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    var y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    targetRotY = x * 0.15;
    targetRotX = -y * 0.1;
  });
  host.addEventListener('mouseleave', function(){
    targetRotX = 0;
    targetRotY = 0;
  });

  var clock = new THREE.Clock();
  (function tick(){
    requestAnimationFrame(tick);
    if(!onScreen || document.hidden) return;
    var t = clock.getElapsedTime();
    var g = groups[active];

    if (animUpdaters[active]) {
      animUpdaters[active](t);
    }

    if(!reduce){
      if (active === 0) {
        var idleRotY = Math.sin(t * 0.4) * 0.03;
        var idleRotX = Math.sin(t * 0.6) * 0.015;
        g.rotation.y += (targetRotY + idleRotY - g.rotation.y) * 0.05;
        g.rotation.x += (targetRotX + idleRotX - g.rotation.x) * 0.05;
      } else {
        g.rotation.y += (0.5 - g.rotation.y) * 0.06 + 0.006;
        g.rotation.x = Math.sin(t * 0.5) * 0.12;
        g.position.y = Math.sin(t * 1.1) * 0.09;
      }
    }
    renderer.render(scene, camera);
  })();
  }
})();

/* extracted from legacy/index.html — do not hand-edit; re-run npm run prepare:static */
(function(){
  var track  = document.getElementById('blogTrack');
  var prev   = document.getElementById('blogPrev');
  var next   = document.getElementById('blogNext');
  if(!track || !prev || !next) return;

  var STEP = 322; /* card width (300) + gap (22) */
  var pos  = 0;

  function clamp(v){
    var maxScroll = track.scrollWidth - track.parentElement.offsetWidth;
    return Math.max(0, Math.min(v, maxScroll));
  }

  function go(delta){
    pos = clamp(pos + delta);
    track.style.transform = 'translateX(-' + pos + 'px)';
    prev.style.opacity = pos <= 0 ? '0.4' : '1';
    next.style.opacity = pos >= clamp(pos + 1) ? '0.4' : '1';
  }

  prev.addEventListener('click', function(){ go(-STEP); });
  next.addEventListener('click', function(){ go(STEP); });
  go(0); /* set initial arrow states */

  /* ---- tab switching ---- */
  var tabs = document.querySelectorAll('#blogTabs .blog__tab');
  tabs.forEach(function(btn){
    btn.addEventListener('click', function(){
      tabs.forEach(function(t){
        t.classList.remove('blog__tab--active');
        t.classList.add('blog__tab--inactive');
        t.setAttribute('aria-selected','false');
      });
      btn.classList.remove('blog__tab--inactive');
      btn.classList.add('blog__tab--active');
      btn.setAttribute('aria-selected','true');
      pos = 0;
      track.style.transform = 'translateX(0)';
    });
  });
})();
