const SHEET_NAME = "Feedback";
const ANDROID_REQUESTS_SHEET_NAME = "Android Requests";
const MAX_SUBMISSIONS = 5;
const RATE_LIMIT_SECONDS = 600;
const DUPLICATE_SECONDS = 300;

function doPost(event) {
  const values = event && event.parameter ? event.parameter : {};
  const submissionId = identifier(values.submissionId);

  // Bots commonly fill this hidden field; real visitors never see it.
  if (values.website) {
    return response(false, submissionId, "rejected");
  }

  const title = clean(values.title, 140);
  const description = clean(values.description, 4000);
  const clientId = identifier(values.clientId);
  const type = clean(values.type, 40);
  const isAndroidRequest = type === "android_access";
  const email = clean(values.email, 254).toLowerCase();
  const product = clean(values.product, 20);

  if (
    !submissionId ||
    !clientId ||
    (isAndroidRequest && (!validEmail(email) || !/^(parents|kids)$/.test(product))) ||
    (!isAndroidRequest && (!title || !description))
  ) {
    return response(false, submissionId, "invalid");
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const cache = CacheService.getScriptCache();
    const rateKey = "rate_" + digest(clientId);
    const submissionCount = Number(cache.get(rateKey) || 0);

    if (submissionCount >= MAX_SUBMISSIONS) {
      return response(false, submissionId, "rate_limited");
    }

    const duplicateValue = isAndroidRequest
      ? type + "\n" + email + "\n" + product
      : title + "\n" + description;
    const duplicateKey = "duplicate_" + digest(duplicateValue);
    if (cache.get(duplicateKey)) {
      return response(true, submissionId, "");
    }

    if (isAndroidRequest) {
      const sheet = getAndroidRequestsSheet();
      sheet.appendRow([
        new Date(),
        safeForSheet(email),
        safeForSheet(product),
        safeForSheet(clean(values.language, 10)),
        safeForSheet(clean(values.page, 500))
      ]);
    } else {
      const sheet = getFeedbackSheet();
      sheet.appendRow([
        new Date(),
        safeForSheet(clean(values.name, 120)),
        safeForSheet(title),
        safeForSheet(description),
        safeForSheet(clean(values.language, 10)),
        safeForSheet(clean(values.page, 500))
      ]);
    }

    cache.put(rateKey, String(submissionCount + 1), RATE_LIMIT_SECONDS);
    cache.put(duplicateKey, "1", DUPLICATE_SECONDS);
  } finally {
    lock.releaseLock();
  }

  return response(true, submissionId, "");
}

function getAndroidRequestsSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(ANDROID_REQUESTS_SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(ANDROID_REQUESTS_SHEET_NAME);
    sheet.appendRow(["Requested at", "Google Play email", "Product", "Language", "Page"]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function getFeedbackSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(["Received at", "Name", "Title", "Description", "Language", "Page"]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function clean(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function identifier(value) {
  const result = clean(value, 100);
  return /^[a-zA-Z0-9-]+$/.test(result) ? result : "";
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function safeForSheet(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function digest(value) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    value,
    Utilities.Charset.UTF_8
  );

  return bytes.map(function(byte) {
    return (byte + 256).toString(16).slice(-2);
  }).join("");
}

function response(ok, submissionId, error) {
  const payload = JSON.stringify({
    source: "marmilo-feedback",
    ok: ok,
    submissionId: submissionId,
    error: error
  }).replace(/</g, "\\u003c");

  return HtmlService
    .createHtmlOutput("<script>window.top.postMessage(" + payload + ", '*');</script>")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
