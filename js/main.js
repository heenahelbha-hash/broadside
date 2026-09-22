/**
 * BROADSIDE — Community Letterpress Print Shop
 * Interactive Press Mechanics, Web Audio Synthesis, Schedule Filtering & Swatch Inspector
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. WEB AUDIO MECHANICAL PRESS SOUND SYNTHESIZER
  // ==========================================================================
  let audioCtx = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Synthesize letterpress crank, roller sweep, and impression thud
  function playPressSound() {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;

    // 1. Ratchet / Crank Click (sharp impulse clicks)
    for (let i = 0; i < 3; i++) {
      const clickOsc = audioCtx.createOscillator();
      const clickGain = audioCtx.createGain();
      const clickTime = now + (i * 0.08);

      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(320 - (i * 40), clickTime);
      clickOsc.frequency.exponentialRampToValueAtTime(40, clickTime + 0.03);

      clickGain.gain.setValueAtTime(0.3, clickTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.03);

      clickOsc.connect(clickGain);
      clickGain.connect(audioCtx.destination);

      clickOsc.start(clickTime);
      clickOsc.stop(clickTime + 0.04);
    }

    // 2. Brayer Roller Sweep (bandpass filtered noise for roller glide)
    const bufferSize = audioCtx.sampleRate * 0.9;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now + 0.25);
    filter.frequency.linearRampToValueAtTime(1100, now + 0.65);
    filter.frequency.linearRampToValueAtTime(450, now + 1.1);
    filter.Q.value = 3.0;

    const rollerGain = audioCtx.createGain();
    rollerGain.gain.setValueAtTime(0.001, now + 0.25);
    rollerGain.gain.linearRampToValueAtTime(0.22, now + 0.55);
    rollerGain.gain.linearRampToValueAtTime(0.18, now + 0.85);
    rollerGain.gain.exponentialRampToValueAtTime(0.001, now + 1.15);

    whiteNoise.connect(filter);
    filter.connect(rollerGain);
    rollerGain.connect(audioCtx.destination);

    whiteNoise.start(now + 0.25);
    whiteNoise.stop(now + 1.2);

    // 3. Cylinder Impression Bite Thud (low frequency punch)
    const thudOsc = audioCtx.createOscillator();
    const thudGain = audioCtx.createGain();
    const biteTime = now + 0.72;

    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(110, biteTime);
    thudOsc.frequency.exponentialRampToValueAtTime(32, biteTime + 0.18);

    thudGain.gain.setValueAtTime(0.45, biteTime);
    thudGain.gain.exponentialRampToValueAtTime(0.001, biteTime + 0.22);

    thudOsc.connect(thudGain);
    thudGain.connect(audioCtx.destination);

    thudOsc.start(biteTime);
    thudOsc.stop(biteTime + 0.25);
  }

  // Audio Toggle Button
  const soundToggleBtn = document.getElementById('sound-toggle');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        initAudio();
        soundToggleBtn.classList.add('active');
        soundToggleBtn.setAttribute('aria-pressed', 'true');
        soundToggleBtn.innerHTML = '<span class="sound-state">&#128266; SOUND ON</span>';
      } else {
        soundToggleBtn.classList.remove('active');
        soundToggleBtn.setAttribute('aria-pressed', 'false');
        soundToggleBtn.innerHTML = '<span class="sound-state">&#128263; SOUND OFF</span>';
      }
    });
  }

  // ==========================================================================
  // 2. INTERACTIVE "PULL A PROOF" LETTERPRESS ENGINE
  // ==========================================================================
  let proofCount = 1;
  let currentInkColor = '#1B1810';
  let currentInkName = 'Carbon Lampblack';
  let currentStockName = "Crane's Lettra 300g";
  let currentBiteDepth = 'Heavy (0.34mm)';

  const pullBtn = document.getElementById('pull-proof-btn');
  const cylinderCarriage = document.getElementById('cylinder-carriage');
  const printedImpression = document.getElementById('printed-impression');
  const proofPaper = document.getElementById('proof-paper');
  const proofIdStamp = document.getElementById('proof-id-stamp');
  const proofInkNameElem = document.getElementById('proof-ink-name');
  const proofStockNameElem = document.getElementById('proof-stock-name');
  const proofBiteDepthElem = document.getElementById('proof-bite-depth');
  const proofWord1 = document.querySelector('.proof-word-1');
  const proofWord2 = document.querySelector('.proof-word-2');

  // Inspector card elements
  const proofCounterBadge = document.getElementById('proof-counter');
  const cardTicketNum = document.getElementById('card-ticket-num');
  const cardStatusTitle = document.getElementById('card-status-title');
  const cardNoteBody = document.getElementById('card-note-body');
  const specReg = document.getElementById('spec-reg');
  const specTack = document.getElementById('spec-tack');
  const specBite = document.getElementById('spec-bite');
  const proofLogList = document.getElementById('proof-log-list');
  const clearLogBtn = document.getElementById('clear-log-btn');

  // Authentic letterpress proof notes bank
  const proofInspectionNotes = [
    {
      title: "CLEAN BITE & SOLID RELIEF",
      note: "Crisp impression into 100% cotton fibers. Uniform ink distribution across 14-line Hamilton Gothic. Wood grain texture visible on left vertical stroke of 'H'. Approved for edition.",
      reg: "± 0.2 pt",
      tack: "14.2 (Optimal)",
      bite: "0.34mm (Deep Deboss)"
    },
    {
      title: "SLIGHT INK JITTER & VELVET TOOTH",
      note: "Hand-crank pull shows minor 0.4pt shift on lower baseline. Rich saturated kiss with faint micro-halo around serifs — classic letterpress pedigree.",
      reg: "+ 0.4 pt (Baseline)",
      tack: "15.1 (High)",
      bite: "0.38mm (Firm Bite)"
    },
    {
      title: "CRISP WOOD-TYPE TRANSFER",
      note: "Tympan packing leveled perfectly. The end-grain rock maple letterforms took oil pigment smoothly; zero slur on release. Paper deckle undisturbed.",
      reg: "± 0.1 pt (Dead True)",
      tack: "13.8 (Smooth)",
      bite: "0.28mm (Crisp Relief)"
    },
    {
      title: "GHOST IMPRESSION MAKEREADY",
      note: "Dry roll kiss pull. Translucent veil reveals lead quoin pressure lines and paper grain. Beautiful diagnostic proof for apprentice study.",
      reg: "- 0.3 pt (Shoulder)",
      tack: "12.4 (Light)",
      bite: "0.19mm (Kiss)"
    },
    {
      title: "HEAVY PUNCH & DEEP FIBER TOOTH",
      note: "Increased cylinder packing by one sheet of 80lb tympan manila. Deep three-dimensional deboss felt on reverse side. Superb ink coverage.",
      reg: "± 0.2 pt",
      tack: "16.0 (Heavy Body)",
      bite: "0.44mm (Heavy Punch)"
    }
  ];

  // Ink Swatch Picker Buttons
  const swatchButtons = document.querySelectorAll('.swatch-pick-btn');
  swatchButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      swatchButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentInkColor = btn.getAttribute('data-color');
      currentInkName = btn.getAttribute('data-name');
      
      // Update proof sheet ink display immediately
      proofWord1.style.color = currentInkColor;
      proofWord2.style.color = currentInkColor;
      proofInkNameElem.textContent = currentInkName;
    });
  });

  // Paper Stock Selector
  const paperSelect = document.getElementById('paper-select');
  if (paperSelect) {
    paperSelect.addEventListener('change', (e) => {
      const selectedOption = e.target.options[e.target.selectedIndex];
      currentStockName = selectedOption.text;
      currentBiteDepth = selectedOption.getAttribute('data-bite') || 'Medium (0.24mm)';
      proofStockNameElem.textContent = currentStockName;
      proofBiteDepthElem.textContent = currentBiteDepth;
    });
  }

  // Pull a Proof Button Click
  if (pullBtn) {
    pullBtn.addEventListener('click', () => {
      if (pullBtn.classList.contains('is-cranking')) return;

      // Audio & cranking state
      initAudio();
      pullBtn.classList.add('is-cranking');
      playPressSound();

      // Trigger cylinder roll animation
      cylinderCarriage.classList.remove('rolling');
      void cylinderCarriage.offsetWidth; // Force reflow
      cylinderCarriage.classList.add('rolling');

      // Midway through the roll (when cylinder hits the paper)
      setTimeout(() => {
        proofCount++;

        // Random microscopic registration offset (-1.2px to +1.2px)
        const jitterX = ((Math.random() * 2.4) - 1.2).toFixed(2);
        const jitterY = ((Math.random() * 1.8) - 0.9).toFixed(2);
        const rotationJitter = ((Math.random() * 0.4) - 0.2).toFixed(2);

        // Apply physical letterpress offset & deboss text shadow
        printedImpression.style.transform = `translate(${jitterX}px, ${jitterY}px) rotate(${rotationJitter}deg)`;
        
        // Randomize ink transfer opacity slightly (92% - 100%)
        const inkDensity = (0.92 + Math.random() * 0.08).toFixed(2);
        proofWord1.style.opacity = inkDensity;
        proofWord2.style.opacity = inkDensity;
        
        // Dynamic letterpress deboss text shadow based on current ink
        printedImpression.style.textShadow = `
          0 1px 1px rgba(255,255,255,0.4),
          0 -1px 1px rgba(0,0,0,0.35)
        `;

        // Update Sheet Metadata
        const formattedId = String(proofCount).padStart(3, '0');
        proofIdStamp.textContent = `PROOF #${formattedId} • HAND-PULLED SPECIMEN`;
        proofInkNameElem.textContent = currentInkName;
        proofStockNameElem.textContent = currentStockName;
        proofBiteDepthElem.textContent = currentBiteDepth;

        // Select an authentic inspection note
        const noteIndex = (proofCount - 1) % proofInspectionNotes.length;
        const currentNote = proofInspectionNotes[noteIndex];

        // Update Live Proof Card
        proofCounterBadge.textContent = `${proofCount} PROOFS PULLED`;
        cardTicketNum.textContent = `P-${formattedId} / PRESS-3 (VANDERCOOK)`;
        cardStatusTitle.textContent = currentNote.title;
        cardNoteBody.textContent = `[${currentInkName} on ${currentStockName}]: ${currentNote.note}`;
        specReg.textContent = `± ${Math.abs(jitterX)} pt (${jitterX >= 0 ? '+' : ''}${jitterX}x)`;
        specTack.textContent = currentNote.tack;
        specBite.textContent = currentBiteDepth;

        // Add entry to history log
        const logItem = document.createElement('li');
        logItem.className = 'proof-log-item';
        logItem.innerHTML = `
          <div class="log-top">
            <span style="color:var(--hot-red)">P-${formattedId} • ${currentInkName}</span>
            <span>REG: ${jitterX}pt</span>
          </div>
          <div class="log-text">${currentNote.title}: ${currentNote.note.substring(0, 95)}...</div>
        `;
        proofLogList.insertBefore(logItem, proofLogList.firstChild);

      }, 700);

      // Reset cranking state when cylinder finishes sweep
      setTimeout(() => {
        pullBtn.classList.remove('is-cranking');
      }, 1600);
    });
  }

  // Clear Log Button
  if (clearLogBtn) {
    clearLogBtn.addEventListener('click', () => {
      proofLogList.innerHTML = '';
      proofCount = 0;
      proofCounterBadge.textContent = '0 PROOFS PULLED';
      cardTicketNum.textContent = 'LOG CLEARED';
      cardStatusTitle.textContent = 'PRESS BED READY';
      cardNoteBody.textContent = 'Brayer inked and cylinder trip set. Click "Pull a Proof" to roll the next sheet.';
    });
  }

  // ==========================================================================
  // 3. WORKSHOP SCHEDULE TABLE FILTERING
  // ==========================================================================
  const filterTabs = document.querySelectorAll('.order-tab-btn');
  const ticketRows = document.querySelectorAll('#schedule-table tbody tr');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterValue = tab.getAttribute('data-filter');

      ticketRows.forEach(row => {
        const rowCategory = row.getAttribute('data-category');
        if (filterValue === 'all' || rowCategory === filterValue) {
          row.classList.remove('row-hidden');
        } else {
          row.classList.add('row-hidden');
        }
      });
    });
  });

  // ==========================================================================
  // 4. ORDER SHEET BOOKING MODAL VOUCHER
  // ==========================================================================
  const bookingModal = document.getElementById('booking-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalTicketId = document.getElementById('modal-ticket-id');
  const modalWorkshopName = document.getElementById('modal-workshop-name');
  const modalWorkshopDate = document.getElementById('modal-workshop-date');
  const modalWorkshopFee = document.getElementById('modal-workshop-fee');
  const voucherForm = document.getElementById('voucher-form');
  const reservationSuccess = document.getElementById('reservation-success');

  const bookButtons = document.querySelectorAll('.voucher-book-btn:not(.disabled)');
  bookButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const ticket = btn.getAttribute('data-ticket');
      const name = btn.getAttribute('data-name');
      const fee = btn.getAttribute('data-fee');
      const date = btn.getAttribute('data-date');

      modalTicketId.textContent = ticket;
      modalWorkshopName.textContent = name;
      modalWorkshopFee.textContent = fee;
      modalWorkshopDate.textContent = date;

      voucherForm.style.display = 'flex';
      reservationSuccess.style.display = 'none';

      bookingModal.classList.add('is-active');
      bookingModal.setAttribute('aria-hidden', 'false');
    });
  });

  function closeBookingModal() {
    bookingModal.classList.remove('is-active');
    bookingModal.setAttribute('aria-hidden', 'true');
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeBookingModal);
  }

  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) {
        closeBookingModal();
      }
    });
  }

  if (voucherForm) {
    voucherForm.addEventListener('submit', (e) => {
      e.preventDefault();
      voucherForm.style.display = 'none';
      reservationSuccess.style.display = 'block';
    });
  }

  // ==========================================================================
  // 5. INK SWATCH SPECIMEN LOUPE MODAL
  // ==========================================================================
  const swatchModal = document.getElementById('swatch-modal');
  const closeSwatchModalBtn = document.getElementById('close-swatch-modal-btn');
  const swatchModalContent = document.getElementById('swatch-modal-content');
  const inspectButtons = document.querySelectorAll('.swatch-inspect-btn');

  const swatchData = {
    vermilion: {
      title: "No. 42 Hot Press Vermilion",
      hex: "#B7472A",
      char: "B",
      textColor: "#F7F3E9",
      stock: "Crane's Lettra 600gsm Double-Thick Fluorescent White",
      formula: "70% Cadmium Red Medium + 20% Raw Sienna + 10% Triple-Boiled Burnt Linseed Plate Oil",
      bite: "0.42 mm (Heavy Relief Bite)",
      tack: "15.8 Tack Rating (Stiff Litho Body)",
      makeready: "Requires 4 sheets 80lb tympan packing and 1 sheet 0.003-inch mylar on Vandercook bed. Cylinder speed set to slow drag for 100% coverage on cotton rag without pinholing."
    },
    black: {
      title: "No. 01 Carbon Lampblack",
      hex: "#1B1810",
      char: "&",
      textColor: "#F7F3E9",
      stock: "French Paper Co. Speckletone Mimeo 100lb Cover",
      formula: "85% Channel Soot Carbon + 15% Heavy Boiled Linseed + Faint Dash of Cobalt Drier",
      bite: "0.22 mm (Crisp Lead Relief)",
      tack: "18.4 Tack Rating (Dense & Stiff)",
      makeready: "Roll brayer with 10 passes across stone slab until a quiet velvet hiss is heard. Excellent opacity over wood type with zero bleed through speckle flecks."
    },
    olive: {
      title: "No. 19 Olive Drab Overprint",
      hex: "#5C6B4A",
      char: "✦",
      textColor: "#1B1810",
      stock: "Somerset Velvet Heavyweight 250gsm Moldmade Rag",
      formula: "45% Terre Verte + 25% French Ochre + 30% Transparent Extender Gel Base",
      bite: "0.16 mm (Translucent Kiss)",
      tack: "12.0 Tack Rating (Fast Roller Glide)",
      makeready: "Mixed specifically for second-pass overprints. When layered over dried black lead type, creates a luminous bronze duotone third shade without masking underlying serifs."
    },
    mustard: {
      title: "No. 88 Mustard Ochre Specimen",
      hex: "#C9971C",
      char: "№",
      textColor: "#1B1810",
      stock: "Strathmore Pastelle Natural White 250gsm Antique Laid",
      formula: "75% Natural Earth Ochre + 15% Chrome Yellow + 10% Bodied Castor Linseed",
      bite: "0.20 mm (Medium Relief Impression)",
      tack: "14.1 Tack Rating (Clean Release)",
      makeready: "Used for edition numbering stencils, colophon seals, and broadside burst borders. Cures within 12 hours on drying racks."
    }
  };

  inspectButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-swatch');
      const data = swatchData[key];
      if (!data) return;

      swatchModalContent.innerHTML = `
        <div style="background-color:${data.hex}; height:180px; display:flex; align-items:center; justify-content:center; border:2px solid var(--ink-black); margin-bottom:20px; box-shadow:inset 0 0 18px rgba(0,0,0,0.3);">
          <span style="font-family:var(--font-display); font-size:6.5rem; color:${data.textColor}; line-height:1;">${data.char}</span>
        </div>
        <div style="font-family:var(--font-mono); font-size:0.7rem; color:var(--hot-red); font-weight:700;">HEX: ${data.hex} • SPECIMEN ANALYSIS</div>
        <h3 style="font-family:var(--font-display); font-size:1.8rem; margin:4px 0 14px 0;">${data.title}</h3>
        
        <div style="display:flex; flex-direction:column; gap:10px; font-size:0.85rem; background-color:var(--paper-surface); padding:16px; border:1px solid var(--ink-black);">
          <div><strong style="font-family:var(--font-mono); font-size:0.75rem;">RECOMMENDED STOCK:</strong><br>${data.stock}</div>
          <div><strong style="font-family:var(--font-mono); font-size:0.75rem;">IN-HOUSE INK FORMULA:</strong><br>${data.formula}</div>
          <div><strong style="font-family:var(--font-mono); font-size:0.75rem;">IMPRESSION DEPTH &amp; TACK:</strong><br>${data.bite} &bull; ${data.tack}</div>
          <div><strong style="font-family:var(--font-mono); font-size:0.75rem;">PRESS MAKEREADY NOTES:</strong><br>${data.makeready}</div>
        </div>
      `;

      swatchModal.classList.add('is-active');
      swatchModal.setAttribute('aria-hidden', 'false');
    });
  });

  function closeSwatchModal() {
    swatchModal.classList.remove('is-active');
    swatchModal.setAttribute('aria-hidden', 'true');
  }

  if (closeSwatchModalBtn) {
    closeSwatchModalBtn.addEventListener('click', closeSwatchModal);
  }

  if (swatchModal) {
    swatchModal.addEventListener('click', (e) => {
      if (e.target === swatchModal) {
        closeSwatchModal();
      }
    });
  }

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeBookingModal();
      closeSwatchModal();
    }
  });

});
