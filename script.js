// ===================
// Utility/Init Stuff
// ===================
const defaultMarkdown = `# Welcome to the Markdown to HTML Converter

This is a **beautiful** and *functional* tool for converting Markdown to HTML.

## Features
- Real-time conversion
- Multiple themes
- Live preview
- Syntax highlighting
- Export options

### Code Example

\`\`\`javascript
function convertMarkdown(text) {
  return marked.parse(text);
}
\`\`\`

> This converter makes working with Markdown a joy!

[Learn more about Markdown](https://daringfireball.net/projects/markdown/)

1. Type your Markdown
2. See instant preview
3. Copy or download HTML

---

**Happy converting!**
`;

// ========== Theme Management ==============
const themeSelect = document.getElementById('theme');
const previewStyleSelect = document.getElementById('preview-style');
function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('md-theme', theme);
}
function loadTheme() {
  const th = localStorage.getItem('md-theme') || 'light';
  themeSelect.value = th;
  setTheme(th);
}
themeSelect.addEventListener('change', e => setTheme(themeSelect.value));

// ========== CodeMirror Integration (Markdown Input) =============
let editor;
window.onload = function () {
  // Initialize theme
  loadTheme();
  // Create CodeMirror
  editor = CodeMirror.fromTextArea(
    document.getElementById('markdown-editor'),
    {
      mode: 'markdown',
      theme:
        themeSelect.value === 'dark'
          ? 'material-darker'
          : 'default',
      lineNumbers: false,
      lineWrapping: true,
      tabSize: 2,
      autofocus: true,
    }
  );
  editor.setValue(defaultMarkdown);
  updateOutput();

  editor.on('change', () => updateOutput());
  themeSelect.addEventListener('change', () => {
    editor.setOption(
      'theme',
      themeSelect.value === 'dark' ? 'material-darker' : 'default'
    );
  });
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = function () {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      document.getElementById('preview-tab').style.display =
        this.dataset.tab === 'preview' ? '' : 'none';
      document.getElementById('html-tab').style.display =
        this.dataset.tab === 'html' ? '' : 'none';
    };
  });
  // Actions
  document.getElementById('clear-btn').onclick = resetPanels;
  document.getElementById('copy-btn').onclick = copyHtml;
  document.getElementById('download-btn').onclick = downloadHtml;
  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        copyHtml();
      } else if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        downloadHtml();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        resetPanels();
      }
    }
  });
  previewStyleSelect.addEventListener('change', updateOutput);
};
function resetPanels() {
  if (confirm('Clear all content and reset?')) {
    editor.setValue(defaultMarkdown);
    updateOutput();
  }
}

// ========== Markdown Rendering ============
function updateOutput() {
  const mdText = editor.getValue();
  // Convert markdown to HTML
  let html = marked.parse(mdText, { gfm: true, breaks: true });
  // Style preview content
  const style = previewStyleSelect.value;
  let styledHtml = `<div class="md-preview-style ${style}">\n${html}\n</div>`;
  // Render preview
  document.getElementById('preview-tab').innerHTML = styledHtml;
  // Render HTML code
  document.getElementById('html-tab').textContent = html;
  hljs.highlightBlock(document.getElementById('html-tab'));
}

// ========== Output Actions ================
function copyHtml() {
  const html = marked.parse(editor.getValue(), { gfm: true, breaks: true });
  navigator.clipboard
    .writeText(html)
    .then(() => showCopyFeedback('Copied!'))
    .catch(() => showCopyFeedback('Copy failed', true));
}

function showCopyFeedback(msg, error) {
  const el = document.getElementById('copy-feedback');
  el.textContent = msg;
  el.className = 'feedback shown' + (error ? ' error' : '');
  setTimeout(() => (el.className = 'feedback'), 1100);
}

function downloadHtml() {
  const html = marked.parse(editor.getValue(), { gfm: true, breaks: true });
  const doc = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Converted Markdown</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: Inter, sans-serif; max-width: 700px; margin: 2.5em auto; background: #fff; }
    h1,h2,h3,h4,h5,h6 { font-family: inherit; }
    pre, code { font-family: JetBrains Mono, Fira Mono, monospace; background: #f6f6ff; color: #24195d; }
    blockquote { color: #6e2cb3; border-left: 3px solid #a7b3d8; padding-left: 1em; margin: 0.7em 0; }
    img { max-width: 98%; }
    /* Add more default styles as desired */
  </style>
</head>
<body>
${html}
</body>
</html>
`;
  const blob = new Blob([doc], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'converted.html';
  a.click();
}

// ========== Preview Styles (Dynamic) =============
const previewStyles = {
  default: '',
  article: `
    .md-preview-style.article {
      background: #fff8f2;
      padding: 2.2em 1.4em 2.2em 2.8em;
      border-radius: 8px;
      box-shadow: 0 5px 45px -18px #ffc88f81;
      font-family: 'Inter', serif;
    }
    .md-preview-style.article h1, .md-preview-style.article h2 { color: #ee8541;}
    .md-preview-style.article blockquote { color: #e05188;}
  `,
  technical: `
    .md-preview-style.technical {
      background: #161829;
      color: #c2d7ff;
      padding: 2.2em 1.2em;
      border-radius: 6px;
      box-shadow: 0 1px 14px -4px #124ba3e6;
      font-family: 'JetBrains Mono', 'Fira Mono', monospace;
    }
    .md-preview-style.technical a { color: #5ad6ff;}
    .md-preview-style.technical code { background: #1b232d; color: #fcf6ff;}
  `,
  elegant: `
    .md-preview-style.elegant {
      background: #faf8f6;
      color: #3c2d28;
      font-family: 'Merriweather', Georgia, serif;
      border-radius: 9px;
      border: 1.1px solid #e0caae;
      padding: 2.8em 2em 2em 3.2em;
      box-shadow: 0 6px 22px -2px #dcb08448;
    }
    .md-preview-style.elegant h1, .md-preview-style.elegant h2 { color: #aa6f37;}
    .md-preview-style.elegant blockquote { color: #b58900;}
  `,
};
previewStyleSelect.addEventListener('change', () => {
  // Remove prior styles
  let styleEl = document.getElementById('preview-style-dynamic');
  if (styleEl) styleEl.remove();
  // Add new styles
  const ps = previewStyles[previewStyleSelect.value];
  if (ps) {
    styleEl = document.createElement('style');
    styleEl.id = 'preview-style-dynamic';
    styleEl.innerHTML = ps;
    document.head.appendChild(styleEl);
  }
  updateOutput();
});

// Initial preview style load:
window.addEventListener('DOMContentLoaded', () => {
  previewStyleSelect.dispatchEvent(new Event('change'));
});
