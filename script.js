// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initTabs();
    initAddItem();
    initInventory();
    initSettings();
    loadInventory();
    loadSettings();
    updateStats();
});

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
        });
    });
}

// Add Item Tab
function initAddItem() {
    const form = document.getElementById('add-item-form');
    const resetBtn = document.getElementById('reset-form');
    const dateInput = document.getElementById('item-date');
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const itemName = document.getElementById('item-name').value.trim();
        const quantity = parseInt(document.getElementById('item-quantity').value);
        const price = parseFloat(document.getElementById('item-price').value) || 0;
        const date = document.getElementById('item-date').value;
        
        if (!itemName || isNaN(quantity) || quantity < 0) {
            alert('សូមបញ្ចូលឈ្មោះទំនិញ និងចំនួនដែលត្រឹមត្រូវ!');
            return;
        }
        
        const item = {
            id: Date.now(),
            name: itemName,
            quantity: quantity,
            price: price,
            date: date,
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
    
    // Print inventory
    document.getElementById('print-inventory').addEventListener('click', printInventory);
    
    // Delete all items
    document.getElementById('delete-all').addEventListener('click', () => {
        if (confirm('តើអ្នកពិតជាចង់លុបទំនិញទាំងអស់មែនឬទេ?')) {
            localStorage.removeItem('inventory');
            loadInventory();
            updateStats();
            alert('ទំនិញទាំងអស់ត្រូវបានលុបដោយជោគជ័យ!');
        }
    });
    
    // Search functionality
    document.getElementById('search-items').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#inventory-table tbody tr');
        
        rows.forEach(row => {
            const itemName = row.cells[1].textContent.toLowerCase();
            row.style.display = itemName.includes(searchTerm) ? '' : 'none';
        });
    });
}

// Settings Management
function initSettings() {
    const form = document.getElementById('settings-form');
    const resetBtn = document.getElementById('reset-settings');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const settings = {
            companyName: document.getElementById('company-name-input').value,
            address: document.getElementById('company-address').value,
            phone: document.getElementById('company-phone').value,
            dateFormat: document.getElementById('date-format').value,
            lowStockThreshold: parseInt(document.getElementById('low-stock-threshold').value) || 5
        };
        
        localStorage.setItem('settings', JSON.stringify(settings));
        
        // Update company name in header
        document.getElementById('company-name').textContent = settings.companyName || 'ក្រុមហ៊ុនរបស់អ្នក';
        
        alert('ការកំណត់ត្រូវបានរក្សាទុក!');
    });
    
    resetBtn.addEventListener('click', () => {
        const defaultSettings = {
            companyName: '',
            address: '',
            phone: '',
            dateFormat: 'dd/mm/yyyy',
            lowStockThreshold: 5
        };
        
        localStorage.setItem('settings', JSON.stringify(defaultSettings));
        loadSettings();
        alert('ការកំណត់ត្រូវបានកំណត់ឡើងវិញ!');
    });
}

// Load inventory from localStorage
function loadInventory() {
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const tbody = document.getElementById('inventory-list');
    
    tbody.innerHTML = '';
    
    if (inventory.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #7f8c8d;">
                    <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
                    មិនទាន់មានទំនិញនៅក្នុងស្តុកទេ។
                </td>
            </tr>
        `;
        return;
    }
    
    // Get settings for formatting
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    
    inventory.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // Add class for out of stock items
        if (item.quantity === 0) {
            row.classList.add('out-of-stock');
        } else if (item.quantity <= (settings.lowStockThreshold || 5)) {
            row.classList.add('low-stock');
        }
        
        // Format date
        const formattedDate = formatDate(item.date, settings.dateFormat);
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.price.toFixed(2)}</td>
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
}

// Load settings from localStorage
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    
    document.getElementById('company-name-input').value = settings.companyName || '';
    document.getElementById('company-address').value = settings.address || '';
    document.getElementById('company-phone').value = settings.phone || '';
    document.getElementById('date-format').value = settings.dateFormat || 'dd/mm/yyyy';
    document.getElementById('low-stock-threshold').value = settings.lowStockThreshold || 5;
    
    // Update company name in header
    document.getElementById('company-name').textContent = settings.companyName || 'ក្រុមហ៊ុនរបស់អ្នក';
}

// Update statistics
function updateStats() {
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    const lowStockThreshold = settings.lowStockThreshold || 5;
    
    const totalItems = inventory.length;
    const outOfStock = inventory.filter(item => item.quantity === 0).length;
    const lowStock = inventory.filter(item => item.quantity > 0 && item.quantity <= lowStockThreshold).length;
    
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('out-of-stock').textContent = outOfStock;
    document.getElementById('low-stock').textContent = lowStock;
    
    // Update recent items
    updateRecentItems();
}

// Add recent item display
function addRecentItem(item) {
    const recentItemsDiv = document.getElementById('recent-items');
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    const formattedDate = formatDate(item.date, settings.dateFormat);
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'recent-item';
    itemDiv.innerHTML = `
        <h4>${item.name}</h4>
        <p>ចំនួន: ${item.quantity}</p>
        <p>តម្លៃ: $${item.price.toFixed(2)}</p>
        <p>កាលបរិច្ឆេទ: ${formattedDate}</p>
        <small>បានបន្ថែម: ${new Date(item.addedDate).toLocaleString('km-KH')}</small>
    `;
    
    recentItemsDiv.insertBefore(itemDiv, recentItemsDiv.firstChild);
    
    // Keep only last 5 items
    const items = recentItemsDiv.querySelectorAll('.recent-item');
    if (items.length > 5) {
        recentItemsDiv.removeChild(items[items.length - 1]);
    }
}

function updateRecentItems() {
    const recentItemsDiv = document.getElementById('recent-items');
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    
    recentItemsDiv.innerHTML = '';
    
    // Show last 5 items
    const recentItems = inventory.slice(-5).reverse();
    
    if (recentItems.length === 0) {
        recentItemsDiv.innerHTML = '<p style="color: #7f8c8d; text-align: center;">មិនទាន់មានទំនិញថ្មីៗ</p>';
        return;
    }
    
    recentItems.forEach(item => {
        const formattedDate = formatDate(item.date, settings.dateFormat);
        const itemDiv = document.createElement('div');
        itemDiv.className = 'recent-item';
        itemDiv.innerHTML = `
            <h4>${item.name}</h4>
            <p>ចំនួន: ${item.quantity}</p>
            <p>តម្លៃ: $${item.price.toFixed(2)}</p>
            <p>កាលបរិច្ឆេទ: ${formattedDate}</p>
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
}

// Edit item
function editItem(itemId) {
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const item = inventory.find(i => i.id === itemId);
    
    if (!item) return;
    
    // Switch to add item tab
    document.querySelector('[data-tab="add-item"]').click();
    
    // Fill form with item data
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-quantity').value = item.quantity;
    document.getElementById('item-price').value = item.price;
    document.getElementById('item-date').value = item.date;
    
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
        
        item.name = document.getElementById('item-name').value.trim();
        item.quantity = parseInt(document.getElementById('item-quantity').value);
        item.price = parseFloat(document.getElementById('item-price').value) || 0;
        item.date = document.getElementById('item-date').value;
        
        localStorage.setItem('inventory', JSON.stringify(inventory));
        
        // Reset form
        form.reset();
        document.getElementById('item-date').value = new Date().toISOString().split('T')[0];
        submitBtn.innerHTML = '<i class="fas fa-save"></i> រក្សាទុកទំនិញ';
        
        // Remove edit listener
        form.removeEventListener('submit', handleEditSubmit);
        form.addEventListener('submit', initAddItem);
        
        loadInventory();
        updateStats();
        alert('ទំនិញត្រូវបានកែប្រែដោយជោគជ័យ!');
        
        // Switch to inventory tab
        document.querySelector('[data-tab="inventory"]').click();
    }
    
    form.addEventListener('submit', handleEditSubmit);
}

// Export to Excel
function exportToExcel() {
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    
    if (inventory.length === 0) {
        alert('មិនទាន់មានទិន្នន័យទំនិញដើម្បីនាំចេញ!');
        return;
    }
    
    // Prepare data for Excel
    const excelData = [
        // Header row in Khmer
        ['ល.រ', 'ទំនិញ', 'ចំនួន', 'តម្លៃ', 'កាលបរិច្ឆេទ'],
        ...inventory.map((item, index) => [
            index + 1,
            item.name,
            item.quantity,
            item.price.toFixed(2),
            formatDate(item.date, settings.dateFormat)
        ])
    ];
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // Set column widths
    const wscols = [
        {wch: 5},   // No.
        {wch: 30},  // Item name
        {wch: 10},  // Quantity
        {wch: 12},  // Price
        {wch: 15}   // Date
    ];
    ws['!cols'] = wscols;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'ទំនិញ');
    
    // Generate filename with company name
    const companyName = settings.companyName ? settings.companyName.replace(/\s+/g, '_') : 'Inventory';
    const date = new Date().toISOString().split('T')[0];
    const filename = `${companyName}_ទំនិញ_${date}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, filename);
}

// Print inventory
function printInventory() {
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    
    const printContent = document.getElementById('print-content');
    
    // Build printable HTML
    let html = `
        <style>
            @media print {
                body { font-family: 'Khmer OS', Arial, sans-serif; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                th { background: #f0f0f0; }
                .header { text-align: center; margin-bottom: 20px; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; }
                .date { float: right; }
            }
        </style>
        <div class="header">
            <h1>${settings.companyName || 'ក្រុមហ៊ុន'}</h1>
            <p>${settings.address || ''}</p>
            <p>ទូរស័ព្ទ: ${settings.phone || ''}</p>
            <p class="date">កាលបរិច្ឆេទ: ${new Date().toLocaleDateString('km-KH')}</p>
        </div>
        <h2 style="text-align: center;">បញ្ជីទំនិញ</h2>
    `;
    
    if (inventory.length > 0) {
        html += `
            <table>
                <thead>
                    <tr>
                        <th>ល.រ</th>
                        <th>ទំនិញ</th>
                        <th>ចំនួន</th>
                        <th>តម្លៃ</th>
                        <th>កាលបរិច្ឆេទ</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        inventory.forEach((item, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${formatDate(item.date, settings.dateFormat)}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
    } else {
        html += '<p style="text-align: center; color: #666;">មិនទាន់មានទំនិញនៅក្នុងស្តុកទេ។</p>';
    }
    
    html += `
        <div class="footer">
            <p>បង្កើតដោយ: ប្រព័ន្ធគ្រប់គ្រងស្តុកទំនិញ</p>
            <p>កាលបរិច្ឆេទបោះពុម្ព: ${new Date().toLocaleString('km-KH')}</p>
        </div>
    `;
    
    printContent.innerHTML = html;
    
    // Trigger print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print Inventory</title>
            <meta charset="UTF-8">
        </head>
        <body>
            ${html}
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    }
                }
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}