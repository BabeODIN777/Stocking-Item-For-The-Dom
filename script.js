// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initTabs();
    initAddItem();
    initInventory();
    initSettings();
    initModal();
    loadCompanies();
    loadInventory();
    loadSettings();
    updateStats();
    updateAppDate();
});

// Update app date
function updateAppDate() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    document.getElementById('app-date').textContent = now.toLocaleDateString('km-KH', options);
}

// Tab Navigation
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show active tab pane
            tabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            
            // Refresh data when switching to inventory tab
            if (tabId === 'inventory') {
                loadInventory();
                loadCompanyFilter();
                loadCategoryFilter();
            }
        });
    });
}

// Initialize Modal
function initModal() {
    const modal = document.getElementById('company-modal');
    const closeButtons = document.querySelectorAll('.modal-close');
    const addCompanyBtn = document.getElementById('add-new-company');
    const addCompanyBtn2 = document.getElementById('add-company-btn');
    
    // Open modal for adding new company
    addCompanyBtn.addEventListener('click', () => openCompanyModal());
    addCompanyBtn2.addEventListener('click', () => openCompanyModal());
    
    // Close modal
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('active');
            resetCompanyForm();
        });
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            resetCompanyForm();
        }
    });
    
    // Handle company form submission
    document.getElementById('company-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveCompany();
    });
}

// Open company modal
function openCompanyModal(companyId = null) {
    const modal = document.getElementById('company-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('company-form');
    
    if (companyId) {
        // Edit mode
        const companies = JSON.parse(localStorage.getItem('companies')) || [];
        const company = companies.find(c => c.id === companyId);
        
        if (company) {
            title.textContent = 'កែប្រែក្រុមហ៊ុន';
            document.getElementById('modal-company-id').value = company.id;
            document.getElementById('modal-company-name').value = company.name;
            document.getElementById('modal-company-code').value = company.code || '';
            document.getElementById('modal-company-contact').value = company.contact || '';
            document.getElementById('modal-company-phone').value = company.phone || '';
            document.getElementById('modal-company-email').value = company.email || '';
            document.getElementById('modal-company-notes').value = company.notes || '';
        }
    } else {
        // Add mode
        title.textContent = 'បន្ថែមក្រុមហ៊ុនថ្មី';
        resetCompanyForm();
    }
    
    modal.classList.add('active');
}

// Reset company form
function resetCompanyForm() {
    const form = document.getElementById('company-form');
    form.reset();
    document.getElementById('modal-company-id').value = '';
    document.getElementById('modal-title').textContent = 'បន្ថែមក្រុមហ៊ុនថ្មី';
}

// Save company
function saveCompany() {
    const companyId = document.getElementById('modal-company-id').value;
    const companyName = document.getElementById('modal-company-name').value.trim();
    
    if (!companyName) {
        alert('សូមបញ្ចូលឈ្មោះក្រុមហ៊ុន!');
        return;
    }
    
    const company = {
        id: companyId || Date.now(),
        name: companyName,
        code: document.getElementById('modal-company-code').value.trim(),
        contact: document.getElementById('modal-company-contact').value.trim(),
        phone: document.getElementById('modal-company-phone').value.trim(),
        email: document.getElementById('modal-company-email').value.trim(),
        notes: document.getElementById('modal-company-notes').value.trim(),
        createdAt: companyId ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    let companies = JSON.parse(localStorage.getItem('companies')) || [];
    
    if (companyId) {
        // Update existing company
        const index = companies.findIndex(c => c.id === parseInt(companyId));
        if (index !== -1) {
            companies[index] = { ...companies[index], ...company };
        }
    } else {
        // Add new company
        companies.push(company);
    }
    
    localStorage.setItem('companies', JSON.stringify(companies));
    
    // Close modal and reset form
    document.getElementById('company-modal').classList.remove('active');
    resetCompanyForm();
    
    // Update UI
    loadCompanies();
    loadCompanyFilter();
    loadCompanySelect();
    
    alert(companyId ? 'ក្រុមហ៊ុនត្រូវបានកែប្រែដោយជោគជ័យ!' : 'ក្រុមហ៊ុនត្រូវបានបន្ថែមដោយជោគជ័យ!');
}

// Load companies for select dropdown
function loadCompanies() {
    const companies = JSON.parse(localStorage.getItem('companies')) || [];
    const companyListBody = document.getElementById('company-list-body');
    
    companyListBody.innerHTML = '';
    
    if (companies.length === 0) {
        companyListBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 30px; color: #6c757d;">
                    <i class="fas fa-building" style="font-size: 2.5rem; margin-bottom: 15px; display: block; opacity: 0.5;"></i>
                    មិនទាន់មានក្រុមហ៊ុនទេ។ សូមបន្ថែមក្រុមហ៊ុនថ្មី!
                </td>
            </tr>
        `;
        return;
    }
    
    // Get inventory to count items per company
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    
    companies.forEach((company, index) => {
        const itemCount = inventory.filter(item => item.company === company.name).length;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <strong>${company.name}</strong>
                ${company.code ? `<br><small class="text-muted">កូដ: ${company.code}</small>` : ''}
                ${company.contact ? `<br><small>ទំនាក់ទំនង: ${company.contact}</small>` : ''}
            </td>
            <td>${itemCount} ទំនិញ</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="openCompanyModal(${company.id})">
                        <i class="fas fa-edit"></i> កែប្រែ
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteCompany(${company.id})" ${itemCount > 0 ? 'disabled title="មិនអាចលុប ព្រោះមានទំនិញជាប់ទាក់ទង"' : ''}>
                        <i class="fas fa-trash"></i> លុប
                    </button>
                </div>
            </td>
        `;
        
        if (itemCount > 0) {
            row.querySelector('.delete-btn').classList.add('disabled');
        }
        
        companyListBody.appendChild(row);
    });
}

// Delete company
function deleteCompany(companyId) {
    if (!confirm('តើអ្នកពិតជាចង់លុបក្រុមហ៊ុននេះមែនឬទេ?')) return;
    
    let companies = JSON.parse(localStorage.getItem('companies')) || [];
    companies = companies.filter(c => c.id !== companyId);
    
    localStorage.setItem('companies', JSON.stringify(companies));
    loadCompanies();
    loadCompanyFilter();
    loadCompanySelect();
    
    alert('ក្រុមហ៊ុនត្រូវបានលុបដោយជោគជ័យ!');
}

// Load company select for add item form
function loadCompanySelect() {
    const companies = JSON.parse(localStorage.getItem('companies')) || [];
    const select = document.getElementById('item-company');
    
    // Save current value
    const currentValue = select.value;
    
    // Clear existing options except first one
    select.innerHTML = '<option value="">-- ជ្រើសរើសក្រុមហ៊ុន --</option>';
    
    companies.forEach(company => {
        const option = document.createElement('option');
        option.value = company.name;
        option.textContent = company.name + (company.code ? ` (${company.code})` : '');
        select.appendChild(option);
    });
    
    // Restore selected value if it still exists
    if (currentValue && companies.some(c => c.name === currentValue)) {
        select.value = currentValue;
    }
}

// Load company filter for inventory
function loadCompanyFilter() {
    const companies = JSON.parse(localStorage.getItem('companies')) || [];
    const select = document.getElementById('filter-company');
    
    // Save current value
    const currentValue = select.value;
    
    // Clear existing options except "All"
    select.innerHTML = '<option value="all">ទាំងអស់</option>';
    
    companies.forEach(company => {
        const option = document.createElement('option');
        option.value = company.name;
        option.textContent = company.name;
        select.appendChild(option);
    });
    
    // Restore selected value
    if (currentValue) {
        select.value = currentValue;
    }
}

// Load category filter for inventory
function loadCategoryFilter() {
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const select = document.getElementById('filter-category');
    
    // Get unique categories
    const categories = [...new Set(inventory.map(item => item.category).filter(Boolean))];
    
    // Save current value
    const currentValue = select.value;
    
    // Clear existing options except "All"
    select.innerHTML = '<option value="all">ទាំងអស់</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
    
    // Restore selected value
    if (currentValue) {
        select.value = currentValue;
    }
}

// Add Item Tab
function initAddItem() {
    const form = document.getElementById('add-item-form');
    const resetBtn = document.getElementById('reset-form');
    const dateInput = document.getElementById('item-date');
    
    // Load company select
    loadCompanySelect();
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const company = document.getElementById('item-company').value.trim();
        const itemName = document.getElementById('item-name').value.trim();
        const quantity = parseInt(document.getElementById('item-quantity').value);
        const price = parseFloat(document.getElementById('item-price').value) || 0;
        const date = document.getElementById('item-date').value;
        const category = document.getElementById('item-category').value.trim();
        const notes = document.getElementById('item-notes').value.trim();
        
        if (!company) {
            alert('សូមជ្រើសរើសក្រុមហ៊ុន!');
            return;
        }
        
        if (!itemName || isNaN(quantity) || quantity < 0) {
            alert('សូមបញ្ចូលឈ្មោះទំនិញ និងចំនួនដែលត្រឹមត្រូវ!');
            return;
        }
        
        const item = {
            id: Date.now(),
            company: company,
            name: itemName,
            quantity: quantity,
            price: price,
            date: date,
            category: category,
            notes: notes,
            addedDate: new Date().toISOString()
        };
        
        // Get existing inventory
        const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        inventory.push(item);
        
        // Save to localStorage
        localStorage.setItem('inventory', JSON.stringify(inventory));
        
        // Update UI
        addRecentItem(item);
        updateStats();
        loadCategoryFilter();
        
        // Reset form
        form.reset();
        dateInput.value = today;
        
        alert('ទំនិញត្រូវបានបន្ថែមដោយជោគជ័យ!');
        
        // Switch to inventory tab
        document.querySelector('[data-tab="inventory"]').click();
    });
    
    resetBtn.addEventListener('click', () => {
        form.reset();
        dateInput.value = today;
    });
}

// Inventory Management
function initInventory() {
    // Export to Excel
    document.getElementById('export-excel').addEventListener('click', exportToExcel);
    
    // Export to CSV
    document.getElementById('export-csv').addEventListener('click', exportToCSV);
    
    // Print inventory
    document.getElementById('print-inventory').addEventListener('click', printInventory);
    
    // Delete all items
    document.getElementById('delete-all').addEventListener('click', () => {
        if (confirm('តើអ្នកពិតជាចង់លុបទំនិញទាំងអស់មែនឬទេ?')) {
            localStorage.removeItem('inventory');
            loadInventory();
            updateStats();
            loadCategoryFilter();
            alert('ទំនិញទាំងអស់ត្រូវបានលុបដោយជោគជ័យ!');
        }
    });
    
    // Clear filters
    document.getElementById('clear-filters').addEventListener('click', () => {
        document.getElementById('filter-company').value = 'all';
        document.getElementById('filter-category').value = 'all';
        document.getElementById('filter-stock').value = 'all';
        document.getElementById('search-items').value = '';
        document.getElementById('sort-by').value = 'date-desc';
        loadInventory();
    });
    
    // Initialize filters event listeners
    initFilters();
    
    // Initialize table sorting
    initTableSorting();
}

// Initialize filters
function initFilters() {
    const filterCompany = document.getElementById('filter-company');
    const filterCategory = document.getElementById('filter-category');
    const filterStock = document.getElementById('filter-stock');
    const sortBy = document.getElementById('sort-by');
    const searchItems = document.getElementById('search-items');
    
    // Add event listeners for filters
    [filterCompany, filterCategory, filterStock, sortBy].forEach(filter => {
        filter.addEventListener('change', () => {
            loadInventory();
        });
    });
    
    // Add debounced search
    let searchTimeout;
    searchItems.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            loadInventory();
        }, 300);
    });
}

// Initialize table sorting
function initTableSorting() {
    const headers = document.querySelectorAll('#inventory-table th[data-sort]');
    
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const sortKey = header.getAttribute('data-sort');
            const currentSort = document.getElementById('sort-by').value;
            let newSort;
            
            // Determine new sort direction
            if (currentSort.startsWith(sortKey)) {
                newSort = currentSort.endsWith('-asc') ? `${sortKey}-desc` : `${sortKey}-asc`;
            } else {
                newSort = `${sortKey}-asc`;
            }
            
            document.getElementById('sort-by').value = newSort;
            loadInventory();
        });
    });
}

// Load inventory from localStorage with filters
function loadInventory() {
    let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const tbody = document.getElementById('inventory-list');
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    const lowStockThreshold = settings.lowStockThreshold || 5;
    
    // Apply filters
    const filterCompany = document.getElementById('filter-company').value;
    const filterCategory = document.getElementById('filter-category').value;
    const filterStock = document.getElementById('filter-stock').value;
    const searchTerm = document.getElementById('search-items').value.toLowerCase();
    const sortBy = document.getElementById('sort-by').value;
    
    // Filter by company
    if (filterCompany !== 'all') {
        inventory = inventory.filter(item => item.company === filterCompany);
    }
    
    // Filter by category
    if (filterCategory !== 'all') {
        inventory = inventory.filter(item => item.category === filterCategory);
    }
    
    // Filter by stock status
    if (filterStock !== 'all') {
        switch(filterStock) {
            case 'in-stock':
                inventory = inventory.filter(item => item.quantity > lowStockThreshold);
                break;
            case 'out-of-stock':
                inventory = inventory.filter(item => item.quantity === 0);
                break;
            case 'low-stock':
                inventory = inventory.filter(item => item.quantity > 0 && item.quantity <= lowStockThreshold);
                break;
        }
    }
    
    // Search filter
    if (searchTerm) {
        inventory = inventory.filter(item => 
            item.name.toLowerCase().includes(searchTerm) ||
            item.company.toLowerCase().includes(searchTerm) ||
            (item.category && item.category.toLowerCase().includes(searchTerm)) ||
            (item.notes && item.notes.toLowerCase().includes(searchTerm))
        );
    }
    
    // Sort inventory
    inventory.sort((a, b) => {
        switch(sortBy) {
            case 'date-desc':
                return new Date(b.date) - new Date(a.date);
            case 'date-asc':
                return new Date(a.date) - new Date(b.date);
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'quantity-asc':
                return a.quantity - b.quantity;
            case 'quantity-desc':
                return b.quantity - a.quantity;
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            case 'company-asc':
                return (a.company || '').localeCompare(b.company || '');
            case 'company-desc':
                return (b.company || '').localeCompare(a.company || '');
            default:
                return new Date(b.date) - new Date(a.date);
        }
    });
    
    // Clear table
    tbody.innerHTML = '';
    
    if (inventory.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 50px; color: #6c757d;">
                    <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 20px; display: block; opacity: 0.5;"></i>
                    <h3 style="margin-bottom: 10px;">មិនមានទំនិញតាមលក្ខខណ្ឌដែលបានជ្រើសរើស</h3>
                    <p>សូមផ្លាស់ប្តូរតម្រង ឬបន្ថែមទំនិញថ្មី។</p>
                </td>
            </tr>
        `;
        updateShowingCount(0, 0);
        return;
    }
    
    // Get currency from settings
    const currency = settings.currency || '$';
    
    // Populate table
    inventory.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // Add class for stock status
        if (item.quantity === 0) {
            row.classList.add('out-of-stock');
        } else if (item.quantity <= lowStockThreshold) {
            row.classList.add('low-stock');
        }
        
        // Format date
        const formattedDate = formatDate(item.date, settings.dateFormat);
        
        // Format price with currency
        const formattedPrice = formatPrice(item.price, currency);
        
        row.innerHTML = `
            <td><strong>${item.company}</strong></td>
            <td>
                <div style="font-weight: 600; color: #1e3c72;">${item.name}</div>
                ${item.notes ? `<small style="color: #6c757d; font-size: 0.85rem;">${item.notes}</small>` : ''}
            </td>
            <td>${item.category || '-'}</td>
            <td>
                <span class="quantity-badge">${item.quantity}</span>
                ${item.quantity === 0 ? '<span class="stock-status out-of-stock-status">អស់ស្តុក</span>' : 
                  item.quantity <= lowStockThreshold ? '<span class="stock-status low-stock-status">ស្តុកទាប</span>' : 
                  '<span class="stock-status in-stock-status">មានស្តុក</span>'}
            </td>
            <td style="font-weight: 600; color: #28a745;">${formattedPrice}</td>
            <td>${formattedDate}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editItem(${item.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteItem(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Update showing count
    updateShowingCount(inventory.length, JSON.parse(localStorage.getItem('inventory') || '[]').length);
    
    // Update company summary
    updateCompanySummary();
}

// Update showing count
function updateShowingCount(showing, total) {
    document.getElementById('showing-count').textContent = showing;
    document.getElementById('total-count').textContent = total;
}

// Update company summary
function updateCompanySummary() {
    const filterCompany = document.getElementById('filter-company').value;
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    const currency = settings.currency || '$';
    
    let summary = '';
    
    if (filterCompany === 'all') {
        // Show summary for all companies
        const companies = JSON.parse(localStorage.getItem('companies')) || [];
        const companyCount = companies.length;
        const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        summary = `${companyCount} ក្រុមហ៊ុន • តម្លៃសរុប: ${formatPrice(totalValue, currency)}`;
    } else {
        // Show summary for selected company
        const companyItems = inventory.filter(item => item.company === filterCompany);
        const itemCount = companyItems.length;
        const totalValue = companyItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        summary = `${itemCount} ទំនិញ • តម្លៃសរុប: ${formatPrice(totalValue, currency)}`;
    }
    
    document.getElementById('company-summary').textContent = summary;
}

// Format price with currency
function formatPrice(price, currency) {
    const formatter = new Intl.NumberFormat('km-KH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    switch(currency) {
        case '$':
            return `$${formatter.format(price)}`;
        case '៛':
            return `${formatter.format(price)}៛`;
        case '€':
            return `€${formatter.format(price)}`;
        case '¥':
            return `¥${formatter.format(price)}`;
        default:
            return `$${formatter.format(price)}`;
    }
}

// Settings Management
function initSettings() {
    // Company settings form
    document.getElementById('company-settings-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveCompanySettings();
    });
    
    // General settings form
    document.getElementById('general-settings-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveGeneralSettings();
    });
    
    // Reset settings
    document.getElementById('reset-settings').addEventListener('click', () => {
        if (confirm('តើអ្នកពិតជាចង់កំណត់ការកំណត់ទាំងអស់ឡើងវិញមែនឬទេ?')) {
            const defaultSettings = {
                companyName: '',
                address: '',
                phone: '',
                email: '',
                dateFormat: 'dd/mm/yyyy',
                currency: '$',
                lowStockThreshold: 5,
                itemsPerPage: 20
            };
            
            localStorage.setItem('settings', JSON.stringify(defaultSettings));
            loadSettings();
            alert('ការកំណត់ត្រូវបានកំណត់ឡើងវិញ!');
        }
    });
    
    // Search company in settings
    document.getElementById('search-company').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#company-list tbody tr');
        
        rows.forEach(row => {
            const companyName = row.cells[1].textContent.toLowerCase();
            row.style.display = companyName.includes(searchTerm) ? '' : 'none';
        });
    });
}

// Save company settings
function saveCompanySettings() {
    const companyName = document.getElementById('company-name').value.trim();
    
    if (!companyName) {
        alert('សូមបញ្ចូលឈ្មោះក្រុមហ៊ុនសំខាន់!');
        return;
    }
    
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    
    settings.companyName = companyName;
    settings.address = document.getElementById('company-address').value.trim();
    settings.phone = document.getElementById('company-phone').value.trim();
    settings.email = document.getElementById('company-email').value.trim();
    
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Update company name display
    document.getElementById('company-name-display').textContent = companyName;
    
    alert('ការកំណត់ក្រុមហ៊ុនត្រូវបានរក្សាទុក!');
}

// Save general settings
function saveGeneralSettings() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    
    settings.dateFormat = document.getElementById('date-format').value;
    settings.currency = document.getElementById('currency').value;
    settings.lowStockThreshold = parseInt(document.getElementById('low-stock-threshold').value) || 5;
    settings.itemsPerPage = parseInt(document.getElementById('items-per-page').value) || 20;
    
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Reload inventory to apply new settings
    loadInventory();
    updateStats();
    
    alert('ការកំណត់ទូទៅត្រូវបានរក្សាទុក!');
}

// Load settings from localStorage
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    
    // Company settings
    document.getElementById('company-name').value = settings.companyName || '';
    document.getElementById('company-address').value = settings.address || '';
    document.getElementById('company-phone').value = settings.phone || '';
    document.getElementById('company-email').value = settings.email || '';
    
    // General settings
    document.getElementById('date-format').value = settings.dateFormat || 'dd/mm/yyyy';
    document.getElementById('currency').value = settings.currency || '$';
    document.getElementById('low-stock-threshold').value = settings.lowStockThreshold || 5;
    document.getElementById('items-per-page').value = settings.itemsPerPage || 20;
    
    // Update company name display
    document.getElementById('company-name-display').textContent = settings.companyName || 'ក្រុមហ៊ុនរបស់អ្នក';
}

// Update statistics
function updateStats() {
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const companies = JSON.parse(localStorage.getItem('companies')) || [];
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    const lowStockThreshold = settings.lowStockThreshold || 5;
    const currency = settings.currency || '$';
    
    const totalItems = inventory.length;
    const outOfStock = inventory.filter(item => item.quantity === 0).length;
    const totalCompanies = companies.length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('out-of-stock').textContent = outOfStock;
    document.getElementById('total-companies').textContent = totalCompanies;
    document.getElementById('total-value').textContent = formatPrice(totalValue, currency);
    
    // Update recent items
    updateRecentItems();
    
    // Update data stats
    const inventorySize = JSON.stringify(inventory).length;
    const companiesSize = JSON.stringify(companies).length;
    const totalSize = ((inventorySize + companiesSize) / 1024).toFixed(2);
    document.getElementById('data-stats').innerHTML = `
        កាលបរិច្ឆេទ: <span id="app-date"></span><br>
        ទំហំទិន្នន័យ: ${totalSize} KB
    `;
    updateAppDate();
}

// Add recent item display
function addRecentItem(item) {
    const recentItemsDiv = document.getElementById('recent-items');
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    const formattedDate = formatDate(item.date, settings.dateFormat);
    const currency = settings.currency || '$';
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'recent-item';
    itemDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <h4>${item.name}</h4>
                <p style="color: #1e3c72; font-weight: 600;">${item.company}</p>
            </div>
            <span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.8rem;">
                ${item.quantity} គ្រឿង
            </span>
        </div>
        ${item.category ? `<p><i class="fas fa-tag"></i> ${item.category}</p>` : ''}
        <p><i class="fas fa-money-bill-wave"></i> ${formatPrice(item.price, currency)}</p>
        <p><i class="fas fa-calendar"></i> ${formattedDate}</p>
        <small>បានបន្ថែម: ${new Date(item.addedDate).toLocaleString('km-KH')}</small>
    `;
    
    recentItemsDiv.insertBefore(itemDiv, recentItemsDiv.firstChild);
    
    // Keep only last 6 items
    const items = recentItemsDiv.querySelectorAll('.recent-item');
    if (items.length > 6) {
        recentItemsDiv.removeChild(items[items.length - 1]);
    }
}

function updateRecentItems() {
    const recentItemsDiv = document.getElementById('recent-items');
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    const currency = settings.currency || '$';
    
    recentItemsDiv.innerHTML = '';
    
    // Show last 6 items
    const recentItems = inventory.slice(-6).reverse();
    
    if (recentItems.length === 0) {
        recentItemsDiv.innerHTML = `
            <div style="text-align: center; color: #6c757d; padding: 20px;">
                <i class="fas fa-box-open" style="font-size: 2rem; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
                <p>មិនទាន់មានទំនិញថ្មីៗ</p>
            </div>
        `;
        return;
    }
    
    recentItems.forEach(item => {
        const formattedDate = formatDate(item.date, settings.dateFormat);
        const itemDiv = document.createElement('div');
        itemDiv.className = 'recent-item';
        itemDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h4>${item.name}</h4>
                    <p style="color: #1e3c72; font-weight: 600;">${item.company}</p>
                </div>
                <span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.8rem;">
                    ${item.quantity} គ្រឿង
                </span>
            </div>
            ${item.category ? `<p><i class="fas fa-tag"></i> ${item.category}</p>` : ''}
            <p><i class="fas fa-money-bill-wave"></i> ${formatPrice(item.price, currency)}</p>
            <p><i class="fas fa-calendar"></i> ${formattedDate}</p>
            <small>បានបន្ថែម: ${new Date(item.addedDate).toLocaleString('km-KH')}</small>
        `;
        recentItemsDiv.appendChild(itemDiv);
    });
}

// Format date based on settings
function formatDate(dateString, format) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    switch(format) {
        case 'dd/mm/yyyy':
            return `${day}/${month}/${year}`;
        case 'mm/dd/yyyy':
            return `${month}/${day}/${year}`;
        case 'yyyy-mm-dd':
            return `${year}-${month}-${day}`;
        default:
            return `${day}/${month}/${year}`;
    }
}

// Delete item
function deleteItem(itemId) {
    if (!confirm('តើអ្នកពិតជាចង់លុបទំនិញនេះមែនឬទេ?')) return;
    
    let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    inventory = inventory.filter(item => item.id !== itemId);
    
    localStorage.setItem('inventory', JSON.stringify(inventory));
    loadInventory();
    updateStats();
    loadCategoryFilter();
}

// Edit item
function editItem(itemId) {
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const item = inventory.find(i => i.id === itemId);
    
    if (!item) return;
    
    // Switch to add item tab
    document.querySelector('[data-tab="add-item"]').click();
    
    // Load companies first
    loadCompanySelect();
    
    // Fill form with item data
    setTimeout(() => {
        document.getElementById('item-company').value = item.company;
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-quantity').value = item.quantity;
        document.getElementById('item-price').value = item.price;
        document.getElementById('item-date').value = item.date;
        document.getElementById('item-category').value = item.category || '';
        document.getElementById('item-notes').value = item.notes || '';
        
        // Update form to edit mode
        const form = document.getElementById('add-item-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Change submit button text
        submitBtn.innerHTML = '<i class="fas fa-edit"></i> កែប្រែទំនិញ';
        
        // Remove previous edit listener if exists
        form.removeEventListener('submit', handleEditSubmit);
        
        // Add edit listener
        function handleEditSubmit(e) {
            e.preventDefault();
            
            item.company = document.getElementById('item-company').value.trim();
            item.name = document.getElementById('item-name').value.trim();
            item.quantity = parseInt(document.getElementById('item-quantity').value);
            item.price = parseFloat(document.getElementById('item-price').value) || 0;
            item.date = document.getElementById('item-date').value;
            item.category = document.getElementById('item-category').value.trim();
            item.notes = document.getElementById('item-notes').value.trim();
            
            localStorage.setItem('inventory', JSON.stringify(inventory));
            
            // Reset form
            form.reset();
            document.getElementById('item-date').value = new Date().toISOString().split('T')[0];
            submitBtn.innerHTML = '<i class="fas fa-save"></i> រក្សាទុកទំនិញ';
            
            // Remove edit listener
            form.removeEventListener('submit', handleEditSubmit);
            
            loadInventory();
            updateStats();
            loadCategoryFilter();
            alert('ទំនិញត្រូវបានកែប្រែដោយជោគជ័យ!');
            
            // Switch to inventory tab
            document.querySelector('[data-tab="inventory"]').click();
        }
        
        form.addEventListener('submit', handleEditSubmit);
    }, 100);
}

// Export to Excel
function exportToExcel() {
    let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    const companies = JSON.parse(localStorage.getItem('companies')) || [];
    
    if (inventory.length === 0) {
        alert('មិនទាន់មានទិន្នន័យទំនិញដើម្បីនាំចេញ!');
        return;
    }
    
    // Apply current filters
    const filterCompany = document.getElementById('filter-company').value;
    const filterCategory = document.getElementById('filter-category').value;
    const filterStock = document.getElementById('filter-stock').value;
    const searchTerm = document.getElementById('search-items').value.toLowerCase();
    const lowStockThreshold = settings.lowStockThreshold || 5;
    
    if (filterCompany !== 'all') {
        inventory = inventory.filter(item => item.company === filterCompany);
    }
    
    if (filterCategory !== 'all') {
        inventory = inventory.filter(item => item.category === filterCategory);
    }
    
    if (filterStock !== 'all') {
        switch(filterStock) {
            case 'in-stock':
                inventory = inventory.filter(item => item.quantity > lowStockThreshold);
                break;
            case 'out-of-stock':
                inventory = inventory.filter(item => item.quantity === 0);
                break;
            case 'low-stock':
                inventory = inventory.filter(item => item.quantity > 0 && item.quantity <= lowStockThreshold);
                break;
        }
    }
    
    if (searchTerm) {
        inventory = inventory.filter(item => 
            item.name.toLowerCase().includes(searchTerm) ||
            item.company.toLowerCase().includes(searchTerm) ||
            (item.category && item.category.toLowerCase().includes(searchTerm))
        );
    }
    
    // Get currency
    const currency = settings.currency || '$';
    
    // Prepare data for Excel
    const excelData = [
        // Header
        ['ល.រ', 'ក្រុមហ៊ុន', 'ទំនិញ', 'ប្រភេទ', 'ចំនួន', 'តម្លៃ', 'កាលបរិច្ឆេទ', 'កំណត់ចំណាំ', 'ស្ថានភាពស្តុក'],
        // Data rows
        ...inventory.map((item, index) => {
            let stockStatus = 'មានស្តុក';
            if (item.quantity === 0) {
                stockStatus = 'អស់ស្តុក';
            } else if (item.quantity <= lowStockThreshold) {
                stockStatus = 'ស្តុកទាប';
            }
            
            return [
                index + 1,
                item.company,
                item.name,
                item.category || '-',
                item.quantity,
                formatPrice(item.price, currency),
                formatDate(item.date, settings.dateFormat),
                item.notes || '-',
                stockStatus
            ];
        })
    ];
    
    // Add summary row
    const totalItems = inventory.length;
    const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    excelData.push(['']); // Empty row
    excelData.push(['សរុប:', '', '', '', totalQuantity, formatPrice(totalValue, currency), '', '', `${totalItems} ទំនិញ`]);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // Set column widths
    const wscols = [
        {wch: 5},   // No.
        {wch: 20},  // Company
        {wch: 30},  // Item name
        {wch: 15},  // Category
        {wch: 10},  // Quantity
        {wch: 12},  // Price
        {wch: 15},  // Date
        {wch: 25},  // Notes
        {wch: 12}   // Stock status
    ];
    ws['!cols'] = wscols;
    
    // Add company info sheet
    if (companies.length > 0) {
        const companyData = [
            ['ល.រ', 'ឈ្មោះក្រុមហ៊ុន', 'កូដ', 'ទំនាក់ទំនង', 'លេខទូរស័ព្ទ', 'អ៊ីមែល', 'កំណត់ចំណាំ'],
            ...companies.map((company, index) => [
                index + 1,
                company.name,
                company.code || '-',
                company.contact || '-',
                company.phone || '-',
                company.email || '-',
                company.notes || '-'
            ])
        ];
        
        const wsCompanies = XLSX.utils.aoa_to_sheet(companyData);
        wsCompanies['!cols'] = [
            {wch: 5},   // No.
            {wch: 25},  // Company name
            {wch: 10},  // Code
            {wch: 20},  // Contact
            {wch: 15},  // Phone
            {wch: 25},  // Email
            {wch: 30}   // Notes
        ];
        
        XLSX.utils.book_append_sheet(wb, wsCompanies, 'ក្រុមហ៊ុន');
    }
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'ទំនិញ');
    
    // Generate filename
    const companyName = settings.companyName ? settings.companyName.replace(/\s+/g, '_') : 'Inventory';
    const date = new Date().toISOString().split('T')[0];
    const filename = `${companyName}_ទំនិញ_${date}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, filename);
}

// Export to CSV
function exportToCSV() {
    let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    
    if (inventory.length === 0) {
        alert('មិនទាន់មានទិន្នន័យទំនិញដើម្បីនាំចេញ!');
        return;
    }
    
    // Get currency
    const currency = settings.currency || '$';
    
    // Prepare CSV content
    const headers = ['ល.រ', 'ក្រុមហ៊ុន', 'ទំនិញ', 'ប្រភេទ', 'ចំនួន', 'តម្លៃ', 'កាលបរិច្ឆេទ', 'ស្ថានភាពស្តុក'];
    const rows = inventory.map((item, index) => {
        let stockStatus = 'មានស្តុក';
        if (item.quantity === 0) {
            stockStatus = 'អស់ស្តុក';
        } else if (item.quantity <= (settings.lowStockThreshold || 5)) {
            stockStatus = 'ស្តុកទាប';
        }
        
        return [
            index + 1,
            item.company,
            `"${item.name}"`,
            item.category || '-',
            item.quantity,
            formatPrice(item.price, currency),
            formatDate(item.date, settings.dateFormat),
            stockStatus
        ].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Create blob and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Print inventory
function printInventory() {
    let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    const companies = JSON.parse(localStorage.getItem('companies')) || [];
    
    // Apply current filters
    const filterCompany = document.getElementById('filter-company').value;
    const filterCategory = document.getElementById('filter-category').value;
    const filterStock = document.getElementById('filter-stock').value;
    const searchTerm = document.getElementById('search-items').value.toLowerCase();
    const lowStockThreshold = settings.lowStockThreshold || 5;
    
    if (filterCompany !== 'all') {
        inventory = inventory.filter(item => item.company === filterCompany);
    }
    
    if (filterCategory !== 'all') {
        inventory = inventory.filter(item => item.category === filterCategory);
    }
    
    if (filterStock !== 'all') {
        switch(filterStock) {
            case 'in-stock':
                inventory = inventory.filter(item => item.quantity > lowStockThreshold);
                break;
            case 'out-of-stock':
                inventory = inventory.filter(item => item.quantity === 0);
                break;
            case 'low-stock':
                inventory = inventory.filter(item => item.quantity > 0 && item.quantity <= lowStockThreshold);
                break;
        }
    }
    
    if (searchTerm) {
        inventory = inventory.filter(item => 
            item.name.toLowerCase().includes(searchTerm) ||
            item.company.toLowerCase().includes(searchTerm) ||
            (item.category && item.category.toLowerCase().includes(searchTerm))
        );
    }
    
    // Get currency
    const currency = settings.currency || '$';
    
    const printContent = document.getElementById('print-content');
    
    // Build printable HTML
    let html = `
        <style>
            @media print {
                @page {
                    margin: 0.5in;
                }
                body {
                    font-family: 'Khmer OS', 'Arial Unicode MS', Arial, sans-serif;
                    font-size: 12pt;
                    line-height: 1.5;
                }
                .print-header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px double #000;
                    padding-bottom: 20px;
                }
                .company-name {
                    font-size: 24pt;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #1e3c72;
                }
                .company-info {
                    font-size: 11pt;
                    color: #666;
                    margin-bottom: 5px;
                }
                .report-title {
                    font-size: 18pt;
                    margin: 25px 0;
                    text-align: center;
                    font-weight: bold;
                }
                .filter-info {
                    background: #f5f5f5;
                    padding: 10px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                    font-size: 10pt;
                }
                .inventory-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                }
                .inventory-table th {
                    background: #2c3e50;
                    color: white;
                    padding: 12px 8px;
                    text-align: left;
                    border: 1px solid #ddd;
                    font-weight: bold;
                }
                .inventory-table td {
                    padding: 10px 8px;
                    border: 1px solid #ddd;
                }
                .inventory-table tr:nth-child(even) {
                    background: #f9f9f9;
                }
                .quantity {
                    text-align: center;
                    font-weight: bold;
                }
                .price {
                    text-align: right;
                }
                .out-of-stock {
                    background: #ffeaea !important;
                    color: #d00;
                }
                .low-stock {
                    background: #fff3cd !important;
                }
                .summary {
                    margin-top: 30px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 5px;
                    font-size: 11pt;
                }
                .summary-item {
                    margin-bottom: 5px;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    font-size: 10pt;
                    color: #666;
                    border-top: 1px solid #ddd;
                    padding-top: 20px;
                }
                .page-break {
                    page-break-before: always;
                }
            }
        </style>
        <div class="print-header">
            <div class="company-name">${settings.companyName || 'ក្រុមហ៊ុន'}</div>
            <div class="company-info">${settings.address || ''}</div>
            <div class="company-info">ទូរស័ព្ទ: ${settings.phone || ''} ${settings.email ? '| អ៊ីមែល: ' + settings.email : ''}</div>
            <div class="company-info">កាលបរិច្ឆេទបោះពុម្ព: ${new Date().toLocaleDateString('km-KH')} ${new Date().toLocaleTimeString('km-KH')}</div>
        </div>
        <div class="report-title">បញ្ជីទំនិញក្នុងស្តុក</div>
    `;
    
    // Add filter info
    let filterInfo = [];
    if (filterCompany !== 'all') filterInfo.push(`ក្រុមហ៊ុន: ${filterCompany}`);
    if (filterCategory !== 'all') filterInfo.push(`ប្រភេទ: ${filterCategory}`);
    if (filterStock !== 'all') filterInfo.push(`ស្ថានភាពស្តុក: ${filterStock}`);
    if (searchTerm) filterInfo.push(`ការស្វែងរក: "${searchTerm}"`);
    
    if (filterInfo.length > 0) {
        html += `<div class="filter-info">ត្រងតាម: ${filterInfo.join(' | ')}</div>`;
    }
    
    if (inventory.length > 0) {
        // Calculate totals
        const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const outOfStockCount = inventory.filter(item => item.quantity === 0).length;
        const lowStockCount = inventory.filter(item => item.quantity > 0 && item.quantity <= lowStockThreshold).length;
        
        html += `
            <table class="inventory-table">
                <thead>
                    <tr>
                        <th>ល.រ</th>
                        <th>ក្រុមហ៊ុន</th>
                        <th>ទំនិញ</th>
                        <th>ប្រភេទ</th>
                        <th>ចំនួន</th>
                        <th>តម្លៃ</th>
                        <th>កាលបរិច្ឆេទ</th>
                        <th>ស្ថានភាព</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        inventory.forEach((item, index) => {
            let stockStatus = 'មានស្តុក';
            let rowClass = '';
            if (item.quantity === 0) {
                stockStatus = 'អស់ស្តុក';
                rowClass = 'out-of-stock';
            } else if (item.quantity <= lowStockThreshold) {
                stockStatus = 'ស្តុកទាប';
                rowClass = 'low-stock';
            }
            
            html += `
                <tr class="${rowClass}">
                    <td>${index + 1}</td>
                    <td>${item.company}</td>
                    <td>${item.name}</td>
                    <td>${item.category || '-'}</td>
                    <td class="quantity">${item.quantity}</td>
                    <td class="price">${formatPrice(item.price, currency)}</td>
                    <td>${formatDate(item.date, settings.dateFormat)}</td>
                    <td>${stockStatus}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
            <div class="summary">
                <div class="summary-item"><strong>សរុបទំនិញ:</strong> ${inventory.length} ទំនិញ</div>
                <div class="summary-item"><strong>សរុបចំនួន:</strong> ${totalQuantity} គ្រឿង</div>
                <div class="summary-item"><strong>តម្លៃសរុប:</strong> ${formatPrice(totalValue, currency)}</div>
                <div class="summary-item"><strong>អស់ស្តុក:</strong> ${outOfStockCount} ទំនិញ</div>
                <div class="summary-item"><strong>ស្តុកទាប:</strong> ${lowStockCount} ទំនិញ</div>
            </div>
        `;
    } else {
        html += '<div style="text-align: center; padding: 40px; color: #666; font-size: 14pt;">មិនមានទំនិញតាមលក្ខខណ្ឌដែលបានជ្រើសរើស</div>';
    }
    
    html += `
        <div class="footer">
            <p>បង្កើតដោយ: ប្រព័ន្ធគ្រប់គ្រងស្តុកទំនិញ - ជំនាន់ក្រុមហ៊ុន</p>
            <p>ទំព័រ 1 នៃ 1 | បានបង្កើតនៅ: ${new Date().toLocaleString('km-KH')}</p>
        </div>
    `;
    
    printContent.innerHTML = html;
    
    // Trigger print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>បោះពុម្ពបញ្ជីទំនិញ - ${settings.companyName || 'ក្រុមហ៊ុន'}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
            ${html}
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 100);
                }
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Add CSS for dynamic elements
const style = document.createElement('style');
style.textContent = `
    .quantity-badge {
        display: inline-block;
        padding: 4px 8px;
        background: #e9ecef;
        border-radius: 12px;
        font-weight: bold;
        min-width: 40px;
        text-align: center;
    }
    
    .stock-status {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 0.8rem;
        margin-left: 8px;
        font-weight: 600;
    }
    
    .out-of-stock-status {
        background: #ffeaea;
        color: #dc3545;
        border: 1px solid #f5c6cb;
    }
    
    .low-stock-status {
        background: #fff3cd;
        color: #856404;
        border: 1px solid #ffeaa7;
    }
    
    .in-stock-status {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    
    .text-muted {
        color: #6c757d !important;
    }
    
    .disabled {
        opacity: 0.5;
        cursor: not-allowed !important;
        pointer-events: none;
    }
    // Auto-backup feature
function setupAutoBackup() {
    // Backup every hour
    setInterval(createAutoBackup, 60 * 60 * 1000);
    
    // Backup when window closes
    window.addEventListener('beforeunload', function() {
        createAutoBackup();
    });
}

function createAutoBackup() {
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const companies = JSON.parse(localStorage.getItem('companies')) || [];
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    
    const backup = {
        timestamp: new Date().toISOString(),
        inventory: inventory,
        companies: companies,
        settings: settings
    };
    
    // Save last 5 backups
    let backups = JSON.parse(localStorage.getItem('backups') || '[]');
    backups.push(backup);
    
    // Keep only last 5 backups
    if (backups.length > 5) {
        backups = backups.slice(-5);
    }
    
    localStorage.setItem('backups', JSON.stringify(backups));
}

// Initialize auto-backup
setupAutoBackup();
`;
document.head.appendChild(style);