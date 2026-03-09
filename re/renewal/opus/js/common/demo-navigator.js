const SEQUENCE = [
  'p0','p1','p3','p4','p5','p6','p7','p8','p9','p10','p11','p12','p13'
];

function getBasePath() {
  const path = window.location.pathname;
  const idx = path.lastIndexOf('/');
  return path.substring(0, idx + 1);
}

function getCurrentFileName() {
  const path = window.location.pathname;
  const name = path.substring(path.lastIndexOf('/') + 1);
  return name.replace('.html', '');
}

export const DemoNavigator = {
  _autoNav: false,

  getCurrentPage() {
    return getCurrentFileName() || 'p0';
  },

  getCurrentIndex() {
    return SEQUENCE.indexOf(this.getCurrentPage());
  },

  getNextPage() {
    const idx = this.getCurrentIndex();
    if (idx < 0 || idx >= SEQUENCE.length - 1) return null;
    return SEQUENCE[idx + 1];
  },

  getPrevPage() {
    const idx = this.getCurrentIndex();
    if (idx <= 0) return null;
    return SEQUENCE[idx - 1];
  },

  goTo(page) {
    const target = page.endsWith('.html') ? page : page + '.html';
    this._fadeOutAndNavigate(getBasePath() + target);
  },

  next() {
    if (!this._autoNav) return;
    const np = this.getNextPage();
    if (np) this.goTo(np);
  },

  forceNext() {
    const np = this.getNextPage();
    if (np) this.goTo(np);
  },

  prev() {
    const pp = this.getPrevPage();
    if (pp) this.goTo(pp);
  },

  toggleAutoNav() {
    this._autoNav = !this._autoNav;
    return this._autoNav;
  },

  moveToNextIfAuto(delayMs = 0) {
    const np = this.getNextPage();
    if (!np) return;
    setTimeout(() => {
      this._fadeOutAndNavigate(getBasePath() + np + '.html');
    }, delayMs);
  },

  fadeIn() {
    const shell = document.querySelector('.app-shell');
    if (!shell) return;
    shell.classList.add('wb-fade-init');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        shell.classList.remove('wb-fade-init');
        shell.classList.add('wb-fade-ready');
      });
    });
  },

  _fadeOutAndNavigate(url) {
    if (typeof DemoEngine !== 'undefined') DemoEngine._allowNav = true;
    const shell = document.querySelector('.app-shell');
    if (!shell) { window.location.href = url; return; }
    shell.classList.remove('wb-fade-ready');
    shell.classList.add('wb-fade-out');
    setTimeout(() => { window.location.href = url; }, 100);
  },

  autoScale() {
    const shell = document.querySelector('.app-shell');
    if (!shell) return;
    const scaleX = window.innerWidth / 1920;
    const scaleY = window.innerHeight / 1080;
    const scale = Math.min(scaleX, scaleY, 1);
    if (scale < 1) {
      shell.style.transform = `scale(${scale})`;
      shell.style.transformOrigin = 'top left';
    }
  }
};
