const highConfidenceRecommendations = [
  { title: "Dragon Ball Fighterz", system: "PlayStation 4", confidence: 96, reason: "Fast-paced team combat with accessible controls and competitive depth.", coverImage: "assets/dragonball-scan.jpg" },
  { title: "Mortal Kombat vs DC Universe", system: "PlayStation 3", confidence: 92, reason: "A crossover fighter featuring recognizable characters and cinematic battles.", coverImage: "assets/mortal-scan.jpg" },
  { title: "ClayFighter", system: "Super Nintendo Entertainment System", confidence: 88, reason: "A colorful classic fighter with unusual characters and lighthearted presentation.", coverImage: "assets/clayfighter-scan.jpg" },
]

const lowConfidenceRecommendations = [
  { title: "Balatro", system: "Nintendo Switch", confidence: 54, reason: "A strategic card game that may fit if experimentation and replayability matter most.", coverImage: "assets/balatro-scan.jpg" },
  { title: "Pac-Man World Rally", system: "PlayStation 2", confidence: 47, reason: "An arcade racer with familiar characters and accessible multiplayer action.", coverImage: "assets/pacman-world-rally-scan.jpg" },
  { title: "Minecraft", system: "Xbox 360", confidence: 41, reason: "An open-ended building game that may fit broader exploration and creativity requests.", coverImage: "assets/minecraft-scan.jpg" },
]

const recommendationExamples = [
  "Example: Platformers like Super Mario World, Sonic the Hedgehog 2, and Earthworm Jim",
  "Example: Sandbox games similar to Terraria, Garry's Mod, and The Sims 4",
  "Example: Games for the PlayStation 3 that are under $30",
  "Example: Games under the Sonic the Hedgehog franchise",
  "Example: Fighting games for the Xbox360 and Xbox One"
]

function storedRecommendationExampleIndex() {
  const stored = sessionStorage.getItem("recommendation-example-index")
  const parsed = stored === null ? -1 : Number(stored)
  return Number.isInteger(parsed) ? parsed : -1
}

const SCAN_GAMES = [
  { title: "Pikmin 2", system: "Nintendo GameCube", year: "2004", publisher: "Nintendo", releaseDate: "08/30/2004", avgPrice: "$74.99", condition: "5", coverImage: "assets/pikmin2-scan.jpg" },
  { title: "Breath of the Wild", system: "Nintendo Switch", year: "2017", publisher: "Nintendo", releaseDate: "03/03/2017", avgPrice: "$58.99", condition: "5", coverImage: "assets/botw-scan.jpg" },
  { title: "Metroid Prime Remaster", system: "Nintendo Switch", year: "2023", publisher: "Nintendo", releaseDate: "02/08/2023", avgPrice: "$39.99", condition: "5", coverImage: "assets/metroid-prime-scan.jpg" },
  { title: "Assassian's Creed", system: "PlayStation 3", year: "2007", publisher: "Ubisoft", releaseDate: "11/13/2007", avgPrice: "$14.99", condition: "5", coverImage: "assets/assassians-creed-scan.jpg" },
  { title: "Street Fighter 6", system: "PlayStation 5", year: "2023", publisher: "Capcom", releaseDate: "06/02/2023", avgPrice: "$34.99", condition: "5", coverImage: "assets/street-fighter6-scan.jpg" },
  { title: "We Love Katamari", system: "PlayStation 2", year: "2005", publisher: "Namco", releaseDate: "09/20/2005", avgPrice: "$24.99", condition: "5", coverImage: "assets/we-love-katamari-scan.jpg" },
  { title: "Pac-Man World 3", system: "Nintendo DS", year: "2005", publisher: "Namco Hometek", releaseDate: "12/06/2005", avgPrice: "$29.99", condition: "5", coverImage: "assets/pacman-world3-scan.jpg" },
  { title: "Super Mario Kart", system: "Super Nintendo Entertainment System", year: "1992", publisher: "Nintendo", releaseDate: "09/01/1992", avgPrice: "$44.99", condition: "5", coverImage: "assets/super-mario-kart-scan.jpg" },
  { title: "The Orange Box", system: "Xbox 360", year: "2007", publisher: "Electronic Arts", releaseDate: "10/10/2007", avgPrice: "$34.99", condition: "5", coverImage: "assets/the-orange-box-scan.jpg" },
  { title: "Batman: Arkham Knight", system: "Xbox One", year: "2015", publisher: "Warner Bros.", releaseDate: "06/23/2015", avgPrice: "$19.99", condition: "5", coverImage: "assets/batman-scan.jpg" },
]

const COVER_GRADIENTS = [
  "linear-gradient(145deg,#0d2b1a,#1a5c34)",
  "linear-gradient(145deg,#0d0d2b,#1a1a5c)",
  "linear-gradient(145deg,#2b0d0d,#5c1a1a)",
  "linear-gradient(145deg,#1a0d2b,#3c1a5c)",
  "linear-gradient(145deg,#0d1a2b,#1a3c5c)",
  "linear-gradient(145deg,#2b1a0d,#5c3c1a)",
  "linear-gradient(145deg,#0d2b2b,#1a5c5c)",
  "linear-gradient(145deg,#1a2b0d,#3c5c1a)",
]

function gradientFor(title) {
  let h = 5381
  for (let i = 0; i < title.length; i++) h = ((h << 5) + h + title.charCodeAt(i)) | 0
  return COVER_GRADIENTS[Math.abs(h) % COVER_GRADIENTS.length]
}

function todayStr() {
  const d = new Date()
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`
}

function makeId(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

function starsHtml(value, interactive, dirty) {
  const v = parseInt(value) || 0
  const cls = ["star-rating", interactive ? "interactive" : "", dirty ? "dirty" : ""].filter(Boolean).join(" ")
  return `<div class="${cls}">${[1,2,3,4,5].map(i =>
    `<span class="star${v >= i ? " on" : ""}" ${interactive ? `data-star="${i}" role="button" tabindex="0"` : ""}>${v >= i ? "★" : "☆"}</span>`
  ).join("")}</div>`
}

const state = {
  page: "home",
  loggedIn: true,
  profileOpen: false,
  instructions: "",
  submitted: "",
  recommendationResult: null,
  recommendationCount: 0,
  recommendationProgress: 0,
  recommendationScanning: false,
  recommendationTimer: null,
  recommendationExampleIndex: storedRecommendationExampleIndex(),
  collection: [],
  wishlist: [],
  viewingGame: null,
  editing: false,
  editDraft: null,
  auth: null,
  scanPreview: "",
  scanProgress: 0,
  scanResult: null,
  scanGame: SCAN_GAMES[0],
  scanning: false,
  scanCount: 0,
  scanFile: null,
  scanTimer: null,
  undoEntry: null,
  undoTimer: null,
}

const app = document.querySelector("#app")

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[c])
}

function coverHtml(game, cls) {
  if (game.coverImage) {
    return `<img src="${escapeHtml(game.coverImage)}" alt="${escapeHtml(game.title)}" class="${cls}">`
  }
  return `<div class="${cls} cover-ph" style="background:${gradientFor(game.title)}"><span class="ph-text">${escapeHtml(game.title)}</span></div>`
}

function inCollection(title) { return state.collection.some((g) => g.title === title) }
function onWishlist(title) { return state.wishlist.some((w) => w.title === title) }

function removeFromCollection(title) {
  const game = state.collection.find((entry) => entry.title === title)
  if (!game) return
  state.collection = state.collection.filter((entry) => entry.title !== title)
  if (state.undoTimer) clearTimeout(state.undoTimer)
  state.undoEntry = { game, source: "collection" }
  state.undoTimer = setTimeout(() => { state.undoEntry = null; state.undoTimer = null; render() }, 5000)
}

function removeFromWishlist(title) {
  const game = state.wishlist.find((entry) => entry.title === title)
  if (!game) return
  state.wishlist = state.wishlist.filter((entry) => entry.title !== title)
  if (state.undoTimer) clearTimeout(state.undoTimer)
  state.undoEntry = { game, source: "wishlist" }
  state.undoTimer = setTimeout(() => { state.undoEntry = null; state.undoTimer = null; render() }, 5000)
}

function totalValue() {
  return state.collection.reduce((sum, g) => {
    const n = parseFloat(g.avgPrice.replace(/[^0-9.]/g, ""))
    return sum + (isNaN(n) ? 0 : n)
  }, 0)
}

function renderCover_grid(game) { return coverHtml(game, "grid-cover") }
function renderCover_detail(game) { return coverHtml(game, "detail-cover") }
function renderCover_recent(game) { return coverHtml(game, "recent-cover") }

// ── Page renderers ──────────────────────────────────

function homePage() {
  const recentlyAdded = state.loggedIn ? `
    <div class="recently-added" style="margin-top: 20px;">
      <h3>Recently Added Games</h3>
      ${state.collection.length > 0 ? `<div class="recently-scroll">
        ${[...state.collection].reverse().slice(0, 8).map((game) => `
          <button class="recent-card open-game" data-id="${escapeHtml(game.id)}" data-source="collection" aria-label="${escapeHtml(game.title)}">
            ${renderCover_recent(game)}
            <div class="recent-title">${escapeHtml(game.title)}</div>
          </button>
        `).join("")}
      </div>` : '<p class="recently-empty">There are currently no games in your collection</p>'}
    </div>` : ""

  const recentlyWishlisted = state.loggedIn ? `
    <div class="recently-added" style="margin-top: 20px;">
      <h3>Recently Wishlisted Games</h3>
      ${state.wishlist.length > 0 ? `<div class="recently-scroll">
        ${[...state.wishlist].reverse().slice(0, 8).map((game) => `
          <button class="recent-card open-game" data-id="${escapeHtml(game.id)}" data-source="wishlist" aria-label="${escapeHtml(game.title)}">
            ${renderCover_recent(game)}
            <div class="recent-title">${escapeHtml(game.title)}</div>
          </button>
        `).join("")}
      </div>` : '<p class="recently-empty">There are currently no games in your wishlist</p>'}
    </div>` : ""

  return `
    <div class="home-hero-logo">
      <img src="assets/logo.png" alt="Collector's Companion" class="hero-logo-img">
    </div>

    <section>
      <p>The AI-assisted site that helps you collect, discover, and analyze your games.</p>
    </section>

    <div class="action-row" style="padding-bottom: 12px;">
      <button class="primary green" data-page="scan">Start Scanning Games</button>
    </div>
    ${recentlyAdded}

    <div class="action-row" style="margin-top: 16px; padding-bottom: 12px;">
      <button class="primary olive" data-page="recommendations">Search for<br>Recommendations</button>
    </div>
    ${recentlyWishlisted}
  `
}

function scanPage() {
  const scanGame = state.scanGame
  const scanGameInCol = inCollection(scanGame.title)
  const scanGameOnWish = onWishlist(scanGame.title)

  const successResult = `
    <div class="scan-result success">
      <span>Successful match · 96% confidence</span>
      <div class="scan-result-inner">
        ${coverHtml(scanGame, "scan-result-cover")}
        <div class="scan-result-info">
          <h2>${escapeHtml(scanGame.title)}</h2>
          <div class="scan-meta-rows">
            <div class="scan-meta-row"><span>Platform</span><span>${escapeHtml(scanGame.system)}</span></div>
            <div class="scan-meta-row"><span>Publisher</span><span>${escapeHtml(scanGame.publisher)}</span></div>
            <div class="scan-meta-row"><span>Release Date</span><span>${escapeHtml(scanGame.releaseDate)}</span></div>
            <div class="scan-meta-row"><span>Avg. Price</span><span>${escapeHtml(scanGame.avgPrice)}</span></div>
            <div class="scan-meta-row"><span>Condition</span><span>${escapeHtml(scanGame.condition)}.0</span></div>
          </div>
        </div>
      </div>
      <div class="result-actions">
        <button class="save-button ${scanGameInCol ? "danger-action remove-from-collection" : "add-to-collection"}" data-title="${escapeHtml(scanGame.title)}" data-system="${escapeHtml(scanGame.system)}" data-year="${escapeHtml(scanGame.year)}" data-price="${escapeHtml(scanGame.avgPrice)}" data-condition="${escapeHtml(scanGame.condition)}" data-cover="${escapeHtml(scanGame.coverImage || "")}">
          ${scanGameInCol ? "- Remove From Collection" : "＋ Add to Collection"}
        </button>
        <button class="save-button ${state.loggedIn && scanGameOnWish ? "danger-action remove-from-wishlist" : "add-to-wishlist"}" data-title="${escapeHtml(scanGame.title)}" data-system="${escapeHtml(scanGame.system)}" data-year="${escapeHtml(scanGame.year)}" data-cover="${escapeHtml(scanGame.coverImage || "")}">
          ${state.loggedIn ? (scanGameOnWish ? "- Wishlist" : "＋ Wishlist") : "Login to save"}
        </button>
      </div>
    </div>`

  const lowResult = `
    <div class="scan-result low">
      <span>Possible match · 54% confidence</span>
      <div class="scan-result-inner">
        ${coverHtml(scanGame, "scan-result-cover")}
        <div class="scan-result-info">
          <h2>${escapeHtml(scanGame.title)}</h2>
          <p class="scan-low-note">Unclear image. Confirm or try another angle.</p>
          <div class="scan-meta-rows">
            <div class="scan-meta-row"><span>Platform</span><span>${escapeHtml(scanGame.system)}</span></div>
            <div class="scan-meta-row"><span>Publisher</span><span>${escapeHtml(scanGame.publisher)}</span></div>
            <div class="scan-meta-row"><span>Release Date</span><span>${escapeHtml(scanGame.releaseDate)}</span></div>
            <div class="scan-meta-row"><span>Avg. Price</span><span>${escapeHtml(scanGame.avgPrice)}</span></div>
          </div>
        </div>
      </div>
      <div class="result-actions">
        <button class="save-button ${scanGameInCol ? "danger-action remove-from-collection" : "add-to-collection"}" data-title="${escapeHtml(scanGame.title)}" data-system="${escapeHtml(scanGame.system)}" data-year="${escapeHtml(scanGame.year)}" data-price="${escapeHtml(scanGame.avgPrice)}" data-condition="${escapeHtml(scanGame.condition)}" data-cover="${escapeHtml(scanGame.coverImage || "")}">
          ${scanGameInCol ? "- Remove From Collection" : "＋ Add to Collection"}
        </button>
        <button class="save-button ${state.loggedIn && scanGameOnWish ? "danger-action remove-from-wishlist" : "add-to-wishlist"}" data-title="${escapeHtml(scanGame.title)}" data-system="${escapeHtml(scanGame.system)}" data-year="${escapeHtml(scanGame.year)}" data-cover="${escapeHtml(scanGame.coverImage || "")}">
          ${state.loggedIn ? (scanGameOnWish ? "- Wishlist" : "＋ Wishlist") : "Login to save"}
        </button>
      </div>
    </div>`

  const failedResult = `
    <div class="scan-result failed">
      <span>Scan failed</span>
      <h2>We couldn't identify this game</h2>
      <p>Try brighter lighting and make sure the full cover is visible.</p>
    </div>`

  const result = { success: successResult, low: lowResult, failed: failedResult }[state.scanResult] || ""

  const recentlyAdded = state.loggedIn ? `
    <div class="recently-added">
      <h3>Recently Added Games</h3>
      ${state.collection.length > 0 ? `<div class="recently-scroll">
        ${[...state.collection].reverse().slice(0, 8).map((game) => `
          <button class="recent-card open-game" data-id="${escapeHtml(game.id)}" data-source="collection" aria-label="${escapeHtml(game.title)}">
            ${renderCover_recent(game)}
            <div class="recent-title">${escapeHtml(game.title)}</div>
          </button>
        `).join("")}
      </div>` : '<p class="recently-empty">There are currently no games in your collection</p>'}
    </div>` : ""

  return `
    <section class="tool-page">
      <p class="eyebrow">GAME SCANNER</p>
      <h1>Scan a game</h1>
      <p>Upload a clear photo of a game case. We'll identify it and add it to your collection.</p>
      <label class="upload-box ${state.scanPreview ? "has-preview" : ""}">
        ${state.scanPreview ? `<img src="${escapeHtml(state.scanPreview)}" alt="Selected game">` : '<span class="upload-mark">＋</span>'}
        <strong>${state.scanPreview ? "Choose another photo" : "Choose a game photo"}</strong>
        <span>JPG, PNG, or HEIC</span>
        <input id="game-photo" type="file" accept="image/*" ${state.scanning ? "disabled" : ""}>
      </label>
      ${state.scanPreview ? `
        <div class="scan-controls">
          <button type="button" class="scan-control rescan" id="rescan-game" ${state.scanning ? "disabled" : ""}>Re-scan Same Game</button>
          <button type="button" class="scan-control new-photo" id="upload-new-photo" ${state.scanning ? "disabled" : ""}>Upload New Photo</button>
        </div>` : ""}
      ${state.scanning ? '<div class="cancel-process"><button type="button" id="cancel-scan">Cancel Scan</button></div>' : ""}
      ${state.scanning || state.scanProgress > 0 ? `
        <div class="scan-processing" aria-live="polite">
          <div class="processing-label"><span>${state.scanning ? "Analyzing game image…" : "Processing complete"}</span><strong>${state.scanProgress}%</strong></div>
          <div class="progress-track"><div class="progress-fill" style="width:${state.scanProgress}%"></div></div>
        </div>` : ""}
      ${result}
      ${recentlyAdded}
      ${state.loggedIn ? '<div class="scan-collection-action"><button class="primary green" data-page="collection">View Full Collection</button></div>' : ""}
    </section>
  `
}

function collectionPage() {
  const platforms = [...new Set(state.collection.map((g) => g.system))]
  const total = totalValue()

  const statsHtml = state.collection.length ? `
    <div class="collection-stats">
      <div class="stat-pill"><strong>${state.collection.length}</strong><span>game${state.collection.length !== 1 ? "s" : ""}</span></div>
      <div class="stat-pill"><strong>${platforms.length}</strong><span>platform${platforms.length !== 1 ? "s" : ""}</span></div>
      <div class="stat-pill"><strong>$${total.toFixed(2)}</strong><span>total value</span></div>
    </div>` : ""

  const gridHtml = state.collection.length ? `
    <div class="game-grid">
      ${state.collection.map((game) => `
        <button class="game-grid-card open-game" data-id="${escapeHtml(game.id)}" data-source="collection" aria-label="${escapeHtml(game.title)}">
          ${renderCover_grid(game)}
          <div class="grid-card-body">
            <strong>${escapeHtml(game.title)}</strong>
            <small>${escapeHtml(game.system)} · ${escapeHtml(game.year)}</small>
          </div>
        </button>
      `).join("")}
    </div>` : `
    <div class="empty-state">
      <p style="margin-bottom:18px">Your collection is empty. Scan a game to add it to your library.</p>
      <button class="primary green" data-page="scan">Scan a Game</button>
    </div>`

  return `
    <section class="tool-page">
      <p class="eyebrow">MY COLLECTION</p>
      <h1>Collection</h1>
      <p>Every game you've added to your library.</p>
      ${statsHtml}
      ${gridHtml}
    </section>
  `
}

function wishlistPage() {
  const gridHtml = state.wishlist.length ? `
    <div class="game-grid">
      ${state.wishlist.map((game) => `
        <button class="game-grid-card open-game" data-id="${escapeHtml(game.id)}" data-source="wishlist" aria-label="${escapeHtml(game.title)}">
          ${renderCover_grid(game)}
          <div class="grid-card-body">
            <strong>${escapeHtml(game.title)}</strong>
            <small>${escapeHtml(game.system)}${game.year ? ` · ${escapeHtml(game.year)}` : ""}</small>
          </div>
        </button>
      `).join("")}
    </div>` : `<div class="empty-state">Your wishlist is empty. Add a game from Recommendations.</div>`

  return `
    <section class="tool-page">
      <p class="eyebrow">WANT TO PLAY</p>
      <h1>Wishlist</h1>
      <p>Keep track of games you want to add to your shelf.</p>
      ${gridHtml}
    </section>
  `
}

function gameDetailPage() {
  if (!state.viewingGame) return ""
  const { game, source } = state.viewingGame
  const backLabel = source === "collection" ? "Collection" : "Wishlist"

if (state.editing && state.editDraft) {
    const d = state.editDraft
    const orig = game
    const dc = (field, val) => d[field] !== orig[field] ? " dirty" : ""
    return `
      <section class="tool-page">
        <button class="back-btn" id="back-btn">← Back to ${backLabel}</button>
        <p class="edit-badge eyebrow">EDIT MODE</p>
        <div class="detail-cover-wrap">${renderCover_detail(d)}</div>
        <div class="detail-meta">
          <div class="detail-row"><label>Title</label><input class="detail-field${dc("title")}" id="edit-title" style="width:200px" value="${escapeHtml(d.title)}"></div>
          <div class="detail-row"><label>Platform</label><input class="detail-field${dc("system")}" id="edit-system" value="${escapeHtml(d.system)}"></div>
          ${source === "collection" ? `
            <div class="detail-row"><label>Released</label><input class="detail-field year-field${dc("year")}" id="edit-year" inputmode="numeric" maxlength="4" placeholder="YYYY" value="${escapeHtml(d.year)}"></div>
            <div class="detail-row"><label>Avg Selling Price</label><div class="price-wrap${dc("avgPrice")}"><span class="price-prefix">$</span><input class="price-field" id="edit-price" inputmode="decimal" placeholder="0.00" value="${escapeHtml(d.avgPrice.replace(/^\$/, ""))}"></div></div>
            ${(() => { const [dM="",dD="",dY=""] = (d.dateAdded || "").split("/"); return `<div class="detail-row"><label>Date Added</label><div class="date-wrap${dc("dateAdded")}"><input class="date-part" id="edit-date-m" inputmode="numeric" maxlength="2" placeholder="MM" value="${escapeHtml(dM)}"><span class="date-sep">/</span><input class="date-part" id="edit-date-d" inputmode="numeric" maxlength="2" placeholder="DD" value="${escapeHtml(dD)}"><span class="date-sep">/</span><input class="date-part date-part-year" id="edit-date-y" inputmode="numeric" maxlength="4" placeholder="YYYY" value="${escapeHtml(dY)}"></div></div>` })()}
            <div class="detail-row"><label class="${dc("condition") ? "dirty-lbl" : ""}">Condition</label>${starsHtml(d.condition, true, !!dc("condition"))}</div>
          ` : ""}
        </div>
        <div class="detail-actions">
          <button class="detail-btn green" id="save-edit">Save Changes</button>
          <button class="detail-btn neutral" id="cancel-edit">Cancel</button>
        </div>
      </section>`
  }

  if (source === "collection") {
    return `
      <section class="tool-page">
        <button class="back-btn" id="back-btn">← Back to Collection</button>
        <div class="detail-cover-wrap">${renderCover_detail(game)}</div>
        <h1 class="detail-title">${escapeHtml(game.title)}</h1>
        <div class="detail-meta">
          <div class="detail-row"><label>Platform</label><span class="val">${escapeHtml(game.system)}</span></div>
          <div class="detail-row"><label>Released</label><span class="val">${escapeHtml(game.year)}</span></div>
          <div class="detail-row"><label>Avg Selling Price</label><span class="val">${escapeHtml(game.avgPrice)}</span></div>
          <div class="detail-row"><label>Date Added</label><span class="val">${escapeHtml(game.dateAdded)}</span></div>
          <div class="detail-row"><label>Condition</label>${starsHtml(game.condition, false, false)}</div>
        </div>
        <div class="detail-actions">
          <button class="detail-btn green" id="view-collection-btn">View Full Collection</button>
          <button class="detail-btn neutral" id="edit-game-btn">Edit Game</button>
          <button class="detail-btn danger" id="remove-game-btn">- Remove From Collection</button>
        </div>
      </section>`
  }

  // Wishlist item view matching collection layout
  const alreadyIn = inCollection(game.title)
  return `
    <section class="tool-page">
      <button class="back-btn" id="back-btn">← Back to Wishlist</button>
      <div class="detail-cover-wrap">${renderCover_detail(game)}</div>
      <h1 class="detail-title">${escapeHtml(game.title)}</h1>
      <div class="detail-meta">
        <div class="detail-row"><label>Platform</label><span class="val">${escapeHtml(game.system)}</span></div>
        ${game.year ? `<div class="detail-row"><label>Released</label><span class="val">${escapeHtml(game.year)}</span></div>` : ""}
      </div>
      <div class="detail-actions">
        <button class="detail-btn green" id="view-wishlist-btn" style="background: #5EA729;">View Wishlist</button>
        <button class="detail-btn neutral" id="edit-game-btn">Edit Game</button>
        <button class="detail-btn ${alreadyIn ? "danger" : "neutral"}" id="collection-toggle-btn">
          ${alreadyIn ? "- Remove From Collection" : "Add to Collection"}
        </button>
        <button class="detail-btn danger" id="remove-game-btn" style="background: #A73D28;">- Remove From Wishlist</button>
      </div>
    </section>`
}

function recommendationsPage() {
  const recommendationGames = state.recommendationResult === "low"
    ? lowConfidenceRecommendations
    : highConfidenceRecommendations
  const status = {
    failed: `
      <div class="recommendation-status failed">
        <span>Recommendation failed</span>
        <h2>We couldn't find a confident match</h2>
        <p>Try adding a platform, genre, budget, or a game you already enjoy.</p>
      </div>`,
  }[state.recommendationResult] || ""

  const results = state.submitted ? `
    <div class="results" aria-live="polite">
      ${status}
      ${state.recommendationResult !== "failed" ? recommendationGames.map((game) => {
        const saved = state.loggedIn && onWishlist(game.title)
        return `
          <article class="game-card recommendation-card ${state.recommendationResult}">
            ${coverHtml(game, "rec-thumb")}
            <div class="rec-info">
              <span class="game-confidence">${state.recommendationResult === "success" ? "Successful match" : "Possible match"} · ${game.confidence}% confidence</span>
              <strong>${escapeHtml(game.title)}</strong>
              <small>${escapeHtml(game.system)}</small>
              <p>${escapeHtml(game.reason)}</p>
            </div>
            <button class="save-button rec-wishlist ${saved ? "danger-action remove-from-wishlist" : ""}" data-title="${escapeHtml(game.title)}" data-system="${escapeHtml(game.system)}">
              ${state.loggedIn ? (saved ? "- Wishlist" : "＋ Wishlist") : "Login to save"}
            </button>
          </article>`
      }).join("") : ""}
    </div>` : ""

  const recentlyWishlisted = state.loggedIn ? `
    <div class="recently-added">
      <h3>Recently Wishlisted Games</h3>
      ${state.wishlist.length > 0 ? `<div class="recently-scroll">
        ${[...state.wishlist].reverse().slice(0, 8).map((game) => `
          <button class="recent-card open-game" data-id="${escapeHtml(game.id)}" data-source="wishlist" aria-label="${escapeHtml(game.title)}">
            ${renderCover_recent(game)}
            <div class="recent-title">${escapeHtml(game.title)}</div>
          </button>
        `).join("")}
      </div>` : '<p class="recently-empty">There are currently no games in your wishlist</p>'}
    </div>
    <div class="scan-collection-action">
      <button class="primary green" data-page="wishlist">View Full Wishlist</button>
    </div>` : ""

  return `
    <section class="tool-page">
      <p class="eyebrow">FIND YOUR NEXT GAME</p>
      <h1>Recommendations</h1>
      <p>Tell us what you enjoy, which systems you own, or what kind of game you're looking for.</p>
      <form id="recommendation-form">
        <label for="instructions">Your instructions</label>
        <textarea id="instructions" maxlength="500" placeholder="${escapeHtml(recommendationExamples[Math.max(0, state.recommendationExampleIndex)])}">${escapeHtml(state.instructions)}</textarea>
        <div class="form-meta">
          <span id="character-count">${state.instructions.length}/500</span>
          <button class="primary olive" type="submit" ${state.instructions.trim() && !state.recommendationScanning ? "" : "disabled"}>Get Recommendations</button>
        </div>
      </form>
      ${state.recommendationScanning ? '<div class="cancel-process"><button type="button" id="cancel-recommendations">Cancel Recommendations</button></div>' : ""}
      ${state.recommendationScanning || state.recommendationProgress > 0 ? `
        <div class="scan-processing" aria-live="polite">
          <div class="processing-label"><span>${state.recommendationScanning ? "Finding recommendations…" : "Recommendations ready"}</span><strong>${state.recommendationProgress}%</strong></div>
          <div class="progress-track"><div class="progress-fill" style="width:${state.recommendationProgress}%"></div></div>
        </div>` : ""}
      ${results}
      ${recentlyWishlisted}
    </section>`
}

function authModal() {
  if (!state.auth) return ""
  return `
    <div class="modal-backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-label="${state.auth}">
        <button class="close" aria-label="Close">×</button>
        <p class="eyebrow">COLLECTOR'S COMPANION</p>
        <h2>${state.auth}</h2>
        <label>Email<input type="email" placeholder="you@example.com"></label>
        <label>Password<input type="password" placeholder="••••••••"></label>
        <button class="primary green auth-continue">Continue</button>
        <small>Demo only — account services are not connected yet.</small>
      </div>
    </div>`
}

// ── Render ──────────────────────────────────────────

function render() {
  // Capture the scroll position of the current main container before it's destroyed
  const mainContainer = document.querySelector("main");
  const scrollPos = mainContainer ? mainContainer.scrollTop : 0;

  const pages = { home: homePage, scan: scanPage, collection: collectionPage, wishlist: wishlistPage, recommendations: recommendationsPage };
  const activePage = state.viewingGame
    ? (state.viewingGame.source === "collection" ? "collection" : "wishlist")
    : state.page;

  const mainContent = state.viewingGame ? gameDetailPage() : pages[state.page]();

  app.innerHTML = `
    <div class="app-shell">
      <header>
        <div class="topbar">
          <button class="brand" data-page="home">
            <img src="assets/logo.png" alt="Collector's Companion" class="header-logo">
          </button>
          <div class="auth-actions">
            ${state.loggedIn
              ? `<div class="profile-wrap">
                  <button class="profile-avatar" id="profile-toggle" aria-label="User profile">TU</button>
                  ${state.profileOpen ? `
                    <div class="profile-backdrop" id="profile-backdrop"></div>
                    <div class="profile-dropdown">
                      <div class="profile-name">Test User</div>
                      <button id="logout">Log Out</button>
                    </div>` : ""}
                </div>`
              : '<button data-auth="Sign Up">Sign Up</button><button data-auth="Login">Login</button>'}
          </div>
        </div>
      </header>
      <main>${mainContent}</main>
      <nav class="bottom-nav" aria-label="Main navigation">
        <button class="${activePage === "scan" ? "active" : ""}" data-page="scan">Scan Game</button>
        <button class="${activePage === "recommendations" ? "active" : ""}" data-page="recommendations">Recommend</button>
        ${state.loggedIn ? `
          <button class="${activePage === "collection" ? "active" : ""}" data-page="collection">Collection</button>
          <button class="${activePage === "wishlist" ? "active" : ""}" data-page="wishlist">Wishlist</button>
        ` : ""}
      </nav>
      ${state.undoEntry ? `
        <div class="undo-toast">
          <span>"${escapeHtml(state.undoEntry.game.title)}" removed</span>
          <button id="undo-remove">Undo</button>
        </div>` : ""}
      ${authModal()}
    </div>
  `;

  bindEvents();

  // Restore the scroll position immediately on the new main element
  const newMainContainer = document.querySelector("main");
  if (newMainContainer) {
    newMainContainer.scrollTop = scrollPos;
  }
}

// ── Events ──────────────────────────────────────────

function navigate(target) {
  if ((target === "wishlist" || target === "collection") && !state.loggedIn) {
    state.auth = "Login"
    render()
    return
  }
  state.viewingGame = null
  state.editing = false
  state.editDraft = null
  if (target === "recommendations" && state.page !== "recommendations") {
    state.recommendationExampleIndex = (state.recommendationExampleIndex + 1) % recommendationExamples.length
    sessionStorage.setItem("recommendation-example-index", String(state.recommendationExampleIndex))
  }
  state.page = target
  render()
  animatePageEntry() // <--- Animation only runs on page change
  const main = document.querySelector("main")
  if (main) main.scrollTop = 0
}

function openGame(id, source) {
  if (!state.loggedIn) { state.auth = "Login"; render(); return }
  const list = source === "collection" ? state.collection : state.wishlist
  const game = list.find((g) => g.id === id)
  if (!game) return
  state.viewingGame = { game, source }
  state.editing = false
  state.editDraft = null
  render()
  animatePageEntry()
  window.scrollTo({ top: 0, behavior: "smooth" })
}

function closeGame() {
  state.viewingGame = null
  state.editing = false
  state.editDraft = null
  render()
  animatePageEntry()
}

function bindEvents() {
  // Nav & page links
  document.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => navigate(btn.dataset.page))
  })

  // Auth
  document.querySelectorAll("[data-auth]").forEach((btn) => {
    btn.addEventListener("click", () => { state.auth = btn.dataset.auth; render() })
  })
  document.querySelector(".close")?.addEventListener("click", () => { state.auth = null; render() })
  document.querySelector(".auth-continue")?.addEventListener("click", () => { state.loggedIn = true; state.auth = null; render() })
  document.querySelector("#logout")?.addEventListener("click", () => { state.loggedIn = false; state.page = "home"; state.viewingGame = null; state.profileOpen = false; render() })
  document.querySelector(".modal-backdrop")?.addEventListener("click", (e) => { if (e.target.classList.contains("modal-backdrop")) { state.auth = null; render() } })
  document.querySelector("#profile-toggle")?.addEventListener("click", () => { state.profileOpen = !state.profileOpen; render() })
  document.querySelector("#profile-backdrop")?.addEventListener("mousedown", () => { state.profileOpen = false; render() })

  // View full wishlist from wishlist game detail view
  document.querySelector("#view-wishlist-btn")?.addEventListener("click", () => {
    state.viewingGame = null
    state.editing = false
    state.editDraft = null
    navigate("wishlist")
  })

  // Open game cards
  document.querySelectorAll(".open-game").forEach((btn) => {
    btn.addEventListener("click", () => openGame(btn.dataset.id, btn.dataset.source))
  })

  // Back / close game
  document.querySelector("#back-btn")?.addEventListener("click", closeGame)

  // Edit game
  document.querySelector("#edit-game-btn")?.addEventListener("click", () => {
    state.editing = true
    state.editDraft = { ...state.viewingGame.game }
    render()
  })

  // View full collection from game detail view
  document.querySelector("#view-collection-btn")?.addEventListener("click", () => {
    state.viewingGame = null
    state.editing = false
    state.editDraft = null
    navigate("collection")
  })

  // Numeric-only enforcement for year, date parts, and price
  const numOnly = (id) => {
    const el = document.querySelector(id)
    if (!el) return
    el.addEventListener("input", () => { el.value = el.value.replace(/\D/g, "").slice(0, parseInt(el.maxLength) || 99) })
  }
  numOnly("#edit-year")
  numOnly("#edit-date-m")
  numOnly("#edit-date-d")
  numOnly("#edit-date-y")
  const priceEl = document.querySelector("#edit-price")
  if (priceEl) priceEl.addEventListener("input", () => { priceEl.value = priceEl.value.replace(/[^0-9.]/g, "").replace(/^(\d*\.?\d*).*$/, "$1") })

  // Star rating clicks in edit mode
  document.querySelectorAll(".star-rating.interactive .star").forEach((star) => {
    star.addEventListener("click", () => {
      if (!state.editDraft) return
      state.editDraft.condition = star.dataset.star
      render()
    })
    star.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && state.editDraft) {
        state.editDraft.condition = star.dataset.star
        render()
      }
    })
  })

  // Save edit
  document.querySelector("#save-edit")?.addEventListener("click", () => {
    const draft = state.editDraft
    if (!draft) return
    const read = (id) => { const el = document.querySelector(id); return el ? el.value : null }
    if (read("#edit-title") !== null) draft.title = read("#edit-title")
    if (read("#edit-system") !== null) draft.system = read("#edit-system")

    if (state.viewingGame.source === "collection") {
      if (read("#edit-year") !== null) draft.year = read("#edit-year").replace(/\D/g, "").slice(0, 4)
      if (read("#edit-price") !== null) { const p = read("#edit-price").replace(/[^0-9.]/g, ""); draft.avgPrice = p ? `$${p}` : draft.avgPrice }
      if (read("#edit-date-m") !== null) {
        const m = read("#edit-date-m").replace(/\D/g, "").slice(0, 2)
        const d2 = read("#edit-date-d").replace(/\D/g, "").slice(0, 2)
        const y = read("#edit-date-y").replace(/\D/g, "").slice(0, 4)
        draft.dateAdded = `${m}/${d2}/${y}`
      }
      state.collection = state.collection.map((g) => g.id === draft.id ? { ...draft } : g)
    } else {
      state.wishlist = state.wishlist.map((w) => w.id === draft.id ? { ...draft } : w)
    }

    state.viewingGame = { game: { ...draft }, source: state.viewingGame.source }
    state.editing = false
    state.editDraft = null
    render()
  })

  // Cancel edit
  document.querySelector("#cancel-edit")?.addEventListener("click", () => {
    state.editing = false
    state.editDraft = null
    render()
  })

  // Remove game
  document.querySelector("#remove-game-btn")?.addEventListener("click", () => {
    if (!state.viewingGame) return
    const { game, source } = state.viewingGame
    if (source === "collection") {
      state.collection = state.collection.filter((g) => g.id !== game.id)
    } else {
      state.wishlist = state.wishlist.filter((w) => w.id !== game.id)
    }
    if (state.undoTimer) clearTimeout(state.undoTimer)
    state.undoEntry = { game, source }
    state.undoTimer = setTimeout(() => { state.undoEntry = null; state.undoTimer = null; render() }, 5000)
    closeGame()
  })

  // Undo remove
  document.querySelector("#undo-remove")?.addEventListener("click", () => {
    if (!state.undoEntry) return
    if (state.undoTimer) clearTimeout(state.undoTimer)
    if (state.undoEntry.source === "collection") {
      state.collection.push(state.undoEntry.game)
    } else {
      state.wishlist.push(state.undoEntry.game)
    }
    state.undoEntry = null
    state.undoTimer = null
    render()
  })

  // Toggle collection membership from wishlist detail
  document.querySelector("#collection-toggle-btn")?.addEventListener("click", () => {
    if (!state.viewingGame) return
    const g = state.viewingGame.game
    if (inCollection(g.title)) {
      removeFromCollection(g.title)
    } else {
      state.collection.push({ id: makeId(g.title), title: g.title, system: g.system, year: g.year || "", coverImage: g.coverImage, condition: "5", avgPrice: "—", dateAdded: todayStr() })
    }
    render()
  })

  // Scan: add to collection
  document.querySelectorAll(".add-to-collection").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!state.loggedIn) { state.auth = "Login"; render(); return }
      const { title, system, year, cover, price, condition } = btn.dataset
      if (!inCollection(title)) {
        state.collection.push({ id: makeId(title), title, system, year, coverImage: cover || undefined, condition: condition || "5", avgPrice: price || "—", dateAdded: todayStr() })
      }
      render()
    })
  })
  document.querySelectorAll(".remove-from-collection").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeFromCollection(btn.dataset.title)
      render()
    })
  })

  // Scan: add to wishlist
  document.querySelectorAll(".add-to-wishlist").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!state.loggedIn) { state.auth = "Login"; render(); return }
      const { title, system, year, cover } = btn.dataset
      if (!onWishlist(title)) {
        state.wishlist.push({ id: makeId(title), title, system, year: year || undefined, coverImage: cover || undefined })
      }
      render()
    })
  })
  document.querySelectorAll(".remove-from-wishlist").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeFromWishlist(btn.dataset.title)
      render()
    })
  })

// Recommendations: add to wishlist
  document.querySelectorAll(".rec-wishlist:not(.remove-from-wishlist)").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!state.loggedIn) { state.auth = "Login"; render(); return }
      const { title, system } = btn.dataset
      if (!onWishlist(title)) {
        const rec = [...highConfidenceRecommendations, ...lowConfidenceRecommendations].find(r => r.title === title)
        state.wishlist.push({ id: makeId(title), title, system, coverImage: rec ? rec.coverImage : undefined })
      }
      render()
    })
  })

  // Scan file upload - persistent listeners
  document.querySelector("#game-photo")?.addEventListener("change", (e) => {
    const file = e.target.files[0]
    if (file) {
      processImage(file)
      e.target.value = ""
    }
  })
  document.querySelector("#rescan-game")?.addEventListener("click", () => {
    if (state.scanFile) processImage(state.scanFile)
  })
  document.querySelector("#upload-new-photo")?.addEventListener("click", () => {
    document.querySelector("#game-photo")?.click()
  })
  document.querySelector("#cancel-scan")?.addEventListener("click", () => {
    if (state.scanTimer) {
      clearInterval(state.scanTimer)
      state.scanTimer = null
    }
    state.scanning = false
    state.scanProgress = 0
    state.scanResult = null
    render()
  })

  // Recommendations form
  const textarea = document.querySelector("#instructions")
  textarea?.addEventListener("input", () => {
    if (state.instructions && !textarea.value) {
      state.recommendationExampleIndex = (state.recommendationExampleIndex + 1) % recommendationExamples.length
      sessionStorage.setItem("recommendation-example-index", String(state.recommendationExampleIndex))
      textarea.placeholder = recommendationExamples[state.recommendationExampleIndex]
    }
    state.instructions = textarea.value
    const counter = document.querySelector("#character-count")
    if (counter) counter.textContent = `${textarea.value.length}/500`
    const submitBtn = document.querySelector("#recommendation-form button[type=submit]")
    if (submitBtn) submitBtn.disabled = !textarea.value.trim()
  })
  document.querySelector("#recommendation-form")?.addEventListener("submit", (e) => {
    e.preventDefault()
    if (state.instructions.trim() && !state.recommendationScanning) {
      const query = state.instructions.trim()
      const outcomes = ["failed", "low", "success"]
      if (state.recommendationTimer) clearInterval(state.recommendationTimer)
      state.submitted = ""
      state.recommendationResult = null
      state.recommendationProgress = 0
      state.recommendationScanning = true
      render()

      state.recommendationTimer = setInterval(() => {
        state.recommendationProgress = Math.min(state.recommendationProgress + 8, 100)

        // Direct DOM updates
        const fill = document.querySelector(".scan-processing .progress-fill")
        const label = document.querySelector(".scan-processing .processing-label strong")
        if (fill) fill.style.width = `${state.recommendationProgress}%`
        if (label) label.textContent = `${state.recommendationProgress}%`

        if (state.recommendationProgress >= 100) {
          clearInterval(state.recommendationTimer)
          state.recommendationTimer = null
          state.submitted = query
          state.recommendationResult = outcomes[state.recommendationCount % outcomes.length]
          state.recommendationCount += 1
          state.recommendationScanning = false
          render() // Final render to show recommendation results
        }
      }, 120)
    }
  })
  document.querySelector("#cancel-recommendations")?.addEventListener("click", () => {
    if (state.recommendationTimer) clearInterval(state.recommendationTimer)
    state.recommendationTimer = null
    state.recommendationScanning = false
    state.recommendationProgress = 0
    state.recommendationResult = null
    state.submitted = ""
    render()
  })
}

function processImage(file) {
  if (state.scanTimer) clearInterval(state.scanTimer)
  if (state.scanPreview && state.scanPreview.startsWith("blob:")) {
    URL.revokeObjectURL(state.scanPreview)
  }

  state.scanFile = file
  state.scanPreview = URL.createObjectURL(file)
  state.scanProgress = 0
  state.scanResult = null
  state.scanning = true
  render() // Initial render to show processing bar container

  const outcomes = ["success", "low", "failed"]

  state.scanTimer = setInterval(() => {
    if (!state.scanning) {
      clearInterval(state.scanTimer)
      state.scanTimer = null
      return
    }

    state.scanProgress = Math.min(state.scanProgress + 8, 100)

    // Direct DOM updates for smooth, unblocked scrolling
    const fill = document.querySelector(".scan-processing .progress-fill")
    const label = document.querySelector(".scan-processing .processing-label strong")
    if (fill) fill.style.width = `${state.scanProgress}%`
    if (label) label.textContent = `${state.scanProgress}%`

    if (state.scanProgress >= 100) {
      clearInterval(state.scanTimer)
      state.scanTimer = null
      state.scanning = false

      const outcome = outcomes[state.scanCount % outcomes.length]
      state.scanGame = SCAN_GAMES[state.scanCount % SCAN_GAMES.length]
      state.scanResult = outcome
      state.scanCount += 1

      render() // Final render once scan completes to show results
    }
  }, 120)
}

render()