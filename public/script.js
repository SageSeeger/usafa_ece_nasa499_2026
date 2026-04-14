// ── Elements ──────────────────────────────────────────────────────────────────
const loadBtn       = document.getElementById('loadBtn');
const submitBtn     = document.getElementById('submitBtn');
const userList      = document.getElementById('userList');
const formStatus    = document.getElementById('formStatus');

const viewTabBtn    = document.getElementById('viewTabBtn');
const addTabBtn     = document.getElementById('addTabBtn');
const xlsxTabBtn    = document.getElementById('xlsxTabBtn');
const viewSection   = document.getElementById('viewSection');
const addSection    = document.getElementById('addSection');
const xlsxSection   = document.getElementById('xlsxSection');

const dbModeBtn     = document.getElementById('dbModeBtn');
const csvModeBtn    = document.getElementById('csvModeBtn');
const dbMode        = document.getElementById('dbMode');
const csvMode       = document.getElementById('csvMode');

const csvFileInput  = document.getElementById('csvFileInput');
const csvFileLabel  = document.getElementById('csvFileLabel');
const csvStatus     = document.getElementById('csvStatus');
const csvPreview    = document.getElementById('csvPreview');
const csvRowCount   = document.getElementById('csvRowCount');
const csvTable      = document.getElementById('csvTable');
const uploadToDbBtn = document.getElementById('uploadToDbBtn');

// XLSX elements
const xlsxFileInput  = document.getElementById('xlsxFileInput');
const xlsxFileLabel  = document.getElementById('xlsxFileLabel');
const xlsxStatus     = document.getElementById('xlsxStatus');
const xlsxConfirm    = document.getElementById('xlsxConfirm');
const xlsxUploadBtn  = document.getElementById('xlsxUploadBtn');
const xlsxResult     = document.getElementById('xlsxResult');
const xlsxResultText = document.getElementById('xlsxResultText');

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

// Mapping from XLSX header → Supabase column name
const XLSX_COLUMN_MAP = {
    'Min-Sec':                    'min_sec',
    'RTC_UTC':                    'rtc_utc',
    'GPS_UTC':                    'gps_utc',
    'GPS_Synced':                 'gps_synced',
    'Battery_Temp_C':             'battery_temp_c',
    'Battery_Current_A':          'battery_current_a',
    'Battery_Voltage_V':          'battery_voltage_v',
    'Battery_Power_W':            'battery_power_w',
    'PM_Voltage_V':               'pm_voltage_v',
    'PM_Current_A':               'pm_current_a',
    'PM_Power_W':                 'pm_power_w',
    'PM_Consumed_mAh':            'pm_consumed_mah',
    'PM_Remaining_Pct':           'pm_remaining_pct',
    'IMU_Roll_Rads':              'imu_roll_rads',
    'IMU_Pitch_Rads':             'imu_pitch_rads',
    'IMU_Yaw_Rads':               'imu_yaw_rads',
    'IMU_Roll_Speed_Rads/s':      'imu_roll_speed_rads_s',
    'IMU_Pitch_Speed_Rads/s':     'imu_pitch_speed_rads_s',
    'IMU_Yaw_Speed_Rads/s':       'imu_yaw_speed_rads_s',
    'IMU_X_acc_cm/s^2':           'imu_x_acc_cm_s2',
    'IMU_Y_acc_cm/s^2':           'imu_y_acc_cm_s2',
    'IMU_Z_acc_cm/s^2':           'imu_z_acc_cm_s2',
    'IMU_X_gyro_Rad/s':           'imu_x_gyro_rad_s',
    'IMU_Y_gyro_Rad/s':           'imu_y_gyro_rad_s',
    'IMU_Z_gyro_Rad/s':           'imu_z_gyro_rad_s',
    'IMU_X_mag_Rad/s':            'imu_x_mag_rad_s',
    'IMU_Y_mag_Rad/s':            'imu_y_mag_rad_s',
    'IMU_Z_mag_Rad/s':            'imu_z_mag_rad_s',
    'RawGPS_Lat':                 'rawgps_lat',
    'RawGPS_Lon':                 'rawgps_lon',
    'RawGPS_alt_mm':              'rawgps_alt_mm',
    'RawGPS_vel_m/s':             'rawgps_vel_m_s',
    'RawGPS_sats':                'rawgps_sats',
    'FusedGPS_Lat':               'fusedgps_lat',
    'FusedGPS_Lon':               'fusedgps_lon',
    'FusedGPS_alt_msl_mm':        'fusedgps_alt_msl_mm',
    'FusedGPS_alt_rel_mm':        'fusedgps_alt_rel_mm',
    'FusedGPS_velx_cm/s':         'fusedgps_velx_cm_s',
    'FusedGPS_vely_cm/s':         'fusedgps_vely_cm_s',
    'FusedGPS_velz_cm/s':         'fusedgps_velz_cm_s',
    'FusedGPS_head':              'fusedgps_head'
};

const BOOLEAN_COLS  = new Set(['gps_synced']);
const NUMERIC_COLS  = new Set([
    'battery_temp_c', 'battery_current_a', 'battery_voltage_v', 'battery_power_w',
    'pm_voltage_v', 'pm_current_a', 'pm_power_w', 'pm_consumed_mah', 'pm_remaining_pct',
    'imu_roll_rads', 'imu_pitch_rads', 'imu_yaw_rads',
    'imu_roll_speed_rads_s', 'imu_pitch_speed_rads_s', 'imu_yaw_speed_rads_s',
    'imu_x_acc_cm_s2', 'imu_y_acc_cm_s2', 'imu_z_acc_cm_s2',
    'imu_x_gyro_rad_s', 'imu_y_gyro_rad_s', 'imu_z_gyro_rad_s',
    'imu_x_mag_rad_s', 'imu_y_mag_rad_s', 'imu_z_mag_rad_s',
    'rawgps_lat', 'rawgps_lon', 'rawgps_alt_mm', 'rawgps_vel_m_s', 'rawgps_sats',
    'fusedgps_lat', 'fusedgps_lon', 'fusedgps_alt_msl_mm', 'fusedgps_alt_rel_mm',
    'fusedgps_velx_cm_s', 'fusedgps_vely_cm_s', 'fusedgps_velz_cm_s', 'fusedgps_head'
]);

let selectedIndex       = 0;
let parsedCsvRecords    = [];
let parsedXlsxRecords   = [];

// ── Tab Management ────────────────────────────────────────────────────────────
function switchTab(activeTab) {
    viewSection.style.display  = activeTab === 'view'  ? 'block' : 'none';
    addSection.style.display   = activeTab === 'add'   ? 'block' : 'none';
    xlsxSection.style.display  = activeTab === 'xlsx'  ? 'block' : 'none';

    viewTabBtn.classList.toggle('active', activeTab === 'view');
    addTabBtn.classList.toggle('active',  activeTab === 'add');
    xlsxTabBtn.classList.toggle('active', activeTab === 'xlsx');
}

viewTabBtn.addEventListener('click', () => switchTab('view'));
addTabBtn.addEventListener('click',  () => switchTab('add'));
xlsxTabBtn.addEventListener('click', () => switchTab('xlsx'));

// ── View Mode Toggle (DB vs CSV) ──────────────────────────────────────────────
function switchViewMode(mode) {
    dbMode.style.display  = mode === 'db'  ? 'block' : 'none';
    csvMode.style.display = mode === 'csv' ? 'block' : 'none';
    dbModeBtn.classList.toggle('active',  mode === 'db');
    csvModeBtn.classList.toggle('active', mode === 'csv');
}

dbModeBtn.addEventListener('click', () => switchViewMode('db'));
csvModeBtn.addEventListener('click', () => switchViewMode('csv'));

// ── Flight Selection (DB mode) ────────────────────────────────────────────────
function updateSelection(index) {
    selectedIndex = index;
    pickUserBtns.forEach((btn, i) => {
        btn.classList.toggle('selected', i === index);
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
    const flight_number   = parseInt(document.getElementById('newFlightNumber').value);
    const drone_type      = document.getElementById('newDroneType').value;
    const current_time    = document.getElementById('newCurrentTime').value || null;
    const power_watts     = parseFloat(document.getElementById('newPowerWatts').value) || null;
    const current_amps    = parseFloat(document.getElementById('newCurrentAmps').value) || null;
    const batterytemp     = parseFloat(document.getElementById('newBatteryTemp').value) || null;
    const ambianttemp     = parseFloat(document.getElementById('newAmbiantTemp').value) || null;
    const airspeed        = parseFloat(document.getElementById('newAirSpeed').value) || null;
    const winddirection_rad = parseFloat(document.getElementById('newWindDirection').value) || null;
    const windspeed_mps   = parseFloat(document.getElementById('newWindSpeed').value) || null;

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

// ── XLSX Parsing (SheetJS) ────────────────────────────────────────────────────
function parseXLSX(arrayBuffer, fileName) {
    const workbook   = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    const sheetName  = workbook.SheetNames[0];
    const sheet      = workbook.Sheets[sheetName];

    // Convert to array of objects, raw strings for dates so we control parsing
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false });

    if (rawRows.length === 0) throw new Error('The XLSX file appears to be empty.');

    // Map rows to Supabase column names
    const records = rawRows.map((row, idx) => {
        const record = {};

        for (const [xlsxHeader, dbCol] of Object.entries(XLSX_COLUMN_MAP)) {
            // Try exact key, then trimmed key (SheetJS can add whitespace)
            let rawVal = row[xlsxHeader];
            if (rawVal === undefined) {
                // Try trimming all keys
                const matchedKey = Object.keys(row).find(k => k.trim() === xlsxHeader.trim());
                rawVal = matchedKey !== undefined ? row[matchedKey] : null;
            }

            if (rawVal === null || rawVal === undefined || rawVal === '') {
                record[dbCol] = null;
            } else if (BOOLEAN_COLS.has(dbCol)) {
                // 'True'/'False' strings -> boolean
                const s = String(rawVal).trim().toLowerCase();
                record[dbCol] = s === 'true' || s === '1' || s === 'yes';
            } else if (NUMERIC_COLS.has(dbCol)) {
                const n = parseFloat(rawVal);
                record[dbCol] = isNaN(n) ? null : n;
            } else {
                // text / timestamp columns — keep as string; Supabase will parse timestamps
                record[dbCol] = String(rawVal).trim();
            }
        }

        return record;
    });

    return records;
}

function renderXLSXPreview(records) {
    const previewRows = records.slice(0, 3);
    const cols = Object.keys(XLSX_COLUMN_MAP).map(k => XLSX_COLUMN_MAP[k]);
    const thead = `<thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>`;
    const rows  = previewRows.map(r =>
        `<tr>${cols.map(c => `<td>${r[c] ?? ''}</td>`).join('')}</tr>`
    ).join('');
    document.getElementById('xlsxPreviewTable').innerHTML = thead + `<tbody>${rows}</tbody>`;
}

function populateConfirmCard(records, fileName) {
    document.getElementById('confirmFileName').textContent  = fileName;
    document.getElementById('confirmRowCount').textContent  = records.length.toLocaleString();
    document.getElementById('confirmColCount').textContent  = Object.keys(XLSX_COLUMN_MAP).length;

    // Time range
    const times = records.map(r => r.gps_utc).filter(Boolean);
    if (times.length >= 2) {
        document.getElementById('confirmTimeRange').textContent =
            `${times[0]} → ${times[times.length - 1]}`;
    } else {
        document.getElementById('confirmTimeRange').textContent = times[0] || '—';
    }

    // GPS synced count
    const syncedCount = records.filter(r => r.gps_synced === true).length;
    document.getElementById('confirmGpsSynced').textContent =
        `${syncedCount} / ${records.length} rows`;

    // Avg battery voltage
    const volts = records.map(r => r.battery_voltage_v).filter(v => v !== null);
    if (volts.length > 0) {
        const avg = volts.reduce((a, b) => a + b, 0) / volts.length;
        document.getElementById('confirmAvgVolt').textContent = avg.toFixed(3) + ' V';
    }
}

xlsxFileInput.addEventListener('change', () => {
    const file = xlsxFileInput.files[0];
    if (!file) return;

    xlsxFileLabel.textContent = `📄 ${file.name}`;
    xlsxStatus.innerHTML      = '';
    xlsxConfirm.style.display = 'none';
    xlsxResult.style.display  = 'none';
    parsedXlsxRecords         = [];

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            parsedXlsxRecords = parseXLSX(e.target.result, file.name);
            populateConfirmCard(parsedXlsxRecords, file.name);
            renderXLSXPreview(parsedXlsxRecords);
            xlsxConfirm.style.display = 'block';
            xlsxStatus.innerHTML = `<span style="color:green;">✔ File parsed — ${parsedXlsxRecords.length} rows ready.</span>`;
        } catch (err) {
            xlsxStatus.innerHTML = `<span style="color:red;">Error: ${err.message}</span>`;
            console.error(err);
        }
    };
    reader.readAsArrayBuffer(file);
});

// ── Upload XLSX records to Supabase via /api/upload_xlsx ──────────────────────
xlsxUploadBtn.addEventListener('click', async () => {
    if (parsedXlsxRecords.length === 0) return;

    xlsxUploadBtn.textContent = 'Uploading...';
    xlsxUploadBtn.disabled    = true;
    xlsxStatus.innerHTML      = '';

    try {
        const response = await fetch('/api/upload_xlsx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ records: parsedXlsxRecords })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Upload failed');

        xlsxResult.style.display = 'block';
        xlsxResult.className     = 'result-card result-success';
        xlsxResultText.innerHTML =
            `✅ <strong>${result.inserted.toLocaleString()}</strong> telemetry row(s) successfully stored in Supabase.`;

        xlsxConfirm.style.display = 'none';
    } catch (err) {
        xlsxResult.style.display = 'block';
        xlsxResult.className     = 'result-card result-error';
        xlsxResultText.innerHTML = `❌ Upload failed: ${err.message}`;
        console.error(err);
    } finally {
        xlsxUploadBtn.textContent = '⬆ Upload to Database';
        xlsxUploadBtn.disabled    = false;
    }
});