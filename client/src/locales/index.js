import arYE from './ar-YE';
import bgBG from './bg-BG';
import csCZ from './cs-CZ';
import daDK from './da-DK';
import deDE from './de-DE';
import enGB from './en-GB';
import enUS from './en-US';
import esES from './es-ES';
import faIR from './fa-IR';
import frFR from './fr-FR';
import huHU from './hu-HU';
import idID from './id-ID';
import itIT from './it-IT';
import jaJP from './ja-JP';
import koKR from './ko-KR';
import nlNL from './nl-NL';
import plPL from './pl-PL';
import ptBR from './pt-BR';
import roRO from './ro-RO';
import ruRU from './ru-RU';
import skSK from './sk-SK';
import srCyrlCS from './sr-Cyrl-CS';
import srLatnCS from './sr-Latn-CS';
import svSE from './sv-SE';
import trTR from './tr-TR';
import ukUA from './uk-UA';
import uzUZ from './uz-UZ';
import zhCN from './zh-CN';
import zhTW from './zh-TW';

const locales = [
  arYE,
  bgBG,
  csCZ,
  daDK,
  deDE,
  enGB,
  enUS,
  esES,
  faIR,
  frFR,
  huHU,
  idID,
  itIT,
  jaJP,
  koKR,
  nlNL,
  plPL,
  ptBR,
  roRO,
  ruRU,
  skSK,
  srCyrlCS,
  srLatnCS,
  svSE,
  trTR,
  ukUA,
  uzUZ,
  zhCN,
  zhTW,
];

export default locales;

export const languages = locales.map((locale) => locale.language);

export const embeddedLocales = locales.reduce(
  (result, locale) => ({
    ...result,
    [locale.language]: locale.embeddedLocale,
  }),
  {},
);
