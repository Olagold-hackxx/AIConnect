"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "What is an AI employee?",
      answer: "An AI employee is a digital worker that performs business tasks such as marketing, support, admin, lead generation, and more — all powered by AI."
    },
    {
      question: "How does StaffPilot work?",
      answer: "You choose a role → we configure your AI employee → you plug it into your business → it works 24/7."
    },
    {
      question: "Can an AI employee replace a human?",
      answer: "Yes, in many roles it performs faster, more consistently, and at a dramatically lower cost."
    },
    {
      question: "Is it hard to set up?",
      answer: "No — and our team can do everything for you."
    }
  ]

  return (
    <section className="relative py-24 overflow-hidden" style={{ backgroundColor: '#101010' }}>
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="mb-6 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const colors = [
              { border: 'border-[#60A5FA]/30', bg: 'linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)' },
              { border: 'border-[#A78BFA]/30', bg: 'linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)' },
              { border: 'border-[#F472B6]/30', bg: 'linear-gradient(135deg, rgba(244, 114, 182, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)' },
              { border: 'border-[#34D399]/30', bg: 'linear-gradient(135deg, rgba(52, 211, 153, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)' }
            ]
            const color = colors[index % colors.length]
            return (
              <div key={index} className={`rounded-xl overflow-hidden border-2 ${color.border}`} style={{ background: color.bg, backdropFilter: 'blur(10px)' }}>
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/10 transition-colors"
                >
                  <span className="text-lg font-semibold text-white">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-300 transition-transform ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-200">{faq.answer}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg text-gray-300 mb-6">
            Start Scaling Your Business Today — Hire Your First AI Employee
          </p>
          <p className="text-sm text-gray-400">
            (Free 7-Day Trial Included)
          </p>
        </div>
      </div>
    </section>
  )
}

