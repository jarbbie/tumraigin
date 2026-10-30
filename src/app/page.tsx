export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-5 px-6 py-16 sm:px-10">
      <p className="text-sm font-semibold tracking-wide text-emerald-800">
        ทำไรกิน · วางแผนมื้ออาหารแบบไทย
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
        คิดเมนูให้พอดีกับงบ และของที่มีในครัว
      </h1>
      <p className="max-w-2xl text-lg leading-8 text-foreground/75">
        Tumraigin helps you explore meals and plan what to buy. This prototype is
        being built; meal calculations and demo data will be added in the next
        steps.
      </p>
    </main>
  );
}
