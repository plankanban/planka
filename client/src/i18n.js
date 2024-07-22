import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import formatDate from 'date-fns/format';
import parseDate from 'date-fns/parse';
import { registerLocale, setDefaultLocale } from 'react-datepicker';

import { embeddedLocales, languages } from './locales';

i18n.dateFns = {
  locales: {},
  addLocale(language, locale) {
    this.locales[language] = locale;

    registerLocale(language, locale);
  },
  getLocale(language = i18n.resolvedLanguage) {
    return this.locales[language];
  },
  format(date, format, { language, ...options } = {}) {
    return formatDate(date, format, {
      locale: this.getLocale(language),
      ...options,
    });
  },
  parse(dateString, format, backupDate, { language, ...options } = {}) {
    return parseDate(dateString, format, backupDate, {
      locale: this.getLocale(language),
      ...options,
    });
  },
};

i18n.on('languageChanged', () => {
  setDefaultLocale(i18n.resolvedLanguage);
});

const formatDatePostProcessor = {
  type: 'postProcessor',
  name: 'formatDate',
  process(value, _, options) {
    return i18n.dateFns.format(options.value, value);
  },
};

const parseDatePostProcessor = {
  type: 'postProcessor',
  name: 'parseDate',
  process(value, _, options) {
    return i18n.dateFns.parse(options.value, value, new Date());
  },
};

i18n
  .use(LanguageDetector)
  .use(formatDatePostProcessor)
  .use(parseDatePostProcessor)
  .use(initReactI18next)
  .init({
    resources: embeddedLocales,
    fallbackLng: 'en-US',
    supportedLngs: languages,
    load: 'currentOnly',
    interpolation: {
      escapeValue: false,
      format(value, format, language) {
        if (value instanceof Date) {
          return i18n.dateFns.format(value, format, {
            language,
          });
        }

        return value;
      },
    },
    react: {
      useSuspense: true,
    },
    debug: process.env.NODE_ENV !== 'production',
  });

i18n.loadCoreLocale = async (language = i18n.resolvedLanguage) => {
  if (language === i18n.options.fallbackLng[0]) {
    return;
  }

  const { default: locale } = await import(`./locales/${language}/core`);

  Object.keys(locale).forEach((namespace) => {
    if (namespace === 'dateFns') {
      i18n.dateFns.addLocale(language, locale[namespace]);
    } else {
      i18n.addResourceBundle(language, namespace, locale[namespace], true, true);
    }
  });
};

i18n.detectLanguage = () => {
  const {
    services: { languageDetector, languageUtils },
  } = i18n;

  localStorage.removeItem(languageDetector.options.lookupLocalStorage);

  const detectedLanguages = languageDetector.detect();

  i18n.language = languageUtils.getBestMatchFromCodes(detectedLanguages);
  i18n.languages = languageUtils.toResolveHierarchy(i18n.language);

  i18n.resolvedLanguage = undefined;
  i18n.setResolvedLanguage(i18n.language);
};

export default i18n;
