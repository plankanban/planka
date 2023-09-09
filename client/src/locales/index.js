import cs from './cs';
import da from './da';
import de from './de';
import en from './en';
import es from './es';
import fr from './fr';
import it from './it';
import ja from './ja';
import ko from './ko';
import pl from './pl';
import ru from './ru';
import sk from './sk';
import sv from './sv';
import tr from './tr';
import uz from './uz';
import zh from './zh';

const locales = [cs, da, de, en, es, fr, it, ja, ko, pl, ru, sk, sv, tr, uz, zh];

export default locales;

export const languages = locales.map((locale) => locale.language);

export const embeddedLocales = locales.reduce(
  (result, locale) => ({
    ...result,
    [locale.language]: locale.embeddedLocale,
  }),
  {},
);
