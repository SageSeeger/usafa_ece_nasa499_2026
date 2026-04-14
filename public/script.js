// ── Elements ──────────────────────────────────────────────────────────────────
const xlsxFileInput  = document.getElementById('xlsxFileInput');
const xlsxFileLabel  = document.getElementById('xlsxFileLabel');
const xlsxStatus     = document.getElementById('xlsxStatus');
const xlsxConfirm    = document.getElementById('xlsxConfirm');
const xlsxUploadBtn  = document.getElementById('xlsxUploadBtn');
const xlsxResult     = document.getElementById('xlsxResult');
const xlsxResultText = document.getElementById('xlsxResultText');

// ── Column Mapping: XLSX header → Supabase column name ────────────────────────
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
    const sheetName = workbook.SheetNames[0];
    const sheet     = workbook.Sheets[sheetName];
    const rawRows   = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false });

    if (rawRows.length === 0) throw new Error('The XLSX file appears to be empty.');

    return rawRows.map((row) => {
        const record = {};

        for (const [xlsxHeader, dbCol] of Object.entries(XLSX_COLUMN_MAP)) {
            // Try exact key first, then trimmed key match
            let rawVal = row[xlsxHeader];
            if (rawVal === undefined) {
                const matchedKey = Object.keys(row).find(k => k.trim() === xlsxHeader.trim());
                rawVal = matchedKey !== undefined ? row[matchedKey] : null;
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

// ── Render preview table (first 3 rows) ──────────────────────────────────────
function renderXLSXPreview(records) {
    const previewRows = records.slice(0, 3);
    const cols  = Object.values(XLSX_COLUMN_MAP);
    const thead = `<thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>`;
    const rows  = previewRows.map(r =>
        `<tr>${cols.map(c => `<td>${r[c] ?? ''}</td>`).join('')}</tr>`
    ).join('');
    document.getElementById('xlsxPreviewTable').innerHTML = thead + `<tbody>${rows}</tbody>`;
}

// ── Populate confirmation card ────────────────────────────────────────────────
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

// ── File input handler ────────────────────────────────────────────────────────
xlsxFileInput.addEventListener('change', () => {
    const file = xlsxFileInput.files[0];
    if (!file) return;

    xlsxFileLabel.textContent   = `📄 ${file.name}`;
    xlsxStatus.innerHTML        = '';
    xlsxConfirm.style.display   = 'none';
    xlsxResult.style.display    = 'none';
    parsedXlsxRecords           = [];

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            parsedXlsxRecords = parseXLSX(e.target.result);
            populateConfirmCard(parsedXlsxRecords, file.name);
            renderXLSXPreview(parsedXlsxRecords);
            xlsxConfirm.style.display = 'block';
            xlsxStatus.innerHTML =
                `<span class="status-ok">✔ File parsed — ${parsedXlsxRecords.length.toLocaleString()} rows ready.</span>`;
        } catch (err) {
            xlsxStatus.innerHTML = `<span class="status-err">❌ Error: ${err.message}</span>`;
            console.error(err);
        }
    };
    reader.readAsArrayBuffer(file);
});

// ── Upload to Supabase via /api/upload_xlsx ───────────────────────────────────
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