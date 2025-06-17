// asset-list-page.js
// DOM Elements
let searchInput;
let allCards;
// Store a global list of all assets fetched to be used for zipping and bulk operations
// Each asset object will now also store its Blob data and modification status.
const allAssets = [];
let assetsLoadedIntoMemory = false; // New flag: true when image blobs are loaded for all assets

// DOM elements for loading/progress
let loadingOverlay;
let progressBar;
let progressPercentage;
let consoleLog;
let loadingMessageDisplay; // New: to display dynamic loading messages

// Export Options Popup DOM Elements
let exportOptionsPopup;
let closeExportPopupButton;
let exportClientButton;
let exportBrowserButton;

// New: Session Management Buttons
let exportSessionButton;
let importSessionButton;


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

        // Create elements for the consolidated MP3 card layout
        const playIcon = document.createElement('i');
        playIcon.className = 'fas fa-play media-icon'; // Keep original class for icon styling
        playIcon.onclick = (event) => {
            event.stopPropagation(); // Prevent card selection when clicking play button
            playAudio(mediaPath);
        };

        const mp3FilenameDisplay = document.createElement('div');
        mp3FilenameDisplay.className = 'mp3-filename-display';
        mp3FilenameDisplay.textContent = filename;

        const folderNumberButton = document.createElement('button');
        folderNumberButton.className = 'folder-number-button';
        folderNumberButton.textContent = `Folder: ${folder}`;
        folderNumberButton.onclick = (event) => {
             event.stopPropagation(); // Prevent card selection when clicking copy button
             // Use document.execCommand('copy') for clipboard operations in iframe context
             const tempInput = document.createElement('textarea');
             tempInput.value = folder;
             document.body.appendChild(tempInput);
             tempInput.select();
             document.execCommand('copy');
             document.body.removeChild(tempInput);

             folderNumberButton.textContent = 'Copied!';
             setTimeout(() => {
                 folderNumberButton.textContent = `Folder: ${folder}`;
             }, 2000);
        };

        // Create a wrapper for the action buttons to manage their layout
        const mp3ButtonsWrapper = document.createElement('div');
        mp3ButtonsWrapper.className = 'mp3-buttons-wrapper'; // New class for this wrapper

        const copyFolderButton = document.createElement('button');
        copyFolderButton.className = 'copy-folder-button';
        copyFolderButton.textContent = 'Copy Folder';
        copyFolderButton.onclick = (event) => {
            event.stopPropagation(); // Prevent card selection when clicking copy button
            const tempInput = document.createElement('textarea');
            tempInput.value = folder;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);

            copyFolderButton.textContent = 'Copied!';
            setTimeout(() => { copyFolderButton.textContent = 'Copy Folder'; }, 2000);
        };
        mp3ButtonsWrapper.appendChild(copyFolderButton);

        const downloadButton = document.createElement('button');
        downloadButton.className = 'download-button';
        downloadButton.textContent = 'Download';
        downloadButton.onclick = (event) => {
            event.stopPropagation(); // Prevent card selection when clicking download button
            const downloadLink = document.createElement('a');
            downloadLink.href = mediaPath;
            downloadLink.download = filename;
            downloadLink.click();
        };
        mp3ButtonsWrapper.appendChild(downloadButton);

        // Append all consolidated elements directly to the main card
        card.appendChild(playIcon);
        card.appendChild(mp3FilenameDisplay);
        card.appendChild(folderNumberButton);
        card.appendChild(mp3ButtonsWrapper);

    } else { // Logic for PNG/JPG cards
        // Add the selection checkbox for image cards
        const selectCheckbox = document.createElement('div');
        selectCheckbox.className = 'select-checkbox';
        selectCheckbox.innerHTML = '<i class="fas fa-check"></i>'; // Font Awesome checkmark
        card.appendChild(selectCheckbox);

        // Add click listener to the card for multi-selection
        card.addEventListener('click', () => {
            // Check if multi-select mode is active (function from bulk-operations.js)
            if (typeof window.isMultiSelectModeActive === 'function' && window.isMultiSelectModeActive()) {
                window.toggleAssetSelection(asset, card); // Function from bulk-operations.js
            }
        });


        // Create media container
        const mediaContainer = document.createElement('div');
        mediaContainer.className = 'media-container';

        // Create appropriate media element/placeholder based on type
        const mediaElement = document.createElement('img');
        mediaElement.className = 'media-image';
        
        // Initially, image source points directly to the file path.
        // Blob will be loaded later when assetsLoadedIntoMemory is true.
        mediaElement.src = mediaPath;

        // Add error handling for images
        mediaElement.onerror = () => {
            console.error(`Failed to load media: ${mediaPath}`);
            const placeholder = document.createElement('div');
            placeholder.className = 'media-placeholder';
            placeholder.innerHTML = `
                <div class="media-icon">❓</div>
                <div class="media-filename">${filename}</div>
            `;
            mediaContainer.innerHTML = ''; // Clear original image
            mediaContainer.appendChild(placeholder);
        };
        mediaContainer.appendChild(mediaElement);
        card.appendChild(mediaContainer); // Append mediaContainer for non-MP3s

        // Create info container
        const infoContainer = document.createElement('div');
        infoContainer.className = 'texture-info';

        // Create file-info container
        const fileInfoContainer = document.createElement('div');
        fileInfoContainer.className = 'file-info';

        // Filename Element Creation for PNG/JPGs
        const filenameElement = document.createElement('div');
        filenameElement.className = 'texture-filename';
        filenameElement.textContent = filename;
        fileInfoContainer.appendChild(filenameElement);

        // Folder/artist/album element
        const folderOrArtistAlbumElement = document.createElement('div');
        folderOrArtistAlbumElement.className = 'texture-name';
        folderOrArtistAlbumElement.textContent = folder;
        fileInfoContainer.appendChild(folderOrArtistAlbumElement);

        infoContainer.appendChild(fileInfoContainer);

        // Create buttons container for non-MP3s
        const actionButtonsContainer = document.createElement('div');
        actionButtonsContainer.className = 'buttons-container';

        // New "Edit Asset" button
        const editAssetButton = document.createElement('button');
        editAssetButton.className = 'edit-asset-button';
        editAssetButton.textContent = 'Edit Asset';
        editAssetButton.onclick = (event) => {
            event.stopPropagation(); // Prevent card selection when clicking edit button
            // Call the modal function from asset-editor-modal.js
            // Pass the entire asset object reference and the card element for in-memory modification and visual update
            // Only open if multi-select mode is NOT active
            if (typeof window.isMultiSelectModeActive === 'function' && !window.isMultiSelectModeActive()) {
                if (typeof window.openAssetEditorModal === 'function') {
                    window.openAssetEditorModal(asset, card);
                } else {
                    console.error('openAssetEditorModal function not found. Is asset-editor-modal.js loaded?');
                }
            } else {
                console.log('Cannot open single asset editor while multi-select mode is active.');
            }
        };
        actionButtonsContainer.appendChild(editAssetButton);

        // Download button
        const downloadButton = document.createElement('button');
        downloadButton.className = 'download-button';
        downloadButton.textContent = 'Download';
        downloadButton.onclick = (event) => {
            event.stopPropagation(); // Prevent card selection when clicking download button
            // Check if asset has a newImageBlob and download that, otherwise download original mediaPath
            if (asset.newImageBlob) {
                // Create a temporary URL for the Blob and trigger download
                const url = URL.createObjectURL(asset.newImageBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = asset.filename; // Use original filename for download
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url); // Clean up the URL
            } else {
                // Fallback to original mediaPath if no newImageBlob
                const downloadLink = document.createElement('a');
                downloadLink.href = asset.mediaPath;
                downloadLink.download = asset.filename;
                downloadLink.click();
            }
        };
        actionButtonsContainer.appendChild(downloadButton);

        infoContainer.appendChild(actionButtonsContainer);
        card.appendChild(infoContainer);
    }
    document.getElementById('texture-grid').appendChild(card);
    allCards = document.querySelectorAll('.texture-card'); // Update allCards NodeList
}

// Function to play audio (for mp3 type)
function playAudio(mediaPath) {
    const audio = new Audio(mediaPath);
    audio.play();
}

// Search functionality
function filterAssets() {
    const searchTerm = searchInput.value.toLowerCase();
    allAssets.forEach(asset => {
        const card = asset.cardElement; // Use the stored DOM element reference
        if (!card) return; // Skip if card element isn't found

        const filename = asset.filename.toLowerCase();
        const folder = asset.folder.toLowerCase();
        
        if (filename.includes(searchTerm) || folder.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Function to fetch assets from the server (assuming a JSON endpoint)
async function fetchAssets() {
    window.showLoadingOverlay();
    window.updateLoadingProgress(0, 1, 'Fetching asset list...');
    window.updateConsoleLog('Loading asset data...');
    try {
        const response = await fetch('assets.json'); // Fetch your JSON data
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const assets = await response.json();
        allAssets.push(...assets); // Add fetched assets to the global array

        // Now that all assets are loaded, create cards for them
        allAssets.forEach(asset => createAndAppendCard(asset));
        window.updateConsoleLog('Asset data loaded and cards created.');
        window.updateLoadingProgress(1, 1, 'Assets loaded!');

        // NEW: Load image blobs into memory after initial data is loaded
        // This makes sure the UI is responsive while images are being processed in background
        loadAllImageBlobsIntoMemory();

    } catch (error) {
        console.error('Error fetching assets:', error);
        window.updateConsoleLog(`[ERROR] Failed to load assets: ${error.message}`);
        window.hideLoadingOverlayWithDelay(3000, 'Asset Loading Failed!');
    }
}

// NEW: Function to load all image blobs into memory (for image manipulation and zipping)
async function loadAllImageBlobsIntoMemory() {
    if (assetsLoadedIntoMemory) {
        console.log('Image blobs already loaded into memory.');
        return;
    }

    window.updateLoadingProgress(0, 1, 'Loading images for editing...');
    window.updateConsoleLog('Pre-loading images into memory for editing and export...');

    const imageAssets = allAssets.filter(asset => asset.type.toLowerCase() === 'png' || asset.type.toLowerCase() === 'jpg' || asset.type.toLowerCase() === 'jpeg');
    let loadedCount = 0;
    const totalImages = imageAssets.length;

    for (const asset of imageAssets) {
        try {
            // If the asset already has a newImageBlob (e.g., from an import), use that
            // Otherwise, fetch the original image
            const blobToLoad = asset.newImageBlob || await (await fetch(asset.mediaPath)).blob();
            asset.initialImageBlob = blobToLoad; // Store original blob or current blob
            
            // Set newImageBlob to initial for consistency if no modification yet
            if (!asset.newImageBlob) {
                asset.newImageBlob = blobToLoad; 
            }

            // Update the card's image display to use the blob if it's not already
            const mediaElement = asset.cardElement.querySelector('.media-image');
            if (mediaElement && !mediaElement.src.startsWith('blob:')) {
                mediaElement.src = URL.createObjectURL(asset.newImageBlob);
                mediaElement.onload = () => URL.revokeObjectURL(mediaElement.src); // Clean up object URL
            }

            loadedCount++;
            window.updateLoadingProgress(loadedCount, totalImages, `Loaded: ${asset.filename}`);
            window.updateConsoleLog(`Loaded ${asset.filename} into memory.`);
        } catch (error) {
            console.error(`Error loading image blob for ${asset.filename}:`, error);
            window.updateConsoleLog(`[ERROR] Failed to load ${asset.filename} into memory.`);
        }
    }
    assetsLoadedIntoMemory = true;
    window.updateConsoleLog('All image blobs loaded into memory.');
    window.hideLoadingOverlayWithDelay(1500, 'Ready!');
}


// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    searchInput = document.getElementById('texture-search');
    const searchButton = document.getElementById('search-button');
    const clearSearchButton = document.getElementById('clear-search-button');
    const downloadAllZipButton = document.getElementById('download-all-zip-button');

    // New: Get references to the session management buttons
    exportSessionButton = document.getElementById('export-session-button');
    importSessionButton = document.getElementById('import-session-button');

    if (searchInput) {
        searchInput.addEventListener('input', filterAssets);
    }

    if (searchButton) {
        searchButton.addEventListener('click', filterAssets);
    }

    if (clearSearchButton) {
        clearSearchButton.addEventListener('click', () => {
            searchInput.value = '';
            filterAssets();
        });
    }

    // Initialize DOM elements for loading/progress (already done by global functions, just ensuring they exist)
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

    // New: Add event listeners for session management buttons
    if (exportSessionButton && typeof window.exportSession === 'function') {
        exportSessionButton.addEventListener('click', window.exportSession);
    } else {
        console.error('Export Session button or exportSession function not found!');
    }

    if (importSessionButton && typeof window.importSession === 'function') {
        importSessionButton.addEventListener('click', window.importSession);
    } else {
        console.error('Import Session button or importSession function not found!');
    }


    // Initial fetch of assets when the page loads
    fetchAssets();
});


// New: Global function to update a specific card's visual state after modification/creation
// This function will be called from asset-editor-modal.js and bulk-operations.js
if (typeof window.updateCardVisualState === 'undefined') {
    window.updateCardVisualState = (asset) => {
        const cardElement = asset.cardElement;
        if (!cardElement) {
            console.warn('Attempted to update card visual state for an asset without a cardElement:', asset);
            return;
        }

        const mediaImage = cardElement.querySelector('.media-image');
        const filenameElement = cardElement.querySelector('.texture-filename');
        const folderElement = cardElement.querySelector('.texture-name'); // For folder/artist/album

        if (asset.isNew || asset.isModified) {
            cardElement.classList.add('modified'); // Add a class for visual indication
        } else {
            cardElement.classList.remove('modified');
        }

        // Update the image source if there's a new blob
        if (mediaImage && asset.newImageBlob) {
            // Revoke previous object URL if it exists to prevent memory leaks
            if (mediaImage.src.startsWith('blob:')) {
                URL.revokeObjectURL(mediaImage.src);
            }
            mediaImage.src = URL.createObjectURL(asset.newImageBlob);
            mediaImage.onload = () => URL.revokeObjectURL(mediaImage.src); // Clean up
        }

        // You might also want to update filename/folder if those can be changed
        if (filenameElement) {
            filenameElement.textContent = asset.filename;
        }
        if (folderElement) {
            folderElement.textContent = asset.folder;
        }
        // Potentially update other displayed properties
    };
}