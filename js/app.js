

let allIssues = [];
let currentFilter = 'all';
let currentSearch = '';


const loginPage = document.getElementById('login-page');
const appPage = document.getElementById('app-page');
const loginError = document.getElementById('login-error');

const issuesGrid = document.getElementById('issues-grid');
const issueCountSpan = document.getElementById('issue-count');
const searchInput = document.getElementById('search-input');
const loader = document.getElementById('loader');
const emptyState = document.getElementById('empty-state');


const tabAll = document.getElementById('tab-all');
const tabOpen = document.getElementById('tab-open');
const tabClosed = document.getElementById('tab-closed');


const issueModal = document.getElementById('issue-modal');
const modalTitle = document.getElementById('modal-title');
const modalStatus = document.getElementById('modal-status');
const modalAuthor = document.getElementById('modal-author');
const modalDate = document.getElementById('modal-date');
const modalDescription = document.getElementById('modal-description');
const modalPriority = document.getElementById('modal-priority');
const modalLabel = document.getElementById('modal-label');



document.addEventListener('DOMContentLoaded', () => {
   const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        showApp();
    } else {
        showLogin();
    }
});


function handleLogin() {
    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value.trim();

    if (usernameInput === 'admin' && passwordInput === 'admin123') {
        sessionStorage.setItem('isLoggedIn', 'true');
        loginError.classList.add('hidden');
        showApp();
    } else {
        loginError.classList.remove('hidden');
    }
}

function logout() {
    sessionStorage.removeItem('isLoggedIn');
    showLogin();
    allIssues = [];
    currentFilter = 'all';
    currentSearch = '';
    searchInput.value = '';
    renderIssues([]);
    switchTab('all');
}

function showLogin() {
    loginPage.classList.remove('hidden');
    appPage.classList.add('hidden');
}

function showApp() {
    loginPage.classList.add('hidden');
    appPage.classList.remove('hidden');
    fetchIssues();
}

async function fetchIssues() {
    showLoader();
    try {
        const response = await fetch('https://phi-lab-server.vercel.app/api/v1/lab/issues');
        if (!response.ok) throw new Error('Failed to fetch issues');

        const jsonResponse = await response.json();
        allIssues = jsonResponse.data || [];
        applyFiltersAndRender();
    } catch (error) {
        console.error('Error fetching data:', error);
        issuesGrid.innerHTML = `<div class="col-span-1 sm:col-span-2 lg:col-span-4 text-center text-red-500 font-bold py-10">
            Error loading issues. Please try again later.
        </div>`;
    } finally {
        hideLoader();
    }
}

async function handleSearch() {
    const query = searchInput.value.trim();
    currentFilter = 'all';
    updateTabVisuals();

    if (!query) {
        currentSearch = '';
        currentFilter = 'all';
        fetchIssues(); 
        return;
    }

    currentSearch = query;
    showLoader();

    try {
        const response = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
        const jsonResponse = await response.json();
        allIssues = jsonResponse.data || [];
        applyFiltersAndRender();
    } catch (error) {
        console.error('Search error:', error);
    } finally {
        hideLoader();
    }
}


function switchTab(tabName) {
    if (currentSearch) {
        currentSearch = '';
        searchInput.value = '';
       fetchIssues().then(() => {
            currentFilter = tabName;
            updateTabVisuals();
            applyFiltersAndRender();
        });
        return;
    }

    currentFilter = tabName;
    updateTabVisuals();
    applyFiltersAndRender();
}

function updateTabVisuals() {
    [tabAll, tabOpen, tabClosed].forEach(tab => {
        tab.className = 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 px-8 py-2.5 rounded font-bold text-sm transition';
    });

    let activeTab;
    if (currentFilter === 'all') activeTab = tabAll;
    if (currentFilter === 'open') activeTab = tabOpen;
    if (currentFilter === 'closed') activeTab = tabClosed;

    activeTab.className = 'bg-[#7a00ff] text-white px-8 py-2.5 rounded border border-[#7a00ff] font-bold text-sm transition';
}

function applyFiltersAndRender() {
    let filtered = allIssues;

    if (currentFilter !== 'all') {
        filtered = allIssues.filter(issue => issue.status && issue.status.toLowerCase() === currentFilter);
    }

    renderIssues(filtered);
}

function renderIssues(issues) {
    issueCountSpan.textContent = issues.length;
    issuesGrid.innerHTML = '';

    if (issues.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        issues.forEach(issue => {
            const card = createIssueCard(issue);
            issuesGrid.appendChild(card);
        });
    }
}

function createIssueCard(issue) {
    const div = document.createElement('div');
    const isClosed = issue.status && issue.status.toLowerCase() === 'closed';
    const borderColorClass = isClosed ? 'border-t-[#aa00ff]' : 'border-t-[#00d084]';
    const statusIconSrc = isClosed ? 'assets/Closed- Status .png' : 'assets/Open-Status.png';

    let priorityStr = (issue.priority || 'normal').toLowerCase();
    let priorityEl = '';
    if (priorityStr === 'high') {
        priorityEl = `<span class="bg-[#ffe8e8] text-[#ff0000] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">High</span>`;
    } else if (priorityStr === 'medium') {
        priorityEl = `<span class="bg-[#fff3c4] text-[#d9aa00] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Medium</span>`;
    } else {
        priorityEl = `<span class="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">${priorityStr}</span>`;
    }


    const labelsRaw = issue.labels && Array.isArray(issue.labels) ? issue.labels :
        (issue.label ? [issue.label] : []);

    let labelsHTML = labelsRaw.map(lbl => {
        let name = lbl.toLowerCase();
        if (name === 'bug') {
            return `<span class="inline-flex items-center gap-1 border border-[#ffb3b3] bg-[#fff0f0] text-[#ff4d4d] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"><i class="fa-solid fa-bug text-[10px]"></i> ${lbl}</span>`;
        } else if (name === 'help wanted') {
            return `<span class="inline-flex items-center gap-1 border border-[#ffe099] bg-[#fff9e6] text-[#e6a800] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"><i class="fa-solid fa-plus-circle text-[10px]"></i> ${lbl}</span>`;
        } else if (name === 'enhancement') {
            return `<span class="inline-flex items-center gap-1 border border-[#99f2cd] bg-[#e6fff2] text-[#00c073] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"><i class="fa-solid fa-magic text-[10px]"></i> ${lbl}</span>`;
        } else {
            return `<span class="inline-flex items-center gap-1 border border-gray-200 bg-gray-50 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"><i class="fa-solid fa-tag text-[10px]"></i> ${lbl}</span>`;
        }
    }).join('');

    div.className = `bg-white rounded-xl shadow-sm border border-gray-100 border-t-[3px] p-6 issue-card cursor-pointer flex flex-col h-full ${borderColorClass}`;

    div.onclick = () => openModal(issue);

    div.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <img class="w-5 h-5 object-contain" src="${statusIconSrc}" alt="${issue.status || 'unknown'}">
            ${priorityEl}
        </div>
        <h3 class="font-bold text-[16px] text-gray-900 leading-snug mb-2" title="${issue.title || 'No Title'}">${issue.title || 'No Title'}</h3>
        <p class="text-[#8e95a3] text-[13px] mb-4 line-clamp-2 leading-relaxed flex-grow">${issue.description || 'No description available.'}</p>
        
        <div class="flex flex-wrap items-center gap-2 mb-6">
            ${labelsHTML}
        </div>
        
        <div class="border-t border-gray-100 pt-4 mt-auto">
            <p class="text-[#8e95a3] text-[12px] font-medium block">#${issue.id || 'N/A'} by ${issue.author || 'Unknown'}</p>
            <p class="text-[#8e95a3] text-[12px] font-medium block mt-1">${formatDate(issue.createdAt || issue.date)}</p>
        </div>
    `;

    return div;
}

async function openModal(issueLight) {
    showLoader();
    try {
        const id = issueLight.id || issueLight._id; 
        let issue = issueLight;

        if (id) {
            const response = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
            if (response.ok) {
                const fullData = await response.json();
               if (fullData && fullData.data) {
                    issue = fullData.data;
                } else if (fullData && typeof fullData === 'object' && !Array.isArray(fullData)) {
                    issue = fullData;
                }
            }
        }

        const isClosed = issue.status && issue.status.toLowerCase() === 'closed';
        const statusIconSrc = isClosed ? 'assets/Closed- Status .png' : 'assets/Open-Status.png';
        const statusIcon = `<img src="${statusIconSrc}" class="w-4 h-4 object-contain mr-1" alt="status">`;

        modalTitle.textContent = issue.title || 'No Title';
        modalAuthor.textContent = issue.author || 'Unknown';
        modalDate.textContent = formatDate(issue.createdAt || issue.date);
        modalDescription.textContent = issue.description || 'No description provided.';
        modalPriority.textContent = issue.priority || 'Normal';
        modalLabel.textContent = issue.labels ? issue.labels.join(', ') : (issue.label || 'None');

        modalStatus.innerHTML = `${statusIcon} <span class="capitalize">${issue.status || 'unknown'}</span>`;
       modalStatus.className = `px-3 py-1 rounded-full font-semibold border flex items-center gap-1 bg-gray-100 text-gray-700 border-gray-200`;

        issueModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } catch (e) {
        console.error("Failed to load full issue details", e);
        alert("Failed to load full issue details.");
    } finally {
        hideLoader();
    }
}

function closeModal() {
    issueModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}


issueModal.addEventListener('click', (e) => {
    if (e.target === issueModal) {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !issueModal.classList.contains('hidden')) {
        closeModal();
    }
});


function showLoader() {
    loader.classList.remove('hidden');
    issuesGrid.classList.add('hidden');
    emptyState.classList.add('hidden');
}

function hideLoader() {
    loader.classList.add('hidden');
    issuesGrid.classList.remove('hidden');
}

function formatDate(dateString) {
    if (!dateString) return 'Unknown Date';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; 

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}
