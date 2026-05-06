const DIMENSIONS = [
  "linguistic_complexity",
  "formula_density",
  "knowledge_abstractness",
  "structural_disorganization",
  "table_complexity",
];

const STORAGE_KEY = "expert-rating-tool-state-v1";

const state = {
  datasetName: "",
  samples: [],
  currentIndex: 0,
  expertName: "",
  ratings: {},
};

const demoData = [
  {
    text: "this is the charpter",
    image_path: "",
    cognitive_load_label: 1,
  },
  {
    text: "we wll Learning some interesting things",
    image_path: "",
    cognitive_load_label: 1,
  },
  {
    text: "Technical Principles and Applications of Large Language Models",
    image_path: "",
    cognitive_load_label: 1,
  },
];

const elements = {
  expertName: document.getElementById("expertName"),
  dataFile: document.getElementById("dataFile"),
  loadDemoBtn: document.getElementById("loadDemoBtn"),
  clearProgressBtn: document.getElementById("clearProgressBtn"),
  datasetName: document.getElementById("datasetName"),
  progressText: document.getElementById("progressText"),
  progressBar: document.getElementById("progressBar"),
  totalCount: document.getElementById("totalCount"),
  ratedCount: document.getElementById("ratedCount"),
  confirmedCount: document.getElementById("confirmedCount"),
  jumpToInput: document.getElementById("jumpToInput"),
  jumpBtn: document.getElementById("jumpBtn"),
  questionList: document.getElementById("questionList"),
  sampleTitle: document.getElementById("sampleTitle"),
  sampleText: document.getElementById("sampleText"),
  imageSection: document.getElementById("imageSection"),
  imagePath: document.getElementById("imagePath"),
  sampleIndexBadge: document.getElementById("sampleIndexBadge"),
  savedStateBadge: document.getElementById("savedStateBadge"),
  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  saveBtn: document.getElementById("saveBtn"),
  confirmBtn: document.getElementById("confirmBtn"),
  exportCsvBtn: document.getElementById("exportCsvBtn"),
  exportJsonBtn: document.getElementById("exportJsonBtn"),
  messageBox: document.getElementById("messageBox"),
};

function createQuickScoreButtons() {
  document.querySelectorAll(".quick-score").forEach((container) => {
    const target = container.dataset.target;
    for (let value = 1; value <= 10; value += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "score-chip";
      button.textContent = String(value);
      button.addEventListener("click", () => {
        document.getElementById(target).value = value;
        refreshQuickScoreState(target);
        saveDraft(false);
      });
      container.appendChild(button);
    }
  });
}

function refreshQuickScoreState(targetId) {
  const input = document.getElementById(targetId);
  const selected = String(input.value || "");
  const container = document.querySelector(`.quick-score[data-target="${targetId}"]`);
  if (!container) return;
  container.querySelectorAll(".score-chip").forEach((chip) => {
    chip.classList.toggle("active", chip.textContent === selected);
  });
}

function showMessage(text, isError = false) {
  elements.messageBox.textContent = text;
  elements.messageBox.style.color = isError ? "#a54d38" : "#607174";
  elements.messageBox.style.background = isError ? "#f7ddd6" : "#f0ede6";
}

function escapeCsv(value) {
  const raw = value == null ? "" : String(value);
  if (/[",\n]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

function isValidScore(value) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 10;
}

function normalizeSamples(data) {
  if (!Array.isArray(data)) {
    throw new Error("Data must be a JSON array.");
  }

  return data.map((item, index) => ({
    sample_id: index + 1,
    text: item.text ?? "",
    image_path: item.image_path ?? "",
    cognitive_load_label: item.cognitive_load_label ?? "",
  }));
}

function parseLooseJson(rawText) {
  const pattern = /\{\s*"text": "(?<text>.*?)",\s*"image_path": "(?<image>.*?)",\s*"cognitive_load_label": (?<label>-?\d+(?:\.\d+)?)\s*\}/gs;
  const rows = [];
  for (const match of rawText.matchAll(pattern)) {
    rows.push({
      text: match.groups.text,
      image_path: match.groups.image,
      cognitive_load_label: Number(match.groups.label),
    });
  }
  if (!rows.length) {
    throw new Error("The file is not valid JSON, and fallback parsing also failed.");
  }
  return rows;
}

function loadSamplesIntoState(samples, datasetName) {
  state.samples = normalizeSamples(samples);
  state.datasetName = datasetName;
  state.currentIndex = 0;

  const saved = loadStoredState();
  if (saved && saved.datasetName === datasetName && saved.samplesCount === state.samples.length) {
    state.ratings = saved.ratings ?? {};
    state.currentIndex = Math.min(saved.currentIndex ?? 0, state.samples.length - 1);
    state.expertName = saved.expertName ?? "";
    elements.expertName.value = state.expertName;
    showMessage("Local rating progress restored.");
  } else {
    state.ratings = {};
    saveToStorage();
    showMessage("Data loaded successfully. You can start rating.");
  }

  renderAll();
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read the file."));
    reader.readAsText(file, "utf-8");
  });
}

async function handleFileUpload(event) {
  const [file] = event.target.files || [];
  if (!file) return;

  try {
    const rawText = await readFileAsText(file);
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (error) {
      parsed = parseLooseJson(rawText);
    }
    loadSamplesIntoState(parsed, file.name);
  } catch (error) {
    showMessage(error.message, true);
  }
}

function loadStoredState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function saveToStorage() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      datasetName: state.datasetName,
      samplesCount: state.samples.length,
      currentIndex: state.currentIndex,
      expertName: state.expertName,
      ratings: state.ratings,
    }),
  );
}

function getCurrentSample() {
  return state.samples[state.currentIndex] ?? null;
}

function getRatingStatus(sampleId) {
  const rating = state.ratings[sampleId];
  if (!rating) return "neutral";
  return rating.confirmed ? "confirmed" : "editing";
}

function renderQuestionList() {
  elements.questionList.innerHTML = "";

  state.samples.forEach((sample, index) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "question-item";
    if (index === state.currentIndex) {
      item.classList.add("active");
    }

    const status = getRatingStatus(sample.sample_id);
    const title = document.createElement("span");
    title.textContent = `${sample.sample_id}. ${sample.text.slice(0, 28) || "Empty text sample"}`;

    const dot = document.createElement("span");
    dot.className = `dot ${status}`;

    item.appendChild(title);
    item.appendChild(dot);
    item.addEventListener("click", () => {
      navigateTo(index);
    });
    elements.questionList.appendChild(item);
  });
}

function renderStats() {
  const total = state.samples.length;
  const ratings = Object.values(state.ratings);
  const ratedCount = ratings.filter((item) => item && item.scores).length;
  const confirmedCount = ratings.filter((item) => item && item.confirmed).length;
  const progress = total ? ((state.currentIndex + 1) / total) * 100 : 0;

  elements.datasetName.textContent = state.datasetName || "No Data Loaded";
  elements.progressText.textContent = total ? `${state.currentIndex + 1} / ${total}` : "0 / 0";
  elements.progressBar.style.width = `${progress}%`;
  elements.totalCount.textContent = String(total);
  elements.ratedCount.textContent = String(ratedCount);
  elements.confirmedCount.textContent = String(confirmedCount);
}

function renderCurrentSample() {
  const sample = getCurrentSample();
  if (!sample) {
    elements.sampleTitle.textContent = "Please import data first";
    elements.sampleText.textContent = "After you import a JSON file, the current sample text will appear here.";
    elements.sampleIndexBadge.textContent = "#0";
    elements.savedStateBadge.textContent = "Unsaved";
    return;
  }

  const rating = state.ratings[sample.sample_id];
  elements.sampleTitle.textContent = `Sample ${sample.sample_id}`;
  elements.sampleText.textContent = sample.text || "This sample has no text content.";
  elements.sampleIndexBadge.textContent = `#${sample.sample_id}`;
  elements.savedStateBadge.textContent = rating?.confirmed ? "Confirmed" : rating ? "Saved" : "Unsaved";

  if (sample.image_path) {
    elements.imageSection.classList.remove("hidden");
    elements.imagePath.textContent = sample.image_path;
  } else {
    elements.imageSection.classList.add("hidden");
    elements.imagePath.textContent = "";
  }

  DIMENSIONS.forEach((dimension) => {
    const input = document.getElementById(dimension);
    input.value = rating?.scores?.[dimension] ?? "";
    refreshQuickScoreState(dimension);
  });
}

function renderAll() {
  renderStats();
  renderQuestionList();
  renderCurrentSample();
}

function collectScores() {
  const scores = {};
  for (const dimension of DIMENSIONS) {
    const value = document.getElementById(dimension).value.trim();
    if (!isValidScore(value)) {
      throw new Error(`Please enter an integer score from 1 to 10 for ${dimension}.`);
    }
    scores[dimension] = Number(value);
  }
  return scores;
}

function saveDraft(confirmed) {
  const sample = getCurrentSample();
  if (!sample) {
    showMessage("Please load data first.", true);
    return false;
  }

  try {
    state.expertName = elements.expertName.value.trim();
    const scores = collectScores();
    state.ratings[sample.sample_id] = {
      scores,
      confirmed,
      updated_at: new Date().toISOString(),
    };
    saveToStorage();
    renderAll();
    showMessage(confirmed ? "Current sample confirmed." : "Current sample saved. You can keep editing.");
    return true;
  } catch (error) {
    showMessage(error.message, true);
    return false;
  }
}

function navigateTo(index) {
  if (!state.samples.length) {
    showMessage("Please load data first.", true);
    return;
  }
  state.currentIndex = Math.max(0, Math.min(index, state.samples.length - 1));
  saveToStorage();
  renderAll();
}

function exportCsv() {
  if (!state.samples.length) {
    showMessage("There is no data to export.", true);
    return;
  }
  if (!elements.expertName.value.trim()) {
    showMessage("Please enter the expert name before exporting.", true);
    return;
  }

  const headers = [
    "sample_id",
    "expert_name",
    "text",
    "image_path",
    "cognitive_load_label",
    ...DIMENSIONS,
    "confirmed",
    "updated_at",
  ];

  const rows = state.samples.map((sample) => {
    const rating = state.ratings[sample.sample_id] ?? {};
    const scores = rating.scores ?? {};
    return [
      sample.sample_id,
      elements.expertName.value.trim(),
      sample.text,
      sample.image_path,
      sample.cognitive_load_label,
      ...DIMENSIONS.map((dimension) => scores[dimension] ?? ""),
      rating.confirmed ? "yes" : "no",
      rating.updated_at ?? "",
    ];
  });

  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
  downloadFile(csv, buildFileName("csv"), "text/csv;charset=utf-8;");
  showMessage("CSV exported.");
}

function exportJson() {
  if (!state.samples.length) {
    showMessage("There is no data to export.", true);
    return;
  }

  const payload = state.samples.map((sample) => ({
    sample_id: sample.sample_id,
    text: sample.text,
    image_path: sample.image_path,
    cognitive_load_label: sample.cognitive_load_label,
    expert_name: elements.expertName.value.trim(),
    scores: state.ratings[sample.sample_id]?.scores ?? {},
    confirmed: state.ratings[sample.sample_id]?.confirmed ?? false,
    updated_at: state.ratings[sample.sample_id]?.updated_at ?? "",
  }));

  downloadFile(JSON.stringify(payload, null, 2), buildFileName("json"), "application/json");
  showMessage("JSON backup exported.");
}

function buildFileName(extension) {
  const expert = (elements.expertName.value.trim() || "expert").replace(/[^\w-]+/g, "_");
  const dataset = (state.datasetName || "dataset").replace(/[^\w-]+/g, "_");
  return `${dataset}_${expert}_ratings.${extension}`;
}

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function clearProgress() {
  localStorage.removeItem(STORAGE_KEY);
  state.datasetName = "";
  state.samples = [];
  state.currentIndex = 0;
  state.expertName = "";
  state.ratings = {};
  elements.expertName.value = "";
  elements.dataFile.value = "";
  renderAll();
  showMessage("Local progress cleared.");
}

function bindEvents() {
  elements.dataFile.addEventListener("change", handleFileUpload);
  elements.loadDemoBtn.addEventListener("click", () => loadSamplesIntoState(demoData, "demo_data.json"));
  elements.clearProgressBtn.addEventListener("click", clearProgress);
  elements.prevBtn.addEventListener("click", () => navigateTo(state.currentIndex - 1));
  elements.nextBtn.addEventListener("click", () => navigateTo(state.currentIndex + 1));
  elements.saveBtn.addEventListener("click", () => saveDraft(false));
  elements.confirmBtn.addEventListener("click", () => saveDraft(true));
  elements.exportCsvBtn.addEventListener("click", exportCsv);
  elements.exportJsonBtn.addEventListener("click", exportJson);
  elements.jumpBtn.addEventListener("click", () => {
    const value = Number(elements.jumpToInput.value);
    if (!Number.isInteger(value) || value < 1 || value > state.samples.length) {
      showMessage("Please enter a valid sample number.", true);
      return;
    }
    navigateTo(value - 1);
  });

  DIMENSIONS.forEach((dimension) => {
    const input = document.getElementById(dimension);
    input.addEventListener("input", () => {
      refreshQuickScoreState(dimension);
    });
  });

  elements.expertName.addEventListener("input", () => {
    state.expertName = elements.expertName.value.trim();
    saveToStorage();
  });
}

function init() {
  createQuickScoreButtons();
  bindEvents();
  renderAll();
}

init();
