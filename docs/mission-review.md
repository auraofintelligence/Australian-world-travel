# Mission address review

The missions page retains the identities of the original 141 records. Its old embedded array is historical evidence only, never a current-contact fallback. Country labels and row numbers remain stable even where the current office's name, type or address differs.

The visible cards use `data/missions-reviewed.js`, generated from the reviewed source file in the neighbouring `aura-horn-torus` repository. The mirror includes the source URL and a content hash. This local script format works both on GitHub Pages and when opening the HTML file directly.

The page's styling is also local, in `assets/missions.css`; it no longer depends on a third-party styling runtime or font download. The source snapshot's `historicalSourceSha256` describes the archival HTML baseline, not this newly revised page. The mirror's separate `sourceSha256` identifies the reviewed JSON it copies.

## Snapshot checked 6 September 2026

All 141 historical records remain present. There are 137 checked office addresses and 137 map positions: 124 source-backed building/property points and 13 clearly labelled approximate city positions. Four records remain without map points: two official operational notices and two non-resident representations. An approximate city position is not an office entrance. These are dated snapshot counts, not a claim about every diplomatic office currently operating in Australia.

## Refreshing the page

First finish the official-source review and coordinate checks in `aura-horn-torus`. Then, from this repository, run:

```powershell
python tools/sync_missions_review.py
python tools/sync_missions_review.py --check
```

Review the resulting cards and counts before committing either repository. A mirror refresh does not publish the website. Keep the two repositories' reviewed snapshots in sync.

## What the labels mean

An address checked against official sources is separate from a matched map position. `held` means there is no published map point; it does not establish that the mission has closed. Cards distinguish addresses awaiting coordinates from operational notices, non-resident representation, and unresolved identity or address questions. Read the specific evidence before drawing conclusions.

The checked date is a source-review date, not a guarantee of present services, staff, appointments or visitor access. Only records marked `mapped` offer a globe link. Their point describes an address-matched building or property, not a verified entrance.

No staff, telephone, email or residential-contact fields are copied. Unverified historical website links are not rendered. Where DFAT lists multiple sections, the source pipeline separates the main chancery or consulate from trade, education, defence and other subsidiary offices.

## Sources

Use the exact official evidence linked by each record. The starting directories are the [DFAT diplomatic list](https://protocol.dfat.gov.au/Public/MissionsInAustralia) and [DFAT consular list](https://protocol.dfat.gov.au/Public/ConsulatesInAustralia). Office-source attribution follows [DFAT's copyright policy](https://www.dfat.gov.au/about-us/about-this-website/copyright), subject to source-specific exceptions.

Position evidence has two sources: [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), under ODbL 1.0, and [ACTGOV ADDRESSES](https://www.arcgis.com/home/item.html?id=13427dc77da340a29dd6601af4d7484d), © Australian Capital Territory, under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Each mapped record identifies its coordinate source and matching evidence. An ACT Government address point is not an OpenStreetMap-derived point; preserve that distinction when exporting or reusing records. Neither source verifies an entrance or visitor access.

The combined geocoded mission compilation mirrored here is provided under ODbL 1.0 with its original source attributions retained, not the site's general code licence. The ACT source remains attributed under CC BY 4.0. See the source project's [mission data licence and attribution notes](https://auraofintelligence.github.io/aura-horn-torus/data/MISSIONS-LICENCE.md) for the full scope and source-specific rights.

This is a repair of the historical list, not a claim that every current diplomatic or consular office in Australia has been included. `abroad.html`, which lists Australian offices overseas, is outside this change.
