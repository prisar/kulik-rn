const config = {
  cloudfunctions: {
    endpoint: 'https://asia-south1-agrohikulik.cloudfunctions.net',
  },
  hosting: {
    web: 'https://agrohikulik.web.app',
  },
  dynamiclinks: {
    urlprefix: 'https://agrohi.page.link',
  },
  sentry: {
    dsn:
      'https://xxxxxxx@o11111.ingest.sentry.io/111',
  },
  auth: {
    google: {
      webclient:
        '300857129968-8m8ateu19n8hkmkjmd4a7veuvb76cnv5.apps.googleusercontent.com',
    },
  },
  algolia: {
    appid: '--',
    searchkey: '--',
  },
};

export default {config};
