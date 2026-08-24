/* ============================================================================
   SITE CHROME — behaviour for the shared header and footer, which now ship
   inline in every page rather than being fetched from partials.

   The markup is IN the pages (index.html, about.html, service.html,
   cybersecurity.html): one <header> and one <footer>, near-identical across
   pages. Rendering them needs no network request, so the pages work even when
   opened straight off disk (file://).

   What this file does, given that markup:

     header   phases the .nav bar as you scroll. Header 1 (overlay) is
              transparent over a dark hero and turns frosted once the hero has
              scrolled past; where data-hide-until names a section (homepage)
              it first steps out of the way so it never sits on the stats row.
              Header 2 (solid) is frosted from the first pixel and needs nothing
              beyond pinning the state.

              Per-page configuration lives on the <header> element itself:
                data-header="1|2"     which header (default "2" — the safe one)
                data-hero=".hero"     the dark hero header 1 sits on
                data-hide-until=".serve"  section the bar stays hidden until;
                      omit for a straight transparent-to-frosted crossfade

              The active nav link and the Industries href are marked in the
              page's own markup now (class="active" + aria-current="page"),
              because the markup is per page rather than one shared file.

     footer   wires the newsletter form (#newsForm). The form's markup is inline
              with the footer now, but wiring it here — once, for every page —
              beats a copy of the same handler in each page's script.

   Styling for all of it is in public/assets/css/site-chrome.css.
   ============================================================================ */
(function(){
  'use strict';

  var LOGO_LIGHT = 'public/assets/logo/Bahir Tech Logo.svg',       // white  — over the dark hero
      LOGO_DARK  = 'public/assets/logo/Bahir Tech Logo color.svg'; // colour — on the frosted bar

  /* ---- header behaviour -----------------------------------------------------
     Header 2 has none: it is frosted from the start, so it pins the state and
     stops. Header 1 phases as you scroll, in one of two lengths:

       two phases   transparent to frosted, crossfading as the hero's bottom edge
                    reaches the bar. What the interior pages do.
       three phases transparent, hidden, then frosted, when `data-hide-until`
                    names a section. The homepage needs this: its hero ends in a
                    row of stats the bar would sit on top of, so it steps out of
                    the way and comes back once the next section is under it.

     The listener set is scroll + resize + load. `load` matters: a hero's height
     is not final until its webfont and background image have landed, and a phase
     boundary computed from a stale height puts the crossfade in the wrong place. */
  function initHeader(nav){
    var logo = nav.querySelector('.nav__logo img'),
        body = document.body;

    if(nav.getAttribute('data-header') !== '1'){
      body.setAttribute('data-nav', 'glass');
      return;
    }

    var hero   = nav.getAttribute('data-hero')
                     ? document.querySelector(nav.getAttribute('data-hero')) : null,
        next   = nav.getAttribute('data-hide-until')
                     ? document.querySelector(nav.getAttribute('data-hide-until')) : null,
        state  = null;

    function apply(){
      var y = window.pageYOffset, n;

      if(!hero){
        /* Nothing dark to be transparent over. Frost almost immediately rather
           than leaving a white-on-white bar sitting there unreadable. */
        n = y > 40 ? 'glass' : 'top';
      } else if(next){
        var hideAt = hero.offsetHeight * 0.4,
            showAt = next.offsetTop + Math.min(160, next.offsetHeight * 0.25);
        n = y < hideAt ? 'top' : (y < showAt ? 'hide' : 'glass');
      } else {
        var edge = Math.max(0, hero.offsetHeight - nav.offsetHeight - 20);
        n = y > edge ? 'glass' : 'top';
      }

      if(n === state) return;
      state = n;
      if(n === 'top') body.removeAttribute('data-nav');
      else body.setAttribute('data-nav', n);
      if(logo) logo.src = (n === 'glass') ? LOGO_DARK : LOGO_LIGHT;
    }

    function onScroll(){
      if('requestAnimationFrame' in window) requestAnimationFrame(apply);
      else apply();
    }
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onScroll, {passive:true});
    window.addEventListener('load', onScroll, {passive:true});
    apply();
  }

  /* ---- the newsletter form --------------------------------------------------
     Front-end only for now, so it just confirms in place. The form's markup is
     inline with the footer on every page; it is wired here — once, in one place
     — rather than in a copy inside each page's script. */
  function initFooter(){
    var form = document.getElementById('newsForm');
    if(!form) return;
    var btn = form.querySelector('button[type="submit"]'),
        original = btn ? btn.textContent : '';
    form.addEventListener('submit', function(e){
      e.preventDefault();
      this.reset();
      if(!btn) return;
      form.classList.add('is-sent');
      btn.textContent = 'Joined';
      setTimeout(function(){
        btn.textContent = original;
        form.classList.remove('is-sent');
      }, 2600);
    });
  }

  /* ---- mount ----------------------------------------------------------------
     The chrome is already in the document — nothing is fetched, nothing is
     replaced. All that is left is to give the inline header its scroll phases
     and the footer form its submit behaviour. */
  function mount(){
    initHeader(document.getElementById('navbar'));
    initFooter();
    /* Fired for anything that must act once the chrome is in place. Kept from
       the fetch era, when the header and footer landed a moment after the rest
       of the document; the markup has been inline since, but the event still
       marks "chrome present and behaving". */
    document.dispatchEvent(new CustomEvent('site-chrome:ready'));
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();