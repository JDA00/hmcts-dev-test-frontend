import * as path from 'path';

import * as express from 'express';
import * as nunjucks from 'nunjucks';

/**
 * Formats an ISO date string to GOV.UK style: "7 December 2025 at 12pm"
 * See: https://www.gov.uk/guidance/style-guide/a-to-z-of-gov-uk-style#dates
 */
function formatGovukDateTime(isoString: string): string {
  if (!isoString) {
    return '';
  }

  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return isoString;
  }

  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'long' });
  const year = date.getFullYear();

  const hours = date.getHours();
  const minutes = date.getMinutes();

  let timeStr: string;
  if (hours === 0 && minutes === 0) {
    timeStr = 'midnight';
  } else if (hours === 12 && minutes === 0) {
    timeStr = 'midday';
  } else {
    const hour12 = hours % 12 || 12;
    const ampm = hours < 12 ? 'am' : 'pm';
    timeStr = minutes === 0 ? `${hour12}${ampm}` : `${hour12}:${minutes.toString().padStart(2, '0')}${ampm}`;
  }

  return `${day} ${month} ${year} at ${timeStr}`;
}

export class Nunjucks {
  constructor(public developmentMode: boolean) {
    this.developmentMode = developmentMode;
  }

  enableFor(app: express.Express): void {
    app.set('view engine', 'njk');
    const env = nunjucks.configure(path.join(__dirname, '..', '..', 'views'), {
      autoescape: true,
      watch: this.developmentMode,
      express: app,
    });

    env.addFilter('govukDateTime', formatGovukDateTime);

    // Enable GOV.UK rebrand styling
    env.addGlobal('govukRebrand', true);

    app.use((req, res, next) => {
      res.locals.pagePath = req.path;
      next();
    });
  }
}
