```javascript
// script.js

// === Globals ===
const markdownInput = document.getElementById('markdownInput');
const htmlPreview = document.getElementById('htmlPreview');
const htmlCode = document.querySelector('#htmlCode code');
const tabPreviewBtn = document.getElementById('tabPreview');
const tabCodeBtn = document.getElementById('tabCode');
const themeSelector = document.getElementById('themeSelector');
const styleSelector = document.getElementById('styleSelector');
const copyBtn = document.getElementById('copyHtml');
const downloadBtn = document.getElementById('downloadHtml');
const resetBtn = document.getElementById('resetAll');
const toast = document.getElementById('toast');
const resizer = document.getElementById('resizer');
const editorPanel = document.getElementById('editorPanel');
const outputPanel = document.querySelector('.output');

// Default markdown sample
const defaultMarkdown = `# Welcome to the Stunning Markdown to HTML Converter

Start typing **Markdown** here and see the _real-time_ HTML preview and code update instantly!

- Headings, lists, links, and images
- Code blocks with syntax highlighting
- Elegant themes and preview styles
- Responsive design & keyboard shortcuts


> Steps
1. Type your Markdown
2. View live preview & code side-by-side
3. Copy or download your HTML output

---

Happy converting! 🚀`;

// === Initialize theme ===
function applyTheme(name) {
  document.body.classList.remove('light', 'dark', 'vibrant');
  document.body.classList.add(name);
  localStorage.setItem('md-theme', name);
}
function loadTheme() {
  const savedTheme = localStorage.getItem('md-theme') || 'dark';
  applyTheme(savedTheme);
  themeSelector.value = savedTheme;
}

// === Preview styles (inject CSS) ===
const previewStyles = {
  default: `
  .md-preview-style {
    padding: 1rem 2rem;
    line-height: 1.5;
  }`,
  article: `
  .md-preview-style.article {
    background: #fef6e4;
    color: #4a352e;
    font-family: Georgia, serif;
    padding: 2rem 3rem;
    border-radius: 10px;
    line-height: 1.7;
    box-shadow: 0 0 18px rgba(255, 194, 122, 0.45);
  }
  .md-preview-style.article h1, .md-preview-style.article h2 {
    color: #b5651d;
    font-weight: 600;
  }
  .md-preview-style.article blockquote {
    border-left: 5px solid #b5651d;
    color: #7d5a50;
    margin: 0 0 1.5rem 0;
    padding-left: 1rem;
    font-style: italic;
  }`,
  technical: `
  .md-preview-style.technical {
    font-family: 'JetBrains Mono', monospace;
    background: #1a1a2e;
    color: #a0e7e5;
    padding: 1.5rem 2rem;
    border-radius: 8px;
  }
  .md-preview-style.technical a {
    color: #00f7ff;
    text-decoration: underline;
  }
  .md-preview-style.technical pre, .md-preview-style.technical code {
    background: #0f3460;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.9rem;
  }`,
  elegant: `
  .md-preview-style.elegant {
    font-family: 'Merriweather', serif;
    color: #4f3f2f;
    background: #faf5f0;
    padding: 2rem 3rem;
    border-radius: 12px;
    font-style: normal;
  }
  .md-preview-style.elegant h1,
  .md-preview-style.elegant h2 {
    font-weight: 700;
    color: #ab6e3d;
  }
  .md-preview-style.elegant blockquote {
    font-style: italic;
    border-left: 3px solid #ab6e3d;
    color: #7e6a53;
    margin-left: 0;
    padding-left: 1rem;
  }`
};

function applyPreviewStyle(name) {
  let styleEl = document.getElementById('previewStyleInjection');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'previewStyleInjection';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = previewStyles[name] || previewStyles.default;
}

// === Tab switching ===
function switchTab(to) {
  if (to === 'preview') {
    tabPreviewBtn.classList.add('active');
    tabPreviewBtn.setAttribute('aria-selected', 'true');
    tabCodeBtn.classList.remove('active');
    tabCodeBtn.setAttribute('aria-selected', 'false');
    htmlPreview.classList.add('active');
    htmlPreview.setAttribute('aria-hidden', 'false');
    htmlCode.parentElement.classList.remove('active');
    htmlCode.parentElement.setAttribute('aria-hidden', 'true');
  } else {
    tabCodeBtn.classList.add('active');
    tabCodeBtn.setAttribute('aria-selected', 'true');
    tabPreviewBtn.classList.remove('active');
    tabPreviewBtn.setAttribute('aria-selected', 'false');
    htmlCode.parentElement.classList.add('active');
    htmlCode.parentElement.setAttribute('aria-hidden', 'false');
    htmlPreview.classList.remove('active');
    htmlPreview.setAttribute('aria-hidden', 'true');
  }
}

// === Markdown to HTML conversion and rendering ===
function renderMarkdown() {
  const mdText = markdownInput.value;
  const rawHtml = marked.parse(mdText, { gfm: true, breaks: true });

  // Wrap preview with preview style class
  const styleClass = 'md-preview-style ' + (styleSelector.value || 'default');
  htmlPreview.innerHTML = `<div class="${styleClass}">${rawHtml}</div>`;

  // Show formatted HTML escaped in code panel
  htmlCode.textContent = rawHtml;
  hljs.highlightElement(htmlCode);
}

// === Synchronize input and output as the user types ===
let renderTimeout = null;
function scheduleRender() {
  if (renderTimeout) clearTimeout(renderTimeout);
  renderTimeout = setTimeout(renderMarkdown, 120);
}

// === Copy HTML to clipboard ===
function copyHTML() {
  const htmlToCopy = htmlCode.textContent;
  navigator.clipboard.writeText(htmlToCopy).then(() => {
    showToast('✂️ HTML copied to clipboard');
  }).catch(() => {
    showToast('⚠️ Copy failed', true);
  });
}

// === Download HTML file ===
function downloadHTML() {
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Markdown Output</title>
<style>
  body { max-width: 750px; margin: 3rem auto; font-family: 'Poppins', sans-serif; padding: 0 1rem; }
  img { max-width: 100%; height: auto; }
  pre { background: #333; padding: 0.7rem; border-radius: 5px; color: #eee; overflow-x: auto; }
  code { font-family: monospace; }
</style>
</head>
<body>
${htmlCode.textContent}
</body>
</html>`;

  const blob = new Blob([fullHtml], {type: 'text/html'});
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'converted.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
  showToast('⬇️ HTML downloaded');
}

// === Reset all panels ===
function resetPanels() {
  if (confirm('Are you sure you want to clear all content?')) {
    markdownInput.value = defaultMarkdown;
    renderMarkdown();
  }
}

// === Toast notification ===
let toastTimeout = null;
function showToast(message, isError = false) {
  toast.textContent = message;
  toast.style.backgroundColor = isError ? 'crimson' : '';
  toast.classList.add('show');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 1800);
}

// === Persistent theme loading and saving ===
themeSelector.addEventListener('change', () => {
  applyTheme(themeSelector.value);
});
styleSelector.addEventListener('change', () => {
  applyPreviewStyle(styleSelector.value);
  renderMarkdown();
});

// === Tab button listeners ===
tabPreviewBtn.addEventListener('click', () => switchTab('preview'));
tabCodeBtn.addEventListener('click', () => switchTab('code'));

// === Buttons actions ===
copyBtn.addEventListener('click', copyHTML);
downloadBtn.addEventListener('click', downloadHTML);
resetBtn.addEventListener('click', resetPanels);

// === Panel resizing ===
let isResizing = false, lastDownX = 0;
resizer.addEventListener('mousedown', (e) => {
  isResizing = true;
  lastDownX = e.clientX;
  document.body.style.cursor = 'ew-resize';
});
document.addEventListener('mousemove', (e) => {
  if (!isResizing) return;
  const offsetRight = outputPanel.getBoundingClientRect().right;
  const offsetLeft = editorPanel.getBoundingClientRect().left;
  let newEditorWidth = e.clientX - offsetLeft;
  const containerWidth = editorPanel.parentElement.getBoundingClientRect().width;
  // Clamp width
  newEditorWidth = Math.min(Math.max(newEditorWidth, 250), containerWidth - 320);
  editorPanel.style.flex = 'none';
  editorPanel.style.width = newEditorWidth + 'px';

  outputPanel.style.flex = 'none';
  outputPanel.style.width = (containerWidth - newEditorWidth - 10) + 'px';
});
document.addEventListener('mouseup', () => {
  if (isResizing) {
    isResizing = false;
    document.body.style.cursor = '';
  }
});
// Keyboard accessible resizer for accessibility
resizer.addEventListener('keydown', e => {
  const step = 20;
  if (['ArrowLeft','ArrowRight'].includes(e.key)) {
    e.preventDefault();
    const containerWidth = editorPanel.parentElement.getBoundingClientRect().width;
    let editorWidth = editorPanel.getBoundingClientRect().width;
    if (e.key === 'ArrowLeft') editorWidth -= step;
    if (e.key === 'ArrowRight') editorWidth += step;
    editorWidth = Math.min(Math.max(editorWidth, 250), containerWidth - 320);
    editorPanel.style.flex = 'none';
    editorPanel.style.width = editorWidth + 'px';
    outputPanel.style.flex = 'none';
    outputPanel.style.width = (containerWidth - editorWidth - 10) + 'px';
  }
});

// === Synchronize panels on input ===
markdownInput.addEventListener('input', scheduleRender);

// === Keyboard shortcuts ===
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key.toLowerCase() === 'k') {
      e.preventDefault();
      copyHTML();
    } else if (e.key.toLowerCase() === 'd') {
      e.preventDefault();
      downloadHTML();
    } else if (e.key.toLowerCase() === 'r') {
      e.preventDefault();
      resetPanels();
    }
  }
});

// === Initialization ===
window.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  applyPreviewStyle(styleSelector.value);
  markdownInput.value = defaultMarkdown;
  renderMarkdown();
});
```
