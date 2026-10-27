// Portfolio component logic — extracted from index.html (code unchanged).
// Wrapped in a factory because the page runtime (js/support.js) supplies DCLogic and React when it boots.
window.createPortfolioComponent = function (DCLogic, React) {
class Component extends DCLogic {
  state = {
    time: '', wide: typeof window !== 'undefined' ? window.innerWidth > 900 : true,
    menuOpen: false, openProj: 0, openJob: 0, skillTab: 'All', certCat: 'All', certSel: 'gai', certHold: false,
    form: { name: '', email: '', subject: '', message: '' }, errors: {}, status: '', copied: false,
    statP: 0
  };
  statRef = React.createRef();
  cursorRef = React.createRef();

  _themeInit = this.applyTheme(this.readTheme());
  readTheme() { try { return localStorage.getItem('hp-theme') === 'dark'; } catch (e) { return false; } }
  applyTheme(dark) {
    if (typeof document === 'undefined') return dark;
    const st = document.documentElement.style;
    const base = dark ? {
      '--color-bg': '#121111', '--color-surface': '#1c1b1b', '--color-text': '#f1efee', '--color-divider': 'color-mix(in srgb, #f1efee 32%, transparent)',
      '--color-neutral-100': '#2d2b2b', '--color-neutral-200': '#444141', '--color-neutral-300': '#605d5d', '--color-neutral-400': '#7d7979', '--color-neutral-500': '#9b9797',
      '--color-neutral-600': '#bab6b6', '--color-neutral-700': '#d7d3d3', '--color-neutral-800': '#eae7e7', '--color-neutral-900': '#f8f4f4',
      '--color-accent-700': '#ff9783', '--color-accent-800': '#ffc4b8', '--color-accent-100': '#3a1610', '--color-accent-200': '#5a1d12'
    } : {};
    ['--color-bg','--color-surface','--color-text','--color-divider','--color-neutral-100','--color-neutral-200','--color-neutral-300','--color-neutral-400','--color-neutral-500','--color-neutral-600','--color-neutral-700','--color-neutral-800','--color-neutral-900','--color-accent-700','--color-accent-800','--color-accent-100','--color-accent-200'].forEach(k => base[k] ? st.setProperty(k, base[k]) : st.removeProperty(k));
    const sk = dark ? {
      bg: '#16161a', tile: '#1f1f25', 'tile-on': '#2a2a32', text: '#f4f4f5', strong: '#fafafa', soft: '#e4e4e7', muted: '#b8b8c0', muted2: '#9d9da6',
      border: 'rgba(255,255,255,0.12)', border2: 'rgba(255,255,255,0.2)', chip: 'rgba(255,255,255,0.06)', line: 'rgba(255,255,255,0.05)',
      glow1: 'rgba(236,48,19,0.26)', glow2: 'rgba(110,100,255,0.2)', glow3: 'rgba(40,190,170,0.1)', grad: 'linear-gradient(180deg,#ffffff,#9a9aa6)',
      spot: 'rgba(255,255,255,0.75)', spotfill: 'rgba(236,48,19,0.2)', dot: 'rgba(255,255,255,0.08)', panel: '#1b1b20', shadow: '0 30px 80px -30px rgba(0,0,0,0.7)',
      tshadow: 'none', tint: '14%', glowop: '0.45', iconsh: 'rgba(0,0,0,0.5)'
    } : {
      bg: '#fbfaf9', tile: '#ffffff', 'tile-on': '#ffffff', text: '#18181b', strong: '#09090b', soft: '#27272a', muted: '#52525b', muted2: '#71717a',
      border: 'rgba(24,24,27,0.09)', border2: 'rgba(24,24,27,0.16)', chip: 'rgba(255,255,255,0.7)', line: 'rgba(24,24,27,0.05)',
      glow1: 'rgba(236,48,19,0.16)', glow2: 'rgba(124,92,255,0.16)', glow3: 'rgba(40,190,170,0.12)', grad: 'linear-gradient(180deg,#18181b,#8a8a94)',
      spot: 'rgba(236,48,19,0.8)', spotfill: 'rgba(236,48,19,0.07)', dot: 'rgba(24,24,27,0.07)', panel: '#ffffff', shadow: '0 30px 70px -30px rgba(24,24,27,0.28)',
      tshadow: '0 1px 2px rgba(24,24,27,0.06),0 4px 12px -6px rgba(24,24,27,0.08)', tint: '9%', glowop: '0.3', iconsh: 'rgba(24,24,27,0.18)'
    };
    Object.entries(sk).forEach(([k, v]) => st.setProperty('--sk-' + k, v));
    st.setProperty('--logo-a1', dark ? '#c7c9ff' : '#3b3f8f'); st.setProperty('--logo-a2', dark ? '#8f94ff' : '#1a1d4a'); st.setProperty('--logo-t2', dark ? '#8f7dff' : '#3b3f8f');
    st.colorScheme = dark ? 'dark' : 'light';
    return dark;
  }
  expPanelRef = React.createRef();
  certCardRef = React.createRef();
  certFaceRef = React.createRef();
  scheduleCert() {
    clearTimeout(this.certTO);
    this.certTO = setTimeout(() => { if (!this.state.certHold && document.visibilityState === 'visible' && this._certOrder) { const o = this._certOrder, i = o.indexOf(this.state.certSel); this._pickCert(o[(Math.max(i, 0) + 1) % o.length]); } this.scheduleCert(); }, 6000);
  }
  componentDidMount() {
    this.setState({ dark: this._themeInit });
    this.scheduleCert();
    this.onDockScroll = () => { const ids = ['about','experience','work','skills','services','education','certifications','contact']; let cur = 'home'; for (const id of ids) { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < innerHeight * 0.4) cur = id; } if (cur !== this.state.dockActive) this.setState({ dockActive: cur }); };
    this.sampleDock = () => { const nav = document.querySelector('nav[aria-label="Quick navigation"]'); if (!nav) return; const r = nav.getBoundingClientRect(); let lum = null;
      for (const el of document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2)) { if (nav.contains(el)) continue; let n = el;
        while (n && n.nodeType === 1) { const m = getComputedStyle(n).backgroundColor.match(/[\d.]+/g); if (m && (m[3] === undefined || +m[3] > 0.5)) { lum = (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255; break; } n = n.parentElement; }
        if (lum !== null) break; }
      if (lum === null) return; const d = lum < 0.5; if (d !== this.state.dockOnDark) this.setState({ dockOnDark: d }); };
    addEventListener('scroll', this.sampleDock, { passive: true }); setTimeout(this.sampleDock, 300);
    addEventListener('scroll', this.onDockScroll, { passive: true }); this.onDockScroll();
        this.helloT = setInterval(() => this.setState(st => ({ fr: !st.fr })), 2500);
    this.onResize = () => { const w = window.innerWidth > 900; if (w !== this.state.wide) this.setState({ wide: w }); };
    this.onKey = e => { if (e.key === 'Escape' && (this.state.menuOpen || this.state.certSel)) { document.body.style.overflow = ''; this.setState({ menuOpen: false, certSel: null }); } };
    window.addEventListener('keydown', this.onKey);
    this.onScroll = () => {
      if (!this.prog) return;
      const h = document.documentElement.scrollHeight - innerHeight;
      this.prog.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
    };
    addEventListener('resize', this.onResize); addEventListener('scroll', this.onScroll, { passive: true });
    this.onScroll();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ease = 'cubic-bezier(.2,.7,.1,1)';
    if (!reduce) {
      document.querySelectorAll('[data-rise]').forEach(el => {
        el.style.transform = 'translateY(105%)';
        requestAnimationFrame(() => requestAnimationFrame(() => {
          el.style.transition = `transform 1.1s ${ease} ${0.1 + Number(el.dataset.rise) * 0.12}s`;
          el.style.transform = 'translateY(0)';
        }));
      });
      this.io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        el.style.transition = `opacity .9s ${ease}, transform .9s ${ease}`;
        el.style.opacity = '1'; el.style.transform = 'none';
        this.io.unobserve(el);
      }), { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
      document.querySelectorAll('[data-reveal]').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight) return;
        el.style.opacity = '0'; el.style.transform = 'translateY(28px)';
        this.io.observe(el);
      });
    }
    if (!reduce) {
      const logo = document.querySelector('[data-logo]');
      if (logo) [...logo.querySelectorAll('path')].forEach((c, i) => {
        c.animate([{ opacity: 0, transform: 'translateY(' + (i % 2 ? -10 : 10) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 150 + i * 120, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
      });
      let rot = 0, lastY = scrollY, vel = 0;
      const spin = () => {
        const dy = scrollY - lastY; lastY = scrollY;
        vel += (Math.abs(dy) * 0.25 - vel) * 0.1;
        rot = (rot + 0.18 + vel) % 360;
        const el = document.querySelector('[data-spin]');
        if (el) el.style.transform = `rotate(${rot}deg)`;
        this.spinRaf = requestAnimationFrame(spin);
      };
      spin();
      this.ambient = setInterval(() => {
        if (Date.now() - (this.lastMove || 0) < 2000 || !this.field) return;
        const r = this.field.getBoundingClientRect();
        if (r.bottom < 0) return;
        const cols = Math.ceil(r.width / 64), rows = Math.ceil(r.height / 64);
        this.spawnCell(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows), 0.5);
      }, 650);
    }
    const bez = 'cubic-bezier(.7,0,.2,1)';
    const enter = b => {
      const f = b.querySelector('[data-fill]'), a = b.querySelector('[data-arrow]');
      if (f) f.style.transform = 'translateX(0)';
      if (a) a.style.transform = 'translate(0,0)';
      if (b.dataset.mbtn === 'outline') b.style.color = 'var(--color-bg)';
    };
    const leave = b => {
      const f = b.querySelector('[data-fill]'), a = b.querySelector('[data-arrow]');
      if (f) f.style.transform = 'translateX(101%)';
      setTimeout(() => { if (this.hb !== b && f) { f.style.transition = 'none'; f.style.transform = 'translateX(-101%)'; f.offsetWidth; f.style.transition = `transform .55s ${bez}`; } }, 560);
      if (a) a.style.transform = a.dataset.arrow === 'y' ? 'translateY(-50%)' : 'translateX(-50%)';
      if (b.dataset.mbtn === 'outline') b.style.color = 'var(--color-text)';
      b.style.transform = '';
    };
    this.onBtnMove = e => {
      const b = e.target.closest ? e.target.closest('[data-mbtn]') : null;
      if (b !== this.hb) { if (this.hb) leave(this.hb); if (b) enter(b); this.hb = b; }
      if (b && !reduce) {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.12}px,${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
      }
    };
    addEventListener('pointermove', this.onBtnMove);
    this.sio = new IntersectionObserver(es => {
      if (!es.some(e => e.isIntersecting)) return;
      this.sio.disconnect();
      if (reduce) return this.setState({ statP: 1 });
      const t0 = performance.now();
      const step = now => {
        const p = Math.min(1, (now - t0) / 1600);
        this.setState({ statP: 1 - Math.pow(1 - p, 3) });
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    if (this.statEl) this.sio.observe(this.statEl);

    if (matchMedia('(pointer: fine)').matches && !reduce) {
      let x = -100, y = -100, cx = -100, cy = -100, s = 1, ts = 1;
      this.onMove = e => { x = e.clientX; y = e.clientY; ts = e.target.closest && e.target.closest('a,button,input,textarea,image-slot') ? 3.2 : 1; };
      addEventListener('mousemove', this.onMove);
      const loop = () => {
        cx += (x - cx) * 0.22; cy += (y - cy) * 0.22; s += (ts - s) * 0.18;
        if (this.cursorRef.current) this.cursorRef.current.style.transform = `translate(${cx - 6}px,${cy - 6}px) scale(${s})`;
        this.raf = requestAnimationFrame(loop);
      };
      loop();
    }
  }
  componentWillUnmount() {
    clearInterval(this.clock); clearInterval(this.helloT); clearTimeout(this.certTO); cancelAnimationFrame(this.raf); cancelAnimationFrame(this.spinRaf); clearInterval(this.ambient);
    removeEventListener('pointermove', this.onBtnMove); removeEventListener('keydown', this.onKey); removeEventListener('scroll', this.sampleDock); removeEventListener('scroll', this.onDockScroll); document.body.style.overflow = '';
    removeEventListener('resize', this.onResize); removeEventListener('scroll', this.onScroll);
    if (this.onMove) removeEventListener('mousemove', this.onMove);
    this.io && this.io.disconnect(); this.sio && this.sio.disconnect();
  }

  spawnCell(cx, cy, op = 0.9) {
    if (!this.field) return;
    const d = document.createElement('div');
    d.style.cssText = `position:absolute;left:${cx * 64}px;top:${cy * 64}px;width:64px;height:64px;background:var(--color-accent);opacity:${op};transition:opacity 1.1s cubic-bezier(.2,.7,.1,1)`;
    this.field.appendChild(d);
    requestAnimationFrame(() => requestAnimationFrame(() => { d.style.opacity = '0'; }));
    setTimeout(() => d.remove(), 1200);
  }
  heroMove = e => {
    if (!this.field || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = this.field.getBoundingClientRect();
    const cx = Math.floor((e.clientX - r.left) / 64), cy = Math.floor((e.clientY - r.top) / 64);
    this.lastMove = Date.now();
    const k = cx + ':' + cy;
    if (k === this.lastCell) return;
    this.lastCell = k; this.spawnCell(cx, cy);
  };
  setField(k) { return e => { const v = e.target.value; this.setState(s => ({ form: { ...s.form, [k]: v }, errors: { ...s.errors, [k]: '' } })); }; }

 submit = e => {
    e.preventDefault();
    const f = this.state.form, err = {};
    if (!f.name.trim()) err.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) err.email = 'Please enter a valid email.';
    if (f.message.trim().length < 10) err.message = 'Message should be at least 10 characters.';
    if (Object.keys(err).length) return this.setState({ errors: err, status: '' });
    if (this.state.sending) return;
    const intent = this.state.intent || 'Full-time role';
    this.setState({ errors: {}, sending: true, status: 'Sending…' });
    fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: 'service_u8g6j14',
        template_id: 'template_ivb7sdm',
        user_id: 'pwtWJSnNBwnSXOSmk',
        template_params: {
          name: f.name, from_name: f.name,
          email: f.email, from_email: f.email, reply_to: f.email,
          intent,
          subject: 'Portfolio · ' + intent + ' · ' + f.name,
          message: f.message,
          title: intent,
          time: new Date().toLocaleString(),
          to_email: 'harshbpatel0909@gmail.com'
        }
      })
    }).then(r => {
      if (!r.ok) throw new Error('fail');
      this.setState({ sending: false, status: `Thanks, ${f.name.split(' ')[0]}. Your message has been sent. I'll reply within 24 hours.`, form: { name: '', email: '', subject: '', message: '' } });
    }).catch(() => {
      this.setState({ sending: false, status: 'Could not send right now. Please email harshbpatel0909@gmail.com directly.' });
    });
  };

  renderVals() {
    const s = this.state;
    const ink = 'var(--color-text)', bg = 'var(--color-bg)', acc = 'var(--color-accent)';
    const V = 'M12 5v14', H = 'M12 12h0';

    const projects = [
      { title: 'Vision AI', role: 'Digital Product Owner & Feature Developer (Capstone)', dates: 'Jan 2024 – Apr 2025',
        desc: 'Full Stack AI Career Coach built within a 4-member agile team. Core features: Cover Letter Generator, Industry Report Generator, Analytics Dashboard, and Document Templates — enabling users to generate tailored career documents and insights powered by real-time data.',
        tech: ['Next.js', 'Node.js (Express.js)', 'PostgreSQL (Neon DB)', 'Prisma ORM', 'Inngest', 'Shadcn UI', 'Tailwind CSS'] },
      { title: 'WomenStaySafe', role: 'Android Developer', dates: 'Jan 2021 – Dec 2022',
        desc: "Android app to enhance women's safety in emergencies by enabling quick communication with emergency services and facilitating image/video sharing for evidence.",
        tech: ['Java', 'Android SDK', 'XML'] },
      { title: 'Brand Hub', role: 'Android Developer', dates: 'Jan 2021 – Apr 2021',
        desc: 'Android app that automates creation of event, festival, and company-related cards, streamlining content generation for daily social media posts.',
        tech: ['Java', 'Android SDK', 'XML'] }
    ].map((p, i) => {
      const open = s.openProj === i;
      return { ...p, num: String(i + 1).padStart(2, '0'), open, vPath: open ? H : V,
        iconBg: open ? acc : 'transparent', iconFg: open ? bg : 'inherit',
        toggle: () => this.setState({ openProj: open ? -1 : i }) };
    });

    const jobs = [
      { role: 'Mobile Application Developer (Co-op)', company: 'Infocorptus Solutions', place: 'Remote', dates: 'May 2025 – Aug 2025',
        note: 'Fanshawe College International Co-op Program',
        points: ['Delivered 3+ native Android features per sprint using Kotlin, Jetpack Compose, and MVVM/Clean Architecture',
          'Built responsive UI with Material Design 3 optimized for 10+ device form factors, reducing UI bug reports by ~25%',
          'Implemented Kotlin Coroutines, StateFlow, and SharedFlow for reactive state management, improving responsiveness by ~30%',
          'Integrated REST APIs via Retrofit/OkHttp with error handling and retry logic — 99%+ reliable data flow',
          'Configured Firebase Auth, Firestore, and Crashlytics; reduced crash rate by ~20%',
          'Participated in production incident triage and stakeholder communication',
          'Zero critical regression bugs across all Agile sprints'] },
      { role: 'Software Developer – Mobile / Android', company: 'Infocorptus Solutions', place: 'Ahmedabad, India (Hybrid)', dates: 'Sep 2022 – Jan 2024',
        note: '5+ Android apps · 10,000+ active users',
        points: ['Developed 5+ Android apps using Kotlin, Java, and Android SDK, serving 10,000+ active users',
          'Designed modular, accessible UI following Talkback and content description guidelines, reducing onboarding time by ~40%',
          'Applied Clean Architecture and Kotlin Coroutines, cutting bug resolution time by ~35%',
          'Instrumented Crashlytics and Performance Monitoring across 5 releases, reducing critical crashes by ~30%',
          'Mentored 2 junior Android developers on architecture, code review, and Agile workflows',
          'Managed tasks in Jira; participated in sprint planning, backlog grooming, and daily Scrum'] },
      { role: 'Android Developer', company: 'CodeInfoWay', place: 'Ahmedabad, India (On-site)', dates: 'Jun 2021 – Jul 2022',
        note: '3+ production apps · 8+ device configurations',
        points: ['Developed and delivered 3+ production Android apps across 8+ device configurations',
          'Engineered multi-screen navigation using Activities, Fragments, RecyclerView, and Navigation Components',
          'Architected codebases using MVVM and Clean Architecture with Repository Pattern',
          'Integrated REST APIs using Retrofit and OkHttp with structured JSON parsing and Postman-validated testing',
          'Implemented Firebase Auth, Realtime Database, and FCM Push Notifications',
          'Performed systematic debugging using Logcat and crash analytics'] }
    ].map((j, i) => Object.assign(j, [{"file":"Coop_2025.kt","mono":"IC","dur":"4 mos","m":[47,50],"kpis":[["~30%","Responsiveness improved"],["~25%","Fewer UI bug reports"],["~20%","Lower crash rate"],["99%+","Reliable data flow"]],"stack":["Kotlin","Jetpack Compose","MVVM","Clean Architecture","Material Design 3","Coroutines","StateFlow","Retrofit","OkHttp","Firebase","Crashlytics"]},{"file":"Android_2022.kt","mono":"IC","dur":"1 yr 5 mos","m":[15,31],"kpis":[["10K+","Active users"],["~40%","Faster onboarding"],["~35%","Faster bug resolution"],["~30%","Fewer critical crashes"]],"stack":["Kotlin","Java","Android SDK","Clean Architecture","Coroutines","Crashlytics","Performance Monitoring","TalkBack","Jira","Scrum"]},{"file":"CodeInfoWay.kt","mono":"CW","dur":"1 yr 2 mos","m":[0,13],"kpis":[["3+","Production apps"],["8+","Device configurations"],["MVVM","Clean Architecture"]],"stack":["Android SDK","Fragments","RecyclerView","Navigation","MVVM","Repository Pattern","Retrofit","OkHttp","Postman","Firebase","FCM","Logcat"]}][i]));
    const jSel = Math.max(0, Math.min(2, s.openJob | 0));
    const pickJob = i => { this.setState({ openJob: i }); requestAnimationFrame(() => { const el = this.expPanelRef.current; el && el.animate([{ opacity: 0, transform: 'translateY(12px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 520, easing: 'cubic-bezier(.2,.8,.2,1)' }); }); };
    const hlRe = /(~?\d[\d,]*(?:\+|%)\+?)/;
    const ejRaw = jobs[jSel];
    const ej = { ...ejRaw, kpis: ejRaw.kpis.map(([n, l]) => ({ n, l })), status: ejRaw.place + ' · ' + ejRaw.dur, pos: (jSel + 1) + ' / ' + jobs.length,
      points: ejRaw.points.map((p, k) => ({ n: String(k + 1).padStart(2, '0'), segs: p.split(hlRe).filter(Boolean).map((t, q) => { const h = hlRe.test(t) && /^~?\d/.test(t); return { t, c: h ? '#ff8a70' : 'inherit', w: h ? 600 : 400 }; }) })) };
    const jobsUi = jobs.map((j, i) => { const on = i === jSel; return { role: j.role, company: j.company, dates: j.dates, dur: j.dur, file: j.file, open: on, latest: i === 0,
      bg: on ? 'rgba(255,255,255,0.06)' : 'transparent', bd: on ? 'rgba(255,255,255,0.12)' : 'transparent', fg: on ? '#fff' : 'rgba(243,242,242,0.72)',
      dot: on ? '#ec3013' : 'rgba(243,242,242,0.35)', dotSh: on ? '0 0 0 6px rgba(236,48,19,0.15),0 0 18px rgba(236,48,19,0.6)' : 'none',
      tabBg: on ? 'rgba(255,255,255,0.08)' : 'transparent', tabFg: on ? '#f3f2f2' : 'rgba(243,242,242,0.5)', toggle: () => pickJob(i) }; });
    const TM = 51;
    const expBars = jobs.map((j, i) => ({ label: j.role + ' · ' + j.company, left: (j.m[0] / TM * 100) + '%', w: ((j.m[1] - j.m[0] + 1) / TM * 100) + '%',
      bg: i === jSel ? '#ec3013' : 'rgba(243,242,242,0.22)', sh: i === jSel ? '0 0 24px rgba(236,48,19,0.6)' : 'none', pick: () => pickJob(i) })).reverse();
    const expTicks = [['2021', 0], ['2022', 7], ['2023', 19], ['2024', 31], ['2025', 43]].map(([y, m], i) => ({ y, left: (m / TM * 100) + '%', tx: i === 0 ? '0' : '-50%' }));
    const expStats = [{ n: '10K+', l: 'Active users' }, { n: '8+', l: 'Apps shipped' }, { n: '3', l: 'Roles' }, { n: '2', l: 'Countries' }];

    const groups = {
      'Languages': ['Kotlin', 'Java', 'SQL'],
      'Frameworks': ['Android Jetpack', 'Jetpack Compose', 'Retrofit', 'Kotlin Coroutines', 'Hilt (Dependency Injection)', 'Jetpack Components'],
      'Tools': ['Android Studio', 'Git/GitHub', 'GitHub Copilot', 'GitHub Actions (CI/CD)', 'Jira', 'Postman', 'Firebase', 'Gemini API'],
      'Databases': ['Room Database', 'MySQL'],
      'Architecture': ['MVVM', 'Clean Architecture', 'OOP', 'Object Oriented Design', 'Dependency Injection', 'Repository Pattern'],
      'Other': ['REST APIs', 'Cross-platform Development', 'Mobile Application Development', 'UI/UX Design for Mobile', 'Agile/Scrum', 'Version Control', 'CI/CD', 'Prompt Engineering', 'AI-Assisted Development', 'Generative AI', 'Code Refactoring', 'Debugging', 'Front-End Development', 'DSA (Basic)', 'Problem Solving']
    };
    const catLabel = { Frameworks: 'Frameworks & Libraries', Tools: 'Tools & Platforms', Architecture: 'Architecture & Patterns' };
    const tabStyle = (on) => ({ bg: on ? ink : 'transparent', fg: on ? bg : ink, active: on });
    const famDot = { Languages: '#ec3013', Frameworks: 'oklch(0.8 0.14 75)', Tools: 'oklch(0.75 0.12 220)', Databases: 'oklch(0.76 0.15 155)', Architecture: 'oklch(0.72 0.15 295)', Other: '#a3a3a3' };
    const darkBrand = { openjdk: 1, square: 1, githubcopilot: 1 };
    const famShade = { Languages: ['var(--color-neutral-900)', '#fff'], Frameworks: ['var(--color-neutral-700)', '#fff'], Tools: ['var(--color-neutral-600)', '#fff'], Databases: ['var(--color-neutral-400)', 'var(--color-neutral-900)'], Architecture: ['var(--color-neutral-300)', 'var(--color-neutral-900)'], Other: ['var(--color-neutral-200)', 'var(--color-neutral-900)'] };
    const meta = {
      'Kotlin': ['Kt', 'kotlin'], 'Java': ['Jv', 'openjdk'], 'SQL': ['Sq', 'mysql'],
      'Android Jetpack': ['Aj', 'android'], 'Jetpack Compose': ['Jc', 'jetpackcompose'], 'Retrofit': ['Rf', 'square'], 'Kotlin Coroutines': ['Co', 'kotlin'], 'Hilt (Dependency Injection)': ['Hi'], 'Jetpack Components': ['Jp', 'android'],
      'Android Studio': ['As', 'androidstudio'], 'Git/GitHub': ['Gt', 'git'], 'GitHub Copilot': ['Cp', 'githubcopilot'], 'GitHub Actions (CI/CD)': ['Ga', 'githubactions'], 'Jira': ['Ji', 'jira'], 'Postman': ['Pm', 'postman'], 'Firebase': ['Fb', 'firebase'], 'Gemini API': ['Ge', 'googlegemini'],
      'Room Database': ['Rm', 'sqlite'], 'MySQL': ['My', 'mysql'],
      'MVVM': ['Mv'], 'Clean Architecture': ['Ca'], 'OOP': ['Op'], 'Object Oriented Design': ['Od'], 'Dependency Injection': ['Di'], 'Repository Pattern': ['Rp'],
      'REST APIs': ['Ra', 'openapiinitiative'], 'Cross-platform Development': ['Xp'], 'Mobile Application Development': ['Md', 'android'], 'UI/UX Design for Mobile': ['Ux', 'figma'], 'Agile/Scrum': ['Ag'], 'Version Control': ['Vc', 'git'], 'CI/CD': ['Ci', 'githubactions'], 'Prompt Engineering': ['Pe'], 'AI-Assisted Development': ['Ad', 'githubcopilot'], 'Generative AI': ['Ai', 'googlegemini'], 'Code Refactoring': ['Cr'], 'Debugging': ['Db'], 'Front-End Development': ['Fe', 'html5'], 'DSA (Basic)': ['Ds'], 'Problem Solving': ['Ps']
    };
    const skillTabs = ['All', ...Object.keys(groups)].map(t => { const on = s.skillTab === t; return { label: t, active: on, count: t === 'All' ? Object.values(groups).flat().length : groups[t].length, bg: on ? 'var(--sk-strong)' : 'transparent', fg: on ? 'var(--sk-bg)' : 'var(--sk-muted)', sw: t === 'All' ? 'linear-gradient(135deg,#ec3013,#fafafa)' : famDot[t], pick: () => this.setState({ skillTab: t }) }; });
    const all = Object.entries(groups).flatMap(([k, arr]) => arr.map(name => ({ name, fam: k })));
    const selName = s.skillHover || s.skillSel || 'Kotlin';
    const skills = all.map((it, i) => {
      const [sym, slug] = meta[it.name] || [it.name.slice(0, 2), null];
      const lit = s.skillTab === 'All' || s.skillTab === it.fam;
      const on = it.name === selName;
      const brandUrl = slug ? 'url(https://cdn.simpleicons.org/' + slug + (darkBrand[slug] && s.dark ? '/ffffff' : '') + ')' : 'none';
      return { ...it, sym, slug: !!slug, noSlug: !slug, slugId: slug, brandUrl, num: String(i + 1).padStart(2, '0'), short: it.name.replace(/ \(.*\)/, ''), on,
        img: brandUrl, iop: on ? 1 : 0.88,
        symCol: on ? '#ec3013' : 'var(--sk-soft)', nameCol: on ? 'var(--sk-strong)' : 'var(--sk-muted)', dot: famDot[it.fam],
        fill: on ? 'var(--sk-tile-on)' : 'color-mix(in srgb,' + famDot[it.fam] + ' var(--sk-tint),var(--sk-tile))', op: lit ? 1 : 0.15, tf: on ? 'translateY(-3px)' : 'none',
        pick: () => this.setState({ skillSel: it.name, skillHover: null }),
        hover: () => this.setState({ skillHover: it.name }) };
    });
    const c = skills.find(k => k.name === selName) || skills[0];
    const cur = { name: c.name, sym: c.sym, num: c.num, total: String(skills.length), fam: catLabel[c.fam] || c.fam, dot: c.dot,
      hasIcon: c.slug, noIcon: c.noSlug, bgImg: c.brandUrl, alt: c.name + ' logo',
      hint: s.skillHover ? 'Click to pin' : 'Hover or click a tile' };
    const step = d => { const i = skills.findIndex(k => k.name === c.name); this.setState({ skillSel: skills[(i + d + skills.length) % skills.length].name, skillHover: null }); };
    const prevSkill = () => step(-1), nextSkill = () => step(1);
    const gridRef = this.gridRef || (this.gridRef = React.createRef());
    const iconRef = this.iconRef || (this.iconRef = React.createRef());
    const gridMove = e => { const el = this.gridRef.current; if (el) { el.style.setProperty('--mx', e.clientX + 'px'); el.style.setProperty('--my', e.clientY + 'px'); } };
    const tableLeave = () => { const el = this.gridRef.current; if (el) { el.style.setProperty('--mx', '-999px'); el.style.setProperty('--my', '-999px'); } this.setState({ skillHover: null }); };
    if (this._curName !== c.name) { const first = this._curName == null; this._curName = c.name; if (!first) requestAnimationFrame(() => this.iconRef.current && this.iconRef.current.animate([{ opacity: 0, transform: 'scale(.8) translateY(8px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 450, easing: 'cubic-bezier(.2,.8,.2,1)' })); }

    const L = 'LinkedIn';
    const certData = [
      { k: 'gai', gains: ["Prompts that get reliable output on the first pass","AI applied to research, analysis and planning","Rapid prototyping of apps with AI tools"], stat: ["100%","7 / 7 courses"], name: 'Google AI Professional Certificate', issuer: 'Google', slug: 'google', cat: 'AI', featured: true, desc: 'A 7-course program completed with a 100% score in every course: AI Fundamentals, Brainstorming & Planning, Research & Insights, Writing & Communicating, Content Creation, Data Analysis and App Building. Built 20+ AI-powered artifacts.', skills: ['Prompt Engineering', 'AI'], ids: [['Credential ID', '95KV9YXSEYQB']] },
      { k: 'kt', gains: ["Idiomatic, null-safe Kotlin","Shared logic across platforms with Kotlin Multiplatform","Advanced language features used with intent"], stat: ["11h","Learning path"], name: 'Kotlin Professional Certificate by JetBrains', short: 'Kotlin Professional Certificate', issuer: 'JetBrains', slug: 'kotlin', cat: 'Android', line: 'Kotlin from fundamentals to Multiplatform.', desc: '11-hour learning path covering Kotlin fundamentals, advanced language features and Kotlin Multiplatform.', skills: ['Kotlin', 'Cross-platform Development'], ids: [['Credential ID', 'f4164a51eaee4f8c21cefc99d1e267e56975be77b80ef9136b4573c0b251979b']] },
      { k: 'cmp', gains: ["Modern declarative Android interfaces","State-driven, reusable UI components"], name: 'Android Compose with Kotlin', issuer: L, slug: 'jetpackcompose', cat: 'Android', line: 'Declarative Android UI with Jetpack Compose.', desc: 'Building Android interfaces with Jetpack Compose and Kotlin.', skills: ['Jetpack Compose', 'Kotlin'], ids: [['Credential ID', '03554268bd93b18522ac8217d7943ad7edab654622bf5cdaad58ab19cd893320']] },
      { k: 'gem', gains: ["Gemini-powered features inside Android apps","On-device AI where privacy and speed matter","Generative AI APIs called from Kotlin"], stat: ["Gemini","On-device AI"], name: 'Building AI-Powered Android Apps with Gemini', short: 'AI-Powered Android Apps with Gemini', issuer: L, slug: 'googlegemini', cat: 'AI', line: 'Generative AI shipped inside Android apps.', desc: 'Generative AI APIs, on-device AI features, and building AI-powered experiences in Android with Kotlin.', skills: ['Android Development', 'Generative AI'], ids: [['Credential ID', 'e52c7bef792ca4f3419117c5b251d5a7d7c23577959f3e83a70dfdacd1869546']] },
      { k: 'cop', gains: ["Faster delivery with AI pair programming","Refactoring and debugging with Copilot Chat","Responsible, reviewed use of AI-written code"], name: 'Career Essentials in GitHub Copilot Professional Certificate', short: 'GitHub Copilot Professional', issuer: 'GitHub', slug: 'githubcopilot', cat: 'AI', line: 'AI pair programming, used responsibly.', desc: 'AI pair programming, Copilot Chat, extensions, refactoring, and ethical considerations.', skills: ['GitHub Copilot', 'AI-Assisted Development'], ids: [['Credential ID', '9eda63a1599b953017d2b053b28e4ca5ce421dfa9239d1cb166ede795c439512']] },
      { k: 'apm', gains: ["Sprint planning and backlog ownership","Scrum or Kanban, chosen to fit the team","Jira set up so progress stays visible"], stat: ["7h+","Program"], name: 'Atlassian Agile Project Management Professional Certificate', short: 'Agile Project Management Professional', issuer: 'Atlassian', slug: 'atlassian', cat: 'Agile', wide: true, line: 'Scrum, Kanban, sprints and backlogs, run in Jira.', desc: '7+ hour program covering Scrum, Kanban, sprint planning, backlog management and Jira.', skills: ['Jira', 'Agile Methodologies', 'Agile Project Management'], ids: [['Credential ID', '6c89e53378ab16f7d4b002edab66feceac4635b25df7e65d1a835b6b1d420c1b']] },
      { k: 'scr', gains: ["Scrum roles, events and artifacts from day one","PMI-recognized learning hour"], stat: ["1 PDU","PMI"], name: 'Scrum: The Basics', issuer: L, mono: 'Sc', cat: 'Agile', line: 'PMI-recognized Scrum foundation.', desc: 'PMI-recognized course, 1 PDU / Contact Hour (Provider ID #4101).', skills: ['Scrum'], ids: [['Credential ID', 'ac12c41cfd628252c9041487ab25512315cdff5c755cb3c8266b07007d79e437']] },
      { k: 'git', gains: ["Clean branching and merge strategies","Conflicts resolved without lost work","Smooth collaboration on shared remotes"], name: 'Learning Git and GitHub', issuer: L, slug: 'git', cat: 'DevOps', line: 'Branching, merging and team workflows.', desc: 'Branching, merging, resolving conflicts, remote repositories and collaboration.', skills: ['Git', 'GitHub'], ids: [['Credential ID', 'c7641a9022532e34fe7b1801d0cc42c8d3f77f97f61af42c790e075bef638289']] },
      { k: 'gha', gains: ["Pipelines that build and test every push","Automated deploys across environments","Workflow triggers tuned to the team"], name: 'GitHub Actions for CI/CD: Build, Test, and Deploy', short: 'GitHub Actions for CI/CD', issuer: L, slug: 'githubactions', cat: 'DevOps', line: 'Automated build, test and deploy pipelines.', desc: 'CI/CD pipelines, automated tests, deployment, workflow triggers and environments.', skills: ['GitHub', 'CI/CD'], ids: [['Credential ID', 'bbb0361ac4f211e28338bf4d26227f967ea46fdc31ba9a34a5699473c2088656']] },
      { k: 'jira', gains: ["Boards configured for Scrum or Kanban","Clear tracking for teams and stakeholders"], name: 'Learning Jira (Cloud Edition)', short: 'Learning Jira Cloud', issuer: L, slug: 'jira', cat: 'Agile', line: 'Boards and team flow in Jira Cloud.', desc: 'Project management, Scrum and Kanban boards, and team collaboration in Jira Cloud.', skills: ['Jira'], ids: [['Credential ID', '793fd303d045f198b13c725cc2fd00206afd440483d55fb6f294f4ae201a796c']] },
      { k: 'eca', gains: ["Degree recognized against the Canadian standard","Verified by World Education Services"], stat: ["4-yr","Canadian equiv."], name: 'Educational Credential Assessment (ECA) for B.E.', short: 'Canadian Degree Equivalency', issuer: 'World Education Services', mono: 'CA', cat: 'Professional', wide: true, line: 'B.E. in IT verified as equivalent to a Canadian 4-year degree.', desc: 'Verified Canadian equivalency for a 4-year Bachelor of Engineering in IT from Gujarat Technological University.', skills: [], ids: [['Credential ID', 'B261FJAUQQIMM']] },
      { k: 'rl', gains: ["Leadership recognized by Fanshawe College","Communication and teamwork in group settings"], name: 'Rising Leaders', issuer: 'Fanshawe College', mono: 'RL', cat: 'Professional', line: 'Recognized for leadership and teamwork.', desc: 'Recognized for leadership, communication and teamwork.', skills: ['Problem Solving'], ids: [] },
      { k: 'tcs', gains: ["Clear communication with technical and non-technical people","Presentations structured for the audience","Adaptable, collaborative teamwork"], stat: ["×3","Certificates"], name: 'TCS Certified Professional Skills', short: 'TCS Professional Skills', issuer: 'TCS', mono: 'TCS', cat: 'Professional', wide: true, count: 3, line: 'Soft skills, presentation and communication, certified by TCS.', desc: 'Three certifications. Soft Skills Professional: communication, adaptability, teamwork and problem-solving. Presentation Skills Professional: structure, slide preparation, delivery and audience engagement. Communication Skills: verbal and non-verbal communication and overcoming barriers.', skills: ['Communication', 'Presentation', 'Teamwork'], ids: [['Soft Skills Professional', '66790-25013483-1016'], ['Presentation Skills Professional', '66756-25013483-1016'], ['Communication Skills', '91306-25013483-1016']] },
      { k: 'int', gains: ["A designer’s eye carried into UI work","Real client work in a studio setting"], stat: ["×2","Internships"], name: 'Internship Certificates', short: 'Design Internships', issuer: 'NMR · CreArt', mono: 'In', cat: 'Professional', count: 2, line: 'Graphic design and studio internships.', desc: 'Graphics Designing Internship at NMR Enterprise, and an internship at CreArt Solutions Pvt Ltd.', skills: ['Graphic Design'], ids: [] }
    ];
    const certSw = { AI: '#ec3013', Android: 'oklch(0.76 0.15 155)', DevOps: 'oklch(0.75 0.12 220)', Agile: 'oklch(0.8 0.14 75)', Professional: 'oklch(0.72 0.15 295)' };
    const certLogo = (slug, white) => 'url(https://cdn.simpleicons.org/' + slug + (white || (darkBrand[slug] && s.dark) ? '/ffffff' : '') + ')';
    const fav = d => 'url(https://www.google.com/s2/favicons?domain=' + d + '&sz=128)';
    const certImg = { gai: 'google.com', kt: 'kotlinlang.org', cmp: 'developer.android.com', gem: 'gemini.google.com', cop: 'github.com', apm: 'atlassian.com', scr: 'linkedin.com', git: 'git-scm.com', gha: 'github.com', jira: 'atlassian.com', eca: 'wes.org', rl: 'fanshawec.ca', tcs: 'tcs.com' };
    const cnt = c => c.count || 1;
    const doms = ['AI', 'Android', 'DevOps', 'Agile', 'Professional'];
    const fCat = s.certCat && s.certCat !== 'All' ? s.certCat : null;
    const order = doms.filter(d => !fCat || d === fCat).flatMap(d => certData.filter(c => c.cat === d));
    this._certOrder = order.map(c => c.k);
    const selK = order.some(c => c.k === s.certSel) ? s.certSel : order[0].k;
    const pickCert = k => { this.setState({ certSel: k, certCopied: null }); requestAnimationFrame(() => { const el = this.certFaceRef.current; el && el.animate([{ opacity: 0, transform: 'translateY(10px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 500, easing: 'cubic-bezier(.2,.8,.2,1)' }); }); };
    this._pickCert = pickCert;
    const certDomains = doms.map(d => ({ label: d, sw: certSw[d], n: certData.filter(c => c.cat === d).reduce((n, c) => n + cnt(c), 0), active: fCat === d,
      grow: certData.filter(c => c.cat === d).reduce((n, c) => n + cnt(c), 0), op: !fCat || fCat === d ? 1 : 0.35,
      pick: () => { const nc = fCat === d ? 'All' : d; this.setState({ certCat: nc }); const first = certData.find(c => nc === 'All' || c.cat === nc); pickCert(first.k); this.scheduleCert(); } }));
    const gNum = {}; certData.forEach((c, i) => gNum[c.k] = String(i + 1).padStart(2, '0'));
    const certGroups = doms.filter(d => !fCat || d === fCat).map(d => { const rows = certData.filter(c => c.cat === d); return { label: d, sw: certSw[d], n: String(rows.reduce((n, c) => n + cnt(c), 0)).padStart(2, '0'),
      rows: rows.map(c => { const on = c.k === selK; return { short: c.short || c.name, issuer: c.issuer, num: gNum[c.k], hasLogo: !!certImg[c.k], noLogo: !certImg[c.k], logo: certImg[c.k] ? fav(certImg[c.k]) : 'none', mono: c.mono,
        multi: cnt(c) > 1, count: cnt(c), tile: certImg[c.k] ? '#fff' : 'var(--sk-chip)', active: on, bg: on ? 'var(--sk-tile)' : 'transparent', bd: on ? 'var(--sk-border2)' : 'transparent', sh: on ? 'var(--sk-tshadow)' : 'none',
        numC: on ? '#ec3013' : 'var(--sk-muted2)', arC: on ? '#ec3013' : 'var(--sk-muted2)', arX: on ? '0px' : '-6px',
        hover: () => { if (s.wide && c.k !== selK) pickCert(c.k); },
        pick: () => { pickCert(c.k); if (!s.wide) { const st = document.getElementById('cert-stage'); st && window.scrollTo({ top: st.getBoundingClientRect().top + scrollY - 80, behavior: 'smooth' }); } } }; }) }; });
    const cx = certData.find(c => c.k === selK), ci = order.findIndex(c => c.k === selK);
    const stepCert = d => { pickCert(order[(ci + d + order.length) % order.length].k); this.scheduleCert(); };
    const mainId = cx.ids[0];
    const cs = { name: cx.name, issuer: cx.issuer, cat: cx.cat, sw: certSw[cx.cat], hasLogo: !!certImg[cx.k], noLogo: !certImg[cx.k], logo: certImg[cx.k] ? fav(certImg[cx.k]) : 'none', mono: cx.mono,
      tile: certImg[cx.k] ? '#fff' : 'rgba(255,255,255,0.08)', hasStat: !!cx.stat, statN: cx.stat ? cx.stat[0] : '', statL: cx.stat ? cx.stat[1] : '',
      gains: (cx.gains || []).map((t, i) => ({ n: String(i + 1).padStart(2, '0'), t })), skills: cx.skills,
      idLabel: cx.ids.length > 1 ? cx.ids.length + ' credential IDs' : mainId ? 'Credential ID' : 'Issued by', idShort: cx.ids.length > 1 ? 'Listed below' : mainId ? (mainId[1].length > 24 ? mainId[1].slice(0, 10) + '…' + mainId[1].slice(-8) : mainId[1]) : cx.issuer,
      multi: cx.ids.length > 1, single: cx.ids.length === 1, copyLabel: mainId && s.certCopied === mainId[1] ? 'Copied ✓' : 'Copy ID',
      copy: () => { navigator.clipboard && navigator.clipboard.writeText(mainId[1]); this.setState({ certCopied: mainId[1] }); },
      ids: cx.ids.map(([label, id]) => ({ label, id, btn: s.certCopied === id ? 'Copied' : 'Copy', copy: () => { navigator.clipboard && navigator.clipboard.writeText(id); this.setState({ certCopied: id }); } })),
      pos: String(ci + 1).padStart(2, '0') + ' / ' + String(order.length).padStart(2, '0') };
    const certProg = React.createElement('span', { key: selK + (s.certHold ? 'h' : 'r'), className: 'cert-progress-bar', style: { transform: s.certHold ? 'scaleX(0)' : undefined, animation: s.certHold ? 'none' : 'certProg 6s linear forwards' } });
    const iss = [['Google', 'google.com'], ['JetBrains', 'jetbrains.com'], ['LinkedIn Learning', 'linkedin.com'], ['GitHub', 'github.com'], ['Atlassian', 'atlassian.com'], ['World Education Services', 'wes.org'], ['Fanshawe College', 'fanshawec.ca'], ['TCS', 'tcs.com'], ['NMR Enterprise'], ['CreArt Solutions']];
    const certIssuers = [...iss, ...iss].map(([name, slug]) => ({ name, hasLogo: !!slug, logo: slug ? fav(slug) : 'none' }));
    const certMove = e => { const el = this.certCardRef.current; if (!el) return; const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--rx', ((px - 0.5) * 14).toFixed(2) + 'deg'); el.style.setProperty('--ry', ((0.5 - py) * 12).toFixed(2) + 'deg');
      el.style.setProperty('--mx', (px * 100).toFixed(1) + '%'); el.style.setProperty('--my', (py * 100).toFixed(1) + '%'); el.style.setProperty('--px', (px * 100).toFixed(1)); };
    const certLeave = () => { const el = this.certCardRef.current; if (!el) return; ['--rx', '--ry', '--mx', '--my', '--px'].forEach(v => el.style.removeProperty(v)); };
    const certStats = [{ n: '17', l: 'Credentials' }, { n: '10', l: 'Issuers' }, { n: '100%', l: 'Google AI score' }];

    const svcData = [
      ['Native Android App Development', 'Production-ready apps in Kotlin, from the first screen to the Play Store release.', ['Kotlin', 'Jetpack Compose', 'MVVM']],
      ['UI/UX Design for Mobile', 'Material 3 interfaces that feel natural, accessible and true to your brand.', ['Figma', 'Material 3', 'Accessibility']],
      ['API Integration & Backend Connectivity', 'Reliable data layers that connect your app to REST APIs and Firebase.', ['Retrofit', 'OkHttp', 'Firebase']],
      ['App Performance & Crash Optimization', 'Faster launches, smoother scrolling and fewer crashes, tracked in Crashlytics.', ['Crashlytics', 'Profiling', 'Room']],
      ['CI/CD Pipeline Setup', 'Automated builds, tests and releases on every push, so shipping stays routine.', ['GitHub Actions', 'Gradle', 'Testing']],
      ['AI-Powered App Features (Gemini API)', 'Smart summaries, chat and recommendations built into your app with Gemini.', ['Gemini API', 'Generative AI', 'Kotlin']],
      ['Code Review & Mentorship', 'Clear feedback and pairing sessions that raise the quality bar for the whole team.', ['Code review', 'Clean Architecture', 'Agile']]
    ];
    const svcI = s.svcSel || 0;
    if (this._svcI !== svcI) { const first = this._svcI == null; this._svcI = svcI; if (!first) requestAnimationFrame(() => this.svcNumRef && this.svcNumRef.current && this.svcNumRef.current.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 400, easing: 'cubic-bezier(.2,.8,.2,1)' })); }
    const p = s.statP;
    const stats = [[3, '+', 'Years experience'], [10, '+', 'Apps delivered'], [10, 'K+', 'Users served'], [17, '', 'Certifications']]
      .map(([n, suf, label], i) => ({ label, display: Math.round(n * p).toLocaleString('en-CA') + suf,
        ref: i === 0 ? (el => { this.statEl = el; }) : undefined }));

    const tech = ['Kotlin', 'Jetpack Compose', 'Coroutines', 'Firebase', 'Retrofit', 'MVVM', 'Hilt', 'Room', 'Material 3', 'Gemini API', 'GitHub Actions'];
    const seq = (k) => tech.map((t, i) => React.createElement('span', { key: k + i, className: 'marquee-item' },
      t, React.createElement('span', { className: 'marquee-dot' })));
    const marquee = React.createElement('div', { 'aria-hidden': true, className: 'marquee-track' },
      React.createElement('div', { className: 'marquee-half' }, seq('a')), React.createElement('div', { className: 'marquee-half' }, seq('b')));

    const cursor = (this.props.showCursor ?? true) ? React.createElement('div', { ref: this.cursorRef, 'aria-hidden': true, className: 'custom-cursor',
      style: { transform: 'translate(-100px,-100px)' } }) : null;

    const dockKeys = [['home','#top','Home'],['about','#about','About'],['experience','#experience','Experience'],['work','#work','Projects'],['skills','#skills','Skills'],['services','#services','Services'],['education','#education','Education'],['contact','#contact','Contact'],['theme',null,s.dark ? 'Light mode' : 'Dark mode']];
    const dk = s.dockOnDark ?? s.dark, dkInkC = dk ? '#f3f2f2' : '#201e1d';
    const hi = dockKeys.findIndex(d => d[0] === s.dockHover);
    const dock = {};
    dockKeys.forEach(([k, href, label], i) => {
      const dist = hi < 0 ? 9 : Math.abs(i - hi), act = (s.dockActive === 'certifications' ? 'education' : (s.dockActive || 'home')) === k;
      dock[k] = { href, label, tf: dist === 0 ? 'scale(1.32) translateY(-4px)' : dist === 1 ? 'scale(1.14) translateY(-2px)' : 'none', tip: dist === 0 ? 1 : 0,
        fg: act ? dkInkC : (dk ? 'rgba(243,242,242,0.72)' : 'rgba(32,30,29,0.7)'),
        bg: act ? (dk ? 'linear-gradient(180deg,rgba(255,255,255,0.26),rgba(255,255,255,0.08))' : 'linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,255,255,0.4))') : dist === 0 ? (dk ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent',
        sh: act ? 'inset 0 1px 1px rgba(255,255,255,' + (dk ? 0.45 : 0.95) + '),inset 0 -1px 1px rgba(0,0,0,0.06),0 4px 12px -4px rgba(0,0,0,0.25)' : 'none',
        dotOp: act ? 1 : 0, enter: () => this.setState({ dockHover: k }) };
    });
    return {
      dock, dockLeave: () => this.setState({ dockHover: null }),
      isDark: !!s.dark, isLight: !s.dark,
      glassHi: dk ? '0.08' : '0.5', glassLo: dk ? '0.04' : '0.2', glassRim: dk ? '0.4' : '1', glassSheen: dk ? '0.22' : '0.9',
      glassFill: dk ? 'rgba(255,255,255,0.04)' : 'rgba(110,112,130,0.07)',
      glassEdgeBg: dk ? 'linear-gradient(135deg,rgba(255,255,255,0.4) 0%,rgba(255,255,255,0.05) 35%,rgba(255,255,255,0.02) 60%,rgba(255,255,255,0.4) 100%)' : 'linear-gradient(135deg,rgba(255,255,255,1) 0%,rgba(0,0,0,0.14) 30%,rgba(0,0,0,0.08) 65%,rgba(255,255,255,1) 100%)',
      glassOuter: dk ? '0 0 0 0.5px rgba(255,255,255,0.08),0 1px 2px rgba(0,0,0,0.25),0 20px 44px -18px rgba(0,0,0,0.55)' : '0 0 0 0.5px rgba(0,0,0,0.12),0 1px 3px rgba(0,0,0,0.10),0 14px 34px -10px rgba(0,0,0,0.28)',
      dkDiv: dk ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)', dkInk: dkInkC,
      tipBg: dk ? 'rgba(30,30,34,0.55)' : 'rgba(255,255,255,0.6)', tipFg: dkInkC,
      toggleTheme: () => { const d = !this.state.dark; this.applyTheme(d); try { localStorage.setItem('hp-theme', d ? 'dark' : 'light'); } catch (e) {} this.setState({ dark: d }); setTimeout(() => this.sampleDock && this.sampleDock(), 60); },
      helloEnW: s.fr ? '0' : '3em', helloEnT: s.fr ? 'translateY(-110%)' : 'none', helloFrW: s.fr ? '6em' : '0', helloFrT: s.fr ? 'none' : 'translateY(110%)',
      time: s.time, isWide: s.wide, isNarrow: !s.wide, menuOpen: !!s.menuOpen,
      menuHidden: !s.menuOpen, menuClip: s.menuOpen ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)', menuPe: s.menuOpen ? 'auto' : 'none', menuAsideOp: s.menuOpen ? 1 : 0,
      menuLeave: () => this.setState({ menuHover: null }),
      menuLinks: [['Home', '#top'], ['Work', '#work'], ['Experience', '#experience'], ['Skills', '#skills'], ['Services', '#services'], ['Contact', '#contact']].map(([label, href], i) => {
        const hv = s.menuHover, me = hv === i;
        return { label, href, num: String(i + 1).padStart(2, '0'),
          tf: s.menuOpen ? 'none' : 'translateY(105%)', dl: s.menuOpen ? (0.3 + i * 0.07) + 's' : '0s',
          op: hv == null || me ? 1 : 0.3, fs: me ? 'italic' : 'normal', col: me ? 'var(--color-accent-400)' : 'var(--color-bg)',
          shift: me ? 'translateX(0.25em)' : 'none', enter: () => this.setState({ menuHover: i }) };
      }),
      menuLabel: s.menuOpen ? 'Close' : 'Menu',
      toggleMenu: () => { document.body.style.overflow = 'hidden'; this.setState({ menuOpen: true, menuHover: null }); },
      closeMenu: () => { document.body.style.overflow = ''; this.setState({ menuOpen: false }); },
      progressRef: el => { this.prog = el; },
      fieldRef: el => { this.field = el; }, heroMove: this.heroMove,
      navLinks: [['Work', '#work'], ['Experience', '#experience'], ['Skills', '#skills'], ['Services', '#services'], ['Contact', '#contact']]
        .map(([label, href], i) => ({ label, href, num: String(i + 1).padStart(2, '0') })),
      socials: [{ label: 'LinkedIn', logo: 'url(assets/logo-linkedin.svg)', href: 'https://www.linkedin.com/in/harsh-patel0909/' }, { label: 'GitHub', logo: 'url(assets/logo-github.svg)', href: 'https://github.com/harshpatel0909' }, { label: 'Email', logo: 'url(assets/logo-gmail.svg)', href: 'mailto:harshbpatel0909@gmail.com' }],
      showMarquee: this.props.showMarquee ?? true, marquee, cursor,
      aboutPillars: [['Users first', 'Every screen starts with what the user needs to get done.'], ['Built to scale', 'Clean architecture and tested code that teams can extend with confidence.'], ['Measured', 'Crashlytics and performance data decide what I fix next.'], ['Always learning', '17 certifications across AI, Android and DevOps, and counting.']].map(([title, body], i) => ({ title, body, num: String(i + 1).padStart(2, '0'), d: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8', 'M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', 'M22 12h-4l-3 9L9 3l-3 9H2', 'M22 10 12 5 2 10l10 5 10-5zM6 12v5c3 3 9 3 12 0v-5'][i] })),
      heroStack: ['Kotlin', 'Jetpack Compose', 'Firebase', 'Gemini API'],
      pulseDot: this._pulse || (this._pulse = React.createElement('span', { style: { position: 'relative', width: 10, height: 10, flex: 'none' } }, React.createElement('span', { style: { position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e', animation: 'hpPing 1.8s cubic-bezier(0,0,.2,1) infinite' } }), React.createElement('span', { style: { position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e' } }))),
      stats, projects, projGlow: e => { const el = e.currentTarget, r = el.getBoundingClientRect(); el.style.setProperty('--gx', (e.clientX - r.left) + 'px'); el.style.setProperty('--gy', (e.clientY - r.top) + 'px'); }, jobs: jobsUi, ej, expBars, expTicks, expStats, expPanelRef: this.expPanelRef, expPrev: () => pickJob((jSel + 2) % 3), expNext: () => pickJob((jSel + 1) % 3), skillTabs, skills, cur, tableLeave, prevSkill, nextSkill, gridRef, iconRef, gridMove,
      skillCount: `${skills.length} elements in six families. Hover a tile to see its logo, click to pin it, or pick a family to light it up.`,
      services: svcData.map((d, i) => { const on = i === svcI; return { title: d[0], num: String(i + 1).padStart(2, '0'), on,
        bg: on ? 'var(--color-text)' : 'transparent', fg: on ? 'var(--color-bg)' : 'var(--color-text)', numCol: on ? 'var(--color-accent-400)' : 'var(--color-accent-700)',
        pad: on ? '20px' : '0px', rot: on ? 'none' : 'rotate(-45deg)', pick: () => { if (this.state.svcSel !== i) this.setState({ svcSel: i }); } }; }),
      svc: { title: svcData[svcI][0], desc: svcData[svcI][1], tags: svcData[svcI][2], num: String(svcI + 1).padStart(2, '0') },
      svcLeave: () => {}, svcNumRef: this.svcNumRef || (this.svcNumRef = React.createRef()),
      svcAsk: () => this.setState({ intent: 'Freelance project' }),
      svcCols: s.wide ? 'repeat(4,minmax(0,1fr))' : 'repeat(auto-fill,minmax(min(100%,260px),1fr))', svcFeatCol: s.wide ? 'span 2' : '1 / -1', svcFeatRow: s.wide ? 'span 2' : 'auto', svcCtaCol: s.wide ? 'span 2' : '1 / -1',
      education: [
        { school: 'Fanshawe College', place: '', dates: 'Apr 2024 – Aug 2025', credential: 'Ontario College Graduate Certificate (Co-op Endorsed), Mobile Application Development', score: '3.96 / 4.2', honour: "GPA · Dean's Honour Roll" },
        { school: 'Apollo Institute of Engineering and Technology', place: 'Gujarat, India', dates: 'Jul 2018 – May 2022', credential: 'Bachelor of Engineering (B.E.) – Information Technology', score: '8.54 / 10', honour: 'First Class with Distinction' }
      ],
      certStats, certDomains, certGroups, cs, certProg, certIssuers, certMove, certLeave, certCardRef: this.certCardRef, certFaceRef: this.certFaceRef, certPrev: () => stepCert(-1), certNext: () => stepCert(1), certAllC: fCat ? 'var(--sk-muted)' : '#ec3013', certShowAll: () => { this.setState({ certCat: 'All' }); this.scheduleCert(); }, certHoldOn: () => { clearTimeout(this.certTO); this.setState({ certHold: true }); }, certHoldOff: () => { this.setState({ certHold: false }); this.scheduleCert(); },
      form: s.form, errors: s.errors, status: s.status,
      onName: this.setField('name'), onEmail: this.setField('email'), onSubject: this.setField('subject'), onMessage: this.setField('message'),
      submit: this.submit,
      copyLabel: s.copied ? 'Email copied to clipboard' : 'Copy email address',
      intents: ['Full-time role', 'Freelance project', 'Contract work', 'Collaboration'].map(label => { const on = (s.intent || 'Full-time role') === label;
        return { label, on, bg: on ? 'var(--color-text)' : 'transparent', fg: on ? 'var(--color-bg)' : 'var(--color-text)', bd: on ? 'var(--color-text)' : 'var(--color-divider)', pick: () => this.setState({ intent: label }) }; }),
      msgHint: { 'Full-time role': 'Team, role and what the app does…', 'Freelance project': 'What you want built, timeline and budget range…', 'Contract work': 'Scope, duration and tech stack…', 'Collaboration': 'The idea and how we could work together…' }[s.intent || 'Full-time role'],
      contactRows: [
        { label: 'Email', value: 'harshbpatel0909@gmail.com', href: 'mailto:harshbpatel0909@gmail.com', target: '_self', logo: 'url(assets/logo-gmail.svg)', d: 'M2 4h20v16H2zM22 6l-10 7L2 6' },
        { label: 'Phone', value: '416-841-4081', href: 'tel:+14168414081', target: '_self', logo: 'url(assets/logo-phone.svg)', d: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z' },
        { label: 'LinkedIn', value: 'in/harsh-patel0909', href: 'https://www.linkedin.com/in/harsh-patel0909/', target: '_blank', logo: 'url(assets/logo-linkedin.svg)', d: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 0 0 4a2 2 0 1 0 0-4' },
        { label: 'GitHub', value: 'github.com/harshpatel0909', href: 'https://github.com/harshpatel0909', target: '_blank', logo: 'url(assets/logo-github.svg)', d: 'M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.1-1.3-.3-2.5-1-3.5.3-1.2.3-2.4 0-3.5 0 0-1 0-3 1.5a10.6 10.6 0 0 0-6 0C8 2 7 2 7 2c-.3 1.1-.3 2.3 0 3.5a5.4 5.4 0 0 0-1 3.5c0 3.5 3 5.5 6 5.5-.4.5-.7 1-.9 1.6-.2.6-.2 1.2-.1 1.9v4M9 18c-4.5 2-5-2-7-2' }
      ],
      copyEmail: () => { navigator.clipboard && navigator.clipboard.writeText('harshbpatel0909@gmail.com'); this.setState({ copied: true }); setTimeout(() => this.setState({ copied: false }), 1800); }
    };
  }
}
  return Component;
};
