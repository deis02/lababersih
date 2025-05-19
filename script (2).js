document.addEventListener('DOMContentLoaded', function () {
    const products = [
        { id: 1, name: 'Netflix (Shared)', sellingPrice: 30000, modalPrice: 24000 },
        { id: 2, name: 'Canva (Invitation)', sellingPrice: 3000, modalPrice: 1000 },
        { id: 3, name: 'Canva (Private)', sellingPrice: 8000, modalPrice: 5000 },
        { id: 4, name: 'ChatGPT (Shared 5User)', sellingPrice: 60000, modalPrice: 50000 },
        { id: 5, name: 'CapCut Pro (Private)', sellingPrice: 20000, modalPrice: 12000 },
        { id: 6, name: 'Viu (12 Bulan)', sellingPrice: 4000, modalPrice: 2000 },
        { id: 7, name: 'Google Drive (Lifetime)', sellingPrice: 30000, modalPrice: 20000 },
        { id: 8, name: 'VPN HMA (1 Bulan)', sellingPrice: 10000, modalPrice: 5000 },
    ];

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // Default bulan & tahun ke saat ini
    const now = new Date();
    let currentYear = now.getFullYear();
    let currentMonth = now.getMonth(); // 0-indexed

    const productSelect = document.getElementById('productSelect');
    const transactionList = document.getElementById('transactionList');
    const selectedMonthText = document.getElementById('selectedMonth');

    // Populate dropdown tanpa duplikat
    function populateProductDropdown() {
        productSelect.innerHTML = '<option value="" selected disabled>Pilih product</option>';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} - Rp${product.sellingPrice.toLocaleString()}`;
            productSelect.appendChild(option);
        });
    }
    populateProductDropdown();

    // Add product to transactions
    document.getElementById('addProductBtn').addEventListener('click', function () {
        const selectedProductId = parseInt(productSelect.value);
        if (!selectedProductId) return alert('Pilih produk terlebih dahulu!');

        const product = products.find(p => p.id === selectedProductId);
        if (!product) return;

        const transaction = {
            id: Date.now(),
            productName: product.name,
            sellingPrice: product.sellingPrice,
            modalPrice: product.modalPrice,
            date: new Date(),
        };

        transactions.push(transaction);
        saveTransactions();
        updateStats();
        updateMonthlyStats();
    });

    // Save transactions to local storage
    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    // Update statistics
    function updateStats() {
        const totalNetProfit = transactions.reduce((sum, t) => sum + (t.sellingPrice - t.modalPrice), 0);
        const totalGrossProfit = transactions.reduce((sum, t) => sum + t.sellingPrice, 0);

        document.getElementById('labaBersih').textContent = totalNetProfit.toLocaleString();
        document.getElementById('labaKotor').textContent = totalGrossProfit.toLocaleString();

        updateMonthlyStats();
    }

    // Update monthly statistics
    function updateMonthlyStats() {
        const monthlyTransactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return (
                transactionDate.getFullYear() === currentYear &&
                transactionDate.getMonth() === currentMonth
            );
        });

        const monthlyNetProfit = monthlyTransactions.reduce(
            (sum, t) => sum + (t.sellingPrice - t.modalPrice),
            0
        );
        const monthlyGrossProfit = monthlyTransactions.reduce(
            (sum, t) => sum + t.sellingPrice,
            0
        );

        document.getElementById('monthlyLabaBersih').textContent = monthlyNetProfit.toLocaleString();
        document.getElementById('monthlyLabaKotor').textContent = monthlyGrossProfit.toLocaleString();

        renderTransactions(monthlyTransactions);
    }

    // Render transactions
    function renderTransactions(filteredTransactions = transactions) {
        transactionList.innerHTML = '';

        if (filteredTransactions.length === 0) {
            transactionList.innerHTML = '<p>Tidak ada transaksi pada bulan ini.</p>';
            return;
        }

        filteredTransactions.forEach(transaction => {
            const transactionItem = document.createElement('div');
            transactionItem.className = 'transaction-item';
            transactionItem.innerHTML = `
                <div class="transaction-details">
                    <div class="transaction-name">${transaction.productName}</div>
                    <div class="transaction-date">${new Date(transaction.date).toLocaleDateString()}</div>
                </div>
                <div class="transaction-amount">Rp${transaction.sellingPrice.toLocaleString()}</div>
                <button class="delete-btn" data-id="${transaction.id}">Hapus</button>
            `;
            transactionList.appendChild(transactionItem);
        });

        // Add delete functionality
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                const id = parseInt(this.dataset.id);
                transactions = transactions.filter(t => t.id !== id);
                saveTransactions();
                updateStats();
                updateMonthlyStats();
            });
        });
    }

    // --- MONTH PICKER LOGIC ---
    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // Modal elements
    const monthSelector = document.getElementById('monthSelector');
    const monthPickerModal = document.getElementById('monthPickerModal');
    const yearDisplay = document.getElementById('yearDisplay');
    const prevYearBtn = document.getElementById('prevYearBtn');
    const nextYearBtn = document.getElementById('nextYearBtn');
    const monthGrid = document.getElementById('monthGrid');
    const closeMonthPicker = document.getElementById('closeMonthPicker');

    function renderMonthGrid() {
        monthGrid.innerHTML = '';
        monthNames.forEach((name, idx) => {
            const div = document.createElement('div');
            div.className = 'month-item' + (idx === currentMonth ? ' active' : '');
            div.textContent = name;
            div.addEventListener('click', function () {
                currentMonth = idx;
                selectedMonthText.textContent = `${monthNames[currentMonth]} ${currentYear}`;
                updateMonthlyStats();
                monthPickerModal.style.display = 'none';
            });
            monthGrid.appendChild(div);
        });
    }

    monthSelector.addEventListener('click', function () {
        yearDisplay.textContent = currentYear;
        renderMonthGrid();
        monthPickerModal.style.display = 'flex';
    });

    prevYearBtn.addEventListener('click', function () {
        currentYear--;
        yearDisplay.textContent = currentYear;
        renderMonthGrid();
    });

    nextYearBtn.addEventListener('click', function () {
        currentYear++;
        yearDisplay.textContent = currentYear;
        renderMonthGrid();
    });

    closeMonthPicker.addEventListener('click', function () {
        monthPickerModal.style.display = 'none';
    });

    // Set initial month text sesuai bulan & tahun saat ini
    selectedMonthText.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Initialize
    updateStats();
    updateMonthlyStats();
});
