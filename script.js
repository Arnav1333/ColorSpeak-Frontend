const generatePaletteBtn = document.getElementById("generatePaletteBtn");
const orgIdentityInput = document.getElementById("orgIdentity");
const paletteContainer = document.getElementById("paletteContainer");

generatePaletteBtn.addEventListener("click", generatePalette);
orgIdentityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        generatePalette();
    }
});
document.addEventListener("click", function (e) {
  if (e.target.closest(".copy-shade")) {
    const colorDiv = e.target.closest(".color-shade");
    const hexCode = colorDiv.getAttribute("data-hex");

    navigator.clipboard.writeText(hexCode).then(() => {
      const btn = e.target.closest(".copy-shade");
      btn.innerHTML = '<i class="fas fa-check"></i>';
      setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-copy"></i>';
      }, 1500);
    });
  }
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
            <button class="copy-btn" data-hex="${color.hex}">
                <i class="fas fa-copy"></i> Copy
            </button>
        `;

        paletteContainer.appendChild(colorBox);
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
    const toggleBtn = document.getElementById("mobile-menu");
    const navLinks = document.getElementById("navbar-links");

    toggleBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });

  function toggleMobileMenu() {
    const navLinks = document.getElementById("navLinks");
    navLinks.classList.toggle("active");
  }

