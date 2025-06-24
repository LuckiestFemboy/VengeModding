// asset-list-page.js
// This file handles displaying assets, search functionality, and loading mechanisms.

// DOM Elements
let searchInput;
let allCards = []; // Initialize as empty array
window.allCards = allCards; // Expose globally

// Store a global list of all assets fetched to be used for zipping and bulk operations
// Each asset object will now also store its Blob data and modification status.
const allAssets = [];
window.allAssets = allAssets; // Expose allAssets globally
let assetsLoadedIntoMemory = false; // Existing flag: true when image blobs are loaded for all assets

// DOM elements for loading/progress
let loadingOverlay;
let progressBar;
let progressPercentage;
let consoleLog;
let loadingMessageDisplay; // To display dynamic loading messages

// Export Options Popup DOM Elements (references are handled in export-options-popup.js)
// They are declared here just for clarity within this file's scope where used.
let exportOptionsPopup;
let closeExportPopupButton;
let exportClientButton;
let exportBrowserButton;

// Helper function from import-export.js. Included directly for robustness.
if (typeof window.dataURLtoBlob === 'undefined') {
    window.dataURLtoBlob = (dataURL) => {
        return new Promise((resolve) => {
            const parts = dataURL.split(';base64,');
            const contentType = parts[0].split(':')[1];
            const raw = window.atob(parts[1]); // Decode Base64
            const rawLength = raw.length;
            const uInt8Array = new Uint8Array(rawLength);

            for (let i = 0; i < rawLength; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
            }
            resolve(new Blob([uInt8Array], { type: contentType }));
        });
    };
}


// Card Creation
// Modified to use Blob URLs for display and re-incorporate original buttons/features.
function createAndAppendCard(asset) {
    // Destructure asset object. 'id' is now 'folder' for display purposes.
    const { id: folder, filename, type, originalBlob, newImageBlob } = asset;

    // Create main card element
    const card = document.createElement('div');
    card.className = 'texture-card';
    card.style.display = 'block';
    card.style.visibility = 'visible';
    card.style.opacity = '1';

    // Store a reference to the card DOM element on the asset object
    asset.cardElement = card;

    // Determine the Blob to use for display (newImageBlob if modified, otherwise originalBlob)
    const blobToDisplay = newImageBlob || originalBlob;
    let objectURL = null;

    if (blobToDisplay) {
        objectURL = URL.createObjectURL(blobToDisplay);
    } else {
        console.warn(`No Blob data for asset: ${filename} (ID: ${folder})`);
        // Fallback or error display if no blob is available
    }


    if (type.toLowerCase().includes('mp3') || type.toLowerCase().includes('audio')) {
        card.className += ' mp3'; // Add mp3 class for specific styling

        const playIcon = document.createElement('i');
        playIcon.className = 'fas fa-play media-icon';
        playIcon.onclick = (event) => {
            event.stopPropagation();
            if (objectURL) {
                const audio = new Audio(objectURL);
                audio.type = type;
                audio.play().catch(e => console.error("Error playing audio:", e));
            } else {
                console.warn('No audio URL to play.');
            }
        };
        card.appendChild(playIcon);

        const mp3FilenameDisplay = document.createElement('div');
        mp3FilenameDisplay.className = 'mp3-filename-display';
        mp3FilenameDisplay.textContent = filename;
        card.appendChild(mp3FilenameDisplay);

        const folderNumberButton = document.createElement('button');
        folderNumberButton.className = 'folder-number-button';
        folderNumberButton.textContent = `Folder: ${folder}`;
        folderNumberButton.onclick = (event) => {
            event.stopPropagation();
            const tempInput = document.createElement('textarea');
            tempInput.value = folder;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);

            folderNumberButton.textContent = 'Copied!';
            setTimeout(() => { folderNumberButton.textContent = `Folder: ${folder}`; }, 2000);
        };
        card.appendChild(folderNumberButton);

        const mp3ButtonsWrapper = document.createElement('div');
        mp3ButtonsWrapper.className = 'mp3-buttons-wrapper';

        const copyFolderButton = document.createElement('button');
        copyFolderButton.className = 'copy-folder-button';
        copyFolderButton.textContent = 'Copy Folder';
        copyFolderButton.onclick = (event) => {
            event.stopPropagation();
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
            event.stopPropagation();
            if (blobToDisplay) {
                const downloadLink = document.createElement('a');
                downloadLink.href = objectURL; // Use the Blob URL
                downloadLink.download = filename;
                document.body.appendChild(downloadLink); // Append to body to make it clickable
                downloadLink.click();
                document.body.removeChild(downloadLink); // Clean up
                // Revoke object URL after download initiated
                URL.revokeObjectURL(objectURL);
            } else {
                console.warn('No Blob data to download.');
            }
        };
        mp3ButtonsWrapper.appendChild(downloadButton);
        card.appendChild(mp3ButtonsWrapper);

    } else { // Assume it's an image (PNG/JPG)
        // Add the selection checkbox for image cards
        const selectCheckbox = document.createElement('div');
        selectCheckbox.className = 'select-checkbox';
        selectCheckbox.innerHTML = '<i class="fas fa-check"></i>'; // Font Awesome checkmark
        card.appendChild(selectCheckbox);

        // Add click listener to the card for multi-selection
        card.addEventListener('click', () => {
            if (typeof window.isMultiSelectModeActive === 'function' && window.isMultiSelectModeActive()) {
                window.toggleAssetSelection(asset, card); // Function from bulk-operations.js
            } else {
                 // If not in multi-select mode, clicking opens the editor
                 if (typeof window.openAssetEditorModal === 'function') {
                    window.openAssetEditorModal(asset); // Pass the asset object
                } else {
                    console.error('openAssetEditorModal function not found. Is asset-editor-modal.js loaded correctly?');
                }
            }
        });

        // Create media container
        const mediaContainer = document.createElement('div');
        mediaContainer.className = 'media-container';

        const img = document.createElement('img');
        img.className = 'media-image';
        img.alt = `Texture: ${filename}`;
        img.loading = 'lazy'; // Improve performance
        if (objectURL) {
            img.src = objectURL;
        }

        // Add error handling for images
        img.onerror = () => {
            console.error(`Failed to load image: ${filename} (ID: ${folder})`);
            const placeholder = document.createElement('div');
            placeholder.className = 'media-placeholder';
            placeholder.innerHTML = `
                <div class="media-icon">❓</div>
                <div class="media-filename">${filename}</div>
            `;
            mediaContainer.innerHTML = ''; // Clear original image
            mediaContainer.appendChild(placeholder);
        };
        mediaContainer.appendChild(img);
        card.appendChild(mediaContainer);

        // Create info container
        const infoContainer = document.createElement('div');
        infoContainer.className = 'texture-info';

        // Create file-info container
        const fileInfoContainer = document.createElement('div');
        fileInfoContainer.className = 'file-info';

        // Filename Element Creation
        const filenameElement = document.createElement('div');
        filenameElement.className = 'texture-filename';
        filenameElement.textContent = filename;
        fileInfoContainer.appendChild(filenameElement);

        // Folder Element
        const folderElement = document.createElement('div');
        folderElement.className = 'texture-name'; // Reusing class from original
        folderElement.textContent = folder;
        fileInfoContainer.appendChild(folderElement);

        infoContainer.appendChild(fileInfoContainer);

        // Create buttons container for non-MP3s
        const actionButtonsContainer = document.createElement('div');
        actionButtonsContainer.className = 'buttons-container';

        const editAssetButton = document.createElement('button');
        editAssetButton.className = 'edit-asset-button';
        editAssetButton.textContent = 'Edit Asset';
        editAssetButton.onclick = (event) => {
            event.stopPropagation(); // Prevent card selection when clicking edit button
            if (typeof window.isMultiSelectModeActive === 'function' && !window.isMultiSelectModeActive()) {
                if (typeof window.openAssetEditorModal === 'function') {
                    window.openAssetEditorModal(asset); // Pass the entire asset object reference
                } else {
                    console.error('openAssetEditorModal function not found. Is asset-editor-modal.js loaded correctly?');
                }
            } else {
                console.log('Cannot open single editor in multi-select mode.');
            }
        };
        actionButtonsContainer.appendChild(editAssetButton);

        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copy Folder';
        copyButton.onclick = (event) => {
            event.stopPropagation();
            const tempInput = document.createElement('textarea');
            tempInput.value = folder;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);

            copyButton.textContent = 'Copied!';
            setTimeout(() => { copyButton.textContent = 'Copy Folder'; }, 2000);
        };
        actionButtonsContainer.appendChild(copyButton);

        const downloadButton = document.createElement('button');
        downloadButton.className = 'download-button';
        downloadButton.textContent = 'Download';
        downloadButton.onclick = (event) => {
            event.stopPropagation();
            if (blobToDisplay) {
                const downloadLink = document.createElement('a');
                downloadLink.href = objectURL; // Use the Blob URL
                downloadLink.download = filename;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                // Revoke object URL after download initiated
                URL.revokeObjectURL(objectURL);
            } else {
                console.warn('No Blob data to download.');
            }
        };
        actionButtonsContainer.appendChild(downloadButton);

        infoContainer.appendChild(actionButtonsContainer);
        card.appendChild(infoContainer);
    }

    // Append the card to the grid
    const grid = document.getElementById('texture-grid'); // Changed back to texture-grid as in original
    if (grid) {
        grid.appendChild(card);
    } else {
        console.error('Texture grid container (#texture-grid) not found!');
    }

    allCards.push(card); // Keep track of all card elements
    window.updateCardVisualState(asset); // Apply initial visual state
    return card;
}


/**
 * Updates the visual state of a card based on its associated asset's modification status.
 * This function is called from asset-editor-modal.js after changes are saved, and from bulk-operations.js.
 * @param {Object} asset The asset object whose visual state needs to be updated.
 */
window.updateCardVisualState = (asset) => {
    const cardElement = asset.cardElement;
    if (!cardElement) {
        console.warn('Cannot update card visual state: cardElement not found for asset', asset);
        return;
    }

    // Remove existing state classes
    cardElement.classList.remove('modified', 'new-asset', 'selected', 'edited-card');

    // Add new state classes based on asset properties
    if (asset.isNew) {
        cardElement.classList.add('new-asset', 'edited-card'); // Keep edited-card for consistency
    } else if (asset.isModified) {
        cardElement.classList.add('modified', 'edited-card'); // Keep edited-card for consistency
    }

    // Update selected state (used in bulk-operations)
    if (asset.isSelected) {
        cardElement.classList.add('selected');
    }

    // Re-render image/audio if the blob has changed (e.g., after modification)
    const mediaElement = cardElement.querySelector('img, audio');
    if (mediaElement) {
        const currentSrc = mediaElement.src;
        let newBlobToDisplay = asset.newImageBlob || asset.originalBlob;
        let newObjectURL = newBlobToDisplay ? URL.createObjectURL(newBlobToDisplay) : null;

        // Only update if the URL has genuinely changed or if it needs to be set for the first time
        if (newObjectURL && currentSrc !== newObjectURL) {
            // Revoke old URL if it was a Blob URL to free up memory
            if (currentSrc.startsWith('blob:')) {
                URL.revokeObjectURL(currentSrc);
            }
            mediaElement.src = newObjectURL;
        } else if (!newObjectURL && currentSrc.startsWith('blob:')) {
            // If newBlobToDisplay is null (e.g., asset removed/reverted), clear current Blob URL
            URL.revokeObjectURL(currentSrc);
            mediaElement.src = ''; // Or a placeholder image
        }

        // If newObjectURL was generated but not used (because currentSrc === newObjectURL), revoke it immediately
        if (newObjectURL && currentSrc === newObjectURL) {
             URL.revokeObjectURL(newObjectURL); // Revoke the transient URL
        }
    }
};


// Function to render asset cards (re-renders all cards, suitable for filtering by rebuilding)
function renderAssetCards(assetsToRender) {
    const container = document.getElementById('texture-grid'); // Changed back to texture-grid
    if (!container) {
        console.error('Cannot render assets: texture-grid container not found.');
        return;
    }
    container.innerHTML = ''; // Clear existing cards
    allCards = []; // Reset allCards array

    assetsToRender.forEach(asset => {
        createAndAppendCard(asset);
    });
}

// Function to filter assets based on search input
function filterAssets() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredAssets = window.allAssets.filter(asset => {
        // Search by folder (ID) or filename
        return asset.folder.toLowerCase().includes(searchTerm) ||
               asset.filename.toLowerCase().includes(searchTerm);
    });
    renderAssetCards(filteredAssets);
}

// HELPER FUNCTION: To safely navigate the deeply nested JSON structure
function getAssetDataFromNestedJson(jsonBlob, assetId, filename) {
    try {
        const resourceSwapper = jsonBlob['mod-client-export']?.['Venge Client']?.['Resource Swapper'];
        if (resourceSwapper && resourceSwapper.files && resourceSwapper.files.assets) {
            const assetById = resourceSwapper.files.assets[assetId];
            if (assetById && assetById['1']) { // Assuming '1' is the fixed key for the asset details
                const assetDetails = assetById['1'][filename];
                if (assetDetails && assetDetails.data) {
                    return assetDetails;
                }
            }
        }
    } catch (e) {
        console.warn(`Could not find asset ${filename} (ID: ${assetId}) in JSON blob. Error:`, e);
    }
    return null;
}


// ASSET LOADING LOGIC
async function loadAllAssetsFromUnifiedSource() {
    window.showLoadingOverlay('Loading Assets...');
    window.updateConsoleLog('Fetching asset manifests...');

    const jsonFilePaths = {
        jpg: 'jpg_files_structure.json',
        mp3: 'mp3_files_structure.json',
        png: 'png_files_structure.json'
    };

    let allParsedJsonData = {}; // Will store all three parsed JSONs by type

    try {
        // 1. Fetch and parse the three JSON files
        window.updateConsoleLog('Fetching JSON asset data files...');

        const [jpgResponse, mp3Response, pngResponse] = await Promise.all([
            fetch(jsonFilePaths.jpg),
            fetch(jsonFilePaths.mp3),
            fetch(jsonFilePaths.png)
        ]);

        allParsedJsonData.jpg = await jpgResponse.json();
        allParsedJsonData.mp3 = await mp3Response.json();
        allParsedJsonData.png = await pngResponse.json();

        window.updateConsoleLog('JSON asset data files fetched.');

        // 2. Fetch and parse the .txt manifest files
        const jpgListResponse = await fetch('jpgurl.txt');
        const mp3ListResponse = await fetch('mp3list.txt');
        const pngListResponse = await fetch('pnglist.txt');

        const jpgListText = await jpgListResponse.text();
        const mp3ListText = await mp3ListResponse.text();
        const pngListText = await pngListResponse.text();

        // Combine all manifest lines, filtering out empty ones
        const allManifestLines = [
            ...jpgListText.split('\n').filter(line => line.trim() !== ''),
            ...mp3ListText.split('\n').filter(line => line.trim() !== ''),
            ...pngListText.split('\n').filter(line => line.trim() !== '')
        ];

        window.updateConsoleLog(`Found ${allManifestLines.length} assets referenced in manifest files.`);

        let processedCount = 0;
        const totalAssetsToLoad = allManifestLines.length;

        // 3. Process each manifest entry, find in respective JSON, convert to Blob, and add to allAssets
        for (const line of allManifestLines) {
            const parts = line.trim().split(' ');
            if (parts.length >= 2) {
                const id = parts[0];
                const filename = parts.slice(1).join(' '); // Rejoin filename in case it had spaces
                const fileExtension = filename.split('.').pop().toLowerCase();

                let assetData = null;
                // Determine which JSON file to look into based on file extension
                if (fileExtension === 'jpg' && allParsedJsonData.jpg) {
                    assetData = getAssetDataFromNestedJson(allParsedJsonData.jpg, id, filename);
                } else if (fileExtension === 'mp3' && allParsedJsonData.mp3) {
                    assetData = getAssetDataFromNestedJson(allParsedJsonData.mp3, id, filename);
                } else if (fileExtension === 'png' && allParsedJsonData.png) {
                    assetData = getAssetDataFromNestedJson(allParsedJsonData.png, id, filename);
                }

                if (assetData && assetData.data) {
                    window.updateConsoleLog(`Loading: ${filename} (ID: ${id})`);
                    const blob = await window.dataURLtoBlob(assetData.data);

                    window.allAssets.push({
                        id: id,
                        folder: id, // Store ID as 'folder' for existing display compatibility
                        filename: filename,
                        type: assetData.type, // e.g., 'image/png', 'audio/mpeg'
                        originalBlob: blob, // Store the actual Blob data
                        newImageBlob: null, // For modified versions of the asset
                        isNew: false,
                        isModified: false,
                        isSelected: false, // For bulk operations
                        cardElement: null // Reference to its DOM element
                    });
                } else {
                    window.updateConsoleLog(`[WARNING] Asset data not found in JSONs for ID: ${id}, Filename: ${filename}`);
                }
            }
            processedCount++;
            window.updateLoadingProgress(processedCount, totalAssetsToLoad, `Loading: ${filename || 'Unknown'}`);
        }

        assetsLoadedIntoMemory = true;
        window.updateConsoleLog(`Successfully loaded ${window.allAssets.length} assets into memory.`);
        renderAssetCards(window.allAssets); // Display all loaded assets
        window.hideLoadingOverlayWithDelay(1000, 'Assets Loaded!');

    } catch (error) {
        console.error('Error loading assets from unified source:', error);
        window.updateConsoleLog(`[ERROR] Failed to load assets: ${error.message}`);
        window.hideLoadingOverlayWithDelay(3000, 'Error Loading Assets!');
    }
}


// Initial setup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    searchInput = document.getElementById('search-input'); // Assuming id is 'search-input'
    const downloadAllZipButton = document.getElementById('download-all-zip-button');

    if (searchInput) {
        searchInput.addEventListener('input', filterAssets);
    } else {
        console.error('Search input element not found (expected #search-input)!');
    }

    // Get references to the new loading UI elements
    loadingOverlay = document.getElementById('loading-overlay');
    progressBar = document.getElementById('progress-bar');
    progressPercentage = document.getElementById('progress-percentage');
    consoleLog = document.getElementById('console-log');
    loadingMessageDisplay = loadingOverlay ? loadingOverlay.querySelector('h2') : null;

    if (downloadAllZipButton && loadingOverlay && progressBar && progressPercentage && consoleLog && loadingMessageDisplay) {
        downloadAllZipButton.removeEventListener('click', window.showExportOptionsPopup); // Ensure no duplicate listeners
        downloadAllZipButton.addEventListener('click', window.showExportOptionsPopup);
    } else {
        console.error('One or more required DOM elements for ZIP functionality not found!');
        if (!downloadAllZipButton) console.error('download-all-zip-button not found!');
        if (!loadingOverlay) console.error('loading-overlay not found!');
        if (!progressBar) console.error('progress-bar not found!');
        if (!progressPercentage) console.error('progress-percentage not found!');
        if (!consoleLog) console.error('console-log not found!');
        if (!loadingMessageDisplay) console.error('h2 for loading message not found!');
    }

    // Start the asset loading process
    loadAllAssetsFromUnifiedSource();
});