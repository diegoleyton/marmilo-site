const languageButtons = document.querySelectorAll("[data-lang]");
const termsSections = document.querySelectorAll("[data-terms-lang]");
const homeLinks = document.querySelectorAll(".privacy-page .brand, .privacy-back");
const languageStorageKey = "marmilo-language";

function setLanguage(language) {
  const selectedLanguage = language === "es" ? "es" : "en";
  document.documentElement.lang = selectedLanguage;
  document.title = selectedLanguage === "es" ? "Términos de uso | MarMilo" : "Terms of Use | MarMilo";
  try { localStorage.setItem(languageStorageKey, selectedLanguage); } catch { /* The URL still selects the language. */ }
  languageButtons.forEach((button) => {
    const active = button.dataset.lang === selectedLanguage;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  termsSections.forEach((section) => { section.hidden = section.dataset.termsLang !== selectedLanguage; });
  homeLinks.forEach((link) => { link.href = `../?lang=${selectedLanguage}`; });
  document.querySelectorAll('a[href^="../privacy/"]').forEach((link) => {
    link.href = `../privacy/?lang=${selectedLanguage}`;
  });
}

languageButtons.forEach((button) => button.addEventListener("click", () => setLanguage(button.dataset.lang)));
const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
let storedLanguage = null;
try { storedLanguage = localStorage.getItem(languageStorageKey); } catch { /* Use browser language. */ }
const browserLanguage = navigator.language?.toLowerCase().startsWith("es") ? "es" : "en";
setLanguage(requestedLanguage || storedLanguage || browserLanguage);
