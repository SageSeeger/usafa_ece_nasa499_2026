// ═══════════════════════════════════════════════════════════════════════════
// Tab Management
// ═══════════════════════════════════════════════════════════════════════════
function switchTab(tab) {
    document.getElementById('sectionUpload').style.display = tab === 'upload' ? 'block' : 'none';
    document.getElementById('sectionView').style.display   = tab === 'view'   ? 'block' : 'none';
    document.getElementById('tabUpload').classList.toggle('active', tab === 'upload');
    document.getElementById('tabView').classList.toggle('active',   tab === 'view');

    // Load flight list when switching to View tab
    if (tab === 'view') loadFlightList();
}

// ═══════════════════════════════════════════════════════════════════════════
// XLSX Upload — Column Map & Type Sets
// ═══════════════════════════════════════════════════════════════════════════
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

const BOOLEAN_COLS = new Set(['gps_synced']);
const NUMERIC_COLS = new Set([
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

let parsedXlsxRecords = [];

// ── XLSX Parsing (SheetJS) ────────────────────────────────────────────────────
function parseXLSX(arrayBuffer) {
    const workbook  = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    const sheet     = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows   = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false });

    if (rawRows.length === 0) throw new Error('The XLSX file appears to be empty.');

    return rawRows.map((row) => {
        const record = {};
        for (const [xlsxHeader, dbCol] of Object.entries(XLSX_COLUMN_MAP)) {
            let rawVal = row[xlsxHeader];
            if (rawVal === undefined) {
                const k = Object.keys(row).find(k => k.trim() === xlsxHeader.trim());
                rawVal = k !== undefined ? row[k] : null;
            }
            if (rawVal === null || rawVal === undefined || rawVal === '') {
                record[dbCol] = null;
            } else if (BOOLEAN_COLS.has(dbCol)) {
                const s = String(rawVal).trim().toLowerCase();
                record[dbCol] = s === 'true' || s === '1' || s === 'yes';
            } else if (NUMERIC_COLS.has(dbCol)) {
                const n = parseFloat(rawVal);
                record[dbCol] = isNaN(n) ? null : n;
            } else {
                record[dbCol] = String(rawVal).trim();
            }
        }
        return record;
    });
}

function renderXLSXPreview(records) {
    const cols  = Object.values(XLSX_COLUMN_MAP);
    const rows  = records.slice(0, 3);
    const thead = `<thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>`;
    const tbody = rows.map(r => `<tr>${cols.map(c => `<td>${r[c] ?? ''}</td>`).join('')}</tr>`).join('');
    document.getElementById('xlsxPreviewTable').innerHTML = thead + `<tbody>${tbody}</tbody>`;
}

function populateConfirmCard(records, fileName) {
    document.getElementById('confirmFileName').textContent = fileName;
    document.getElementById('confirmRowCount').textContent = records.length.toLocaleString();
    document.getElementById('confirmColCount').textContent = Object.keys(XLSX_COLUMN_MAP).length;

    const times = records.map(r => r.gps_utc).filter(Boolean);
    document.getElementById('confirmTimeRange').textContent =
        times.length >= 2 ? `${times[0]} → ${times[times.length - 1]}` : (times[0] || '—');

    const syncedCount = records.filter(r => r.gps_synced === true).length;
    document.getElementById('confirmGpsSynced').textContent = `${syncedCount} / ${records.length}`;

    const volts = records.map(r => r.battery_voltage_v).filter(v => v !== null);
    if (volts.length > 0) {
        const avg = volts.reduce((a, b) => a + b, 0) / volts.length;
        document.getElementById('confirmAvgVolt').textContent = avg.toFixed(3) + ' V';
    }
}

// ── XLSX File Input ───────────────────────────────────────────────────────────
document.getElementById('xlsxFileInput').addEventListener('change', () => {
    const file = document.getElementById('xlsxFileInput').files[0];
    if (!file) return;

    document.getElementById('xlsxFileLabel').textContent = `📄 ${file.name}`;
    document.getElementById('xlsxStatus').innerHTML      = '';
    document.getElementById('xlsxConfirm').style.display = 'none';
    document.getElementById('xlsxResult').style.display  = 'none';
    parsedXlsxRecords = [];

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            parsedXlsxRecords = parseXLSX(e.target.result);
            populateConfirmCard(parsedXlsxRecords, file.name);
            renderXLSXPreview(parsedXlsxRecords);
            document.getElementById('xlsxConfirm').style.display = 'block';
            document.getElementById('xlsxStatus').innerHTML =
                `<span class="status-ok">✔ File parsed — ${parsedXlsxRecords.length.toLocaleString()} rows ready.</span>`;
        } catch (err) {
            document.getElementById('xlsxStatus').innerHTML =
                `<span class="status-err">❌ Error: ${err.message}</span>`;
            console.error(err);
        }
    };
    reader.readAsArrayBuffer(file);
});

// ── Upload XLSX to Supabase ───────────────────────────────────────────────────
document.getElementById('xlsxUploadBtn').addEventListener('click', async () => {
    if (parsedXlsxRecords.length === 0) return;
    const btn = document.getElementById('xlsxUploadBtn');
    btn.textContent = 'Uploading...';
    btn.disabled    = true;
    document.getElementById('xlsxStatus').innerHTML = '';

    try {
        const response = await fetch('/api/upload_xlsx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ records: parsedXlsxRecords })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Upload failed');

        const resultEl = document.getElementById('xlsxResult');
        resultEl.style.display = 'block';
        resultEl.className     = 'result-card result-success';
        document.getElementById('xlsxResultText').innerHTML =
            `✅ <strong>${result.inserted.toLocaleString()}</strong> telemetry row(s) successfully stored in Supabase.`;
        document.getElementById('xlsxConfirm').style.display = 'none';
    } catch (err) {
        const resultEl = document.getElementById('xlsxResult');
        resultEl.style.display = 'block';
        resultEl.className     = 'result-card result-error';
        document.getElementById('xlsxResultText').innerHTML = `❌ Upload failed: ${err.message}`;
        console.error(err);
    } finally {
        btn.textContent = '⬆ Upload to Database';
        btn.disabled    = false;
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// VIEW FLIGHT — Charter plots
// ═══════════════════════════════════════════════════════════════════════════

// Track chart instances so we can destroy before re-creating
const chartInstances = {};

const CHART_CONFIGS = [
    { canvasId: 'chartBattTemp',   field: 'battery_temp_c', label: 'Battery Temp',  color: '#f97316', unit: '°C'  },
    { canvasId: 'chartPMVolt',     field: 'pm_voltage_v',   label: 'PM Voltage',    color: '#3b82f6', unit: 'V'   },
    { canvasId: 'chartPMPower',    field: 'pm_power_w',     label: 'PM Power',      color: '#8b5cf6', unit: 'W'   },
    { canvasId: 'chartPMCurrent',  field: 'pm_current_a',   label: 'PM Current',    color: '#10b981', unit: 'A'   },
];

// ── Load the list of available flights into the <select> ─────────────────────
async function loadFlightList() {
    const select = document.getElementById('flightSelect');
    const status = document.getElementById('flightStatus');
    select.innerHTML = '<option value="">Loading…</option>';
    select.disabled  = true;

    try {
        const res  = await fetch('/api/list_flights');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load flights');

        if (data.length === 0) {
            select.innerHTML = '<option value="">No flights uploaded yet</option>';
            return;
        }

        select.innerHTML = '<option value="">— Select a flight —</option>' +
            data.map((f, i) => {
                const dt = new Date(f.uploaded_at).toLocaleString();
                return `<option value="${f.uploaded_at}">Flight ${i + 1} — ${dt} (${f.row_count.toLocaleString()} rows)</option>`;
            }).join('');
        select.disabled = false;
    } catch (err) {
        status.innerHTML = `<span class="status-err">❌ ${err.message}</span>`;
        console.error(err);
    }
}

// ── Fetch telemetry for selected flight and render charts ─────────────────────
document.getElementById('loadFlightBtn').addEventListener('click', async () => {
    const uploadedAt = document.getElementById('flightSelect').value;
    const status     = document.getElementById('flightStatus');
    const btn        = document.getElementById('loadFlightBtn');

    if (!uploadedAt) {
        status.innerHTML = '<span class="status-err">Please select a flight first.</span>';
        return;
    }

    status.innerHTML = '<span class="status-ok">Loading telemetry…</span>';
    btn.disabled     = true;
    btn.textContent  = 'Loading…';
    document.getElementById('chartsGrid').style.display = 'none';

    try {
        const res  = await fetch(`/api/get_flight?uploaded_at=${encodeURIComponent(uploadedAt)}`);
        const rows = await res.json();
        if (!res.ok) throw new Error(rows.error || 'Failed to fetch flight data');

        if (rows.length === 0) {
            status.innerHTML = '<span class="status-err">No data found for this flight.</span>';
            return;
        }

        // Build time labels — use rtc_utc, fall back to row index
        const labels = rows.map(r => r.rtc_utc ? new Date(r.rtc_utc) : null);

        // Render each chart
        CHART_CONFIGS.forEach(({ canvasId, field, label, color, unit }) => {
            const values = rows.map(r => r[field]);
            renderChart(canvasId, labels, values, label, color, unit);
        });

        document.getElementById('chartsGrid').style.display = 'grid';
        status.innerHTML = `<span class="status-ok">✔ Loaded ${rows.length.toLocaleString()} rows.</span>`;
    } catch (err) {
        status.innerHTML = `<span class="status-err">❌ ${err.message}</span>`;
        console.error(err);
    } finally {
        btn.disabled    = false;
        btn.textContent = 'Load Flight';
    }
});

// ── Build / replace a single Chart.js chart ───────────────────────────────────
function renderChart(canvasId, labels, values, label, color, unit) {
    // Destroy previous instance if it exists
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const ctx = document.getElementById(canvasId).getContext('2d');

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: `${label} (${unit})`,
                data: values,
                borderColor: color,
                backgroundColor: color + '22',
                borderWidth: 1.5,
                pointRadius: 0,
                tension: 0.2,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            animation: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.parsed.y !== null ? ctx.parsed.y.toFixed(3) : '—'} ${unit}`
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: { tooltipFormat: 'HH:mm:ss', displayFormats: { second: 'HH:mm:ss', minute: 'HH:mm' } },
                    title: { display: true, text: 'RTC UTC', font: { size: 11 } },
                    ticks: { maxTicksLimit: 8, font: { size: 10 } },
                    grid: { color: '#f3f4f6' }
                },
                y: {
                    title: { display: true, text: `${label} (${unit})`, font: { size: 11 } },
                    ticks: { font: { size: 10 } },
                    grid: { color: '#f3f4f6' }
                }
            }
        }
    });
}