// Minimal Spotify-like player powered by the iTunes Search API (30s previews) + local files
const audio = document.getElementById('audio');
const resultsEl = document.getElementById('results');
const libraryEl = document.getElementById('libraryList');
const queueEl = document.getElementById('queueList');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const coverArt = document.getElementById('coverArt');
const seek = document.getElementById('seek');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volume = document.getElementById('volume');

const btnPlay = document.getElementById('btnPlay');
const btnNext = document.getElementById('btnNext');
const btnPrev = document.getElementById('btnPrev');
const btnRepeat = document.getElementById('btnRepeat');
const btnShuffle = document.getElementById('btnShuffle');
const skipFwd = document.getElementById('skipFwd');
const skipBack = document.getElementById('skipBack');

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const fileInput = document.getElementById('fileInput');

const sections = document.querySelectorAll('.section');
const navBtns = document.querySelectorAll('.nav-btn');

let queue = [];
let currentIndex = -1;
let isRepeating = false;
let isShuffling = false;

function fmtTime(sec) {
  if (!isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function setNowPlaying(meta = {}) {
  trackTitle.textContent = meta.title || 'Unknown title';
  trackArtist.textContent = meta.artist || '';
  if (meta.cover) {
    coverArt.style.backgroundImage = `url(${meta.cover})`;
    coverArt.style.backgroundSize = 'cover';
    coverArt.textContent = '';
  } else {
    coverArt.style.backgroundImage = '';
    coverArt.textContent = '🎵';
  }
}

function renderList(container, list, actions = {}) {
  container.innerHTML = '';
  list.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'card';

    const cover = document.createElement('div');
    cover.className = 'cover';
    cover.textContent = '🎵';
    if (item.cover) {
      cover.style.backgroundImage = `url(${item.cover})`;
      cover.style.backgroundSize = 'cover';
      cover.textContent = '';
    }
    card.appendChild(cover);

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = item.title || 'Unknown';
    card.appendChild(title);

    const artist = document.createElement('div');
    artist.className = 'artist';
    artist.textContent = item.artist || '';
    card.appendChild(artist);

    const row = document.createElement('div');
    row.className = 'row';

    const playBtn = document.createElement('button');
    playBtn.className = 'play';
    playBtn.textContent = 'Play';
    playBtn.onclick = () => {
      if (actions.onPlay) actions.onPlay(item, idx);
    };
    row.appendChild(playBtn);

    const qBtn = document.createElement('button');
    qBtn.className = 'queue';
    qBtn.textContent = 'Add to Queue';
    qBtn.onclick = () => actions.onQueue && actions.onQueue(item, idx);
    row.appendChild(qBtn);

    card.appendChild(row);
    container.appendChild(card);
  });
}

function updateQueueUI() {
  renderList(queueEl, queue, {
    onPlay: (_item, idx) => playAt(idx),
    onQueue: () => {}
  });
}

function playAt(idx) {
  if (idx < 0 || idx >= queue.length) return;
  currentIndex = idx;
  const item = queue[currentIndex];
  audio.src = item.src;
  audio.play().catch(() => {});
  setNowPlaying(item);
  btnPlay.textContent = '⏸️';
}

function addToQueue(item, play = false) {
  queue.push(item);
  updateQueueUI();
  if (play) playAt(queue.length - 1);
}

function nextTrack(auto=false) {
  if (isRepeating && auto) {
    audio.currentTime = 0;
    audio.play();
    return;
  }
  if (isShuffling) {
    const nextIdx = Math.floor(Math.random() * queue.length);
    playAt(nextIdx);
    return;
  }
  if (currentIndex < queue.length - 1) {
    playAt(currentIndex + 1);
  }
}

function prevTrack() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  if (currentIndex > 0) playAt(currentIndex - 1);
}

function attachEvents() {
  btnPlay.addEventListener('click', () => {
    if (!audio.src && queue.length) playAt(0);
    else if (audio.paused) audio.play();
    else audio.pause();
  });
  btnNext.addEventListener('click', () => nextTrack(false));
  btnPrev.addEventListener('click', prevTrack);
  btnRepeat.addEventListener('click', () => {
    isRepeating = !isRepeating;
    btnRepeat.style.borderColor = isRepeating ? 'var(--accent)' : '#2a2a2a';
  });
  btnShuffle.addEventListener('click', () => {
    isShuffling = !isShuffling;
    btnShuffle.style.borderColor = isShuffling ? 'var(--accent)' : '#2a2a2a';
  });
  skipFwd.addEventListener('click', () => { audio.currentTime = Math.min(audio.duration||30, audio.currentTime + 10); });
  skipBack.addEventListener('click', () => { audio.currentTime = Math.max(0, audio.currentTime - 10); });
  volume.addEventListener('input', () => { audio.volume = volume.value; });

  // Seek
  let seeking = false;
  seek.addEventListener('input', () => {
    seeking = true;
    const pct = parseFloat(seek.value) / 100;
    const dur = audio.duration || 0;
    currentTimeEl.textContent = fmtTime(pct * dur);
  });
  seek.addEventListener('change', () => {
    const pct = parseFloat(seek.value) / 100;
    audio.currentTime = (audio.duration || 0) * pct;
    seeking = false;
  });

  audio.addEventListener('timeupdate', () => {
    if (!seeking && isFinite(audio.duration)) {
      seek.value = (audio.currentTime / audio.duration) * 100;
    }
    currentTimeEl.textContent = fmtTime(audio.currentTime);
    durationEl.textContent = fmtTime(audio.duration);
  });
  audio.addEventListener('ended', () => nextTrack(true));
  audio.addEventListener('play', () => { btnPlay.textContent = '⏸️'; });
  audio.addEventListener('pause', () => { btnPlay.textContent = '▶️'; });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes((e.target.tagName||'').toUpperCase())) return;
    if (e.code === 'Space') { e.preventDefault(); btnPlay.click(); }
    if (e.code === 'ArrowRight') { skipFwd.click(); }
    if (e.code === 'ArrowLeft') { skipBack.click(); }
    if (e.code === 'KeyN') { btnNext.click(); }
    if (e.code === 'KeyP') { btnPrev.click(); }
    if (e.code === 'KeyR') { btnRepeat.click(); }
    if (e.code === 'KeyS') { btnShuffle.click(); }
  });

  // Nav switching
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const id = btn.dataset.section;
      sections.forEach(sec => sec.classList.toggle('visible', sec.id === id));
    });
  });

  // Search
  const doSearch = () => {
    const term = searchInput.value.trim();
    if (!term) return;
    search(term);
  };
  searchBtn.addEventListener('click', doSearch);
  searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });

  // Local file upload
  fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    for (const f of files) {
      const url = URL.createObjectURL(f);
      const meta = {
        src: url,
        title: f.name.replace(/\.[^.]+$/, ''),
        artist: 'Local file',
        cover: null,
        source: 'local',
      };
      addToQueue(meta, queue.length === 0);
      localLibrary.push(meta);
    }
    renderLibrary();
  });
}

function search(term) {
  fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=50`)
    .then(res => res.json())
    .then(data => {
      let items = (data.results || [])
        // remove Bekhayali
        .filter(r => !/bekhayali/i.test(r.trackName))
        .map(r => ({
          src: r.previewUrl,
          title: r.trackName,
          artist: r.artistName,
          cover: r.artworkUrl100?.replace('100x100bb', '300x300bb') || null,
          source: 'itunes',
        }));

      // remove duplicate covers
      const seenCovers = new Set();
      items = items.filter(item => {
        if (!item.cover) return true;
        if (seenCovers.has(item.cover)) return false;
        seenCovers.add(item.cover);
        return true;
      });

      // make sure at least 10 results
      items = items.slice(0, Math.max(10, items.length));

      renderSearch(items);
    })
    .catch(err => {
      console.error(err);
      resultsEl.innerHTML = '<p>Search failed. Please try again.</p>';
    });
}

function renderSearch(items) {
  renderList(resultsEl, items, {
    onPlay: (item) => { addToQueue(item, true); },
    onQueue: (item) => addToQueue(item, false),
  });
}

let localLibrary = [];
function renderLibrary() {
  renderList(libraryEl, localLibrary, {
    onPlay: (item, _idx) => addToQueue(item, true),
    onQueue: (item) => addToQueue(item, false),
  });
}

// Initial boot
attachEvents();
searchInput.value = 'Arijit Singh';
search('Arijit Singh');
