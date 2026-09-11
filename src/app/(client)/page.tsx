import Link from 'next/link'
import {
  ShieldAlert,
  MapPin,
  PhoneCall,
  UserCheck,
  Award,
  Car,
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  Ambulance,
  Search,
  Share2,
  CheckCircle2,
  Phone,
  Eye,
  Lock,
  Building,
  Radio,
  FileText,
  Sparkles,
  ExternalLink,
  Trash2,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PublicNavbar } from '@/components/navigation/PublicNavbar'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Modern Public Header */}
      <PublicNavbar />

      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-8 pb-14 sm:pt-14 sm:pb-20 lg:pt-20 lg:pb-28 border-b border-border/50">
          {/* Subtle Ambient Radial Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-primary/10 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-[380px] h-[280px] bg-emerald-500/10 blur-[110px] rounded-full pointer-events-none" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Live Network Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md mb-6 shadow-xs">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>Kenya's Verified Emergency Alert & Rapid Search Network</span>
            </div>

            {/* Main Punchy Human Headline */}
            <h1 className="max-w-4xl mx-auto text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.12]">
              When Seconds Count, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary via-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Community Brings Them Home
              </span>
            </h1>

            {/* Relatable, Citizen-Focused Subtitle */}
            <p className="mt-5 sm:mt-7 max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-muted-foreground px-3 leading-relaxed">
              CivilTrace connects families, neighbors, local police stations, and community volunteers across Kenya.
              When a loved one goes missing or a vehicle or motorbike is stolen, we mobilize an immediate, coordinated neighborhood search party.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 max-w-xl mx-auto px-4">
              <Link href="/dashboard/create-alert" className="w-full sm:w-auto">
                <Button size="lg" className="w-full gap-2 rounded-2xl bg-primary text-primary-foreground px-7 py-6 text-sm sm:text-base font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.02]">
                  <ShieldAlert className="h-5 w-5" />
                  Post an Emergency Alert
                </Button>
              </Link>
              <Link href="/map" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full gap-2 rounded-2xl px-6 py-6 text-sm sm:text-base font-bold border-border/80 bg-card/60 backdrop-blur-xs hover:bg-card">
                  <MapPin className="h-5 w-5 text-primary" />
                  Live Incident Map
                </Button>
              </Link>
              <Link href="/directory" className="w-full sm:w-auto">
                <Button size="lg" variant="ghost" className="w-full gap-2 rounded-2xl px-5 py-6 text-sm sm:text-base font-semibold text-muted-foreground hover:text-foreground">
                  <PhoneCall className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Police & Ambulances (250+)
                </Button>
              </Link>
            </div>

            {/* Human-Centric Impact Stats */}
            <div className="mt-14 sm:mt-18 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 max-w-4xl mx-auto px-2">
              <div className="rounded-3xl border border-border/70 bg-card/80 backdrop-blur-xs p-4 sm:p-6 shadow-xs text-left">
                <p className="text-2xl sm:text-3xl font-black text-primary">218+</p>
                <p className="mt-1 text-xs font-bold text-foreground">Police Stations</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Verified OCS desk lines across all 47 counties</p>
              </div>

              <div className="rounded-3xl border border-border/70 bg-card/80 backdrop-blur-xs p-4 sm:p-6 shadow-xs text-left">
                <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">40 Units</p>
                <p className="mt-1 text-xs font-bold text-foreground">Ambulance Services</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">24/7 Red Cross, St. John & trauma dispatch</p>
              </div>

              <div className="rounded-3xl border border-border/70 bg-card/80 backdrop-blur-xs p-4 sm:p-6 shadow-xs text-left">
                <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">100% Free</p>
                <p className="mt-1 text-xs font-bold text-foreground">Missing Persons</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Zero broadcast fees for families in crisis</p>
              </div>

              <div className="rounded-3xl border border-border/70 bg-card/80 backdrop-blur-xs p-4 sm:p-6 shadow-xs text-left">
                <p className="text-2xl sm:text-3xl font-black text-foreground">Legally Safe</p>
                <p className="mt-1 text-xs font-bold text-foreground">Enforcement Proxy</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Anchored by official police OB & public posts</p>
              </div>
            </div>
          </div>
        </section>

        {/* CRUCIAL SECTION: THE 4-STEP VERIFICATION PIPELINE */}
        <section className="py-14 sm:py-22 bg-muted/25 border-b border-border/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider inline-block">
                The Enforcement Proxy Model
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
                How It Works: Why We Require Police & Social Media Records
              </h2>
              <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
                CivilTrace never allows unverified alerts to originate directly on our platform.
                We act as a high-powered community <strong>echo</strong> for official records.
                Here is the step-by-step process and why every safeguard matters.
              </p>
            </div>

            <div className="mt-12 sm:mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* STEP 1: Police OB & Social Media Post */}
              <div className="relative rounded-3xl border-2 border-primary/40 bg-card p-6 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-xs">
                      1
                    </span>
                    <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[10px] font-bold uppercase">
                      The Legal Anchor
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                    Report to Police & Post Publicly on Social Media
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="rounded-xl bg-muted/50 p-2.5 border border-border/50">
                      <span className="font-bold text-primary block text-[11px] uppercase tracking-wider">The How:</span>
                      <p className="text-muted-foreground mt-0.5 leading-relaxed">
                        1. File a report at your nearest police station to obtain an official <strong>Occurrence Book (OB) Number</strong>.<br />
                        2. Publish an emergency post on your public <strong>Facebook or X (Twitter)</strong> account with recent photos and details.
                      </p>
                    </div>

                    <div className="rounded-xl bg-amber-500/10 p-2.5 border border-amber-500/20">
                      <span className="font-bold text-amber-600 dark:text-amber-400 block text-[11px] uppercase tracking-wider">The Crucial "Why":</span>
                      <p className="text-muted-foreground mt-0.5 leading-relaxed">
                        Direct posting without public records can be weaponized for defamation, debt-shaming, false accusations, or stalking. By acting as a verified proxy, the legal burden of truth stays with the police and the original poster.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 2: Submit with OB & Post Link */}
              <div className="relative rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-foreground font-black text-xs">
                      2
                    </span>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                      Verification Echo
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                    Submit to CivilTrace with Your OB & Post URL
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="rounded-xl bg-muted/50 p-2.5 border border-border/50">
                      <span className="font-bold text-foreground block text-[11px] uppercase tracking-wider">The How:</span>
                      <p className="text-muted-foreground mt-0.5 leading-relaxed">
                        Enter your OB Number, select your reporting police station from our 218+ directory, paste your public social media link, and upload the incident photo.
                      </p>
                    </div>

                    <div className="rounded-xl bg-muted/50 p-2.5 border border-border/50">
                      <span className="font-bold text-foreground block text-[11px] uppercase tracking-wider">The Crucial "Why":</span>
                      <p className="text-muted-foreground mt-0.5 leading-relaxed">
                        Our system cross-checks the public post against the police record to verify authenticity. Human triage moderators review every OB number, guaranteeing empathy and 100% platform integrity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3: Instant Neighborhood Search Broadcast */}
              <div className="relative rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-foreground font-black text-xs">
                      3
                    </span>
                    <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                      Local Search Party
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                    Instant Community Search Party Alert
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="rounded-xl bg-muted/50 p-2.5 border border-border/50">
                      <span className="font-bold text-foreground block text-[11px] uppercase tracking-wider">The How:</span>
                      <p className="text-muted-foreground mt-0.5 leading-relaxed">
                        Once approved, alerts are instantly sent to neighbors, drivers, mechanics, and community wardens near the last seen location. Families can also download high-visibility printable posters with QR codes.
                      </p>
                    </div>

                    <div className="rounded-xl bg-muted/50 p-2.5 border border-border/50">
                      <span className="font-bold text-foreground block text-[11px] uppercase tracking-wider">The Crucial "Why":</span>
                      <p className="text-muted-foreground mt-0.5 leading-relaxed">
                        The first 24 hours are critical. Instead of scattered social media chatter, alerts reach the exact people physically on the ground where the person was last seen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 4: Sightings & Automatic Right to be Forgotten */}
              <div className="relative rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-foreground font-black text-xs">
                      4
                    </span>
                    <span className="rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                      Privacy & Recovery
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                    Report Sightings & Automatic Privacy Deletion
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="rounded-xl bg-muted/50 p-2.5 border border-border/50">
                      <span className="font-bold text-foreground block text-[11px] uppercase tracking-wider">The How:</span>
                      <p className="text-muted-foreground mt-0.5 leading-relaxed">
                        Witnesses submit GPS-tagged sighting photos directly to the alert. When your loved one is found or your vehicle or motorbike is recovered, <strong>simply delete your original social media post</strong>.
                      </p>
                    </div>

                    <div className="rounded-xl bg-rose-500/10 p-2.5 border border-rose-500/20">
                      <span className="font-bold text-rose-600 dark:text-rose-400 block text-[11px] uppercase tracking-wider">Right to be Forgotten:</span>
                      <p className="text-muted-foreground mt-0.5 leading-relaxed">
                        CivilTrace automatically detects when your original social post is removed and <strong>immediately unpublishes the alert and deletes the photos</strong>. A family's crisis never becomes a permanent digital scar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* THREE CORE PILLARS SECTION */}
        <section className="py-14 sm:py-20 border-b border-border/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Emergency Focus</span>
              <h2 className="mt-1.5 text-2xl sm:text-4xl font-black tracking-tight text-foreground">
                Dedicated Community Safety Mesh
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                Three specialized public alert channels designed for immediate response across Kenya.
              </p>
            </div>

            <div className="mt-10 sm:mt-14 grid gap-6 md:grid-cols-3">
              {/* Card 1: Missing Persons */}
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">Missing Persons Alerts</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    When a child, elderly parent, or loved one goes missing, time is everything. We instantly notify
                    nearby citizens and volunteers, generate printable search posters with QR codes, and collect verified sighting tips.
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-border/60">
                  <Link href="/dashboard/create-alert" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                    <span>Report Missing Person</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card 2: Stolen Vehicles & Motorbikes */}
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Car className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">Stolen Vehicles & Motorbikes</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Vehicle and motorbike theft moves fast. We broadcast registration numbers, color, and distinguishing marks
                    to local drivers, mechanics, riders, and watchmen across nearby transit corridors before vehicles can be altered or moved across county borders.
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-border/60">
                  <Link href="/dashboard/create-alert" className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
                    <span>Report Stolen Vehicle or Motorbike</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card 3: Emergency Ambulances & Hotlines */}
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <Ambulance className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">24/7 Emergency Contacts (250+)</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Instant access to direct phone lines for 218+ police stations and 40 ambulance services across all 47 counties.
                    Whether you need Red Cross (1199), St. John Ambulance, or your local OCS desk, help is just one tap away.
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-border/60">
                  <Link href="/directory" className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline">
                    <span>Browse Police & Ambulance Directory</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMMUNITY TRUST & PRIVACY GUARANTEE */}
        <section className="py-12 sm:py-16 bg-muted/30 border-b border-border/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 lg:p-12 shadow-sm">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 text-xs font-bold">
                    <ShieldCheck className="h-4 w-4" />
                    <span>The East African Nyumba Kumi Spirit</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-foreground leading-tight">
                    Built for Trust, Dignity & Community Care
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    CivilTrace operates under strict ethical and data privacy principles. We believe that public safety
                    relies on community solidarity, not extortion or invasive tracking.
                  </p>

                  <div className="space-y-2.5 pt-2 text-xs sm:text-sm">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>The Right to be Forgotten:</strong> Once a missing loved one is safely found, their alert and public photos are promptly retired.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>No Cash Bounties:</strong> We use community Civic Points instead of money to prevent false sightings, scams, and extortion.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Free & Anonymous to Search:</strong> Anyone can check active alerts or emergency phone numbers without signing up or sharing personal data.</span>
                    </div>
                  </div>
                </div>

                {/* Emergency Hotlines Callout Card */}
                <div className="rounded-2xl border border-border/80 bg-muted/40 p-6 sm:p-8 space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4 text-rose-500" />
                    <span>Active Emergency? Call Official Hotlines</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    If life is in immediate danger or a crime is in progress, please contact official national emergency dispatchers right away:
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <a href="tel:999" className="rounded-xl border border-border bg-card p-3 text-center hover:bg-muted transition">
                      <p className="text-xs font-bold text-primary">Police Emergency</p>
                      <p className="text-base font-black text-foreground mt-0.5">999 / 112</p>
                    </a>
                    <a href="tel:1199" className="rounded-xl border border-border bg-card p-3 text-center hover:bg-muted transition">
                      <p className="text-xs font-bold text-rose-500">Red Cross Ambulance</p>
                      <p className="text-base font-black text-foreground mt-0.5">1199</p>
                    </a>
                    <a href="tel:1195" className="rounded-xl border border-border bg-card p-3 text-center hover:bg-muted transition">
                      <p className="text-xs font-bold text-amber-500">Gender Violence Helpline</p>
                      <p className="text-base font-black text-foreground mt-0.5">1195</p>
                    </a>
                    <a href="tel:116" className="rounded-xl border border-border bg-card p-3 text-center hover:bg-muted transition">
                      <p className="text-xs font-bold text-emerald-500">Childline Kenya</p>
                      <p className="text-base font-black text-foreground mt-0.5">116</p>
                    </a>
                  </div>

                  <Link href="/directory" className="block pt-2">
                    <Button variant="outline" className="w-full gap-2 rounded-xl text-xs font-bold py-5">
                      <Search className="h-4 w-4 text-primary" />
                      <span>Browse 218+ Police Stations & 40 Ambulances</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card py-8 sm:py-12 text-xs text-muted-foreground w-full max-w-full overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                <span className="font-black text-base text-foreground tracking-tight">CivilTrace Kenya</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Community-powered emergency alerts and public safety network across Kenya.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 font-semibold text-foreground/80">
              <Link href="/directory" className="hover:text-primary transition">Police & Ambulance Directory</Link>
              <Link href="/map" className="hover:text-primary transition">Live Alert Map</Link>
              <Link href="/dashboard/create-alert" className="hover:text-primary transition">Post Alert</Link>
              <Link href="/dashboard" className="hover:text-primary transition">Citizen Portal</Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground">
            <p>© 2026 CivilTrace Kenya. Technology in service of community welfare.</p>
            <p>Non-profit civic initiative • Compliant with Kenya Data Protection Act</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
