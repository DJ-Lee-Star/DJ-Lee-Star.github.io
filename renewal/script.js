/* ====================================================
   기업여신 AI Agent 시연 — Main Script
   ==================================================== */

(function () {
  'use strict';

  /* ---- State ---- */
  const state = {
    currentScene: 1,
    totalScenes: 6,
    isAutoPlay: false,
    timers: [],
    autoTimer: null,
    sceneDurations: [0, 15000, 15000, 10000, 14000, 14000, 16000]
  };

  /* ---- DOM Refs ---- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const sceneNumEl = $('#sceneNum');
  const sceneDots = $$('.scene-dot');
  const scenes = $$('.scene');

  /* ============================================================
     SCENE MANAGER
     ============================================================ */
  function goToScene(num) {
    if (num < 1 || num > state.totalScenes) return;
    clearAllTimers();

    const isSameScene = (num === state.currentScene);
    const scene1El = $('#scene1');

    if (scene1El) scene1El.classList.remove('is-bg', 'is-blurred');

    scenes.forEach((s) => s.classList.remove('active'));
    sceneDots.forEach((d) => d.classList.remove('active'));

    if (num === 3 && scene1El) {
      scene1El.classList.add('is-bg');
    }

    const target = $(`#scene${num}`);
    if (target) {
      target.classList.add('active');
    }
    sceneDots[num - 1].classList.add('active');
    sceneNumEl.textContent = num;
    state.currentScene = num;

    resetScene(num);
    setTimeout(() => animateScene(num), isSameScene ? 50 : 100);

    if (state.isAutoPlay) scheduleAutoAdvance();
  }

  function nextScene() {
    if (state.currentScene < state.totalScenes) goToScene(state.currentScene + 1);
    else if (state.isAutoPlay) {
      goToScene(1);
    }
  }

  function prevScene() {
    if (state.currentScene > 1) goToScene(state.currentScene - 1);
  }

  /* ---- Timer Helpers ---- */
  function addTimer(fn, delay) {
    const id = setTimeout(fn, delay);
    state.timers.push(id);
    return id;
  }

  function clearAllTimers() {
    state.timers.forEach(clearTimeout);
    state.timers = [];
    if (state.autoTimer) {
      clearTimeout(state.autoTimer);
      state.autoTimer = null;
    }
  }

  function scheduleAutoAdvance() {
    if (state.autoTimer) clearTimeout(state.autoTimer);
    state.autoTimer = setTimeout(() => {
      nextScene();
    }, state.sceneDurations[state.currentScene]);
  }

  /* ---- Auto Play ---- */
  function toggleAutoPlay() {
    state.isAutoPlay = !state.isAutoPlay;
    const btn = $('#btnAuto');
    btn.classList.toggle('is-active', state.isAutoPlay);
    if (state.isAutoPlay) {
      scheduleAutoAdvance();
    } else if (state.autoTimer) {
      clearTimeout(state.autoTimer);
      state.autoTimer = null;
    }
  }

  /* ============================================================
     SCENE RESET — clears all animation states
     ============================================================ */
  function resetScene(num) {
    if (num === 1) resetScene1();
    if (num === 2) resetScene2();
    if (num === 3) resetScene3();
    if (num === 4) resetScene4();
    if (num === 5) resetScene5();
    if (num === 6) resetScene6();
  }

  /* ============================================================
     SCENE 1 — 영업점 대출 신청
     ============================================================ */
  function resetScene1() {
    $$('#scene1 .doc-item').forEach((el) => el.classList.remove('is-visible'));
    const btn = $('#btnAiStart');
    if (btn) btn.classList.remove('is-visible');
  }

  function animateScene1() {
    const docs = $$('#scene1 .doc-item');
    docs.forEach((doc, i) => {
      addTimer(() => doc.classList.add('is-visible'), 800 + i * 1200);
    });
    addTimer(() => {
      const btn = $('#btnAiStart');
      if (btn) btn.classList.add('is-visible');
    }, 800 + docs.length * 1200 + 600);
  }

  /* ============================================================
     SCENE 2 — AI 에이전트 처리 (CENTERPIECE)
     ============================================================ */
  const s2StageData = [
    {
      stage: 1,
      tasks: ['1-1', '1-2', '1-3', '1-4'],
      result: 'done'
    },
    {
      stage: 2,
      tasks: ['2-1', '2-2', '2-3', '2-4'],
      result: 'done'
    },
    {
      stage: 3,
      tasks: ['3-1', '3-2', '3-3', '3-4'],
      result: 'done'
    },
    {
      stage: 4,
      tasks: ['4-1', '4-4', '4-2', '4-3'],
      result: 'warning'
    },
    {
      stage: 5,
      tasks: ['5-1', '5-2', '5-3', '5-4'],
      result: 'pending'
    }
  ];

  function resetScene2() {
    $$('#scene2 .stage-item').forEach((el) => {
      el.setAttribute('data-status', 'pending');
      el.querySelector('.stage-badge').textContent = '대기';
    });
    $$('#scene2 .stage-connector').forEach((el) => el.classList.remove('is-filled'));
    $$('#scene2 .task-group').forEach((el) => {
      el.classList.remove('is-active', 'is-done', 'is-warning');
      el.querySelector('.tg-status').textContent = '대기';
    });
    $$('#scene2 .task-chip').forEach((el) => {
      el.classList.remove('is-active', 'is-done', 'is-warning', 'is-error');
    });
    const agentPanel = $('#scene2 .agent-panel');
    if (agentPanel) agentPanel.classList.remove('is-warning');
    $$('#scene2 .agent-status-item').forEach((el) => {
      el.classList.remove('is-active', 'is-done', 'is-warning');
      el.querySelector('.status-label').textContent = '대기';
    });
    const issue = $('#agentIssue');
    if (issue) issue.classList.remove('is-visible');
    const alert = $('#alertBanner');
    if (alert) alert.classList.remove('is-visible');
  }

  function animateScene2() {
    const stageTimings = [
      { start: 300, duration: 2000 },
      { start: 2500, duration: 2000 },
      { start: 4800, duration: 2000 },
      { start: 7200, duration: 3500 },
      { start: -1, duration: 0 }
    ];

    updateAgentStatus('planning', 'is-active', '실행 중');
    addTimer(() => updateAgentStatus('tools', 'is-active', '실행 중'), 200);
    addTimer(() => updateAgentStatus('monitoring', 'is-active', '실행 중'), 400);

    s2StageData.forEach((sData, sIdx) => {
      const timing = stageTimings[sIdx];
      if (timing.start < 0) return;

      addTimer(() => {
        activateStage(sData.stage);
        activateTaskGroup(sData.stage);

        sData.tasks.forEach((taskId, tIdx) => {
          addTimer(() => {
            activateTask(taskId);

            const completeDelay = sData.stage === 4 ? 500 : 300;
            addTimer(() => {
              if (sData.stage === 4 && (taskId === '4-2' || taskId === '4-3')) {
                warningTask(taskId);
                if (taskId === '4-3') {
                  addTimer(() => errorTask('4-2'), 400);
                  addTimer(() => errorTask('4-3'), 600);
                }
              } else {
                completeTask(taskId);
              }
            }, completeDelay);
          }, tIdx * (timing.duration / sData.tasks.length));
        });

        addTimer(() => {
          if (sData.result === 'done') {
            completeStage(sData.stage);
            completeTaskGroup(sData.stage);
            fillConnectorAfter(sData.stage);
          } else if (sData.result === 'warning') {
            warningStage(sData.stage);
            warningTaskGroup(sData.stage);
          }
        }, timing.duration + 200);
      }, timing.start);
    });

    addTimer(() => {
      updateAgentStatus('planning', 'is-done', '정상');
      updateAgentStatus('tools', 'is-done', '정상');
    }, 7000);

    addTimer(() => {
      updateAgentStatus('exception', 'is-warning', '감지됨');
      const panel = $('#scene2 .agent-panel');
      if (panel) panel.classList.add('is-warning');
    }, 10800);

    addTimer(() => {
      const issue = $('#agentIssue');
      if (issue) issue.classList.add('is-visible');
    }, 11200);

    addTimer(() => {
      const alert = $('#alertBanner');
      if (alert) alert.classList.add('is-visible');
    }, 12000);
  }

  function activateStage(num) {
    const el = $(`.stage-item[data-stage="${num}"]`);
    if (!el) return;
    el.setAttribute('data-status', 'active');
    el.querySelector('.stage-badge').textContent = '실행 중';
  }

  function completeStage(num) {
    const el = $(`.stage-item[data-stage="${num}"]`);
    if (!el) return;
    el.setAttribute('data-status', 'done');
    el.querySelector('.stage-badge').textContent = '완료';
  }

  function warningStage(num) {
    const el = $(`.stage-item[data-stage="${num}"]`);
    if (!el) return;
    el.setAttribute('data-status', 'warning');
    el.querySelector('.stage-badge').textContent = '이슈 발생';
  }

  function fillConnectorAfter(stageNum) {
    const connectors = $$('#scene2 .stage-connector');
    if (stageNum - 1 < connectors.length) {
      connectors[stageNum - 1].classList.add('is-filled');
    }
  }

  function activateTaskGroup(num) {
    const el = $(`.task-group[data-stage="${num}"]`);
    if (!el) return;
    el.classList.add('is-active');
    el.querySelector('.tg-status').textContent = '실행 중';
  }

  function completeTaskGroup(num) {
    const el = $(`.task-group[data-stage="${num}"]`);
    if (!el) return;
    el.classList.remove('is-active');
    el.classList.add('is-done');
    el.querySelector('.tg-status').textContent = '완료';
  }

  function warningTaskGroup(num) {
    const el = $(`.task-group[data-stage="${num}"]`);
    if (!el) return;
    el.classList.remove('is-active');
    el.classList.add('is-warning');
    el.querySelector('.tg-status').textContent = '이슈';
  }

  function activateTask(id) {
    const el = $(`.task-chip[data-task="${id}"]`);
    if (el) el.classList.add('is-active');
  }

  function completeTask(id) {
    const el = $(`.task-chip[data-task="${id}"]`);
    if (!el) return;
    el.classList.remove('is-active');
    el.classList.add('is-done');
  }

  function warningTask(id) {
    const el = $(`.task-chip[data-task="${id}"]`);
    if (!el) return;
    el.classList.remove('is-active');
    el.classList.add('is-warning');
  }

  function errorTask(id) {
    const el = $(`.task-chip[data-task="${id}"]`);
    if (!el) return;
    el.classList.remove('is-warning');
    el.classList.add('is-error');
  }

  function updateAgentStatus(name, cls, label) {
    const el = $(`.agent-status-item[data-agent-status="${name}"]`);
    if (!el) return;
    el.className = 'agent-status-item ' + cls;
    el.querySelector('.status-label').textContent = label;
  }

  /* ============================================================
     SCENE 3 — Human in the Loop (Windows Toast)
     ============================================================ */
  function resetScene3() {
    $$('#scene1 .doc-item').forEach((el) => el.classList.add('is-visible'));
    const aiBtn = $('#btnAiStart');
    if (aiBtn) aiBtn.classList.add('is-visible');

    const toast = $('#toastNotification');
    if (toast) toast.classList.remove('is-visible');
    const dim = $('#scene3Dim');
    if (dim) dim.classList.remove('is-dimmed');
    const scene1El = $('#scene1');
    if (scene1El) scene1El.classList.remove('is-blurred');
  }

  function animateScene3() {
    addTimer(() => {
      const toast = $('#toastNotification');
      if (toast) toast.classList.add('is-visible');
    }, 800);

    addTimer(() => {
      const dim = $('#scene3Dim');
      if (dim) dim.classList.add('is-dimmed');
      const scene1El = $('#scene1');
      if (scene1El) scene1El.classList.add('is-blurred');
    }, 1200);
  }

  /* ============================================================
     SCENE 4 — OCR 검토
     ============================================================ */
  function resetScene4() {
    $$('#scene4 .highlight-region').forEach((el) => {
      el.classList.remove('is-visible', 'is-selected');
    });
    $$('#scene4 .extract-table tr').forEach((el) => el.classList.remove('is-selected'));
    const reason = $('#editReason');
    if (reason) reason.classList.remove('is-visible');
    const btn = $('#btnResumeAi');
    if (btn) btn.classList.remove('is-visible');

    const addr = $('#addressValue');
    if (addr) addr.innerHTML = '서울시 강남구 테헤란로 12<span class="edit-cursor">|</span>';
    const area = $('#areaValue');
    if (area) area.innerHTML = '158.<span class="edit-cursor">|</span>';
  }

  function animateScene4() {
    const regions = $$('#scene4 .highlight-region');
    regions.forEach((r, i) => {
      addTimer(() => r.classList.add('is-visible'), 600 + i * 400);
    });

    addTimer(() => {
      selectRow('address');
    }, 3000);

    addTimer(() => {
      typeInto('#addressValue', '서울시 강남구 테헤란로 12', '서울특별시 강남구 테헤란로 123, 한국테크빌딩');
    }, 4500);

    addTimer(() => {
      deselectRow('address');
      selectRow('area');
    }, 7000);

    addTimer(() => {
      typeInto('#areaValue', '158.', '158.72㎡');
    }, 8000);

    addTimer(() => {
      deselectRow('area');
      const reason = $('#editReason');
      if (reason) reason.classList.add('is-visible');
    }, 10000);

    addTimer(() => {
      const btn = $('#btnResumeAi');
      if (btn) btn.classList.add('is-visible');
    }, 11500);
  }

  function selectRow(field) {
    const tr = $(`tr[data-row="${field}"]`);
    if (tr) tr.classList.add('is-selected');
    const hl = $(`.highlight-region[data-field="${field}"]`);
    if (hl) hl.classList.add('is-selected');
  }

  function deselectRow(field) {
    const tr = $(`tr[data-row="${field}"]`);
    if (tr) tr.classList.remove('is-selected');
    const hl = $(`.highlight-region[data-field="${field}"]`);
    if (hl) hl.classList.remove('is-selected');
  }

  function typeInto(selector, startText, fullText) {
    const el = $(selector);
    if (!el) return;
    let idx = startText.length;
    el.innerHTML = startText + '<span class="edit-cursor">|</span>';
    const interval = setInterval(() => {
      if (idx >= fullText.length) {
        clearInterval(interval);
        el.innerHTML = fullText;
        return;
      }
      el.innerHTML = fullText.substring(0, idx + 1) + '<span class="edit-cursor">|</span>';
      idx++;
    }, 80);
    state.timers.push(interval);
  }

  /* ============================================================
     SCENE 5 — 자동 입력 단말
     ============================================================ */
  function resetScene5() {
    $$('#scene5 .type-target').forEach((el) => { el.textContent = ''; });
    $$('#scene5 .type-cursor').forEach((el) => { el.style.display = 'inline'; });
    $$('#scene5 .result-item').forEach((el) => el.classList.remove('is-visible'));
  }

  function animateScene5() {
    const targets = $$('#scene5 .type-target');
    let totalDelay = 300;

    targets.forEach((target) => {
      const text = target.getAttribute('data-text');
      const cursor = target.nextElementSibling;
      const startDelay = totalDelay;

      addTimer(() => {
        let idx = 0;
        const interval = setInterval(() => {
          if (idx >= text.length) {
            clearInterval(interval);
            if (cursor) cursor.style.display = 'none';
            return;
          }
          target.textContent = text.substring(0, idx + 1);
          idx++;
        }, 35);
        state.timers.push(interval);
      }, startDelay);

      totalDelay += text.length * 35 + 200;
    });

    const results = $$('#scene5 .result-item');
    results.forEach((item, i) => {
      addTimer(() => item.classList.add('is-visible'), 2000 + i * 800);
    });
  }

  /* ============================================================
     SCENE 6 — AI 사전 심사 챗봇
     ============================================================ */
  const chatMessages = [
    { type: 'ai', header: 'AI 심사 어시스턴트', text: '사전 심사 결과를 요약해 드립니다.' },
    { type: 'ai', text: '담보 권리관계는 정상입니다.\n다만 담보 대비 대출금액이 다소 높은 수준입니다.' },
    { type: 'ai', text: 'LTV 58.8%로 기준한도(70%) 이내이나, 내부 권고 수준(55%)을 소폭 초과합니다.\n추가 검토를 권장합니다.' }
  ];

  const chatFollowUp = {
    type: 'ai',
    header: '담보 분석 상세',
    text: '등기부등본 분석 결과:\n• 소유권: (주)한국테크놀로지 단독 소유\n• 근저당: 설정 없음\n• 가압류/가처분: 없음\n• 전세권: 없음\n\n건축물대장 분석 결과:\n• 용도: 업무시설 (오피스)\n• 연면적: 3,245.80㎡\n• 전용면적: 158.72㎡ (검토 대상 호실)\n• 위반건축물: 해당 없음'
  };

  function resetScene6() {
    const chatBody = $('#chatBody');
    if (chatBody) chatBody.innerHTML = '';
    const actions = $('#chatActions');
    if (actions) actions.classList.remove('is-visible');
    $$('.chat-action-btn').forEach((b) => b.classList.remove('is-active'));
    const ltv = $('#ltvFill');
    if (ltv) ltv.style.width = '0';
    const marker = $('#ltvMarker');
    if (marker) marker.style.opacity = '0';
    const limit = $('[class*="ltv-limit"]');
    if (limit) limit.style.opacity = '0';
  }

  function animateScene6() {
    addTimer(() => {
      const ltv = $('#ltvFill');
      if (ltv) ltv.style.width = '58.8%';
      const marker = $('#ltvMarker');
      if (marker) marker.style.opacity = '1';
      const limit = $('[class*="ltv-limit"]');
      if (limit) limit.style.opacity = '1';
    }, 500);

    chatMessages.forEach((msg, i) => {
      addTimer(() => addChatMessage(msg), 1500 + i * 2000);
    });

    addTimer(() => {
      const actions = $('#chatActions');
      if (actions) actions.classList.add('is-visible');
    }, 1500 + chatMessages.length * 2000 + 500);

    addTimer(() => {
      const btn = $('[data-action="collateral"]');
      if (btn) btn.classList.add('is-active');
    }, 1500 + chatMessages.length * 2000 + 1500);

    addTimer(() => {
      addChatMessage({ type: 'user', text: '담보 분석 상세' });
    }, 1500 + chatMessages.length * 2000 + 2000);

    addTimer(() => {
      addChatMessage(chatFollowUp);
    }, 1500 + chatMessages.length * 2000 + 3500);
  }

  function addChatMessage(msg) {
    const chatBody = $('#chatBody');
    if (!chatBody) return;

    const div = document.createElement('div');
    div.className = `chat-msg ${msg.type}`;

    let html = '';
    if (msg.header) {
      html += `<div class="chat-msg-header">${msg.header}</div>`;
    }
    html += msg.text.replace(/\n/g, '<br>');
    div.innerHTML = html;

    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        div.classList.add('is-visible');
      });
    });
  }

  /* ============================================================
     ANIMATE DISPATCH
     ============================================================ */
  function animateScene(num) {
    switch (num) {
      case 1: animateScene1(); break;
      case 2: animateScene2(); break;
      case 3: animateScene3(); break;
      case 4: animateScene4(); break;
      case 5: animateScene5(); break;
      case 6: animateScene6(); break;
    }
  }

  /* ============================================================
     EVENT LISTENERS
     ============================================================ */
  function init() {
    $('#btnPrev').addEventListener('click', prevScene);
    $('#btnNext').addEventListener('click', nextScene);
    $('#btnAuto').addEventListener('click', toggleAutoPlay);

    sceneDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        goToScene(parseInt(dot.getAttribute('data-scene')));
      });
    });

    document.addEventListener('keydown', (e) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 6) {
        goToScene(num);
        return;
      }
      switch (e.key) {
        case 'ArrowRight': nextScene(); break;
        case 'ArrowLeft': prevScene(); break;
        case ' ':
          e.preventDefault();
          toggleAutoPlay();
          break;
      }
    });

    animateScene(1);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
