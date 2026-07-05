/*
 * ============================================================================
 *  WORLD CUP BRACKET — CONFIGURATION
 * ============================================================================
 *  This is the ONLY file you need to edit to change the bracket.
 *  Edit teams / seeds / results below and reload index.html.
 *
 *  teams   : dictionary of every team. key -> { name, iso, badge, accent? }
 *              - iso   : flagcdn code (lowercase ISO 3166-1 alpha-2,
 *                        e.g. "br", or subdivision "gb-eng").
 *                        Flag is loaded from assets/flags/<iso>.png
 *              - badge : filename under assets/badges/ (federation crest).
 *              - accent: optional highlight colour for this team's winning
 *                        path. Falls back to the global `accent` (gold).
 *
 *  seeds   : the 32 team keys in ring order, starting near the top and going
 *            CLOCKWISE. Adjacent pairs (0,1), (2,3), ... are Round-of-32 games.
 *
 *  results : who won each match, given as the winning team's key.
 *              r32 -> 16 winners, r16 -> 8, qf -> 4, sf -> 2, final -> 1.
 *            Use null for a match that has NOT been played yet — its path
 *            stays grey/undecided and both teams remain in full colour.
 *            A team that LOSES a decided match is shown greyed-out.
 * ============================================================================
 */
window.BRACKET_CONFIG = {
  title: "thecirclebracket.com",
  accent: "#f4b53f", // default gold used for winner paths & the champion

  teams: {
    // ---- top / upper-left cluster ----
    fr: { name: "France",                iso: "fr",     badge: "fr.svg", accent: "#3b6fe0" },
    py: { name: "Paraguay",              iso: "py",     badge: "py.svg", accent: "#d63b3b" },
    de: { name: "Germany",               iso: "de",     badge: "de.svg" },
    br: { name: "Brazil",                iso: "br",     badge: "br.svg", accent: "#f4b53f" },
    jp: { name: "Japan",                 iso: "jp",     badge: "jp.svg" },
    ci: { name: "Ivory Coast",           iso: "ci",     badge: "ci.svg" },
    no: { name: "Norway",                iso: "no",     badge: "no.svg", accent: "#d63b3b" },
    // ---- right side ----
    mx: { name: "Mexico",                iso: "mx",     badge: "mx.svg" },
    ec: { name: "Ecuador",               iso: "ec",     badge: "ec.svg" },
    en: { name: "England",               iso: "gb-eng", badge: "en.svg" },
    cd: { name: "DR Congo",              iso: "cd",     badge: "cd.png" },
    ar: { name: "Argentina",             iso: "ar",     badge: "ar.svg" },
    cv: { name: "Cabo Verde",            iso: "cv",     badge: "cv.svg" },
    au: { name: "Australia",             iso: "au",     badge: "au.svg" },
    eg: { name: "Egypt",                 iso: "eg",     badge: "eg.svg" },
    // ---- bottom ----
    ch: { name: "Switzerland",           iso: "ch",     badge: "ch.svg" },
    dz: { name: "Algeria",               iso: "dz",     badge: "dz.png" },
    co: { name: "Colombia",              iso: "co",     badge: "co.svg" },
    gh: { name: "Ghana",                 iso: "gh",     badge: "gh.svg" },
    sn: { name: "Senegal",               iso: "sn",     badge: "sn.svg" },
    be: { name: "Belgium",               iso: "be",     badge: "be.svg" },
    ba: { name: "Bosnia & Herzegovina",  iso: "ba",     badge: "ba.svg" },
    us: { name: "United States",         iso: "us",     badge: "us.svg" },
    // ---- left side (going up) ----
    at: { name: "Austria",               iso: "at",     badge: "at.svg" },
    es: { name: "Spain",                 iso: "es",     badge: "es.svg" },
    hr: { name: "Croatia",               iso: "hr",     badge: "hr.svg" },
    pt: { name: "Portugal",              iso: "pt",     badge: "pt.svg" },
    ma: { name: "Morocco",               iso: "ma",     badge: "ma.svg", accent: "#2fa85f" },
    se: { name: "Sweden",                iso: "se",     badge: "se.svg" },
    ca: { name: "Canada",                iso: "ca",     badge: "ca.svg", accent: "#d63b3b" },
    nl: { name: "Netherlands",           iso: "nl",     badge: "nl.svg" },
    za: { name: "South Africa",          iso: "za",     badge: "za.svg" },
  },

  // 32 teams in ring order, starting just clockwise of the top and going
  // CLOCKWISE. The top seam (Germany | Brazil) splits the two halves of the
  // draw. Pairs (0,1),(2,3),... are the Round-of-32 games.
  seeds: [
    "br", "jp",   "ci", "no",   "mx", "ec",   "en", "cd",   // top -> right side
    "ar", "cv",   "au", "eg",   "ch", "dz",   "co", "gh",   // right side -> bottom
    "sn", "be",   "ba", "us",   "at", "es",   "hr", "pt",   // bottom -> left side
    "ma", "nl",   "ca", "za",   "se", "fr",   "py", "de",   // left side -> back to top
  ],

  // Winners per round. null = not played yet.
  results: {
    // 16 R32 games. Decided games drive the coloured "advancing" paths.
    r32: [
      "br",  "no",  "mx",  "en",   // Brazil, Norway, Mexico, England advance
      "ar",  "eg",  "ch",  "co",   // Argentina, Egypt, Switzerland, Colombia advance
      "be",  "us",  "es",  "pt",   // Belgium, United States, Spain, Portugal advance
      "ma",  "ca",  "fr",  "py",   // Morocco, Canada, France, Paraguay advance
    ],
    // 8 R16 games.
    r16: ["no", null, null, null, null, null, "ma", "fr"],
    // 4 QF games.
    qf: [null, null, null, null],
    // 2 SF games.
    sf: [null, null],
    // Champion. null = tournament still in progress.
    final: null,
  },
};
