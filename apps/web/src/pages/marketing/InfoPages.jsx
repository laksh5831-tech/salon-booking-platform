import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const PageShell = ({ title, subtitle, children }) => (
  <>
    <Helmet>
      <title>{title} - Velora</title>
    </Helmet>
    <div className="container py-5" style={{ minHeight: '60vh' }}>
      <div className="mb-5">
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--velora-dark)', fontSize: '2.5rem' }}>
          {title}
        </h1>
        {subtitle && <p className="text-muted" style={{ maxWidth: 600, fontSize: '1.05rem' }}>{subtitle}</p>}
      </div>
      {children}
      <div className="mt-5 pt-4">
        <Link to="/" className="btn-velora btn-velora-sm">
          <i className="bi bi-arrow-left"></i> Back to Home
        </Link>
      </div>
    </div>
  </>
);

const Section = ({ title, children }) => (
  <div className="mb-5">
    <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--velora-dark)' }}>{title}</h4>
    <div className="text-muted" style={{ lineHeight: 1.8, maxWidth: 800 }}>{children}</div>
  </div>
);

export const AboutPage = () => (
  <PageShell title="About Us" subtitle="Your beauty. Your time. Your stylist.">
    <Section title="Our Story">
      <p>
        Velora was founded with one clear mission: to make discovering a great salon and booking an
        appointment as simple and delightful as the experience itself. Born in Tamil Nadu and built for
        India, we connect customers with trusted, premium salons across the country.
      </p>
      <p>
        We believe your time matters. No more phone calls, waiting lists, or uncertainty. Browse real
        salons, view their services and prices, meet their stylists, and reserve your slot — all in under
        thirty seconds.
      </p>
    </Section>
    <Section title="Our Mission">
      <p>
        To empower beauty professionals and delight customers through a transparent, reliable, and
        modern booking platform. We help salon owners grow their business with tools for scheduling,
        staff management, payments, and customer reviews.
      </p>
    </Section>
    <Section title="Our Values">
      <p>
        <strong>Trust</strong> — verified salons and honest reviews.<br />
        <strong>Convenience</strong> — book anywhere, anytime.<br />
        <strong>Quality</strong> — only the best salons and stylists.<br />
        <strong>Community</strong> — we grow when our salons and customers grow.
      </p>
    </Section>
  </PageShell>
);

export const ContactPage = () => (
  <PageShell title="Contact Us" subtitle="We'd love to hear from you.">
    <Section title="Get in Touch">
      <p><i className="bi bi-envelope me-2"></i> hello@velora.demo</p>
      <p><i className="bi bi-telephone me-2"></i> +91 98400 00000</p>
      <p><i className="bi bi-geo-alt me-2"></i> T. Nagar, Chennai, Tamil Nadu, India</p>
      <p>
        Our support team is available every day from 9:00 AM to 9:00 PM IST. We typically respond
        within a few hours.
      </p>
    </Section>
    <Section title="Business Inquiries">
      <p>
        Own a salon and want to join Velora? Write to us at <a href="mailto:partners@velora.demo">partners@velora.demo</a> and
        our team will help you get listed and start receiving online bookings.
      </p>
    </Section>
  </PageShell>
);

export const HelpCenterPage = () => (
  <PageShell title="Help Center" subtitle="Frequently asked questions and helpful guides.">
    <Section title="How do I book an appointment?">
      <p>
        Browse salons near you, pick a service, choose your preferred stylist and time, then confirm.
        You can pay online or at the salon. You'll get an instant confirmation.
      </p>
    </Section>
    <Section title="Can I cancel or reschedule?">
      <p>
        Yes. Open your booking, choose a cancellation reason, and cancel from your bookings page. For
        rescheduling, cancel the existing booking and create a new one with your preferred time.
      </p>
    </Section>
    <Section title="How do I find a salon in my city?">
      <p>
        Use the search bar in the navigation or visit the salons page and filter by city and category.
        We currently feature salons across Tamil Nadu and more cities across India coming soon.
      </p>
    </Section>
    <Section title="How do payments work?">
      <p>
        Two options: <strong>Pay Now</strong> — pay securely online during booking. Or
        <strong>Pay at Salon</strong> — reserve your slot now and pay when you arrive. Keep track of all
        payments from your bookings page.
      </p>
    </Section>
  </PageShell>
);

export const PrivacyPage = () => (
  <PageShell title="Privacy Policy" subtitle="How we handle your information.">
    <Section title="Information We Collect">
      <p>
        We collect the information you provide when creating an account (name, email, phone number) and
        booking details for the salons you visit. Payment information is processed securely by our
        payment provider and is never stored on our servers in raw form.
      </p>
    </Section>
    <Section title="How We Use Information">
      <p>
        Your information is used to manage your bookings, communicate appointment updates, process
        payments, and improve our services. We never sell your personal data to third parties.
      </p>
    </Section>
    <Section title="Data Security">
      <p>
        We use industry standard encryption (HTTPS) and access controls to protect your data. Passwords
        are stored using strong, salted hashing. You may request deletion of your account and data at
        any time by contacting support.
      </p>
    </Section>
  </PageShell>
);

export const TermsPage = () => (
  <PageShell title="Terms of Service" subtitle="Please read these terms carefully.">
    <Section title="Using Velora">
      <p>
        By using Velora you agree to provide accurate information and to use the platform for lawful
        purposes only. You are responsible for maintaining the confidentiality of your account and
        password.
      </p>
    </Section>
    <Section title="Bookings & Payments">
      <p>
        Appointments you book are subject to the salon's availability and cancellation policy.
        Payments made online are processed securely. Refunds are handled according to the cancellation
        policy shown at the time of booking.
      </p>
    </Section>
    <Section title="Reviews">
      <p>
        You may only review a salon after visiting it. Reviews must be honest and respectful. Velora
        reserves the right to moderate or remove reviews that violate these guidelines.
      </p>
    </Section>
  </PageShell>
);

export const CareersPage = () => (
  <PageShell title="Careers" subtitle="Come build the future of beauty tech with us.">
    <Section title="Why Velora?">
      <p>
        We're a fast-growing team modernising the beauty industry in India. We care about great
        craftsmanship, delightful products, and respectful culture. Join us and help thousands of
        salons and customers thrive.
      </p>
    </Section>
    <Section title="Open Positions">
      <p>
        <strong>Full-Stack Developer</strong> — Bangalore / Chennai (Remote friendly)<br />
        <strong>Product Designer</strong> — Chennai (Hybrid)<br />
        <strong>Salon Partner Success Manager</strong> — Tamil Nadu (Travel)
      </p>
      <p>
        Don't see a perfect fit? Send your resume to <a href="mailto:careers@velora.demo">careers@velora.demo</a>.
      </p>
    </Section>
  </PageShell>
);

export const BlogPage = () => (
  <PageShell title="Blog" subtitle="Tips, trends, and stories from the beauty world.">
    <Section title="How to Choose the Right Hair Salon">
      <p>
        Look at portfolio photos, read recent reviews, check pricing transparency, and visit a salon
        that specialises in the service you need. A great stylist listens before they cut.
      </p>
    </Section>
    <Section title="5 Skincare Habits That Actually Work">
      <p>
        Consistency beats intensity. Cleanse gently, moisturise daily, always use sunscreen, hydrate,
        and get a professional deep-cleansing facial every month.
      </p>
    </Section>
    <Section title="Why Online Booking Matters for Salons">
      <p>
        Online booking reduces no-shows, saves reception time, and helps salons manage staff schedules
        efficiently. Customers love the convenience — book anytime, anywhere.
      </p>
    </Section>
  </PageShell>
);

export const MobileAppPage = () => (
  <PageShell title="Mobile App" subtitle="Velora in your pocket — book beauty on the go.">
    <Section title="Features">
      <p>
        <i className="bi bi-check-circle me-2 text-success"></i> Discover salons near you<br />
        <i className="bi bi-check-circle me-2 text-success"></i> Browse services, prices & stylists<br />
        <i className="bi bi-check-circle me-2 text-success"></i> Book in seconds with live availability<br />
        <i className="bi bi-check-circle me-2 text-success"></i> Track bookings and pay online<br />
        <i className="bi bi-check-circle me-2 text-success"></i> Get reminders and notifications
      </p>
    </Section>
    <Section title="Coming Soon">
      <p>
        The Velora mobile app is being built for both iOS and Android. Stay tuned — we'll announce it
        right here and in our newsletters. For now, the web app works beautifully on your phone too.
      </p>
    </Section>
  </PageShell>
);