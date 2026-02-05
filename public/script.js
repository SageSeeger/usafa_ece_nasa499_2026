const loadBtn = document.getElementById('loadBtn');
const userList = document.getElementById('userList');

loadBtn.addEventListener('click', async () => {
    loadBtn.textContent = 'Loading...';
    loadBtn.disabled = true;

    try {
        // Fetch from our local Vercel API endpoint
        const response = await fetch('/api/users');

        if (!response.ok) throw new Error('Failed to fetch data');

        const users = await response.json();

        // Clear list
        userList.innerHTML = '';

        // Render users
        users.forEach(user => {
            const card = document.createElement('div');
            card.className = 'user-card';
            card.innerHTML = `
                <span class="user-name">${user.name}</span>
                <span class="user-email">${user.email}</span>
            `;
            userList.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        userList.innerHTML = `<div style="color: red;">Error: ${err.message}</div>`;
    } finally {
        loadBtn.textContent = 'Load Users';
        loadBtn.disabled = false;
    }
});
