/* Alpine dimuat setelah berkas ini, menggunakan defer. */
document.addEventListener('alpine:init', () => {

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
    jobSlide: 0,
    jobCount: 16,
    slide: 0,
    storyCount: 5,
    status: '',
    statusType: '',
    submitting: false,
    step: 0,
    routeStep: true,
    leaveWarningTrigger: null,
    indonesiaSteps: ['Data Diri Calon Peserta', 'Data Diri Calon Peserta (Lanjutan)', 'Riwayat Kesehatan', 'Pendidikan', 'Riwayat Pekerjaan di Indonesia', 'Pengalaman di Jepang', 'Upload Dokumen', 'Pernyataan'],
    japanSteps: ['Data Kandidat di Jepang', 'Dokumen Kandidat di Jepang'],
    get steps() {
      return this.form.currentLocation === 'Jepang' ? this.japanSteps : this.indonesiaSteps;
    },
    fileErrors: {},
    form: {
      currentLocation: '', email: '', field: '', jobOrderConsultation: '', indonesiaKtpNumber: '', romaji: '', katakana: '',
      gender: '', birthPlace: '', birthDate: '', identityAddress: '',
      maritalStatus: '', height: '', weight: '', motherName: '', fatherName: '',
      guardianPhone: '', guardianAddress: '', diagnosedDisease: '', diseaseName: '',
      diagnosisYear: '', diseaseRecovered: '', willingMcu: '', education: '',
      school: '', major: '', latestGrade: '', lastCompany: '', lastPosition: '',
      resignationReason: '', workedInJapan: '', visitedJapan: '', overstay: '',
      deported: '', visaRejected: '', visaStatus: '', japanCompany: '',
      japanJobType: '', japanPeriod: '', returnReason: '', declaration: false,
      passportNumber: '', japanName: '', japanGender: '', japanBirthDate: '',
      japanAddress: '', currentOccupation: '', japanVisaStatus: '', remainingTg: '',
      japanExperience: '', ownedCertificates: '', zairyuExpiry: '',
      desiredJobPrefecture: '', applyReason: '',
      website: ''
    },
    init() {
      try {
        const selectedField = sessionStorage.getItem('nipponAceSelectedField');
        if (selectedField) {
          this.form.field = selectedField;
          sessionStorage.removeItem('nipponAceSelectedField');
        }
      } catch { }
      this.$nextTick(() => this.updateHeader());
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
    updateHeader() {
      const heroElement = document.getElementById('beranda');
      if (!heroElement || !this.$refs.siteHeader) {
        this.headerOnHome = false;
        return;
      }
      const hero = heroElement.getBoundingClientRect();
      const headerHeight = this.$refs.siteHeader.offsetHeight;
      this.headerOnHome = hero.top <= headerHeight && hero.bottom > headerHeight;
    },
    closeMenu(restoreFocus = false) {
      this.menuOpen = false;
      if (restoreFocus) this.$refs.menuButton?.focus();
    },
    requestLeave(event) {
      this.leaveWarningTrigger = event.currentTarget;
      if (!this.$refs.leaveWarning.open) this.$refs.leaveWarning.showModal();
      this.$nextTick(() => this.$refs.stayOnForm?.focus());
    },
    cancelLeave() {
      this.$refs.leaveWarning.close();
      const trigger = this.leaveWarningTrigger;
      this.leaveWarningTrigger = null;
      this.$nextTick(() => trigger?.focus({ preventScroll: true }));
    },
    confirmLeave() {
      this.$refs.leaveWarning.close();
      window.location.href = 'index.html';
    },
    previousJob() { this.jobSlide = (this.jobSlide + this.jobCount - 1) % this.jobCount; },
    nextJob() { this.jobSlide = (this.jobSlide + 1) % this.jobCount; },
    previousStory() { this.slide = (this.slide + this.storyCount - 1) % this.storyCount; },
    nextStory() { this.slide = (this.slide + 1) % this.storyCount; },
    selectField(field) {
      try { sessionStorage.setItem('nipponAceSelectedField', field); } catch { }
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
      const panel = this.routeStep
        ? this.$refs.applicantForm.querySelector('[data-location-step]')
        : this.$refs.applicantForm.querySelector(`[data-form-route="${this.form.currentLocation}"][data-form-step="${this.step}"]`);
      if (!panel) return false;
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
      if (this.routeStep) {
        this.$refs.applicantForm.querySelector('[data-location-step] input[name="currentLocation"]')?.focus({ preventScroll: true });
        return;
      }
      this.$refs.applicantForm.querySelector(`[data-form-route="${this.form.currentLocation}"][data-form-step="${this.step}"] h2`)?.focus({ preventScroll: true });
    },
    nextStep() {
      if (!this.validateStep()) return;
      this.status = '';
      if (this.routeStep) {
        this.routeStep = false;
        this.step = 0;
        this.$nextTick(() => this.focusStepHeading());
        return;
      }
      this.step = Math.min(this.step + 1, this.steps.length - 1);
      this.$nextTick(() => this.focusStepHeading());
    },
    previousStep() {
      this.status = '';
      if (this.step === 0) {
        this.routeStep = true;
        this.$nextTick(() => this.focusStepHeading());
        return;
      }
      this.step = Math.max(this.step - 1, 0);
      this.$nextTick(() => this.focusStepHeading());
    },
    async submit() {
      if (this.submitting || this.routeStep || this.step !== this.steps.length - 1) return;
      this.status = '';
      if (!this.validateStep()) return;
      if (this.form.website) return;
      const config = window.NIPPON_ACE_CONFIG || {};
      if (!config.apiUrl) {
        this.statusType = 'error';
        this.status = 'Alamat API pendaftaran belum dikonfigurasi.';
        return;
      }

      this.submitting = true;
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), config.requestTimeout || 120000);

      try {
        const response = await fetch(config.apiUrl, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(this.$refs.applicantForm),
          signal: controller.signal
        });
        const payload = await response.json();
        if (!response.ok) {
          const validationMessage = payload.errors
            ? Object.values(payload.errors).flat()[0]
            : payload.msg || payload.message;
          throw new Error(validationMessage || 'Pendaftaran gagal dikirim.');
        }
        this.statusType = 'success';
        this.status = payload.msg || 'Pendaftaran berhasil dikirim!';
      } catch (error) {
        this.statusType = 'error';
        this.status = error.name === 'AbortError'
          ? 'Waktu unggah habis. Periksa koneksi dan coba kembali.'
          : error.message || 'Pendaftaran gagal dikirim. Silakan coba lagi.';
      } finally {
        window.clearTimeout(timeout);
        this.submitting = false;
      }
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
