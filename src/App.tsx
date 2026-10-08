import { useEffect, useState, type FormEvent } from 'react'
import { Show, SignInButton, SignUpButton, UserButton, useAuth, useUser } from '@clerk/react'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  Check,
  ChevronDown,
  Clock3,
  Globe2,
  Languages,
  Menu,
  MessageCircle,
  MessagesSquare,
  X,
} from 'lucide-react'
import { FOOTER_LOGO, NAVBAR_LOGO, site } from './content/site'

type StudentRegistration = {
  fullName: string
  phone: string
  birthDate: string
  gender: string
  address: string
  education: string
  program: string
}

const emptyRegistration: StudentRegistration = {
  fullName: '',
  phone: '',
  birthDate: '',
  gender: '',
  address: '',
  education: '',
  program: '',
}

function StudentAccountArea({ user }: { user: NonNullable<ReturnType<typeof useUser>['user']> }) {
  const { getToken } = useAuth()
  const [registration, setRegistration] = useState<StudentRegistration>({ ...emptyRegistration, fullName: user.fullName ?? '' })
  const [savedRegistration, setSavedRegistration] = useState<StudentRegistration | null>(null)
  const [savingRegistration, setSavingRegistration] = useState(false)
  const [loadingRegistration, setLoadingRegistration] = useState(true)
  const [registrationMessage, setRegistrationMessage] = useState('')

  useEffect(() => {
    let active = true

    const loadStudent = async () => {
      try {
        const token = await getToken()
        if (!token) throw new Error('Authentication required')

        const response = await fetch('/api/students', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) {
          const failure = await response.json().catch(() => ({})) as { error?: string }
          throw new Error(failure.error || site.ui.registrationLoadError)
        }

        const result = await response.json() as { student: StudentRegistration | null }
        if (active && result.student) {
          setRegistration(result.student)
          setSavedRegistration(result.student)
        }
      } catch (error) {
        if (active) setRegistrationMessage(error instanceof Error ? error.message : site.ui.registrationLoadError)
      } finally {
        if (active) setLoadingRegistration(false)
      }
    }

    void loadStudent()
    return () => { active = false }
  }, [getToken])

  const handleRegistrationChange = (field: keyof StudentRegistration, value: string) => {
    setRegistration((current) => ({ ...current, [field]: value }))
  }

  const handleRegistrationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSavingRegistration(true)
    setRegistrationMessage('')
    try {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')

      const response = await fetch('/api/students', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registration),
      })
      if (!response.ok) {
        const failure = await response.json().catch(() => ({})) as { error?: string }
        throw new Error(failure.error || site.ui.registrationError)
      }

      const result = await response.json() as { student: StudentRegistration }
      setRegistration(result.student)
      setSavedRegistration(result.student)
      setRegistrationMessage(site.ui.registrationSaved)
    } catch (error) {
      setRegistrationMessage(error instanceof Error ? error.message : site.ui.registrationError)
    } finally {
      setSavingRegistration(false)
    }
  }

  return <>
    <section className="section registration-section" id={site.anchors.registration.slice(1)}>
      <div className="page-width registration-layout">
        <div className="registration-heading">
          <p className="eyebrow">{site.ui.registration}</p>
          <h2 className="section-heading">{site.ui.registrationTitle}</h2>
          <p>{site.ui.registrationDescription}</p>
          <span>{site.ui.registrationPrivacy}</span>
          {loadingRegistration && <span>{site.ui.loadingStudentData}</span>}
        </div>
        <form className="registration-form" onSubmit={handleRegistrationSubmit}>
          <label>
            <span>{site.ui.fullName}</span>
            <input required autoComplete="name" value={registration.fullName} onChange={(event) => handleRegistrationChange('fullName', event.target.value)} />
          </label>
          <label>
            <span>{site.ui.phone}</span>
            <input required type="tel" autoComplete="tel" value={registration.phone} onChange={(event) => handleRegistrationChange('phone', event.target.value)} />
          </label>
          <label>
            <span>{site.ui.birthDate}</span>
            <input required type="date" value={registration.birthDate} onChange={(event) => handleRegistrationChange('birthDate', event.target.value)} />
          </label>
          <label>
            <span>{site.ui.gender}</span>
            <select required value={registration.gender} onChange={(event) => handleRegistrationChange('gender', event.target.value)}>
              <option value="">{site.ui.genderPlaceholder}</option>
              {site.ui.genderOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label>
            <span>{site.ui.education}</span>
            <select required value={registration.education} onChange={(event) => handleRegistrationChange('education', event.target.value)}>
              <option value="">{site.ui.educationPlaceholder}</option>
              {site.ui.educationOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label>
            <span>{site.ui.japaneseProgram}</span>
            <select required value={registration.program} onChange={(event) => handleRegistrationChange('program', event.target.value)}>
              <option value="">{site.ui.askProgram}</option>
              {site.ui.japaneseProgramOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className="registration-wide">
            <span>{site.ui.address}</span>
            <textarea required rows={3} autoComplete="street-address" value={registration.address} onChange={(event) => handleRegistrationChange('address', event.target.value)} />
          </label>
          <div className="registration-actions registration-wide">
            <button className="button button-primary" type="submit" disabled={savingRegistration || loadingRegistration}>
              {savingRegistration ? site.ui.savingRegistration : savedRegistration ? site.ui.updateRegistration : site.ui.saveRegistration}
            </button>
            {registrationMessage && <p role="status">{registrationMessage}</p>}
          </div>
        </form>
      </div>
    </section>
    <section className="section student-data-section" id={site.anchors.studentData.slice(1)}>
      <div className="page-width">
        <div className="student-data-heading">
          <div><p className="eyebrow">{site.ui.studentData}</p><h2 className="section-heading">{site.ui.studentDataTitle}</h2></div>
          {savedRegistration && <a className="text-link" href={site.anchors.registration}>{site.ui.editRegistration}<ArrowRight aria-hidden="true" /></a>}
        </div>
        {savedRegistration ? (
          <dl className="student-data-grid">
            {site.ui.studentFields.map((field) => (
              <div key={field.key}>
                <dt>{field.label}</dt>
                <dd>{savedRegistration[field.key as keyof StudentRegistration]}</dd>
              </div>
            ))}
            <div><dt>{site.ui.accountEmail}</dt><dd>{user.primaryEmailAddress?.emailAddress ?? '-'}</dd></div>
          </dl>
        ) : (
          <div className="student-data-empty"><p>{site.ui.noStudentData}</p><a className="button button-outline" href={site.anchors.registration}>{site.ui.registration}<ArrowRight aria-hidden="true" /></a></div>
        )}
      </div>
    </section>
  </>
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(0)
  const [scrolled, setScrolled] = useState(false)
  const { isLoaded, isSignedIn, user } = useUser()
  const whatsappHref = site.contact.whatsappUrl || '#kontak'

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 24)
    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    return () => window.removeEventListener('scroll', updateScroll)
  }, [])

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('.reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const closeMenu = () => setMenuOpen(false)

  const iconFor = (name: string) => {
    if (name === 'languages' || name === 'language') return <Languages aria-hidden="true" />
    if (name === 'messages' || name === 'interview') return <MessagesSquare aria-hidden="true" />
    if (name === 'globe') return <Globe2 aria-hidden="true" />
    if (name === 'japan') return <span className="program-mark program-mark-japan" aria-hidden="true">日</span>
    return <Globe2 aria-hidden="true" />
  }

  return (
    <div className="site-shell">
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="nav-wrap">
          <a className="brand-lockup" href={site.anchors.home} onClick={closeMenu} aria-label={site.brand.name}>
            <span className="brand-logos">
              {NAVBAR_LOGO.map((logo) => (
                <span className="brand-logo-slot" key={logo.src}>
                  <img src={logo.src} alt={logo.alt} onError={(event) => { event.currentTarget.style.visibility = 'hidden' }} />
                  <span className="brand-fallback" aria-hidden="true">{site.ui.logoPlaceholder}</span>
                </span>
              ))}
            </span>
            <span>{site.brand.name}</span>
          </a>
          <button
            type="button"
            className="menu-toggle icon-button"
            aria-label={menuOpen ? site.ui.closeMenu : site.ui.openMenu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
          <nav className={`main-nav${menuOpen ? ' is-open' : ''}`} aria-label={site.ui.mainNavigation}>
            {site.navigation.map((item) => (
              <a key={item.href} href={item.href} onClick={closeMenu}>{item.label}</a>
            ))}
            {isLoaded && isSignedIn && <>
              <a href={site.anchors.registration} onClick={closeMenu}>{site.ui.registration}</a>
              <a href={site.anchors.studentData} onClick={closeMenu}>{site.ui.studentData}</a>
            </>}
            <div className="auth-controls">
              <Show when="signed-out" fallback={null}>
                <SignInButton mode="modal">
                  <button className="auth-button auth-sign-in" type="button">{site.ui.signIn}</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="auth-button auth-sign-up" type="button">{site.ui.signUp}</button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero-section" id={site.anchors.home.slice(1)}>
          <div className="hero-content page-width">
            <div className="hero-copy">
              <p className="eyebrow"><span className="eyebrow-line" />{site.hero.eyebrow}</p>
              <h1>{site.hero.headline}</h1>
              <p className="hero-description">{site.hero.subheadline}</p>
              <div className="hero-actions">
                <a className="button button-primary" href={whatsappHref}>
                  {site.hero.primaryCta}<ArrowUpRight aria-hidden="true" />
                </a>
                <a className="text-link" href={site.anchors.program}>{site.hero.secondaryCta}<ArrowDown aria-hidden="true" /></a>
              </div>
              <div className="destination-row" aria-label={site.ui.destinations}>
                {site.hero.destinations.map((destination) => <span key={destination}>{destination}</span>)}
                <p>{site.brand.tagline}</p>
              </div>
            </div>
            <div className="hero-visual" aria-label={site.hero.image.alt}>
              <img src={site.hero.image.src} alt={site.hero.image.alt} />
              <div className="hero-image-shade" />
              <div className="visual-index"><span>{site.ui.logoPlaceholder}</span><span>{site.ui.imageIndex}</span></div>
              <div className="hero-image-caption">
                <span>{site.hero.image.caption}</span>
                <p>{site.hero.image.detail}</p>
              </div>
              <div className="visual-stamp" aria-hidden="true"><span>{site.ui.logoPlaceholder}</span><span>{site.ui.preparationStamp}</span></div>
            </div>
          </div>
          <div className="hero-bottom page-width">
            <span>{site.ui.imageIndex}</span><span className="hero-bottom-rule" /><span>{site.ui.japanPreparationLabel}</span>
          </div>
        </section>

        <section className="trust-strip" aria-label={site.ui.focusHeading}>
          <div className="page-width trust-inner">
            <span>{site.ui.focusHeading}</span>
            {site.ui.focusItems.map((item) => <p key={item}><Check aria-hidden="true" />{item}</p>)}
          </div>
        </section>

        <section className="section profile-section" id={site.anchors.about.slice(1)}>
          <div className="page-width profile-grid reveal">
            <div>
              <p className="eyebrow">{site.profile.eyebrow}</p>
              <h2 className="section-heading">{site.profile.title}</h2>
            </div>
            <div className="profile-copy">
              <p>{site.profile.description}</p>
              <span className="quiet-note">{site.profile.note}</span>
            </div>
          </div>
          <div className="page-width advantage-grid">
            {site.advantages.map((item) => (
              <article className="advantage-item reveal" key={item.number}>
                <div className="advantage-top"><span>{item.number}</span>{iconFor(item.icon)}</div>
                <h3>{item.title}</h3><p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section programs-section" id={site.anchors.program.slice(1)}>
          <div className="page-width">
            <div className="section-intro reveal">
              <div><p className="eyebrow">{site.programs.eyebrow}</p><h2 className="section-heading">{site.programs.title}</h2></div>
              <p>{site.programs.description}</p>
            </div>
            <div className="program-grid">
              {site.programs.items.map((program, index) => (
                <article className={`program-card program-card-${index + 1} reveal`} key={program.title}>
                  <div className="program-card-head"><span className="program-icon">{iconFor(program.icon)}</span><span className="program-country">{program.country}</span></div>
                  <h3>{program.title}</h3><p>{program.description}</p>
                  <div className="tag-list">{program.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                  <a href={whatsappHref} className="card-link">{site.ui.askProgram}<ArrowRight aria-hidden="true" /></a>
                </article>
              ))}
            </div>
            <p className="program-note"><span>!</span>{site.programs.note}</p>
          </div>
        </section>

        <section className="schedule-section section" id={site.anchors.articles.slice(1)}>
          <div className="page-width schedule-inner reveal">
            <div className="schedule-copy"><p className="eyebrow">{site.schedule.eyebrow}</p><h2 className="section-heading">{site.schedule.title}</h2><p>{site.schedule.description}</p></div>
            <div className="schedule-panel"><div className="schedule-panel-top"><Clock3 aria-hidden="true" /><span>{site.schedule.status}</span></div><p>{site.schedule.placeholder}</p><a className="button button-outline" href={whatsappHref}>{site.schedule.cta}<ArrowRight aria-hidden="true" /></a></div>
          </div>
        </section>

        <section className="section activities-section" id={site.anchors.activities.slice(1)}>
          <div className="page-width">
            <div className="section-intro reveal"><div><p className="eyebrow">{site.activities.eyebrow}</p><h2 className="section-heading">{site.activities.title}</h2></div><p>{site.activities.description}</p></div>
            <div className="activity-grid">
              {site.activities.placeholders.map((placeholder, index) => (
                <div className={`activity-placeholder activity-placeholder-${index + 1} reveal`} key={placeholder}>
                  <div className="activity-art" aria-hidden="true"><BookOpenText /><span>0{index + 1}</span></div>
                  <p>{placeholder}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="alumni-section section" id={site.anchors.alumni.slice(1)}>
          <div className="page-width alumni-inner reveal">
            <div><p className="eyebrow">{site.alumni.eyebrow}</p><h2 className="section-heading">{site.alumni.title}</h2></div>
            <div className="alumni-placeholder"><MessagesSquare aria-hidden="true" /><p>{site.alumni.placeholder}</p><span>{site.alumni.description}</span></div>
          </div>
        </section>

        <section className="section faq-section" id={site.anchors.faq.slice(1)}>
          <div className="page-width faq-layout">
            <div className="faq-heading reveal"><p className="eyebrow">{site.faqs.eyebrow}</p><h2 className="section-heading">{site.faqs.title}</h2><a className="text-link" href={whatsappHref}>{site.ui.askDirectly}<ArrowUpRight aria-hidden="true" /></a></div>
            <div className="faq-list reveal">
              {site.faqs.items.map((item, index) => (
                <article className={`faq-item${activeFaq === index ? ' is-open' : ''}`} key={item.question}>
                  <button type="button" aria-expanded={activeFaq === index} onClick={() => setActiveFaq(activeFaq === index ? null : index)}>
                    <span>{item.question}</span><ChevronDown aria-hidden="true" />
                  </button>
                  {activeFaq === index && <p>{item.answer}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section partnership-section" id={site.anchors.partnership.slice(1)}>
          <div className="page-width partnership-content reveal">
            <p className="eyebrow">{site.navigation[3].label}</p>
            <h2 className="section-heading">{site.partnership.title}</h2>
            <p>{site.partnership.description}</p>
          </div>
        </section>
        <section className="contact-section" id={site.anchors.contact.slice(1)}>
          <div className="page-width contact-inner reveal">
            <div><p className="eyebrow">{site.contact.eyebrow}</p><h2>{site.contact.title}</h2><p className="contact-description">{site.contact.description}</p></div>
            <div className="contact-action"><a className="button button-light" href={whatsappHref}><MessageCircle aria-hidden="true" />{site.contact.cta}<ArrowUpRight aria-hidden="true" /></a><span>{site.contact.whatsappPlaceholder}</span></div>
          </div>
        </section>
        {isLoaded && isSignedIn && user && <StudentAccountArea key={user.id} user={user} />}
      </main>

      <footer className="site-footer">
        <div className="page-width footer-main">
          <a className="footer-brand" href={site.anchors.home}>
            { /* Replace this image with the supplied logo-ygi.png; keep the original logo artwork unchanged. */ }
            <img src={FOOTER_LOGO} alt="" onError={(event) => { event.currentTarget.style.visibility = 'hidden' }} />
            <span className="footer-logo-fallback" aria-hidden="true">{site.ui.logoPlaceholder}</span>
            <span>{site.brand.legalName}</span>
          </a>
          <p>{site.footer.note}</p>
          <div className="footer-contact"><span>{site.contact.whatsappPlaceholder}</span><span>{site.contact.email}</span><span>{site.contact.address}</span></div>
        </div>
        <div className="page-width footer-bottom"><span>© {new Date().getFullYear()} {site.brand.legalName}. {site.footer.copyright}</span><a href={site.anchors.home}>{site.ui.backToTop}<ArrowUpRight aria-hidden="true" /></a></div>
      </footer>
    </div>
  )
}

export default App
