# Curated prototype data

`fixtures.ts` exports a runtime-validated local dataset for the home-cooking planning prototype: 23 normalized ingredients, eight two-serving Thai-oriented recipes, one synthetic offer per ingredient, and one clearly fictitious demo-store point. Recipe amounts are raw edible grams; rice amounts are dry/raw weights before cooking. Recipes are editorial examples written for this prototype, not copied source recipes.

## Nutrition sources and limits

Most per-100-g nutrient values are transcribed from the **Concise ASEAN Food Composition Tables (2014)**, Institute of Nutrition, Mahidol University. Each record carries its ASEAN Food ID and the source URL in `nutritionSource.explanation`. This source presents typical population food values, not measurements of a particular person's meal. Parenthesized calculated values are retained as curated estimates. A source value of `0p`, `T` (trace), or `-` is represented as `null` where it means presumed zero, trace, or unreported; it is never silently turned into measured zero. For the light soy sauce row AAN98, the source gives values per 100 mL and density 1.207 g/mL, so the stored per-100-g values are divided by 1.207. The record explicitly states this conversion.

The generic cooking-oil profile uses USDA SR28 report entry NDB No. 42289 (corn and canola oil) as a proxy. No USDA FoodData Central ID has been verified or stored. The USDA describes FoodData Central data as public domain/CC0; the report URL, SR28 release, and NDB number are recorded in the ingredient's provenance explanation. This proxy is not a claim about a specific Thai retail oil.

### Reuse terms

The ASEANFOODS 2014 source states that copyright is retained, noncommercial users may use the data with appropriate acknowledgement, and reproduction for resale or other commercial uses (including educational purposes) may incur fees. This dataset is attributed for the noncommercial interview prototype. Confirm reuse permission with the Institute of Nutrition, Mahidol University, or replace these values before a commercial or educational product/service or broader redistribution. The USDA source states its data are CC0 1.0.

Sources:

- Institute of Nutrition, Mahidol University / ASEANFOODS, [The Concise ASEAN Food Composition Tables (2014)](https://inmu.mahidol.ac.th/aseanfoods/doc/OnlineASEAN_FCD_V1_2014.pdf) and its [composition-data page](https://inmu.mahidol.ac.th/aseanfoods/composition_data.html).
- USDA Agricultural Research Service, [SR28 fats and oils report](https://www.ars.usda.gov/ARSUserFiles/80400535/Data/SR/SR28/reports/sr28fg04.pdf) and [FoodData Central API/data guide](https://fdc.nal.usda.gov/api-guide/).

## Synthetic offers and store point

All offer prices and pack sizes are invented inputs for exercising later checkout arithmetic. They are marked `simulated`, use integer satang, and have `stockStatus: "unknown"`. They are not copied from a retailer and do not assert current price, a real product, stock, or branch coverage. The single store coordinate is the map's neutral demo center, marked **“จุดร้านจำลอง · ไม่ใช่สาขาจริง”**; it is not a real shop or retailer branch.

`demo-scenarios.ts` contains three different budget/protein/exclusion input profiles only. It stores no ranking results, nutrient totals, or basket outcomes; later domain functions must calculate those from the fixtures.

Nutrition and prices are estimates for demonstration, not medical guidance, allergy certification, or evidence of a purchase-ready basket. Unknown nutrient values remain `null`.
