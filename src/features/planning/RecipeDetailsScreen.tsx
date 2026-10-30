"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock3, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DisclosureNote, formatBaht, formatGrams, PlannerShell } from "@/features/planning/PlannerShell";
import { usePlanning } from "@/features/planning/PlanningProvider";
import { fixtureDataset } from "@/data/fixtures";
import type { Provenance } from "@/types";
import type { NutrientKey } from "@/lib/domain/calculate-recipe-nutrients";

const nutrientRows: { key: NutrientKey; label: string; unit: string }[] = [
  { key: "kcal", label: "พลังงาน", unit: "kcal" },
  { key: "proteinG", label: "โปรตีน", unit: "g" },
  { key: "carbG", label: "คาร์โบไฮเดรต", unit: "g" },
  { key: "fatG", label: "ไขมัน", unit: "g" },
  { key: "fiberG", label: "ใยอาหาร", unit: "g" },
  { key: "sodiumMg", label: "โซเดียม", unit: "mg" },
  { key: "calciumMg", label: "แคลเซียม", unit: "mg" },
  { key: "ironMg", label: "ธาตุเหล็ก", unit: "mg" },
];

function formatNutrient(value: number | null, unit: string): string {
  if (value === null) return "ไม่ทราบ";
  return `${new Intl.NumberFormat("th-TH", { maximumFractionDigits: 1 }).format(value)} ${unit}`;
}

type SourceDisplay = { key: string; label: string; itemLabel: string; url?: string };

function sourceDisplay(provenance: Provenance): SourceDisplay {
  switch (provenance.kind) {
    case "usda": return {
      key: provenance.sourceUrl,
      label: "USDA FoodData Central",
      itemLabel: `FDC #${provenance.fdcId}`,
      url: provenance.sourceUrl,
    };
    case "verified_catalog": return {
      key: provenance.sourceUrl,
      label: "แค็ตตาล็อกสินค้าที่ตรวจสอบแล้ว",
      itemLabel: "ค่าจากแค็ตตาล็อก",
      url: provenance.sourceUrl,
    };
    case "curated_estimate": {
      const aseanId = provenance.explanation.match(/ASEAN Food ID ([^,]+)/)?.[1];
      const sourceUrl = provenance.explanation.match(/Source:\s*(https:\/\/\S+)/)?.[1]?.replace(/[),.;]+$/, "");
      const usdaProxy = provenance.explanation.includes("USDA SR28");
      return {
        key: sourceUrl ?? provenance.explanation,
        label: aseanId
          ? "The Concise ASEAN Food Composition Tables (2014)"
          : usdaProxy ? "USDA SR28 · ค่าประเมินน้ำมันทั่วไป" : "ค่าประเมินที่เรียบเรียง",
        itemLabel: aseanId ? `ASEAN Food ID ${aseanId}` : usdaProxy ? "proxy · ไม่ได้ยืนยัน FDC ID" : "ค่าประเมิน",
        ...(sourceUrl ? { url: sourceUrl } : {}),
      };
    }
    case "simulated": return {
      key: provenance.explanation,
      label: "ข้อมูลจำลอง",
      itemLabel: provenance.explanation,
    };
  }
}

export function RecipeDetailsScreen() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { rankedRecipes, rankingError, selectedRecipeId, selectRecipe } = usePlanning();
  const recipe = fixtureDataset.recipes.find((item) => item.slug === params.slug);
  const ranked = recipe ? rankedRecipes?.find((item) => item.recipeId === recipe.id) : undefined;
  const ingredientById = new Map(fixtureDataset.ingredients.map((ingredient) => [ingredient.id, ingredient]));

  if (!recipe) {
    return (
      <PlannerShell step={2} title="ไม่พบเมนูนี้" description="เมนูอาจไม่มีในชุดข้อมูลตัวอย่างแล้ว กลับไปเลือกเมนูอื่นได้">
        <Button nativeButton={false} render={<Link href="/meals" />} variant="outline"><ArrowLeft aria-hidden="true" /> กลับไปดูเมนู</Button>
      </PlannerShell>
    );
  }

  const nutrition = ranked?.nutrition;
  const basket = ranked?.selectedBasketCandidate;
  const sourceReferences = nutrition?.sources ?? [];
  const sourceGroups = new Map<string, { label: string; url?: string; ingredients: string[] }>();
  sourceReferences.forEach((source) => {
    const detail = sourceDisplay(source.provenance);
    const ingredient = ingredientById.get(source.ingredientId);
    const group = sourceGroups.get(detail.key) ?? { label: detail.label, ...(detail.url ? { url: detail.url } : {}), ingredients: [] };
    group.ingredients.push(`${ingredient?.nameTh ?? source.ingredientId} · ${detail.itemLabel}`);
    sourceGroups.set(detail.key, group);
  });

  return (
    <PlannerShell
      step={2}
      title={recipe.nameTh}
      description={`สูตรตัวอย่างสำหรับ ${recipe.servings} ที่ · เตรียมประมาณ ${recipe.minutes} นาที · อ่านปริมาณวัตถุดิบก่อนปรุงและข้อมูลที่มาประกอบการคำนวณ`}
    >
      <div className="grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <div className="min-w-0">
          <section aria-labelledby="ingredients-heading" className="border-y border-border">
            <div className="flex items-end justify-between gap-4 py-4">
              <div>
                <h2 id="ingredients-heading" className="text-xl font-semibold">วัตถุดิบในสูตร</h2>
                <p className="mt-1 text-sm text-muted-foreground">น้ำหนักส่วนที่กินได้ก่อนปรุง · ปริมาณรวมสำหรับ {recipe.servings} ที่</p>
              </div>
              <Badge variant="outline" className="shrink-0">{recipe.ingredientItems.length} รายการ</Badge>
            </div>
            <ul className="divide-y divide-border">
              {recipe.ingredientItems.map((item) => {
                const ingredient = ingredientById.get(item.ingredientId);
                return (
                  <li key={item.ingredientId} className="flex items-baseline justify-between gap-4 py-3 text-sm">
                    <span>{ingredient?.nameTh ?? item.ingredientId}</span>
                    <span className="shrink-0 font-mono tabular-nums text-muted-foreground">{formatGrams(item.edibleGrams)}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="method-heading" className="mt-8">
            <div className="flex items-center gap-2">
              <Clock3 aria-hidden="true" className="size-4 text-primary" />
              <h2 id="method-heading" className="text-xl font-semibold">วิธีทำ</h2>
            </div>
            <ol className="mt-4 space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={`${recipe.id}-step-${index}`} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
                  <span className="flex size-8 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold text-primary">{index + 1}</span>
                  <p className="pt-1 text-sm leading-6">{instruction}</p>
                </li>
              ))}
            </ol>
            <p className="mt-5 border-l-2 border-accent bg-accent/10 px-3 py-2 text-xs leading-5 text-muted-foreground">{recipe.sourceNote}</p>
          </section>
        </div>

        <aside className="space-y-7 lg:border-l lg:border-border lg:pl-7">
          <section aria-labelledby="nutrition-heading">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">คำนวณจากวัตถุดิบ</p>
                <h2 id="nutrition-heading" className="mt-1 text-xl font-semibold">ต่อ 1 ที่</h2>
              </div>
              <span className="text-xs text-muted-foreground">สูตรนี้ {recipe.servings} ที่</span>
            </div>
            {rankingError || !nutrition ? (
              <p className="mt-4 text-sm text-destructive" role="alert">คำนวณโภชนาการไม่ได้{rankingError ? `: ${rankingError}` : ""}</p>
            ) : (
              <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
                {nutrientRows.map(({ key, label, unit }) => {
                  const complete = nutrition.completeness[key];
                  const value = nutrition.perServingTotals[key];
                  return (
                    <div key={key} className="bg-card px-3 py-3">
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="mt-1 flex flex-wrap items-baseline gap-1.5 font-semibold tabular-nums">
                        <span>{formatNutrient(value, unit)}</span>
                        {!complete ? <span className="text-[0.65rem] font-normal text-muted-foreground">ข้อมูลไม่ครบ</span> : null}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            )}
            <p className="mt-3 text-xs leading-5 text-muted-foreground">คำนวณจากน้ำหนักดิบและค่าต่อ 100 g ที่มี ไม่รวมการเปลี่ยนแปลงจากการปรุง; ค่าที่ขาดจะแสดงว่าไม่ทราบ</p>
          </section>

          <section aria-labelledby="source-heading" className="border-t border-border pt-5">
            <h2 id="source-heading" className="text-base font-semibold">ที่มาของข้อมูลโภชนาการ</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">วัตถุดิบที่ใช้คำนวณ {sourceReferences.length} รายการ</p>
            <ul className="mt-3 space-y-3">
              {[...sourceGroups.entries()].map(([key, group]) => (
                <li key={key} className="text-xs leading-5 text-muted-foreground">
                  <p className="font-semibold text-foreground">{group.label}</p>
                  <p>{group.ingredients.join(" · ")}</p>
                  {group.url ? <a className="mt-1 inline-block text-primary underline underline-offset-2" href={group.url} target="_blank" rel="noreferrer">เปิดแหล่งข้อมูล ↗</a> : null}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="cost-heading" className="border-t border-border pt-5">
            <h2 id="cost-heading" className="text-base font-semibold">เงินซื้อแพ็กโดยประมาณ</h2>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{formatBaht(basket?.complete ? basket.checkoutCostSatang : null)}</p>
            {basket && !basket.complete ? <p className="mt-1 text-xs leading-5 text-muted-foreground">ยอดที่ทราบ {formatBaht(basket.knownCheckoutSubtotalSatang)} · ยังขาดราคา {basket.unpricedIngredientIds.length} รายการ</p> : null}
            <div className="mt-3"><DisclosureNote /></div>
          </section>

          <div className="flex flex-col gap-2 border-t border-border pt-5">
            <Button
              className="h-11"
              onClick={() => {
                selectRecipe(recipe.id);
                router.push("/shopping-list");
              }}
            >
              <ShoppingBag aria-hidden="true" /> {selectedRecipeId === recipe.id ? "ดูรายการซื้อของแผนนี้" : "เลือกเมนูนี้เป็นแผน"} <ArrowRight aria-hidden="true" />
            </Button>
            <Button nativeButton={false} render={<Link href="/meals" />} variant="ghost" className="h-10">
              <ArrowLeft aria-hidden="true" /> กลับไปเปรียบเทียบเมนู
            </Button>
          </div>
        </aside>
      </div>
    </PlannerShell>
  );
}
