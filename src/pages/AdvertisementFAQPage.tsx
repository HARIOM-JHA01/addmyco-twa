import landingPageAdPreview from "../assets/landing-page-ad-preview.png";
import bottomBarAdPreview from "../assets/bottom-bar-ad-preview.png";

export default function AdvertisementFAQPage() {
  const faqs = [
    {
      id: 1,
      question: "What is this advertisement section?",
      answer:
        "Through this section we are allowing our users to promote their public telegram group /channels to reach millions of users.",
    },
    {
      id: 2,
      question: "Where my ads will be shown?",
      answer:
        "Your ads can be shown at two positions on our platform based on your choice",
      positions: [
        {
          title: "Landing page (Start Page of our miniapp)",
          image: landingPageAdPreview,
        },
        {
          title: "Circle at bottom of app (will be shown on pages)",
          image: bottomBarAdPreview,
        },
      ],
    },
    {
      id: 3,
      question: "How I can promote?",
      answer: "Simply buy credits of your choice and start promoting",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">
        Advertisement FAQ
      </h2>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition"
          >
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 text-blue-600">
              {faq.question}
            </h3>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed whitespace-pre-wrap">
              {faq.answer}
            </p>

            {faq.id === 2 && (
              <div className="mt-4 space-y-4">
                {faq.positions?.map((position, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-800 mb-3">
                      {position.title}
                    </p>
                    <img
                      src={position.image}
                      alt={position.title}
                      className="w-full max-w-xs mx-auto rounded-lg shadow-sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
