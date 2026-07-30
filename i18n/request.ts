import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale;
  const locales = ['en', 'hi', 'mr', 'te', 'ta', 'kn', 'or'];
  const finalLocale = locale && locales.includes(locale) ? locale : 'en';
  return {
    locale: finalLocale,
    messages: (await import(`../messages/${finalLocale}.json`)).default
  };
});
