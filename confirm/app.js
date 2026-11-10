const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
const query = new URLSearchParams(window.location.search);
const title = document.getElementById("pageTitle");
const intro = document.getElementById("introText");
const error = fragment.get("error_code") || fragment.get("error") || query.get("error_code") || query.get("error");

if (error) {
  title.textContent = "Could not confirm email";
  intro.textContent = "This confirmation link is invalid or expired. Return to MarMilo Parents and request a new confirmation email.";
} else if (fragment.has("access_token") && fragment.get("type") !== "recovery") {
  title.textContent = "Email confirmed";
  intro.textContent = "Your MarMilo account is active. Return to MarMilo Parents and sign in.";
} else {
  title.textContent = "Confirmation link needed";
  intro.textContent = "Open the confirmation link from your email. If it has expired, request a new email in MarMilo Parents.";
}

if (window.history.replaceState) {
  window.history.replaceState({}, document.title, `${window.location.origin}${window.location.pathname}`);
}
