export function AboutSection() {


  return (
    <section className="relative py-24 overflow-hidden" style={{ backgroundColor: '#101010' }}>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center mb-16">
          <h2 className="mb-6 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Replace 100+ Hours of Work Every Month With a Single AI Employee
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed text-pretty mb-12">
            Our AI employees handle the tasks that drain your time, your money, and your energy — delivering instant, accurate results around the clock.
          </p>
          
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          <div className="group relative rounded-2xl p-8 transition-all border-2 border-[#60A5FA]/30 hover:border-[#60A5FA]/60" style={{ background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)', backdropFilter: 'blur(10px)' }}>
             <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#60A5FA]/40 to-[#2563EB]/30 transition-transform group-hover:scale-110 shadow-lg shadow-[#60A5FA]/20">
              <svg className="h-7 w-7 text-[#60A5FA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-white">Growth & Marketing</h3>
            <p className="text-sm text-gray-200 leading-relaxed">
              Digital marketing, content creation, social media, lead generation, and outreach — handled by your AI
              employee so you can focus on strategy and vision.
            </p>
          </div>

          <div className="group relative rounded-2xl p-8 transition-all border-2 border-[#A78BFA]/30 hover:border-[#A78BFA]/60" style={{ background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)', backdropFilter: 'blur(10px)' }}>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#A78BFA]/40 to-[#A855F7]/30 transition-transform group-hover:scale-110 shadow-lg shadow-[#A78BFA]/20">
              <svg className="h-7 w-7 text-[#A78BFA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-white">Support & Operations</h3>
            <p className="text-sm text-gray-200 leading-relaxed">
              Customer support, executive assistance, appointment setting, back-office tasks, and workflow automation —
              delegated to an AI employee that never needs a break.
            </p>
          </div>

          <div className="group relative rounded-2xl p-8 transition-all border-2 border-[#F472B6]/30 hover:border-[#F472B6]/60" style={{ background: 'linear-gradient(135deg, rgba(244, 114, 182, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)', backdropFilter: 'blur(10px)' }}>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#F472B6]/40 to-[#EC4899]/30 transition-transform group-hover:scale-110 shadow-lg shadow-[#F472B6]/20">
              <svg className="h-7 w-7 text-[#F472B6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-white">Built For Scale</h3>
            <p className="text-sm text-gray-200 leading-relaxed">
              Scale your business without hiring headaches. Add AI employees as you grow — each with a human persona,
              industry-trained workflows, and performance guarantees.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
