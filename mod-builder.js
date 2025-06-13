// mod-builder.js

// Define the texture groups and their associated files
const TEXTURE_GROUPS = [
    {
        name: "Walls Sierra",
        files: [
            "Wall-Texture-dirty.jpg",
            "Wall-Texture-v1.jpg",
            "Wall-Texture-Snow.jpg",
            "Wall-Texture.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Walls Tundra",
        files: [
            "Wall-Texture-4M-Dungeon.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Walls Mistle",
        files: [
            "Green-Wall.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Sierra Top Floor",
        files: [
            "Floor-Low.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Sierra Ground",
        files: [
            "Ground-Sand.png",
            "Sand-Corner.jpg",
            "Sierra-Grass.jpg",
            "Sierra-Road.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Sierra Temple Roof",
        files: [
            "Hallway-Texture.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Sierra Pillar",
        files: [
            "Pillar-Texture.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Mistle Pillar",
        files: [
            "Snake-Pillar.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Mistle Rock",
        files: [
            "rock_formation_01_wall_tile.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Xibalba Roof",
        files: [
            "floor_tile_01_metal.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Xibalba Cube",
        files: [
            "Xibalba_Cube_BaseColor.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Tundra Cube",
        files: [
            "Tundra_Cube_BaseColor.jpg"
        ],
        modifiable: false,
        canAdjustSaturation: false
    },
    {
        name: "Xibalba Walls & Buildings",
        files: [
            "dungeon_set_02_atlas_01.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Xibalba Floor Carve/Ornament",
        files: [
            "Floor-Ornament.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Tundra Building Floor",
        files: [
            "snake_temple_floor_01_tex.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Mistle Tunnel",
        files: [
            "Snake-Tunnel.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Tundra Ground",
        files: [
            "snowy_rock.jpg",
            "ice.jpg",
            "snow.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Xibalba Gravestone",
        files: [
            "T_PROP_gravestone_01_BC.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Sierra Roof Pillars",
        files: [
            "wall-trials1.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "All Maps Sky",
        files: [
            "wall-trials1.jpg",
            "FattySky00_Night_01.png",
            "FattySky00_Night_04.png",
            "FattySky00_Night_05.png",
            "FattySky00_Night_03.png",
            "FattySky00_Night_02.png",
            "FattySky00_Sunset_02.png",
            "FattySky00_Sunset_06.png",
            "FattySky00_Sunset_03.png",
            "FattySky00_Sunset_01.png",
            "FattySky00_Sunset_04.png",
            "FattySky00_Sunset_05.png",
            "FattySky00_Cloudy_06.png",
            "FattySky00_Cloudy_01.png",
            "FattySky00_Cloudy_03.png",
            "FattySky00_Cloudy_05.png",
            "FattySky00_Cloudy_02.png",
            "FattySky00_Cloudy_04.png",
            "FattySkybox03_Cloudy_01.png",
            "FattySkybox03_Cloudy_02.png",
            "FattySkybox03_Cloudy_04.png",
            "FattySkybox03_Cloudy_03.png",
            "FattySkybox03_Cloudy_06.png",
            "FattySkybox03_Cloudy_05.png",
            "FattySkybox03_Night_06.png",
            "FattySkybox03_Night_02.png",
            "FattySkybox03_Night_03.png",
            "FattySkybox03_Night_04.png",
            "FattySkybox03_Night_05.png",
            "FattySkybox03_Night_01.png",
            "FattySkybox03_Sunset_04.png",
            "FattySkybox03_Sunset_01.png",
            "FattySkybox03_Sunset_02.png",
            "FattySkybox03_Sunset_03.png",
            "FattySkybox03_Sunset_06.png",
            "FattySkybox03_Sunset_05.png",
            "FattySky00_Sunny_06.png",
            "FattySky00_Sunny_02.png",
            "FattySkybox03_Sunny_05.png",
            "FattySkybox03_Sunny_02.png",
            "FattySky00_Sunny_04.png",
            "FattySky00_Sunny_05.png",
            "FattySkybox03_Sunny_06.png",
            "FattySky00_Sunny_01.png",
            "FattySky00_Sunny_03.png",
            "FattySkybox03_Sunny_03.png",
            "FattySkybox03_Sunny_01.png",
            "FattySkybox03_Sunny_04.png",
            "FattySky00_Sunny_01.png"
        ],
        modifiable: true,
        canAdjustSaturation: true
    },
    {
        name: "Bounce Pad",
        files: [
            "BouncePad-Texture.jpg"
        ],
        modifiable: true,
        canAdjustSaturation: true
    }
];

// New DOM Elements for Mod Builder
let createModPackButton;
let modBuilderOverlay;
let modBuilderCloseButton;
let textureGroupList;
let customizationPanel;

// Function to show the mod builder overlay
function showModBuilder() {
    modBuilderOverlay.classList.add('active');
    renderTextureGroupList(); // Render the list when showing the builder
}

// Function to hide the mod builder overlay
function hideModBuilder() {
    modBuilderOverlay.classList.remove('active');
}

// Function to render the list of texture groups
function renderTextureGroupList() {
    textureGroupList.innerHTML = ''; // Clear previous list
    TEXTURE_GROUPS.forEach(group => {
        const groupButton = document.createElement('button');
        groupButton.textContent = group.name;
        groupButton.classList.add('mod-group-button'); // Add a class for styling
        if (!group.modifiable) {
            groupButton.classList.add('not-modifiable');
            groupButton.disabled = true; // Disable if not modifiable
            groupButton.title = "This group cannot be modified.";
        }
        groupButton.onclick = () => {
            // Placeholder for opening customization panel
            console.log(`Clicked on group: ${group.name}`);
            // In the next step, we'll replace this with actual panel display logic
        };
        textureGroupList.appendChild(groupButton);
    });
}

// Event listener for DOMContentLoaded to ensure elements are loaded
document.addEventListener('DOMContentLoaded', () => {
    // Assign new DOM elements
    createModPackButton = document.getElementById('create-mod-pack-button');
    modBuilderOverlay = document.getElementById('mod-builder-overlay');
    modBuilderCloseButton = modBuilderOverlay.querySelector('.mod-builder-close-button');
    textureGroupList = document.getElementById('texture-group-list');
    customizationPanel = document.getElementById('customization-panel');

    // Add event listeners for the new mod builder buttons
    if (createModPackButton && modBuilderOverlay && modBuilderCloseButton && textureGroupList) {
        createModPackButton.addEventListener('click', showModBuilder);
        modBuilderCloseButton.addEventListener('click', hideModBuilder);
    } else {
        console.error('One or more required DOM elements for Mod Builder not found!');
        if (!createModPackButton) console.error('create-mod-pack-button not found!');
        if (!modBuilderOverlay) console.error('mod-builder-overlay not found!');
        if (!modBuilderCloseButton) console.error('mod-builder-close-button not found!');
        if (!textureGroupList) console.error('texture-group-list not found!');
    }
});