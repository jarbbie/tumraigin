import Link from "next/link";
import { ArrowLeft, BookOpen, Calculator, Database, MapPinned, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fixtureDataset } from "@/data/fixtures";
import { PlannerShell } from "@/features/planning/PlannerShell";

const fixtureCounts = {
  ingredients: fixtureDataset.ingredients.length,
  recipes: fixtureDataset.recipes.length,
  offers: fixtureDataset.productOffers.length,
  stores: fixtureDataset.stores.length,
};

const sourceLinks = [
  {
    title: "ASEANFOODS · The Concise ASEAN Food Composition Tables (2014)",
    href: "https://inmu.mahidol.ac.th/aseanfoods/doc/OnlineASEAN_FCD_V1_2014.pdf",
    detail: "แหล่งค่าประกอบอาหารส่วนใหญ่ในชุดข้อมูลนี้; เป็นค่าประเมินจากข้อมูลอาหารทั่วไป ไม่ใช่การวัดอาหารจานที่คุณทำ",
  },
  {
    title: "USDA Agricultural Research Service · SR28 fats and oils report",
    href: "https://www.ars.usda.gov/ARSUserFiles/80400535/Data/SR/SR28/reports/sr28fg04.pdf",
    detail: "ใช้เป็น proxy สำหรับน้ำมันปรุงอาหารทั่วไปเท่านั้น; ไม่ได้ยืนยัน USDA FoodData Central ID และไม่ใช่ผลิตภัณฑ์น้ำมันไทยที่ระบุยี่ห้อ",
  },
  {
    title: "OpenStreetMap · copyright and ODbL",
    href: "https://www.openstreetmap.org/copyright",
    detail: "ข้อมูลแผนที่ฐานมี attribution บนแผนที่; ใบอนุญาตข้อมูล ODbL แยกจากนโยบายการให้บริการแผนที่",
  },
  {
    title: "Photon · place-name search",
    href: "https://github.com/komoot/photon",
    detail: "ค้นหาจากข้อมูล OpenStreetMap เมื่อผู้ใช้กดส่งคำค้น; public demo ใช้ได้ในปริมาณเหมาะสมและไม่มีการรับประกัน uptime",
  },
  {
    title: "OpenStreetMap · tile usage policy",
    href: "https://operations.osmfoundation.org/policies/tiles/",
    detail: "ผู้ให้บริการแผนที่เห็นคำขอ tile สำหรับบริเวณแผนที่ที่เปิดดู; tile อาจโหลดไม่ได้และไม่จำเป็นต่อการคำนวณอาหาร",
  },
] as const;

export function AboutScreen() {
  return (
    <PlannerShell
      step={null}
      title="ข้อมูลและข้อจำกัด"
      description="ตรวจดูที่มาของข้อมูล วิธีคำนวณ และสิ่งที่ต้นแบบนี้ยังยืนยันไม่ได้"
    >
      <div className="max-w-4xl space-y-10">
        <section aria-labelledby="demo-notice-heading" className="border-l-4 border-accent bg-accent/15 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">อ่านก่อนใช้ผลลัพธ์</p>
              <h2 id="demo-notice-heading" className="mt-1 text-lg font-semibold">ค่าราคาและข้อมูลร้านเป็นตัวอย่างจำลอง</h2>
              <p className="mt-2 text-sm leading-6">
                สูตรอาหารและผลคำนวณใช้ข้อมูลวัตถุดิบที่เรียบเรียงไว้ ราคาและขนาดแพ็กเป็นตัวอย่างจำลอง ไม่ใช่ราคาหรือสินค้าจริงของผู้ค้าปลีก จุดร้านในชุดข้อมูลปัจจุบันเป็นจุดจำลอง ไม่ใช่สาขาจริง และไม่ได้ตรวจสอบสต็อกสาขา โปรดตรวจสอบราคาและสินค้าเองก่อนซื้อ
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                โภชนาการเป็นค่าประมาณจากวัตถุดิบดิบ ไม่ใช่การวิเคราะห์อาหารที่ปรุงแล้ว และไม่ใช่คำแนะนำทางการแพทย์หรือการรับรองว่าอาหารปลอดสารก่อภูมิแพ้
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="dataset-heading">
          <div className="flex items-center gap-2">
            <Database aria-hidden="true" className="size-5 text-primary" />
            <h2 id="dataset-heading" className="text-xl font-semibold">ข้อมูลที่ใช้ในต้นแบบ</h2>
          </div>
          <dl className="mt-4 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            <div className="bg-card p-4">
              <dt className="text-sm font-semibold">วัตถุดิบ</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{fixtureCounts.ingredients} รายการ · ค่าต่อ 100 g สำหรับคำนวณ</dd>
            </div>
            <div className="bg-card p-4">
              <dt className="text-sm font-semibold">สูตรอาหาร</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{fixtureCounts.recipes} สูตรตัวอย่างที่เรียบเรียงสำหรับต้นแบบ</dd>
            </div>
            <div className="bg-card p-4">
              <dt className="text-sm font-semibold">สินค้าและราคา</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{fixtureCounts.offers} ข้อเสนอจำลอง · ไม่ใช่ราคาตลาด</dd>
            </div>
            <div className="bg-card p-4">
              <dt className="text-sm font-semibold">จุดร้าน</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{fixtureCounts.stores} จุดสาธิต · ไม่ใช่ร้านหรือสาขาจริง</dd>
            </div>
          </dl>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            สูตรในแอปเป็นตัวอย่างเรียบเรียง ไม่ได้คัดลอกจากแหล่งสูตร และยังไม่ได้ผ่านการทบทวนโดยผู้เชี่ยวชาญสูตรอาหารอย่างอิสระ
          </p>
        </section>

        <section aria-labelledby="nutrition-data-heading" className="border-t border-border pt-7">
          <div className="flex items-center gap-2">
            <BookOpen aria-hidden="true" className="size-5 text-primary" />
            <h2 id="nutrition-data-heading" className="text-xl font-semibold">ที่มาและความไม่แน่นอนของโภชนาการ</h2>
          </div>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
            <li>ค่าของวัตถุดิบส่วนใหญ่มาจากตาราง ASEANFOODS ปี 2014 และระบุรหัสอาหารต้นทางไว้กับข้อมูล ค่าดังกล่าวเป็นข้อมูลอาหารทั่วไปและใช้เป็นค่าประเมิน ไม่ใช่ค่าที่วัดจากวัตถุดิบของผู้ใช้</li>
            <li>ค่าน้ำมันปรุงอาหารทั่วไปใช้รายงาน USDA SR28 เป็นตัวแทน ไม่ได้ยืนยัน FDC ID และไม่ได้แทนน้ำมันยี่ห้อหรือสูตรใดโดยเฉพาะ</li>
            <li>ระบบคูณค่าต่อ 100 g ด้วยกรัมส่วนที่กินได้ของวัตถุดิบแต่ละรายการ รวมเป็นทั้งสูตร แล้วหารด้วยจำนวนที่ระบุในสูตร น้ำหนักเป็นน้ำหนักดิบก่อนปรุงและไม่ได้จำลองการสูญเสียน้ำหรือสารอาหารจากการปรุง</li>
            <li>เมื่อค่าแหล่งข้อมูลไม่มีหรือไม่แน่ชัด ค่าจะแสดงเป็น “ไม่ทราบ” หรือ “ข้อมูลไม่ครบ” ไม่แทนด้วยศูนย์โดยอัตโนมัติ สัดส่วนต่อหนึ่งที่จึงเป็นค่าประมาณ</li>
          </ul>
        </section>

        <section aria-labelledby="calculation-heading" className="border-t border-border pt-7">
          <div className="flex items-center gap-2">
            <Calculator aria-hidden="true" className="size-5 text-primary" />
            <h2 id="calculation-heading" className="text-xl font-semibold">วิธีคำนวณแผนและรายการซื้อ</h2>
          </div>
          <ol className="mt-4 space-y-4 text-sm leading-6">
            <li><strong>ความชอบ:</strong> งบเทียบกับเงินซื้อแพ็กเต็ม โปรตีนเป็นกรัมต่อหนึ่งที่ และรายการที่เลือกเว้นเป็นตัวกรองเมนู หากข้ามขั้นตอน ความชอบเหล่านี้จะไม่ถูกใช้เป็นตัวกรอง</li>
            <li><strong>ของในครัว:</strong> รวมปริมาณวัตถุดิบที่สูตรต้องใช้ก่อน แล้วหักปริมาณที่มีเพียงครั้งเดียว ปริมาณที่ต้องซื้อเพิ่มไม่ต่ำกว่าศูนย์</li>
            <li><strong>แพ็กและเงิน:</strong> ปัดจำนวนแพ็กขึ้นให้พอกับปริมาณที่ขาด แสดงเงินที่ต้องจ่ายซื้อแพ็กแยกจากต้นทุนประมาณของส่วนที่ใช้จริง ถ้าขาดราคา รายการรวมจะแสดงว่าไม่ครบแทนการแสดงเป็นศูนย์</li>
            <li><strong>ระยะทางร้าน:</strong> เป็นระยะเส้นตรงโดยประมาณจากพิกัด ไม่ใช่ระยะขับรถ เส้นทางแนะนำ หรือเวลาเดินทาง</li>
          </ol>
        </section>

        <section aria-labelledby="sources-heading" className="border-t border-border pt-7">
          <h2 id="sources-heading" className="text-xl font-semibold">แหล่งข้อมูลและใบอนุญาต</h2>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {sourceLinks.map((source) => (
              <li key={source.href} className="py-4">
                <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                  {source.title} ↗
                </a>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{source.detail}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            ASEANFOODS ระบุเงื่อนไขการใช้แบบไม่แสวงหากำไรพร้อมการอ้างอิง และการนำไปขายต่อหรือใช้ในผลิตภัณฑ์/บริการเพื่อการศึกษาอาจมีค่าใช้จ่าย ต้นแบบนี้จึงไม่ยืนยันสิทธิ์สำหรับการใช้งานเชิงพาณิชย์หรือเผยแพร่ต่อในวงกว้าง ควรขออนุญาตหรือเปลี่ยนชุดข้อมูลก่อนใช้ในกรณีดังกล่าว ส่วนข้อมูล USDA ระบุสัญญาอนุญาต CC0
          </p>
        </section>

        <section aria-labelledby="privacy-heading" className="border-t border-border pt-7">
          <div className="flex items-center gap-2">
            <MapPinned aria-hidden="true" className="size-5 text-primary" />
            <h2 id="privacy-heading" className="text-xl font-semibold">สถานที่และความเป็นส่วนตัว</h2>
          </div>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
            <li>แอปไม่ขอพิกัด GPS ไม่ต้องสมัครสมาชิก และไม่ส่งชื่อหรือหมุดที่บันทึกไว้ไปยังเซิร์ฟเวอร์ของทำไรกิน สถานที่ที่บันทึกเก็บใน localStorage ของเบราว์เซอร์นี้เท่านั้น</li>
            <li>คำค้นชื่อสถานที่จะส่งไปยัง Photon/Komoot เมื่อกดปุ่มค้นหาเท่านั้น หากไม่ต้องการส่งชื่อหรือที่อยู่ส่วนตัว ให้แตะแผนที่วางหมุดเอง ระบบไม่ค้นหาระหว่างพิมพ์</li>
            <li>ผู้ให้บริการแผนที่ได้รับคำขอ tile สำหรับบริเวณที่คุณเปิดดู รายการบันทึกยังใช้ได้หาก tile โหลดไม่สำเร็จ</li>
            <li>หากกดลิงก์นำทาง พิกัดต้นทางและปลายทางจะถูกส่งให้ Google Maps เพื่อเปิดเส้นทาง การกดลิงก์เป็นการเลือกใช้บริการภายนอก</li>
          </ul>
        </section>

        <section aria-labelledby="limits-heading" className="border-t border-border pt-7">
          <h2 id="limits-heading" className="text-xl font-semibold">สิ่งที่ต้นแบบนี้ยังยืนยันไม่ได้</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            <li>ราคาปัจจุบัน สินค้าจริง หรือสินค้าที่มีในสาขาใดสาขาหนึ่ง</li>
            <li>ร้านหรือสาขาจริงจากจุดร้านตัวอย่าง และระยะทางหรือเวลาเดินทางจริง</li>
            <li>ความครบถ้วนของสารอาหาร ผลจากวิธีปรุง หรือความเหมาะสมสำหรับโรคและอาการแพ้</li>
          </ul>
        </section>

        <div className="border-t border-border pt-5">
          <Button nativeButton={false} render={<Link href="/" />} variant="outline" className="h-10">
            <ArrowLeft aria-hidden="true" /> กลับไปวางแผนอาหาร
          </Button>
        </div>
      </div>
    </PlannerShell>
  );
}
