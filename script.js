// Page Navigation
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
}

function showArtwork(artworkId) {
    showPage('artwork-' + artworkId);
}

// Gallery Filter
function filterGallery(artist) {
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        if (artist === 'all') {
            item.classList.remove('hidden');
        } else {
            if (item.getAttribute('data-artist') === artist) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        }
    });
}

// Registry Form Handling
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registryForm');
    const successMessage = document.getElementById('successMessage');

    // Google Apps Script Web App URL for form submissions
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx5sjQLVm4-BwYIfJqjsIMEhbC0E6OcDPPGjZw-XQhDcHhKP0TSLxXiUgYJVgeR2-s/exec';

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', document.getElementById('collectorName').value);
        formData.append('email', document.getElementById('collectorEmail').value);
        formData.append('phone', document.getElementById('collectorPhone').value);
        formData.append('artwork', document.getElementById('artworkPurchased').value);
        formData.append('date', document.getElementById('purchaseDate').value);
        formData.append('notes', document.getElementById('additionalNotes').value);
        formData.append('timestamp', new Date().toISOString());

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                // Show success message
                successMessage.classList.add('show');
                form.reset();

                // Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Hide success message after 5 seconds
                setTimeout(() => {
                    successMessage.classList.remove('show');
                }, 5000);
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            alert('There was an error saving your registration. Please try again.');
            console.error('Submission error:', error);
        }
    });
});

/*
================================================================================
GOOGLE SHEETS SETUP INSTRUCTIONS
================================================================================

1. Create a new Google Sheet for your collector registry

2. Go to Extensions > Apps Script

3. Delete any code in the script editor and paste this:

--------------------------------------------------------------------------------
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Add headers if this is the first row
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Artwork', 'Purchase Date', 'Notes']);
  }

  // Add the new registration
  sheet.appendRow([
    e.parameter.timestamp,
    e.parameter.name,
    e.parameter.email,
    e.parameter.phone,
    e.parameter.artwork,
    e.parameter.date,
    e.parameter.notes
  ]);

  return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
    .setMimeType(ContentService.MimeType.JSON);
}
--------------------------------------------------------------------------------

4. Click "Deploy" > "New deployment"

5. Select type: "Web app"

6. Set "Execute as": "Me"

7. Set "Who has access": "Anyone"

8. Click "Deploy"

9. Copy the "Web app URL"

10. Paste that URL in the GOOGLE_SCRIPT_URL variable above (line 38)

11. Save this file!

NOTE: Current deployment URL in use:
https://script.google.com/macros/s/AKfycbx5sjQLVm4-BwYIfJqjsIMEhbC0E6OcDPPGjZw-XQhDcHhKP0TSLxXiUgYJVgeR2-s/exec

Connected Google Sheet:
https://docs.google.com/spreadsheets/d/1kT1PrkvdGK6DrQ74_F0CktXWppVn2xSxcwtMDnH8_F4/edit

================================================================================
*/

// Interactive Pixel Eraser to Reveal "LIMBO" (Home Page)
(function initPixelEraser() {
    const field = document.getElementById('appleField');
    if (!field) return;

    // Only run on devices with a mouse / trackpad
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    field.innerHTML = '';
    field.appendChild(canvas);

    // Configuration
    const pixelSize = 12;
    const eraseRadius = 60;

    let particles = [];
    let mouse = { x: -1000, y: -1000 };
    let limboMask = null;

    // Array of artwork images
    const artworks = [
        'imgs/ladama2.jpg',
        'imgs/nadapersonal2.JPG',
        'imgs/Polilla.jpeg',
        'imgs/Pugna.jpeg',
        'imgs/VueloInterno.jpeg',
        'imgs/SoldadoCaído.jpeg',
        'imgs/MiradaEnRuinas.jpeg',
        'imgs/Gallardía.jpeg',
        'imgs/ensueño.jpeg',
        'imgs/El-Incrédulo.jpeg',
        'imgs/Reino-Fungi.jpeg'
    ];

    // Load and process random artwork image
    const img = new Image();
    const randomArtwork = artworks[Math.floor(Math.random() * artworks.length)];
    img.src = randomArtwork;

    img.onload = () => {
        setupCanvas();
        createLimboMask();
        createParticles();
        animate();
    };

    function setupCanvas() {
        const rect = field.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
    }

    function createLimboMask() {
        // Create a canvas with "LIMBO" text
        const maskCanvas = document.createElement('canvas');
        const maskCtx = maskCanvas.getContext('2d');
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;

        // Draw "LIMBO" text
        maskCtx.fillStyle = '#ffffff';
        const fontSize = Math.min(canvas.width, canvas.height) * 0.25;
        maskCtx.font = `bold ${fontSize}px Arial, sans-serif`;
        maskCtx.textAlign = 'center';
        maskCtx.textBaseline = 'middle';
        maskCtx.fillText('LIMBO', canvas.width / 2, canvas.height / 2);

        // Get pixel data
        limboMask = maskCtx.getImageData(0, 0, canvas.width, canvas.height);
    }

    function createParticles() {
        particles = [];

        // Draw image to temporary canvas to sample pixels
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // Size of the artwork in the canvas
        const artSize = Math.min(canvas.width, canvas.height) * 0.9;
        tempCanvas.width = artSize;
        tempCanvas.height = artSize;

        tempCtx.drawImage(img, 0, 0, artSize, artSize);
        const imageData = tempCtx.getImageData(0, 0, artSize, artSize);

        // Sample pixels to create particles
        for (let y = 0; y < artSize; y += pixelSize) {
            for (let x = 0; x < artSize; x += pixelSize) {
                const index = (y * artSize + x) * 4;
                const alpha = imageData.data[index + 3];

                // Only create particle if pixel is not transparent
                if (alpha > 50) {
                    const r = imageData.data[index];
                    const g = imageData.data[index + 1];
                    const b = imageData.data[index + 2];

                    const screenX = (canvas.width - artSize) / 2 + x;
                    const screenY = (canvas.height - artSize) / 2 + y;

                    particles.push({
                        x: screenX,
                        y: screenY,
                        color: `rgb(${r}, ${g}, ${b})`,
                        size: pixelSize,
                        erased: false
                    });
                }
            }
        }
    }

    function isInLimboText(x, y) {
        if (!limboMask) return false;
        const px = Math.floor(x);
        const py = Math.floor(y);
        if (px < 0 || px >= canvas.width || py < 0 || py >= canvas.height) return false;

        const index = (py * canvas.width + px) * 4;
        return limboMask.data[index] > 128; // White pixel = part of text
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            if (!p.erased) {
                // Check if cursor is near this particle
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Erase particle if cursor is close AND it's not part of LIMBO text
                if (dist < eraseRadius && !isInLimboText(p.x, p.y)) {
                    p.erased = true;
                }
            }

            // Draw particle if not erased
            if (!p.erased) {
                ctx.fillStyle = p.color;
                ctx.fillRect(
                    Math.round(p.x),
                    Math.round(p.y),
                    p.size,
                    p.size
                );
            }
        });

        requestAnimationFrame(animate);
    }

    // Mouse tracking
    field.addEventListener('mousemove', (e) => {
        const rect = field.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    field.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    // Reset on click
    field.addEventListener('click', () => {
        particles.forEach(p => p.erased = false);
    });

    // Handle resize
    window.addEventListener('resize', () => {
        setupCanvas();
        createLimboMask();
        createParticles();
    });
})();
