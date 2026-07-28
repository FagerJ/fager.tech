export const SITE = {
  title: 'Jonathan Fager — fager.tech',
  shortTitle: 'fager.tech',
  author: 'Jonathan Fager',
  description:
    'Cycling, racing, training notes and the occasional build log. Setting PRs my son is going to have a rough time beating.',
  url: 'https://fager.tech',
  locale: 'en',
  location: 'Sundbyberg, SE',
} as const;

export const LINKS = {
  strava: 'https://www.strava.com/athletes/5854987',
  instagram: 'https://www.instagram.com/faaager/',
  rss: '/rss.xml',
} as const;

export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'Cycling', href: '/cycling' },
  { label: 'Projects', href: '/projects' },
  { label: 'Uses', href: '/uses' },
] as const;
