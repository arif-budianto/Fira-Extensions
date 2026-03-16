const viewConfig = {
  overview: {
    title: "Fira Overview",
    subtitle: "Dashboard informasi modern yang langsung aktif setiap kali Abang buka tab baru.",
    caption: "Live interface"
  },
  downloads: {
    title: "Downloads Stream",
    subtitle: "Monitor file yang baru diunduh langsung dari sesi Chrome Abang.",
    caption: "Daftar file terbaru dari browser"
  },
  bookmarks: {
    title: "Bookmarks Archive",
    subtitle: "Koleksi link tersimpan yang bisa dibuka ulang tanpa keluar dari panel Fira.",
    caption: "Bookmark tree yang sudah dirapikan"
  },
  history: {
    title: "History Trace",
    subtitle: "Jejak browsing terbaru buat balik ke halaman yang tadi dibuka.",
    caption: "Riwayat akses dari Chrome"
  }
};

const titleElement = document.getElementById("view-title");
const subtitleElement = document.getElementById("view-subtitle");
const statusElement = document.getElementById("view-status");
const countElement = document.getElementById("view-count");
const heroClockElement = document.getElementById("hero-clock");
const heroTimezoneLabelElement = document.getElementById("hero-timezone-label");
const panelTitleElement = document.getElementById("panel-title");
const panelCaptionElement = document.getElementById("panel-caption");
const dataListElement = document.getElementById("data-list");
const actionButtons = document.querySelectorAll(".hero-action");
const controlButtons = document.querySelectorAll(".control-card");
const onboardingBackdropElement = document.getElementById("onboarding-backdrop");
const onboardingFormElement = document.getElementById("onboarding-form");
const profileNameElement = document.getElementById("profile-name");
const profileTimezoneElement = document.getElementById("profile-timezone");

const timezoneLabels = {
  "Asia/Jakarta": "WIB",
  "Asia/Makassar": "WITA",
  "Asia/Jayapura": "WIT"
};

const dailyMessages = [
  "Langkah kecil yang konsisten hari ini bisa jadi lompatan besar buat besok.",
  "Fokus yang tenang sering menghasilkan progres yang paling kuat.",
  "Kerja yang rapi hari ini bikin keputusan besok terasa lebih ringan.",
  "Tidak harus ngebut, yang penting tetap bergerak ke arah yang benar.",
  "Satu pekerjaan selesai dengan baik selalu lebih bernilai daripada banyak yang setengah jalan.",
  "Hari ini cukup dipakai buat bikin satu hal penting jadi beres.",
  "Ritme yang stabil lebih tahan lama daripada semangat yang meledak sebentar.",
  "Sedikit demi sedikit, hasil yang serius mulai kelihatan bentuknya.",
  "Kalau arahnya jelas, progres kecil pun tetap terasa berarti.",
  "Kerja yang fokus dan bersih akan selalu punya dampak yang panjang."
];

let profileState = null;
let todoState = [];
let todoEditingId = null;

function getCurrentView() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");

  if (view && viewConfig[view]) {
    return view;
  }

  return "overview";
}

function isNewTabPage() {
  return window.location.pathname.endsWith("newtab.html");
}

function updateMeta(view, total) {
  const config = viewConfig[view];

  if (!titleElement || !subtitleElement || !panelTitleElement || !panelCaptionElement || !statusElement || !countElement) {
    return;
  }

  if (view === "overview") {
    applyGreeting();
  } else {
    titleElement.textContent = config.title;
    subtitleElement.textContent = config.subtitle;
  }

  panelTitleElement.textContent = config.title;
  panelCaptionElement.textContent = config.caption;
  statusElement.textContent = "Ready";
  countElement.textContent = String(total);

  controlButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });
}

function createTodoId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDate(value) {
  if (!value) {
    return "Waktu tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function getCurrentTimezone() {
  return profileState?.timezone || "Asia/Jakarta";
}

function getTimezoneLabel() {
  return timezoneLabels[getCurrentTimezone()] || "WIB";
}

function getGreetingByHour(hour) {
  if (hour >= 4 && hour < 11) {
    return "Selamat pagi";
  }

  if (hour >= 11 && hour < 15) {
    return "Selamat siang";
  }

  if (hour >= 15 && hour < 19) {
    return "Selamat sore";
  }

  return "Selamat malam";
}

function getCurrentHourInTimezone() {
  const parts = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    hour12: false,
    timeZone: getCurrentTimezone()
  }).formatToParts(new Date());

  const hourPart = parts.find((part) => part.type === "hour");
  return hourPart ? Number(hourPart.value) : 0;
}

function getCurrentDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: getCurrentTimezone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function getDailyMessage() {
  const dateKey = getCurrentDateKey();
  let seed = 0;

  for (const char of dateKey) {
    seed += char.charCodeAt(0);
  }

  return dailyMessages[seed % dailyMessages.length];
}

function applyGreeting() {
  const name = profileState?.name || "Abang";
  const greeting = getGreetingByHour(getCurrentHourInTimezone());

  titleElement.textContent = `${greeting} ${name}`;
  subtitleElement.textContent = getDailyMessage();
}

function updateClock() {
  if (!heroClockElement) {
    return;
  }

  heroClockElement.textContent = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: getCurrentTimezone()
  })
    .format(new Date())
    .replace(/:/g, ".");

  if (heroTimezoneLabelElement) {
    heroTimezoneLabelElement.textContent = `Local Time ${getTimezoneLabel()}`;
  }

  if (getCurrentView() === "overview") {
    applyGreeting();
  }
}

function getProfile() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["firaProfile"], (result) => {
      resolve(result.firaProfile || null);
    });
  });
}

function saveProfile(profile) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ firaProfile: profile }, () => {
      resolve();
    });
  });
}

function getTodos() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["firaTodos"], (result) => {
      resolve(Array.isArray(result.firaTodos) ? result.firaTodos : []);
    });
  });
}

function saveTodos(todos) {
  todoState = todos;

  return new Promise((resolve) => {
    chrome.storage.local.set({ firaTodos: todos }, () => {
      resolve();
    });
  });
}

function toggleOnboarding(show) {
  if (!onboardingBackdropElement) {
    return;
  }

  onboardingBackdropElement.classList.toggle("is-hidden", !show);
}

function bindOnboarding() {
  if (!onboardingFormElement || !profileNameElement || !profileTimezoneElement) {
    return;
  }

  onboardingFormElement.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = profileNameElement.value.trim();
    const timezone = profileTimezoneElement.value;

    if (!name || !timezone) {
      return;
    }

    profileState = {
      name,
      timezone
    };

    await saveProfile(profileState);
    toggleOnboarding(false);
    updateClock();
    updateMeta(getCurrentView(), Number(countElement.textContent || "0"));
  });
}

function truncateText(value, maxLength = 88) {
  if (!value) {
    return "";
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}...`;
}

function createMetaPill(content) {
  const pill = document.createElement("span");
  pill.className = "meta-pill";
  pill.textContent = content;
  return pill;
}

function createCard(tag, title, description, url, metaItems = []) {
  const card = document.createElement("article");
  const tagElement = document.createElement("span");
  const titleElementLocal = document.createElement("strong");
  const detailsElement = document.createElement("p");
  const metaElement = document.createElement("div");

  card.className = "content-card";
  tagElement.className = "card-tag";
  metaElement.className = "content-card__meta";

  tagElement.textContent = tag;
  titleElementLocal.textContent = title;
  detailsElement.textContent = description;

  metaItems.filter(Boolean).forEach((item) => {
    metaElement.append(createMetaPill(item));
  });

  card.append(tagElement, titleElementLocal, detailsElement);

  if (metaElement.childNodes.length > 0) {
    card.append(metaElement);
  }

  if (url) {
    const link = document.createElement("a");
    link.href = url;
    link.className = "content-card__url";
    link.textContent = truncateText(url);
    link.title = url;
    link.target = "_blank";
    link.rel = "noreferrer";
    card.append(link);
  }

  return card;
}

function renderEmpty(message) {
  if (!dataListElement) {
    return;
  }

  dataListElement.replaceChildren();
  dataListElement.className = "data-list";

  const emptyElement = document.createElement("div");
  emptyElement.className = "empty-state";
  emptyElement.textContent = message;

  dataListElement.append(emptyElement);
}

function getDownloads() {
  return new Promise((resolve) => {
    chrome.downloads.search(
      {
        limit: 20,
        orderBy: ["-startTime"]
      },
      (items) => resolve(items || [])
    );
  });
}

function pauseDownload(downloadId) {
  return new Promise((resolve) => {
    chrome.downloads.pause(downloadId, () => resolve());
  });
}

function resumeDownload(downloadId) {
  return new Promise((resolve) => {
    chrome.downloads.resume(downloadId, () => resolve());
  });
}

function cancelDownload(downloadId) {
  return new Promise((resolve) => {
    chrome.downloads.cancel(downloadId, () => resolve());
  });
}

function showDownloadFile(downloadId) {
  return new Promise((resolve) => {
    chrome.downloads.show(downloadId);
    resolve();
  });
}

function eraseDownload(downloadId) {
  return new Promise((resolve) => {
    chrome.downloads.erase({ id: downloadId }, () => resolve());
  });
}

function eraseAllDownloads() {
  return new Promise((resolve) => {
    chrome.downloads.erase({}, () => resolve());
  });
}

function deleteHistoryUrl(url) {
  return new Promise((resolve) => {
    chrome.history.deleteUrl({ url }, () => resolve());
  });
}

function clearAllHistory() {
  return new Promise((resolve) => {
    chrome.history.deleteAll(() => resolve());
  });
}

function createActionButton(label, className, onClick) {
  const button = document.createElement("button");
  button.className = className;
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", async (event) => {
    event.stopPropagation();
    await onClick();
  });
  return button;
}

function createClickableCard(tag, title, description, url, metaItems = []) {
  const card = createCard(tag, title, description, url, metaItems);

  if (url) {
    card.classList.add("content-card--clickable");
    card.addEventListener("click", () => {
      chrome.tabs.update({ url });
    });
  }

  return card;
}

function createDownloadCard(item) {
  const name = item.filename ? item.filename.split(/[/\\]/).pop() : "File tanpa nama";
  const description = item.finalUrl
    ? "Sumber file tersedia dan bisa dibuka langsung dari panel."
    : "Download tersimpan di sesi browser aktif.";
  const card = createCard(
    "Download",
    name || "File tanpa nama",
    description,
    item.url || item.finalUrl || "",
    [item.state || "unknown", formatDate(item.startTime)]
  );
  const actions = document.createElement("div");

  actions.className = "content-card__actions";

  if (item.state === "in_progress" && !item.paused) {
    actions.append(
      createActionButton("Pause", "card-action-button", async () => {
        await pauseDownload(item.id);
        await renderDownloads();
      })
    );
  }

  if (item.state === "in_progress" && item.paused) {
    actions.append(
      createActionButton("Lanjut", "card-action-button", async () => {
        await resumeDownload(item.id);
        await renderDownloads();
      })
    );
  }

  if (item.state === "in_progress") {
    actions.append(
      createActionButton("Batalkan", "card-action-button card-action-button--ghost", async () => {
        await cancelDownload(item.id);
        await renderDownloads();
      })
    );
  }

  actions.append(
    createActionButton("Buka Folder", "card-action-button card-action-button--ghost", async () => {
      await showDownloadFile(item.id);
    })
  );

  actions.append(
    createActionButton("Hapus", "card-action-button card-action-button--danger", async () => {
      await eraseDownload(item.id);
      await renderDownloads();
    })
  );

  card.append(actions);
  return card;
}

function createHistoryCard(item) {
  const card = createClickableCard(
    "History",
    item.title || item.url || "Tanpa judul",
    "Jejak halaman yang baru dibuka dari browser aktif.",
    item.url || "",
    [`${item.visitCount || 0} kunjungan`, formatDate(item.lastVisitTime)]
  );
  const actions = document.createElement("div");

  actions.className = "content-card__actions";
  actions.append(
    createActionButton("Hapus", "card-action-button card-action-button--danger", async () => {
      if (!item.url) {
        return;
      }

      await deleteHistoryUrl(item.url);
      await renderHistory();
    })
  );

  card.append(actions);
  return card;
}

function appendPanelToolbar(view) {
  if (!dataListElement) {
    return;
  }

  const toolbar = document.createElement("div");
  const spacer = document.createElement("div");
  const button = document.createElement("button");

  toolbar.className = "content-toolbar";
  spacer.className = "content-toolbar__spacer";
  button.className = "content-toolbar__button";
  button.type = "button";
  button.textContent = "Clear all";

  button.addEventListener("click", async () => {
    if (view === "downloads") {
      await eraseAllDownloads();
      await renderDownloads();
      return;
    }

    if (view === "history") {
      await clearAllHistory();
      await renderHistory();
    }
  });

  toolbar.append(spacer, button);
  dataListElement.before(toolbar);
}

function flattenBookmarks(nodes, bucket = []) {
  nodes.forEach((node) => {
    if (node.url) {
      bucket.push(node);
    }

    if (node.children && node.children.length > 0) {
      flattenBookmarks(node.children, bucket);
    }
  });

  return bucket;
}

function getBookmarks() {
  return new Promise((resolve) => {
    chrome.bookmarks.getTree((tree) => {
      resolve(flattenBookmarks(tree).slice(0, 30));
    });
  });
}

function getHistory() {
  return new Promise((resolve) => {
    chrome.history.search(
      {
        text: "",
        maxResults: 80,
        startTime: Date.now() - 1000 * 60 * 60 * 24 * 30
      },
      (items) => {
        const filteredItems = (items || []).filter((item) => {
          const url = item.url || "";

          if (!url) {
            return false;
          }

          return !url.startsWith("chrome-extension://") && !url.startsWith("chrome://");
        });

        resolve(filteredItems.slice(0, 30));
      }
    );
  });
}

function bindInlineActions(scope) {
  scope.querySelectorAll(".hero-action, .overview-action").forEach((button) => {
    button.addEventListener("click", () => {
      handleAction(button.dataset.action, button.dataset.view);
    });
  });
}

async function rerenderOverview() {
  if (getCurrentView() !== "overview") {
    return;
  }

  await renderOverview();
}

function bindGoogleSearch(scope) {
  const searchForm = scope.querySelector(".google-search-form");
  const searchInput = scope.querySelector(".google-search-input");

  if (!searchForm || !searchInput) {
    return;
  }

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const query = searchInput.value.trim();

    if (!query) {
      return;
    }

    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  });
}

function createTodoCard() {
  const todoCard = document.createElement("article");
  const head = document.createElement("div");
  const tag = document.createElement("span");
  const title = document.createElement("h3");
  const form = document.createElement("form");
  const input = document.createElement("input");
  const submit = document.createElement("button");
  const list = document.createElement("div");

  todoCard.className = "todo-card";
  head.className = "todo-card__head";
  tag.className = "card-tag";
  tag.textContent = "Todo";
  title.textContent = "Task board";
  head.append(tag, title);

  form.className = "todo-form";
  input.className = "todo-input";
  input.type = "text";
  input.maxLength = 120;
  input.placeholder = "Tambah task baru...";

  submit.className = "todo-submit";
  submit.type = "submit";
  submit.textContent = "Tambah";
  form.append(input, submit);

  list.className = "todo-list";

  if (todoState.length === 0) {
    const empty = document.createElement("div");
    empty.className = "todo-empty";
    empty.textContent = "Belum ada task. Tambah yang pertama buat mulai fokus.";
    list.append(empty);
  } else {
    todoState.forEach((item) => {
      const row = document.createElement("article");
      const toggleWrap = document.createElement("label");
      const toggleInput = document.createElement("input");
      const toggleVisual = document.createElement("span");
      const body = document.createElement("div");
      const actions = document.createElement("div");
      const isEditing = todoEditingId === item.id;

      row.className = "todo-item";
      if (item.done) {
        row.classList.add("is-done");
      }

      toggleWrap.className = "todo-check";
      toggleInput.className = "todo-check__input";
      toggleInput.type = "checkbox";
      toggleInput.checked = item.done;
      toggleInput.addEventListener("change", async () => {
        const nextTodos = todoState.map((todo) => {
          if (todo.id !== item.id) {
            return todo;
          }

          return {
            ...todo,
            done: !todo.done
          };
        });

        await saveTodos(nextTodos);
        await rerenderOverview();
      });

      toggleVisual.className = "todo-check__visual";
      toggleWrap.append(toggleInput, toggleVisual);

      body.className = "todo-body";

      if (isEditing) {
        const editInput = document.createElement("input");
        editInput.className = "todo-edit-input";
        editInput.type = "text";
        editInput.maxLength = 120;
        editInput.value = item.text;
        body.append(editInput);

        const saveButton = document.createElement("button");
        saveButton.className = "todo-action";
        saveButton.type = "button";
        saveButton.textContent = "Simpan";
        saveButton.addEventListener("click", async () => {
          const nextValue = editInput.value.trim();

          if (!nextValue) {
            return;
          }

          const nextTodos = todoState.map((todo) => {
            if (todo.id !== item.id) {
              return todo;
            }

            return {
              ...todo,
              text: nextValue
            };
          });

          todoEditingId = null;
          await saveTodos(nextTodos);
          await rerenderOverview();
        });

        const cancelButton = document.createElement("button");
        cancelButton.className = "todo-action todo-action--ghost";
        cancelButton.type = "button";
        cancelButton.textContent = "Batal";
        cancelButton.addEventListener("click", async () => {
          todoEditingId = null;
          await rerenderOverview();
        });

        actions.className = "todo-actions";
        actions.append(saveButton, cancelButton);
      } else {
        const text = document.createElement("p");
        text.className = "todo-text";
        text.textContent = item.text;
        body.append(text);

        const editButton = document.createElement("button");
        editButton.className = "todo-action";
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", async () => {
          todoEditingId = item.id;
          await rerenderOverview();
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "todo-action todo-action--ghost";
        deleteButton.type = "button";
        deleteButton.textContent = "Hapus";
        deleteButton.addEventListener("click", async () => {
          todoEditingId = todoEditingId === item.id ? null : todoEditingId;
          await saveTodos(todoState.filter((todo) => todo.id !== item.id));
          await rerenderOverview();
        });

        actions.className = "todo-actions";
        actions.append(editButton, deleteButton);
      }

      row.append(toggleWrap, body, actions);
      list.append(row);
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const value = input.value.trim();

    if (!value) {
      return;
    }

    todoEditingId = null;
    await saveTodos([
      {
        id: createTodoId(),
        text: value,
        done: false
      },
      ...todoState
    ]);
    await rerenderOverview();
  });

  todoCard.append(head, form, list);
  return todoCard;
}

async function renderOverview() {
  if (!dataListElement) {
    return;
  }

  updateMeta("overview", todoState.length);
  dataListElement.className = "data-list data-list--overview";
  dataListElement.replaceChildren();

  const overviewCard = document.createElement("article");
  overviewCard.className = "overview-card";
  overviewCard.innerHTML = `
    <div class="overview-card__copy">
      <span class="card-tag">System</span>
      <h3>Google search console</h3>
      <p>
        Cari apa pun langsung dari halaman utama Fira tanpa pindah dulu ke beranda mesin pencari.
      </p>
    </div>
    <form class="google-search-form">
      <input class="google-search-input" type="text" placeholder="Cari di Google..." maxlength="160" />
      <button class="google-search-submit" type="submit">Search</button>
    </form>
    <div class="overview-actions">
      <button class="overview-action" data-view="bookmarks">Buka bookmarks</button>
      <button class="overview-action overview-action--ghost" data-view="downloads">Cek downloads</button>
      <button class="overview-action overview-action--ghost" data-view="history">Lihat history</button>
    </div>
  `;

  const rightColumn = document.createElement("div");
  rightColumn.className = "overview-stack";

  rightColumn.append(createTodoCard());
  dataListElement.append(overviewCard, rightColumn);

  bindInlineActions(overviewCard);
  bindGoogleSearch(overviewCard);
}

async function renderDownloads() {
  if (!dataListElement) {
    return;
  }

  const items = await getDownloads();
  updateMeta("downloads", items.length);
  dataListElement.className = "data-list";
  dataListElement.previousElementSibling?.classList?.contains("content-toolbar") && dataListElement.previousElementSibling.remove();
  appendPanelToolbar("downloads");

  if (items.length === 0) {
    renderEmpty("Belum ada data download yang bisa ditampilkan.");
    return;
  }

  dataListElement.replaceChildren(
    ...items.map((item) => {
      return createDownloadCard(item);
    })
  );
}

async function renderBookmarks() {
  if (!dataListElement) {
    return;
  }

  const items = await getBookmarks();
  updateMeta("bookmarks", items.length);
  dataListElement.className = "data-list";
  dataListElement.previousElementSibling?.classList?.contains("content-toolbar") && dataListElement.previousElementSibling.remove();

  if (items.length === 0) {
    renderEmpty("Belum ada bookmark yang tersedia di browser ini.");
    return;
  }

  dataListElement.replaceChildren(
    ...items.map((item) => {
      return createCard(
        "Bookmark",
        item.title || item.url || "Tanpa judul",
        "Akses ulang link tersimpan langsung dari dashboard Fira.",
        item.url || "",
        [item.dateAdded ? formatDate(item.dateAdded) : "tanggal tidak tersedia"]
      );
    })
  );
}

async function renderHistory() {
  if (!dataListElement) {
    return;
  }

  const items = await getHistory();
  updateMeta("history", items.length);
  dataListElement.className = "data-list";
  dataListElement.previousElementSibling?.classList?.contains("content-toolbar") && dataListElement.previousElementSibling.remove();
  appendPanelToolbar("history");

  if (items.length === 0) {
    renderEmpty("Riwayat browsing belum ada atau belum bisa diakses.");
    return;
  }

  dataListElement.replaceChildren(
    ...items.map((item) => {
      return createHistoryCard(item);
    })
  );
}

async function renderView(view) {
  if (!statusElement || !countElement) {
    return;
  }

  statusElement.textContent = "Loading";
  countElement.textContent = "0";
  dataListElement?.previousElementSibling?.classList?.contains("content-toolbar") && dataListElement.previousElementSibling.remove();

  if (view === "downloads") {
    await renderDownloads();
    return;
  }

  if (view === "bookmarks") {
    await renderBookmarks();
    return;
  }

  if (view === "history") {
    await renderHistory();
    return;
  }

  await renderOverview();
}

function handleAction(action, view) {
  if (action === "new-tab") {
    chrome.tabs.create({});
    return;
  }

  if (!view || !viewConfig[view]) {
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.set("view", view);
  window.location.href = url.toString();
}

function bindNavigation() {
  actionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      handleAction(button.dataset.action, button.dataset.view);
    });
  });

  controlButtons.forEach((button) => {
    button.addEventListener("click", () => {
      handleAction(button.dataset.action, button.dataset.view);
    });
  });
}

function bootstrapInitialState() {
  if (!isNewTabPage()) {
    return;
  }

  const params = new URLSearchParams(window.location.search);

  if (!params.get("view")) {
    params.set("view", "overview");
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  }
}

async function bootstrapProfile() {
  profileState = await getProfile();

  if (!profileState) {
    toggleOnboarding(true);
    return;
  }

  toggleOnboarding(false);
}

async function bootstrapTodos() {
  todoState = await getTodos();
}

async function bootstrapApp() {
  bootstrapInitialState();
  bindOnboarding();
  await bootstrapProfile();
  await bootstrapTodos();
  updateClock();
  bindNavigation();
  await renderView(getCurrentView());
  window.setInterval(updateClock, 1000);
}

bootstrapApp();
