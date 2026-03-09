/* 공통 스크립트 */
window.IS_AUTO_PAGING = true;

(function initPageTransition(global){
  if(global.WBPageTransition) return;

  const FADE_MS = 130;
  const root = document.documentElement;

  function injectFadeStyle(){
    if(document.getElementById("wb-page-fade-style")) return;
    const style = document.createElement("style");
    style.id = "wb-page-fade-style";
    style.textContent = `
      html.wb-fade-init .app-shell{
        opacity:0;
        transform:translateY(4px);
      }
      html.wb-fade-ready .app-shell{
        opacity:1;
        transform:translateY(0);
        transition:opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
      }
      html.wb-fade-out .app-shell{
        opacity:0;
        transform:translateY(4px);
      }
    `;
    document.head.appendChild(style);
  }

  function fadeIn(){
    injectFadeStyle();
    root.classList.add("wb-fade-init");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.add("wb-fade-ready");
        root.classList.remove("wb-fade-init");
      });
    });
  }

  function fadeOutAndNavigate(url, delayMs){
    const delay = typeof delayMs === "number" ? delayMs : 0;
    setTimeout(() => {
      root.classList.add("wb-fade-out");
      setTimeout(() => {
        global.location.href = url;
      }, FADE_MS);
    }, delay);
  }

  global.WBPageTransition = {
    FADE_MS,
    fadeIn,
    fadeOutAndNavigate
  };

  fadeIn();
})(window);

(function initAutoPaging(global){
  if(global.WBAutoPaging) return;

  const sequence = [
    "p1.html", "p2.html", "p3.html", "p4.html", "p5.html", "p6.html",
    "p7.html", "p8.html", "p9.html", "p10.html", "p11.html", "p12.html"
  ];

  function getCurrentPageName(){
    const path = global.location.pathname || "";
    return path.split("/").pop().toLowerCase();
  }

  function getNextPageName(){
    const current = getCurrentPageName();
    const idx = sequence.indexOf(current);
    if(idx < 0 || idx >= sequence.length - 1) return null;
    return sequence[idx + 1];
  }

  function moveToNext(delayMs){
    const next = getNextPageName();
    if(!next) return;
    global.WBPageTransition?.fadeOutAndNavigate?.(`./${next}`, typeof delayMs === "number" ? delayMs : 600);
  }

  function moveToNextIfEnabled(delayMs){
    if(global.IS_AUTO_PAGING !== true) return;
    moveToNext(delayMs);
  }

  global.WBAutoPaging = {
    sequence,
    getCurrentPageName,
    getNextPageName,
    moveToNext,
    moveToNextIfEnabled
  };
})(window);
