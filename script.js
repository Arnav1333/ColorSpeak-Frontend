const generatePaletteBtn = document.getElementById("generatePaletteBtn");
const orgIdentityInput = document.getElementById("orgIdentity");
const paletteContainer = document.getElementById("paletteContainer");

generatePaletteBtn.addEventListener('click', async function () {
    const orgIdentity = orgIdentityInput.value.trim();

    if (!orgIdentity) {
        paletteContainer.innerHTML = '<p class="error-message">Please enter a word for your organization\'s identity.</p>';
        return;
    }

    paletteContainer.innerHTML = '<p class="loading-message">Generating your color palette, please wait...</p>';

    try {
        const response = await fetch("http://localhost:8000/api/suggest-colors/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ input: orgIdentity })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error ${response.status}: ${errorData.error || 'Unknown error'}`);
        }

        const data = await response.json();
        let rawContent = data.result;
        let colorPalette;

        try {
            colorPalette = JSON.parse(rawContent);
        } catch (jsonError) {
            console.warn("Raw content was not valid JSON. Trying to extract JSON array from text...", rawContent);
            const jsonMatch = rawContent.match(/\[\s*\{.*?\}\s*\]/s);
            if (jsonMatch && jsonMatch[0]) {
                colorPalette = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Could not extract valid JSON from the response.");
            }
        }

        if (!Array.isArray(colorPalette) || colorPalette.length === 0) {
            throw new Error("Received invalid or empty color palette.");
        }

        paletteContainer.innerHTML = '';

        colorPalette.forEach(color => {
            const colorBox = document.createElement('div');
            colorBox.classList.add('color-box');
            colorBox.style.backgroundColor = color.hex;

            const hex = color.hex.replace("#", "");
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            colorBox.style.color = (luminance > 0.5) ? '#333' : 'white';

            
            colorBox.innerHTML = `
                <span>${color.name}</span>
                <span class="hex-code">${color.hex.toUpperCase()}</span>
                <button class="copy-btn" data-hex="${color.hex}">
                    <i class="fas fa-copy"></i> Copy
                </button>
            `;
            


            paletteContainer.appendChild(colorBox);
        });

        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', () => {
                const hex = button.getAttribute('data-hex');
                navigator.clipboard.writeText(hex).then(() => {
                    button.innerText = 'Copied!';
                    setTimeout(() => button.innerText = 'Copy', 1500);
                });
            });
        });

    } catch (error) {
        console.error("Error:", error);
        paletteContainer.innerHTML = `<p class="error-message">Error: ${error.message}. Please try again later.</p>`;
    }
});
 
   
        const samplePalettes = {
            'modern': ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
            'professional': ['#2c3e50', '#34495e', '#7f8c8d', '#bdc3c7', '#ecf0f1'],
            'vibrant': ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'],
            'nature': ['#2ecc71', '#27ae60', '#f39c12', '#e67e22', '#8e44ad'],
            'minimal': ['#2c2c2c', '#f8f8f8', '#e0e0e0', '#6c6c6c', '#a8a8a8'],
            'tech': ['#0066cc', '#00ccff', '#66ff66', '#ffcc00', '#ff6600'],
            'cozy': ['#8B4513', '#D2691E', '#F4A460', '#DEB887', '#CD853F'],
            'bold': ['#FF1744', '#FF6D00', '#FFD600', '#00E676', '#2979FF']
        };

        const colorNames = {
            '#667eea': 'Royal Blue',
            '#764ba2': 'Purple',
            '#f093fb': 'Pink',
            '#f5576c': 'Red',
            '#4facfe': 'Sky Blue',
            '#2c3e50': 'Dark Blue',
            '#34495e': 'Dark Gray',
            '#7f8c8d': 'Gray',
            '#bdc3c7': 'Light Gray',
            '#ecf0f1': 'Off White',
            '#ff6b6b': 'Coral',
            '#feca57': 'Yellow',
            '#48dbfb': 'Cyan',
            '#ff9ff3': 'Magenta',
            '#54a0ff': 'Blue',
            '#2ecc71': 'Green',
            '#27ae60': 'Dark Green',
            '#f39c12': 'Orange',
            '#e67e22': 'Dark Orange',
            '#8e44ad': 'Violet',
            '#2c2c2c': 'Charcoal',
            '#f8f8f8': 'Light Gray',
            '#e0e0e0': 'Silver',
            '#6c6c6c': 'Medium Gray',
            '#a8a8a8': 'Light Silver',
            '#0066cc': 'Tech Blue',
            '#00ccff': 'Aqua',
            '#66ff66': 'Lime',
            '#ffcc00': 'Gold',
            '#ff6600': 'Orange Red',
            '#8B4513': 'Saddle Brown',
            '#D2691E': 'Chocolate',
            '#F4A460': 'Sandy Brown',
            '#DEB887': 'Burlywood',
            '#CD853F': 'Peru',
            '#FF1744': 'Red Accent',
            '#FF6D00': 'Orange Accent',
            '#FFD600': 'Yellow Accent',
            '#00E676': 'Green Accent',
            '#2979FF': 'Blue Accent'
        };

        function toggleMobileMenu() {
            const navLinks = document.getElementById('navLinks');
            navLinks.classList.toggle('active');
        }

        function generatePalette() {
            const input = document.getElementById('orgIdentity').value.toLowerCase().trim();
            const paletteContainer = document.getElementById('paletteContainer');
            const generateBtn = document.getElementById('generatePaletteBtn');
            
            if (!input) {
                paletteContainer.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Please enter a description for your brand or project.</div>';
                return;
            }

           
            generateBtn.classList.add('loading');
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            
            paletteContainer.innerHTML = '<div class="loading-message"><i class="fas fa-magic fa-spin"></i> Creating your perfect color palette...</div>';

            
            setTimeout(() => {
                let selectedPalette = samplePalettes.modern; // default
                
                
                for (const [key, colors] of Object.entries(samplePalettes)) {
                    if (input.includes(key)) {
                        selectedPalette = colors;
                        break;
                    }
                }

                
                if (input.includes('corporate') || input.includes('business') || input.includes('finance')) {
                    selectedPalette = samplePalettes.professional;
                } else if (input.includes('startup') || input.includes('tech') || input.includes('software')) {
                    selectedPalette = samplePalettes.tech;
                } else if (input.includes('creative') || input.includes('art') || input.includes('design')) {
                    selectedPalette = samplePalettes.vibrant;
                } else if (input.includes('eco') || input.includes('green') || input.includes('organic')) {
                    selectedPalette = samplePalettes.nature;
                } else if (input.includes('simple') || input.includes('clean') || input.includes('minimal')) {
                    selectedPalette = samplePalettes.minimal;
                } else if (input.includes('coffee') || input.includes('warm') || input.includes('cozy')) {
                    selectedPalette = samplePalettes.cozy;
                } else if (input.includes('bold') || input.includes('strong') || input.includes('powerful')) {
                    selectedPalette = samplePalettes.bold;
                }

                displayPalette(selectedPalette);
                
                
                generateBtn.classList.remove('loading');
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Palette';
            }, 1500);
        }

        function displayPalette(colors) {
            const paletteContainer = document.getElementById('paletteContainer');
            const paletteGrid = document.createElement('div');
            paletteGrid.className = 'palette-grid fade-in-up';
            
            colors.forEach(color => {
                const colorCard = document.createElement('div');
                colorCard.className = 'color-card';
                colorCard.onclick = () => copyToClipboard(color, colorCard);
                
                const colorName = colorNames[color] || 'Custom Color';
                
                colorCard.innerHTML = `
                    <div class="color-preview" style="background-color: ${color};">
                        <div class="copy-indicator">Copied!</div>
                    </div>
                    <div class="color-info">
                        <div class="color-hex">${color.toUpperCase()}</div>
                        <div class="color-name">${colorName}</div>
                    </div>
                `;
                
                paletteGrid.appendChild(colorCard);
            });
            
            paletteContainer.innerHTML = '';
            paletteContainer.appendChild(paletteGrid);
        }

        function copyToClipboard(text, element) {
            navigator.clipboard.writeText(text).then(() => {
                const indicator = element.querySelector('.copy-indicator');
                indicator.classList.add('show');
                setTimeout(() => {
                    indicator.classList.remove('show');
                }, 1000);
            });
        }

      
        document.getElementById('generatePaletteBtn').addEventListener('click', generatePalette);
        document.getElementById('orgIdentity').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                generatePalette();
            }
        });

        
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
 


