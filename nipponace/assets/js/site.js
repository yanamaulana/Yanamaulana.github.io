/* Alpine dimuat setelah berkas ini, menggunakan defer. */
document.addEventListener('alpine:init', () => {
  Alpine.data('legalDocuments', () => ({
    selected: null,
    trigger: null,
    previousOverflow: '',
    documents: {
      nib: { title: 'NIB', number: '008260002116', url: 'assets/images/legalitas/NIB.pdf' },
      sk: { title: 'SK Kemenkumham', number: 'AHU-A111550.AH.01.30.Tahun 2026', url: 'assets/images/legalitas/SK_Kemenkumham.pdf' },
      npwp: { title: 'NPWP', number: '1000 0000 1074 5785', url: 'assets/images/legalitas/NPWP.pdf' }
    },
    openDocument(key, trigger) {
      this.selected = this.documents[key];
      this.trigger = trigger;
      this.previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      this.$refs.preview.showModal();
      this.$nextTick(() => this.$refs.closePreview.focus());
    },
    closePreview() { this.$refs.preview.close(); },
    resetPreview() {
      this.selected = null;
      document.body.style.overflow = this.previousOverflow;
      this.trigger?.focus({ preventScroll: true });
    }
  }));

  Alpine.data('heroCarousel', () => ({
    current: 0,
    total: 3,
    timer: null,
    paused: false,
    hovered: false,
    focused: false,
    visible: true,
    reducedMotion: false,
    init() {
      this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion = this.motionQuery.matches;
      this.onMotionChange = event => { this.reducedMotion = event.matches; this.start(); };
      this.onVisibilityChange = () => this.start();
      this.motionQuery.addEventListener('change', this.onMotionChange);
      document.addEventListener('visibilitychange', this.onVisibilityChange);
      if ('IntersectionObserver' in window) {
        this.heroObserver = new IntersectionObserver(entries => {
          this.visible = entries[0].isIntersecting;
          this.start();
        });
        this.heroObserver.observe(this.$el);
      }
      this.start();
    },
    stop() { clearInterval(this.timer); this.timer = null; },
    start() {
      this.stop();
      if (this.paused || this.hovered || this.focused || this.reducedMotion || !this.visible || document.hidden) return;
      this.timer = setInterval(() => this.goTo(this.current + 1), 4500);
    },
    goTo(index) {
      this.current = (index + this.total) % this.total;
      this.start();
    },
    togglePlayback() { this.paused = !this.paused; this.start(); },
    leaveFocus() {
      this.$nextTick(() => {
        this.focused = this.$el.contains(document.activeElement);
        this.start();
      });
    },
    destroy() {
      this.stop();
      this.heroObserver?.disconnect();
      this.motionQuery.removeEventListener('change', this.onMotionChange);
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }
  }));

  Alpine.data('companySite', () => ({
    menuOpen: false,
    headerOnHome: false,
    activeSection: 'beranda',
    filter: 'Semua bidang',
    jobLimit: 5,
    jobsExpanded: false,
    slide: 0,
    status: '',
    statusType: '',
    submitting: false,
    step: 0,
    steps: ['Data Diri Calon Peserta', 'Data Diri Calon Peserta (Lanjutan)', 'Riwayat Kesehatan', 'Pendidikan', 'Riwayat Pekerjaan di Indonesia', 'Pengalaman di Jepang', 'Upload Dokumen', 'Pernyataan'],
    fileErrors: {},
    form: {
      email: '', field: '', jobOrderConsultation: '', romaji: '', katakana: '',
      gender: '', birthPlace: '', birthDate: '', identityAddress: '',
      maritalStatus: '', height: '', weight: '', motherName: '', fatherName: '',
      guardianPhone: '', guardianAddress: '', diagnosedDisease: '', diseaseName: '',
      diagnosisYear: '', diseaseRecovered: '', willingMcu: '', education: '',
      school: '', major: '', latestGrade: '', lastCompany: '', lastPosition: '',
      resignationReason: '', workedInJapan: '', visitedJapan: '', overstay: '',
      deported: '', visaRejected: '', visaStatus: '', japanCompany: '',
      japanJobType: '', japanPeriod: '', returnReason: '', declaration: false,
      website: ''
    },
    init() {
      this.$nextTick(() => this.updateHeader());
      this.jobMediaQuery = window.matchMedia('(max-width: 639px)');
      this.syncJobLimit = () => {
        this.jobLimit = this.jobMediaQuery.matches ? 3 : 5;
        this.jobsExpanded = false;
      };
      this.syncJobLimit();
      this.jobMediaQuery.addEventListener('change', this.syncJobLimit);
      this.$watch('filter', () => { this.jobsExpanded = false; });
      this.$watch('menuOpen', value => {
        if (value) this.$nextTick(() => this.$refs.mobileNav.querySelector('a').focus());
      });
      this.$watch('form.diagnosedDisease', value => {
        if (value !== 'Ya') Object.assign(this.form, { diseaseName: '', diagnosisYear: '', diseaseRecovered: '' });
      });
      this.$watch('form.workedInJapan', value => {
        if (value === 'Ya') Object.assign(this.form, { visitedJapan: '', overstay: '', deported: '', visaRejected: '' });
        if (value === 'Tidak') Object.assign(this.form, { visaStatus: '', japanCompany: '', japanJobType: '', japanPeriod: '', returnReason: '' });
      });
      const sections = document.querySelectorAll('main > section[id]');
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => { if (entry.isIntersecting) this.activeSection = entry.target.id; });
        }, { rootMargin: '-15% 0px -65% 0px' });
        sections.forEach(section => observer.observe(section));
      }
    },
    destroy() {
      this.jobMediaQuery?.removeEventListener('change', this.syncJobLimit);
    },
    updateHeader() {
      const hero = document.getElementById('beranda').getBoundingClientRect();
      const headerHeight = this.$refs.siteHeader.offsetHeight;
      this.headerOnHome = hero.top <= headerHeight && hero.bottom > headerHeight;
    },
    closeMenu(restoreFocus = false) {
      this.menuOpen = false;
      if (restoreFocus) this.$refs.menuButton.focus();
    },
    showJob(category, element) {
      if (this.filter !== 'Semua bidang' && this.filter !== category) return false;
      if (this.jobsExpanded) return true;
      const matchingCards = Array.from(document.querySelectorAll('#job-grid article'))
        .filter(card => this.filter === 'Semua bidang' || card.dataset.category === this.filter);
      return matchingCards.indexOf(element) < this.jobLimit;
    },
    filteredJobCount() {
      return Array.from(document.querySelectorAll('#job-grid article'))
        .filter(card => this.filter === 'Semua bidang' || card.dataset.category === this.filter).length;
    },
    toggleJobs() { this.jobsExpanded = !this.jobsExpanded; },
    selectField(field) {
      this.form.field = field;
      this.step = 0;
      this.$nextTick(() => document.getElementById('email').focus({ preventScroll: true }));
    },
    validateFile(event, name) {
      const input = event.currentTarget;
      const file = input.files[0];
      let message = '';
      if (file && (!file.name.toLowerCase().endsWith('.pdf') || (file.type && file.type !== 'application/pdf'))) {
        message = 'Unggah dokumen dalam format PDF.';
      } else if (file && file.size > 10 * 1024 * 1024) {
        message = 'Ukuran file maksimal 10 MB.';
      }
      input.setCustomValidity(message);
      this.fileErrors[name] = message;
    },
    validateStep() {
      const panel = this.$refs.applicantForm.querySelector(`[data-form-step="${this.step}"]`);
      const controls = Array.from(panel.querySelectorAll('input, select, textarea'))
        .filter(control => control.getClientRects().length > 0);
      for (const control of controls) {
        if (control.type === 'file') {
          const file = control.files[0];
          const message = file && (!file.name.toLowerCase().endsWith('.pdf') || (file.type && file.type !== 'application/pdf'))
            ? 'Unggah dokumen dalam format PDF.'
            : file && file.size > 10 * 1024 * 1024
              ? 'Ukuran file maksimal 10 MB.'
              : '';
          control.setCustomValidity(message);
          this.fileErrors[control.name] = message;
        }
        if (!control.checkValidity()) {
          control.reportValidity();
          control.focus();
          return false;
        }
      }
      return true;
    },
    focusStepHeading() {
      this.$refs.applicantForm.querySelector(`[data-form-step="${this.step}"] h4`).focus({ preventScroll: true });
    },
    nextStep() {
      if (!this.validateStep()) return;
      this.status = '';
      this.step = Math.min(this.step + 1, this.steps.length - 1);
      this.$nextTick(() => this.focusStepHeading());
    },
    previousStep() {
      this.status = '';
      this.step = Math.max(this.step - 1, 0);
      this.$nextTick(() => this.focusStepHeading());
    },
    submit() {
      if (this.submitting || this.step !== this.steps.length - 1) return;
      this.status = '';
      if (!this.validateStep()) return;
      if (this.form.website) return;
      const config = window.NIPPON_ACE_CONFIG || {};
      if (config.webhookUrl && !config.webhookUrl.includes('YOUR_DEPLOYMENT_ID')) {
        this.statusType = 'error';
        this.status = 'Endpoint saat ini belum mendukung formulir pendaftaran dan unggahan dokumen. Data belum dikirim. Hubungi admin untuk menyiapkan backend pendaftaran yang aman.';
        return;
      }
      this.statusType = 'info';
      this.status = 'Formulir demo: data dan dokumen belum dikirim atau disimpan. Layanan pendaftaran belum diaktifkan.';
    }
  }));
});

document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reducedMotion) return;
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('is-pending');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => {
    if (element.getBoundingClientRect().top > window.innerHeight) {
      element.classList.add('is-pending');
      revealObserver.observe(element);
    }
  });
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.dataset.count);
      const suffix = element.dataset.suffix || '';
      const start = performance.now();
      const tick = now => {
        const progress = Math.min((now - start) / 1300, 1);
        const count = Math.round(target * (1 - Math.pow(1 - progress, 3)));
        element.textContent = count.toLocaleString('en-US') + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(element);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(element => counterObserver.observe(element));
});
