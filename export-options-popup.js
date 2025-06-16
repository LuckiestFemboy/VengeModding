// export-options-popup.js

// DOM Elements
let exportOptionsPopup;
let closeExportPopupButton;
let exportClientButton;
let exportBrowserButton;

document.addEventListener('DOMContentLoaded', () => {
    exportOptionsPopup = document.getElementById('export-options-popup');
    closeExportPopupButton = document.getElementById('close-export-popup');
    exportClientButton = document.getElementById('export-client-button');
    exportBrowserButton = document.getElementById('export-browser-button');

    if (exportOptionsPopup && closeExportPopupButton && exportClientButton && exportBrowserButton) {
        // Event listeners for closing the popup
        closeExportPopupButton.addEventListener('click', hideExportOptionsPopup);
        // Close popup if clicked outside content
        exportOptionsPopup.addEventListener('click', (event) => {
            if (event.target === exportOptionsPopup) {
                hideExportOptionsPopup();
            }
        });

        // Event listeners for export options
        exportClientButton.addEventListener('click', () => handleExport('client'));
        exportBrowserButton.addEventListener('click', () => handleExport('browser'));
    } else {
        console.error('One or more export options popup DOM elements not found!');
    }
});

// Function to show the export options popup
window.showExportOptionsPopup = () => {
    if (exportOptionsPopup) {
        exportOptionsPopup.classList.add('active');
    }
};

// Function to hide the export options popup
function hideExportOptionsPopup() {
    if (exportOptionsPopup) {
        exportOptionsPopup.classList.remove('active');
    }
}

// Function to handle the actual export process
async function handleExport(exportType) {
    hideExportOptionsPopup(); // Hide the export options popup

    if (typeof window.showLoadingOverlay === 'function') {
        window.showLoadingOverlay(); // Show the main loading overlay
    } else {
        console.error('showLoadingOverlay function not found in global scope. The loading window will not appear.');
        // Fallback: alert the user if the overlay cannot be shown
        alert('Starting ZIP creation process. Please wait...');
    }

    const zip = new JSZip();
    const totalAssets = window.allAssets ? window.allAssets.length : 0;
    let processedCount = 0;

    if (!window.allAssets || window.allAssets.length === 0) {
        window.updateLoadingProgress(0, 0, 'No assets to export. Finishing...');
        window.updateConsoleLog('No assets found for export. ZIP will be empty.');
        window.hideLoadingOverlayWithDelay(3000, 'Export Complete: No Assets');
        return;
    }

    window.updateLoadingProgress(0, totalAssets, `Starting ${exportType} export...`);
    window.updateConsoleLog(`Preparing ZIP for ${exportType} export with ${totalAssets} assets.`);

    for (const asset of window.allAssets) {
        try {
            let assetBlob = asset.newImageBlob || asset.originalImageBlob; // Use new blob if modified, else original
            let assetFilename = asset.filename;

            // Optional: If you need to convert specific image types for client/browser export
            // This example assumes you want all images as PNG in the ZIP for simplicity
            // if (exportType === 'client' && asset.type !== 'png') {
            //     window.updateConsoleLog(`Converting ${asset.filename} to PNG for client export...`);
            //     assetBlob = await window.convertImageBlob(assetBlob, 'image/png');
            //     assetFilename = asset.filename.replace(/\.[^/.]+$/, "") + '.png'; // Change extension
            // }

            if (assetBlob) {
                zip.file(asset.folder + '/' + assetFilename, assetBlob);
                window.updateConsoleLog(`Added ${asset.filename} to ZIP.`);
            } else {
                window.updateConsoleLog(`Skipping ${asset.filename}: No image data found.`);
            }
        } catch (error) {
            console.error(`Error processing asset ${asset.filename}:`, error);
            window.updateConsoleLog(`[ERROR] Failed to add ${asset.filename}: ${error.message}`);
        }

        processedCount++;
        window.updateLoadingProgress(processedCount, totalAssets, `Processing ${asset.filename}`);
    }

    window.updateConsoleLog('\nCompressing files...');
    try {
        const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
            const progress = Math.round(metadata.percent);
            window.updateLoadingProgress(processedCount, totalAssets, `Compressing ZIP: ${progress}%`);
            window.updateConsoleLog(`ZIP Compression Progress: ${progress}%`);
        });

        saveAs(content, `Venge_Export_${exportType}_${Date.now()}.zip`);
        window.updateConsoleLog('ZIP file generated and download started.');
        window.hideLoadingOverlayWithDelay(3000, 'Export Complete!');
    } catch (error) {
        console.error('Error generating ZIP:', error);
        window.updateConsoleLog(`[ERROR] ZIP generation failed: ${error.message}`);
        window.hideLoadingOverlayWithDelay(5000, 'Export Failed!');
    }
}

// Ensure global functions for loading overlay are accessible or defined if they don't exist
// These might already be in asset-list-page.js, but defining them here as fallback/clarity
// It's crucial that these functions are actually implemented in asset-list-page.js
// If they are not, you would need to add them to asset-list-page.js
if (typeof window.showLoadingOverlay === 'undefined') {
    window.showLoadingOverlay = () => {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    };
}

if (typeof window.updateLoadingProgress === 'undefined') {
    window.updateLoadingProgress = (processed, total, message) => {
        const progressBar = document.getElementById('progress-bar');
        const progressPercentage = document.getElementById('progress-percentage');
        const loadingMessageDisplay = document.querySelector('#loading-overlay h2');

        if (progressBar && progressPercentage && loadingMessageDisplay) {
            const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;
            progressBar.style.width = `${percentage}%`;
            progressPercentage.textContent = `${percentage}%`;
            loadingMessageDisplay.textContent = message;
        }
    };
}

if (typeof window.updateConsoleLog === 'undefined') {
    window.updateConsoleLog = (message) => {
        const consoleLog = document.getElementById('console-log');
        if (consoleLog) {
            consoleLog.textContent += message + '\n';
            consoleLog.scrollTop = consoleLog.scrollHeight; // Auto-scroll to bottom
        }
    };
}

if (typeof window.hideLoadingOverlayWithDelay === 'undefined') {
    window.hideLoadingOverlayWithDelay = (delay, finalMessage) => {
        const loadingMessageDisplay = document.querySelector('#loading-overlay h2');
        if (loadingMessageDisplay) {
            loadingMessageDisplay.textContent = finalMessage;
        }
        setTimeout(() => {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.classList.remove('active');
                // Optional: Clear console log after hiding
                const consoleLog = document.getElementById('console-log');
                if (consoleLog) {
                    consoleLog.textContent = '';
                }
            }
        }, delay);
    };
}