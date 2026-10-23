const languageButtons = document.querySelectorAll("[data-lang]");
const policySections = document.querySelectorAll("[data-policy-lang]");
const homeLinks = document.querySelectorAll(".privacy-page .brand, .privacy-back");
const languageStorageKey = "marmilo-language";

function setLanguage(language) {
  const selectedLanguage = language === "es" ? "es" : "en";

  document.documentElement.lang = selectedLanguage;
  document.title = selectedLanguage === "es" ? "Política de Privacidad | MarMilo" : "Privacy Policy | MarMilo";

  try {
    localStorage.setItem(languageStorageKey, selectedLanguage);
  } catch {
    // The lang query parameter still keeps navigation consistent when storage is unavailable.
  }

  languageButtons.forEach((button) => {
    const isActive = button.dataset.lang === selectedLanguage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  policySections.forEach((section) => {
    section.hidden = section.dataset.policyLang !== selectedLanguage;
  });

  homeLinks.forEach((link) => {
    link.href = `../?lang=${selectedLanguage}`;
  });
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
let storedLanguage = null;

try {
  storedLanguage = localStorage.getItem(languageStorageKey);
} catch {
  storedLanguage = null;
}

const browserLanguage = navigator.language?.toLowerCase().startsWith("es") ? "es" : "en";
setLanguage(requestedLanguage || storedLanguage || browserLanguage);
