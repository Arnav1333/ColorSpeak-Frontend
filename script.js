document.addEventListener("DOMContentLoaded", () => {
    const generatePaletteBtn = document.getElementById("generatePaletteBtn");
    const orgIdentityInput = document.getElementById("orgIdentity");
    const paletteContainer = document.getElementById("paletteContainer");
    const exportPanel = document.getElementById("palette-export");
    const exportJsonBtn = document.getElementById("exportJsonBtn");
    const exportCssBtn = document.getElementById("exportCssBtn");
    const exportCsvBtn = document.getElementById("exportCsvBtn");
    const copyHexListBtn = document.getElementById("copyHexListBtn");
    const toggleBtn = document.getElementById("mobile-menu");
    const navLinks = document.getElementById("navbar-links");
    const themeToggleBtn = document.getElementById('themeToggle');
    const body = document.body;
    let currentGeneratedPalette = [];

    generatePaletteBtn.addEventListener("click", generatePalette);
    orgIdentityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") generatePalette();
    });

    toggleBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });

    
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }

  
    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });

    function generatePalette() {
        const orgIdentity = orgIdentityInput.value.trim();
        currentGeneratedPalette = [];
        exportPanel.classList.add("hidden");

        if (!orgIdentity) {
            paletteContainer.innerHTML = '<p class="error-message">Please enter a word for your organization\'s identity.</p>';
            return;
        }

        paletteContainer.innerHTML = '<p class="loading-message">🎨 Generating your color palette...</p>';

        fetch("https://colorspeak.onrender.com/api/suggest-colors/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
            currentGeneratedPalette = [];
            exportPanel.classList.add("hidden");
        });
    }

    function renderPalette(palette) {
        paletteContainer.innerHTML = '';
        currentGeneratedPalette = palette.map(color => ({
            name: typeof color.name === "string" ? color.name.trim() : "Untitled",
            hex: normalizeHex(color.hex)
        }));
        exportPanel.classList.remove("hidden");

        palette.forEach(color => {
            const baseHex = normalizeHex(color.hex);
            const shades = generateShades(baseHex);
            const colorBox = document.createElement("div");
            colorBox.classList.add("color-box");
            colorBox.classList.add("shade-card");

            colorBox.innerHTML = `
                <span class="color-name">${color.name}</span>
                <span class="hex-code">Base: ${baseHex}</span>
                <div class="shade-strip">
                    ${shades.map((shadeHex, index) => `
                        <button
                            class="shade-segment copy-btn"
                            data-hex="${shadeHex}"
                            title="Copy ${shadeHex}"
                            aria-label="Copy shade ${index + 1} (${shadeHex})"
                            style="background-color:${shadeHex}"
                        ></button>
                    `).join("")}
                </div>
                <div class="palette-actions">
                    <button class="copy-btn" data-hex="${baseHex}">
                        <i class="fas fa-copy"></i> Copy Base
                    </button>
                    <button class="save-btn" data-color='${JSON.stringify({ ...color, hex: baseHex })}'>
                        <i class="fas fa-bookmark"></i> Save
                    </button>
                </div>
            `;

            paletteContainer.appendChild(colorBox);
        });

        attachButtonListeners();
    }

    function normalizeHex(hex) {
        if (typeof hex !== "string") return "#000000";
        const clean = hex.trim().replace("#", "");
        if (clean.length === 3) {
            return `#${clean.split("").map(ch => ch + ch).join("").toUpperCase()}`;
        }
        if (/^[0-9A-Fa-f]{6}$/.test(clean)) {
            return `#${clean.toUpperCase()}`;
        }
        return "#000000";
    }

    function hexToRgb(hex) {
        const clean = normalizeHex(hex).replace("#", "");
        return {
            r: parseInt(clean.substring(0, 2), 16),
            g: parseInt(clean.substring(2, 4), 16),
            b: parseInt(clean.substring(4, 6), 16)
        };
    }

    function rgbToHex(r, g, b) {
        return `#${[r, g, b].map(value => value.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
    }

    function adjustShade(hex, amount) {
        const { r, g, b } = hexToRgb(hex);
        if (amount >= 0) {
            return rgbToHex(
                Math.round(r + (255 - r) * amount),
                Math.round(g + (255 - g) * amount),
                Math.round(b + (255 - b) * amount)
            );
        }
        const factor = 1 + amount;
        return rgbToHex(
            Math.round(r * factor),
            Math.round(g * factor),
            Math.round(b * factor)
        );
    }

    function generateShades(hex) {
        // Ordered from lightest to darkest
        const steps = [0.65, 0.35, 0, -0.25, -0.45];
        return steps.map(step => adjustShade(hex, step));
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
            const baseHex = normalizeHex(color.hex);
            const shades = generateShades(baseHex);
            const colorBox = document.createElement("div");
            colorBox.classList.add("color-box");
            colorBox.classList.add("shade-card");
            colorBox.classList.add("saved");

            colorBox.innerHTML = `
                <span class="color-name">${color.name}</span>
                <span class="hex-code">Base: ${baseHex}</span>
                <div class="shade-strip">
                    ${shades.map((shadeHex, index) => `
                        <button
                            class="shade-segment copy-btn"
                            data-hex="${shadeHex}"
                            title="Copy ${shadeHex}"
                            aria-label="Copy saved shade ${index + 1} (${shadeHex})"
                            style="background-color:${shadeHex}"
                        ></button>
                    `).join("")}
                </div>
                <div class="palette-actions">
                    <button class="copy-btn" data-hex="${baseHex}">
                        <i class="fas fa-copy"></i> Copy Base
                    </button>
                    <button class="remove-btn" data-hex="${baseHex}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            `;

            savedPaletteContainer.appendChild(colorBox);
        });

        attachCopyListeners();
        attachRemoveListeners();
    }

    function attachButtonListeners() {
        document.querySelectorAll(".save-btn").forEach(button => {
            button.addEventListener("click", () => {
                const colorData = JSON.parse(button.getAttribute("data-color"));
                let saved = JSON.parse(localStorage.getItem("savedPalettes") || "[]");
                saved = saved.filter(c => c && typeof c.hex === "string" && typeof c.name === "string");

                if (!saved.some(c => normalizeHex(c.hex) === normalizeHex(colorData.hex))) {
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

        attachCopyListeners();
    }

    function attachCopyListeners() {
        document.querySelectorAll(".copy-btn").forEach(button => {
            if (button.dataset.copyBound === "true") {
                return;
            }
            button.dataset.copyBound = "true";
            button.addEventListener("click", () => {
                const hex = button.getAttribute("data-hex");
                const isShadeSegment = button.classList.contains("shade-segment");
                const originalMarkup = button.innerHTML;
                navigator.clipboard.writeText(hex).then(() => {
                    if (isShadeSegment) {
                        button.classList.add("copied");
                        setTimeout(() => {
                            button.classList.remove("copied");
                        }, 1200);
                        return;
                    }

                    button.innerHTML = '<i class="fas fa-check"></i> Copied';
                    setTimeout(() => {
                        button.innerHTML = originalMarkup;
                    }, 1500);
                });
            });
        });
    }

    function attachRemoveListeners() {
        document.querySelectorAll(".remove-btn").forEach(button => {
            button.addEventListener("click", () => {
                const hex = normalizeHex(button.getAttribute("data-hex"));
                let saved = JSON.parse(localStorage.getItem("savedPalettes") || "[]");
                saved = saved.filter(c => normalizeHex(c.hex) !== hex);
                localStorage.setItem("savedPalettes", JSON.stringify(saved));
                displaySavedPalettes();
            });
        });
    }

    function attachVibgyorCopyListeners() {
        document.querySelectorAll(".copy-shade").forEach(button => {
            button.addEventListener("click", (e) => {
                e.stopPropagation();
                const hex = button.parentElement.getAttribute("data-hex");
                navigator.clipboard.writeText(hex).then(() => {
                    button.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        button.innerHTML = '<i class="fas fa-copy"></i>';
                    }, 1500);
                });
            });
        });
    }

    function getPaletteForExport() {
        return currentGeneratedPalette.filter(color => color && color.name && color.hex);
    }

    function getSafeName(name, index) {
        const normalized = String(name || `color-${index + 1}`)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        return normalized || `color-${index + 1}`;
    }

    function downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    function markButtonSuccess(button, successLabel, defaultLabel, duration = 1400) {
        button.innerHTML = successLabel;
        setTimeout(() => {
            button.innerHTML = defaultLabel;
        }, duration);
    }

    exportJsonBtn.addEventListener("click", () => {
        const palette = getPaletteForExport();
        if (palette.length === 0) return;
        const payload = {
            exportedAt: new Date().toISOString(),
            count: palette.length,
            colors: palette
        };
        downloadFile("colorspeak-palette.json", JSON.stringify(payload, null, 2), "application/json");
        markButtonSuccess(exportJsonBtn, '<i class="fas fa-check"></i> Downloaded', '<i class="fas fa-file-code"></i> JSON');
    });

    exportCssBtn.addEventListener("click", () => {
        const palette = getPaletteForExport();
        if (palette.length === 0) return;
        const cssContent = `:root {\n${palette
            .map((color, index) => `  --${getSafeName(color.name, index)}: ${color.hex};`)
            .join("\n")}\n}\n`;
        downloadFile("colorspeak-palette.css", cssContent, "text/css");
        markButtonSuccess(exportCssBtn, '<i class="fas fa-check"></i> Downloaded', '<i class="fas fa-code"></i> CSS Vars');
    });

    exportCsvBtn.addEventListener("click", () => {
        const palette = getPaletteForExport();
        if (palette.length === 0) return;
        const csvContent = `name,hex\n${palette.map(color => `"${color.name.replace(/"/g, '""')}",${color.hex}`).join("\n")}\n`;
        downloadFile("colorspeak-palette.csv", csvContent, "text/csv");
        markButtonSuccess(exportCsvBtn, '<i class="fas fa-check"></i> Downloaded', '<i class="fas fa-file-csv"></i> CSV');
    });

    copyHexListBtn.addEventListener("click", () => {
        const palette = getPaletteForExport();
        if (palette.length === 0) return;
        const hexList = palette.map(color => color.hex).join(", ");
        navigator.clipboard.writeText(hexList).then(() => {
            markButtonSuccess(copyHexListBtn, '<i class="fas fa-check"></i> Copied', '<i class="fas fa-copy"></i> Copy HEX List');
        });
    });

   
    displaySavedPalettes();
    attachVibgyorCopyListeners();
});
window.addEventListener('scroll', function () {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 10) {
    navbar.style.padding = '0.5rem 2rem';
    navbar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
  } else {
    navbar.style.padding = '1rem 2rem';
    navbar.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
  }
});
