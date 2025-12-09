// Selectors
const form = document.getElementById("form");
const search = document.getElementById("search");
const result = document.getElementById("result");
const more = document.getElementById("more");
const recentBox = document.getElementById("recent-searches");
const themeToggle = document.getElementById("themeToggle");

const apiURL = "https://api.lyrics.ovh";

// =========================
// THEME SWITCHER
// =========================
let currentTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", currentTheme);
themeToggle.textContent = currentTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";

themeToggle.addEventListener("click", () => {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", currentTheme);
  localStorage.setItem("theme", currentTheme);

  themeToggle.textContent = currentTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// =========================
// RECENT SEARCHES
// =========================
function loadRecentSearches() {
  const items = JSON.parse(localStorage.getItem("recentSearches")) || [];
  recentBox.innerHTML = "";

  items.forEach((term) => {
    const btn = document.createElement("button");
    btn.textContent = term;
    btn.addEventListener("click", () => searchSongs(term));
    recentBox.appendChild(btn);
  });
}

function saveRecentSearch(term) {
  let items = JSON.parse(localStorage.getItem("recentSearches")) || [];

  items = items.filter((t) => t !== term); // avoid duplicates
  items.unshift(term); // add to front

  if (items.length > 6) items.pop(); // keep last 6

  localStorage.setItem("recentSearches", JSON.stringify(items));
  loadRecentSearches();
}

loadRecentSearches();

// =========================
// SEARCH SONGS
// =========================
async function searchSongs(term) {
  saveRecentSearch(term);

  const res = await fetch(`${apiURL}/suggest/${term}`);
  const data = await res.json();

  showDataSafe(data);
}

// =========================
// SHOW SONGS + ALBUM ART
// =========================
function showDataSafe(lyrics) {
  result.innerHTML = "";
  more.innerHTML = "";

  const ul = document.createElement("ul");
  ul.className = "songs";

  lyrics.data.forEach((song) => {
    const li = document.createElement("li");

    const info = document.createElement("div");
    info.className = "song-info";

    const img = document.createElement("img");
    img.src = song.album.cover;
    img.className = "song-img";

    const span = document.createElement("span");
    span.innerHTML = `<strong>${song.artist.name}</strong> - ${song.title}`;

    info.appendChild(img);
    info.appendChild(span);

    const button = document.createElement("button");
    button.className = "btn";
    button.textContent = "Get Lyrics";
    button.dataset.artist = song.artist.name;
    button.dataset.songtitle = song.title;

    li.appendChild(info);
    li.appendChild(button);
    ul.appendChild(li);
  });

  result.appendChild(ul);

  if (lyrics.prev) {
    const prev = document.createElement("button");
    prev.className = "btn";
    prev.textContent = "Prev";
    prev.addEventListener("click", () => getMoreSongs(lyrics.prev));
    more.appendChild(prev);
  }

  if (lyrics.next) {
    const next = document.createElement("button");
    next.className = "btn";
    next.textContent = "Next";
    next.addEventListener("click", () => getMoreSongs(lyrics.next));
    more.appendChild(next);
  }
}

async function getMoreSongs(url) {
  const res = await fetch(`https://cors-anywhere.herokuapp.com/${url}`);
  const data = await res.json();
  showDataSafe(data);
}

// =========================
// GET LYRICS
// =========================
result.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    const artist = e.target.dataset.artist;
    const title = e.target.dataset.songtitle;
    getLyricsSafe(artist, title);
  }
});

async function getLyricsSafe(artist, songTitle) {
  const res = await fetch(`${apiURL}/v1/${artist}/${songTitle}`);
  const data = await res.json();

  result.innerHTML = "";
  more.innerHTML = "";

  if (data.error) {
    result.innerHTML = `<p>${data.error}</p>`;
    return;
  }

  const heading = document.createElement("h2");
  heading.innerHTML = `<strong>${artist}</strong> - ${songTitle}`;
  result.appendChild(heading);

  const span = document.createElement("span");
  data.lyrics.split(/\r?\n/).forEach((line, index, arr) => {
    span.append(line);
    if (index < arr.length - 1) span.append(document.createElement("br"));
  });

  result.appendChild(span);
}

// =========================
// FORM SUBMIT
// =========================
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const searchTerm = search.value.trim();
  if (!searchTerm) return alert("Please type in a search term");

  searchSongs(searchTerm);
  search.value = "";
});
