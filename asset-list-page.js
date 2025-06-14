// asset-list-page.js
// This file manages the display, search, and interaction of assets on the main page.

// DOM Elements
let searchInput;
let allCards; // This will hold all the HTML card elements
let editGroupButton; // Button for group editing
let unselectAllButton; // Button for unselecting all

// Store a global list of all assets fetched to be used for zipping and editing.
// Each asset object will now also store its Blob data and modification status.
const allAssets = [];

// Array to store currently selected asset objects
const selectedAssets = [];

// DOM elements for loading/progress
let loadingOverlay;
let progressBar;
let progressPercentage;
let consoleLog;
let downloadAllZipButton;


document.addEventListener('DOMContentLoaded', async () => {
    // Get DOM elements after the content is loaded
    searchInput = document.getElementById('texture-search');
    downloadAllZipButton = document.getElementById('download-all-zip-button');
    loadingOverlay = document.getElementById('loading-overlay');
    progressBar = document.getElementById('progress-bar');
    progressPercentage = document.getElementById('progress-percentage');
    consoleLog = document.getElementById('console-log');
    // CONFIRM THESE TWO LINES ARE EXACTLY AS SHOWN AND ARE IN THIS BLOCK
    editGroupButton = document.getElementById('edit-group-button'); // Get the new button
    unselectAllButton = document.getElementById('unselect-all-button'); // Get the new button
    // Initial load of assets
    await fetchAssets();

    // Event Listeners
    document.getElementById('search-button').addEventListener('click', filterCards);
    document.getElementById('clear-search-button').addEventListener('click', clearSearch);
    searchInput.addEventListener('input', filterCards); // Real-time search

    if (downloadAllZipButton) {
        downloadAllZipButton.addEventListener('click', downloadAllAssetsAsZip);
    } else {
        console.error('Download All button not found!');
    }

    // Event Listeners for group actions
    if (editGroupButton) {
        editGroupButton.addEventListener('click', handleEditGroup);
        // Initially disable the button
        editGroupButton.disabled = true;
    } else {
        console.error('Edit Group button not found!');
    }

    if (unselectAllButton) {
        unselectAllButton.addEventListener('click', unselectAllCards);
        // Initially disable the button
        unselectAllButton.disabled = true;
    } else {
        console.error('Unselect All button not found!');
    }

    // Global function to update a card's visual state from asset-editor-modal.js
    window.updateCardVisualState = updateCardVisualState;
});


/**
 * Fetches asset lists from server and populates the grid.
 * Proactively fetches image blobs for PNG/JPG.
 */
async function fetchAssets() {
    try {
        // Fetch image list
        const jpgResponse = await fetch('jpgurl.txt');
        const jpgText = await jpgResponse.text();
        const jpgAssets = jpgText.split('\n').filter(line => line.trim() !== '').map(line => {
            const [folder, filename] = line.trim().split(' ').slice(0, 2); // Take first two parts
            return { folder, filename, type: 'JPG' };
        });

        const pngResponse = await fetch('pnglist.txt');
        const pngText = await pngResponse.text();
        const pngAssets = pngText.split('\n').filter(line => line.trim() !== '').map(line => {
            const [folder, filename] = line.trim().split(' ').slice(0, 2); // Take first two parts
            return { folder, filename, type: 'PNG' };
        });

        // Fetch audio list
        const mp3Response = await fetch('mp3list.txt');
        const mp3Text = await mp3Response.text();
        const mp3Assets = mp3Text.split('\n').filter(line => line.trim() !== '').map(line => {
            const [folder, filename] = line.trim().split(' ').slice(0, 2); // Take first two parts
            return { folder, filename, type: 'MP3' };
        });

        // Combine all assets
        let combinedAssets = [...jpgAssets, ...pngAssets, ...mp3Assets];

        // --- FIX: Implement stable sorting by type and then filename ---
        combinedAssets.sort((a, b) => {
            const typeOrder = { 'JPG': 1, 'PNG': 2, 'MP3': 3 };
            const orderA = typeOrder[a.type];
            const orderB = typeOrder[b.type];

            if (orderA !== orderB) {
                return orderA - orderB; // Sort by type priority
            }
            // If types are the same, sort by filename for consistent order
            return a.filename.localeCompare(b.filename);
        });
        // --- END FIX ---


        const textureGrid = document.getElementById('texture-grid');
        if (!textureGrid) {
            console.error('Texture grid element not found!');
            return;
        }

        const fetchPromises = combinedAssets.map(assetData => {
            const asset = createAndAppendCard(assetData.folder, assetData.filename, assetData.type);
            // Proactively fetch image data for JPG/PNG when the card is created
            if (asset.type === 'JPG' || asset.type === 'PNG') {
                return fetch(asset.mediaPath)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status} for ${asset.mediaPath}`);
                        }
                        return response.blob();
                    })
                    .then(blob => {
                        asset.originalImageBlob = blob;
                    })
                    .catch(error => {
                        console.error(`Error fetching original blob for ${asset.filename}:`, error);
                        asset.fetchError = true; // Mark asset as having a fetch error
                    });
            }
            return Promise.resolve(); // For MP3s, resolve immediately
        });

        // Wait for all images to be fetched (or fail)
        await Promise.allSettled(fetchPromises);
        console.log('All assets processed and initial image blobs fetched.');

        // Initialize allCards after all assets are created
        allCards = document.querySelectorAll('.texture-card');

    } catch (error) {
        console.error('Error fetching asset lists:', error);
    }
}

/**
 * Creates a texture card element and appends it to the grid.
 * Initializes asset object with blob storage and selection state.
 * @param {string} folder The folder name (ID) of the asset.
 * @param {string} filename The filename of the asset.
 * @param {string} type The type of asset (e.g., 'JPG', 'PNG', 'MP3').
 * @returns {Object} The created asset object with its card reference.
 */
function createAndAppendCard(folder, filename, type) {
    const card = document.createElement('div');
    card.className = 'texture-card';
    card.style.display = 'block';
    card.style.visibility = 'visible';
    card.style.opacity = '1';

    const mediaPath = `./mod-assets/${type.toLowerCase()}/${filename}`;

    // Create asset object and add to the global list for zipping
    // Initialize modification flags and blob storage
    const asset = {
        folder,
        filename,
        type,
        mediaPath,
        originalImageBlob: null, // Will store the fetched Blob of the original image
        modifiedImageBlob: null, // Will store Blob of modified image
        newImageBlob: null,      // Will store Blob of newly created image
        isModified: false,       // Flag if modifiedImageBlob exists
        isNew: false,            // Flag if newImageBlob exists
        cardElement: card,       // Store a reference to the card DOM element
        isSelected: false        // New: Selection state
    };
    allAssets.push(asset);

    // Add checkbox for selection
    const checkboxContainer = document.createElement('div');
    checkboxContainer.className = 'card-checkbox-container';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'card-select-checkbox';
    // CONFIRM THIS EVENT LISTENER IS EXACTLY AS SHOWN
    checkbox.addEventListener('change', (e) => toggleCardSelection(asset, e.target.checked));
    checkboxContainer.appendChild(checkbox);
    card.appendChild(checkboxContainer);


    if (type.toLowerCase() === 'mp3') {
        card.className += ' mp3'; // Add mp3 class for specific styling

        card.innerHTML += `
            <div class="card-content">
                <i class="fas fa-music media-icon"></i>
                <p class="mp3-filename-display">${filename}</p>
                <button class="folder-number-button">Folder: ${folder}</button>
            </div>
            <div class="mp3-buttons-wrapper">
                <button class="copy-folder-button">Copy Folder Number</button>
                <button class="download-button">Download</button>
            </div>
        `;

        card.querySelector('.copy-folder-button').addEventListener('click', () => copyToClipboard(folder, 'Folder number copied!'));
        card.querySelector('.download-button').addEventListener('click', () => downloadAsset(asset));
        card.querySelector('.mp3-filename-display').addEventListener('click', () => playAudio(mediaPath)); // Play audio on filename click

    } else { // JPG or PNG
        card.innerHTML += `
            <div class="media-container">
                <img src="${mediaPath}" alt="${filename}" class="media-image" loading="lazy">
            </div>
            <div class="texture-info">
                <div class="file-info">
                    <p class="texture-filename">${filename}</p>
                    <p class="texture-name">Folder: ${folder}</p>
                </div>
                <div class="buttons-container">
                    <button class="edit-asset-button">Edit</button>
                    <button class="copy-button">Copy Filename</button>
                    <button class="download-button">Download</button>
                </div>
            </div>
        `;

        // Event listeners for image specific actions
        card.querySelector('.copy-button').addEventListener('click', () => copyToClipboard(filename, 'Filename copied!'));
        card.querySelector('.download-button').addEventListener('click', () => downloadAsset(asset));
        card.querySelector('.edit-asset-button').addEventListener('click', () => {
            // Pass the asset object directly to the modal for single editing
            if (typeof window.openAssetEditorModal === 'function') {
                window.openAssetEditorModal(asset, card, false); // false for single edit
            } else {
                console.error('openAssetEditorModal function not found.');
            }
        });

        // Add an onerror handler for images to show a placeholder if load fails
        const imgElement = card.querySelector('.media-image');
        imgElement.onerror = () => {
            // Replace img with a placeholder div
            const placeholder = document.createElement('div');
            placeholder.className = 'media-placeholder';
            placeholder.innerHTML = `
                <i class="fas fa-exclamation-triangle media-icon"></i>
                <span class="media-filename">${filename}</span>
                <span>(Image Not Found)</span>
            `;
            imgElement.replaceWith(placeholder);
        };
    }

    document.getElementById('texture-grid').appendChild(card);
    return asset;
}

/**
 * Toggles the selection state of a card.
 * @param {Object} asset The asset object corresponding to the card.
 * @param {boolean} isSelected The new selection state.
 */
function toggleCardSelection(asset, isSelected) {
    asset.isSelected = isSelected;
    // CONFIRM THIS CALL IS PRESENT
    updateCardVisualState(asset); // Update visual state immediately

    // Add/remove from selectedAssets array
    const index = selectedAssets.indexOf(asset);
    if (isSelected && index === -1) {
        selectedAssets.push(asset);
    } else if (!isSelected && index !== -1) {
        selectedAssets.splice(index, 1);
    }

    // CONFIRM THIS CALL IS PRESENT
    // Update the state of "Edit Group" and "Unselect All" buttons
    updateGroupActionButtons();
}

/**
 * Updates the disabled state of "Edit Group" and "Unselect All" buttons.
 */
function updateGroupActionButtons() {
    const hasImageSelected = selectedAssets.some(asset => asset.type === 'JPG' || asset.type === 'PNG');
    const hasAnySelected = selectedAssets.length > 0;

    if (editGroupButton) {
        // "Edit Group" only enabled if at least one image is selected
        editGroupButton.disabled = !hasImageSelected;
    }
    if (unselectAllButton) {
        // "Unselect All" enabled if any asset is selected
        unselectAllButton.disabled = !hasAnySelected;
    }
}

/**
 * Handles the click event for the "Edit Group" button.
 * Opens the asset editor modal with selected image assets.
 */
function handleEditGroup() {
    const imagesToEdit = selectedAssets.filter(asset => asset.type === 'JPG' || asset.type === 'PNG');
    if (imagesToEdit.length > 0) {
        if (typeof window.openAssetEditorModal === 'function') {
            window.openAssetEditorModal(imagesToEdit, null, true); // true for group edit
        } else {
            console.error('openAssetEditorModal function not found.');
        }
    } else {
        alert('Please select at least one image asset to edit.');
        console.warn('Edit Group button clicked without any image assets selected.');
    }
}

/**
 * Unselects all currently selected cards.
 */
function unselectAllCards() {
    // Iterate over a copy of the array because toggleCardSelection modifies it
    [...selectedAssets].forEach(asset => {
        const checkbox = asset.cardElement.querySelector('.card-select-checkbox');
        if (checkbox) {
            checkbox.checked = false; // Uncheck the visual checkbox
        }
        // Call toggleCardSelection with false to ensure internal state and visual are updated
        toggleCardSelection(asset, false);
    });
    // selectedAssets array will be empty after the loop due to toggleCardSelection calls
    updateGroupActionButtons(); // Ensure buttons are disabled
}

/**
 * Updates the visual state of a card (e.g., highlight, filename, image source).
 * This function is exposed globally for `asset-editor-modal.js` to call.
 * @param {Object} asset The asset object whose card needs updating.
 */
function updateCardVisualState(asset) {
    const card = asset.cardElement;
    if (!card) return;

    // Apply/remove selected-card class based on isSelected
    if (asset.isSelected) {
        card.classList.add('selected-card');
    } else {
        card.classList.remove('selected-card');
    }

    // Get references to elements that might need updates
    const mediaImage = card.querySelector('.media-image');
    const textureFilenameDisplay = card.querySelector('.texture-filename') || card.querySelector('.mp3-filename-display');
    const mediaPlaceholder = card.querySelector('.media-placeholder');

    if (asset.type === 'JPG' || asset.type === 'PNG') {
        // Update image source if it has been modified or newly created
        let newSrc = null; // To hold the URL for the image source
        let isBlobUrl = false;

        if (asset.newImageBlob) {
            newSrc = URL.createObjectURL(asset.newImageBlob);
            isBlobUrl = true;
            card.classList.add('is-new'); // Add class for new textures
            card.classList.remove('is-modified'); // Ensure it's not marked as modified
        } else if (asset.modifiedImageBlob) {
            newSrc = URL.createObjectURL(asset.modifiedImageBlob);
            isBlobUrl = true;
            card.classList.add('is-modified'); // Add class for modified textures
            card.classList.remove('is-new'); // Ensure it's not marked as new
        } else {
            // If neither new nor modified, ensure it shows original and remove classes
            newSrc = asset.originalImageBlob ? URL.createObjectURL(asset.originalImageBlob) : asset.mediaPath;
            isBlobUrl = !!asset.originalImageBlob; // true if originalImageBlob exists
            card.classList.remove('is-modified', 'is-new');
        }

        if (mediaImage) {
            // Revoke previous blob URL if it was one, to prevent memory leaks
            if (mediaImage.src.startsWith('blob:') && mediaImage.src !== newSrc) {
                URL.revokeObjectURL(mediaImage.src);
            }
            mediaImage.src = newSrc;
        } else if (mediaPlaceholder && newSrc) {
            // If there was a placeholder, replace it with the new/modified/original image
            const newImg = document.createElement('img');
            newImg.className = 'media-image';
            newImg.src = newSrc;
            newImg.alt = asset.filename;
            newImg.loading = 'lazy';
            mediaPlaceholder.replaceWith(newImg);
            // After replacing, ensure to add error handling for the new image element
            newImg.onerror = () => {
                const updatedPlaceholder = document.createElement('div');
                updatedPlaceholder.className = 'media-placeholder';
                updatedPlaceholder.innerHTML = `
                    <i class="fas fa-exclamation-triangle media-icon"></i>
                    <span class="media-filename">${asset.filename}</span>
                    <span>(Image Not Found)</span>
                `;
                newImg.replaceWith(updatedPlaceholder);
                if (isBlobUrl) URL.revokeObjectURL(newSrc); // Revoke if it was a blob URL
            };
        }
        // If a new blob URL was created, it will be revoked when a new src is set or when the card is removed.
    }

    // Update filename display if needed (e.g., if we later implement renaming)
    if (textureFilenameDisplay && textureFilenameDisplay.textContent !== asset.filename) {
        textureFilenameDisplay.textContent = asset.filename;
    }
}


/**
 * Filters the displayed cards based on the search input.
 */
function filterCards() {
    const searchTerm = searchInput.value.toLowerCase();
    allAssets.forEach(asset => {
        const card = asset.cardElement;
        const filenameLower = asset.filename.toLowerCase();
        const folderLower = asset.folder.toLowerCase();

        if (filenameLower.includes(searchTerm) || folderLower.includes(searchTerm)) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.visibility = 'visible';
                card.style.opacity = '1';
            }, 50); // Small delay for fade-in effect
        } else {
            card.style.visibility = 'hidden';
            card.style.opacity = '0';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300); // Wait for fade-out before setting display: none
        }
    });
}

/**
 * Clears the search input and shows all cards.
 */
function clearSearch() {
    searchInput.value = '';
    filterCards(); // Call filterCards with empty search term to show all
}


/**
 * Copies text to the clipboard and shows a temporary message.
 * @param {string} text The text to copy.
 * @param {string} message The message to display.
 */
function copyToClipboard(text, message) {
    navigator.clipboard.writeText(text).then(() => {
        showTemporaryMessage(message);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        showTemporaryMessage('Failed to copy!', true);
    });
}

/**
 * Displays a temporary message at the bottom of the screen.
 * @param {string} message The message to display.
 * @param {boolean} isError If true, displays an error style.
 */
function showTemporaryMessage(message, isError = false) {
    let messageElement = document.getElementById('temp-message');
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'temp-message';
        document.body.appendChild(messageElement);
    }

    messageElement.textContent = message;
    messageElement.className = 'temp-message ' + (isError ? 'error' : 'success'); // Apply classes
    messageElement.style.opacity = '1';
    messageElement.style.transform = 'translateY(0)';

    setTimeout(() => {
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(20px)';
    }, 3000); // Message disappears after 3 seconds
}

/**
 * Downloads a single asset.
 * @param {Object} asset The asset object to download.
 */
function downloadAsset(asset) {
    let blobToDownload;
    let filenameToUse = asset.filename; // Default filename

    // Prioritize newBlob > modifiedBlob > originalBlob > fetch from mediaPath
    if (asset.newImageBlob) {
        blobToDownload = asset.newImageBlob;
        // If a new image, consider adding "new_" prefix or similar if desirable
        // filenameToUse = `new_${asset.filename}`;
    } else if (asset.modifiedImageBlob) {
        blobToDownload = asset.modifiedImageBlob;
        // filenameToUse = `mod_${asset.filename}`;
    } else if (asset.originalImageBlob) {
        blobToDownload = asset.originalImageBlob;
    }

    if (blobToDownload) {
        saveAs(blobToDownload, filenameToUse);
        showTemporaryMessage(`Downloading ${filenameToUse}...`);
    } else {
        // Fallback: If no blob is present (e.g., MP3s, or image fetch failed), try to fetch it directly
        fetch(asset.mediaPath)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.blob();
            })
            .then(blob => {
                // If it's an image and originalImageBlob was missing, store it now
                if ((asset.type === 'JPG' || asset.type === 'PNG') && !asset.originalImageBlob) {
                    asset.originalImageBlob = blob;
                }
                saveAs(blob, filenameToUse);
                showTemporaryMessage(`Downloading ${filenameToUse}...`);
            })
            .catch(error => {
                console.error(`Error downloading ${asset.filename}:`, error);
                showTemporaryMessage(`Failed to download ${asset.filename}!`, true);
            });
    }
}


/**
 * Plays an audio asset.
 * @param {string} audioPath The path to the audio file.
 */
function playAudio(audioPath) {
    const audio = new Audio(audioPath);
    audio.play().catch(error => {
        console.error('Error playing audio:', error);
        showTemporaryMessage('Failed to play audio. Check console for details.', true);
    });
}


/**
 * Downloads all assets as a single ZIP file.
 * Prioritizes modified/new blobs over original fetched blobs or direct path.
 */
async function downloadAllAssetsAsZip() {
    if (!JSZip || !saveAs) {
        console.error('JSZip or FileSaver.js not loaded.');
        showTemporaryMessage('ZIP functionality not available.', true);
        return;
    }

    if (!downloadAllZipButton || !loadingOverlay || !progressBar || !progressPercentage || !consoleLog) {
        console.error('One or more required DOM elements for ZIP functionality not found!');
        return;
    }

    downloadAllZipButton.disabled = true;
    downloadAllZipButton.textContent = 'Preparing ZIP...';
    loadingOverlay.classList.add('active');
    progressBar.style.width = '0%';
    progressPercentage.textContent = '0%';
    consoleLog.textContent = 'Starting ZIP generation...\n';
    consoleLog.scrollTop = consoleLog.scrollHeight;

    const zip = new JSZip();
    let assetsProcessed = 0;
    const totalAssets = allAssets.length;

    try {
        for (const asset of allAssets) {
            let fileBlob = null;
            let finalFilename = asset.filename; // Use original filename for ZIP

            // Prioritize new blobs, then modified, then original pre-fetched blobs
            if (asset.newImageBlob) {
                fileBlob = asset.newImageBlob;
            } else if (asset.modifiedImageBlob) {
                fileBlob = asset.modifiedImageBlob;
            } else if (asset.originalImageBlob) { // This will be null for MP3s unless they are fetched below
                fileBlob = asset.originalImageBlob;
            }

            if (fileBlob) {
                zip.file(`${asset.type.toLowerCase()}-assets/${asset.folder}/${finalFilename}`, fileBlob);
                consoleLog.textContent += `Added (blob) ${asset.folder}/${finalFilename}\n`;
            } else {
                // Fallback: If no blob is available (e.g., MP3s not pre-fetched, or initial image fetch failed), fetch it now
                try {
                    const response = await fetch(asset.mediaPath);
                    if (!response.ok) {
                        throw new Error(`HTTP status ${response.status}`);
                    }
                    const blob = await response.blob();
                    // If it's an image and originalImageBlob was missing, store it now
                    if ((asset.type === 'JPG' || asset.type === 'PNG') && !asset.originalImageBlob) {
                        asset.originalImageBlob = blob;
                    }
                    zip.file(`${asset.type.toLowerCase()}-assets/${asset.folder}/${finalFilename}`, blob);
                    consoleLog.textContent += `Added (fetched) ${asset.folder}/${finalFilename}\n`;
                } catch (fetchError) {
                    console.error(`Failed to fetch ${asset.mediaPath}: ${fetchError.message}`);
                    consoleLog.textContent += `Failed to add ${asset.folder}/${finalFilename} (Error: ${fetchError.message})\n`;
                }
            }

            assetsProcessed++;
            const progress = (assetsProcessed / totalAssets) * 100;
            progressBar.style.width = `${progress}%`;
            progressPercentage.textContent = `${progress.toFixed(1)}%`;
            consoleLog.scrollTop = consoleLog.scrollHeight;
        }

        consoleLog.textContent += '\nCompressing files...\n';
        consoleLog.scrollTop = consoleLog.scrollHeight;

        const zipBlob = await zip.generateAsync({ type: 'blob' }, function updateCallback(metadata) {
            const progress = metadata.percent;
            progressBar.style.width = `${progress}%`;
            progressPercentage.textContent = `${progress.toFixed(1)}%`;
            if (metadata.currentFile) {
                consoleLog.textContent += `Compressing: ${metadata.currentFile}\n`;
                consoleLog.scrollTop = consoleLog.scrollHeight;
            }
        });

        consoleLog.textContent += '\nZIP file generated. Saving...\n';
        consoleLog.scrollTop = consoleLog.scrollHeight;

        saveAs(zipBlob, 'mod-assets.zip');
        showTemporaryMessage('All assets downloaded as ZIP!');
        consoleLog.textContent += '\nDownload Complete!';
        consoleLog.scrollTop = consoleLog.scrollHeight;

    } catch (error) {
        console.error('Error generating ZIP:', error);
        showTemporaryMessage('Download Failed!', true);
        progressBar.style.width = '0%'; // Reset progress bar on error
        progressPercentage.textContent = 'Error!';
        consoleLog.textContent += `\n[FATAL ERROR] Failed to generate or save ZIP: ${error.message}\n`;
        consoleLog.scrollTop = consoleLog.scrollHeight;
    } finally {
        // Keep overlay visible for a bit to show final message, then hide
        setTimeout(() => {
            loadingOverlay.classList.remove('active');
            downloadAllZipButton.textContent = 'Download All as ZIP';
            downloadAllZipButton.disabled = false;
        }, 3000); // Hide after 3 seconds
    }
}