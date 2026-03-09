let _el = null;
let _visible = true;

export const DemoIndicator = {
  init() {
    _el = document.createElement('div');
    _el.id = 'demo-indicator';
    Object.assign(_el.style, {
      position: 'fixed',
      bottom: '12px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.7)',
      color: '#fff',
      padding: '4px 16px',
      borderRadius: '20px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: '9999',
      pointerEvents: 'none',
      transition: 'opacity 0.2s',
      userSelect: 'none',
    });
    document.body.appendChild(_el);
  },

  update(page, speed, mode) {
    if (!_el) return;
    const speedLabel = speed === 1.0 ? '1×' : speed.toFixed(1) + '×';
    _el.textContent = `${page.toUpperCase()} │ ${mode} │ ${speedLabel} │ ← → Space Esc I`;
    _el.style.opacity = _visible ? '1' : '0';
  },

  toggle() {
    _visible = !_visible;
    if (_el) _el.style.opacity = _visible ? '1' : '0';
  },

  hide() {
    _visible = false;
    if (_el) _el.style.opacity = '0';
  },

  show() {
    _visible = true;
    if (_el) _el.style.opacity = '1';
  }
};
