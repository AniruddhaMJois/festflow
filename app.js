// --- CORE SYSTEM STATE ---
const CONFIG = {
    auth: { user: 'festflow', pass: '123456' },
    zones: [
        { id: 'Zone 1', name: 'HQ_SECTOR', type: 'HARDWARE' },
        { id: 'Zone 2', name: 'ALPHA_WEST', type: 'SIMULATED' },
        { id: 'Zone 3', name: 'BETA_NORTH', type: 'SIMULATED' },
        { id: 'Zone 4', name: 'DELTA_EXT', type: 'SIMULATED' }
    ]
};

let appState = {
    isAuth: false,
    currentZone: 'Zone 1',
    activeTab: 'active',
    hwName: 'Ignovator-Alpha',
    hwConnected: false,
    wristbands: [],
    serialReader: null,
    serialPort: null,
    map: null,
    markers: {}
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    runBootSequence();
    bindEvents();
});

function runBootSequence() {
    const log = document.getElementById('boot-log');
    const form = document.getElementById('login-form-container');
    const lines = [
        "> KERNEL_INIT: OK",
        "> NEURAL_BRIDGE: ESTABLISHED",
        "> IO_SUBSYSTEM: READY",
        "> SECURE_PORT_8001: LISTENING..."
    ];

    let delay = 1000;
    lines.forEach((text, i) => {
        setTimeout(() => {
            const p = document.createElement('p');
            p.className = 'term-line';
            p.textContent = text;
            log.appendChild(p);
            if (i === lines.length - 1) {
                setTimeout(() => {
                    form.classList.remove('hidden');
                    document.getElementById('username').focus();
                }, 1000);
            }
        }, delay);
        delay += 1200;
    });
}

function bindEvents() {
    // Login
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => location.reload());

    // Tab Switching
    document.querySelectorAll('.tab-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            appState.activeTab = btn.dataset.tab;
            document.querySelectorAll('.tab-trigger').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderDashboard();
        });
    });

    // Zone Switching
    document.querySelectorAll('.zone-card').forEach(card => {
        card.addEventListener('click', () => {
            appState.currentZone = card.dataset.zone;
            document.querySelectorAll('.zone-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            renderDashboard();
        });
    });

    // Hardware Connect
    document.getElementById('hw-connect').addEventListener('click', toggleWebSerial);

    // Edit Hardware Name
    document.getElementById('edit-name').addEventListener('click', () => {
        const name = prompt("Enter Node Identifier:", appState.hwName);
        if (name) {
            appState.hwName = name;
            document.getElementById('hw-name').textContent = name;
            const hwBand = appState.wristbands.find(b => b.isHardware);
            if (hwBand) hwBand.name = name;
            renderDashboard();
        }
    });
}

// --- AUTHENTICATION ---
function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const err = document.getElementById('auth-error');

    if (u === CONFIG.auth.user && p === CONFIG.auth.pass) {
        appState.isAuth = true;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-interface').classList.remove('hidden');
        initDashboard();
    } else {
        err.textContent = "AUTH_FAILURE: ACCESS_DENIED";
    }
}

// --- DASHBOARD LOGIC ---
function initDashboard() {
    generateInitialState();
    initMap();
    startSimulation();
    renderDashboard();
    
    // Poll updates
    setInterval(() => {
        if (appState.isAuth) renderDashboard();
    }, 2000);
}

function generateInitialState() {
    appState.wristbands = [];
    
    // Zone 1: Real Hardware Band
    appState.wristbands.push({
        id: 'SEC_01_HW',
        name: appState.hwName,
        zone: 'Zone 1',
        pulse: 72,
        sys: 120,
        dia: 80,
        lat: 12.2958,
        lng: 76.6394,
        isHardware: true,
        status: 'active'
    });

    // Zones 2-4: Simulated Nodes
    CONFIG.zones.slice(1).forEach(zone => {
        for (let i = 0; i < 3; i++) {
            appState.wristbands.push({
                id: `SEC_0${zone.id.split(' ')[1]}_${i + 1}`,
                name: `Walker_${zone.id.split(' ')[1]}${i + 1}`,
                zone: zone.id,
                pulse: 60 + Math.random() * 40,
                sys: 110 + Math.random() * 30,
                dia: 70 + Math.random() * 20,
                lat: 12.2958 + (Math.random() - 0.5) * 0.01,
                lng: 76.6394 + (Math.random() - 0.5) * 0.01,
                isHardware: false,
                status: 'active'
            });
        }
    });
}

function startSimulation() {
    setInterval(() => {
        appState.wristbands.forEach(band => {
            if (!band.isHardware) {
                // Random vitals fluctuation
                const spike = Math.random() < 0.08;
                if (spike) {
                    band.pulse = 160 + Math.random() * 30; // Emergency trigger
                } else {
                    band.pulse = Math.max(60, Math.min(185, band.pulse + (Math.random() - 0.5) * 10));
                }
                
                band.sys = Math.max(90, Math.min(160, band.sys + (Math.random() - 0.5) * 5));
                band.dia = Math.max(60, Math.min(100, band.dia + (Math.random() - 0.5) * 3));
                
                // Slight GPS drift
                band.lat += (Math.random() - 0.5) * 0.0004;
                band.lng += (Math.random() - 0.5) * 0.0004;
                
                // Panic Logic
                band.status = (band.pulse > 160) ? 'panic' : 'active';
            }
        });
    }, 3000);
}

function renderDashboard() {
    const activeGrid = document.getElementById('active-bands-grid');
    const panicGrid = document.getElementById('panic-bands-grid');
    const alertStats = { 'Zone 1': 0, 'Zone 2': 0, 'Zone 3': 0, 'Zone 4': 0 };

    activeGrid.innerHTML = '';
    panicGrid.innerHTML = '';

    appState.wristbands.forEach(band => {
        // Tracker for sidebar alert badges
        if (band.status === 'panic') alertStats[band.zone]++;

        // Filter by current zone
        if (band.zone === appState.currentZone) {
            const card = createCyberCard(band);
            if (band.status === 'panic') {
                panicGrid.appendChild(card);
            } else {
                activeGrid.appendChild(card);
            }
        }
        
        updateMapMarker(band);
    });

    // Update Sidebar Alert Badges
    Object.keys(alertStats).forEach(zid => {
        const id = 'alert-z' + zid.split(' ')[1];
        const el = document.getElementById(id);
        if (el) {
            el.textContent = alertStats[zid];
            el.classList.toggle('active', alertStats[zid] > 0);
        }
    });

    // Update Panel Tab Visibility
    document.getElementById('active-panel').classList.toggle('hidden', appState.activeTab !== 'active');
    document.getElementById('panic-panel').classList.toggle('hidden', appState.activeTab !== 'panic');

    // Update Sidebar Hardware Vitals
    const hwBand = appState.wristbands.find(b => b.isHardware);
    if (hwBand) {
        const pulseEl = document.getElementById('hw-pulse');
        const locEl = document.getElementById('hw-loc');
        if (pulseEl) pulseEl.textContent = Math.round(hwBand.pulse);
        if (locEl) locEl.textContent = `${hwBand.lat.toFixed(4)}, ${hwBand.lng.toFixed(4)}`;
        
        // Visual cue for panic on sidebar
        const vitalsBox = document.getElementById('hw-vitals');
        if (vitalsBox) {
            vitalsBox.style.color = hwBand.status === 'panic' ? 'var(--alert-red)' : 'var(--text-primary)';
        }
    }
}

function createCyberCard(band) {
    const div = document.createElement('div');
    div.className = `cyber-card ${band.status === 'panic' ? 'panic' : ''}`;
    
    // Progress calculation for bars
    const pulsePct = Math.min(100, (band.pulse / 200) * 100);
    const bpPct = Math.min(100, (band.sys / 180) * 100);

    div.innerHTML = `
        <div class="card-header">
            <span class="node-tag">ID: ${band.id}</span>
            <span class="type-tag">${band.isHardware ? 'REALTIME' : 'REMOTE'}</span>
        </div>
        <div class="vitals-viz">
            <div class="vital-metric">
                <div class="v-head">
                    <span>HEART_RATE</span>
                    <span class="v-value">${Math.round(band.pulse)} BPM</span>
                </div>
                <div class="v-bar-container">
                    <div class="v-bar" style="width: ${pulsePct}%"></div>
                </div>
            </div>
            <div class="vital-metric">
                <div class="v-head">
                    <span>BLOOD_PRESSURE</span>
                    <span class="v-value">${Math.round(band.sys)}/${Math.round(band.dia)}</span>
                </div>
                <div class="v-bar-container">
                    <div class="v-bar" style="width: ${bpPct}%"></div>
                </div>
            </div>
        </div>
        <div class="location-tag muted">
            📍 LOC: ${band.lat.toFixed(5)}, ${band.lng.toFixed(5)}
        </div>
    `;
    
    div.onclick = () => {
        appState.map.setView([band.lat, band.lng], 16);
        appState.markers[band.id].openPopup();
    };
    
    return div;
}

// --- WEBSERIAL INTERFACE ---
async function toggleWebSerial() {
    if (!("serial" in navigator)) {
        logToTerminal("ERROR: BROWSER_NOT_SUPPORT_SERIAL");
        return;
    }

    try {
        appState.serialPort = await navigator.serial.requestPort();
        await appState.serialPort.open({ baudRate: 115200 });
        appState.hwConnected = true;
        
        document.getElementById('com-status').textContent = "LINK_ACTIVE";
        document.getElementById('com-status').classList.remove('muted');
        document.getElementById('hw-connect').innerHTML = '<span class="btn-shine"></span> ONLINE';
        document.getElementById('hw-connect').style.background = "#27c93f";
        document.getElementById('system-status').textContent = "STREAM_SYNCED";

        const textDecoder = new TextDecoderStream();
        appState.serialPort.readable.pipeTo(textDecoder.writable);
        appState.serialReader = textDecoder.readable.getReader();

        logToTerminal("SYSTEM: SERIAL_LINK_ESTABLISHED");
        
        while (true) {
            const { value, done } = await appState.serialReader.read();
            if (done) break;
            if (value) parseSerialStream(value);
        }
    } catch (err) {
        logToTerminal("ERROR: " + err.message);
    }
}

function parseSerialStream(data) {
    // Expected: pulse,sys,dia,lat,lng
    data.split('\n').forEach(line => {
        if (!line.trim()) return;
        logToTerminal("> " + line.trim());
        const parts = line.split(',');
        if (parts.length >= 5) {
            const hwBand = appState.wristbands.find(b => b.isHardware);
            if (hwBand) {
                hwBand.pulse = parseFloat(parts[0]);
                hwBand.sys = parseFloat(parts[1]);
                hwBand.dia = parseFloat(parts[2]);
                hwBand.lat = parseFloat(parts[3]);
                hwBand.lng = parseFloat(parts[4]);
                hwBand.status = (hwBand.pulse > 160) ? 'panic' : 'active';
            }
        }
    });
}

function logToTerminal(msg) {
    const out = document.getElementById('serial-output');
    const p = document.createElement('p');
    p.textContent = msg;
    out.appendChild(p);
    out.scrollTop = out.scrollHeight;
}

// --- MAP LOGIC ---
function initMap() {
    appState.map = L.map('map-container', { zoomControl: false }).setView([12.2958, 76.6394], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(appState.map);
}

function updateMapMarker(band) {
    if (!appState.map) return;
    
    const popupContent = `
        <div class="map-popup">
            <b style="color: var(--cyber-blue);">${band.name}</b><br>
            <span style="font-family: monospace; font-size: 10px;">ID: ${band.id}</span><br>
            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 5px 0;">
            <div style="display: flex; justify-content: space-between; gap: 10px;">
                <span>❤️ ${Math.round(band.pulse)} BPM</span>
                <span>📍 ${band.lat.toFixed(4)}, ${band.lng.toFixed(4)}</span>
            </div>
        </div>
    `;

    if (!appState.markers[band.id]) {
        appState.markers[band.id] = L.marker([band.lat, band.lng]).addTo(appState.map);
        appState.markers[band.id].bindPopup(popupContent);
    } else {
        appState.markers[band.id].setLatLng([band.lat, band.lng]);
        // Update popup content dynamically if open or bound
        appState.markers[band.id].setPopupContent(popupContent);
    }
}
