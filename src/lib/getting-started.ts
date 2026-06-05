import type { Locale } from '../i18n';

type Localized = Record<Locale, string>;

export type GuideStep = {
  title: Localized;
  description: Localized;
  href?: string;
  /** Relative path under `data/` served at /media/ */
  mediaPath?: string;
  internalHref?: (prefix: string) => string;
};

export type GuideFaq = {
  label: Localized;
  href: string;
};

export const guideSteps: GuideStep[] = [
  {
    title: {
      fr: 'Documentaire sur les Gateway Tapes',
      en: 'Gateway Tapes documentary',
    },
    description: {
      fr: 'Prenez votre boisson ou en-cas préféré et regardez ce documentaire sur les bandes Gateway.',
      en: 'Take your favourite drink or snack and enjoy this documentary about the Gateway tapes.',
    },
    href: 'https://www.youtube.com/watch?v=HOFq3ruef7I',
  },
  {
    title: {
      fr: 'Rapport CIA — Analysis and Assessment of Gateway Process',
      en: 'CIA report — Analysis and Assessment of Gateway Process',
    },
    description: {
      fr: 'Document fondateur (McDonnell, 1983) : battements binauraux, Hemi-Sync, niveaux de Focus et cartographie des états de conscience — lisez surtout la synthèse autour de la page 25.',
      en: 'Foundational paper (McDonnell, 1983): binaural beats, Hemi-Sync, Focus levels, and consciousness mapping — read especially the summary around page 25.',
    },
    mediaPath: 'cia-gateway-experience.pdf',
  },
  {
    title: {
      fr: 'Manuel Gateway pour débutants',
      en: 'Gateway Experience manual for beginners',
    },
    description: {
      fr: 'Téléchargez et parcourez le manuel complet ; la FAQ se trouve à la fin du document.',
      en: 'Download and start reading the full manual — the FAQ is at the end of the document.',
    },
    href: 'https://ia803400.us.archive.org/16/items/the-gateway-experience-manual/The%20Gateway%20Experience%20Manual.pdf',
  },
  {
    title: {
      fr: 'Comprendre les Focus Levels',
      en: 'Understand Focus Levels',
    },
    description: {
      fr: 'Une fois que vous savez ce qu’est un niveau de Focus, parcourez les principaux états expliqués.',
      en: 'Now that you know what a Focus level is, see the major Focus levels explained.',
    },
    href: 'https://www.monroeinstituteuk.org/focus-levels/',
  },
  {
    title: {
      fr: 'Commencer le parcours audio',
      en: 'Start the audio journey',
    },
    description: {
      fr: 'Ici commence votre parcours vers la découverte de soi et la conscience élargie — les six vagues et sessions guidées de ce site.',
      en: 'Here begins your journey toward self-discovery and expanded awareness — the six waves and guided sessions on this site.',
    },
    internalHref: (prefix) => `${prefix}/waves/wave-i/`,
  },
];

export const guideTips: Localized[] = [
  {
    fr: 'Ne laissez pas les effets courants perturber votre focus (engourdissement, picotements, vibrations).',
    en: 'Don’t let common effects ruin your focus (numbness, tingles, vibrations).',
  },
  {
    fr: 'N’attendez pas qu’il se passe quelque chose, ni ne vous fixez sur un seul objectif.',
    en: 'Don’t expect something to happen, or focus on only one thing you want.',
  },
  {
    fr: 'N’ouvrez pas les yeux à un Focus élevé ; respectez le protocole de sortie.',
    en: 'Don’t open your eyes at a high Focus level or skip the proper exiting protocol.',
  },
  {
    fr: 'Ne vous concentrez pas sur ce que vous faites « mal » — laissez les choses être.',
    en: 'Don’t focus on what you might be doing wrong — just let things be.',
  },
  {
    fr: 'Ne comparez pas vos expériences aux autres quand vous débutez.',
    en: 'Don’t compare your experiences with others when you just started.',
  },
  {
    fr: 'Ne sautez pas les bandes sans maîtriser les bases.',
    en: 'Don’t skip tapes without learning the basics.',
  },
  {
    fr: 'Évitez la peur inutile (démons, esprits, CIA).',
    en: 'Don’t create unnecessary fear (demons, spirits, CIA).',
  },
  {
    fr: 'Personne n’a dit que vous ne deviez jamais bouger — c’est souvent une supposition.',
    en: 'No one ever said you weren’t allowed to move at all — you just assumed it.',
  },
  {
    fr: 'Évitez de trop analyser. Bob donne des exemples, pas des ordres. Adaptez, expérimentez.',
    en: 'Avoid trying and overthinking. Bob offers examples, not commands. Adjust and experiment.',
  },
  {
    fr: 'Ne prenez pas tout au sérieux. Bob voulait que ce soit ludique — amusez-vous et créez votre propre expérience.',
    en: 'Don’t take everything so seriously. Bob wanted people to have fun — enjoy the tapes and create your own unique experience.',
  },
];

export const guideFaq: GuideFaq[] = [
  {
    label: { fr: 'J’ai peur des bandes — que faire ?', en: 'I’m scared of the tapes — what do I do?' },
    href: 'https://www.reddit.com/r/gatewaytapes/wiki/start/',
  },
  {
    label: { fr: 'Quels sont les bénéfices ?', en: 'What are the benefits of the tapes?' },
    href: 'https://www.reddit.com/r/gatewaytapes/wiki/start/',
  },
  {
    label: { fr: 'Y a-t-il des risques réels ?', en: 'Are there real risks I should know about?' },
    href: 'https://www.reddit.com/r/gatewaytapes/wiki/start/',
  },
  {
    label: { fr: 'Est-ce que ça marche vraiment ?', en: 'Does it really work?' },
    href: 'https://www.reddit.com/r/gatewaytapes/wiki/start/',
  },
  {
    label: { fr: 'Peur des entités négatives', en: 'Fear of evil entities' },
    href: 'https://www.reddit.com/r/gatewaytapes/wiki/start/',
  },
  {
    label: { fr: 'Casque et battements binauraux', en: 'Headphones and binaural beats' },
    href: 'https://www.reddit.com/r/gatewaytapes/wiki/start/',
  },
  {
    label: { fr: 'Je « clique » hors session (clicking out)', en: 'I keep clicking out' },
    href: 'https://www.reddit.com/r/gatewaytapes/wiki/start/',
  },
  {
    label: { fr: 'Comment doit se sentir le Focus 10 ?', en: 'How should Focus 10 actually feel?' },
    href: 'https://www.reddit.com/r/gatewaytapes/wiki/start/',
  },
  {
    label: { fr: 'Comment dépasser la peur ?', en: 'How do you get past the fear?' },
    href: 'https://www.reddit.com/r/gatewaytapes/wiki/start/',
  },
];

export function pickLocalized(locale: Locale, text: Localized): string {
  return text[locale] ?? text.en;
}
