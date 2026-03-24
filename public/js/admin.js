document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');
    const authSection = document.getElementById('auth-section');
    const dashSection = document.getElementById('dashboard-section');
    const logoutBtn = document.getElementById('logout-btn');
    const loginStatus = document.getElementById('login-status');
    const feedbacksTable = document.querySelector('#feedbacks-table tbody');
    const contactsTable = document.querySelector('#contacts-table tbody');
    const statFeedback = document.getElementById('stat-feedback');
    const statContact = document.getElementById('stat-contact');
    const autofillBtn = document.getElementById('autofill-btn');

    if (autofillBtn) {
        autofillBtn.addEventListener('click', () => {
            document.getElementById('username').value = 'admin';
            document.getElementById('password').value = 'admin123';
            // Optional visual feedback on the button
            autofillBtn.innerHTML = 'Credentials Loaded! <i class="fas fa-check" style="margin-left:5px;"></i>';
            autofillBtn.style.background = '#e8f5e9';
            autofillBtn.style.color = '#2e7d32';
            setTimeout(() => {
                autofillBtn.innerHTML = 'Auto-fill Demo Credentials <i class="fas fa-magic" style="margin-left:5px;"></i>';
                autofillBtn.style.background = '#f1f4f9';
                autofillBtn.style.color = 'var(--secondary-color)';
            }, 2000);
        });
    }

    // Check if logged in
    const checkAuth = () => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            authSection.style.display = 'none';
            dashSection.style.display = 'block';
            fetchDashboardData(token);
        } else {
            authSection.style.display = 'flex';
            dashSection.style.display = 'none';
        }
    };

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const btn = loginForm.querySelector('button');

            btn.disabled = true;
            btn.innerHTML = 'Verifying... <i class="fas fa-spinner fa-spin" style="margin-left:8px;"></i>';

            try {
                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();

                if (response.ok && data.success) {
                    localStorage.setItem('adminToken', data.token);
                    loginStatus.style.color = '#28a745';
                    loginStatus.textContent = 'Access Granted!';
                    setTimeout(() => {
                        checkAuth();
                    }, 500);
                } else {
                    loginStatus.style.color = '#dc3545';
                    loginStatus.textContent = data.message || 'Invalid Secure Credentials';
                }
            } catch (error) {
                loginStatus.style.color = '#dc3545';
                loginStatus.textContent = 'Server response error. Try again.';
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Secure Login <i class="fas fa-lock" style="margin-left:8px;"></i>';
                setTimeout(() => loginStatus.textContent = '', 3000);
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('adminToken');
            checkAuth();
        });
    }

    const fetchDashboardData = async (token) => {
        try {
            // Fetch Feedbacks
            const fRes = await fetch('/api/admin/feedbacks', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // Fetch Contacts
            const cRes = await fetch('/api/admin/contacts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (fRes.ok && cRes.ok) {
                const feedbacks = await fRes.json();
                const contacts = await cRes.json();
                
                if (statFeedback) statFeedback.textContent = feedbacks.length;
                if (statContact) statContact.textContent = contacts.length;

                renderFeedbacks(feedbacks);
                renderContacts(contacts);
            } else {
                if (fRes.status === 401 || cRes.status === 401) {
                    localStorage.removeItem('adminToken');
                    checkAuth();
                    alert("Admin session expired. Please relogin.");
                }
            }
        } catch (error) {
            console.error("Error fetching admin data", error);
        }
    };

    const renderFeedbacks = (feedbacks) => {
        if (!feedbacks || feedbacks.length === 0) {
            feedbacksTable.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 30px;">No feedback generated yet.</td></tr>';
            return;
        }

        // Sort by id descending
        feedbacks.sort((a,b) => b.id - a.id);

        feedbacksTable.innerHTML = feedbacks.map(fb => `
            <tr>
                <td style="color:var(--primary-color); font-weight:600;">Recipe #${fb.recipeId}</td>
                <td style="font-weight:600;">${fb.user}</td>
                <td style="color:var(--light-text); font-size:1.05rem;">&quot;${fb.comment}&quot;</td>
                <td style="color:#888; font-size:0.9rem;">${new Date(fb.date).toLocaleString()}</td>
            </tr>
        `).join('');
    };

    const renderContacts = (contacts) => {
        if (!contacts || contacts.length === 0) {
            contactsTable.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 30px;">No contact queries pending.</td></tr>';
            return;
        }

        contacts.sort((a,b) => b.id - a.id);

        contactsTable.innerHTML = contacts.map(c => `
            <tr>
                <td style="font-weight:600;">${c.name}</td>
                <td><a href="mailto:${c.email}" style="color:var(--primary-color); text-decoration:none; font-weight:600;">${c.email}</a></td>
                <td style="color:var(--light-text); font-size:1.05rem;">${c.message}</td>
                <td style="color:#888; font-size:0.9rem;">${new Date(c.date).toLocaleString()}</td>
            </tr>
        `).join('');
    };

    // Initialize check
    checkAuth();
});
