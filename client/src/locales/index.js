/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import arYE from './ar-YE';
import bgBG from './bg-BG';
import csCZ from './cs-CZ';
import daDK from './da-DK';
import deDE from './de-DE';
import elGR from './el-GR';
import enGB from './en-GB';
import enUS from './en-US';
import esES from './es-ES';
import etEE from './et-EE';
import faIR from './fa-IR';
import fiFI from './fi-FI';
import frFR from './fr-FR';
import huHU from './hu-HU';
import idID from './id-ID';
import itIT from './it-IT';
import jaJP from './ja-JP';
import koKR from './ko-KR';
import nlNL from './nl-NL';
import plPL from './pl-PL';
import ptBR from './pt-BR';
import ptPT from './pt-PT';
import roRO from './ro-RO';
import ruRU from './ru-RU';
import skSK from './sk-SK';
import srCyrlRS from './sr-Cyrl-RS';
import srLatnRS from './sr-Latn-RS';
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
  elGR,
  enGB,
  enUS,
  esES,
  etEE,
  faIR,
  fiFI,
  frFR,
  huHU,
  idID,
  itIT,
  jaJP,
  koKR,
  nlNL,
  plPL,
  ptBR,
  ptPT,
  roRO,
  ruRU,
  skSK,
  srCyrlRS,
  srLatnRS,
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
