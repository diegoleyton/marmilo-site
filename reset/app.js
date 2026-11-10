const SUPABASE_URL = "https://eirofluqszprtozrmxrm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_prouP5zoDnqPX0kX_mMKpQ_LW2dbNH-";

const form = document.getElementById("resetForm");
const passwordInput = document.getElementById("passwordInput");
const confirmPasswordInput = document.getElementById("confirmPasswordInput");
const submitButton = document.getElementById("submitButton");
const introText = document.getElementById("introText");
const message = document.getElementById("message");
const helpBox = document.getElementById("helpBox");
const pageTitle = document.getElementById("pageTitle");
const helpTitle = document.getElementById("helpTitle");
const helpDetails = document.getElementById("helpDetails");

const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
const accessToken = hashParams.get("access_token");
const refreshToken = hashParams.get("refresh_token");
const type = hashParams.get("type");
const authError = hashParams.get("error_code") || hashParams.get("error");

let isReady = false;

bootstrap();

async function bootstrap() {
  if (authError) {
    showInvalidLink(type === "signup"
      ? "This confirmation link is invalid or expired."
      : "This reset link is invalid or expired.", type === "signup");
    return;
  }

  if (type === "signup") {
    if (!accessToken) {
      showInvalidLink("This confirmation link is invalid or expired.", true);
      return;
    }

    pageTitle.textContent = "Email confirmed";
    introText.textContent = "Your Marmilo account is active. Return to MarMilo Parents and sign in.";
    form.hidden = true;
    helpBox.hidden = true;
    clearAuthTokensFromUrl();
    return;
  }

  if (!accessToken) {
    showInvalidLink("This reset link is missing the recovery token.");
    return;
  }

  if (type && type !== "recovery") {
    showInvalidLink("This link is not a password recovery link.");
    return;
  }

  isReady = true;
  introText.textContent = "Choose a new password for your Marmilo account.";
  form.hidden = false;

  clearAuthTokensFromUrl();
}

function clearAuthTokensFromUrl() {
  if (window.history.replaceState) {
    const cleanUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!isReady) {
    return;
  }

  const password = passwordInput.value;
  const confirmedPassword = confirmPasswordInput.value;

  if (password.length < 6) {
    setMessage("Password must be at least 6 characters.", "error");
    return;
  }

  if (password !== confirmedPassword) {
    setMessage("Passwords do not match.", "error");
    return;
  }

  setBusy(true);
  setMessage("", "");

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        password
      })
    });

    if (!response.ok) {
      const errorBody = await safeJson(response);
      const errorMessage =
        errorBody?.msg ||
        errorBody?.message ||
        errorBody?.error_description ||
        "Could not update the password.";
      throw new Error(errorMessage);
    }

    setMessage("Password updated. You can go back to Marmilo and sign in.", "success");
    introText.textContent = refreshToken
      ? "Your recovery session was accepted and the password is now updated."
      : "Your password has been updated.";
    form.hidden = true;
  } catch (error) {
    setMessage(error.message || "Could not update the password.", "error");
  } finally {
    setBusy(false);
  }
});

function setBusy(isBusy) {
  submitButton.disabled = isBusy;
  submitButton.textContent = isBusy ? "Updating..." : "Update password";
}

function setMessage(text, kind) {
  message.textContent = text;
  message.className = "message";
  if (kind === "error") {
    message.classList.add("is-error");
  } else if (kind === "success") {
    message.classList.add("is-success");
  }
}

function showInvalidLink(reason, isConfirmation = false) {
  if (isConfirmation) {
    pageTitle.textContent = "Could not confirm email";
    helpTitle.textContent = "The confirmation link is invalid or expired.";
    helpDetails.textContent = "Return to MarMilo Parents and request a new confirmation email.";
  }
  introText.textContent = reason;
  form.hidden = true;
  helpBox.hidden = false;
  setMessage("", "");
  clearAuthTokensFromUrl();
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
