import i18n from 'i18next';
import languageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import formatDate from 'date-fns/format';
import parseDate from 'date-fns/parse';
import { registerLocale, setDefaultLocale } from 'react-datepicker';

import { embedLocales, languages } from './locales';

i18n.dateFns = {
  locales: {},
  addLocale(language, locale) {
    this.locales[language] = locale;

    registerLocale(language, locale);
  },
  getLocale(language = i18n.language) {
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

i18n.on('languageChanged', (language) => {
  setDefaultLocale(language);
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
  .use(languageDetector)
  .use(formatDatePostProcessor)
  .use(parseDatePostProcessor)
  .use(initReactI18next)
  .init({
    resources: embedLocales,
    fallbackLng: false,
    whitelist: languages,
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
      useSuspense: false,
    },
    debug: process.env.NODE_ENV !== 'production',
  });

i18n.loadCoreLocale = (language) =>
  import(`./locales/${language}/core`).then((module) => {
    const locale = module.default;

    Object.keys(locale).forEach((namespace) => {
      if (namespace === 'dateFns') {
        i18n.dateFns.addLocale(language, locale[namespace]);
      } else {
        i18n.addResourceBundle(language, namespace, locale[namespace], true, true);
      }
    });
  });

export default i18n;
