const bitcoinAddress = '18ptWouViWf6UkZ1CTJkyUoWSSyzAe3KAQ';
const amountInput = document.getElementById('amount');
const donateBtn = document.getElementById('donateBtn');
const copyBtn = document.getElementById('copyBtn');

// Copy address to clipboard
copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(bitcoinAddress).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });
});

// Handle donation button click
donateBtn.addEventListener('click', () => {
    const amount = amountInput.value;
    
    // Create Bitcoin URI according to BIP 70/72
    let bitcoinUri = `bitcoin:${bitcoinAddress}`;
    
    if (amount && amount > 0) {
        bitcoinUri += `?amount=${amount}`;
    }
    
    // Attempt to open wallet app
    window.location.href = bitcoinUri;
    
    // Fallback: Alert user if no wallet app is detected (after a short delay)
    setTimeout(() => {
        if (document.hidden === false) {
            alert(`Bitcoin address: ${bitcoinAddress}\n\nIf your wallet app didn't open, please copy the address and send the donation manually.`);
        }
    }, 1500);
});

// Allow Enter key to trigger donation
amountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        donateBtn.click();
    }
});
