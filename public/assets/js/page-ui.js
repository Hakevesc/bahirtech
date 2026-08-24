/* ============================================================================
   PAGE UI — the interactive layer for service.html and about.html.

   Both pages shipped with their markup and styles but with no script at all: they
   still carried the `<!-- SECTION UI -->` comment where it should have been, and 26
   and 41 `[data-reveal]` elements respectively. Since `[data-reveal]{opacity:0}`
   holds real copy hidden until something adds `.is-in`, and nothing ever did, both
   pages rendered as blank space below the hero.

   index.html keeps its own inline copies of these behaviours. This file is shared by
   the other two rather than pasted into each, so a fix lands in one place.

   The header and footer are NOT here — that markup is inlined in every page, and
   public/assets/js/site-chrome.js only adds their scroll phase behaviour.
   ============================================================================ */
(function(){
  'use strict';

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- scroll reveal ----
     A plain scroll sweep, matching index.html, and deliberately NOT an
     IntersectionObserver: this system hides real copy, so the one thing it must never
     do is leave a section blank. An observer that misses an entry — throttled
     background tab, an anchor jump straight into the middle of the page, a stalled
     callback — does exactly that, with no second chance. A sweep re-checks on every
     scroll and resize, so whatever is on screen is always shown. */
  (function(){
    var targets = [].slice.call(document.querySelectorAll('[data-reveal]'));
    if(!targets.length) return;

    /* stagger siblings a little, the way index.html does */
    targets.forEach(function(el, i){
      if(!el.style.getPropertyValue('--d')) el.style.setProperty('--d', Math.min(i, 3) * 70 + 'ms');
    });

    if(reduce){
      targets.forEach(function(el){ el.classList.add('is-in'); });
      return;
    }

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

    /* Last resort. If scroll and resize somehow never fire and load has already gone,
       this still uncovers everything rather than leaving the page looking empty —
       which is the exact failure this file exists to fix. */
    setTimeout(function(){
      if(targets.length && window.pageYOffset === 0) sweep();
    }, 1200);
  })();

  /* The header used to be driven from here, with its own copy of the phase logic and
     its own bugs. The phase behaviour now comes from public/assets/js/site-chrome.js;
     the header and footer markup itself is inlined in every page. */

  /* ---- support panel: open/close, and the WhatsApp hand-off ----
     Same behaviour as index.html's copy. The link only ever opens WhatsApp's compose
     screen with the text prefilled — nothing is sent without the sender pressing send
     there themselves. */
  (function(){
    var btn   = document.getElementById('supportDock'),
        pop   = document.getElementById('supportPop'),
        shutX = document.getElementById('spopClose'),
        msg   = document.getElementById('spopMsg'),
        send  = document.getElementById('spopSend');
    if(!btn || !pop || !msg || !send) return;

    var WA_NUMBER = '251915965321';   // wa.me wants digits only — no +, spaces or dashes

    function syncLink(){
      var text = (msg.value || '').trim();
      send.href = 'https://wa.me/' + WA_NUMBER +
                  (text ? '?text=' + encodeURIComponent(text) : '');
    }
    msg.addEventListener('input', syncLink);
    syncLink();

    function open(){
      pop.hidden = false;
      pop.classList.add('is-closed');
      /* Force a reflow so the browser has a start state to animate from. A rAF callback
         would be the usual trick, but it never fires in a backgrounded tab and the panel
         would then be stuck invisible — this is synchronous and cannot stall. */
      void pop.offsetHeight;
      pop.classList.remove('is-closed');
      btn.setAttribute('aria-expanded','true');
      msg.focus();
    }
    function shut(){
      pop.classList.add('is-closed');
      btn.setAttribute('aria-expanded','false');
      setTimeout(function(){
        if(pop.classList.contains('is-closed')) pop.hidden = true;
      }, 230);
    }
    function toggle(){ btn.getAttribute('aria-expanded') === 'true' ? shut() : open(); }

    btn.addEventListener('click', toggle);
    if(shutX) shutX.addEventListener('click', shut);
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && !pop.hidden) shut();
    });
    document.addEventListener('click', function(e){
      if(pop.hidden) return;
      if(!pop.contains(e.target) && !btn.contains(e.target)) shut();
    });
    // the link opens in a new tab, so tidy the panel away behind it
    send.addEventListener('click', function(){ setTimeout(shut, 150); });
  })();

  /* The newsletter form is not wired here any more: it lives in the footer partial
     and arrives with it, so public/assets/js/site-chrome.js wires it on mount. */
})();
