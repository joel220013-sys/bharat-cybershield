import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en/translation.json";
import hi from "./locales/hi/translation.json";
import kn from "./locales/kn/translation.json";
import ta from "./locales/ta/translation.json";
import te from "./locales/te/translation.json";
import ml from "./locales/ml/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      hi: {
        translation: hi,
      },
      kn: {
        translation: kn,
      },
      ta: {
        translation: ta,
      },
      te: {
        translation: te,
      },
      ml: {
        translation: ml,
      },
    },

    fallbackLng: "en",

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;