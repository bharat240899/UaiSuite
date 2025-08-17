const uploadForm = document.getElementById('uploadForm');
const imageInput = document.getElementById('imageInput');
const filterSelect = document.getElementById('filterSelect');
const originalCanvas = document.getElementById('originalCanvas');
const transformedCanvas = document.getElementById('transformedCanvas');
const originalCtx = originalCanvas.getContext('2d');
const transformedCtx = transformedCanvas.getContext('2d');
const downloadBtn = document.getElementById('downloadBtn');
const modeToggle = document.getElementById('modeToggle');

let originalImage = new Image();
let transformedImage = new Image();
let isPlaceholderImage = true;

const filterMap = {
  none: 'none',
  clarendon: 'contrast(1.2) saturate(1.35)',
  gingham: 'contrast(1.1) brightness(1.05) sepia(0.04)',
  moon: 'grayscale(1) contrast(1.1) brightness(1.1)',
  lark: 'brightness(1.1) contrast(0.9) saturate(1.2)',
  reyes: 'sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)',
  juno: 'hue-rotate(-10deg) contrast(1.1) saturate(1.5)',
  '1977': 'sepia(0.5) hue-rotate(-30deg) contrast(1.1) brightness(1.1)',
};

const drawCanvas = (canvas, ctx, img, filter = 'none') => {
  canvas.width = 400;
  canvas.height = img.height * (400 / img.width);
  ctx.filter = filter;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
};

const previewOriginal = (src) => {
  originalImage = new Image();
  originalImage.onload = () => drawCanvas(originalCanvas, originalCtx, originalImage);
  originalImage.src = src;
};

const previewTransformed = (src) => {
  transformedImage = new Image();
  transformedImage.onload = () => {
    drawCanvas(transformedCanvas, transformedCtx, transformedImage, filterMap[filterSelect.value]);
    if (!isPlaceholderImage) downloadBtn.style.display = 'inline-block';
  };
  transformedImage.src = src;
};

const applyFilterToTransformed = () => {
  if (transformedImage.src) {
    drawCanvas(transformedCanvas, transformedCtx, transformedImage, filterMap[filterSelect.value]);
  }
};

const setBackgroundImage = (url) => {
  const bg = new Image();
  bg.crossOrigin = 'anonymous';
  bg.onload = () => {
    transformedCtx.clearRect(0, 0, transformedCanvas.width, transformedCanvas.height);
    transformedCtx.drawImage(bg, 0, 0, transformedCanvas.width, transformedCanvas.height);
    transformedCtx.drawImage(transformedImage, 0, 0, transformedCanvas.width, transformedCanvas.height);
  };
  bg.src = url;
};

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => previewOriginal(e.target.result);
  reader.readAsDataURL(file);
});

filterSelect.addEventListener('change', applyFilterToTransformed);

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = imageInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('/remove-background', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to remove background');

    const blob = await response.blob();
    const objectURL = URL.createObjectURL(blob);
    isPlaceholderImage = false;
    previewTransformed(objectURL);
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'transformed-image.png';
  link.href = transformedCanvas.toDataURL('image/png');
  link.click();
});

const setMode = (dark = false) => {
  const body = document.body;
  body.classList.toggle('dark-mode', dark);
  body.classList.toggle('light-mode', !dark);
  modeToggle.checked = dark;
  localStorage.setItem('mode', dark ? 'dark' : 'light');
};

const savedMode = localStorage.getItem('mode');
setMode(savedMode === 'dark');
modeToggle.addEventListener('change', () => setMode(modeToggle.checked));

window.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app-root') || document.body;
  const originalPath = root.dataset.original;
  const transformedPath = root.dataset.transformed;

  previewOriginal(originalPath);
  previewTransformed(transformedPath);

  const container = document.querySelector('form');

  const categorySelect = document.createElement('select');
  categorySelect.className = 'form-select w-50 mx-auto mt-4';
  categorySelect.innerHTML = `
    <option value="">Select Background Category</option>
    <option value="landscape">Landscape</option>
    <option value="interior">Interior</option>
    <option value="nature">Nature</option>
    <option value="abstract">Abstract</option>
    <option value="beach">Beach</option>
    <option value="technology">Technology</option>
    <option value="mountains">Mountains</option>
    <option value="office">Office</option>
    <option value="sky">Sky</option>
    <option value="urban">Urban</option>
    <option value="forest">Forest</option>
    <option value="room">Room</option>
    <option value="studio">Studio</option>
    <option value="flowers">Flowers</option>
    <option value="art">Art</option>
  `;

  const galleryContainer = document.createElement('div');
  galleryContainer.className = 'd-flex flex-wrap justify-content-center mt-4';

  categorySelect.addEventListener('change', async () => {
    const category = categorySelect.value;
    if (!category) return;

    try {
      const res = await fetch(`/api/backgrounds?query=${category}`);
      const data = await res.json();

      galleryContainer.innerHTML = '';

      if (data.images?.length) {
        let selectedImg = null;

        data.images.forEach((url) => {
          const img = document.createElement('img');
          img.src = url;
          img.width = 200;
          img.style.margin = '10px';
          img.classList.add('bg-thumb');

          img.addEventListener('click', () => {
            setBackgroundImage(url);

            // Visually mark selected
            if (selectedImg) selectedImg.classList.remove('selected');
            img.classList.add('selected');
            selectedImg = img;
          });

          galleryContainer.appendChild(img);
        });
      } else {
        galleryContainer.innerHTML = '<p>No images found.</p>';
      }
    } catch (err) {
      console.error(err);
      galleryContainer.innerHTML = '<p>Error loading backgrounds.</p>';
    }
  });

  container.appendChild(categorySelect);
  container.appendChild(galleryContainer);
});
const text = "Unleash Creativity. Powered by AI. Designed for Tomorrow.";
const typewriter = document.getElementById('typewriter');

let index = 0;
function type() {
  if (index <= text.length) {
    typewriter.textContent = text.slice(0, index++);
    setTimeout(type, 50); 
  }
}
window.addEventListener('DOMContentLoaded', type);