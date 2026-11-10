/*
 * config.js — the one place to change site-wide settings.
 * (Everything here is public: never put secrets in this file.)
 */
window.NM_CONFIG = {
  // Public address of the site (used by the check script and docs).
  siteUrl: 'https://nextmillionaireqr.com',

  // Google Form used by every "Register as a Driver" / "Apply to Rent" button.
  driverFormUrl: 'https://forms.gle/8A5kRBSRUosY3T5PA',

  // Background video shown in the hero of every page.
  // TIP: for reliability, download the file, save it as /media/hero.mp4 in this
  // project and change this value to '/media/hero.mp4'.
  heroVideoUrl: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4',

  // Content files edited by the team (see README.md).
  fleetDataUrl: '/data/fleet-status.json',
  teamDataUrl: '/data/team.json',
  localesPath: '/locales/'
};
