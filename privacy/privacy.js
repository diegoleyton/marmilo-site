const languageButtons = document.querySelectorAll("[data-lang]");
const policySections = document.querySelectorAll("[data-policy-lang]");

function setLanguage(language) {
  const selectedLanguage = language === "es" ? "es" : "en";

  document.documentElement.lang = selectedLanguage;
  localStorage.setItem("marmilo-language", selectedLanguage);

  languageButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === selectedLanguage);
  });

  policySections.forEach((section) => {
    section.hidden = section.dataset.policyLang !== selectedLanguage;
  });
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

const storedLanguage = localStorage.getItem("marmilo-language");
const browserLanguage = navigator.language?.toLowerCase().startsWith("es") ? "es" : "en";
setLanguage(storedLanguage || browserLanguage);
