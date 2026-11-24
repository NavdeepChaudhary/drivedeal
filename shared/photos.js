// Real car photos with their credits. key = "<Brand> <Model>"; files live in frontend/public/cars/
// (hero in frontend/public/hero/). Only photos that clearly show the named model are listed here.
// Unsplash License: free to use, attribution appreciated: https://unsplash.com/license
const UNSPLASH = 'Unsplash License';
const UNSPLASH_URL = 'https://unsplash.com/license';

export const PHOTOS = {
  'Mahindra Thar': {
    files: ['mahindra-thar-1.jpg', 'mahindra-thar-2.jpg'],
    color: { name: 'Midnight Black', hex: '#16181d' },
    credits: [
      { title: 'A black jeep parked on a dirt road', author: 'Muhammed Akthar', license: UNSPLASH, licenseUrl: UNSPLASH_URL, page: 'https://unsplash.com/photos/kszV_-3Ka1k' },
      { title: 'A black jeep driving down a rural road', author: 'Amjith S', license: UNSPLASH, licenseUrl: UNSPLASH_URL, page: 'https://unsplash.com/photos/8G4hNKdu60M' },
    ],
  },
};

export const HERO = {
  file: 'hero.jpg',
  car: 'Mahindra Thar',
  credit: { title: 'Black SUV on a dirt road with a lighthouse', author: 'Nabil Naidu', license: UNSPLASH, licenseUrl: UNSPLASH_URL, page: 'https://unsplash.com/photos/GckCHNqHr9E' },
};
