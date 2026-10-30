"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, SkipForward, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fixtureDataset } from "@/data/fixtures";
import { PlannerShell } from "@/features/planning/PlannerShell";
import { usePlanning } from "@/features/planning/PlanningProvider";
import type { PantryItem } from "@/types";

const exclusionNames: Record<string, string> = {
  pork: "หมู",
  poultry: "ไก่และสัตว์ปีก",
};

function parseOptionalNumber(value: string): number | undefined | null {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseBahtToSatang(value: string): number | undefined | null {
  if (value.trim() === "") return undefined;
  if (!/^\d+(?:\.\d{0,2})?$/.test(value.trim())) return null;
  const baht = Number(value);
  const satang = Math.round(baht * 100);
  return Number.isSafeInteger(satang) ? satang : null;
}

export function PreferencesScreen() {
  const router = useRouter();
  const { preferences, pantry: savedPantry, savePreferences, skipPreferences } = usePlanning();
  const supportedTags = useMemo(
    () => [...new Set(fixtureDataset.recipes.flatMap((recipe) => recipe.exclusionTags))].sort(),
    [],
  );
  const ingredientById = useMemo(
    () => new Map(fixtureDataset.ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [],
  );
  const [budget, setBudget] = useState(
    preferences?.maxCheckoutBudgetSatang === undefined ? "" : (preferences.maxCheckoutBudgetSatang / 100).toFixed(2),
  );
  const [protein, setProtein] = useState(
    preferences?.minProteinGPerServing === undefined ? "" : String(preferences.minProteinGPerServing),
  );
  const [excludedTags, setExcludedTags] = useState<string[]>(preferences?.excludedTags ? [...preferences.excludedTags] : []);
  const [pantry, setPantry] = useState<PantryItem[]>(savedPantry.map((item) => ({ ...item })));
  const [newIngredientId, setNewIngredientId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pantryError, setPantryError] = useState<string | null>(null);

  const availableIngredients = fixtureDataset.ingredients.filter(
    (ingredient) => !pantry.some((item) => item.ingredientId === ingredient.id),
  );

  function updatePantry(ingredientId: string, input: string) {
    if (input.trim() === "") {
      setPantryError("กรอกจำนวนเป็น 0 g ขึ้นไป");
      return;
    }
    const edibleGrams = Number(input);
    if (!Number.isFinite(edibleGrams) || edibleGrams < 0) {
      setPantryError("ปริมาณของในครัวต้องเป็นตัวเลขตั้งแต่ 0 g ขึ้นไป");
      return;
    }
    setPantryError(null);
    setError(null);
    setPantry((current) => current.map((item) =>
      item.ingredientId === ingredientId ? { ...item, edibleGrams } : item,
    ));
  }

  function addPantryItem() {
    if (!newIngredientId || pantry.some((item) => item.ingredientId === newIngredientId)) return;
    setPantry((current) => [...current, { ingredientId: newIngredientId, edibleGrams: 0 }]);
    setNewIngredientId("");
    setPantryError(null);
    setError(null);
  }

  function submitPreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const budgetSatang = parseBahtToSatang(budget);
    const proteinGrams = parseOptionalNumber(protein);
    if (budgetSatang === null || proteinGrams === null) {
      setError("ตรวจสอบงบเป็นบาท (ทศนิยมไม่เกิน 2 ตำแหน่ง) และเป้าหมายโปรตีนอีกครั้ง");
      return;
    }
    if (pantryError) {
      setError("แก้ปริมาณของในครัวที่ยังไม่ถูกต้องก่อน");
      return;
    }

    savePreferences({
      ...(budgetSatang === undefined ? {} : { maxCheckoutBudgetSatang: budgetSatang }),
      ...(proteinGrams === undefined ? {} : { minProteinGPerServing: proteinGrams }),
      excludedTags,
    }, pantry);
    router.push("/meals");
  }

  function continueWithoutPreferences() {
    skipPreferences();
    router.push("/meals");
  }

  return (
    <PlannerShell
      step={1}
      title="อยากให้แผนอาหารคำนึงถึงอะไรบ้าง?"
      description="บอกงบ โปรตีน หรือวัตถุดิบที่อยากเว้นไว้ได้ รวมถึงของที่มีในครัว ทุกช่องเลือกเว้นว่างหรือข้ามขั้นตอนนี้ได้"
    >
      <form onSubmit={submitPreferences} noValidate className="max-w-4xl">
        <div className="grid gap-8 rounded-xl border border-border bg-card p-5 sm:p-7 md:grid-cols-2">
          <div className="space-y-6">
            <div>
              <Label htmlFor="checkout-budget">งบที่จ่ายตอนซื้อ (บาท)</Label>
              <div className="relative mt-2">
                <Input
                  id="checkout-budget"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={budget}
                  onChange={(event) => { setBudget(event.target.value); setError(null); }}
                  placeholder="เช่น 120.00"
                  aria-describedby="checkout-budget-help"
                  aria-invalid={Boolean(error && parseBahtToSatang(budget) === null)}
                  className="h-11 bg-background pr-12 tabular-nums"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">฿</span>
              </div>
              <p id="checkout-budget-help" className="mt-2 text-xs leading-5 text-muted-foreground">
                เทียบกับเงินซื้อแพ็กเต็ม ไม่ใช่ต้นทุนเฉพาะส่วนที่ใช้
              </p>
            </div>

            <div>
              <Label htmlFor="protein-goal">โปรตีนขั้นต่ำต่อคน (g)</Label>
              <Input
                id="protein-goal"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={protein}
                onChange={(event) => { setProtein(event.target.value); setError(null); }}
                placeholder="เช่น 25"
                aria-describedby="protein-goal-help"
                aria-invalid={Boolean(error && parseOptionalNumber(protein) === null)}
                className="mt-2 h-11 bg-background tabular-nums"
              />
              <p id="protein-goal-help" className="mt-2 text-xs leading-5 text-muted-foreground">
                ถ้าข้อมูลโภชนาการไม่ครบ เราจะบอกว่ายังยืนยันเป้าหมายไม่ได้
              </p>
            </div>

            <fieldset className="space-y-3 border-t border-border pt-5">
              <legend className="mb-3 text-sm font-semibold">มีวัตถุดิบที่อยากเว้นไหม?</legend>
              {supportedTags.map((tag) => {
                const checked = excludedTags.includes(tag);
                return (
                  <label key={tag} className="flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted/70">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => setExcludedTags((current) => event.target.checked
                        ? [...current, tag]
                        : current.filter((value) => value !== tag))}
                      className="size-4 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    />
                    <span>ไม่เอาเมนูที่มี{exclusionNames[tag] ?? tag}</span>
                  </label>
                );
              })}
              <p className="text-xs leading-5 text-muted-foreground">ตัวเลือกนี้เป็นการกรองเมนูตามข้อมูลตัวอย่าง ไม่ใช่การรับรองความปลอดภัยจากสารก่อภูมิแพ้</p>
            </fieldset>
          </div>

          <section aria-labelledby="pantry-heading" className="border-t border-border pt-5 md:border-l md:border-t-0 md:pl-7 md:pt-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="pantry-heading" className="text-base font-semibold">ของที่มีในครัว</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">ใส่เฉพาะวัตถุดิบที่อยากให้นำไปหักจากรายการซื้อ</p>
              </div>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">เลือกใส่ได้</span>
            </div>

            <div className="mt-5 space-y-3">
              {pantry.length === 0 ? (
                <p className="border-y border-dashed border-border py-4 text-sm text-muted-foreground">ยังไม่ได้เพิ่มวัตถุดิบ</p>
              ) : (
                <ul className="divide-y divide-border">
                  {pantry.map((item) => {
                    const ingredient = ingredientById.get(item.ingredientId);
                    return (
                      <li key={item.ingredientId} className="grid grid-cols-[minmax(0,1fr)_7rem_2rem] items-center gap-2 py-3">
                        <span className="min-w-0 text-sm">{ingredient?.nameTh ?? item.ingredientId}</span>
                        <div className="relative">
                          <Input
                            aria-label={`ปริมาณ${ingredient?.nameTh ?? item.ingredientId}ที่มีในครัว (กรัม)`}
                            type="number"
                            min="0"
                            step="1"
                            value={item.edibleGrams}
                            onChange={(event) => updatePantry(item.ingredientId, event.target.value)}
                            className="h-9 bg-background pr-8 text-right tabular-nums"
                          />
                          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">g</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`นำ${ingredient?.nameTh ?? item.ingredientId}ออกจากรายการ`}
                          onClick={() => {
                            setPantry((current) => current.filter((row) => row.ingredientId !== item.ingredientId));
                            setPantryError(null);
                            setError(null);
                          }}
                        >
                          <X aria-hidden="true" />
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {availableIngredients.length > 0 ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div className="space-y-2">
                  <Label htmlFor="new-pantry-ingredient">เพิ่มวัตถุดิบ</Label>
                  <select
                    id="new-pantry-ingredient"
                    value={newIngredientId}
                    onChange={(event) => setNewIngredientId(event.target.value)}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">เลือกวัตถุดิบ</option>
                    {availableIngredients.map((ingredient) => <option key={ingredient.id} value={ingredient.id}>{ingredient.nameTh}</option>)}
                  </select>
                </div>
                <Button type="button" variant="outline" className="mt-auto h-10" onClick={addPantryItem} disabled={!newIngredientId}>
                  <Plus aria-hidden="true" /> เพิ่ม
                </Button>
              </div>
            ) : null}
            {pantryError ? <p className="mt-3 text-sm text-destructive" role="alert">{pantryError}</p> : null}
          </section>
        </div>

        {error ? <p className="mt-4 text-sm text-destructive" role="alert">{error}</p> : null}
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="outline" className="h-11" onClick={continueWithoutPreferences}>
            <SkipForward aria-hidden="true" /> ข้ามไปดูเมนูทั้งหมด
          </Button>
          <Button type="submit" className="h-11">
            ใช้ความชอบนี้แล้วดูเมนู <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </form>
    </PlannerShell>
  );
}
