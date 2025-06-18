// DOM Elements
let searchInput;
let allCards; // This declares it
window.allCards = allCards; // NEW: Expose globally

// Store a global list of all assets fetched to be used for zipping and bulk operations
// Each asset object will now also store its Blob data and modification status.
const allAssets = []; // This declares it
window.allAssets = allAssets; // NEW: Expose allAssets globally
let assetsLoadedIntoMemory = false; // Existing flag: true when image blobs are loaded for all assets


// DOM elements for loading/progress
let loadingOverlay;
let progressBar;
let progressPercentage;
let consoleLog;
let loadingMessageDisplay; // New: to display dynamic loading messages

// REMOVED: Duplicate Export Options Popup DOM Elements declarations
// These are declared in export-options-popup.js


// Card Creation
// Modified to display immediate image path initially, not relying on blob until loadedIntoMemory
function createAndAppendCard(asset) {
    const { folder, filename, type, mediaPath } = asset; // Destructure asset object

    // Create main card element
    const card = document.createElement('div');
    card.className = 'texture-card';
    card.style.display = 'block';
    card.style.visibility = 'visible';
    card.style.opacity = '1';

    // Store a reference to the card DOM element on the asset object
    asset.cardElement = card;


    if (type.toLowerCase() === 'mp3') {
        card.className += ' mp3'; // Add mp3 class for specific styling

        // MP3-specific content
        card.innerHTML = `
            <div class="card-content">
                <i class="fas fa-music mp3-icon"></i>
                <img src="${mediaPath}" alt="${filename}" class="mp3-cover-image" onerror="this.onerror=null;this.src='placeholders/mp3-placeholder.png';" style="display: none;">
                <span class="texture-name">${filename}</span>
                <audio controls class="mp3-player">
                    <source src="${mediaPath}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
            </div>
            <div class="card-actions">
                <button class="edit-button"><i class="fas fa-edit"></i> Edit</button>
                <button class="download-button"><i class="fas fa-download"></i> Download</button>
            </div>
        `;
    } else {
        // Image-specific content (original logic)
        card.innerHTML = `
            <div class="card-content">
                <img src="${mediaPath}" alt="${filename}" class="texture-thumbnail">
                <span class="texture-name">${filename}</span>
            </div>
            <div class="card-actions">
                <button class="edit-button"><i class="fas fa-edit"></i> Edit</button>
                <button class="download-button"><i class="fas fa-download"></i> Download</button>
            </div>
        `;
    }


    // Append to grid
    document.getElementById('texture-grid').appendChild(card);

    // Add event listeners for edit and download buttons
    card.querySelector('.edit-button').addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent card click from firing
        window.openAssetEditorModal(asset);
    });

    card.querySelector('.download-button').addEventListener('click', async (event) => {
        event.stopPropagation(); // Prevent card click from firing
        if (asset.newImageBlob || asset.originalImageBlob) {
            window.showLoadingOverlay('Preparing Download...');
            window.updateConsoleLog(`Preparing ${asset.filename} for download...`);
            const blobToDownload = asset.newImageBlob || asset.originalImageBlob;
            const originalExtension = asset.filename.split('.').pop();
            const mimeType = blobToDownload.type;
            const filename = asset.filename; // Use original filename, not just name part
            saveAs(blobToDownload, filename); // Use FileSaver.js to save the blob
            window.hideLoadingOverlayWithDelay(2000, 'Download Complete!');
            window.updateConsoleLog(`${asset.filename} download initiated.`);
        } else {
            alert('Asset data not loaded yet. Please wait or refresh.');
            window.updateConsoleLog(`Attempted to download ${asset.filename} but data was not available.`);
        }
    });

    // Add event listener for card selection (for multi-select)
    card.addEventListener('click', () => {
        // Check if multi-select mode is active (global variable from bulk-operations.js)
        if (typeof isMultiSelectMode !== 'undefined' && isMultiSelectMode) {
            // Call the handler from bulk-operations.js
            if (typeof handleCardClick === 'function') {
                handleCardClick(asset);
            } else {
                console.error('handleCardClick function not found in global scope!');
            }
        }
    });


    // Initial visual state
    window.updateCardVisualState(asset);

    return card;
}


// Function to update the visual state of a card (e.g., add "modified" badge)
// This function needs to be globally accessible for other scripts (e.g., asset-editor-modal.js)
window.updateCardVisualState = (asset) => {
    if (!asset.cardElement) {
        console.warn('Cannot update visual state: cardElement not found for asset', asset.filename);
        return;
    }

    // Remove existing badges
    asset.cardElement.querySelectorAll('.badge').forEach(badge => badge.remove());

    // Add "Modified" badge if applicable
    if (asset.isModified || asset.isNew) {
        const badge = document.createElement('span');
        badge.className = 'badge modified';
        badge.textContent = asset.isNew ? 'NEW' : 'MODIFIED';
        asset.cardElement.querySelector('.card-content').appendChild(badge);
    }
    // Add "Selected" class based on bulk-operations.js state
    if (typeof selectedAssets !== 'undefined' && selectedAssets.has(asset)) {
        asset.cardElement.classList.add('selected-for-bulk');
    } else {
        asset.cardElement.classList.remove('selected-for-bulk');
    }
};



// Main logic to fetch and display textures
document.addEventListener('DOMContentLoaded', () => {
    searchInput = document.getElementById('texture-search');
    const searchButton = document.getElementById('search-button');
    const clearSearchButton = document.getElementById('clear-search-button');
    const downloadAllZipButton = document.getElementById('download-all-zip-button'); // Get ref here

    // Search functionality
    if (searchInput && searchButton && clearSearchButton) {
        searchButton.addEventListener('click', performSearch);
        clearSearchButton.addEventListener('click', clearSearch);
        searchInput.addEventListener('input', () => {
            // Optional: Live search as user types
            // performSearch();
        });
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                performSearch();
            }
        });
    } else {
        console.error('Search DOM elements not found!');
    }

    // Initial load and render assets
    // Show loading overlay before fetching
    if (typeof window.showLoadingOverlay === 'function') {
        window.showLoadingOverlay('Loading Assets...');
    } else {
        console.error('showLoadingOverlay function not found in global scope. The loading window will not appear.');
    }


    // Get references to the new loading UI elements (already done by global functions, just ensuring they exist)
    loadingOverlay = document.getElementById('loading-overlay');
    progressBar = document.getElementById('progress-bar');
    progressPercentage = document.getElementById('progress-percentage');
    consoleLog = document.getElementById('console-log');
    // New: Reference to the h2 in the loading window
    loadingMessageDisplay = loadingOverlay ? loadingOverlay.querySelector('h2') : null;


    if (downloadAllZipButton && loadingOverlay && progressBar && progressPercentage && consoleLog && loadingMessageDisplay) {
        // Change the download button's behavior to show the export options popup
        downloadAllZipButton.removeEventListener('click', null); // Remove any old listeners if this script reloads
        downloadAllZipButton.addEventListener('click', showExportOptionsPopup);
    } else {
        console.error('One or more required DOM elements for ZIP functionality not found!');
        if (!downloadAllZipButton) console.error('download-all-zip-button not found!');
        if (!loadingOverlay) console.error('loading-overlay not found!');
        if (!progressBar) console.error('progress-bar not found!');
        if (!progressPercentage) console.error('progress-percentage not found!');
        if (!consoleLog) console.error('console-log not found!');
        if (!loadingMessageDisplay) console.error('h2 for loading message not found!');
    }


    fetch('./mod-assets/assets.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            window.updateConsoleLog('Assets JSON loaded successfully.');
            // Map the data to our asset structure, ensuring original properties are kept
            data.assets.forEach(assetData => {
                const asset = {
                    ...assetData, // Copy all original properties
                    isModified: false, // Track if asset has been modified
                    isNew: false, // Track if asset is newly created or uploaded
                    originalImageBlob: null, // Store original blob once loaded
                    newImageBlob: null, // Store new/modified blob
                    cardElement: null // Reference to the DOM element for easy updates
                };
                window.allAssets.push(asset);
                createAndAppendCard(asset);
            });

            // Initial search to display all assets
            performSearch();

            // After initial display, start loading image data into memory
            loadAssetsIntoMemory(window.allAssets)
                .then(() => {
                    assetsLoadedIntoMemory = true;
                    window.updateConsoleLog('All asset data loaded into memory.');
                    window.hideLoadingOverlayWithDelay(2000, 'Assets Loaded!');
                })
                .catch(error => {
                    console.error('Error loading assets into memory:', error);
                    window.updateConsoleLog('[ERROR] Failed to load all asset data into memory.');
                    window.hideLoadingOverlayWithDelay(5000, 'Load Failed!');
                });

        })
        .catch(error => {
            console.error('Error fetching assets.json:', error);
            window.updateConsoleLog(`[FATAL ERROR] Could not load assets: ${error.message}`);
            window.hideLoadingOverlayWithDelay(5000, 'Error Loading Assets!');
        });
});


// Search function
function performSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const textureGrid = document.getElementById('texture-grid');
    textureGrid.innerHTML = ''; // Clear current display

    if (!window.allAssets || window.allAssets.length === 0) {
        // Display a message if no assets are loaded or found
        const noAssetsMessage = document.createElement('p');
        noAssetsMessage.textContent = 'No assets found.';
        noAssetsMessage.style.color = 'rgba(255, 255, 255, 0.7)';
        noAssetsMessage.style.textAlign = 'center';
        noAssetsMessage.style.marginTop = '20px';
        textureGrid.appendChild(noAssetsMessage);
        return;
    }

    const filteredAssets = window.allAssets.filter(asset =>
        asset.filename.toLowerCase().includes(searchTerm) ||
        asset.folder.toLowerCase().includes(searchTerm)
    );

    if (filteredAssets.length === 0) {
        const noResultsMessage = document.createElement('p');
        noResultsMessage.textContent = `No results found for "${searchTerm}".`;
        noResultsMessage.style.color = 'rgba(255, 255, 255, 0.7)';
        noResultsMessage.style.textAlign = 'center';
        noResultsMessage.style.marginTop = '20px';
        textureGrid.appendChild(noResultsMessage);
    } else {
        filteredAssets.forEach(asset => createAndAppendCard(asset));
    }
}

function clearSearch() {
    searchInput.value = '';
    performSearch(); // Show all assets again
}

/**
 * Loads the image/audio blob data for each asset into memory.
 * This is done in the background after initial display to ensure UI responsiveness.
 * @param {Array<Object>} assets The array of asset objects to process.
 * @returns {Promise<void>} A promise that resolves when all assets are loaded.
 */
async function loadAssetsIntoMemory(assets) {
    const totalAssets = assets.length;
    let loadedCount = 0;

    for (const asset of assets) {
        try {
            // Determine the correct path based on asset type
            const filePath = `./mod-assets/${asset.folder}/${asset.filename}`;

            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
            }

            // Determine blob type based on asset type (image or audio)
            const mimeType = asset.type.toLowerCase() === 'mp3' ? 'audio/mpeg' : 'image/png'; // Default to PNG for images

            const blob = await response.blob();

            asset.originalImageBlob = blob; // Store the original blob
            asset.mimeType = mimeType; // Store the determined MIME type

            if (asset.type.toLowerCase() === 'mp3' && asset.cardElement) {
                // For MP3s, update the audio source for the player if it's already rendered
                const audioSource = asset.cardElement.querySelector('.mp3-player source');
                if (audioSource) {
                    audioSource.src = URL.createObjectURL(blob);
                }
            } else if (asset.type.toLowerCase() !== 'mp3' && asset.cardElement) {
                // For images, update the thumbnail to use the blob for consistency after loading
                const imgElement = asset.cardElement.querySelector('.texture-thumbnail');
                if (imgElement) {
                    imgElement.src = URL.createObjectURL(blob);
                }
            }


            loadedCount++;
            window.updateLoadingProgress(loadedCount, totalAssets, `Loading ${asset.filename}`);
            window.updateConsoleLog(`Loaded ${asset.filename} into memory.`);

        } catch (error) {
            console.error(`Error loading ${asset.filename} into memory:`, error);
            window.updateConsoleLog(`[ERROR] Failed to load ${asset.filename}: ${error.message}`);
        }
    }
    console.log('All assets loading into memory process complete.');
}


// Ensure window.showLoadingOverlay and related functions are available
// If they are not defined elsewhere (e.g., in export-options-popup.js), define them here.
// However, the current setup assumes they are in export-options-popup.js,
// and this `if (typeof window... === 'undefined')` pattern is often used for fallbacks
// or to ensure functions are globally exposed by one of the loaded scripts.

// This section was mostly moved to export-options-popup.js to ensure single definition.
// The check for "Loading overlay elements not found!" implies these functions might not be running correctly
// or the elements they target are missing.
// Given the SyntaxError is resolved by removing declarations here, the expectation is
// that export-options-popup.js successfully defines these on `window`.

// REMOVED: Loading overlay global function definitions
// window.showLoadingOverlay = ...
// window.updateLoadingProgress = ...
// window.updateConsoleLog = ...
// window.hideLoadingOverlayWithDelay = ...

// NEW: Re-adding the loading overlay element references for asset-list-page.js specific usage
// The error "Loading overlay elements not found!" suggests these local references are still needed for checks
// within asset-list-page.js itself, even if the global functions are defined elsewhere.
// But the variables were already present at the top of asset-list-page.js.
// The error was about them not being found, but they are obtained via getElementById later.
// The `Loading overlay elements not found!` could be a secondary error if the `SyntaxError` stopped execution.
// Let's ensure the variables are properly initialized in DOMContentLoaded in asset-list-page.js.
// They are:
/*
    loadingOverlay = document.getElementById('loading-overlay');
    progressBar = document.getElementById('progress-bar');
    progressPercentage = document.getElementById('progress-percentage');
    consoleLog = document.getElementById('console-log');
    loadingMessageDisplay = loadingOverlay ? loadingOverlay.querySelector('h2') : null;
*/
// The error 'Loading overlay elements not found!' at asset-list-page.js:662:17 happens
// within the DOMContentLoaded block *after* these assignments.
// The error message itself is conditional:
/*
    if (downloadAllZipButton && loadingOverlay && progressBar && progressPercentage && consoleLog && loadingMessageDisplay) {
        // ...
    } else {
        console.error('One or more required DOM elements for ZIP functionality not found!');
        if (!downloadAllZipButton) console.error('download-all-zip-button not found!');
        if (!loadingOverlay) console.error('loading-overlay not found!'); // This is the line that would print the specific error.
        // ...
    }
*/
// So the 'Loading overlay elements not found!' error means *one of those variables* is null.
// The fix for 'redeclaration of let' is the priority. If that error goes away, the rest might resolve.
// The current content of asset-list-page.js does get the references.

// Final check on variables and how they're used.
// `showExportOptionsPopup` is defined in `export-options-popup.js` and exposed on `window`.
// `asset-list-page.js` calls `showExportOptionsPopup` on `downloadAllZipButton` click.
// `asset-list-page.js` also calls `window.showLoadingOverlay`, etc.
// The problem truly seems to be the redeclaration.

```javascript
// asset-list-page.js

// DOM Elements
let searchInput;
let allCards;
window.allCards = allCards;

const allAssets = [];
window.allAssets = allAssets;
let assetsLoadedIntoMemory = false;


// DOM elements for loading/progress
let loadingOverlay;
let progressBar;
let progressPercentage;
let consoleLog;
let loadingMessageDisplay;


// REMOVED these duplicate declarations:
// let exportOptionsPopup;
// let closeExportPopupButton;
// let exportClientButton;
// let exportBrowserButton;


function createAndAppendCard(asset) {
    const { folder, filename, type, mediaPath } = asset;

    const card = document.createElement('div');
    card.className = 'texture-card';
    card.style.display = 'block';
    card.style.visibility = 'visible';
    card.style.opacity = '1';

    asset.cardElement = card;


    if (type.toLowerCase() === 'mp3') {
        card.className += ' mp3';

        card.innerHTML = `
            <div class="card-content">
                <i class="fas fa-music mp3-icon"></i>
                <img src="${mediaPath}" alt="${filename}" class="mp3-cover-image" onerror="this.onerror=null;this.src='placeholders/mp3-placeholder.png';" style="display: none;">
                <span class="texture-name">${filename}</span>
                <audio controls class="mp3-player">
                    <source src="${mediaPath}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
            </div>
            <div class="card-actions">
                <button class="edit-button"><i class="fas fa-edit"></i> Edit</button>
                <button class="download-button"><i class="fas fa-download"></i> Download</button>
            </div>
        `;
    } else {
        card.innerHTML = `
            <div class="card-content">
                <img src="${mediaPath}" alt="${filename}" class="texture-thumbnail">
                <span class="texture-name">${filename}</span>
            </div>
            <div class="card-actions">
                <button class="edit-button"><i class="fas fa-edit"></i> Edit</button>
                <button class="download-button"><i class="fas fa-download"></i> Download</button>
            </div>
        `;
    }

    document.getElementById('texture-grid').appendChild(card);

    card.querySelector('.edit-button').addEventListener('click', (event) => {
        event.stopPropagation();
        window.openAssetEditorModal(asset);
    });

    card.querySelector('.download-button').addEventListener('click', async (event) => {
        event.stopPropagation();
        if (asset.newImageBlob || asset.originalImageBlob) {
            window.showLoadingOverlay('Preparing Download...');
            window.updateConsoleLog(`Preparing ${asset.filename} for download...`);
            const blobToDownload = asset.newImageBlob || asset.originalImageBlob;
            const filename = asset.filename;
            saveAs(blobToDownload, filename);
            window.hideLoadingOverlayWithDelay(2000, 'Download Complete!');
            window.updateConsoleLog(`${asset.filename} download initiated.`);
        } else {
            alert('Asset data not loaded yet. Please wait or refresh.');
            window.updateConsoleLog(`Attempted to download ${asset.filename} but data was not available.`);
        }
    });

    card.addEventListener('click', () => {
        if (typeof isMultiSelectMode !== 'undefined' && isMultiSelectMode) {
            if (typeof handleCardClick === 'function') {
                handleCardClick(asset);
            } else {
                console.error('handleCardClick function not found in global scope!');
            }
        }
    });

    window.updateCardVisualState(asset);

    return card;
}


window.updateCardVisualState = (asset) => {
    if (!asset.cardElement) {
        console.warn('Cannot update visual state: cardElement not found for asset', asset.filename);
        return;
    }

    asset.cardElement.querySelectorAll('.badge').forEach(badge => badge.remove());

    if (asset.isModified || asset.isNew) {
        const badge = document.createElement('span');
        badge.className = 'badge modified';
        badge.textContent = asset.isNew ? 'NEW' : 'MODIFIED';
        asset.cardElement.querySelector('.card-content').appendChild(badge);
    }
    if (typeof selectedAssets !== 'undefined' && selectedAssets.has(asset)) {
        asset.cardElement.classList.add('selected-for-bulk');
    } else {
        asset.cardElement.classList.remove('selected-for-bulk');
    }
};



document.addEventListener('DOMContentLoaded', () => {
    searchInput = document.getElementById('texture-search');
    const searchButton = document.getElementById('search-button');
    const clearSearchButton = document.getElementById('clear-search-button');
    const downloadAllZipButton = document.getElementById('download-all-zip-button');

    if (searchInput && searchButton && clearSearchButton) {
        searchButton.addEventListener('click', performSearch);
        clearSearchButton.addEventListener('click', clearSearch);
        searchInput.addEventListener('input', () => {
        });
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                performSearch();
            }
        });
    } else {
        console.error('Search DOM elements not found!');
    }

    if (typeof window.showLoadingOverlay === 'function') {
        window.showLoadingOverlay('Loading Assets...');
    } else {
        console.error('showLoadingOverlay function not found in global scope. The loading window will not appear.');
    }


    loadingOverlay = document.getElementById('loading-overlay');
    progressBar = document.getElementById('progress-bar');
    progressPercentage = document.getElementById('progress-percentage');
    consoleLog = document.getElementById('console-log');
    loadingMessageDisplay = loadingOverlay ? loadingOverlay.querySelector('h2') : null;


    if (downloadAllZipButton && loadingOverlay && progressBar && progressPercentage && consoleLog && loadingMessageDisplay) {
        downloadAllZipButton.removeEventListener('click', null);
        downloadAllZipButton.addEventListener('click', showExportOptionsPopup);
    } else {
        console.error('One or more required DOM elements for ZIP functionality not found!');
        if (!downloadAllZipButton) console.error('download-all-zip-button not found!');
        if (!loadingOverlay) console.error('loading-overlay not found!');
        if (!progressBar) console.error('progress-bar not found!');
        if (!progressPercentage) console.error('progress-percentage not found!');
        if (!consoleLog) console.error('console-log not found!');
        if (!loadingMessageDisplay) console.error('h2 for loading message not found!');
    }


    fetch('./mod-assets/assets.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            window.updateConsoleLog('Assets JSON loaded successfully.');
            data.assets.forEach(assetData => {
                const asset = {
                    ...assetData,
                    isModified: false,
                    isNew: false,
                    originalImageBlob: null,
                    newImageBlob: null,
                    cardElement: null
                };
                window.allAssets.push(asset);
                createAndAppendCard(asset);
            });

            performSearch();

            loadAssetsIntoMemory(window.allAssets)
                .then(() => {
                    assetsLoadedIntoMemory = true;
                    window.updateConsoleLog('All asset data loaded into memory.');
                    window.hideLoadingOverlayWithDelay(2000, 'Assets Loaded!');
                })
                .catch(error => {
                    console.error('Error loading assets into memory:', error);
                    window.updateConsoleLog('[ERROR] Failed to load all asset data into memory.');
                    window.hideLoadingOverlayWithDelay(5000, 'Load Failed!');
                });

        })
        .catch(error => {
            console.error('Error fetching assets.json:', error);
            window.updateConsoleLog(`[FATAL ERROR] Could not load assets: ${error.message}`);
            window.hideLoadingOverlayWithDelay(5000, 'Error Loading Assets!');
        });
});


function performSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const textureGrid = document.getElementById('texture-grid');
    textureGrid.innerHTML = '';

    if (!window.allAssets || window.allAssets.length === 0) {
        const noAssetsMessage = document.createElement('p');
        noAssetsMessage.textContent = 'No assets found.';
        noAssetsMessage.style.color = 'rgba(255, 255, 255, 0.7)';
        noAssetsMessage.style.textAlign = 'center';
        noAssetsMessage.style.marginTop = '20px';
        textureGrid.appendChild(noAssetsMessage);
        return;
    }

    const filteredAssets = window.allAssets.filter(asset =>
        asset.filename.toLowerCase().includes(searchTerm) ||
        asset.folder.toLowerCase().includes(searchTerm)
    );

    if (filteredAssets.length === 0) {
        const noResultsMessage = document.createElement('p');
        noResultsMessage.textContent = `No results found for "${searchTerm}".`;
        noResultsMessage.style.color = 'rgba(255, 255, 255, 0.7)';
        noResultsMessage.style.textAlign = 'center';
        noResultsMessage.style.marginTop = '20px';
        textureGrid.appendChild(noResultsMessage);
    } else {
        filteredAssets.forEach(asset => createAndAppendCard(asset));
    }
}

function clearSearch() {
    searchInput.value = '';
    performSearch();
}


async function loadAssetsIntoMemory(assets) {
    const totalAssets = assets.length;
    let loadedCount = 0;

    for (const asset of assets) {
        try {
            const filePath = `./mod-assets/${asset.folder}/${asset.filename}`;

            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
            }

            const mimeType = asset.type.toLowerCase() === 'mp3' ? 'audio/mpeg' : 'image/png';

            const blob = await response.blob();

            asset.originalImageBlob = blob;
            asset.mimeType = mimeType;

            if (asset.type.toLowerCase() === 'mp3' && asset.cardElement) {
                const audioSource = asset.cardElement.querySelector('.mp3-player source');
                if (audioSource) {
                    audioSource.src = URL.createObjectURL(blob);
                }
            } else if (asset.type.toLowerCase() !== 'mp3' && asset.cardElement) {
                const imgElement = asset.cardElement.querySelector('.texture-thumbnail');
                if (imgElement) {
                    imgElement.src = URL.createObjectURL(blob);
                }
            }

            loadedCount++;
            window.updateLoadingProgress(loadedCount, totalAssets, `Loading ${asset.filename}`);
            window.updateConsoleLog(`Loaded ${asset.filename} into memory.`);

        } catch (error) {
            console.error(`Error loading ${asset.filename} into memory:`, error);
            window.updateConsoleLog(`[ERROR] Failed to load ${asset.filename}: ${error.message}`);
        }
    }
    console.log('All assets loading into memory process complete.');
}