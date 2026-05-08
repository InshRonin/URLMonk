// --- Theme Toggle ---
const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
const themeToggleBtn = document.getElementById('theme-toggle');

if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
  themeToggleLightIcon.classList.remove('hidden');
} else {
  document.documentElement.classList.remove('dark');
  themeToggleDarkIcon.classList.remove('hidden');
}

themeToggleBtn.addEventListener('click', () => {
  themeToggleDarkIcon.classList.toggle('hidden');
  themeToggleLightIcon.classList.toggle('hidden');
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('color-theme', 'light');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('color-theme', 'dark');
  }
});

// --- Real Stats Logic (Unique to this user's browser) ---

// Get values from storage or start at 0
let linksCount = parseInt(localStorage.getItem('monk_links_created')) || 0;
let copyCount = parseInt(localStorage.getItem('monk_links_copied')) || 0;

function updateStatsUI() {
    document.getElementById('stat-links').innerText = linksCount.toLocaleString();
    document.getElementById('stat-clicks').innerText = copyCount.toLocaleString();
}

// Initialize UI
updateStatsUI();

// --- API Implementation ---
const shortenBtn = document.getElementById('shorten-btn');
const urlInput = document.getElementById('url-input');
const resultBox = document.getElementById('result-box');
const shortenedUrlA = document.getElementById('shortened-url');

shortenBtn.addEventListener('click', async () => {
    let longUrl = urlInput.value.trim();
    if (!longUrl) return alert("Please enter a URL.");
    if (!longUrl.startsWith('http')) longUrl = 'https://' + longUrl;

    shortenBtn.innerText = "Shortening...";
    shortenBtn.disabled = true;

    try {
        const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`);
        const data = await response.json();

        if (data.shorturl) {
            // --- REAL TRACKING ---
            linksCount++; // Increment link count
            localStorage.setItem('monk_links_created', linksCount); // Save it
            updateStatsUI(); // Update display

            shortenedUrlA.innerText = data.shorturl.replace('https://', '');
            shortenedUrlA.href = data.shorturl;
            resultBox.classList.remove('hidden');
            urlInput.value = "";
        } else {
            alert("Error: " + data.errormessage);
        }
    } catch (e) {
        alert("API unreachable. Try disabling ad-blockers.");
    } finally {
        shortenBtn.innerText = "Shorten Link";
        shortenBtn.disabled = false;
    }
});

// Copy Functionality
window.copyToClipboard = () => {
    navigator.clipboard.writeText(shortenedUrlA.href).then(() => {
        // --- REAL TRACKING ---
        copyCount++; // Increment copy count
        localStorage.setItem('monk_links_copied', copyCount); // Save it
        updateStatsUI(); // Update display

        const btn = document.getElementById('copy-btn');
        btn.innerText = "Copied!";
        setTimeout(() => btn.innerText = "Copy", 2000);
    });
};