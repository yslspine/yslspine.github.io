/*
  SITE SETTINGS
  Everything that appears on more than one page lives here.
  Text wrapped in [[double brackets]] shows up highlighted in yellow on the
  site, so you can see at a glance what still needs filling in.
*/
window.LAB = {

  // Group name, and (optionally) what the letters stand for.
  name: "SLOPE Lab",
  expansion: "The Spine Lab on Posture\u00A0&\u00A0Equilibrium",

  // The one line on the home page.
  statement: "We study how posture shapes the spine, starting at T1.",

  // Shown at the foot of the menu, one entry per line.
  affiliation: ["The Icahn School of Medicine", "Mount Sinai Hospital", "New York, NY"],

  // Leave as "" to hide.
  disclaimer: "",
  // disclaimer: "Maintained by the lab. Not an official Mount Sinai website.",

  pi: {
    name: "Yunsoo Lee",   // used for the menu entry and the profile page
    firstName: "Yunsoo"   // used on buttons: "Email Yunsoo about this project"
  },

  contact: {
    // The address is split in two so that simple spam harvesters miss it.
    emailUser: "yunsoo.lee",
    emailDomain: "mountsinai.org",

    // First line of every prefilled email. Change to "Dear Dr. ...," if you like.
    greeting: "Hello,",

    office: "787 11th Avenue"
  },

  // HOME PAGE BACKGROUND
  // Drop a file at one of these paths and it is picked up automatically:
  //   1. video  (mp4, muted, loops)          -> used if the file exists
  //   2. image  (animated gif/webp, or jpg)  -> used if there is no video
  //   3. neither -> the built-in line animation plays instead
  hero: {
    video: "assets/media/hero.mp4",
    poster: "assets/media/hero-poster.jpg",   // still frame shown while the video loads
    image: "assets/media/hero.gif"
  }
};
