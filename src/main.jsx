import React from 'react';
import { createRoot } from 'react-dom/client';
import { ShieldCheck, Wrench, MapPin, Phone, Mail, CheckCircle2, ArrowRight, BadgeCheck } from 'lucide-react';
import './styles.css';

const equipment = [
  {
    name: 'Tracked Spider Lift',
    status: 'Featured Listing',
    location: 'United States',
    price: 'Call for Pricing',
    specs: ['Compact access', 'Indoor/outdoor applications', 'Inspection available'],
    verified: true,
  },
  {
    name: 'Aerial Lift Equipment',
    status: 'Coming Soon',
    location: 'Nationwide',
    price: 'Request Details',
    specs: ['Seller listings', 'Buyer inquiries', 'ATEMS support available'],
    verified: false,
  },
  {
    name: 'Used Lift Inventory',
    status: 'Accepting Listings',
    location: 'Nationwide',
    price: 'List Your Unit',
    specs: ['Seller packages', 'Featured placement', 'Inspection upgrade option'],
    verified: false,
  },
];

function App() {
  return (
    <main>
      <nav className="nav">
        <div className="brand">
          <div className="logoMark">A</div>
          <div>
            <strong>ATEMS Lift Exchange</strong>
            <span>Service-backed equipment listings</span>
          </div>
        </div>
        <div className="navLinks">
          <a href="#equipment">Equipment</a>
          <a href="#inspections">Inspections</a>
          <a href="#sell">Sell</a>
          <a href="#contact" className="navButton">Contact</a>
        </div>
      </nav>

      <section className="hero">
        <div className="heroContent">
          <p className="eyebrow">Buy • Sell • Inspect • Support</p>
          <h1>Buy and sell aerial lift equipment with confidence.</h1>
          <p className="heroText">
            ATEMS Lift Exchange connects serious buyers and sellers with service-backed support, equipment insight, and nationwide inspection options.
          </p>
          <div className="heroActions">
            <a href="#equipment" className="primary">Browse Equipment <ArrowRight size={18}/></a>
            <a href="#sell" className="secondary">List Your Equipment</a>
          </div>
          <div className="trustRow">
            <span><CheckCircle2 size={18}/> Technician-informed listings</span>
            <span><CheckCircle2 size={18}/> Nationwide inspection options</span>
            <span><CheckCircle2 size={18}/> Buyer confidence</span>
          </div>
        </div>
        <div className="heroCard">
          <p>Featured Service</p>
          <h2>ATEMS Verified</h2>
          <p>Upgrade qualified equipment listings with condition review support to help buyers make a stronger inquiry.</p>
          <BadgeCheck className="heroIcon" size={70}/>
        </div>
      </section>

      <section className="section" id="equipment">
        <div className="sectionHeader">
          <p className="eyebrow">Current Listings</p>
          <h2>Equipment available for serious buyers</h2>
          <p>Use this section to add new equipment, update pricing, or remove sold units.</p>
        </div>
        <div className="grid">
          {equipment.map((item) => (
            <article className="listing" key={item.name}>
              <div className="imagePlaceholder">
                {item.verified && <span className="verified">ATEMS Verified</span>}
                <Wrench size={54}/>
              </div>
              <div className="listingBody">
                <p className="status">{item.status}</p>
                <h3>{item.name}</h3>
                <div className="meta"><MapPin size={16}/>{item.location}</div>
                <strong className="price">{item.price}</strong>
                <ul>
                  {item.specs.map((spec) => <li key={spec}>{spec}</li>)}
                </ul>
                <a href="#contact" className="cardButton">Request Info</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="split" id="inspections">
        <div>
          <p className="eyebrow">Inspection Services</p>
          <h2>Need eyes on a machine before you buy?</h2>
          <p>
            For non-verified listings, ATEMS offers on-site inspections for serious buyers. We travel to the equipment location and provide a field-based condition review to help buyers make a more informed decision.
          </p>
          <a href="#contact" className="primary">Request Inspection Quote</a>
        </div>
        <div className="panel">
          <h3>Buyer Requested Inspection</h3>
          <p>Inspection pricing is provided privately based on equipment location, scope, and travel requirements.</p>
          <ul className="checkList">
            <li><ShieldCheck size={18}/> On-site visual and operational review</li>
            <li><ShieldCheck size={18}/> Photos, notes, and condition summary</li>
            <li><ShieldCheck size={18}/> Hydraulics, structure, controls, electrical review</li>
          </ul>
        </div>
      </section>

      <section className="section dark" id="sell">
        <div className="sectionHeader">
          <p className="eyebrow">Sell Your Equipment</p>
          <h2>List with more confidence.</h2>
          <p>Give serious buyers better information and a stronger reason to inquire. Choose a standard listing, featured listing, or upgrade qualified equipment to ATEMS Verified.</p>
        </div>
        <div className="featureRow">
          {['Standard equipment listing', 'Featured placement options', 'ATEMS Verified upgrade', 'Buyer inquiry support', 'Service-backed credibility'].map((item) => (
            <div className="feature" key={item}><CheckCircle2 size={20}/>{item}</div>
          ))}
        </div>
        <a href="#contact" className="primary">Start a Seller Listing</a>
      </section>

      <section className="contact" id="contact">
        <div>
          <p className="eyebrow">Contact ATEMS</p>
          <h2>Ready to buy or sell lift equipment?</h2>
          <p>Send your equipment details, buyer request, or inspection inquiry and ATEMS will follow up.</p>
        </div>
        <div className="contactCard">
          <a href="mailto:atemsusa1@gmail.com"><Mail size={18}/> atemsusa1@gmail.com</a>
          <a href="tel:"><Phone size={18}/> Add phone number here</a>
          <p>Website: www.atemsliftservice.com</p>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
