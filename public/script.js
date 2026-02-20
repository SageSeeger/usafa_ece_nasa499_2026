// Elements
const loadBtn = document.getElementById('loadBtn');
const submitBtn = document.getElementById('submitBtn');
const userList = document.getElementById('userList');
const formStatus = document.getElementById('formStatus');

const viewTabBtn = document.getElementById('viewTabBtn');
const addTabBtn = document.getElementById('addTabBtn');
const viewSection = document.getElementById('viewSection');
const addSection = document.getElementById('addSection');

const pickUserBtns = [
    document.getElementById('pickUserBtn1'),
    document.getElementById('pickUserBtn2'),
    document.getElementById('pickUserBtn3'),
    document.getElementById('pickUserBtn4'),
    document.getElementById('pickUserBtn5'),
    document.getElementById('pickUserBtn6')
];

let selectedIndex = 0;

// Tab Management
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

// Flight Selection logic
function updateSelection(index) {
    selectedIndex = index;
    pickUserBtns.forEach((btn, i) => {
        if (i === index) btn.classList.add('selected');
        else btn.classList.remove('selected');
    });
}

pickUserBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => updateSelection(i));
});

// Initialize first button
updateSelection(0);

// Fetch Flight Record
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
                    <tr><th>Time</th><td>${f.current_time ? new Date(f.current_time).toLocaleString() : '—'}</td></tr>
                    <tr><th>Power</th><td>${f.power_watts} W</td></tr>
                    <tr><th>Current</th><td>${f.current_amps} A</td></tr>
                    <tr><th>Battery Temp</th><td>${f.batteryTemp} °C</td></tr>
                    <tr><th>Ambient Temp</th><td>${f.ambiantTemp} °C</td></tr>
                    <tr><th>Air Speed</th><td>${f.airSpeed} m/s</td></tr>
                    <tr><th>Wind Direction</th><td>${f.windDirection_rad} rad</td></tr>
                    <tr><th>Wind Speed</th><td>${f.windSpeed_mps} m/s</td></tr>
                </table>
            </div>`;
        } else {
            userList.innerHTML = 'No flight record found at this index.';
        }

    } catch (err) {
        console.error(err);
        userList.innerHTML = `<div style="color: red;">Error: ${err.message}</div>`;
    } finally {
        loadBtn.textContent = 'Load Flight Record';
        loadBtn.disabled = false;
    }
});

// Add Flight Record
submitBtn.addEventListener('click', async () => {
    const flight_number = parseInt(document.getElementById('newFlightNumber').value);
    const drone_type = document.getElementById('newDroneType').value;
    const current_time = document.getElementById('newCurrentTime').value || null;
    const power_watts = parseFloat(document.getElementById('newPowerWatts').value) || null;
    const current_amps = parseFloat(document.getElementById('newCurrentAmps').value) || null;
    const batteryTemp = parseFloat(document.getElementById('newBatteryTemp').value) || null;
    const ambiantTemp = parseFloat(document.getElementById('newAmbiantTemp').value) || null;
    const airSpeed = parseFloat(document.getElementById('newAirSpeed').value) || null;
    const windDirection_rad = parseFloat(document.getElementById('newWindDirection').value) || null;
    const windSpeed_mps = parseFloat(document.getElementById('newWindSpeed').value) || null;

    if (!flight_number || !drone_type) {
        formStatus.innerHTML = '<span style="color: red;">Flight Number and Drone Type are required.</span>';
        return;
    }

    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('/api/add_user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                flight_number,
                drone_type,
                current_time,
                power_watts,
                current_amps,
                batteryTemp,
                ambiantTemp,
                airSpeed,
                windDirection_rad,
                windSpeed_mps
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to save flight record');
        }

        formStatus.innerHTML = '<span style="color: green;">Flight record saved successfully!</span>';
        // Clear form
        ['newFlightNumber', 'newDroneType', 'newCurrentTime', 'newPowerWatts',
            'newCurrentAmps', 'newBatteryTemp', 'newAmbiantTemp', 'newAirSpeed',
            'newWindDirection', 'newWindSpeed'].forEach(id => {
                document.getElementById(id).value = '';
            });

        setTimeout(() => {
            switchTab('view');
            formStatus.innerHTML = '';
        }, 2000);

    } catch (err) {
        formStatus.innerHTML = `<span style="color: red;">Error: ${err.message}</span>`;
    } finally {
        submitBtn.textContent = 'Save Flight Record';
        submitBtn.disabled = false;
    }
});