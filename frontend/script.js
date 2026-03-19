const API_BASE = "http://localhost:8080/api";

const state = {
    applications: [],
    filter: 'All',
    searchQuery: '',
    currentPage: 1,
    itemsPerPage: 5
};

const app = {
    init() {
        auth.checkAuth();
        ui.setupEventListeners();
    },
    navigate(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(`view-${viewId}`).classList.add('active');
    },
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

const api = {
    async request(endpoint, method = 'GET', body = null) {
        const headers = { "Content-Type": "application/json" };
        const token = localStorage.getItem("jwt");
        if (token) headers["Authorization"] = "Bearer " + token;

        const res = await fetch(API_BASE + endpoint, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || "Request failed");
        }
        return res.json();
    }
};

const auth = {
    checkAuth() {
        const token = localStorage.getItem('jwt');
        if (token) { app.navigate('dashboard'); dashboard.init(); }
        else { app.navigate('login'); }
    },

    async login(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            const btn = e.target.querySelector('button');
            btn.textContent = 'Signing in...'; btn.disabled = true;
            const res = await api.request('/auth/login', 'POST', { email, password });
            localStorage.setItem('jwt', res.token);
            localStorage.setItem('userName', res.name);
            app.showToast('Login successful!');
            document.getElementById('form-login').reset();
            app.navigate('dashboard'); dashboard.init();
        } catch (error) {
            app.showToast('Login failed', 'error');
        } finally {
            const btn = document.querySelector('#form-login button');
            btn.textContent = 'Sign In'; btn.disabled = false;
        }
    },

    async register(e) {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        try {
            const btn = e.target.querySelector('button');
            btn.textContent = 'Registering...'; btn.disabled = true;
            await api.request('/auth/register', 'POST', { name, email, password });
            app.showToast('Registration successful! Please login.');
            app.navigate('login');
            document.getElementById('form-register').reset();
        } catch (error) {
            app.showToast('Registration failed', 'error');
        } finally {
            const btn = document.querySelector('#form-register button');
            btn.textContent = 'Register'; btn.disabled = false;
        }
    },

    logout() {
        localStorage.removeItem('jwt');
        localStorage.removeItem('userName');
        app.navigate('login');
        app.showToast('Logged out successfully');
    }
};

const dashboard = {
    async init() {
        const name = localStorage.getItem('userName');
        document.getElementById('user-greeting').textContent = name ? `Welcome, ${name}!` : 'Welcome!';
        await this.fetchApplications();
    },

    async fetchApplications() {
        try {
            state.applications = await api.request('/applications', 'GET');
            this.render();
        } catch (error) {
            console.error("FETCH ERROR:", error);
            document.getElementById('table-body').innerHTML =
                '<tr><td colspan="6">Failed to load data</td></tr>';
        }
    },

    async saveApplication(e) {
        e.preventDefault();
        const id = document.getElementById('app-id').value;
        const payload = {
            company: document.getElementById('app-company').value,
            role: document.getElementById('app-role').value,
            status: document.getElementById('app-status').value,
            appliedDate: document.getElementById('app-date').value,
            url: document.getElementById('app-url').value,
            followupDate: document.getElementById('app-followup').value,
            notes: document.getElementById('app-notes').value
        };
        try {
            const btn = e.target.querySelector('button[type="submit"]');
            btn.disabled = true; btn.textContent = 'Saving...';
            if (id) {
                await api.request('/applications/' + id, 'PUT', payload);
                app.showToast('Application updated');
            } else {
                await api.request('/applications', 'POST', payload);
                app.showToast('Application added');
            }
            ui.closeModal('modal-app');
            await this.fetchApplications();
        } catch (error) {
            console.error("SAVE ERROR:", error);
            app.showToast('Failed to save application', 'error');
        } finally {
            const btn = document.querySelector('#form-app button[type="submit"]');
            if (btn) { btn.disabled = false; btn.textContent = 'Save Application'; }
        }
    },

    async deleteApplication() {
        const id = document.getElementById('delete-app-id').value;
        try {
            await api.request('/applications/' + id, 'DELETE');
            app.showToast('Application deleted');
            ui.closeModal('modal-delete');
            await this.fetchApplications();
        } catch (error) {
            console.error("DELETE ERROR:", error);
            app.showToast('Failed to delete application', 'error');
        }
    },

    render() { this.renderCards(); this.renderTable(); this.renderReminders(); },

    renderCards() {
        const apps = state.applications;
        document.getElementById('stat-total').textContent = apps.length;
        document.getElementById('stat-applied').textContent = apps.filter(a => a.status === 'Applied').length;
        document.getElementById('stat-oa').textContent = apps.filter(a => a.status === 'OA').length;
        document.getElementById('stat-interview').textContent = apps.filter(a =>
            ['Technical Round 1','Technical Round 2','Technical Round 3','HR Interview','Group Discussion','Presentation Round'].includes(a.status)).length;
        document.getElementById('stat-offer').textContent = apps.filter(a => a.status === 'Offer').length;
    },

    renderTable() {
        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';

        let filtered = state.filter === 'All'
            ? state.applications
            : state.applications.filter(a => a.status === state.filter);

        if (state.searchQuery.trim() !== '') {
            const query = state.searchQuery.toLowerCase();
            filtered = filtered.filter(a =>
                a.company.toLowerCase().includes(query) || a.role.toLowerCase().includes(query));
        }

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><p>No applications found.</p></div></td></tr>';
            document.getElementById('pagination-wrapper').innerHTML = '';
            return;
        }

        filtered.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / state.itemsPerPage);
        if (state.currentPage > totalPages) state.currentPage = totalPages;
        if (state.currentPage < 1) state.currentPage = 1;

        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        const endIndex = startIndex + state.itemsPerPage;
        const paginatedApps = filtered.slice(startIndex, endIndex);

        const iconView  = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
        const iconEdit  = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>';
        const iconTrash = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>';

        paginatedApps.forEach(appData => {
            const tr = document.createElement('tr');
            tr.innerHTML =
                '<td style="font-weight:600">' + appData.company + '</td>' +
                '<td style="color:var(--text-muted)">' + appData.role + '</td>' +
                '<td><span class="badge ' + ui.getBadgeClass(appData.status) + '">' + appData.status + '</span></td>' +
                '<td>' + ui.formatDate(appData.appliedDate) + '</td>' +
                '<td>' + (appData.followupDate ? ui.formatDate(appData.followupDate) : '-') + '</td>' +
                '<td class="actions-cell">' +
                    '<button class="btn-icon" onclick="ui.openDetailsModal(' + appData.id + ')" title="View Details">' + iconView + '</button>' +
                    '<button class="btn-icon" onclick="ui.openAppModal(' + appData.id + ')" title="Edit">' + iconEdit + '</button>' +
                    '<button class="btn-icon" onclick="ui.openDeleteModal(' + appData.id + ')" title="Delete" style="color:var(--danger)">' + iconTrash + '</button>' +
                '</td>';
            tbody.appendChild(tr);
        });

        this.renderPagination(totalItems, startIndex, Math.min(endIndex, totalItems));
    },

    renderPagination(totalItems, start, end) {
        const wrapper = document.getElementById('pagination-wrapper');
        const totalPages = Math.ceil(totalItems / state.itemsPerPage);
        if (totalItems <= state.itemsPerPage) { wrapper.innerHTML = ''; return; }

        let buttonsHtml = '<button class="page-btn" ' + (state.currentPage===1?'disabled':'') + ' onclick="dashboard.changePage(' + (state.currentPage-1) + ')">Prev</button>';
        for (let i = 1; i <= totalPages; i++) {
            buttonsHtml += '<button class="page-btn ' + (state.currentPage===i?'active':'') + '" onclick="dashboard.changePage(' + i + ')">' + i + '</button>';
        }
        buttonsHtml += '<button class="page-btn" ' + (state.currentPage===totalPages?'disabled':'') + ' onclick="dashboard.changePage(' + (state.currentPage+1) + ')">Next</button>';

        wrapper.innerHTML = '<div class="pagination-container"><div class="pagination-info">Showing <strong>' + (start+1) + '</strong> to <strong>' + end + '</strong> of <strong>' + totalItems + '</strong> results</div><div class="pagination-controls">' + buttonsHtml + '</div></div>';
    },

    changePage(newPage) { state.currentPage = newPage; this.renderTable(); },

    renderReminders() {
        const list = document.getElementById('reminders-list');
        list.innerHTML = '';
        const today = new Date(); today.setHours(0,0,0,0);
        const nextWeek = new Date(today); nextWeek.setDate(today.getDate()+7);

        const upcoming = state.applications.filter(a => {
            if (!a.followupDate || a.status === 'Rejected' || a.status === 'Ghosted') return false;
            const date = new Date(a.followupDate);
            return date >= today && date <= nextWeek;
        }).sort((a,b) => new Date(a.followupDate) - new Date(b.followupDate));

        if (upcoming.length === 0) {
            list.innerHTML = '<div class="text-muted" style="text-align:center;padding:2.5rem 0;font-size:0.875rem;border:1px dashed var(--border-color);border-radius:var(--radius-sm);">No upcoming follow-ups! Relax.</div>';
            return;
        }

        const calIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';

        upcoming.forEach(appData => {
            const date = new Date(appData.followupDate);
            const diffDays = Math.ceil((date - today) / (1000*60*60*24));
            const isUrgent = diffDays <= 2;
            list.innerHTML +=
                '<div class="reminder-item ' + (isUrgent?'urgent':'') + '">' +
                    '<div class="reminder-company"><span>' + appData.company + ' <span style="font-weight:400;color:var(--text-muted);margin-left:4px">' + appData.role + '</span></span>' + (isUrgent?'<span class="reminder-urgent-badge">Urgent</span>':'') + '</div>' +
                    '<div class="reminder-date">' + calIcon + ' ' + ui.formatDate(appData.followupDate) + ' <span style="margin-left:auto;font-weight:500">' + (diffDays===0?'Today':'in '+diffDays+'d') + '</span></div>' +
                '</div>';
        });
    }
};

const ui = {
    setupEventListeners() {
        document.getElementById('form-login').addEventListener('submit', auth.login);
        document.getElementById('form-register').addEventListener('submit', auth.register);
        document.getElementById('form-app').addEventListener('submit', dashboard.saveApplication.bind(dashboard));
        document.getElementById('filter-status').addEventListener('change', (e) => {
            state.filter = e.target.value; state.currentPage = 1; dashboard.renderTable();
        });
        document.getElementById('search-input').addEventListener('input', (e) => {
            state.searchQuery = e.target.value; state.currentPage = 1; dashboard.renderTable();
        });
    },

    getBadgeClass(status) {
        const s = status.toLowerCase();
        if (s.includes('applied')) return 'applied';
        if (s.includes('oa')) return 'oa';
        if (s.includes('offer')) return 'offer';
        if (s.includes('reject')) return 'rejected';
        if (s.includes('ghost')) return 'ghosted';
        return 'interview';
    },

    openModal(modalId)  { document.getElementById(modalId).classList.add('active'); },
    closeModal(modalId) { document.getElementById(modalId).classList.remove('active'); },

    openAppModal(id = null) {
        const form = document.getElementById('form-app');
        form.reset();
        document.getElementById('app-id').value = '';

        if (id) {
            document.getElementById('modal-app-title').textContent = 'Edit Application';
            const appData = state.applications.find(a => a.id === Number(id));
            if (appData) {
                document.getElementById('app-id').value = appData.id;
                document.getElementById('app-company').value = appData.company;
                document.getElementById('app-role').value = appData.role;
                document.getElementById('app-status').value = appData.status;
                document.getElementById('app-date').value = appData.appliedDate;
                document.getElementById('app-url').value = appData.url || '';
                document.getElementById('app-followup').value = appData.followupDate || '';
                document.getElementById('app-notes').value = appData.notes || '';
            }
        } else {
            document.getElementById('modal-app-title').textContent = 'Add Application';
            document.getElementById('app-date').valueAsDate = new Date();
        }
        this.openModal('modal-app');
    },

    openDetailsModal(id) {
        const appData = state.applications.find(a => a.id === Number(id));
        if (!appData) return;

        document.getElementById('detail-company').textContent = appData.company;
        document.getElementById('detail-role').textContent = appData.role;
        document.getElementById('detail-status').innerHTML = '<span class="badge ' + this.getBadgeClass(appData.status) + '">' + appData.status + '</span>';
        document.getElementById('detail-date').textContent = this.formatDate(appData.appliedDate);
        document.getElementById('detail-followup').textContent = appData.followupDate ? this.formatDate(appData.followupDate) : '-';
        const urlEl = document.getElementById('detail-url');
        if (appData.url) { urlEl.href = appData.url; urlEl.style.display = 'inline'; }
        else { urlEl.style.display = 'none'; }
        document.getElementById('detail-notes').textContent = appData.notes || 'No notes added.';
        this.openModal('modal-details');
    },

    openDeleteModal(id) {
        document.getElementById('delete-app-id').value = id;
        this.openModal('modal-delete');
    },

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
};

document.addEventListener('DOMContentLoaded', () => { app.init(); });