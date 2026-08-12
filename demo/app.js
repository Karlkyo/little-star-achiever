(() => {
  "use strict";

  const STORAGE_KEY = "little-star-achiever-demo-v1";
  const TODAY = () => new Date().toLocaleDateString("sv-SE");

  const tasks = [
    { id: "brush", title: "认真刷牙", note: "早晚保护小牙齿", emoji: "🪥", stars: 1, color: "#70b7e6" },
    { id: "toys", title: "收好玩具", note: "让玩具回到自己的家", emoji: "🧸", stars: 2, color: "#ef806f" },
    { id: "water", title: "主动喝水", note: "今天也要水润润", emoji: "💧", stars: 1, color: "#75c9ad" },
    { id: "thanks", title: "说请和谢谢", note: "礼貌是温柔的超能力", emoji: "🙏", stars: 1, color: "#a992d7" },
    { id: "vegetable", title: "尝一口蔬菜", note: "认识一种新的味道", emoji: "🥦", stars: 2, color: "#75c9ad" },
    { id: "share", title: "和朋友分享", note: "快乐会变成双份", emoji: "🤝", stars: 2, color: "#f1a56f" },
    { id: "story", title: "听完一个故事", note: "跟着故事去旅行", emoji: "📚", stars: 2, color: "#70b7e6" },
    { id: "bed", title: "按时上床睡觉", note: "给身体充满电", emoji: "🌙", stars: 2, color: "#a992d7" }
  ];

  const rewards = [
    { id: "hug", title: "大大的拥抱", description: "领取一个至少十秒的暖暖拥抱。", emoji: "🤗", cost: 2 },
    { id: "story", title: "任选睡前故事", description: "今晚的故事由小朋友做主。", emoji: "📖", cost: 4 },
    { id: "game", title: "亲子游戏时间", description: "一起玩十五分钟最喜欢的游戏。", emoji: "🎲", cost: 6 },
    { id: "park", title: "公园小探险", description: "选一个晴天，一起去户外发现新东西。", emoji: "🌳", cost: 9 },
    { id: "dessert", title: "周末小甜点", description: "一起挑选或动手做一份小甜点。", emoji: "🧁", cost: 12 },
    { id: "adventure", title: "家庭特别计划", description: "共同决定一次博物馆、动物园或郊游。", emoji: "🚂", cost: 18 }
  ];

  const achievements = [
    { id: "first", title: "第一颗星", description: "完成 1 次任务", emoji: "🌟", test: s => s.totalCompleted >= 1 },
    { id: "five", title: "小小能手", description: "完成 5 次任务", emoji: "🖐️", test: s => s.totalCompleted >= 5 },
    { id: "collector", title: "星星收藏家", description: "累计获得 10 颗星", emoji: "✨", test: s => s.totalEarned >= 10 },
    { id: "all-day", title: "今日之星", description: "完成全部今日任务", emoji: "☀️", test: s => s.completedToday.length === tasks.length },
    { id: "reward", title: "快乐兑换员", description: "兑换 1 次奖励", emoji: "🎁", test: s => s.redeemed >= 1 }
  ];

  const defaultState = () => ({
    version: 1,
    childName: "小小探险家",
    stars: 4,
    totalEarned: 4,
    totalCompleted: 3,
    redeemed: 0,
    date: TODAY(),
    completedToday: ["water", "thanks"],
    history: []
  });

  const elements = {};
  let state = loadState();
  let toastTimer = 0;
  let lastAction = null;

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!stored || stored.version !== 1) return defaultState();
      if (stored.date !== TODAY()) return { ...stored, date: TODAY(), completedToday: [], history: [] };
      return { ...defaultState(), ...stored };
    } catch {
      return defaultState();
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Demo remains usable in restricted storage contexts. */ }
  }

  function cacheElements() {
    ["childName", "starCount", "rewardStarCount", "completedToday", "taskTotal", "totalCompleted", "achievementCount", "taskGrid", "rewardGrid", "statsGrid", "achievementGrid", "stars", "starJar", "progressText", "progressPercent", "progressBar", "toast", "toastIcon", "toastTitle", "toastMessage", "undoButton", "confetti", "nameModal", "nameForm", "nameInput", "confirmModal", "confirmResetButton"].forEach(id => elements[id] = document.getElementById(id));
  }

  function render() {
    elements.childName.textContent = state.childName;
    elements.starCount.textContent = state.stars;
    elements.rewardStarCount.textContent = state.stars;
    elements.completedToday.textContent = state.completedToday.length;
    elements.taskTotal.textContent = tasks.length;
    elements.totalCompleted.textContent = state.totalCompleted;
    elements.starJar.setAttribute("aria-label", `星星罐中有 ${state.stars} 颗星`);
    renderJar();
    renderTasks();
    renderRewards();
    renderStats();
    renderAchievements();
    saveState();
  }

  function renderJar() {
    const visibleStars = Math.min(state.stars, 24);
    elements.stars.replaceChildren(...Array.from({ length: visibleStars }, (_, index) => {
      const star = document.createElement("span");
      const x = 4 + ((index * 37 + 11) % 82);
      const row = Math.floor(index / 6);
      const y = 3 + row * 23 + ((index * 13) % 9);
      star.className = "jar-star";
      star.textContent = "★";
      star.style.left = `${x}%`;
      star.style.bottom = `${y}%`;
      star.style.fontSize = `${22 + (index % 3) * 4}px`;
      star.style.transform = `rotate(${(index * 47) % 70 - 35}deg)`;
      star.style.animationDelay = `${Math.min(index, 8) * 35}ms`;
      return star;
    }));

    const nextGoal = [6, 10, 18, 30].find(goal => state.totalEarned < goal) || 30;
    const previousGoal = nextGoal === 6 ? 0 : Math.max(0, ...[6, 10, 18].filter(goal => goal < nextGoal));
    const progress = Math.min(100, Math.round(((state.totalEarned - previousGoal) / (nextGoal - previousGoal)) * 100));
    elements.progressText.textContent = state.totalEarned >= 30 ? "你已经点亮了整片星空" : `再收集 ${nextGoal - state.totalEarned} 颗就有新目标`;
    elements.progressPercent.textContent = `${Math.max(0, progress)}%`;
    elements.progressBar.style.width = `${Math.max(0, progress)}%`;
  }

  function renderTasks() {
    elements.taskGrid.replaceChildren(...tasks.map(task => {
      const done = state.completedToday.includes(task.id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `task-card${done ? " is-done" : ""}`;
      button.style.setProperty("--card-color", task.color);
      button.disabled = done;
      button.setAttribute("aria-label", done ? `${task.title}，今天已完成` : `完成${task.title}，获得${task.stars}颗星`);
      button.innerHTML = `<span class="task-icon" aria-hidden="true">${task.emoji}</span><span class="star-value">+${task.stars} ★</span><h3>${task.title}</h3><p>${task.note}</p><span class="task-check" aria-hidden="true">✓</span>`;
      button.addEventListener("click", () => completeTask(task));
      return button;
    }));
  }

  function renderRewards() {
    elements.rewardGrid.replaceChildren(...rewards.map(reward => {
      const card = document.createElement("article");
      card.className = "reward-card";
      const affordable = state.stars >= reward.cost;
      card.innerHTML = `<div class="reward-top"><span class="reward-emoji" aria-hidden="true">${reward.emoji}</span><span class="reward-cost">${reward.cost} ★</span></div><h3>${reward.title}</h3><p>${reward.description}</p><button class="redeem-button" type="button" ${affordable ? "" : "disabled"}>${affordable ? "兑换奖励" : `还差 ${reward.cost - state.stars} 颗`}</button>`;
      card.querySelector("button").addEventListener("click", () => redeemReward(reward));
      return card;
    }));
  }

  function renderStats() {
    const unlocked = achievements.filter(item => item.test(state)).length;
    const stats = [
      { emoji: "✓", value: state.completedToday.length, label: "今日完成" },
      { emoji: "★", value: state.totalEarned, label: "累计星星" },
      { emoji: "🎁", value: state.redeemed, label: "兑换奖励" },
      { emoji: "🏅", value: unlocked, label: "解锁成就" }
    ];
    elements.statsGrid.replaceChildren(...stats.map(item => {
      const card = document.createElement("article");
      card.className = "stat-card";
      card.innerHTML = `<span aria-hidden="true">${item.emoji}</span><strong>${item.value}</strong><small>${item.label}</small>`;
      return card;
    }));
  }

  function renderAchievements() {
    const unlocked = achievements.filter(item => item.test(state));
    elements.achievementCount.textContent = `${unlocked.length} / ${achievements.length}`;
    elements.achievementGrid.replaceChildren(...achievements.map(item => {
      const achieved = item.test(state);
      const card = document.createElement("article");
      card.className = `achievement${achieved ? "" : " is-locked"}`;
      card.title = item.description;
      card.innerHTML = `<span class="badge" aria-hidden="true">${achieved ? item.emoji : "?"}</span><strong>${item.title}</strong><small>${item.description}</small>`;
      return card;
    }));
  }

  function completeTask(task) {
    if (state.completedToday.includes(task.id)) return;
    state.completedToday.push(task.id);
    state.stars += task.stars;
    state.totalEarned += task.stars;
    state.totalCompleted += 1;
    state.history.push({ type: "task", id: task.id, stars: task.stars });
    lastAction = { type: "task", id: task.id, stars: task.stars };
    render();
    celebrate(task.stars > 1 ? 18 : 10);
    showToast("★", "任务完成！", `${task.title} +${task.stars} 颗星`, true);
  }

  function redeemReward(reward) {
    if (state.stars < reward.cost) return;
    state.stars -= reward.cost;
    state.redeemed += 1;
    state.history.push({ type: "reward", id: reward.id, cost: reward.cost });
    lastAction = { type: "reward", id: reward.id, cost: reward.cost };
    render();
    celebrate(22);
    showToast(reward.emoji, "兑换成功！", `今天可以享受「${reward.title}」`, true);
  }

  function undoLastAction() {
    if (!lastAction) return;
    if (lastAction.type === "task") {
      state.completedToday = state.completedToday.filter(id => id !== lastAction.id);
      state.stars = Math.max(0, state.stars - lastAction.stars);
      state.totalEarned = Math.max(0, state.totalEarned - lastAction.stars);
      state.totalCompleted = Math.max(0, state.totalCompleted - 1);
    } else {
      state.stars += lastAction.cost;
      state.redeemed = Math.max(0, state.redeemed - 1);
    }
    state.history.pop();
    lastAction = null;
    render();
    showToast("↶", "已撤销", "刚才的操作已经恢复", false);
  }

  function switchTab(name) {
    document.querySelectorAll(".tab").forEach(tab => {
      const active = tab.dataset.tab === name;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll("[data-panel]").forEach(panel => {
      const active = panel.dataset.panel === name;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
    history.replaceState(null, "", `#${name}`);
  }

  function showToast(icon, title, message, canUndo) {
    clearTimeout(toastTimer);
    elements.toastIcon.textContent = icon;
    elements.toastTitle.textContent = title;
    elements.toastMessage.textContent = message;
    elements.undoButton.hidden = !canUndo;
    elements.toast.setAttribute("aria-hidden", "false");
    elements.toast.classList.add("is-visible");
    toastTimer = window.setTimeout(hideToast, 5200);
  }

  function hideToast() {
    elements.toast.classList.remove("is-visible");
    elements.toast.setAttribute("aria-hidden", "true");
  }

  function celebrate(count) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const colors = ["#f7c948", "#ef806f", "#70b7e6", "#75c9ad", "#a992d7"];
    const pieces = Array.from({ length: count }, (_, index) => {
      const piece = document.createElement("i");
      piece.className = "confetti-piece";
      piece.style.left = `${8 + Math.random() * 84}%`;
      piece.style.background = colors[index % colors.length];
      piece.style.setProperty("--drift", `${Math.round(Math.random() * 160 - 80)}px`);
      piece.style.animationDelay = `${Math.random() * 180}ms`;
      return piece;
    });
    elements.confetti.replaceChildren(...pieces);
    window.setTimeout(() => elements.confetti.replaceChildren(), 1900);
  }

  function openModal(modal, focusTarget) {
    modal.hidden = false;
    window.setTimeout(() => focusTarget?.focus(), 0);
  }

  function closeModals() {
    document.querySelectorAll(".modal-backdrop").forEach(modal => modal.hidden = true);
  }

  function bindEvents() {
    document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => switchTab(tab.dataset.tab)));
    document.getElementById("focusTasksButton").addEventListener("click", () => {
      switchTab("tasks");
      document.getElementById("tasksTitle").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    document.getElementById("editNameButton").addEventListener("click", () => {
      elements.nameInput.value = state.childName;
      openModal(elements.nameModal, elements.nameInput);
    });
    document.getElementById("resetButton").addEventListener("click", () => openModal(elements.confirmModal, elements.confirmResetButton));
    elements.nameForm.addEventListener("submit", event => {
      event.preventDefault();
      const name = elements.nameInput.value.trim();
      if (!name) return;
      state.childName = name.slice(0, 12);
      render();
      closeModals();
      showToast("✎", "昵称已更新", `你好，${state.childName}！`, false);
    });
    elements.confirmResetButton.addEventListener("click", () => {
      state = defaultState();
      lastAction = null;
      render();
      closeModals();
      switchTab("tasks");
      showToast("↻", "演示已重置", "现在可以重新体验所有功能", false);
    });
    elements.undoButton.addEventListener("click", undoLastAction);
    document.querySelectorAll("[data-close-modal]").forEach(button => button.addEventListener("click", closeModals));
    document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.addEventListener("click", event => {
      if (event.target === backdrop) closeModals();
    }));
    document.addEventListener("keydown", event => { if (event.key === "Escape") closeModals(); });
  }

  function init() {
    cacheElements();
    bindEvents();
    render();
    const initialTab = ["tasks", "rewards", "growth"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "tasks";
    switchTab(initialTab);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
