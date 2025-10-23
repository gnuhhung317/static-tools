import { modules } from './modules/index.js';

const moduleSelect = document.getElementById('moduleSelect');
const rawEl = document.getElementById('rawHtml');
const baseUrlEl = document.getElementById('baseUrl');
const removeFragmentsEl = document.getElementById('removeFragments');
const runBtn = document.getElementById('runBtn');
const clearBtn = document.getElementById('clearBtn');
const resultPre = document.getElementById('resultPre');
const resultMeta = document.getElementById('resultMeta');
const copyBtn = document.getElementById('copyBtn');

function populateModules(){
  modules.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.path;
    opt.textContent = m.name;
    moduleSelect.appendChild(opt);
  });
}

console.log('Static tools: available modules', modules);
if (!modules || modules.length === 0) {
  resultMeta.textContent = 'No modules registered. Add modules under js/modules/ and update js/modules/index.js';
}

async function run(){
  resultPre.textContent = '';
  resultMeta.textContent = '';
  const raw = rawEl.value || '';
  const baseUrl = baseUrlEl.value || '';
  const removeFragments = removeFragmentsEl ? removeFragmentsEl.checked : false;
  const modulePath = moduleSelect.value;
  if (!modulePath) return;
  try {
    const mod = await import(modulePath);
    if (!mod || typeof mod.extract !== 'function') {
      resultMeta.textContent = 'Selected module does not export extract(raw, baseUrl)';
      return;
    }
  let items = mod.extract(raw, baseUrl, { removeFragments });
  // ensure array
  if (!Array.isArray(items)) {
      resultMeta.textContent = 'Module returned unexpected result';
      return;
    }
  // dedupe and sort
  items = Array.from(new Set(items)).sort();
  resultMeta.textContent = `Found ${items.length} unique items`;
  resultPre.textContent = items.join('\n');
  // enable copy button when results exist
  if (copyBtn) copyBtn.disabled = items.length === 0;
  } catch (e) {
    resultMeta.textContent = 'Error running module: ' + (e && e.message ? e.message : String(e));
    console.error(e);
  }
}

clearBtn.addEventListener('click', ()=>{ rawEl.value=''; baseUrlEl.value=''; resultPre.textContent=''; resultMeta.textContent=''; });
runBtn.addEventListener('click', run);
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    const text = resultPre.textContent || '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Copied';
      setTimeout(() => copyBtn.textContent = 'Copy', 1500);
    } catch (e) {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); copyBtn.textContent = 'Copied'; } catch (err) { alert('Copy failed'); }
      ta.remove(); setTimeout(() => copyBtn.textContent = 'Copy', 1500);
    }
  });
}

populateModules();

// expose for debugging
window.__staticTools = { modules };
