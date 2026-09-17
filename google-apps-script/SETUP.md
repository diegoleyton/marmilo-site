# Connect the feedback form to Google Sheets

1. Create a new Google Sheet for MarMilo feedback.
2. In the sheet, open **Extensions > Apps Script**.
3. Replace the contents of `Code.gs` with the contents of this folder's `Code.gs` file.
4. Select **Deploy > New deployment** and choose **Web app**.
5. Set **Execute as** to **Me** and **Who has access** to **Anyone**.
6. Deploy, authorize the script, and copy the Web app URL ending in `/exec`.
7. Paste that URL into `feedbackEndpoint` near the top of `home.js`.

The script creates a `Feedback` tab automatically the first time a report is submitted. Each row includes the submission time, optional name, title, description, selected language, and page URL.

When the Apps Script code changes later, deploy a new version from **Deploy > Manage deployments > Edit** so the public web app receives the update.

## Updating an existing deployment

After replacing `Code.gs` with a newer version:

1. Open **Deploy > Manage deployments**.
2. Select the existing web app and click **Edit**.
3. Under **Version**, choose **New version**.
4. Click **Deploy**.

The public `/exec` URL normally stays the same. The form validates required fields on the server, escapes spreadsheet formulas, rejects duplicate submissions for five minutes, and allows up to five submissions per browser every ten minutes. This is practical abuse protection for a small public beta, but it is not a replacement for CAPTCHA if the endpoint later attracts targeted spam.
