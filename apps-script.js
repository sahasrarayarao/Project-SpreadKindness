// ============================================================
//  Spread Kindness — Google Apps Script Backend
// ============================================================
//
//  SETUP (one-time):
//  1. Open your Google Sheet
//  2. Extensions > Apps Script
//  3. Delete any existing code, paste ALL of this file
//  4. Save (Ctrl+S), then Deploy > New Deployment
//     - Type: Web app
//     - Execute as: Me
//     - Who has access: Anyone
//  5. Click Deploy → copy the URL
//  6. Paste that URL into script.js as APPS_SCRIPT_URL
//
// ============================================================

function doGet(e) {
  var action   = e.parameter.action;
  var callback = e.parameter.callback;
  var result;

  try {
    if (action === 'getCount') {
      result = getCount();
    } else if (action === 'submit') {
      result = submitKindness(e.parameter);
    } else {
      result = { success: false, error: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { success: false, error: err.toString() };
  }

  // JSONP response (browser requests include ?callback=...)
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Return the current submission count ──────────────────────
function getCount() {
  ensureHeaders();
  var sheet   = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var count   = Math.max(0, sheet.getLastRow() - 1); // exclude header row
  return { success: true, count: count };
}

// ── Append a new kindness entry ──────────────────────────────
function submitKindness(params) {
  ensureHeaders();

  var kindPersonName = String(params.kindPersonName || '').trim();
  var actDescription = String(params.actDescription || '').trim();
  var submitterName  = String(params.submitterName  || '').trim() || 'Anonymous';
  var reportingType  = String(params.reportingType  || 'myself');

  if (!kindPersonName) return { success: false, error: "Kind person's name is required." };
  if (!actDescription) return { success: false, error: "Act description is required."   };

  var sheet           = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var timestamp       = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd HH:mm:ss'
  );
  var submissionCount = Math.max(0, sheet.getLastRow() - 1) + 1;
  var reportLabel     = reportingType === 'myself' ? 'Self' : 'On Behalf Of';

  sheet.appendRow([
    submissionCount,   // A: #
    timestamp,         // B: Timestamp
    kindPersonName,    // C: Kind Person's Name
    actDescription,    // D: Act of Kindness
    submitterName,     // E: Reported By
    reportLabel        // F: Reporting Type
  ]);

  return { success: true, count: submissionCount };
}

// ── Create the header row the first time ────────────────────
function ensureHeaders() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() > 0) return; // headers already exist

  sheet.appendRow([
    '#',
    'Timestamp',
    "Kind Person's Name",
    'Act of Kindness',
    'Reported By',
    'Reporting Type'
  ]);

  // Style the header row
  var header = sheet.getRange(1, 1, 1, 6);
  header.setFontWeight('bold');
  header.setBackground('#FFE8D6');
  header.setFontColor('#2D2D2D');

  // Auto-resize columns for readability
  sheet.autoResizeColumns(1, 6);
}
