# Curated prototype data

`fixtures.ts` exports a runtime-validated local dataset for the home-cooking planning prototype: 23 normalized ingredients, eight two-serving Thai-oriented recipes, one synthetic offer per ingredient, and one clearly fictitious demo-store point. Recipe amounts are raw edible grams; rice amounts are dry/raw weights before cooking. Recipes are editorial examples written for this prototype, not copied source recipes.

## Nutrition sources and limits

All 23 per-100-g nutrient profiles were transcribed from the USDA FoodData Central **SR Legacy April 2018** JSON release. Each ingredient carries an FDC ID, the exact record description, the dataset source URL, and the date it was reviewed in `nutritionSource`. Fourteen ingredients use a direct generic-record match; nine use a clearly identified proxy because the release does not contain the exact Thai cultivar or product form. Proxy values are copied without adjustment, so the actual Thai ingredient may differ. The proxy record ID, source description, and target ingredient are recorded as structured provenance rather than parsed from display text.

Reported nutrients are copied in the dataset's per-100-g basis. Nutrients not reported in the source or marked as assumed zero are kept as `null`; a reported numeric zero remains zero. These are generic food composition values, not measurements of a user's ingredients or the cooked recipe. Cooking yield and nutrient retention are not modeled.

### Reuse terms

USDA states that FoodData Central data are public domain and published under **CC0 1.0 Universal**. It requests that applications list FoodData Central as the data source. The application uses the downloadable SR Legacy data and does not make API calls or require a USDA key.

Sources:

- USDA Agricultural Research Service, [FoodData Central downloadable datasets](https://fdc.nal.usda.gov/download-datasets/) (SR Legacy release date: April 2018) and [FoodData Central API/data guide, including licensing](https://fdc.nal.usda.gov/api-guide/).

## Synthetic offers and store point

All offer prices and pack sizes are invented inputs for exercising later checkout arithmetic. They are marked `simulated`, use integer satang, and have `stockStatus: "unknown"`. They are not copied from a retailer and do not assert current price, a real product, stock, or branch coverage. The single store coordinate is the map's neutral demo center, marked **“จุดร้านจำลอง · ไม่ใช่สาขาจริง”**; it is not a real shop or retailer branch.

`demo-scenarios.ts` contains three different budget/protein/exclusion input profiles only. It stores no ranking results, nutrient totals, or basket outcomes; later domain functions must calculate those from the fixtures.

Nutrition and prices are estimates for demonstration, not medical guidance, allergy certification, or evidence of a purchase-ready basket. Unknown nutrient values remain `null`.
