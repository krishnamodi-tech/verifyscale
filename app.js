/**
 * VerifyScale - SIH 2026 (Problem Statement SIH26036)
 * Team: NEXUS NOVA
 * Core Application Engine & Interactive Simulation
 */

// ==========================================
// 1. SOUND SYNTHESIZER (Web Audio API)
// ==========================================
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  play(type) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    switch (type) {
      case 'click': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }
      case 'weigh': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }
      case 'scan': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
        break;
      }
      case 'success': {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.12, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.18);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.18);
        });
        break;
      }
      case 'alert': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(260, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      }
    }
  }
}

const sfx = new SoundFX();

// ==========================================
// 2. CRYPTOGRAPHIC SHA-256 HELPER
// ==========================================
async function generateSHA256(message) {
  try {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    // Fallback pseudo-hash if crypto is restricted
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      hash = ((hash << 5) - hash) + message.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, 'a9b2c3d4e5f60718');
  }
}

// ==========================================
// 3. STANDALONE SVG QR CODE GENERATOR
// ==========================================
// Generates clean, crisp, deterministic SVG QR matrix representations
function renderQRCodeSVG(text, size = 160) {
  // Simple deterministic 21x21 QR Version 1 pseudo-encoder with standard finder patterns
  const modules = 25;
  const grid = Array(modules).fill(null).map(() => Array(modules).fill(false));

  // Draw 7x7 Finder Pattern at (r, c)
  function drawFinder(r, c) {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          grid[r + i][c + j] = true;
        } else {
          grid[r + i][c + j] = false;
        }
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, modules - 7);
  drawFinder(modules - 7, 0);

  // Timing lines
  for (let i = 8; i < modules - 8; i++) {
    grid[6][i] = (i % 2 === 0);
    grid[i][6] = (i % 2 === 0);
  }

  // Hash input text to create pseudo-random data modules
  let seed = 0;
  for (let i = 0; i < text.length; i++) {
    seed = (seed * 31 + text.charCodeAt(i)) & 0xFFFFFFFF;
  }

  function pseudoRand() {
    seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (seed >>> 16) / 65536;
  }

  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      // Avoid finder patterns
      const inTopLeft = (r < 8 && c < 8);
      const inTopRight = (r < 8 && c >= modules - 8);
      const inBottomLeft = (r >= modules - 8 && c < 8);
      const isTiming = (r === 6 || c === 6);
      if (!inTopLeft && !inTopRight && !inBottomLeft && !isTiming) {
        grid[r][c] = pseudoRand() > 0.45;
      }
    }
  }

  // Build SVG string
  const cellSize = (size / modules).toFixed(2);
  let svgPaths = '';
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (grid[r][c]) {
        svgPaths += `<rect x="${(c * cellSize)}" y="${(r * cellSize)}" width="${cellSize}" height="${cellSize}" fill="#38bdf8" rx="1.5" />`;
      }
    }
  }

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size}" xmlns="http://www.w3.org/2000/svg" class="qr-svg">
      <rect width="100%" height="100%" fill="#05141b" rx="8" />
      ${svgPaths}
    </svg>
  `;
}

// ==========================================
// 4. MOCK DATABASE & STATE
// ==========================================
const DB = {
  scales: [
    {
      id: 'VS-2026-DL-8492',
      businessName: 'Sharma Provisions & Superstore',
      owner: 'Ramesh Sharma',
      location: 'Chandni Chowk, Central Delhi',
      makeModel: 'Essae DX-851 High Precision',
      category: 'Commercial Retail Scale',
      scaleClass: 'Class III (Medium Accuracy)',
      serialNumber: 'SN-ES851-9941',
      maxCapacity: '30.000 kg',
      division: '0.005 kg (5g)',
      status: 'VERIFIED',
      verifiedDate: '2026-03-01',
      expiryDate: '2027-03-01',
      inspector: 'Insp. Vikram Rathore (ID: DL-LM-440)',
      tamperScore: '0.0% (Zero Tamper)',
      hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
    },
    {
      id: 'VS-2026-MH-3310',
      businessName: 'Vashi Wholesale APMC Grain Hub',
      owner: 'Kailash Patil',
      location: 'Navi Mumbai, Sector 19',
      makeModel: 'Avery Weigh-Tronix Pro Platform',
      category: 'Industrial Weighbridge Scale',
      scaleClass: 'Class III',
      serialNumber: 'SN-AVTRX-1082',
      maxCapacity: '500.00 kg',
      division: '0.050 kg (50g)',
      status: 'VERIFIED',
      verifiedDate: '2026-02-14',
      expiryDate: '2027-02-14',
      inspector: 'Insp. Sunita Kadam (ID: MH-LM-219)',
      tamperScore: '0.0% (Zero Tamper)',
      hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
    },
    {
      id: 'VS-2026-KA-1129',
      businessName: 'Bengaluru Gold & Gems Jewellers',
      owner: 'Venkatesh Rao',
      location: 'Commercial Street, Bengaluru',
      makeModel: 'Mettler Toledo Precision Balance',
      category: 'Jewellery Micro Balance',
      scaleClass: 'Class II (High Accuracy)',
      serialNumber: 'SN-MTB-5520',
      maxCapacity: '6.0000 kg',
      division: '0.0001 kg (0.1g)',
      status: 'VERIFIED',
      verifiedDate: '2026-01-20',
      expiryDate: '2027-01-20',
      inspector: 'Insp. Anil Kumar (ID: KA-LM-883)',
      tamperScore: '0.0% (Zero Tamper)',
      hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'
    }
  ],
  inspections: [
    { id: 'INS-901', shop: 'Royal Sweets & Confectionery', distance: '1.2 km', priority: 'High', status: 'Pending Test' },
    { id: 'INS-902', shop: 'Balaji Agro Commodities', distance: '3.8 km', priority: 'Medium', status: 'In Transit' },
    { id: 'INS-903', shop: 'Modern Fuel Station (Dispenser #3)', distance: '5.1 km', priority: 'Scheduled', status: 'Pending' }
  ],
  auditLogs: [
    { time: '15:10:22', event: 'Verification Stamp Cryptographically Signed', uid: 'VS-2026-DL-8492', hash: '9f86d...0a08' },
    { time: '14:45:09', event: 'Online Razorpay Verification Fee Received', uid: 'VS-2026-UP-7104', hash: 'a12bc...894f' },
    { time: '14:12:33', event: 'NIST Repeatability Test Passed: Zero Error', uid: 'VS-2026-MH-3310', hash: '5e884...42d8' },
    { time: '13:30:15', event: 'Automated 30-Day Renewal Notice Dispatched', uid: 'VS-2025-TN-9901', hash: '7c4a1...fe22' }
  ]
};

// ==========================================
// 5. SCALE CALIBRATION SIMULATOR
// ==========================================
class ScaleSimulator {
  constructor() {
    this.appliedWeights = []; // weights placed on pan
    this.tare = 0.000;
    this.activeQuadrant = 'CENTER';
    this.flutterInterval = null;
    this.division = 0.005; // 5g division
    this.isSettled = true;
    
    this.dom = {
      lcd: document.getElementById('lcdValue'),
      pan: document.getElementById('scalePan'),
      panWeightsList: document.getElementById('panWeightsList'),
      weightChips: document.querySelectorAll('.weight-item'),
      quadrants: document.querySelectorAll('.quadrant-zone'),
      indicatorTare: document.getElementById('indicatorTare'),
      indicatorZero: document.getElementById('indicatorZero'),
      indicatorStable: document.getElementById('indicatorStable')
    };

    this.initEvents();
    this.updateDisplay(0);
  }

  initEvents() {
    // Clickable test weights
    this.dom.weightChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const weightValue = parseFloat(chip.dataset.weight);
        this.toggleWeight(weightValue, chip);
      });
    });

    // Quadrant click for eccentric testing
    this.dom.quadrants.forEach(q => {
      q.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setQuadrant(q.dataset.quadrant);
      });
    });

    // Tare button
    const tareBtn = document.getElementById('btnTareScale');
    if (tareBtn) {
      tareBtn.addEventListener('click', () => this.zeroTare());
    }

    // Reset button
    const resetBtn = document.getElementById('btnResetScale');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetWeights());
    }

    // Calibrate / Test Verdict button
    const testBtn = document.getElementById('btnRunToleranceCheck');
    if (testBtn) {
      testBtn.addEventListener('click', () => this.runNISTCheck());
    }
  }

  toggleWeight(val, element) {
    sfx.play('weigh');
    const existingIndex = this.appliedWeights.indexOf(val);

    if (existingIndex > -1) {
      this.appliedWeights.splice(existingIndex, 1);
      element.classList.remove('on-pan');
    } else {
      this.appliedWeights.push(val);
      element.classList.add('on-pan');
    }

    this.recalculateLoad();
  }

  setQuadrant(quadName) {
    sfx.play('click');
    this.activeQuadrant = quadName;
    this.dom.quadrants.forEach(q => {
      q.classList.toggle('active', q.dataset.quadrant === quadName);
    });
    this.recalculateLoad();
  }

  zeroTare() {
    sfx.play('click');
    const rawTotal = this.appliedWeights.reduce((a, b) => a + b, 0);
    this.tare = rawTotal;
    this.dom.indicatorTare.classList.add('active');
    this.recalculateLoad();
    showToast('Scale Zero-Tared to 0.000 kg');
  }

  resetWeights() {
    sfx.play('click');
    this.appliedWeights = [];
    this.tare = 0.000;
    this.activeQuadrant = 'CENTER';
    this.dom.weightChips.forEach(c => c.classList.remove('on-pan'));
    this.dom.quadrants.forEach(q => q.classList.remove('active'));
    this.dom.indicatorTare.classList.remove('active');
    this.recalculateLoad();
    showToast('Scale cleared to baseline');
  }

  recalculateLoad() {
    const rawTotal = this.appliedWeights.reduce((a, b) => a + b, 0);
    
    // Eccentric loading slight mechanical variation simulator (NIST Handbook 44)
    let eccentricVariance = 0;
    if (this.activeQuadrant !== 'CENTER' && rawTotal > 0) {
      eccentricVariance = 0.002; // 2g eccentric displacement
    }

    let netWeight = Math.max(0, rawTotal - this.tare + eccentricVariance);

    // Visual pan loaded state
    if (rawTotal > 0) {
      this.dom.pan.classList.add('has-load');
    } else {
      this.dom.pan.classList.remove('has-load');
    }

    // Simulate authentic digital sensor settling jitter
    this.simulateFlutter(netWeight);
  }

  simulateFlutter(targetWeight) {
    if (this.flutterInterval) clearInterval(this.flutterInterval);

    this.isSettled = false;
    this.dom.indicatorStable.classList.remove('active');

    let ticks = 0;
    this.flutterInterval = setInterval(() => {
      ticks++;
      if (ticks < 4) {
        const jitter = (Math.random() * 0.008 - 0.004);
        this.updateDisplay(Math.max(0, targetWeight + jitter));
      } else {
        clearInterval(this.flutterInterval);
        this.flutterInterval = null;
        this.isSettled = true;
        this.updateDisplay(targetWeight);
        this.dom.indicatorStable.classList.add('active');
        if (targetWeight === 0) {
          this.dom.indicatorZero.classList.add('active');
        } else {
          this.dom.indicatorZero.classList.remove('active');
        }
      }
    }, 60);
  }

  updateDisplay(val) {
    if (this.dom.lcd) {
      this.dom.lcd.textContent = val.toFixed(3);
    }
  }

  runNISTCheck() {
    sfx.play('click');
    const nominal = this.appliedWeights.reduce((a, b) => a + b, 0);

    if (nominal === 0) {
      showToast('⚠️ Please place calibrated test weights on the scale pan first', 'warning');
      return;
    }

    const currentReading = parseFloat(this.dom.lcd.textContent);
    const errorGrams = Math.abs((currentReading - nominal) * 1000);
    const maxPermissibleError = 5.0; // 5 grams MPE limit for Class III

    const isPass = errorGrams <= maxPermissibleError;

    const resultBox = document.getElementById('nistResultBox');
    if (resultBox) {
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <div style="background: ${isPass ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)'}; border: 1px solid ${isPass ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}; border-radius: 1rem; padding: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h4 style="font-weight: 700; color: ${isPass ? '#10b981' : '#ef4444'}; display: flex; align-items: center; gap: 0.5rem;">
              <span>${isPass ? '✓ NIST & OIML TOLERANCE PASSED' : '✕ CALIBRATION OUT OF TOLERANCE'}</span>
            </h4>
            <span class="badge-status ${isPass ? 'badge-verified' : 'badge-flagged'}">
              ${isPass ? 'COMPLIANT' : 'DEFECTIVE'}
            </span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; font-family: var(--font-mono); font-size: 0.85rem;">
            <div>
              <span style="color: var(--text-muted); display: block; font-size: 0.7rem;">NOMINAL WEIGHT</span>
              <strong>${nominal.toFixed(3)} kg</strong>
            </div>
            <div>
              <span style="color: var(--text-muted); display: block; font-size: 0.7rem;">OBSERVED DEVIATION</span>
              <strong style="color: ${isPass ? '#38bdf8' : '#ef4444'}">${errorGrams.toFixed(1)} g</strong>
            </div>
            <div>
              <span style="color: var(--text-muted); display: block; font-size: 0.7rem;">MAX ALLOWED (MPE)</span>
              <strong>±${maxPermissibleError} g</strong>
            </div>
          </div>
          <div style="margin-top: 1rem; display: flex; gap: 0.75rem; justify-content: flex-end;">
            <button class="btn btn-primary btn-sm" onclick="app.issueDigitalCertificate('${nominal.toFixed(3)}')">
              Issue Official Digital Certificate →
            </button>
          </div>
        </div>
      `;
    }

    if (isPass) {
      sfx.play('success');
      showToast('NIST Calibration Verification Passed successfully!');
    } else {
      sfx.play('alert');
      showToast('Scale error exceeds Legal Metrology tolerance!', 'warning');
    }
  }
}

// ==========================================
// 6. MAIN APPLICATION CONTROLLER
// ==========================================
class VerifyScaleApp {
  constructor() {
    this.currentView = 'merchant';
    this.simulator = null;
    this.init();
  }

  init() {
    // Switch views via tab buttons
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const view = tab.dataset.view;
        this.switchView(view);
      });
    });

    // Sound toggle button
    const soundBtn = document.getElementById('soundToggleBtn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isEnabled = sfx.toggle();
        soundBtn.classList.toggle('active', isEnabled);
        soundBtn.title = isEnabled ? 'Sound FX Enabled' : 'Sound FX Muted';
        showToast(isEnabled ? 'Sound effects enabled' : 'Sound effects muted');
      });
    }

    // Initialize scale simulator
    this.simulator = new ScaleSimulator();

    // Render initial certificate
    this.renderCertificate(DB.scales[0]);

    // Render Public Search results
    this.initSearch();

    // Render 3D Hologram Tilt Effect
    this.initHologram3DTilt();

    // Render District Compliance Table
    this.renderDistrictTable();

    // Render Live Audit Log stream
    this.renderAuditLogs();
    this.runSplashIntro();

    // Auto-update live clock
    this.startClock();
  }

  startClock() {
    const clockEl = document.getElementById('liveClock');
    const update = () => {
      const now = new Date();
      if (clockEl) {
        clockEl.textContent = now.toTimeString().split(' ')[0] + ' IST';
      }
    };
    update();
    setInterval(update, 1000);
  }

  switchView(viewName) {
    sfx.play('click');
    this.currentView = viewName;

    // Update tab styles
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Update section visibility
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Razorpay Checkout Modal Simulation
  openPaymentModal(appName, fee) {
    sfx.play('click');
    const modal = document.getElementById('paymentModal');
    const amountEl = document.getElementById('payAmount');
    const titleEl = document.getElementById('payTitle');

    if (amountEl) amountEl.textContent = `₹${fee}`;
    if (titleEl) titleEl.textContent = `Legal Metrology Verification: ${appName}`;
    if (modal) modal.classList.add('active');
  }

  closePaymentModal() {
    sfx.play('click');
    const modal = document.getElementById('paymentModal');
    if (modal) modal.classList.remove('active');
  }

  processPayment(methodName) {
    sfx.play('click');
    const body = document.querySelector('.rzp-body');
    const originalContent = body.innerHTML;

    body.innerHTML = `
      <div style="text-align: center; padding: 2.5rem 1rem;">
        <div class="pulse-dot" style="width: 24px; height: 24px; margin: 0 auto 1.5rem; background: #3b82f6;"></div>
        <h4 style="font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;">Connecting to Banking Gateway...</h4>
        <p style="font-size: 0.85rem; color: #64748b;">Securing transaction via ${methodName}</p>
      </div>
    `;

    setTimeout(() => {
      sfx.play('success');
      body.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem;">
          <div style="width: 50px; height: 50px; border-radius: 50%; background: #10b981; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; margin: 0 auto 1rem; box-shadow: 0 0 20px rgba(16,185,129,0.5);">
            ✓
          </div>
          <h4 style="font-weight: 800; color: #0f172a; font-size: 1.25rem;">Payment Successful!</h4>
          <p style="font-size: 0.85rem; color: #64748b; margin-top: 0.25rem;">Ref ID: pay_SIH26036_${Math.floor(100000 + Math.random() * 900000)}</p>
          <div style="background: #f1f5f9; padding: 0.75rem; border-radius: 0.5rem; margin: 1.25rem 0; font-family: var(--font-mono); font-size: 0.75rem;">
            ✓ Government Treasury Challan Generated<br>
            ✓ Geo-Inspection Automatically Queued
          </div>
          <button class="btn btn-primary btn-sm" style="width: 100%;" onclick="app.finishPaymentSuccess()">
            Proceed to Inspector Queue →
          </button>
        </div>
      `;
    }, 1400);
  }

  finishPaymentSuccess() {
    this.closePaymentModal();
    this.switchView('inspector');
    showToast('Application verified & routed to Field Inspector!');
  }

  // Dynamic Holographic 3D Tilt
  initHologram3DTilt() {
    const card = document.getElementById('hologramCertCard');
    if (!card) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotX = -(y / rect.height) * 16;
      const rotY = (x / rect.width) * 16;

      card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  }

  // Issue & Render Official Certificate
  async issueDigitalCertificate(testedCapacity) {
    sfx.play('success');
    const newUid = `VS-2026-DL-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];
    const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const rawPayload = `${newUid}|Sharma Provisions|SN-ES851-9941|${today}|${testedCapacity}kg|NIST_HANDBOOK_44_APPROVED`;
    const hash = await generateSHA256(rawPayload);

    const certData = {
      id: newUid,
      businessName: 'Sharma Provisions & Superstore',
      owner: 'Ramesh Sharma',
      location: 'Chandni Chowk, Central Delhi',
      makeModel: 'Essae DX-851 High Precision',
      category: 'Commercial Retail Scale',
      scaleClass: 'Class III (Medium Accuracy)',
      serialNumber: 'SN-ES851-9941',
      maxCapacity: `${testedCapacity} kg Tested`,
      division: '0.005 kg (5g)',
      status: 'VERIFIED',
      verifiedDate: today,
      expiryDate: expiry,
      inspector: 'Insp. Vikram Rathore (ID: DL-LM-440)',
      tamperScore: '0.0% (Zero Tamper)',
      hash: hash
    };

    DB.scales.unshift(certData);
    this.renderCertificate(certData);
    this.switchView('certificate');
    showToast(`Official Certificate ${newUid} issued with SHA-256 seal!`);
  }

  renderCertificate(scale) {
    const wrapper = document.getElementById('certificateContainer');
    if (!wrapper) return;

    const qrSvg = renderQRCodeSVG(`https://verifyscale.gov.in/verify?uid=${scale.id}&hash=${scale.hash}`, 140);

    wrapper.innerHTML = `
      <div class="cert-wrapper">
        <div class="cert-card" id="hologramCertCard">
          <div class="cert-watermark">LEGAL METROLOGY INDIA</div>
          
          <div class="cert-hologram-seal">
            <div class="cert-hologram-inner">
              <span style="font-size: 0.9rem;">⚖️</span>
              GOVT OF INDIA<br>
              <span style="color: #38bdf8; font-size: 0.5rem;">VERIFIED</span>
            </div>
          </div>

          <div class="cert-header">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="font-size: 2.5rem;">🇮🇳</div>
              <div>
                <p style="font-size: 0.75rem; letter-spacing: 0.1em; color: var(--accent-cyan); font-weight: 700; text-transform: uppercase;">
                  Ministry of Consumer Affairs, Food & Public Distribution
                </p>
                <h3 style="font-size: 1.45rem; font-weight: 800; color: #ffffff;">
                  Department of Legal Metrology • Verification Certificate
                </h3>
                <p style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono);">
                  Conforming to The Legal Metrology Act, 2009 & NIST Handbook 44 / OIML R76 Standards
                </p>
              </div>
            </div>
          </div>

          <div class="cert-grid">
            <div>
              <span class="cert-field-label">Certificate Unique ID</span>
              <div class="cert-field-value" style="color: var(--accent-emerald);">${scale.id}</div>
            </div>
            <div>
              <span class="cert-field-label">Verification Status</span>
              <div class="cert-field-value" style="color: var(--accent-emerald); display: flex; align-items: center; gap: 0.5rem;">
                <span class="pulse-dot"></span> VALID & CERTIFIED
              </div>
            </div>
            <div>
              <span class="cert-field-label">Registered Enterprise / Establishment</span>
              <div class="cert-field-value">${scale.businessName}</div>
              <p style="font-size: 0.8rem; color: var(--text-muted);">${scale.location}</p>
            </div>
            <div>
              <span class="cert-field-label">Instrument Make & Model</span>
              <div class="cert-field-value">${scale.makeModel}</div>
              <p style="font-size: 0.8rem; color: var(--text-muted);">S/N: ${scale.serialNumber} • ${scale.scaleClass}</p>
            </div>
            <div>
              <span class="cert-field-label">Maximum Capacity & Verification Scale Division (e)</span>
              <div class="cert-field-value">${scale.maxCapacity} | e = ${scale.division}</div>
            </div>
            <div>
              <span class="cert-field-label">Verification Authority & Inspector</span>
              <div class="cert-field-value">${scale.inspector}</div>
            </div>
            <div>
              <span class="cert-field-label">Date of Verification</span>
              <div class="cert-field-value">${scale.verifiedDate}</div>
            </div>
            <div>
              <span class="cert-field-label">Next Verification Due Date</span>
              <div class="cert-field-value" style="color: var(--accent-amber);">${scale.expiryDate}</div>
            </div>
          </div>

          <div style="display: flex; gap: 1.5rem; align-items: center; background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); border-radius: 1rem; padding: 1.25rem;">
            <div>
              ${qrSvg}
            </div>
            <div style="flex: 1;">
              <span class="cert-field-label">Dynamic Cryptographic Hash (SHA-256)</span>
              <div class="cert-hash-box" style="margin-top: 0.35rem;">
                <span style="font-size: 1.2rem;">🔒</span>
                <span>${scale.hash}</span>
              </div>
              <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">
                This certificate is tamper-proof. Any physical or electronic alteration recalculates an invalid checksum immediately flagged by the Central Legal Metrology registry.
              </p>
            </div>
          </div>

          <div style="margin-top: 2rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 1.25rem;">
            <div style="display: flex; gap: 0.5rem;" class="no-print">
              <button class="btn btn-primary btn-sm" onclick="window.print()">
                🖨️ Print / Save Official PDF
              </button>
              <button class="btn btn-secondary btn-sm" onclick="app.downloadCertificateData('${scale.id}')">
                📥 Export Cryptographic Ledger (.json)
              </button>
            </div>
            <div style="text-align: right;">
              <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">
                Digitally Sealed & Stamped via e-Metrology PKI
              </span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.initHologram3DTilt();
  }

  downloadCertificateData(uid) {
    sfx.play('click');
    const scale = DB.scales.find(s => s.id === uid) || DB.scales[0];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scale, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `VerifyScale_Certificate_${uid}.json`);
    dlAnchor.click();
    showToast(`Certificate ledger downloaded for ${uid}`);
  }

  // Public Search & Scanner Module
  initSearch() {
    const searchInput = document.getElementById('searchScaleInput');
    const searchBtn = document.getElementById('btnSearchScale');

    const doSearch = () => {
      sfx.play('click');
      const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
      const resultsContainer = document.getElementById('publicSearchResults');
      if (!resultsContainer) return;

      if (!query) {
        showToast('Enter a Scale UID or Shop Name to search', 'warning');
        return;
      }

      const match = DB.scales.find(s => 
        s.id.toLowerCase().includes(query) || 
        s.businessName.toLowerCase().includes(query) ||
        s.serialNumber.toLowerCase().includes(query)
      );

      if (match) {
        sfx.play('success');
        resultsContainer.innerHTML = `
          <div class="glass-card highlight" style="margin-top: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
              <div>
                <span class="badge-status badge-verified">✓ GENUINE & ACCREDITED SCALE</span>
                <h3 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin-top: 0.5rem;">
                  ${match.businessName}
                </h3>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">
                  📍 ${match.location} • Scale UID: <code style="color: var(--accent-cyan);">${match.id}</code>
                </p>
              </div>
              <button class="btn btn-primary btn-sm" onclick="app.viewFullCert('${match.id}')">
                Inspect Full Certificate →
              </button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-top: 1.25rem; font-size: 0.85rem; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
              <div>
                <span style="color: var(--text-muted); font-size: 0.75rem;">INSTRUMENT</span>
                <p style="font-weight: 600; color: #ffffff;">${match.makeModel}</p>
              </div>
              <div>
                <span style="color: var(--text-muted); font-size: 0.75rem;">CAPACITY / DIVISION</span>
                <p style="font-weight: 600; color: #ffffff;">${match.maxCapacity} (e = ${match.division})</p>
              </div>
              <div>
                <span style="color: var(--text-muted); font-size: 0.75rem;">VERIFIED DATE</span>
                <p style="font-weight: 600; color: #10b981;">${match.verifiedDate}</p>
              </div>
              <div>
                <span style="color: var(--text-muted); font-size: 0.75rem;">NEXT CALIBRATION DUE</span>
                <p style="font-weight: 600; color: var(--accent-amber);">${match.expiryDate}</p>
              </div>
            </div>
          </div>
        `;
      } else {
        sfx.play('alert');
        resultsContainer.innerHTML = `
          <div class="glass-card" style="margin-top: 1.5rem; border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.05);">
            <div style="display: flex; gap: 1rem; align-items: center;">
              <span style="font-size: 2rem;">⚠️</span>
              <div>
                <h4 style="font-weight: 700; color: #f87171;">Instrument Record Not Found or Unregistered!</h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">
                  No active Legal Metrology certificate matches UID: "<strong>${query}</strong>". This scale may be uncalibrated or fraudulent.
                </p>
              </div>
            </div>
            <div style="margin-top: 1rem; display: flex; justify-content: flex-end;">
              <button class="btn btn-danger btn-sm" onclick="app.openWhistleblowerModal('${query}')">
                🚨 File Consumer Fraud Report
              </button>
            </div>
          </div>
        `;
      }
    };

    if (searchBtn) searchBtn.addEventListener('click', doSearch);
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') doSearch();
      });
    }

    // Simulated QR Code Scanner buttons
    const simulateScanBtns = document.querySelectorAll('.simulate-qr-chip');
    simulateScanBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.play('scan');
        const uid = btn.dataset.uid;
        if (searchInput) searchInput.value = uid;
        showToast(`Simulating QR Code detection: ${uid}`);
        setTimeout(() => doSearch(), 400);
      });
    });
  }

  viewFullCert(uid) {
    const scale = DB.scales.find(s => s.id === uid) || DB.scales[0];
    this.renderCertificate(scale);
    this.switchView('certificate');
  }

  // Consumer Grievance Whistleblower Modal
  openWhistleblowerModal(prefilledUid = '') {
    sfx.play('click');
    const modal = document.getElementById('whistleblowerModal');
    const input = document.getElementById('reportScaleUid');
    if (input && prefilledUid) input.value = prefilledUid;
    if (modal) modal.classList.add('active');
  }

  closeWhistleblowerModal() {
    sfx.play('click');
    const modal = document.getElementById('whistleblowerModal');
    if (modal) modal.classList.remove('active');
  }

  submitWhistleblowerReport() {
    sfx.play('success');
    const ticketId = `GRV-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    this.closeWhistleblowerModal();
    showToast(`Whistleblower Complaint filed! Ticket: ${ticketId}`);
  }

  // AI Vision Scanner Simulation Modal
  openAIVisionModal() {
    sfx.play('click');
    const modal = document.getElementById('aiVisionModal');
    if (modal) modal.classList.add('active');

    const statusEl = document.getElementById('aiScanStatus');
    const resultsEl = document.getElementById('aiScanResults');

    if (statusEl) {
      statusEl.innerHTML = `
        <span class="pulse-dot"></span> AI Vision Pipeline Running: Segmenting 7-Segment LCD & Anti-Tamper Wire Seal...
      `;
    }
    if (resultsEl) resultsEl.innerHTML = '';

    setTimeout(() => {
      sfx.play('success');
      if (statusEl) statusEl.innerHTML = '✓ AI Visual Inspection Complete (Confidence: 99.4%)';
      if (resultsEl) {
        resultsEl.innerHTML = `
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 0.75rem; padding: 1rem; margin-top: 1rem; font-size: 0.85rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <strong>Optical Character Recognition (OCR):</strong>
              <span style="color: #38bdf8; font-family: var(--font-mono);">Readout: 10.000 kg</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <strong>Physical Lead/Wire Seal:</strong>
              <span style="color: #10b981; font-weight: 700;">INTACT (No tool marks)</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <strong>Model Plate Hologram Verification:</strong>
              <span style="color: #10b981; font-weight: 700;">AUTHENTIC ESSAE STAMP</span>
            </div>
          </div>
        `;
      }
    }, 1800);
  }

  closeAIVisionModal() {
    sfx.play('click');
    const modal = document.getElementById('aiVisionModal');
    if (modal) modal.classList.remove('active');
  }

  // District Table in Admin
  renderDistrictTable() {
    const tableBody = document.getElementById('districtComplianceBody');
    if (!tableBody) return;

    const data = [
      { district: 'Delhi Central (Old Market)', registered: 2840, verified: 2795, compliance: '98.4%', status: 'Normal' },
      { district: 'Mumbai APMC Wholesale Hub', registered: 4120, verified: 3980, compliance: '96.6%', status: 'Normal' },
      { district: 'Bengaluru Tech Corridor & Retail', registered: 3190, verified: 3110, compliance: '97.5%', status: 'Normal' },
      { district: 'Chennai Port & Grain Mandi', registered: 1950, verified: 1720, compliance: '88.2%', status: 'Audit Due' },
      { district: 'Kolkata Burrabazar Commercial', registered: 2640, verified: 2310, compliance: '87.5%', status: 'Audit Due' }
    ];

    tableBody.innerHTML = data.map(d => `
      <tr>
        <td style="font-weight: 600; color: #ffffff;">${d.district}</td>
        <td style="font-family: var(--font-mono);">${d.registered.toLocaleString()}</td>
        <td style="font-family: var(--font-mono); color: var(--accent-emerald);">${d.verified.toLocaleString()}</td>
        <td style="font-family: var(--font-mono); font-weight: 700;">${d.compliance}</td>
        <td>
          <span class="badge-status ${d.status === 'Normal' ? 'badge-verified' : 'badge-pending'}">
            ${d.status}
          </span>
        </td>
      </tr>
    `).join('');
  }

  // Live Audit Logs
  renderAuditLogs() {
    const container = document.getElementById('auditLogStream');
    if (!container) return;

    container.innerHTML = DB.auditLogs.map(log => `
      <div style="display: flex; gap: 1rem; align-items: baseline; padding: 0.6rem 0; border-bottom: 1px solid var(--border-subtle); font-size: 0.825rem;">
        <span style="font-family: var(--font-mono); color: var(--text-muted);">${log.time}</span>
        <span style="color: var(--accent-cyan); font-family: var(--font-mono);">${log.uid}</span>
        <span style="flex: 1; color: var(--text-primary);">${log.event}</span>
        <span style="font-family: var(--font-mono); color: var(--accent-emerald); font-size: 0.75rem;">SHA256: ${log.hash}</span>
      </div>
    `).join('');
  }
  runSplashIntro() {
    const splash = document.getElementById('splashScreen');
    if (!splash) return;
    
    // Play sound if possible
    setTimeout(() => { sfx.play('startup'); }, 100);

    const bootText = document.getElementById('splashBootText');
    const progBar = document.getElementById('splashProgressBar');
    
    const steps = [
      { t: 300, p: 25, msg: '> Loading NIST Handbook 44 & OIML R76 Standards...' },
      { t: 1000, p: 60, msg: '> Synchronizing Legal Metrology Portal...' },
      { t: 1800, p: 90, msg: '> Verifying Cryptographic Security Ledger...' },
      { t: 2400, p: 100, msg: '> SYSTEM READY. Launching Merchant Portal...' }
    ];

    steps.forEach(step => {
      setTimeout(() => {
        if(bootText) bootText.innerText = step.msg;
        if(progBar) progBar.style.width = step.p + '%';
      }, step.t);
    });

    setTimeout(() => {
      this.dismissSplash();
    }, 2800);
  }


  // ==========================================
  // e-Mitra & Officer Assisted Registration + OTP
  // ==========================================
  setRegistrationMode(mode) {
    sfx.play('click');
    this.regMode = mode;
    
    document.querySelectorAll('.reg-mode-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.mode === mode);
    });

    // Update Big Mode Cards
    ['self', 'emitra', 'officer'].forEach(m => {
      const card = document.getElementById('modeCard-' + m);
      if (card) {
        const tag = card.querySelector('.mode-tag');
        if (m === mode) {
          card.style.background = m === 'self' ? 'rgba(16, 185, 129, 0.15)' : (m === 'emitra' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(245, 158, 11, 0.15)');
          card.style.borderColor = m === 'self' ? '#10b981' : (m === 'emitra' ? '#06b6d4' : '#f59e0b');
          card.style.boxShadow = '0 0 20px ' + (m === 'self' ? 'rgba(16, 185, 129, 0.3)' : (m === 'emitra' ? 'rgba(6, 182, 212, 0.3)' : 'rgba(245, 158, 11, 0.3)'));
          if (tag) {
            tag.textContent = 'CURRENT ACTIVE';
            tag.style.background = m === 'self' ? '#10b981' : (m === 'emitra' ? '#06b6d4' : '#f59e0b');
            tag.style.color = '#000000';
          }
        } else {
          card.style.background = 'rgba(255, 255, 255, 0.03)';
          card.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          card.style.boxShadow = 'none';
          if (tag) {
            tag.textContent = m === 'self' ? 'SELF SERVICE' : (m === 'emitra' ? 'ASSISTED KIOSK' : 'OFFICIAL SPOT CAMP');
            tag.style.background = 'rgba(255, 255, 255, 0.1)';
            tag.style.color = '#94a3b8';
          }
        }
      }
    });

    const banner = document.getElementById('operatorBanner');
    const roleTitle = document.getElementById('regRoleTitle');
    const roleDesc = document.getElementById('regRoleDesc');
    const operatorName = document.getElementById('operatorNameText');
    const submitBtn = document.getElementById('btnSubmitReg');
    const authNote = document.getElementById('authNoteText');

    if (mode === 'self') {
      if (banner) banner.style.display = 'none';
      if (roleTitle) roleTitle.textContent = 'Retailer / Business Direct Self-Registration';
      if (roleDesc) roleDesc.textContent = 'Register commercial weighing instruments with mobile OTP authentication.';
      if (submitBtn) submitBtn.innerHTML = '💳 Pay Government Verification Fee via Razorpay →';
      if (authNote) authNote.innerHTML = 'Self-Service Portal: Mobile OTP verification required for applicant identity.';
      showToast('Switched to Direct Retailer Self-Registration');
    } else if (mode === 'emitra') {
      if (banner) banner.style.display = 'flex';
      if (operatorName) operatorName.innerHTML = '<strong>e-Mitra / CSC Kiosk #RJ-4029</strong> • Operator: Rajesh Verma (Accredited Kiosk)';
      if (roleTitle) roleTitle.textContent = 'e-Mitra / CSC Kiosk Assisted Registration';
      if (roleDesc) roleDesc.textContent = 'Assisted registration for rural / non-tech retailers. Enter retailer phone & verify with Customer OTP Consent.';
      if (submitBtn) submitBtn.innerHTML = '🏛️ Submit Application via e-Mitra Kiosk Wallet / Receipt →';
      if (authNote) authNote.innerHTML = 'e-Mitra Kiosk Mode: Operator verified. Retailer mobile OTP required for consent.';
      showToast('e-Mitra Kiosk Operator Mode Activated');
    } else if (mode === 'officer') {
      if (banner) banner.style.display = 'flex';
      if (operatorName) operatorName.innerHTML = '<strong>Legal Metrology Department</strong> • Insp. Vikram Rathore (ID: DL-LM-440)';
      if (roleTitle) roleTitle.textContent = 'Legal Metrology Officer On-Site Spot Registration';
      if (roleDesc) roleDesc.textContent = 'Direct spot registration during Mandi inspection camp with instant retailer OTP consent.';
      if (submitBtn) submitBtn.innerHTML = '⚖️ Stamp & Generate Immediate On-Site Challan →';
      if (authNote) authNote.innerHTML = 'Officer Camp Mode: Official Legal Metrology spot-registration with merchant OTP sign-off.';
      showToast('Legal Metrology Officer Mode Activated');
    }
  }

  sendRegistrationOTP() {
    sfx.play('scan');
    const phoneInput = document.getElementById('retailerPhoneInput');
    const phone = phoneInput ? phoneInput.value.trim() : '+91 98290 12345';
    this.sentOtp = '482910';
    
    const otpPanel = document.getElementById('otpVerificationPanel');
    if (otpPanel) otpPanel.style.display = 'block';

    this.showSimulatedSMS(phone, this.sentOtp);
    showToast(`OTP 482910 sent to ${phone}`);
  }

  showSimulatedSMS(phone, otp) {
    const existing = document.getElementById('simulatedSmsCard');
    if (existing) existing.remove();

    const smsCard = document.createElement('div');
    smsCard.id = 'simulatedSmsCard';
    smsCard.className = 'sms-push-card';
    smsCard.innerHTML = `
      <div class="sms-icon-bubble">💬</div>
      <div style="flex: 1;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <strong style="color: #ffffff; font-size: 0.85rem;">Govt of India • e-Mitra / Metrology</strong>
          <span style="font-size: 0.7rem; color: #94a3b8; font-family: var(--font-mono);">Just now</span>
        </div>
        <p style="font-size: 0.8rem; color: #e2e8f0; margin-top: 0.25rem;">
          OTP for VerifyScale registration consent for mobile <strong>` + phone + `</strong> is <span style="color: #38bdf8; font-weight: 800; font-family: var(--font-mono); font-size: 0.95rem; letter-spacing: 0.05em;">` + otp + `</span>. Valid for 10 minutes.
        </p>
        <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
          <button onclick="app.autoFillOTP('` + otp + `')" class="btn btn-cyan btn-sm" style="padding: 0.2rem 0.6rem; font-size: 0.75rem;">
            Quick Fill: ` + otp + `
          </button>
          <button onclick="document.getElementById('simulatedSmsCard').remove()" class="btn btn-secondary btn-sm" style="padding: 0.2rem 0.6rem; font-size: 0.75rem;">
            Dismiss
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(smsCard);

    setTimeout(() => {
      const el = document.getElementById('simulatedSmsCard');
      if (el) el.remove();
    }, 9000);
  }

  autoFillOTP(otp) {
    sfx.play('click');
    const otpInput = document.getElementById('regOtpInput');
    if (otpInput) otpInput.value = otp;
    this.verifyRegistrationOTP();
  }

  verifyRegistrationOTP() {
    const otpInput = document.getElementById('regOtpInput');
    const entered = otpInput ? otpInput.value.trim() : '';

    if (entered === '482910' || entered === this.sentOtp) {
      sfx.play('success');
      this.otpVerified = true;
      const statusBox = document.getElementById('otpStatusBox');
      if (statusBox) {
        statusBox.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--accent-emerald); font-weight: 700; font-size: 0.85rem;">
            <span>✓</span> Mobile & Consent Authenticated (Aadhaar / e-Mitra e-KYC Verified)
          </div>
        `;
      }
      showToast('Retailer Mobile Consent Verified Successfully!');
    } else {
      sfx.play('alert');
      showToast('Invalid OTP! Please enter 482910 or check SMS banner.', 'warning');
    }
  }

  playVoiceAssistance() {
    sfx.play('beep');
    const msg = 'नमस्ते। ई मित्र या अधिकारी की सहायता से अपनी तराजू का सत्यापन करवाएं। अपना मोबाइल नंबर दर्ज करें और प्राप्त ओटीपी बताएं।';
    showToast('🔊 Audio Assistance: बोलकर निर्देश सुनें');
    
    // Always show alert so the judge/user can read it if the browser TTS is broken
    alert('🔊 [Audio Simulation playing...]\n\n"' + msg + '"');
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(msg);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }

  autoDetectLocation() {
    sfx.play('click');
    const locInput = document.getElementById('regLocationInput');
    if (locInput) {
      locInput.value = 'Shop #14, Main Sabzi Mandi, Chandni Chowk, Central Delhi (GPS: 28.6506° N, 77.2303° E)';
    }
    showToast('📍 Mandi GPS coordinates automatically detected!');
  }

  dismissSplash() {
    const splash = document.getElementById('splashScreen');
    if (splash && !splash.classList.contains('fade-out')) {
      splash.classList.add('fade-out');
      setTimeout(() => { splash.remove(); }, 700);
    }
  }
}

// Global Toast helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  const icon = type === 'warning' ? '⚠️' : '✨';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Initialize on DOM load
let app = null;
window.addEventListener('DOMContentLoaded', () => {
  app = new VerifyScaleApp();
});
