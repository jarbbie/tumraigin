"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, ShoppingBasket, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DisclosureNote, formatBaht, formatGrams, PlannerShell } from "@/features/planning/PlannerShell";
import { usePlanning } from "@/features/planning/PlanningProvider";
import { fixtureDataset } from "@/data/fixtures";

function PantryAmountInput({
  ingredientName,
  amount,
  onAmountChange,
}: {
  ingredientName: string;
  amount: number;
  onAmountChange: (value: number) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  function update(value: string) {
    if (value.trim() === "") {
      setError("กรอกจำนวน 0 g ขึ้นไป");
      return;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError("จำนวนต้องเป็นตัวเลขตั้งแต่ 0 g ขึ้นไป");
      return;
    }
    setError(null);
    onAmountChange(parsed);
  }

  const inputId = `pantry-${ingredientName.replace(/[^\p{L}\p{N}-]+/gu, "-")}`;
  return (
    <div className="max-w-[9rem]">
      <label htmlFor={inputId} className="sr-only">ปริมาณ{ingredientName}ที่มีในครัว (กรัม)</label>
      <div className="relative">
        <Input
          id={inputId}
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          defaultValue={String(amount)}
          onBlur={(event) => update(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className="h-9 bg-background pr-8 text-right tabular-nums"
        />
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">g</span>
      </div>
      {error ? <p id={`${inputId}-error`} className="mt-1 text-xs leading-4 text-destructive" role="alert">{error}</p> : null}
    </div>
  );
}

export function ShoppingListScreen() {
  const { rankedRecipes, rankingError, selectedRecipeId, pantry, removeSelectedRecipe, setPantryQuantity } = usePlanning();
  const ranked = rankedRecipes?.find((item) => item.recipeId === selectedRecipeId);
  const basket = ranked?.selectedBasketCandidate;
  const ingredientById = new Map(fixtureDataset.ingredients.map((ingredient) => [ingredient.id, ingredient]));
  const pantryById = new Map(pantry.map((item) => [item.ingredientId, item.edibleGrams]));

  if (!selectedRecipeId || !ranked) {
    return (
      <PlannerShell step={3} title="รายการซื้อของ" description="เลือกเมนูที่อยากทำ แล้วรายการนี้จะคำนวณปริมาณที่ขาดและจำนวนแพ็กจากของที่มี">
        {rankingError ? <p className="mb-5 text-sm text-destructive" role="alert">คำนวณรายการไม่ได้: {rankingError}</p> : null}
        <div className="max-w-3xl border-y border-border py-8">
          <ShoppingBasket aria-hidden="true" className="size-7 text-primary" />
          <h2 className="mt-3 text-xl font-semibold">ยังไม่ได้เลือกเมนู</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">ดูตัวเลือกและรายละเอียดก่อนเลือกหนึ่งเมนูเป็นแผนทำอาหาร รายการซื้อจะคำนวณจากสูตรกับของที่คุณมี</p>
          <Button nativeButton={false} render={<Link href="/meals" />} className="mt-5 h-10">ไปเลือกเมนู <ArrowRight aria-hidden="true" /></Button>
        </div>
      </PlannerShell>
    );
  }

  return (
    <PlannerShell
      step={3}
      title="ของที่ต้องซื้อสำหรับแผนนี้"
      description={`${ranked.recipe.nameTh} · ${ranked.recipe.servings} ที่ · แก้จำนวนของในครัวแล้วออกจากช่องเพื่อคำนวณรายการใหม่`}
    >
      <div className="grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="list-heading" className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 id="list-heading" className="text-xl font-semibold">รายการตามปริมาณที่ขาด</h2>
              <p className="mt-1 text-sm text-muted-foreground">ต้องใช้ เทียบกับ มีแล้ว แล้วจึงคำนวณแพ็กที่ต้องซื้อ</p>
            </div>
            <Button nativeButton={false} render={<Link href={`/recipes/${ranked.recipe.slug}`} />} variant="outline" size="sm">
              <ArrowLeft aria-hidden="true" /> กลับไปดูสูตร
            </Button>
          </div>

          {!basket ? (
            <p className="mt-5 text-sm text-destructive" role="alert">ยังคำนวณตัวเลือกตะกร้าไม่ได้ ลองกลับไปเลือกเมนูอีกครั้ง</p>
          ) : (
            <ul className="divide-y divide-border">
              {basket.lines.map((line, index) => {
                const ingredient = ingredientById.get(line.ingredientId);
                const name = ingredient?.nameTh ?? line.ingredientId;
                return (
                  <li key={line.ingredientId} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_9rem] sm:items-start">
                    <div className="min-w-0">
                      <h3 className="font-semibold">{name}</h3>
                      <dl className="mt-2 grid grid-cols-3 gap-2 text-xs leading-5">
                        <div><dt className="text-muted-foreground">ต้องใช้</dt><dd className="font-mono tabular-nums">{formatGrams(line.requiredGrams)}</dd></div>
                        <div><dt className="text-muted-foreground">มีแล้ว</dt><dd className="font-mono tabular-nums">{formatGrams(line.pantryGrams)}</dd></div>
                        <div><dt className="text-muted-foreground">ต้องหาเพิ่ม</dt><dd className="font-mono font-semibold tabular-nums">{formatGrams(line.shortageGrams)}</dd></div>
                      </dl>
                      {line.shortageGrams === 0 ? (
                        <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary"><Check aria-hidden="true" className="size-3.5" /> มีพอแล้ว ไม่ต้องซื้อ</p>
                      ) : line.purchase ? (
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          {line.purchase.packsNeeded} แพ็ก · {line.offer?.displayName ?? "แพ็กจำลอง"} · เหลือหลังทำ {formatGrams(line.purchase.leftoverGrams)}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs leading-5 text-destructive">ยังไม่มีราคาจำลองสำหรับปริมาณที่ขาด</p>
                      )}
                    </div>
                    <div className="sm:justify-self-end">
                      <PantryAmountInput
                        key={`${line.ingredientId}-${pantryById.get(line.ingredientId) ?? 0}`}
                        ingredientName={`${name}-${index}`}
                        amount={pantryById.get(line.ingredientId) ?? 0}
                        onAmountChange={(value) => setPantryQuantity(line.ingredientId, value)}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="h-fit rounded-xl border border-border bg-card p-5 sm:p-6 lg:sticky lg:top-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">สรุปแผน</p>
          <h2 className="mt-2 text-lg font-semibold">{ranked.recipe.nameTh}</h2>
          <p className="mt-1 text-sm text-muted-foreground">หนึ่งสูตร · {ranked.recipe.servings} ที่</p>
          <div className="my-5 border-t border-dashed border-border" />
          <p className="text-sm text-muted-foreground">เงินที่ต้องจ่ายตอนซื้อ</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{formatBaht(basket?.complete ? basket.checkoutCostSatang : null)}</p>
          {basket && !basket.complete ? (
            <p className="mt-2 text-xs leading-5 text-muted-foreground">ยอดที่ทราบ {formatBaht(basket.knownCheckoutSubtotalSatang)} · ราคาขาด {basket.unpricedIngredientIds.length} รายการ</p>
          ) : null}
          <dl className="mt-5 space-y-3 border-t border-border pt-4 text-sm">
            <div className="flex items-baseline justify-between gap-4"><dt className="text-muted-foreground">ต้นทุนส่วนที่ใช้</dt><dd className="font-medium tabular-nums">{formatBaht(basket?.complete ? basket.consumedCostSatang : null)}</dd></div>
            <div className="flex items-baseline justify-between gap-4"><dt className="text-muted-foreground">วัตถุดิบที่ต้องซื้อ</dt><dd className="font-medium tabular-nums">{basket?.coverage.neededIngredientCount ?? 0} รายการ</dd></div>
            <div className="flex items-baseline justify-between gap-4"><dt className="text-muted-foreground">รายการที่มีราคา</dt><dd className="font-medium tabular-nums">{basket?.coverage.pricedIngredientCount ?? 0} รายการ</dd></div>
          </dl>
          <div className="mt-5"><DisclosureNote /></div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">ราคากับขนาดแพ็กเป็นข้อมูลสาธิตระดับชุดข้อมูล ไม่ใช่ราคาหรือสต็อกของร้านจริง</p>
          <Button
            type="button"
            variant="ghost"
            className="mt-4 h-10 w-full text-destructive hover:text-destructive"
            onClick={removeSelectedRecipe}
          >
            <Trash2 aria-hidden="true" /> นำเมนูนี้ออกจากแผน
          </Button>
        </aside>
      </div>
    </PlannerShell>
  );
}
