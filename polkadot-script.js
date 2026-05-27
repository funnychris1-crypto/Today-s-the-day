// Polkadot Wallet Dashboard
class PolkadotDashboard {
    constructor() {
        this.wallets = [];
        this.transactions = [];
        this.dotPrice = 0;
        this.priceChange = 0;
        this.primaryAddress = '14QC8hndA6wZnEDCyFBjYvHcavXKXgA8Cfzi5zWjWxW1mgLC';
        
        // DOM Elements
        this.walletInput = document.getElementById('walletInput');
        this.walletLabel = document.getElementById('walletLabel');
        this.addWalletBtn = document.getElementById('addWalletBtn');
        this.walletsList = document.getElementById('walletsList');
        this.transactionsList = document.getElementById('transactionsList');
        this.assetsList = document.getElementById('assetsList');
        this.addError = document.getElementById('addError');
        this.totalDOT = document.getElementById('totalDOT');
        this.totalUSD = document.getElementById('totalUSD');
        this.walletCount = document.getElementById('walletCount');
        this.assetCount = document.getElementById('assetCount');
        this.dotPrice = document.getElementById('dotPrice');
        this.priceChange = document.getElementById('priceChange');
        this.copyPrimaryBtn = document.getElementById('copyPrimaryBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.importFile = document.getElementById('importFile');
        this.clearBtn = document.getElementById('clearBtn');
        this.refreshTxBtn = document.getElementById('refreshTxBtn');
        this.txWalletFilter = document.getElementById('txWalletFilter');
        
        this.init();
    }

    init() {
        this.loadWallets();
        this.setupEventListeners();
        this.fetchDOTPrice();
        this.renderDashboard();
    }

    setupEventListeners() {
        this.addWalletBtn.addEventListener('click', () => this.addWallet());
        this.walletInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addWallet();
        });
        this.copyPrimaryBtn.addEventListener('click', () => this.copyAddress(this.primaryAddress));
        this.exportBtn.addEventListener('click', () => this.exportWallets());
        this.importBtn.addEventListener('click', () => this.importFile.click());
        this.importFile.addEventListener('change', (e) => this.importWallets(e));
        this.clearBtn.addEventListener('click', () => this.clearAllData());
        this.refreshTxBtn.addEventListener('click', () => this.loadAllTransactions());
    }

    // Validate Polkadot Address
    isValidPolkadotAddress(address) {
        return /^1[1-9A-HJ-NP-Z]{46}$/.test(address) || /^[1-9A-HJ-NP-Z]{46}/.test(address);
    }

    // Add Wallet
    async addWallet() {
        const address = this.walletInput.value.trim();
        const label = this.walletLabel.value.trim();

        this.addError.classList.add('hidden');

        if (!address) {
            this.showError('Please enter a wallet address');
            return;
        }

        if (!this.isValidPolkadotAddress(address)) {
            this.showError('Invalid Polkadot address format');
            return;
        }

        if (this.wallets.some(w => w.address === address)) {
            this.showError('This wallet is already added');
            return;
        }

        const wallet = {
            address: address,
            label: label || address.substring(0, 10) + '...',
            balance: 0,
            usd: 0,
            assets: [],
            addedAt: new Date().toISOString()
        };

        this.wallets.unshift(wallet);
        this.saveWallets();
        this.walletInput.value = '';
        this.walletLabel.value = '';
        
        // Fetch balance for this wallet
        await this.fetchWalletBalance(wallet);
        this.renderDashboard();
    }

    // Fetch Wallet Balance from Subscan API
    async fetchWalletBalance(wallet) {
        try {
            const response = await fetch(
                `https://polkadot.api.subscan.io/api/v2/balance?address=${wallet.address}`,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                if (data.data) {
                    const balance = parseInt(data.data.balance || 0) / 1e10; // Convert from planck
                    wallet.balance = balance;
                    wallet.usd = balance * this.dotPrice;
                }
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
        }

        this.saveWallets();
    }

    // Fetch All Wallet Balances
    async fetchAllWalletBalances() {
        for (const wallet of this.wallets) {
            await this.fetchWalletBalance(wallet);
        }
        this.renderDashboard();
    }

    // Fetch DOT Price
    async fetchDOTPrice() {
        try {
            const response = await fetch(
                'https://api.coingecko.com/api/v3/simple/price?ids=polkadot&vs_currencies=usd&include_24hr_change=true'
            );
            
            if (response.ok) {
                const data = await response.json();
                this.dotPrice = data.polkadot.usd;
                this.priceChange = data.polkadot.usd_24h_change;
                
                // Update all wallet USD values
                this.wallets.forEach(w => {
                    w.usd = w.balance * this.dotPrice;
                });
                
                this.renderDashboard();
            }
        } catch (error) {
            console.error('Error fetching DOT price:', error);
        }
    }

    // Load Transactions
    async loadAllTransactions() {
        this.transactions = [];
        
        for (const wallet of this.wallets) {
            try {
                const response = await fetch(
                    `https://polkadot.api.subscan.io/api/scan/transfers?address=${wallet.address}&row=10`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            address: wallet.address,
                            row: 10
                        })
                    }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.data && data.data.transfers) {
                        data.data.transfers.forEach(tx => {
                            this.transactions.push({
                                ...tx,
                                wallet: wallet.label,
                                walletAddress: wallet.address
                            });
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading transactions:', error);
            }
        }
        
        // Sort by timestamp
        this.transactions.sort((a, b) => b.block_timestamp - a.block_timestamp);
        this.renderDashboard();
    }

    // Remove Wallet
    removeWallet(address) {
        if (confirm('Are you sure you want to remove this wallet?')) {
            this.wallets = this.wallets.filter(w => w.address !== address);
            this.saveWallets();
            this.renderDashboard();
        }
    }

    // Copy Address to Clipboard
    copyAddress(address) {
        navigator.clipboard.writeText(address).then(() => {
            alert('Address copied to clipboard!');
        });
    }

    // Render Dashboard
    renderDashboard() {
        this.renderWallets();
        this.renderSummary();
        this.renderTransactions();
        this.updateWalletFilter();
    }

    // Render Wallets
    renderWallets() {
        if (this.wallets.length === 0) {
            this.walletsList.innerHTML = '<div class="no-wallets"><p>No wallets added yet. Add one to get started!</p></div>';
            return;
        }

        this.walletsList.innerHTML = this.wallets.map(wallet => `
            <div class="wallet-card">
                <div class="wallet-label">Wallet</div>
                <div class="wallet-name">${this.escapeHtml(wallet.label)}</div>
                <div class="wallet-address">
                    <span>${wallet.address}</span>
                    <button class="copy-icon" onclick="dashboard.copyAddress('${wallet.address}')">📋</button>
                </div>
                <div class="wallet-balance">${wallet.balance.toFixed(4)} DOT</div>
                <div class="wallet-usd">≈ $${wallet.usd.toFixed(2)}</div>
                <div class="wallet-actions">
                    <button class="wallet-btn wallet-btn-view" onclick="window.open('https://polkadot.subscan.io/account/${wallet.address}', '_blank')">
                        View on Subscan ↗
                    </button>
                    <button class="wallet-btn wallet-btn-remove" onclick="dashboard.removeWallet('${wallet.address}')">
                        Remove
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Render Summary
    renderSummary() {
        const totalDOT = this.wallets.reduce((sum, w) => sum + w.balance, 0);
        const totalUSD = this.wallets.reduce((sum, w) => sum + w.usd, 0);

        document.getElementById('totalDOT').textContent = totalDOT.toFixed(4);
        document.getElementById('totalUSD').textContent = '$' + totalUSD.toFixed(2);
        document.getElementById('walletCount').textContent = this.wallets.length;
        document.getElementById('dotPrice').innerHTML = '$' + this.dotPrice.toFixed(2);
        
        const priceChangeEl = document.getElementById('priceChange');
        priceChangeEl.textContent = (this.priceChange > 0 ? '+' : '') + this.priceChange.toFixed(2) + '%';
        priceChangeEl.className = 'summary-change ' + (this.priceChange > 0 ? 'positive' : 'negative');
    }

    // Render Transactions
    renderTransactions() {
        if (this.transactions.length === 0) {
            this.transactionsList.innerHTML = '<div class="no-transactions"><p>No transactions found.</p></div>';
            return;
        }

        const selectedWallet = document.getElementById('txWalletFilter').value;
        const filtered = selectedWallet ? 
            this.transactions.filter(tx => tx.walletAddress === selectedWallet) : 
            this.transactions;

        this.transactionsList.innerHTML = filtered.slice(0, 20).map(tx => {
            const date = new Date(tx.block_timestamp * 1000).toLocaleDateString();
            const amount = parseInt(tx.amount || 0) / 1e10; // Convert from planck
            
            return `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-type">${tx.from === tx.from_account_id ? 'Sent' : 'Received'}</div>
                        <div class="transaction-hash">${tx.hash}</div>
                        <div class="transaction-time">${date}</div>
                    </div>
                    <div class="transaction-amount">${amount.toFixed(4)} DOT</div>
                </div>
            `;
        }).join('');
    }

    // Update Wallet Filter
    updateWalletFilter() {
        const selectedValue = this.txWalletFilter.value;
        this.txWalletFilter.innerHTML = '<option value="">All Wallets</option>' + 
            this.wallets.map(w => `<option value="${w.address}">${this.escapeHtml(w.label)}</option>`).join('');
        this.txWalletFilter.value = selectedValue;
    }

    // Export Wallets
    exportWallets() {
        const data = {
            version: 1,
            exportedAt: new Date().toISOString(),
            wallets: this.wallets.map(w => ({
                address: w.address,
                label: w.label,
                addedAt: w.addedAt
            }))
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `polkadot-wallets-${new Date().getTime()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Import Wallets
    importWallets(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.wallets || !Array.isArray(data.wallets)) {
                    alert('Invalid wallet file format');
                    return;
                }

                for (const walletData of data.wallets) {
                    if (!this.wallets.some(w => w.address === walletData.address)) {
                        const wallet = {
                            address: walletData.address,
                            label: walletData.label || walletData.address.substring(0, 10) + '...',
                            balance: 0,
                            usd: 0,
                            assets: [],
                            addedAt: walletData.addedAt || new Date().toISOString()
                        };
                        this.wallets.push(wallet);
                        await this.fetchWalletBalance(wallet);
                    }
                }

                this.saveWallets();
                this.renderDashboard();
                alert(`Imported ${data.wallets.length} wallet(s)`);
            } catch (error) {
                alert('Error importing wallets: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    // Clear All Data
    clearAllData() {
        if (confirm('⚠️ WARNING: This will delete all wallet data. This cannot be undone!')) {
            if (confirm('Are you absolutely sure?')) {
                this.wallets = [];
                this.transactions = [];
                localStorage.removeItem('polkadotWallets');
                this.renderDashboard();
            }
        }
    }

    // Show Error
    showError(message) {
        this.addError.textContent = message;
        this.addError.classList.remove('hidden');
        setTimeout(() => {
            this.addError.classList.add('hidden');
        }, 5000);
    }

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Save Wallets to Local Storage
    saveWallets() {
        localStorage.setItem('polkadotWallets', JSON.stringify(this.wallets));
    }

    // Load Wallets from Local Storage
    loadWallets() {
        const saved = localStorage.getItem('polkadotWallets');
        this.wallets = saved ? JSON.parse(saved) : [];
    }
}

// Initialize Dashboard
const dashboard = new PolkadotDashboard();

// Auto-refresh every 2 minutes
setInterval(() => {
    dashboard.fetchDOTPrice();
    dashboard.fetchAllWalletBalances();
}, 120000);
