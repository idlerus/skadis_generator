import ThreeRenderer from './threeRenderer';
import {STLExporter} from "three/examples/jsm/exporters/STLExporter";

export function renderUI() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <header class="mb-8 flex flex-col items-center">
      <div class="flex items-center justify-center gap-4 mb-4">
        <svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="text-gray-800 dark:text-gray-100" fill="none" stroke="currentColor">
          <rect x="2" y="2" width="96" height="96" rx="8" ry="8" stroke="currentColor" stroke-width="3" fill="none"></rect>
          <!-- Dírky v desce -->
          <rect x="15" y="15" width="5" height="15" rx="2" ry="2" fill="currentColor"></rect>
          <rect x="35" y="15" width="5" height="15" rx="2" ry="2" fill="currentColor"></rect>
          <rect x="55" y="15" width="5" height="15" rx="2" ry="2" fill="currentColor"></rect>
          <rect x="75" y="15" width="5" height="15" rx="2" ry="2" fill="currentColor"></rect>
          <rect x="25" y="35" width="5" height="15" rx="2" ry="2" fill="currentColor"></rect>
          <rect x="45" y="35" width="5" height="15" rx="2" ry="2" fill="currentColor"></rect>
          <rect x="65" y="35" width="5" height="15" rx="2" ry="2" fill="currentColor"></rect>
          <rect x="15" y="55" width="5" height="15" rx="2" ry="2" fill="currentColor"></rect>
          <rect x="35" y="55" width="5" height="15" rx="2" ry="2" fill="currentColor"></rect>
          <rect x="55" y="55" width="5" height="15" rx="2" ry="2" fill="currentColor"></rect>
          <rect x="75" y="55" width="5" height="15" rx="2" ry="2" fill="currentColor"></rect>
          <rect x="25" y="75" width="5" height="15" rx="2" ry="2" fill="currentColor"></rect>
          <rect x="45" y="75" width="5" height="15" rx="2" ry="2" fill="currentColor"></rect>
          <rect x="65" y="75" width="5" height="15" rx="2" ry="2" fill="currentColor"></rect>
        </svg>
        <div>
          <h1 class="text-4xl font-bold mb-1">SKÅDIS Generator</h1>
          <p class="text-gray-600 dark:text-gray-300 text-center">Easily design your custom panel</p>
        </div>
      </div>

      <button id="toggleDarkMode" class="absolute bottom-4 right-4 w-12 h-12 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center shadow-md hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors">
        <!-- Sun Icon (visible in light mode) -->
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 block dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="5" stroke-width="2" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95-7.05l-1.414 1.414M5.464 18.536l-1.414 1.414m0-15.95l1.414 1.414M18.536 18.536l1.414 1.414" />
        </svg>
      
        <!-- Moon Icon (visible in dark mode) -->
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
        </svg>
      </button>

      <hr class="mt-6 border-gray-300 dark:border-gray-700 w-full" />
    </header>

    <div class="grid grid-cols-2 gap-4 mb-4">
      <div><label class="block">Board Width (X, mm)</label><input id="width" type="number" value="300" class="w-full p-2 border rounded bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-colors" /></div>
      <div><label class="block">Board Height (Y, mm)</label><input id="height" type="number" value="300" class="w-full p-2 border rounded bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-colors" /></div>
     <!-- ToDo: Add cutX and cutY
      <div><label class="block">CUT X (pieces)</label><input id="cutX" type="number" value="1" class="w-full p-2 border rounded bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-colors" /></div>
      <div><label class="block">CUT Y (pieces)</label><input id="cutY" type="number" value="1" class="w-full p-2 border rounded bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-colors" /></div>
    !-->
    <input id="cutX" type="hidden" value="1" />
    <input id="cutY" type="hidden" value="1" />
    </div>

    <div id="errorMessage" class="text-red-600 mb-4 hidden"></div>
    
    <div class="mb-4"><p>Single tile size: <span id="tileSize">300 × 300 mm</span></p></div>
    
    <div class="flex gap-4 mb-4">
        <button id="download" class="px-4 py-2 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-gray-600" disabled>Download STL</button>
    </div>

    <div id="preview" class="flex-1 min-h-[400px] bg-white dark:bg-gray-800 rounded shadow flex items-center justify-center transition-colors">
      <div id="loading" class="w-full h-full inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
          <span class="text-gray-700 dark:text-gray-300 text-lg font-medium">Loading...</span>
        </div>
      </div>
    </div>
  `;

  (function restoreTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  })();

  const toggleDarkModeBtn = document.getElementById('toggleDarkMode');
  toggleDarkModeBtn.addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  const widthInput = document.getElementById('width') as HTMLInputElement;
  const heightInput = document.getElementById('height') as HTMLInputElement;
  const cutXInput = document.getElementById('cutX') as HTMLInputElement;
  const cutYInput = document.getElementById('cutY') as HTMLInputElement;
  const tileSizeText = document.getElementById('tileSize')!;
  const errorMessage = document.getElementById('errorMessage')!;
  const downloadBtn = document.getElementById('download')!;
  const preview = document.getElementById('preview')!;
  const renderer = new ThreeRenderer(preview);
  let debounceTimeout = null;
  let stl = null;

  downloadBtn.addEventListener('click', () => {
    downloadSTL(stl);
  });

  function updateTileSize(renderer) {
    renderer.hideRenderer();
    downloadBtn.setAttribute('disabled', 'true');
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() =>
    {
      const minCut = 1;
      const minSize = 1;

      let cutX = parseInt(cutXInput.value);
      let cutY = parseInt(cutYInput.value);
      let width = parseInt(widthInput.value);
      let height = parseInt(heightInput.value);

      let error = '';

      if (isNaN(cutX) || cutX < minCut)
      {
        error += 'CUT X must be at least 1. ';
        cutXInput.value = minCut.toString();
        cutX = minCut;
      }
      if (isNaN(cutY) || cutY < minCut)
      {
        error += 'CUT Y must be at least 1. ';
        cutYInput.value = minCut.toString();
        cutY = minCut;
      }
      if (isNaN(width) || width < minSize)
      {
        error += 'Width must be at least 1 mm. ';
        widthInput.value = minSize.toString();
        width = minSize;
      }
      if (isNaN(height) || height < minSize)
      {
        error += 'Height must be at least 1 mm. ';
        heightInput.value = minSize.toString();
        height = minSize;
      }

      const tileWidth = Math.floor(width / cutX);
      const tileHeight = Math.floor(height / cutY);

      tileSizeText.textContent = `${tileWidth} × ${tileHeight} mm`;

      if (error)
      {
        errorMessage.textContent = error.trim();
        errorMessage.classList.remove('hidden');
      }
      else
      {
        errorMessage.textContent = '';
        errorMessage.classList.add('hidden');
      }

      if (!error)
      {
        const mesh = renderer.generateMesh(tileWidth, tileHeight, cutX, cutY);
        const exporter = new STLExporter();
        stl = exporter.parse(mesh, { binary: true });
        downloadBtn.removeAttribute('disabled');
        renderer.update(mesh);
      }
    }, 1000);
  }

  function downloadSTL(stlData, filename = 'skadis.stl')
  {
    const blob = new Blob([stlData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  [widthInput, heightInput, cutXInput, cutYInput].forEach(input => {
    input.addEventListener('input', updateTileSize.bind(this, renderer));
  });

  setTimeout(() => {
    updateTileSize(renderer);
  }, 300);
}
