export default function RetirementTimelineMockup() {
  const milestones = [
    { year: '1994', title: 'Started as Junior Analyst', description: 'Joined the team fresh out of college' },
    { year: '2001', title: 'Promoted to Senior Manager', description: 'Led the regional expansion project' },
    { year: '2010', title: 'Director of Operations', description: 'Grew the department from 12 to 85 people' },
    { year: '2024', title: 'Retirement', description: '30 years of excellence and leadership' },
  ];

  return (
    <div
      className="relative w-full overflow-hidden bg-[#FFF8F2]"
      style={{
        aspectRatio: '4/5',
        maxWidth: '100vw',
        maxHeight: '100vh',
      }}
    >
      <div className="absolute inset-0 flex flex-col p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#2B1E18] mb-2">
            Career Milestones
          </h2>
          <p className="text-lg text-[#6B5B52]">
            Three decades of impact
          </p>
        </div>

        {/* Timeline */}
        <div className="flex-1 space-y-6">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex gap-4">
              {/* Year Badge */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-[#FF6B57] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {milestone.year}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold text-[#2B1E18] text-lg mb-1">
                  {milestone.title}
                </h3>
                <p className="text-sm text-[#6B5B52]">
                  {milestone.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
