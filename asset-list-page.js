// DOM Elements for the main gallery
let searchInput;
let allCards;
// Store a global list of all assets fetched to be used for zipping (original files)
const allAssets = [];

// DOM elements for loading/progress (used by both zip functions)
let loadingOverlay;
let progressBar;
let progressPercentage;
let consoleLog;

// Configuration for moddable groups (THIS IS THE MISSING PIECE)
// This array defines which folders are treated as mod groups, their display names,
// and what customization options they allow.
const modGroups = [
    {
        name: "Weapons",
        folder: "weapons", // Corresponds to the folder name in mod-assets/textures/
        files: [ // List of specific files within this folder that belong to this group
            "weapon_01_diffuse.png",
            "weapon_02_diffuse.png",
            "weapon_03_diffuse.png",
            "weapon_04_diffuse.png",
            "weapon_05_diffuse.png",
            "weapon_06_diffuse.png",
            "weapon_07_diffuse.png",
            "weapon_08_diffuse.png",
            "weapon_09_diffuse.png",
            "weapon_10_diffuse.png",
            "weapon_11_diffuse.png",
            "weapon_12_diffuse.png"
        ],
        modifiable: true,
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "Mistle Rock",
        folder: "mistle_rock",
        files: [
            "rock_formation_01_wall_tile.jpg",
            "rock_formation_01_wall_tile_2.jpg"
        ],
        modifiable: true,
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "Grass Textures",
        folder: "grass",
        files: [
            "grass_01_diffuse.png",
            "grass_02_diffuse.png"
        ],
        modifiable: true,
        canAdjustColor: true,
        canAdjustSaturation: true,
        canDraw: true
    },
    {
        name: "Explosions",
        folder: "explosions",
        files: [
            "explosion_sequence_01.png",
            "explosion_sequence_02.png"
        ],
        modifiable: false, // Example of a non-modifiable group
        canAdjustColor: false,
        canAdjustSaturation: false,
        canDraw: false
    },
    {
        name: "Water SFX",
        folder: "water_sfx",
        files: [
            "splash_sound.mp3",
            "flowing_water.mp3"
        ],
        type: "audio", // Example of an audio group
        modifiable: false,
        canAdjustColor: false,
        canAdjustSaturation: false,
        canDraw: false
    }
    // Add more groups as needed
];


// Helper to get asset ID (used for unique keys in allAssets and modifiedAssets)
function getAssetId(asset) {
    return `${asset.folder}/${asset.filename}`;
}

// Card Creation for the main gallery view
function createAndAppendCard(folder, filename, type) {
    const card = document.createElement('div');
    card.className = 'texture-card';
    card.style.display = 'block';
    card.style.visibility = 'visible';
    card.style.opacity = '1';

    let mediaPath;

    if (type.toLowerCase() === 'mp3') {
        card.className += ' mp3';
        mediaPath = `./mod-assets/${type.toLowerCase()}/${filename}`;

        const playIcon = document.createElement('i');
        playIcon.className = 'fas fa-play media-icon';
        playIcon.onclick = () => playAudio(mediaPath);

        const mp3FilenameDisplay = document.createElement('div');
        mp3FilenameDisplay.className = 'mp3-filename-display';
        mp3FilenameDisplay.textContent = filename;

        const folderNumberButton = document.createElement('button');
        folderNumberButton.className = 'folder-number-button';
        folderNumberButton.textContent = folder;
        // This button in the main gallery just shows the folder info
        folderNumberButton.onclick = (e) => {
            e.stopPropagation();
            alert(`Folder: ${folder}`);
        };

        card.appendChild(playIcon);
        card.appendChild(mp3FilenameDisplay);
        card.appendChild(folderNumberButton);

    } else { // Images
        mediaPath = `./mod-assets/${type.toLowerCase()}/${folder}/${filename}`;

        const img = document.createElement('img');
        img.loading = 'lazy'; // Lazy load images
        img.src = mediaPath;
        img.alt = filename;
        img.onerror = () => {
            console.error(`Failed to load image: ${mediaPath}`);
            img.src = 'placeholder.png'; // Fallback image if image fails to load
        };

        const title = document.createElement('h3');
        title.textContent = filename;

        const folderNumberButton = document.createElement('button');
        folderNumberButton.className = 'folder-number-button';
        folderNumberButton.textContent = folder;
        // This button in the main gallery just shows the folder info
        folderNumberButton.onclick = (e) => {
            e.stopPropagation();
            alert(`Folder: ${folder}`);
        };

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(folderNumberButton);
    }

    document.getElementById('texture-grid').appendChild(card);
}

// Audio Playback for the main gallery
function playAudio(path) {
    const audio = new Audio(path);
    audio.play().catch(e => console.error("Error playing audio:", e));
}

// Fetch assets and populate gallery grid
async function fetchAssets() {
    try {
        const response = await fetch('./mod-assets/texture_index.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Clear existing assets to prevent duplicates on re-fetch
        allAssets.length = 0; // Clear the global array
        document.getElementById('texture-grid').innerHTML = ''; // Clear gallery display

        Object.keys(data).forEach(folder => {
            const assetsInFolder = data[folder];
            assetsInFolder.forEach(asset => {
                // Add asset to the global list for zipping and pass to mod builder
                allAssets.push({ folder, filename: asset.filename, type: asset.type });
                // Create and append card for main gallery display
                createAndAppendCard(folder, asset.filename, asset.type);
            });
        });
        allCards = Array.from(document.querySelectorAll('.texture-card'));
        console.log("Assets loaded successfully for gallery.");

        // Initialize Mod Builder after assets are loaded
        // Check if initModBuilder exists (from mod-builder.js)
        if (typeof initModBuilder === 'function') {
            initModBuilder(allAssets, modGroups);
            console.log("Mod Builder initialized.");
        } else {
            console.error("initModBuilder function not found. Is mod-builder.js loaded correctly?");
        }

    } catch (error) {
        console.error('Error fetching assets:', error);
        alert('Failed to load assets. Please check the console for more details.');
        // Display an error message directly on the page if cards fail to load
        document.getElementById('texture-grid').innerHTML = '<p style="color: red; text-align: center; font-size: 1.2rem;">Failed to load assets. Please check your network connection or server setup.</p>';
    }
}

// Search functionality for the main gallery
function filterAssets(query) {
    const searchTerm = query.toLowerCase();
    allCards.forEach(card => {
        const filenameElement = card.querySelector('h3') || card.querySelector('.mp3-filename-display');
        const filename = filenameElement ? filenameElement.textContent.toLowerCase() : '';
        const folderElement = card.querySelector('.folder-number-button');
        const folder = folderElement ? folderElement.textContent.toLowerCase() : '';

        if (filename.includes(searchTerm) || folder.includes(searchTerm)) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.visibility = 'visible';
                card.style.opacity = '1';
            }, 10);
        } else {
            card.style.visibility = 'hidden';
            card.style.opacity = '0';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300); // Wait for fade-out
        }
    });
}

// Generic function to display ZIP progress (used by generateFullZip)
function updateProgress(current, total, filename = '') {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    progressBar.style.width = `${percentage}%`;
    progressPercentage.textContent = `${percentage}%`;
    consoleLog.textContent += `Adding: ${filename}...\n`;
    consoleLog.scrollTop = consoleLog.scrollHeight; // Auto-scroll
}


// Generate ZIP for all assets (used by "Download All as ZIP" button on main page)
async function generateFullZip(assetsToZip) {
    const zip = new JSZip();
    let filesProcessed = 0;

    loadingOverlay.classList.add('active');
    progressBar.style.width = '0%';
    progressPercentage.textContent = '0%';
    consoleLog.textContent = 'Starting ZIP generation...\n';

    try {
        for (const asset of assetsToZip) {
            filesProcessed++;
            updateProgress(filesProcessed, assetsToZip.length, asset.filename);

            const filePathInZip = `${asset.folder}/${asset.filename}`;
            // Use asset.type to determine correct subfolder (textures or mp3)
            const assetUrl = `./mod-assets/${asset.type.toLowerCase()}/${asset.folder ? asset.folder + '/' : ''}${asset.filename}`;

            const response = await fetch(assetUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${asset.filename}: ${response.statusText}`);
            }
            const blob = await response.blob();
            zip.file(filePathInZip, blob);
        }

        const content = await zip.generateAsync({ type: "blob" }, function update(metadata) {
            // This is for internal JSZip progress, not directly tied to our UI progress bar
            // console.log("progression: " + metadata.percent.toFixed(2) + "%");
        });

        saveAs(content, "all_original_assets.zip");
        consoleLog.textContent += `\n[SUCCESS] "all_original_assets.zip" downloaded!\n`;
        consoleLog.scrollTop = consoleLog.scrollHeight;

    } catch (error) {
        console.error("Error generating or saving zip:", error);
        consoleLog.textContent += `\n[FATAL ERROR] Failed to generate or save ZIP: ${error.message}\n`;
        consoleLog.scrollTop = consoleLog.scrollHeight;
        alert('Failed to generate or save the ZIP file. Please check console for errors.');
    } finally {
        setTimeout(() => {
            loadingOverlay.classList.remove('active');
            // Reset button text etc. if necessary
            document.getElementById('download-all-zip-button').textContent = 'Download All as ZIP';
            document.getElementById('download-all-zip-button').disabled = false;
        }, 3000); // Hide after 3 seconds
    }
}


// DOMContentLoaded event listener for main gallery and initial fetch
document.addEventListener('DOMContentLoaded', () => {
    searchInput = document.getElementById('texture-search');
    const searchButton = document.getElementById('search-button');
    const clearSearchButton = document.getElementById('clear-search-button');
    const downloadAllZipButton = document.getElementById('download-all-zip-button');

    // Initialize DOM elements for loading/progress (shared by both ZIP functions)
    loadingOverlay = document.getElementById('loading-overlay');
    progressBar = document.getElementById('progress-bar');
    progressPercentage = document.getElementById('progress-percentage');
    consoleLog = document.getElementById('console-log');


    if (searchInput && searchButton && clearSearchButton) {
        searchButton.addEventListener('click', () => filterAssets(searchInput.value));
        clearSearchButton.addEventListener('click', () => {
            searchInput.value = '';
            filterAssets('');
        });
        searchInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                filterAssets(searchInput.value);
            }
        });
    }

    if (downloadAllZipButton) {
        downloadAllZipButton.addEventListener('click', () => {
            downloadAllZipButton.disabled = true; // Disable button during download
            downloadAllZipButton.textContent = 'Downloading...';
            generateFullZip(allAssets); // Use the global allAssets
        });
    } else {
        console.error('Download All ZIP button not found!');
    }

    // Initial fetch of assets for the main gallery
    fetchAssets();
});