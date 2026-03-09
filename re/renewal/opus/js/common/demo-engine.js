import { StateManager } from './state-manager.js';
import { DemoNavigator } from './demo-navigator.js';
import { DemoIndicator } from './demo-indicator.js';

const BLOCKED_KEYS = new Set(['F5', 'F6', 'Tab']);
const BLOCKED_COMBOS = [
  { ctrl: true, key: 'r' }, { ctrl: true, key: 'w' }, { ctrl: true, key: 'l' },
  { ctrl: true, key: 's' }, { ctrl: true, key: 'p' },
  { ctrl: true, key: '+' }, { ctrl: true, key: '-' }, { ctrl: true, key: '0' },
  { alt: true, key: 'ArrowLeft' }, { alt: true, key: 'ArrowRight' },
];

const KEY_MAP = {
  'ArrowRight': 'nextPage', 'ArrowLeft': 'prevPage',
  ' ': 'togglePause', 'Escape': 'reset',
  '1':'jumpP1','2':'jumpP3','3':'jumpP3','4':'jumpP4','5':'jumpP5',
  '6':'jumpP6','7':'jumpP7','8':'jumpP8','9':'jumpP9','0':'jumpP10',
  '-':'jumpP11','=':'jumpP12',
  '[':'speedDown',']':'speedUp',
  'f':'fullscreen','F':'fullscreen',
  'i':'toggleIndicator','I':'toggleIndicator',
  'p':'jumpP0','P':'jumpP0',
  'q':'jumpP13','Q':'jumpP13',
  'd':'toggleAutoNav','D':'toggleAutoNav',
};

let _paused = false;
let _sequenceLock = false;
let _pendingTimers = [];

export const DemoEngine = {
  speed: 1.0,
  paused: false,

  init() {
    this.speed = StateManager.get('speed') || 1.0;
    this._setupKeyGuard();
    this._setupBrowserGuard();
    this._setupShield();
    DemoIndicator.init();
    const initMode = !DemoNavigator._autoNav ? 'MANUAL' : (_paused ? 'PAUSED' : 'AUTO');
    DemoIndicator.update(DemoNavigator.getCurrentPage(), this.speed, initMode);
  },

  _setupKeyGuard() {
    document.addEventListener('keydown', (e) => {
      if (BLOCKED_KEYS.has(e.key)) { e.preventDefault(); return; }
      for (const c of BLOCKED_COMBOS) {
        if ((c.ctrl && e.ctrlKey || c.alt && e.altKey) && e.key.toLowerCase() === c.key.toLowerCase()) {
          e.preventDefault(); return;
        }
      }
      const action = KEY_MAP[e.key];
      if (action) { e.preventDefault(); this.dispatch(action); }
    });
  },

  _allowNav: false,

  _setupBrowserGuard() {
    window.addEventListener('beforeunload', (e) => {
      if (this._allowNav) return;
      e.preventDefault();
    });
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
  },

  _setupShield() {
    const shield = document.getElementById('demo-shield');
    if (shield) {
      shield.addEventListener('click', (e) => e.stopPropagation());
      shield.addEventListener('dblclick', (e) => e.stopPropagation());
    }
  },

  dispatch(action) {
    const pageMap = {
      jumpP0:'p0',jumpP1:'p1',jumpP2:'p2',jumpP3:'p3',jumpP4:'p4',
      jumpP5:'p5',jumpP6:'p6',jumpP7:'p7',jumpP8:'p8',jumpP9:'p9',
      jumpP10:'p10',jumpP11:'p11',jumpP12:'p12',jumpP13:'p13',
    };

    if (action === 'nextPage') {
      DemoNavigator.forceNext();
    } else if (action === 'prevPage') {
      DemoNavigator.prev();
    } else if (action === 'togglePause') {
      _paused = !_paused;
      this.paused = _paused;
      const mode = !DemoNavigator._autoNav ? 'MANUAL' : (_paused ? 'PAUSED' : 'AUTO');
      DemoIndicator.update(DemoNavigator.getCurrentPage(), this.speed, mode);
    } else if (action === 'reset') {
      this.clearTimers();
      StateManager.reset();
      DemoNavigator.goTo('p0');
    } else if (action === 'speedUp') {
      this.speed = Math.min(4.0, this.speed * 1.5);
      StateManager.set('speed', this.speed);
      const modeS1 = !DemoNavigator._autoNav ? 'MANUAL' : (_paused ? 'PAUSED' : 'AUTO');
      DemoIndicator.update(DemoNavigator.getCurrentPage(), this.speed, modeS1);
    } else if (action === 'speedDown') {
      this.speed = Math.max(0.25, this.speed / 1.5);
      StateManager.set('speed', this.speed);
      const modeS2 = !DemoNavigator._autoNav ? 'MANUAL' : (_paused ? 'PAUSED' : 'AUTO');
      DemoIndicator.update(DemoNavigator.getCurrentPage(), this.speed, modeS2);
    } else if (action === 'fullscreen') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(() => {});
    } else if (action === 'toggleIndicator') {
      DemoIndicator.toggle();
    } else if (action === 'toggleAutoNav') {
      const auto = DemoNavigator.toggleAutoNav();
      DemoIndicator.update(DemoNavigator.getCurrentPage(), this.speed, auto ? (_paused ? 'PAUSED' : 'AUTO') : 'MANUAL');
    } else if (pageMap[action]) {
      this.clearTimers();
      DemoNavigator.goTo(pageMap[action]);
    }
  },

  async wait(ms) {
    const adjusted = ms / this.speed;
    return new Promise((resolve) => {
      const check = () => {
        if (_paused) { requestAnimationFrame(check); return; }
        resolve();
      };
      const id = setTimeout(check, adjusted);
      _pendingTimers.push(id);
    });
  },

  async typeText(el, text, charSpeed = 30) {
    el.textContent = '';
    for (const ch of text) {
      if (_paused) await new Promise(r => { const poll = () => _paused ? requestAnimationFrame(poll) : r(); poll(); });
      el.textContent += ch;
      await new Promise(r => { const id = setTimeout(r, charSpeed / this.speed); _pendingTimers.push(id); });
    }
  },

  clearTimers() {
    _pendingTimers.forEach(id => clearTimeout(id));
    _pendingTimers = [];
  },

  lockSequence() {
    if (_sequenceLock) return false;
    _sequenceLock = true;
    return true;
  },

  unlockSequence() {
    _sequenceLock = false;
  },

  isLocked() {
    return _sequenceLock;
  },

  isPaused() {
    return _paused;
  }
};
