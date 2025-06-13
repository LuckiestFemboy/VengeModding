// asset-list-page.js

// DOM Elements
let searchInput;
let allCards;
// Store a global list of all assets fetched to be used for zipping
const allAssets = [];

// DOM elements for loading/progress
let loadingOverlay;
let progressBar;
let progressPercentage;
let consoleLog;
let downloadAllZipButton; // Ensure this is also declared

// Card Creation
function createAndAppendCard(folder, filename, type) {
    // Create main card element
    const card = document.createElement('div');
    card.className = 'texture-card';
    card.style.display = 'block';
    card.style.visibility = 'visible';
    card.style.opacity = '1';

    let mediaPath; // Declare mediaPath here, as it's used by both branches

    // Add asset to the global list for zipping
    allAssets.push({ folder, filename, type });


    if (type.toLowerCase() === 'mp3') {
        card.className += ' mp3'; // Add mp3 class for specific styling
        mediaPath = `./mod-assets/${type.toLowerCase()}/${filename}`;

        // Create elements for the consolidated MP3 card layout
        const playIcon = document.createElement('i');
        playIcon.className = 'fas fa-play media-icon'; // Keep original class for icon styling
        playIcon.onclick = () => playAudio(mediaPath);

        const mp3FilenameDisplay = document.createElement('div');
        mp3FilenameDisplay.className = 'mp3-filename-display';
        mp3FilenameDisplay.textContent = filename;

        const folderNumberButton = document.createElement('button');
        folderNumberButton.className = 'folder-number-button';
        folderNumberButton.textContent = `Folder: ${folder}`;
        folderNumberButton.onclick = () => {
            navigator.clipboard.writeText(folder).then(() => {
                showNotification(`Copied folder number: ${folder}`);
            }).catch(err => {
                console.error('Failed to copy folder number: ', err);
            });
        };

        const buttonsWrapper = document.createElement('div');
        buttonsWrapper.className = 'card-buttons-wrapper';

        // Original "Copy Folder" button for consistency
        const copyFolderButton = document.createElement('button');
        copyFolderButton.className = 'card-button copy-button';
        copyFolderButton.innerHTML = '<i class="far fa-copy"></i> Copy Folder';
        copyFolderButton.onclick = () => {
            navigator.clipboard.writeText(folder).then(() => {
                showNotification(`Copied folder number: ${folder}`);
            }).catch(err => {
                console.error('Failed to copy folder number: ', err);
            });
        };
        buttonsWrapper.appendChild(copyFolderButton);


        // Download button
        const downloadButton = document.createElement('button');
        downloadButton.className = 'card-button download-button';
        downloadButton.innerHTML = '<i class="fas fa-download"></i> Download';
        downloadButton.onclick = () => {
            fetch(mediaPath)
                .then(response => response.blob())
                .then(blob => {
                    saveAs(blob, filename); // Uses FileSaver.js
                    showNotification(`Downloading ${filename}`);
                })
                .catch(e => {
                    console.error("Error downloading file:", e);
                    alert(`Failed to download ${filename}.`);
                });
        };
        buttonsWrapper.appendChild(downloadButton);


        // Append consolidated elements to the card
        card.appendChild(playIcon);
        card.appendChild(mp3FilenameDisplay);
        card.appendChild(folderNumberButton); // Add the folder number button
        card.appendChild(buttonsWrapper);

    } else { // Handle image files (png, jpg)
        const mediaContainer = document.createElement('div');
        mediaContainer.className = 'media-container';
        mediaPath = `./mod-assets/${type.toLowerCase()}/${filename}`;

        const img = document.createElement('img');
        img.src = mediaPath;
        img.alt = filename;
        img.loading = 'lazy'; // Lazy load images
        img.onerror = () => {
            img.src = './mod-assets/placeholder.png'; // Fallback for broken images
            img.classList.add('error-image');
            console.warn(`Failed to load image: ${mediaPath}. Using placeholder.`);
        };
        mediaContainer.appendChild(img);
        card.appendChild(mediaContainer);

        const info = document.createElement('div');
        info.className = 'texture-info';
        info.textContent = filename;
        card.appendChild(info);

        const folderNumberButton = document.createElement('button');
        folderNumberButton.className = 'folder-number-button';
        folderNumberButton.textContent = `Folder: ${folder}`; // Display the folder number
        folderNumberButton.onclick = () => {
            navigator.clipboard.writeText(folder).then(() => {
                showNotification(`Copied folder number: ${folder}`);
            }).catch(err => {
                console.error('Failed to copy folder number: ', err);
            });
        };
        card.appendChild(folderNumberButton);


        const buttonsWrapper = document.createElement('div');
        buttonsWrapper.className = 'card-buttons-wrapper';

        // Copy Folder button
        const copyFolderButton = document.createElement('button');
        copyFolderButton.className = 'card-button copy-button';
        copyFolderButton.innerHTML = '<i class="far fa-copy"></i> Copy Folder';
        copyFolderButton.onclick = () => {
            navigator.clipboard.writeText(folder).then(() => {
                showNotification(`Copied folder number: ${folder}`);
            }).catch(err => {
                console.error('Failed to copy folder number: ', err);
            });
        };
        buttonsWrapper.appendChild(copyFolderButton);

        // Download button
        const downloadButton = document.createElement('button');
        downloadButton.className = 'card-button download-button';
        downloadButton.innerHTML = '<i class="fas fa-download"></i> Download';
        downloadButton.onclick = () => {
            fetch(mediaPath)
                .then(response => response.blob())
                .then(blob => {
                    saveAs(blob, filename); // Uses FileSaver.js
                    showNotification(`Downloading ${filename}`);
                })
                .catch(e => {
                    console.error("Error downloading file:", e);
                    alert(`Failed to download ${filename}.`);
                });
        };
        buttonsWrapper.appendChild(downloadButton);

        card.appendChild(buttonsWrapper);
    }
    document.getElementById('texture-grid').appendChild(card);
}

// Search functionality
function filterCards() {
    const searchTerm = searchInput.value.toLowerCase();
    allCards.forEach(card => {
        const filename = card.querySelector('.texture-info, .mp3-filename-display')?.textContent.toLowerCase() || '';
        const folderNumber = card.querySelector('.folder-number-button')?.textContent.toLowerCase() || '';
        if (filename.includes(searchTerm) || folderNumber.includes(searchTerm.replace('folder: ', ''))) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Clear search
function clearSearch() {
    searchInput.value = '';
    filterCards(); // Show all cards again
}

// Play Audio
function playAudio(audioPath) {
    const audio = new Audio(audioPath);
    audio.play().catch(e => console.error("Error playing audio:", e));
}

// Show temporary notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('show');
    }, 10); // Small delay to trigger CSS transition
    setTimeout(() => {
        notification.classList.remove('show');
        notification.addEventListener('transitionend', () => notification.remove());
    }, 2000); // Notification disappears after 2 seconds
}


// Initialize Gallery and fetch lists
async function initializeGallery() {
    const textureGrid = document.getElementById('texture-grid');
    if (!textureGrid) {
        console.error('Texture grid element not found!');
        return;
    }
    textureGrid.innerHTML = ''; // Clear existing content

    const fileLists = {
        png: 'pnglist.txt',
        jpg: 'jpgurl.txt',
        mp3: 'mp3list.txt'
    };

    for (const type in fileLists) {
        try {
            const response = await fetch(fileLists[type]);
            if (!response.ok) {
                console.warn(`Could not load ${fileLists[type]}. Skipping.`);
                continue;
            }
            const text = await response.text();
            const lines = text.split('\n').filter(line => line.trim() !== '');

            lines.forEach(line => {
                const parts = line.trim().split(' ');
                if (parts.length >= 2) {
                    const folder = parts[0];
                    const filename = parts.slice(1).join(' '); // Re-join filename in case it had spaces
                    createAndAppendCard(folder, filename, type);
                }
            });
        } catch (error) {
            console.error(`Error fetching or parsing ${fileLists[type]}:`, error);
        }
    }
    allCards = document.querySelectorAll('.texture-card'); // Update allCards after loading
}


// ZIP Generation
async function generateZip() {
    downloadAllZipButton.disabled = true;
    downloadAllZipButton.textContent = 'Generating...';
    loadingOverlay.classList.add('active');
    progressBar.style.width = '0%';
    progressPercentage.textContent = '0%';
    consoleLog.textContent = ''; // Clear previous console log

    const zip = new JSZip();
    let filesProcessed = 0;
    const totalFiles = allAssets.length;

    consoleLog.textContent += 'Starting ZIP generation...\n';

    // Create the top-level folder structure
    const baseFolder = zip.folder("Venge Client").folder("Resource Swapper").folder("files");
    const assetsFolder = baseFolder.folder("assets");

    for (const asset of allAssets) {
        const { folder, filename, type } = asset;
        const mediaPath = `./mod-assets/${type.toLowerCase()}/${filename}`;
        const zipPath = `${folder}/1/${filename}`; // This path is relative to the assets folder

        try {
            const response = await fetch(mediaPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            assetsFolder.file(zipPath, blob); // Add to the assets subfolder within the base structure

            filesProcessed++;
            const progress = Math.floor((filesProcessed / totalFiles) * 100);
            progressBar.style.width = `${progress}%`;
            progressPercentage.textContent = `${progress}%`;
            consoleLog.textContent += `Added: ${zipPath}\n`;
            consoleLog.scrollTop = consoleLog.scrollHeight; // Scroll to bottom
        } catch (error) {
            console.error(`Failed to add ${mediaPath} to zip:`, error);
            consoleLog.textContent += `[ERROR] Failed to add: ${zipPath} - ${error.message}\n`;
            consoleLog.scrollTop = consoleLog.scrollHeight;
        }
    }

    try {
        const content = await zip.generateAsync({ type: "blob" }, function updateCallback(metadata) {
            // This callback can be used for more granular progress if needed,
            // but our file-by-file progress is already updating the bar.
            // For now, we'll just log final progress.
            if (metadata.percent) {
                 // console.log(`ZIP progress: ${metadata.percent.toFixed(2)}%`);
            }
        });
        saveAs(content, "Venge_Client_Mod_Pack.zip");
        consoleLog.textContent += `\nSuccessfully created "Venge_Client_Mod_Pack.zip" and started download!\n`;
        consoleLog.scrollTop = consoleLog.scrollHeight;
    } catch (error) {
        console.error("Error generating or saving zip:", error);
        downloadAllZipButton.textContent = 'Download Failed!';
        consoleLog.textContent += `\n[FATAL ERROR] Failed to generate or save ZIP: ${error.message}\n`;
        consoleLog.scrollTop = consoleLog.scrollHeight;
        alert('Failed to generate or save the ZIP file. Please check console for errors.');
    } finally {
        // Keep overlay visible for a bit to show final message, then hide
        setTimeout(() => {
            loadingOverlay.classList.remove('active');
            downloadAllZipButton.textContent = 'Download All as ZIP';
            downloadAllZipButton.disabled = false;
        }, 3000); // Hide after 3 seconds
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Assign DOM elements
    searchInput = document.getElementById('texture-search');
    downloadAllZipButton = document.getElementById('download-all-zip-button'); // Correctly assign here
    loadingOverlay = document.getElementById('loading-overlay');
    progressBar = document.getElementById('progress-bar');
    progressPercentage = document.getElementById('progress-percentage');
    consoleLog = document.getElementById('console-log');


    // Add event listeners
    if (searchInput) {
        searchInput.addEventListener('keyup', filterCards);
    }
    const searchButton = document.getElementById('search-button');
    if (searchButton) {
        searchButton.addEventListener('click', filterCards);
    }
    const clearSearchButton = document.getElementById('clear-search-button');
    if (clearSearchButton) {
        clearSearchButton.addEventListener('click', clearSearch);
    }

    // Initialize the gallery
    initializeGallery();

    if (downloadAllZipButton && loadingOverlay && progressBar && progressPercentage && consoleLog) {
        downloadAllZipButton.addEventListener('click', generateZip);
    } else {
        console.error('One or more required DOM elements for ZIP functionality not found!');
        if (!downloadAllZipButton) console.error('download-all-zip-button not found!');
        if (!loadingOverlay) console.error('loading-overlay not found!');
        if (!progressBar) console.error('progress-bar not found!');
        if (!progressPercentage) console.error('progress-percentage not found!');
        if (!consoleLog) console.error('console-log not found!');
    }
});