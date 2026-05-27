# Help a Canadian in Need - Bitcoin Donations

A simple, clean Bitcoin donation platform to help someone in need.

## Features

✅ **One-Click Wallet Integration** - Click "Donate Now" to automatically open your Bitcoin wallet app  
✅ **QR Code** - Easily scan with your mobile wallet  
✅ **Copy Address Button** - Quick copy to clipboard for manual transfers  
✅ **Custom Amount** - Specify exactly how much BTC you want to donate  
✅ **Mobile Friendly** - Works perfectly on all devices  
✅ **No Middleman** - Direct peer-to-peer donations, zero fees

## How to Use

1. **Open** `index.html` in your web browser
2. **Enter** the amount of Bitcoin you'd like to donate (optional)
3. **Click** "Donate Now" to open your Bitcoin wallet app automatically
4. **Confirm** the transaction in your wallet

### Alternative Ways to Donate

- **Scan** the QR code with your mobile Bitcoin wallet
- **Copy** the address and send funds manually from any wallet

## Bitcoin Address

```
18ptWouViWf6UkZ1CTJkyUoWSSyzAe3KAQ
```

## Technical Details

- **Wallet Protocol**: Uses Bitcoin URI scheme (BIP 70/72) for automatic wallet detection
- **No Backend Required**: This is a static HTML/CSS/JS site - works anywhere
- **No Transaction Fees**: Direct peer-to-peer donations

## Files

- `index.html` - Main donation form
- `style.css` - Styling and layout
- `script.js` - Wallet integration logic
- `README.md` - This file

## How It Works

When you click "Donate Now":
1. If a Bitcoin amount is specified, it's included in the Bitcoin URI
2. Your operating system opens your default Bitcoin wallet app
3. The wallet pre-populates with the donation address and amount
4. You simply confirm the transaction

If no wallet app is installed, a fallback message provides the address for manual entry.

## Supported Wallets

Works with any wallet that supports Bitcoin URI scheme:
- Bitcoin Core
- Electrum
- Trust Wallet
- Blue Wallet
- Coinbase Wallet
- Metamask (via Bitcoin support)
- And many more!

---

**Every donation helps. Thank you for your generosity.** 💙
