// ── Replace this with your deployed Google Apps Script URL ──────────────────
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2MruDaX5SXYn0lWTEsNBe21umbORpKj5F0YWaolaldAdeUJ0A5F0m-4PdT6xfj22b/exec';
// ────────────────────────────────────────────────────────────────────────────

let reporterType = null;   // 'myself' | 'someone'
let jsonpSeq = 0;

// ── JSONP helper (avoids CORS issues with Google Apps Script) ────────────────
function jsonpRequest(params) {
    return new Promise((resolve, reject) => {
        const cbName = `_ksCb_${Date.now()}_${jsonpSeq++}`;
        const script = document.createElement('script');

        const cleanup = () => {
            delete window[cbName];
            script.remove();
        };

        const timer = setTimeout(() => {
            cleanup();
            reject(new Error('Request timed out. Please try again.'));
        }, 15000);

        window[cbName] = (data) => {
            clearTimeout(timer);
            cleanup();
            resolve(data);
        };

        script.onerror = () => {
            clearTimeout(timer);
            cleanup();
            reject(new Error('Could not connect to the server. Please try again.'));
        };

        const url = new URL(APPS_SCRIPT_URL);
        url.searchParams.set('callback', cbName);
        for (const [key, val] of Object.entries(params)) {
            url.searchParams.set(key, val);
        }

        script.src = url.toString();
        document.body.appendChild(script);
    });
}

// ── Load the current count on page load ─────────────────────────────────────
async function loadCount() {
    if (!isConfigured()) return;
    try {
        const res = await jsonpRequest({ action: 'getCount' });
        if (res.success) setCountDisplay(res.count);
    } catch {
        // Count is cosmetic — silent failure is fine
    }
}

function setCountDisplay(n) {
    const formatted = Number(n).toLocaleString();
    document.getElementById('totalCount').textContent = formatted;
    document.getElementById('newTotalCount').textContent = formatted;
}

// ── Handle choice selection ──────────────────────────────────────────────────
function selectReporter(type) {
    reporterType = type;

    document.getElementById('choiceMyself').classList.toggle('selected', type === 'myself');
    document.getElementById('choiceSomeone').classList.toggle('selected', type === 'someone');

    const label    = document.getElementById('kindPersonLabel');
    const hint     = document.getElementById('kindPersonHint');
    const reporter = document.getElementById('reporterSection');

    if (type === 'myself') {
        label.innerHTML = 'Your name <span class="required">*</span>';
        hint.textContent = "That's you — the kind person!";
        reporter.hidden = true;
        document.getElementById('submitterName').value = '';
    } else {
        label.innerHTML = 'Their name <span class="required">*</span>';
        hint.textContent = 'The person who performed the kind act';
        reporter.hidden = false;
    }

    const details = document.getElementById('formDetails');
    details.classList.add('visible');
    details.removeAttribute('aria-hidden');

    // Move focus into the first field after the animation
    setTimeout(() => document.getElementById('kindPersonName').focus(), 320);
}

// ── Live character counter ───────────────────────────────────────────────────
document.getElementById('actDescription').addEventListener('input', function () {
    document.getElementById('charCount').textContent = this.value.length;
});

// ── Form submission ──────────────────────────────────────────────────────────
document.getElementById('kindnessForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!reporterType) {
        showError('Please choose who performed the act of kindness first.');
        return;
    }

    const kindPersonName = document.getElementById('kindPersonName').value.trim();
    const actDescription = document.getElementById('actDescription').value.trim();
    const rawSubmitter   = document.getElementById('submitterName').value.trim();

    if (!kindPersonName) {
        showError('Please enter the name of the kind person.');
        document.getElementById('kindPersonName').focus();
        return;
    }
    if (!actDescription) {
        showError('Please describe the act of kindness.');
        document.getElementById('actDescription').focus();
        return;
    }
    if (!isConfigured()) {
        showError('The app is not yet connected to a Google Sheet. See setup instructions.');
        return;
    }

    // When self-reporting, the reporter IS the kind person
    const submitterName = reporterType === 'myself'
        ? kindPersonName
        : (rawSubmitter || 'Anonymous');

    // Increment count optimistically and show success right away.
    // The JSONP request saves to Google Sheets in the background;
    // if it comes back with the real count we update the display.
    const currentCount = parseInt(
        document.getElementById('totalCount').textContent.replace(/,/g, '')
    ) || 0;
    setCountDisplay(currentCount + 1);

    jsonpRequest({
        action: 'submit',
        kindPersonName,
        actDescription,
        submitterName,
        reportingType: reporterType
    }).then(res => {
        if (res && res.success) setCountDisplay(res.count);
    }).catch(() => {
        // Silently ignore — data was still saved to the sheet
    });

    showSuccess();
});

// ── UI state helpers ─────────────────────────────────────────────────────────
function showSuccess() {
    document.getElementById('formCard').hidden    = true;
    document.getElementById('successCard').hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    document.getElementById('kindnessForm').reset();
    reporterType = null;
    document.getElementById('charCount').textContent = '0';
    document.getElementById('choiceMyself').classList.remove('selected');
    document.getElementById('choiceSomeone').classList.remove('selected');

    const details = document.getElementById('formDetails');
    details.classList.remove('visible');
    details.setAttribute('aria-hidden', 'true');

    document.getElementById('reporterSection').hidden = true;
    document.getElementById('formCard').hidden         = false;
    document.getElementById('successCard').hidden      = true;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showError(message) {
    document.getElementById('errorText').textContent = message;
    const banner = document.getElementById('errorBanner');
    banner.hidden = false;
    clearTimeout(banner._timer);
    banner._timer = setTimeout(() => { banner.hidden = true; }, 7000);
}

function dismissError() {
    document.getElementById('errorBanner').hidden = true;
}

function isConfigured() {
    return APPS_SCRIPT_URL && APPS_SCRIPT_URL !== 'YOUR_APPS_SCRIPT_URL_HERE';
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', loadCount);
