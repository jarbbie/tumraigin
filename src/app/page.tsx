import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <a
            href="#home"
            className="rounded-sm font-semibold tracking-tight text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <span className="block text-lg leading-6">ทำไรกิน</span>
            <span className="block text-xs font-normal text-muted-foreground">Tumraigin</span>
          </a>

          <div className="flex items-center gap-2 border-l-4 border-accent pl-3" aria-label="พื้นที่สาธิต พญาไท">
            <MapPin aria-hidden="true" className="size-4 shrink-0 text-primary" />
            <span className="text-sm font-medium">พญาไท</span>
            <Badge variant="outline">พื้นที่สาธิต</Badge>
          </div>
        </div>
      </header>

      <main
        id="home"
        className="mx-auto w-full max-w-7xl px-5 pb-14 pt-10 sm:px-8 sm:pt-14 lg:pb-20"
      >
        <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,0.92fr)_minmax(30rem,1.08fr)] xl:gap-x-20 xl:gap-y-6">
          <section aria-labelledby="home-heading" className="max-w-2xl xl:col-start-1 xl:row-start-1 xl:pt-5">
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="size-2.5 rounded-full bg-accent" aria-hidden="true" />
              ใช้พื้นที่สาธิตได้โดยไม่ต้องเปิด GPS
            </p>
            <h1
              id="home-heading"
              className="mt-6 text-[clamp(3rem,6vw,5.25rem)] font-semibold leading-[1.08] tracking-tight text-foreground"
            >
              <span className="block">คิดมื้อถัดไป</span>
              <span className="block">จากของในครัว</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
              ตั้งงบและเป้าหมายโปรตีนก่อนเลือกเมนู แล้วค่อยดูว่าต้องซื้ออะไรเพิ่ม
            </p>
          </section>

          <section
            id="ui-preview"
            aria-labelledby="preview-heading"
            className="w-full scroll-mt-8 xl:col-start-2 xl:row-span-2 xl:row-start-1"
          >
            <Card className="gap-0 rounded-xl border border-border py-0 shadow-none">
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-7 sm:py-6">
                <div className="space-y-1">
                  <h2 id="preview-heading" className="text-xl font-semibold tracking-tight">
                    ตั้งเงื่อนไขของมื้อนี้
                  </h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    ตัวอย่างช่องกรอกสำหรับหน้าค้นหาเมนู
                  </p>
                </div>
                <Badge variant="secondary">ตัวอย่างหน้าจอ</Badge>
              </CardHeader>

              <CardContent className="space-y-6 px-5 py-6 sm:px-7 sm:py-7">
                <p className="text-sm leading-6 text-muted-foreground">
                  ช่องกรอกนี้ยังไม่คำนวณราคา โภชนาการ หรือกรองเมนู
                </p>

                <div className="space-y-2">
                  <Label htmlFor="demo-area">พื้นที่ที่ต้องการดู</Label>
                  <select
                    id="demo-area"
                    defaultValue="phaya-thai"
                    aria-describedby="demo-area-note"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-base text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-sm"
                  >
                    <option value="phaya-thai">พญาไท · ที่ทำงาน (พื้นที่สาธิต)</option>
                    <option value="on-nut">อ่อนนุช · บ้าน (พื้นที่สาธิต)</option>
                  </select>
                  <p id="demo-area-note" className="text-xs leading-5 text-muted-foreground">
                    พื้นที่ตัวอย่าง ไม่ใช่ตำแหน่งจริง
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="budget-example">งบซื้อเพิ่มต่อมื้อ (บาท)</Label>
                    <Input
                      id="budget-example"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      placeholder="ระบุจำนวนเงิน"
                      aria-describedby="budget-example-note"
                      className="h-10 bg-background"
                    />
                    <p id="budget-example-note" className="text-xs leading-5 text-muted-foreground">
                      ใช้เงินที่ต้องจ่ายตอนซื้อของ
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="protein-example">โปรตีนขั้นต่ำต่อที่ (กรัม)</Label>
                    <Input
                      id="protein-example"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      placeholder="ระบุจำนวนกรัม"
                      aria-describedby="protein-example-note"
                      className="h-10 bg-background"
                    />
                    <p id="protein-example-note" className="text-xs leading-5 text-muted-foreground">
                      แสดงค่าต่อหนึ่งที่
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 border-t border-border pt-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] sm:items-start">
                  <div className="space-y-2">
                    <Label htmlFor="exclude-example">วัตถุดิบที่ไม่ต้องการ</Label>
                    <Input
                      id="exclude-example"
                      placeholder="ระบุวัตถุดิบ"
                      aria-describedby="exclude-example-note"
                      className="h-10 bg-background"
                    />
                    <p id="exclude-example-note" className="text-xs leading-5 text-muted-foreground">
                      ตัวอย่างตัวกรองแบบตัดออก
                    </p>
                  </div>

                  <div className="flex items-start gap-3 sm:pt-8">
                    <Checkbox id="exclude-toggle" aria-describedby="exclude-toggle-note" />
                    <div className="space-y-1">
                      <Label htmlFor="exclude-toggle">ใช้ตัวกรองนี้</Label>
                      <p id="exclude-toggle-note" className="text-xs leading-5 text-muted-foreground">
                        ตัวเลือกยังไม่กรองเมนูในหน้าตัวอย่าง
                      </p>
                    </div>
                  </div>
                </div>

                <Button type="button" size="lg" className="h-11 w-full" disabled>
                  ค้นหาเมนู
                </Button>
              </CardContent>
            </Card>
          </section>

          <ol
            className="mt-10 max-w-xl border-t border-border xl:col-start-1 xl:row-start-2 xl:mt-0"
            aria-label="ขั้นตอนวางแผนมื้ออาหาร"
          >
            <li className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-border py-4">
              <span className="font-semibold tabular-nums text-primary">01</span>
              <div>
                <p className="font-medium">ตั้งงบกับเป้าหมายโปรตีน</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  งบหมายถึงเงินที่ต้องจ่ายซื้อของเพิ่ม
                </p>
              </div>
            </li>
            <li className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-border py-4">
              <span className="font-semibold tabular-nums text-primary">02</span>
              <div>
                <p className="font-medium">เลือกเมนูที่ตรงเงื่อนไข</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  ตัวกรองที่เลือกจะตัดเมนูที่ไม่ต้องการออก
                </p>
              </div>
            </li>
            <li className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-border py-4">
              <span className="font-semibold tabular-nums text-primary">03</span>
              <div>
                <p className="font-medium">เช็กของที่มีและยอดซื้อเพิ่ม</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  คำนวณจากวัตถุดิบและขนาดแพ็กที่ระบุไว้
                </p>
              </div>
            </li>
          </ol>
        </div>

        <section aria-labelledby="data-promise-heading" className="mt-14 border-y border-border py-7 sm:mt-20 sm:py-9">
          <h2 id="data-promise-heading" className="max-w-2xl text-xl font-semibold tracking-tight sm:text-2xl">
            ค่าที่แสดงต้องบอกที่มาและข้อจำกัด
          </h2>
          <div className="mt-5 grid md:grid-cols-3">
            <div className="border-t border-border py-4 md:border-t-0 md:pr-6">
              <p className="font-medium">โภชนาการ</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                ค่าที่ไม่มีข้อมูลจะแสดงว่าไม่ทราบ
              </p>
            </div>
            <div className="border-t border-border py-4 md:border-l md:border-t-0 md:px-6">
              <p className="font-medium">เงินซื้อของ</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                แยกยอดจ่ายที่ร้านจากต้นทุนวัตถุดิบที่ใช้
              </p>
            </div>
            <div className="border-t border-border py-4 md:border-l md:border-t-0 md:pl-6">
              <p className="font-medium">ราคาและสต็อก</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                ราคาสาธิต · ไม่ได้ตรวจสอบสต็อกสาขา
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
