document.addEventListener("DOMContentLoaded", () => {
    const generatePaletteBtn = document.getElementById("generatePaletteBtn");
    const orgIdentityInput = document.getElementById("orgIdentity");
    const paletteContainer = document.getElementById("paletteContainer");
    const toggleBtn = document.getElementById("mobile-menu");
    const navLinks = document.getElementById("navbar-links");

    generatePaletteBtn.addEventListener("click", generatePalette);
    orgIdentityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") generatePalette();
    });

    toggleBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });

    function generatePalette() {
        const orgIdentity = orgIdentityInput.value.trim();

        if (!orgIdentity) {
            paletteContainer.innerHTML = '<p class="error-message">Please enter a word for your organization\'s identity.</p>';
            return;
        }

        paletteContainer.innerHTML = '<p class="loading-message">🎨 Generating your color palette...</p>';

        fetch("https://colorspeak.onrender.com/api/suggest-colors/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ input: orgIdentity })
        })
        .then(async response => {
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch palette");
            }
            return response.json();
        })
        .then(data => {
            let rawContent = data.result;
            let colorPalette;

            try {
                colorPalette = JSON.parse(rawContent);
            } catch {
                const jsonMatch = rawContent.match(/\[\s*\{.*?\}\s*\]/s);
                if (jsonMatch && jsonMatch[0]) {
                    colorPalette = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error("Invalid JSON response from backend.");
                }
            }

            if (!Array.isArray(colorPalette) || colorPalette.length === 0) {
                throw new Error("Empty or invalid color palette received.");
            }

            renderPalette(colorPalette);
        })
        .catch(error => {
            console.error("Error:", error);
            paletteContainer.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
        });
    }

    function renderPalette(palette) {
        paletteContainer.innerHTML = '';

        palette.forEach(color => {
            const colorBox = document.createElement("div");
            colorBox.classList.add("color-box");
            colorBox.style.backgroundColor = color.hex;

            const hex = color.hex.replace("#", "");
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            colorBox.style.color = luminance > 0.5 ? "#333" : "#fff";

            colorBox.innerHTML = `
                <span class="color-name">${color.name}</span>
                <span class="hex-code">${color.hex.toUpperCase()}</span>
                <div class="palette-actions">
                    <button class="copy-btn" data-hex="${color.hex}">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button class="save-btn" data-color='${JSON.stringify(color)}'>
                        <i class="fas fa-bookmark"></i> Save
                    </button>
                </div>
            `;

            paletteContainer.appendChild(colorBox);
        });

        attachButtonListeners();
    }

    function displaySavedPalettes() {
        const savedPaletteContainer = document.getElementById("savedPaletteContainer");
        savedPaletteContainer.innerHTML = '';

        let saved = JSON.parse(localStorage.getItem("savedPalettes") || "[]");

        saved = saved.filter(c => c && typeof c.hex === "string" && typeof c.name === "string");

        if (saved.length === 0) {
            savedPaletteContainer.innerHTML = '<p class="info-message">No saved palettes yet.</p>';
            return;
        }

        saved.forEach(color => {
            const colorBox = document.createElement("div");
            colorBox.classList.add("color-box");
            colorBox.style.backgroundColor = color.hex;

            const hex = color.hex.replace("#", "");
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            colorBox.style.color = luminance > 0.5 ? "#333" : "#fff";

            colorBox.innerHTML = `
                <span class="color-name">${color.name}</span>
                <span class="hex-code">${color.hex.toUpperCase()}</span>
                <div class="palette-actions">
                    <button class="remove-btn" data-hex="${color.hex}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            `;

            savedPaletteContainer.appendChild(colorBox);
        });

        attachRemoveListeners();
    }

    function attachButtonListeners() {
        document.querySelectorAll(".save-btn").forEach(button => {
            button.addEventListener("click", () => {
                const colorData = JSON.parse(button.getAttribute("data-color"));
                let saved = JSON.parse(localStorage.getItem("savedPalettes") || "[]");
                saved = saved.filter(c => c && typeof c.hex === "string" && typeof c.name === "string");

                if (!saved.some(c => c.hex === colorData.hex)) {
                    saved.push(colorData);
                    localStorage.setItem("savedPalettes", JSON.stringify(saved));
                    displaySavedPalettes();
                }

                button.innerHTML = '<i class="fas fa-check"></i> Saved!';
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-bookmark"></i> Save';
                }, 1500);
            });
        });

        document.querySelectorAll(".copy-btn").forEach(button => {
            button.addEventListener("click", () => {
                const hex = button.getAttribute("data-hex");
                navigator.clipboard.writeText(hex).then(() => {
                    button.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => {
                        button.innerHTML = '<i class="fas fa-copy"></i> Copy';
                    }, 1500);
                });
            });
        });
    }

    function attachRemoveListeners() {
        document.querySelectorAll(".remove-btn").forEach(button => {
            button.addEventListener("click", () => {
                const hex = button.getAttribute("data-hex");
                let saved = JSON.parse(localStorage.getItem("savedPalettes") || "[]");
                saved = saved.filter(c => c.hex !== hex);
                localStorage.setItem("savedPalettes", JSON.stringify(saved));
                displaySavedPalettes();
            });
        });
    }

    displaySavedPalettes();
});
const toggleBtn = document.getElementById('themeToggle');
const body = document.body;

// Load theme on page load
if (localStorage.getItem('theme') === 'dark') {
  body.classList.add('dark-mode');
  toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
}

// Toggle theme
toggleBtn.addEventListener('click', () => {
  body.classList.toggle('dark-mode');

  if (body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
    toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    localStorage.setItem('theme', 'light');
    toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
  }
});
