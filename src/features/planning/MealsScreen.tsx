"use client";

import Link from "next/link";
import { ArrowRight, Clock3, PackageCheck, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DisclosureNote, formatBaht, PlannerShell } from "@/features/planning/PlannerShell";
import { usePlanning } from "@/features/planning/PlanningProvider";

const statusText = {
  eligible: "เข้าเงื่อนไขที่ระบุ",
  unknown: "ข้อมูลบางส่วนยังไม่ครบ",
  ineligible: "ไม่ตรงเงื่อนไขที่ระบุ",
} as const;

const statusStyle = {
  eligible: "border-primary/30 bg-secondary text-primary",
  unknown: "border-accent/50 bg-accent/15 text-foreground",
  ineligible: "border-border bg-muted text-muted-foreground",
} as const;

function formatMetric(value: number | null, unit: string): string {
  return value === null ? "ไม่ทราบ" : `${new Intl.NumberFormat("th-TH", { maximumFractionDigits: 1 }).format(value)} ${unit}`;
}

export function MealsScreen() {
  const { rankedRecipes, rankingError, preferencesSkipped, selectedRecipeId } = usePlanning();

  const visibleRecipes = rankedRecipes?.filter((ranked) =>
    ranked.eligibility !== "ineligible" || ranked.recipeId === selectedRecipeId,
  ) ?? [];

  return (
    <PlannerShell
      step={2}
      title="เลือกเมนูที่อยากทำ"
      description="เปรียบเทียบเมนูจากปริมาณต่อสูตร โภชนาการที่คำนวณจากวัตถุดิบ และเงินซื้อแพ็กโดยประมาณ แล้วเปิดดูรายละเอียดก่อนเลือกแผน"
    >
      <div className="max-w-5xl">
        {preferencesSkipped ? (
          <div className="mb-6 flex flex-col gap-3 border-l-2 border-primary bg-secondary/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6">ยังไม่ได้ตั้งตัวกรอง จึงแสดงเมนูทั้งหมดที่มีข้อมูลคำนวณได้</p>
            <Link href="/preferences" className="shrink-0 text-sm font-semibold text-primary underline-offset-4 hover:underline">ตั้งความชอบ</Link>
          </div>
        ) : null}

        <DisclosureNote />
        {rankingError ? (
          <p className="mt-5 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive" role="alert">
            คำนวณเมนูไม่ได้: {rankingError}
          </p>
        ) : null}

        {!rankingError && visibleRecipes.length === 0 ? (
          <div className="mt-6 border-y border-border py-8">
            <h2 className="text-xl font-semibold">ยังไม่มีเมนูที่ตรงกับเงื่อนไขนี้</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">ลองปรับงบ โปรตีน หรือรายการที่เลือกเว้น เมนูที่ข้อมูลไม่ครบจะถูกแสดงพร้อมคำอธิบายเมื่อยังตรวจสอบได้</p>
            <Button nativeButton={false} render={<Link href="/preferences" />} className="mt-5 h-10">กลับไปปรับความชอบ <ArrowRight aria-hidden="true" /></Button>
          </div>
        ) : null}

        {visibleRecipes.length > 0 ? (
          <ol className="mt-5 divide-y divide-border border-y border-border" aria-label="เมนูตามผลคำนวณ">
            {visibleRecipes.map((ranked, index) => {
              const nutrition = ranked.nutrition.perServingTotals;
              const basket = ranked.selectedBasketCandidate;
              const totalCost = basket?.complete ? basket.checkoutCostSatang : null;
              const unpricedCount = basket?.unpricedIngredientIds.length ?? 0;
              return (
                <li key={ranked.recipeId} className="py-5 sm:py-6">
                  <article className="grid gap-5 md:grid-cols-[minmax(0,1fr)_17rem] md:gap-8">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                        <Badge variant="outline" className={statusStyle[ranked.eligibility]}>
                          {preferencesSkipped && ranked.eligibility === "eligible" ? "ยังไม่ได้กรอง" : statusText[ranked.eligibility]}
                        </Badge>
                        {ranked.recipeId === selectedRecipeId ? <Badge variant="secondary">แผนที่เลือกอยู่</Badge> : null}
                      </div>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{ranked.recipe.nameTh}</h2>
                      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5"><Clock3 aria-hidden="true" className="size-4" /> {ranked.recipe.minutes} นาที</span>
                        <span className="inline-flex items-center gap-1.5"><Utensils aria-hidden="true" className="size-4" /> {ranked.recipe.servings} ที่ต่อสูตร</span>
                        <span className="inline-flex items-center gap-1.5"><PackageCheck aria-hidden="true" className="size-4" /> {ranked.recipe.ingredientItems.length} วัตถุดิบ</span>
                      </p>
                      {ranked.reasons.some((reason) => reason.code !== "preferences_skipped") ? (
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                          {ranked.reasons.filter((reason) => reason.code !== "preferences_skipped").map((reason) => reason.message).join(" · ")}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-3 gap-3 border-t border-border pt-4 md:grid-cols-1 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                      <div>
                        <p className="text-xs text-muted-foreground">พลังงาน / คน</p>
                        <p className="mt-1 text-sm font-semibold tabular-nums">{formatMetric(nutrition.kcal, "kcal")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">โปรตีน / คน</p>
                        <p className="mt-1 text-sm font-semibold tabular-nums">{formatMetric(nutrition.proteinG, "g")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">เงินซื้อแพ็กโดยประมาณ</p>
                        <p className="mt-1 text-sm font-semibold tabular-nums">{formatBaht(totalCost)}</p>
                        {totalCost === null && unpricedCount > 0 ? <p className="mt-1 text-xs text-muted-foreground">ยังไม่มีราคา {unpricedCount} รายการ</p> : null}
                      </div>
                      <Button nativeButton={false} render={<Link href={`/recipes/${ranked.recipe.slug}`} />} variant="outline" className="col-span-3 mt-1 h-10 md:col-span-1">
                        ดูรายละเอียดเมนู <ArrowRight aria-hidden="true" />
                      </Button>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/preferences" className="text-sm text-primary underline-offset-4 hover:underline">แก้ความชอบและของในครัว</Link>
          {selectedRecipeId ? (
            <Button nativeButton={false} render={<Link href="/shopping-list" />} className="h-10">ไปยังแผนที่เลือก <ArrowRight aria-hidden="true" /></Button>
          ) : null}
        </div>
      </div>
    </PlannerShell>
  );
}
