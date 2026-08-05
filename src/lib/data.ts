export const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Mission', href: '#mission' },
  { label: 'Values', href: '#values' },
  { label: 'Services', href: '#services' },
  { label: 'Projects', href: '#projects' },
  { label: 'Community', href: '#community' },
  { label: 'Contact', href: '#contact' },
];

export const VALUES = [
  { title: 'Caring for the Globe', desc: 'Every decision weighed against its impact on our shared planet.', icon: 'globe' },
  { title: 'Long-term Value', desc: 'Building outcomes that endure for generations, not quarters.', icon: 'trending-up' },
  { title: 'Invest in People', desc: 'Empowering teams and communities to lead the green transition.', icon: 'users' },
  { title: 'Excellence in Service', desc: 'Uncompromising rigor in every audit, model, and certification.', icon: 'award' },
  { title: 'Responsible Business', desc: 'Operating as we advise — transparent, accountable, ethical.', icon: 'scale' },
  { title: 'Greener Future', desc: 'Anticipating the standards of tomorrow, today.', icon: 'leaf' },
  { title: 'Trusted Sustainability Partner', desc: 'A confidant through every stage of the building lifecycle.', icon: 'handshake' },
] as const;

export const LEADERS = [
  { name: 'Founder & Director', role: 'Strategy & Vision', bio: 'Guides the firm\'s mission to make sustainability standard practice across the built environment.', initials: 'FD' },
  { name: 'Associate Director', role: 'Green Building Practice', bio: 'Leads certification programs and technical delivery across LEED, IGBC, GRIHA, and WELL.', initials: 'AD' },
  { name: 'Vice President', role: 'ESG & Climate', bio: 'Heads ESG strategy, climate action planning, and net-zero roadmap development.', initials: 'VP' },
  { name: 'Advisory Consultant', role: 'Energy & Performance', bio: 'Specialist in energy modelling, commissioning, and operational performance optimization.', initials: 'AC' },
  { name: 'Marketing Consultant', role: 'Brand & Communications', bio: 'Shapes the narrative connecting sustainability outcomes with business value.', initials: 'MC' },
];

export const SERVICES = [
  { title: 'Building Commissioning', desc: 'Verified performance from design intent through occupancy.', cat: 'Performance' },
  { title: 'Energy Modelling', desc: 'Simulated energy performance to optimize design decisions.', cat: 'Performance' },
  { title: 'Lighting Simulation', desc: 'Daylight and artificial lighting analysis for comfort and efficiency.', cat: 'Performance' },
  { title: 'Air Quality Testing', desc: 'Indoor air quality assessment for healthy, productive spaces.', cat: 'Performance' },
  { title: 'Energy Audit', desc: 'Comprehensive energy use analysis with reduction roadmap.', cat: 'Audit' },
  { title: 'Waste & Water Audit', desc: 'Resource flow analysis to minimize waste and water demand.', cat: 'Audit' },
  { title: 'Fire Audit', desc: 'Life safety compliance and fire risk evaluation.', cat: 'Audit' },
  { title: 'LEED Certification', desc: 'USGBC LEED rating advisory across all project types.', cat: 'Certification' },
  { title: 'IGBC Certification', desc: 'Indian Green Building Council rating systems expertise.', cat: 'Certification' },
  { title: 'GRIHA Certification', desc: 'National rating system guidance for sustainable habitats.', cat: 'Certification' },
  { title: 'EDGE Certification', desc: 'IFC EDGE resource efficiency certification support.', cat: 'Certification' },
  { title: 'WELL Certification', desc: 'IWELL health and wellness standard implementation.', cat: 'Certification' },
  { title: 'Climate Action Planning', desc: 'Roadmaps aligning operations with science-based targets.', cat: 'Strategy' },
  { title: 'Net Zero Strategy', desc: 'Pathways to net-zero carbon across operations and value chain.', cat: 'Strategy' },
  { title: 'GHG Accounting', desc: 'Greenhouse gas inventory development across Scopes 1-3.', cat: 'Strategy' },
  { title: 'ESG Review', desc: 'Environmental, social, and governance performance assessment.', cat: 'Strategy' },
  { title: 'CDP Reporting', desc: 'Climate disclosure aligned with CDP framework requirements.', cat: 'Reporting' },
  { title: 'Sustainability Data Management', desc: 'Systems to track, validate, and report sustainability metrics.', cat: 'Reporting' },
];

export const CERTIFICATIONS = [
  { name: 'LEED', full: 'Leadership in Energy & Environmental Design', desc: 'USGBC' },
  { name: 'IGBC', full: 'Indian Green Building Council', desc: 'CII' },
  { name: 'GRIHA', full: 'Green Rating for Integrated Habitat Assessment', desc: 'TERI' },
  { name: 'EDGE', full: 'Excellence in Design for Greater Efficiencies', desc: 'IFC' },
  { name: 'WELL', full: 'WELL Building Standard', desc: 'IWBI' },
  { name: 'WiredScore', full: 'Digital Infrastructure Certification', desc: 'WiredScore' },
];

export const PROJECTS = [
  { name: 'Google', location: 'India Campus', cert: 'LEED Platinum', desc: 'Sustainability consulting for high-performance workplace design.' },
  { name: 'Infosys', location: 'Development Centre', cert: 'LEED Gold', desc: 'Green building certification and energy performance optimization.' },
  { name: 'TCS', location: 'Corporate Park', cert: 'IGBC Platinum', desc: 'End-to-end sustainability advisory across campus operations.' },
  { name: 'Schneider Electric', location: 'Innovation Hub', cert: 'Net Zero', desc: 'Net-zero strategy and GHG accounting roadmap development.' },
  { name: 'Juniper Networks', location: 'R&D Facility', cert: 'LEED Gold', desc: 'Energy modelling and lighting simulation for R&D environments.' },
  { name: 'Hexaware', location: 'Global Tech Centre', cert: 'EDGE', desc: 'Resource efficiency certification and water audit.' },
  { name: 'Prestige', location: 'Mixed-Use Development', cert: 'IGBC Gold', desc: 'Sustainability master planning across residential and commercial towers.' },
  { name: 'ICICI', location: 'Corporate Office', cert: 'LEED Platinum', desc: 'Building commissioning and indoor air quality testing.' },
  { name: 'DHL', location: 'Logistics Hub', cert: 'EDGE Advanced', desc: 'Energy audit and operational performance improvement program.' },
  { name: 'EMC', location: 'Data Centre', cert: 'LEED Gold', desc: 'Climate action planning and ESG review for mission-critical facilities.' },
  { name: 'Barclays', location: 'Global Campus', cert: 'WELL Gold', desc: 'WELL certification and occupant wellness strategy.' },
  { name: 'Raheja', location: 'Residential Township', cert: 'GRIHA 4-Star', desc: 'GRIHA certification and sustainable habitat planning.' },
];

export const COLLABORATIONS = [
  'Google', 'Infosys', 'TCS', 'Schneider Electric', 'Juniper Networks',
  'Hexaware', 'Prestige', 'ICICI', 'DHL', 'EMC', 'Barclays', 'Raheja',
  'USGBC', 'IGBC', 'GRIHA', 'IFC', 'IWBI', 'WiredScore',
];

export const LIFECYCLE_STEPS = [
  { phase: 'Concept', desc: 'Sustainability goals, site analysis, and feasibility defined at the earliest design intent.', icon: 'lightbulb' },
  { phase: 'Design', desc: 'Energy modelling, daylight simulation, and material strategy integrated into architectural plans.', icon: 'pen-tool' },
  { phase: 'Construction', desc: 'Commissioning, waste management, and air quality oversight during the build phase.', icon: 'hammer' },
  { phase: 'Occupancy', desc: 'Certification delivery, indoor environmental quality verification, and performance handover.', icon: 'home' },
  { phase: 'Operations', desc: 'Energy audits, GHG accounting, and continuous performance optimization over the asset\'s life.', icon: 'activity' },
];

export const STATS = [
  { value: 50, suffix: '+', label: 'Projects Certified' },
  { value: 12, suffix: 'M sq.ft', label: 'Green Building Area' },
  { value: 6, suffix: '', label: 'Rating Systems' },
  { value: 30, suffix: '%', label: 'Avg. Energy Reduction' },
];

export const CONTACT = {
  corporate: {
    label: 'Corporate Office',
    address: '[Corporate office address — to be provided]',
  },
  registered: {
    label: 'Registered Office',
    address: '[Registered office address — to be provided]',
  },
  email: 'contact@resilientearth.solutions',
  phone: '+91 [phone number — to be provided]',
};
