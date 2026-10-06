/** Untappd ratings + grades for the Raise the Bar list, keyed by beer id (from beer-green-graded.csv).
 * rating/count are Untappd; grade is our own pre-taste ranking; rarity 1–5 = how unlikely you'll see it in DK. */
export const UNTAPPD = {
  "101": {
    "grade": "B+",
    "gradeUncertain": true,
    "rating": null,
    "count": null,
    "url": null,
    "rarity": 4,
    "why": "Unblended draft lambic, specific blend; 3F rarely on tap in DK [Untappd note: no Untappd entry for this blend (generic 'Oude Lambik' 3.88 exists, different product)]"
  },
  "102": {
    "grade": "A+",
    "rating": 4.34,
    "count": 95,
    "url": "https://untappd.com/b/brouwerij-3-fonteinen-zenne-d-auge-calvados-barrel-aged-geuze-season-25-26-blend-no-4/6818050",
    "rarity": 5,
    "why": "Calvados-barrel lambic, small seasonal blend, <100 ratings on Untappd [Untappd note: UNCERTAIN: Untappd only has S25/26 Blend No. 4 (not 47), 8.9%]"
  },
  "201": {
    "grade": "C",
    "rating": 3.99,
    "count": 3735,
    "url": "https://untappd.com/b/alefarm-brewing-sparrows/3345586",
    "rarity": 1,
    "why": "Alefarm's flagship-ish DIPA, 3.7k ratings, easy to buy in DK [Untappd note: core beer since 2019]"
  },
  "202": {
    "grade": "C",
    "rating": 3.4,
    "count": 136,
    "url": "https://untappd.com/b/alefarm-brewing-night-cap/6474366",
    "rarity": 2,
    "why": "Low-key porter, little hype; Alefarm widely available in DK"
  },
  "301": {
    "grade": "B",
    "rating": 4.1,
    "count": 12,
    "url": "https://untappd.com/b/apex-brewing-company-minor-key-ipa/6918629",
    "rarity": 3,
    "why": "Brand-new release, Swedish micro, limited DK distribution [Untappd note: only 12 ratings (new Sep 2026)]"
  },
  "302": {
    "grade": "B",
    "rating": 4.03,
    "count": 279,
    "url": "https://untappd.com/b/apex-brewing-company-butterfly-protocol-ipa/6829379",
    "rarity": 3,
    "why": "New Aug 2026 IPA, <300 ratings; Apex reaches DK shops occasionally"
  },
  "401": {
    "grade": "B",
    "rating": 4.25,
    "count": 315,
    "url": "https://untappd.com/b/bad-seed-brewing-nokken/6909840",
    "rarity": 2,
    "why": "New Sep 2026 DIPA but Bad Seed is widely sold in DK"
  },
  "402": {
    "grade": "C",
    "rating": 3.76,
    "count": 314,
    "url": "https://untappd.com/b/bad-seed-brewing-extra-pilsner-edelstein/6811582",
    "rarity": 1,
    "why": "Danish pilsner, widely available"
  },
  "501": {
    "grade": "A-",
    "rating": 4.17,
    "count": 1362,
    "url": "https://untappd.com/b/blackstack-brewing-uncut-jams-strawberry-rhubarb/5788771",
    "rarity": 4,
    "why": "US (Minnesota) brewery, essentially no DK distribution [Untappd note: UNCERTAIN: fest says just 'Uncut Jams' (5.3%); matched to Strawberry Rhubarb variant; Mixed Berry variant is 4.05/629]"
  },
  "502": {
    "grade": "A+",
    "rating": 4.36,
    "count": 230,
    "url": "https://untappd.com/b/blackstack-brewing-empty-nesters/6682071",
    "rarity": 5,
    "why": "22-month Wild Turkey BA stout collab w/ Horus Aged Ales, 230 ratings, US-only release"
  },
  "601": {
    "grade": "A+",
    "rating": 4.43,
    "count": 290,
    "url": "https://untappd.com/b/brujos-brewing-populus-w-nelson/6854355",
    "rarity": 5,
    "why": "Brujos (Portland nano, 4.39 brewery avg) basically never in DK; 290 ratings"
  },
  "602": {
    "grade": "A+",
    "rating": 4.3,
    "count": 228,
    "url": "https://untappd.com/b/brujos-brewing-where-flowers-burn/6867015",
    "rarity": 5,
    "why": "Brujos nano brewery, Sep 2026 release, 228 ratings"
  },
  "701": {
    "grade": "B-",
    "rating": 3.96,
    "count": 57,
    "url": "https://untappd.com/b/burning-sky-brewery-anniversaire-2026/6832728",
    "rarity": 3,
    "why": "Annual vintage saison from UK farmhouse brewer; occasional in DK [Untappd note: Untappd 'Anniversaire 2026' is 6.5% (fest lists 6.3%)]"
  },
  "702": {
    "grade": "B-",
    "rating": 3.95,
    "count": 100,
    "url": "https://untappd.com/b/burning-sky-brewery-piquette/6316688",
    "rarity": 3,
    "why": "Small-batch farmhouse beer, 100 ratings"
  },
  "901": {
    "grade": "C",
    "rating": 3.76,
    "count": 25,
    "url": "https://untappd.com/b/ebeltoft-gardbryggeri-wildflower-ipa-cryo-fresh-1-mosaic/6860579",
    "rarity": 2,
    "why": "Danish IPA variant; Ebeltoft is mainstream in DK [Untappd note: only 25 ratings]"
  },
  "902": {
    "grade": "C+",
    "gradeUncertain": true,
    "rating": null,
    "count": 9,
    "url": "https://untappd.com/b/ebeltoft-gardbryggeri-wildflower-cryo-fresh-2-simcoe/6860580",
    "rarity": 2,
    "why": "Danish IPA variant; Ebeltoft is mainstream in DK [Untappd note: Untappd entry exists (9 ratings, no score shown yet): https://untappd.com/b/ebeltoft-gardbryggeri-wildflower-cryo-fresh-2-simcoe/6860580]"
  },
  "1001": {
    "grade": "A",
    "rating": 4.22,
    "count": 1060,
    "url": "https://untappd.com/b/everywhere-tracing-the-departed/6282151",
    "rarity": 4,
    "why": "California brewery, not distributed in DK; 1k ratings"
  },
  "1002": {
    "grade": "B",
    "rating": 4.01,
    "count": 106,
    "url": "https://untappd.com/b/everywhere-hey/5970501",
    "rarity": 3,
    "why": "Hard seltzer; US-only but not a sought-after beer"
  },
  "1101": {
    "grade": "A+",
    "rating": 4.43,
    "count": 165,
    "url": "https://untappd.com/b/evil-twin-brewing-nyc-the-great-northern-barrel-aged-series-57-released-03-13-26/6630568",
    "rarity": 5,
    "why": "Numbered BA barleywine (Mar 2026), 165 ratings, NYC-only release"
  },
  "1102": {
    "grade": "A",
    "gradeUncertain": true,
    "rating": null,
    "count": null,
    "url": null,
    "rarity": 5,
    "why": "Apparently brewed/named for this festival [Untappd note: fest-named beer, not on Untappd]"
  },
  "1201": {
    "grade": "C",
    "rating": 3.61,
    "count": 218,
    "url": "https://untappd.com/b/fano-bryghus-straight-outta-fano/6736993",
    "rarity": 1,
    "why": "Danish WC IPA, readily available"
  },
  "1202": {
    "grade": "A",
    "rating": 4.21,
    "count": 346,
    "url": "https://untappd.com/b/fano-bryghus-gorm-the-old-fano-skibsrom-edition/6171657",
    "rarity": 4,
    "why": "Barrel/ship-room aged imperial stout, limited bottle release [Untappd note: Untappd entry from Feb 2025 lists 13% (fest says 12.5%), may be earlier batch]"
  },
  "1301": {
    "grade": "B+",
    "rating": 4.17,
    "count": 232,
    "url": "https://untappd.com/b/fauve-le-cri-des-antipodes/6780372",
    "rarity": 3,
    "why": "French DIPA, 232 ratings, rare in DK"
  },
  "1302": {
    "grade": "A-",
    "rating": 4.12,
    "count": 467,
    "url": "https://untappd.com/b/fauve-clair-d-orage/6456628",
    "rarity": 4,
    "why": "BBA imperial stout from French brewery, limited release, 467 ratings"
  },
  "1401": {
    "grade": "C",
    "rating": 3.22,
    "count": 2150,
    "url": "https://untappd.com/b/flying-couch-brewing-pilsner/2537723",
    "rarity": 1,
    "why": "Copenhagen core pilsner, widely available"
  },
  "1402": {
    "grade": "C",
    "rating": 3.68,
    "count": 1229,
    "url": "https://untappd.com/b/flying-couch-brewing-dinosour/4301963",
    "rarity": 2,
    "why": "Long-running Flying Couch gose, 1.2k ratings, available in DK"
  },
  "1501": {
    "grade": "C",
    "rating": 3.45,
    "count": 9090,
    "url": "https://untappd.com/b/fuerst-wiacek-berlin-berliner-landbier/4411270",
    "rarity": 1,
    "why": "Core helles with 9k ratings [Untappd note: base entry; a 'Berliner Landbier (2026)' entry exists at 3.77/35]"
  },
  "1502": {
    "grade": "B",
    "rating": 4.1,
    "count": 83,
    "url": "https://untappd.com/b/fuerst-wiacek-berlin-motion-blur/6882595",
    "rarity": 3,
    "why": "New Sep 2026 IPA, 83 ratings; FW sometimes in DK shops [Untappd note: Untappd lists 6.8% (fest says 6.2%)]"
  },
  "1601": {
    "grade": "A",
    "rating": 4.22,
    "count": 308,
    "url": "https://untappd.com/b/funky-fluid-gelato-xtreme-out-of-order/6844990",
    "rarity": 4,
    "why": "Collab ('RaR collab' per fest list), Aug 2026, 308 ratings"
  },
  "1602": {
    "grade": "A-",
    "rating": 4.15,
    "count": 333,
    "url": "https://untappd.com/b/funky-fluid-royal-cookie-monolith/6845000",
    "rarity": 4,
    "why": "12% pastry stout collab w/ Lua, Aug 2026, 333 ratings"
  },
  "1701": {
    "grade": "C",
    "rating": 3.71,
    "count": 674,
    "url": "https://untappd.com/b/gamma-brewing-company-bad-doink/6684046",
    "rarity": 1,
    "why": "Gamma DIPA, easy to find in DK"
  },
  "1702": {
    "grade": "C",
    "rating": 3.66,
    "count": 371,
    "url": "https://untappd.com/b/gamma-brewing-company-oort-cloud/6755074",
    "rarity": 1,
    "why": "Gamma DIPA, easy to find in DK"
  },
  "1801": {
    "grade": "B-",
    "rating": 3.96,
    "count": 83,
    "url": "https://untappd.com/b/holy-goat-brewing-astral-destiny-2026/6851262",
    "rarity": 3,
    "why": "Annual vintage mixed-ferm sour, 83 ratings for 2026 edition"
  },
  "1802": {
    "grade": "B",
    "rating": 3.85,
    "count": 239,
    "url": "https://untappd.com/b/holy-goat-brewing-tangaroa/6851259",
    "rarity": 4,
    "why": "BA Flanders red w/ berries from small Scottish mixed-ferm brewery, 239 ratings"
  },
  "1901": {
    "grade": "A",
    "rating": 4.33,
    "count": 2059,
    "url": "https://untappd.com/b/hudson-valley-brewery-pineapple-coconut-glycerin/3280206",
    "rarity": 4,
    "why": "Hudson Valley sour DIPA, cult US brewery, almost never in DK [Untappd note: entry from 2019 (recurring release)]"
  },
  "1902": {
    "grade": "A+",
    "rating": 4.41,
    "count": 3582,
    "url": "https://untappd.com/b/hudson-valley-brewery-ikigai-sour-ipa/3113322",
    "rarity": 4,
    "why": "Hudson Valley, cult US brewery, almost never in DK [Untappd note: entry from 2019 (recurring release)]"
  },
  "2001": {
    "grade": "C",
    "rating": 3.7,
    "count": 548,
    "url": "https://untappd.com/b/justone-tropical-thirst-trap/6577308",
    "rarity": 1,
    "why": "Danish contract-brewed NEIPA sold in DK shops"
  },
  "2002": {
    "grade": "C",
    "rating": 3.7,
    "count": 548,
    "url": "https://untappd.com/b/justone-tropical-thirst-trap/6577308",
    "rarity": 1,
    "why": "Danish contract-brewed NEIPA sold in DK shops"
  },
  "2003": {
    "grade": "C",
    "rating": 3.7,
    "count": 548,
    "url": "https://untappd.com/b/justone-tropical-thirst-trap/6577308",
    "rarity": 1,
    "why": "Danish contract-brewed NEIPA sold in DK shops"
  },
  "2101": {
    "grade": "B",
    "gradeUncertain": true,
    "rating": null,
    "count": null,
    "url": null,
    "rarity": 3,
    "why": "Possibly new/unlisted Kølster saison [Untappd note: not found on Untappd]"
  },
  "2102": {
    "grade": "C",
    "rating": 3.3,
    "count": 169,
    "url": "https://untappd.com/b/kolster-rogslor/5119030",
    "rarity": 2,
    "why": "Smoked märzen, niche but Kølster is DK-distributed [Untappd note: Untappd entry from 2022 lists 5.5% (fest says 5%)]"
  },
  "2201": {
    "grade": "B+",
    "rating": 3.98,
    "count": 279,
    "url": "https://untappd.com/b/brasserie-la-malpolon-farmhouse-party-1/6400029",
    "rarity": 4,
    "why": "Collab (Burning Sky et al.), Sep 2025, 279 ratings"
  },
  "2202": {
    "grade": "B",
    "rating": 3.89,
    "count": 364,
    "url": "https://untappd.com/b/brasserie-la-malpolon-cerise-d-issanka/6400013",
    "rarity": 4,
    "why": "Cherry wild ale from small French brewery, 364 ratings"
  },
  "2301": {
    "grade": "C+",
    "gradeUncertain": true,
    "rating": null,
    "count": 3,
    "url": "https://untappd.com/b/mariatorgets-mikrobryggeri-nelson/6819565",
    "rarity": 2,
    "why": "Plain WC IPA from Swedish micro [Untappd note: Untappd entry exists (3 ratings, no score): https://untappd.com/b/mariatorgets-mikrobryggeri-nelson/6819565]"
  },
  "2302": {
    "grade": "A+",
    "rating": 4.34,
    "count": 613,
    "url": "https://untappd.com/b/mariatorgets-mikrobryggeri-fatlagrad-vaniljstout/4882560",
    "rarity": 5,
    "why": "16% rye-whisky-barrel vanilla stout, small Swedish micro, 2026 vintage [Untappd note: no 2026 entry: base 'Fatlagrad Vaniljstout' entry (added 2022); rye-whisky BA]"
  },
  "2401": {
    "grade": "A",
    "rating": 4.21,
    "count": 645,
    "url": "https://untappd.com/b/mortalis-brewing-company-ceres/6438040",
    "rarity": 4,
    "why": "Mortalis (NY) DIPA, not in DK"
  },
  "2402": {
    "grade": "A+",
    "rating": 4.39,
    "count": 3996,
    "url": "https://untappd.com/b/mortalis-brewing-company-echidna/5254999",
    "rarity": 4,
    "why": "Mortalis smoothie sour, 4k ratings but US-only"
  },
  "2501": {
    "grade": "C",
    "rating": 3.53,
    "count": 4691,
    "url": "https://untappd.com/b/newbarns-brewery-pilsner-beer/3821685",
    "rarity": 1,
    "why": "Newbarns core pils, 4.7k ratings"
  },
  "2502": {
    "grade": "C",
    "rating": 3.58,
    "count": 119,
    "url": "https://untappd.com/b/newbarns-brewery-turbo-shandy-raspberry-and-lemon/6337160",
    "rarity": 2,
    "why": "Shandy, UK-only but nothing special"
  },
  "2601": {
    "grade": "C+",
    "rating": 3.86,
    "count": 168,
    "url": "https://untappd.com/b/o-o-brewing-hopticket-005/6919862",
    "rarity": 2,
    "why": "New Swedish IPA series, 168 ratings"
  },
  "2602": {
    "grade": "C",
    "rating": 3.77,
    "count": 240,
    "url": "https://untappd.com/b/o-o-brewing-ekta-kallar-pils/6691578",
    "rarity": 2,
    "why": "Swedish kellerpils, 240 ratings"
  },
  "2701": {
    "grade": "B+",
    "rating": 3.91,
    "count": 774,
    "url": "https://untappd.com/b/observatoriet-pangaea/5784086",
    "rarity": 4,
    "why": "Oak-aged wild ale from tiny Danish blendery, vintage bottle [Untappd note: entry 'Pangæa' added Apr 2024, 6.4% (likely this vintage, not certain)]"
  },
  "2702": {
    "grade": "C",
    "rating": 3.58,
    "count": 345,
    "url": "https://untappd.com/b/observatoriet-oskoreia/6481653",
    "rarity": 3,
    "why": "Danish wild ale, 345 ratings; mostly sold direct"
  },
  "2801": {
    "grade": "B+",
    "rating": 4.2,
    "count": 225,
    "url": "https://untappd.com/b/oso-brew-co-madrileno-2026/6860688",
    "rarity": 3,
    "why": "Annual DIPA edition from Madrid, 225 ratings"
  },
  "2802": {
    "grade": "B",
    "rating": 4,
    "count": 205,
    "url": "https://untappd.com/b/oso-brew-co-boca-boca/6860684",
    "rarity": 3,
    "why": "Spanish IPA, rare in DK"
  },
  "2901": {
    "grade": "A",
    "rating": 4.12,
    "count": 326,
    "url": "https://untappd.com/b/paihalas-brewery-night-staalu/6415690",
    "rarity": 5,
    "why": "Arctic Lapland nano blendery wild ale, 326 ratings"
  },
  "2902": {
    "grade": "A+",
    "rating": 4.17,
    "count": 363,
    "url": "https://untappd.com/b/paihalas-brewery-idle-fish/6274013",
    "rarity": 5,
    "why": "Lapland nano blendery gruit wild ale, 363 ratings"
  },
  "3001": {
    "grade": "B",
    "gradeUncertain": true,
    "rating": null,
    "count": null,
    "url": null,
    "rarity": 3,
    "why": "Likely new/unlisted London DIPA [Untappd note: not found on Untappd]"
  },
  "3002": {
    "grade": "B",
    "rating": 4.05,
    "count": 75,
    "url": "https://untappd.com/b/palindrome-brewing-co-stats/6852480",
    "rarity": 3,
    "why": "New London IPA, 75 ratings"
  },
  "3101": {
    "grade": "B-",
    "rating": 3.81,
    "count": 221,
    "url": "https://untappd.com/b/pivovar-zichovec-14-years-of-neotradition-12-deg/6860126",
    "rarity": 3,
    "why": "Zichovec 14th anniversary lager, Sep 2026"
  },
  "3102": {
    "grade": "B",
    "rating": 4.04,
    "count": 299,
    "url": "https://untappd.com/b/pivovar-zichovec-14-years-of-megahappiness-20/6870067",
    "rarity": 3,
    "why": "Zichovec 14th anniversary DIPA, Sep 2026"
  },
  "3201": {
    "grade": "C",
    "rating": 3.45,
    "count": 166,
    "url": "https://untappd.com/b/rocket-brewing-company-rocket-sommar/6768823",
    "rarity": 3,
    "why": "BA sour from small Malmö brewery, 166 ratings"
  },
  "3202": {
    "grade": "B",
    "rating": 3.8,
    "count": 104,
    "url": "https://untappd.com/b/rocket-brewing-company-plommon/6702190",
    "rarity": 4,
    "why": "BA plum sour, 104 ratings [Untappd note: UNCERTAIN vintage: Untappd 'Plommon' (6.2%, added May 2026), no separate 2024 entry]"
  },
  "3301": {
    "grade": "A+",
    "rating": 4.39,
    "count": 27,
    "url": "https://untappd.com/b/root-branch-brewing-life-and-fate-xlviii/6873346",
    "rarity": 5,
    "why": "Long Island DIPA series, 27 ratings, not in Europe [Untappd note: duplicate Untappd entry with 9 ratings also exists]"
  },
  "3302": {
    "grade": "A+",
    "rating": 4.34,
    "count": 34,
    "url": "https://untappd.com/b/root-branch-brewing-the-castle-coconut/6874289",
    "rarity": 5,
    "why": "Root + Branch pale ale variant, 34 ratings"
  },
  "3401": {
    "grade": "C",
    "rating": 3.44,
    "count": 73,
    "url": "https://untappd.com/b/schwesterbrau-sosterpils/6443741",
    "rarity": 2,
    "why": "Small Danish pils (Humleland collab), 73 ratings"
  },
  "3501": {
    "grade": "C",
    "rating": 3.43,
    "count": 107,
    "url": "https://untappd.com/b/slowburn-brewing-co-op-slow-down/6580879",
    "rarity": 2,
    "why": "Danish pilsner, local co-op brewery"
  },
  "3502": {
    "grade": "B",
    "gradeUncertain": true,
    "rating": null,
    "count": null,
    "url": null,
    "rarity": 3,
    "why": "Collab w/ Jopen & White Labs, probably new [Untappd note: not found on Untappd]"
  },
  "3601": {
    "grade": "B",
    "gradeUncertain": true,
    "rating": null,
    "count": null,
    "url": null,
    "rarity": 3,
    "why": "Tiny Aarhus brewery, likely unlisted [Untappd note: not found on Untappd]"
  },
  "3602": {
    "grade": "B-",
    "rating": 3.59,
    "count": 11,
    "url": "https://untappd.com/b/small-grove-brewing-vensker-kalkulen/6811770",
    "rarity": 4,
    "why": "Tiny Aarhus brewery, 11 ratings [Untappd note: only 11 ratings, low confidence score]"
  },
  "3701": {
    "grade": "C+",
    "rating": 3.76,
    "count": 20,
    "url": "https://untappd.com/b/tartarus-beers-raiju/6854298",
    "rarity": 3,
    "why": "New Leeds WC IPA [Untappd note: only 20 ratings]"
  },
  "3702": {
    "grade": "A+",
    "rating": 4.44,
    "count": 36,
    "url": "https://untappd.com/b/tartarus-beers-seraphim-2026/6858064",
    "rarity": 5,
    "why": "13% barleywine from tiny Leeds brewery, 36 ratings [Untappd note: Untappd 'Seraphim 2026']"
  },
  "3801": {
    "grade": "A+",
    "rating": 4.52,
    "count": 97,
    "url": "https://untappd.com/b/test-reflecting-light-2nd-edition-2026/6853603",
    "rarity": 5,
    "why": "TEST (Brooklyn nano), cult hazy, not in Europe [Untappd note: UNCERTAIN: matched 2nd Edition 2026 (4.52/97); original 2024 entry is 4.34/471]"
  },
  "3802": {
    "grade": "A+",
    "rating": 4.51,
    "count": 104,
    "url": "https://untappd.com/b/test-ladder-to-the-moon/6910703",
    "rarity": 5,
    "why": "TEST Sept 2026 DIPA, 104 ratings"
  },
  "3901": {
    "grade": "C",
    "rating": 3.59,
    "count": 23048,
    "url": "https://untappd.com/b/the-kernel-brewery-table-beer/243048",
    "rarity": 1,
    "why": "Kernel staple [Untappd note: UNCERTAIN: generic Table Beer entry; Kernel logs each hop combo separately (~3.6-3.8)]"
  },
  "3902": {
    "grade": "C",
    "rating": 3.81,
    "count": 612,
    "url": "https://untappd.com/b/the-kernel-brewery-pale-ale-krush/6262289",
    "rarity": 2,
    "why": "Kernel pale ale, fairly common [Untappd note: Untappd 5.3% (fest 5.2%)]"
  },
  "4001": {
    "grade": "C",
    "rating": 3.56,
    "count": 164,
    "url": "https://untappd.com/b/tiny-hill-brewing-det-li-meget/6709008",
    "rarity": 2,
    "why": "Small Danish brewery WC IPA"
  },
  "4002": {
    "grade": "C",
    "rating": 3.48,
    "count": 364,
    "url": "https://untappd.com/b/copenhagen-mead-company-elderflower-session-mead/4851495",
    "rarity": 2,
    "why": "Session mead sold in DK shops"
  },
  "4101": {
    "grade": "C",
    "rating": 3.47,
    "count": 362,
    "url": "https://untappd.com/b/pivovar-kladno-krocehlavy-kladenska-poldi-8-deg/4818046",
    "rarity": 2,
    "why": "Czech regional lager, rare in DK but unremarkable"
  },
  "4102": {
    "grade": "C",
    "rating": 3.54,
    "count": 1482,
    "url": "https://untappd.com/b/pivovar-kladno-krocehlavy-kladenske-svetle-10-deg/4225831",
    "rarity": 2,
    "why": "Czech regional lager"
  },
  "4201": {
    "grade": "C",
    "rating": 3.82,
    "count": 1355,
    "url": "https://untappd.com/b/vault-city-brewing-year-1-foundations/6456573",
    "rarity": 2,
    "why": "Vault City sour, 1.3k ratings"
  },
  "4202": {
    "grade": "B-",
    "rating": 4.19,
    "count": 959,
    "url": "https://untappd.com/b/vault-city-brewing-bake-off-ny-cheesecake/6834661",
    "rarity": 2,
    "why": "Vault City pastry sour, 959 ratings, widely distributed"
  },
  "4301": {
    "grade": "A",
    "rating": 4.25,
    "count": 400,
    "url": "https://untappd.com/b/y-not-brewing-habengut/6619876",
    "rarity": 4,
    "why": "Pastry imperial stout from Danish nano (4.14 brewery avg), 400 ratings [Untappd note: Untappd lists 12.5% (fest 12%)]"
  },
  "4302": {
    "grade": "B-",
    "rating": 3.99,
    "count": 14,
    "url": "https://untappd.com/b/y-not-brewing-distress-signal/6999225",
    "rarity": 3,
    "why": "Brand-new release from Danish nano [Untappd note: only 14 ratings (added 2 Oct 2026)]"
  },
  "4401": {
    "grade": "C",
    "rating": 3.64,
    "count": 33,
    "url": "https://untappd.com/b/olsnedkeren-ojekast/6851850",
    "rarity": 2,
    "why": "Danish fruited sour, 33 ratings"
  },
  "4402": {
    "grade": "C",
    "rating": 3.54,
    "count": 68,
    "url": "https://untappd.com/b/olsnedkeren-sort-sol/1905883",
    "rarity": 2,
    "why": "Ølsnedkeren black IPA [Untappd note: UNCERTAIN: only Untappd 'Sort Sol' is a 6.2% black IPA from 2017 (fest: 7%)]"
  },
  "4501": {
    "grade": "C",
    "rating": 3.68,
    "count": 103,
    "url": "https://untappd.com/b/aben-plant-based/6854130",
    "rarity": 2,
    "why": "Danish NEIPA, widely available"
  },
  "4502": {
    "grade": "B-",
    "rating": 3.94,
    "count": 577,
    "url": "https://untappd.com/b/aben-if-aben-and-lervig-made-a-stout/6433262",
    "rarity": 3,
    "why": "Collab imperial stout (Oct 2025), 577 ratings, sold in DK"
  },
  "4504": {
    "grade": "B-",
    "rating": 3.94,
    "count": 577,
    "url": "https://untappd.com/b/aben-if-aben-and-lervig-made-a-stout/6433262",
    "rarity": 3,
    "why": "Collab imperial stout (Oct 2025), 577 ratings, sold in DK"
  },
  "4601": {
    "grade": null,
    "rating": null,
    "count": null,
    "url": null,
    "rarity": 1,
    "why": "No/low (non-beer) item poured all sessions; sold in DK shops [Untappd note: non-beer no/low drink, not on Untappd]"
  },
  "4701": {
    "grade": null,
    "rating": null,
    "count": null,
    "url": null,
    "rarity": 1,
    "why": "No/low (non-beer) item poured all sessions; sold in DK shops [Untappd note: non-beer no/low drink, not on Untappd]"
  },
  "4702": {
    "grade": null,
    "rating": null,
    "count": null,
    "url": null,
    "rarity": 1,
    "why": "No/low (non-beer) item poured all sessions; sold in DK shops [Untappd note: non-beer no/low drink, not on Untappd]"
  },
  "4703": {
    "grade": null,
    "rating": null,
    "count": null,
    "url": null,
    "rarity": 1,
    "why": "No/low (non-beer) item poured all sessions; sold in DK shops [Untappd note: non-beer no/low drink, not on Untappd]"
  },
  "4704": {
    "grade": null,
    "rating": null,
    "count": null,
    "url": null,
    "rarity": 1,
    "why": "No/low (non-beer) item poured all sessions; sold in DK shops [Untappd note: non-beer no/low drink, not on Untappd]"
  },
  "4801": {
    "grade": null,
    "rating": null,
    "count": null,
    "url": null,
    "rarity": 1,
    "why": "No/low (non-beer) item poured all sessions; sold in DK shops [Untappd note: non-beer no/low drink, not on Untappd]"
  },
  "4901": {
    "grade": null,
    "rating": null,
    "count": null,
    "url": null,
    "rarity": 1,
    "why": "No/low (non-beer) item poured all sessions; sold in DK shops [Untappd note: non-beer no/low drink, not on Untappd]"
  },
  "4902": {
    "grade": null,
    "rating": null,
    "count": null,
    "url": null,
    "rarity": 1,
    "why": "No/low (non-beer) item poured all sessions; sold in DK shops [Untappd note: non-beer no/low drink, not on Untappd]"
  },
  "4903": {
    "grade": null,
    "rating": null,
    "count": null,
    "url": null,
    "rarity": 1,
    "why": "No/low (non-beer) item poured all sessions; sold in DK shops [Untappd note: non-beer no/low drink, not on Untappd]"
  },
  "4904": {
    "grade": null,
    "rating": null,
    "count": null,
    "url": null,
    "rarity": 1,
    "why": "No/low (non-beer) item poured all sessions; sold in DK shops [Untappd note: non-beer no/low drink, not on Untappd]"
  },
  "5001": {
    "grade": null,
    "rating": 2.96,
    "count": 31,
    "url": "https://untappd.com/b/hello-lager-hello-lager-british-helles/6716173",
    "rarity": 1,
    "why": "No/low alcohol-free lager, poured all sessions [Untappd note: 0.5% alcohol-free]"
  },
  "5002": {
    "grade": null,
    "rating": 3.2,
    "count": 25,
    "url": "https://untappd.com/b/hello-lager-hello-lager-top-w-lemon/6716216",
    "rarity": 1,
    "why": "No/low alcohol-free lager, poured all sessions [Untappd note: 0.5% alcohol-free]"
  },
  "5003": {
    "grade": null,
    "rating": 3.12,
    "count": 24,
    "url": "https://untappd.com/b/hello-lager-hello-lager-grapefruit/6716214",
    "rarity": 1,
    "why": "No/low alcohol-free lager, poured all sessions [Untappd note: 0.5% alcohol-free]"
  },
  "5004": {
    "grade": null,
    "rating": 3.28,
    "count": 25,
    "url": "https://untappd.com/b/hello-lager-hello-lager-peach/6716220",
    "rarity": 1,
    "why": "No/low alcohol-free lager, poured all sessions [Untappd note: 0.5% alcohol-free]"
  }
};
