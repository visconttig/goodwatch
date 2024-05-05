export default function Disclaimer() {
  return (
    <div className="flex flex-col items-center mt-0 py-2 md:py-4 lg:py-8">
      <h1 className="mb-8 text-3xl font-semibold">GoodWatch Disclaimer</h1>

      <h2 className="mb-4 text-2xl">Impressum</h2>
      <section className="prose prose-invert lg:prose-xl mx-auto">
        <p>
          <div>Alper Ortac</div>
          <div>Kassel, Germany</div>
          <div> alportac@gmail.com</div>
        </p>
      </section>

      <h2 className="mt-16 mb-4 text-2xl">Legal Disclaimer</h2>
      <section className="prose prose-invert lg:prose-xl mx-auto">
        <p>
          The information provided by GoodWatch (“we,” “us” or “our”) on goodwatch.com (the “Site”) is for general informational purposes only. All information on the Site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Site.
        </p>
        <p>
          Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the site or reliance on any information provided on the site. Your use of the site and your reliance on any information on the site is solely at your own risk.
        </p>
      </section>
    </div>
  );
}
