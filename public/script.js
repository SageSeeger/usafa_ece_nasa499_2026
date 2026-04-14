// ── Elements ──────────────────────────────────────────────────────────────────
const loadBtn = document.getElementById('loadBtn');
const submitBtn = document.getElementById('submitBtn');
const userList = document.getElementById('userList');
const formStatus = document.getElementById('formStatus');

const viewTabBtn = document.getElementById('viewTabBtn');
const addTabBtn = document.getElementById('addTabBtn');
const viewSection = document.getElementById('viewSection');
const addSection = document.getElementById('addSection');

const dbModeBtn = document.getElementById('dbModeBtn');
const csvModeBtn = document.getElementById('csvModeBtn');
const dbMode = document.getElementById('dbMode');
const csvMode = document.getElementById('csvMode');

const csvFileInput = document.getElementById('csvFileInput');
const csvFileLabel = document.getElementById('csvFileLabel');
const csvStatus = document.getElementById('csvStatus');
const csvPreview = document.getElementById('csvPreview');
const csvRowCount = document.getElementById('csvRowCount');
const csvTable = document.getElementById('csvTable');
const uploadToDbBtn = document.getElementById('uploadToDbBtn');

const pickUserBtns = [
    document.getElementById('pickUserBtn1'),
    document.getElementById('pickUserBtn2'),
    document.getElementById('pickUserBtn3'),
    document.getElementById('pickUserBtn4'),
    document.getElementById('pickUserBtn5'),
    document.getElementById('pickUserBtn6')
];

// Expected CSV column order (must match DB column names)
const CSV_COLUMNS = [
    'flight_number', 'drone_type', 'flight_time',
    'power_watts', 'current_amps', 'batterytemp',
    'ambianttemp', 'airspeed', 'winddirection_rad', 'windspeed_mps'
];

let selectedIndex = 0;
let parsedCsvRecords = [];

// ── Tab Management ────────────────────────────────────────────────────────────
function switchTab(activeTab) {
    if (activeTab === 'view') {
        viewSection.style.display = 'block';
        addSection.style.display = 'none';
        viewTabBtn.classList.add('active');
        addTabBtn.classList.remove('active');
    } else {
        viewSection.style.display = 'none';
        addSection.style.display = 'block';
        addTabBtn.classList.add('active');
        viewTabBtn.classList.remove('active');
    }
}

viewTabBtn.addEventListener('click', () => switchTab('view'));
addTabBtn.addEventListener('click', () => switchTab('add'));

// ── View Mode Toggle (DB vs CSV) ──────────────────────────────────────────────
function switchViewMode(mode) {
    if (mode === 'db') {
        dbMode.style.display = 'block';
        csvMode.style.display = 'none';
        dbModeBtn.classList.add('active');
        csvModeBtn.classList.remove('active');
    } else {
        dbMode.style.display = 'none';
        csvMode.style.display = 'block';
        csvModeBtn.classList.add('active');
        dbModeBtn.classList.remove('active');
    }
}

dbModeBtn.addEventListener('click', () => switchViewMode('db'));
csvModeBtn.addEventListener('click', () => switchViewMode('csv'));

// ── Flight Selection (DB mode) ────────────────────────────────────────────────
function updateSelection(index) {
    selectedIndex = index;
    pickUserBtns.forEach((btn, i) => {
        if (i === index) btn.classList.add('selected');
        else btn.classList.remove('selected');
    });
}

pickUserBtns.forEach((btn, i) => btn.addEventListener('click', () => updateSelection(i)));
updateSelection(0);

// ── Fetch from Database ───────────────────────────────────────────────────────
loadBtn.addEventListener('click', async () => {
    loadBtn.textContent = 'Loading...';
    loadBtn.disabled = true;

    try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch data');

        const flights = await response.json();
        userList.innerHTML = '';

        if (flights[selectedIndex]) {
            const f = flights[selectedIndex];
            userList.innerHTML = `<div class="user-card">
                <span class="user-name" style="font-size: 1.6rem; font-weight: bold;">
                    Flight #${f.flight_number} — ${f.drone_type}
                </span>
                <table class="flight-table">
                    <tr><th>Time</th><td>${f.flight_time ? new Date(f.flight_time).toLocaleString() : '—'}</td></tr>
                    <tr><th>Power</th><td>${f.power_watts} W</td></tr>
                    <tr><th>Current</th><td>${f.current_amps} A</td></tr>
                    <tr><th>Battery Temp</th><td>${f.batterytemp} °C</td></tr>
                    <tr><th>Ambient Temp</th><td>${f.ambianttemp} °C</td></tr>
                    <tr><th>Air Speed</th><td>${f.airspeed} m/s</td></tr>
                    <tr><th>Wind Direction</th><td>${f.winddirection_rad} rad</td></tr>
                    <tr><th>Wind Speed</th><td>${f.windspeed_mps} m/s</td></tr>
                </table>
            </div>`;
        } else {
            userList.innerHTML = 'No flight record found at this index.';
        }
    } catch (err) {
        console.error(err);
        userList.innerHTML = `<div style="color:red;">Error: ${err.message}</div>`;
    } finally {
        loadBtn.textContent = 'Load Flight Record';
        loadBtn.disabled = false;
    }
});

// ── CSV Parsing ───────────────────────────────────────────────────────────────
function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row.');

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    // Validate required columns exist
    const missing = CSV_COLUMNS.filter(col => !headers.includes(col));
    if (missing.length > 0) {
        throw new Error(`CSV is missing required columns: ${missing.join(', ')}`);
    }

    return lines.slice(1).map((line, i) => {
        const values = line.split(',').map(v => v.trim());
        if (values.length !== headers.length) {
            throw new Error(`Row ${i + 2} has ${values.length} columns but header has ${headers.length}.`);
        }
        const record = {};
        headers.forEach((h, j) => {
            const val = values[j];
            // Parse numeric fields
            if (['flight_number', 'power_watts', 'current_amps', 'batterytemp',
                'ambianttemp', 'airspeed', 'winddirection_rad', 'windspeed_mps'].includes(h)) {
                record[h] = val === '' ? null : Number(val);
            } else {
                record[h] = val === '' ? null : val;
            }
        });
        return record;
    });
}

function renderCSVTable(records) {
    const headers = CSV_COLUMNS;
    const thead = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
    const rows = records.map(r =>
        `<tr>${headers.map(h => `<td>${r[h] ?? ''}</td>`).join('')}</tr>`
    ).join('');
    csvTable.innerHTML = thead + `<tbody>${rows}</tbody>`;
}

csvFileInput.addEventListener('change', () => {
    const file = csvFileInput.files[0];
    if (!file) return;

    csvFileLabel.textContent = `📄 ${file.name}`;
    csvStatus.innerHTML = '';
    csvPreview.style.display = 'none';

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            parsedCsvRecords = parseCSV(e.target.result);
            csvRowCount.textContent = `${parsedCsvRecords.length} record${parsedCsvRecords.length !== 1 ? 's' : ''} parsed`;
            renderCSVTable(parsedCsvRecords);
            csvPreview.style.display = 'block';
            csvStatus.innerHTML = `<span style="color:green;">✔ CSV loaded successfully.</span>`;
        } catch (err) {
            csvStatus.innerHTML = `<span style="color:red;">Error: ${err.message}</span>`;
        }
    };
    reader.readAsText(file);
});

// ── Upload CSV to Database ────────────────────────────────────────────────────
uploadToDbBtn.addEventListener('click', async () => {
    if (parsedCsvRecords.length === 0) return;

    uploadToDbBtn.textContent = 'Uploading...';
    uploadToDbBtn.disabled = true;

    try {
        const response = await fetch('/api/upload_csv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ records: parsedCsvRecords })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Upload failed');

        csvStatus.innerHTML = `<span style="color:green;">✔ ${result.inserted} record(s) uploaded to database.</span>`;
    } catch (err) {
        csvStatus.innerHTML = `<span style="color:red;">Error: ${err.message}</span>`;
    } finally {
        uploadToDbBtn.textContent = '⬆ Upload to Database';
        uploadToDbBtn.disabled = false;
    }
});

// ── Add Single Flight Record ──────────────────────────────────────────────────
submitBtn.addEventListener('click', async () => {
    const flight_number = parseInt(document.getElementById('newFlightNumber').value);
    const drone_type = document.getElementById('newDroneType').value;
    const current_time = document.getElementById('newCurrentTime').value || null;
    const power_watts = parseFloat(document.getElementById('newPowerWatts').value) || null;
    const current_amps = parseFloat(document.getElementById('newCurrentAmps').value) || null;
    const batterytemp = parseFloat(document.getElementById('newBatteryTemp').value) || null;
    const ambianttemp = parseFloat(document.getElementById('newAmbiantTemp').value) || null;
    const airspeed = parseFloat(document.getElementById('newAirSpeed').value) || null;
    const winddirection_rad = parseFloat(document.getElementById('newWindDirection').value) || null;
    const windspeed_mps = parseFloat(document.getElementById('newWindSpeed').value) || null;

    if (!flight_number || !drone_type) {
        formStatus.innerHTML = '<span style="color:red;">Flight Number and Drone Type are required.</span>';
        return;
    }

    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('/api/add_user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                flight_number, drone_type,
                current_time, power_watts, current_amps,
                batterytemp, ambianttemp, airspeed,
                winddirection_rad, windspeed_mps
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to save flight record');
        }

        formStatus.innerHTML = '<span style="color:green;">Flight record saved successfully!</span>';
        ['newFlightNumber', 'newDroneType', 'newCurrentTime', 'newPowerWatts',
            'newCurrentAmps', 'newBatteryTemp', 'newAmbiantTemp', 'newAirSpeed',
            'newWindDirection', 'newWindSpeed'].forEach(id => {
                document.getElementById(id).value = '';
            });

        setTimeout(() => { switchTab('view'); formStatus.innerHTML = ''; }, 2000);
    } catch (err) {
        formStatus.innerHTML = `<span style="color:red;">Error: ${err.message}</span>`;
    } finally {
        submitBtn.textContent = 'Save Flight Record';
        submitBtn.disabled = false;
    }
});