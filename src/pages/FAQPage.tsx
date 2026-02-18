export default function FAQPage() {
  const faqs = [
    {
      id: 1,
      question: "What is Enterprise /User section?",
      answer:
        "This section is specifically developed for enterprises /Companies /Corporates to create the digital visiting cards of their employees on our AddMy App . Just buy credits of your need and get it started",
    },
    {
      id: 2,
      question: "What are Operators?",
      answer:
        "Operators are the users created by the Enterprise user to manage the employees on his behalf. An operator user can create /manage employees of the organization just like the Enterprise user",
    },
    {
      id: 3,
      question: "What are the employees?",
      answer:
        "Enterprise user / Operator can create Addmy digital visiting cards for their staff. They will be the normal user on our APP. The difference is these users can only view information and add contacts to their list. They will not be allowed to update any information of their profile also will not be allowed to delete any contact from contact list",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-6">
        Frequently Asked Questions
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
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
