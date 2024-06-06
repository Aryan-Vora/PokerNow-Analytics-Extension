# PokerNow Assistant Browser Extension

## Overview

This extension provides real-time win rates and common hand statistics while you play on PokerNow. You can find it on the chrome web store soon.

### Features

- **Winrate Display**: Shows your current win rate.
- **Common Hands Statistics**: Displays the odds and win rates for your 3 most common hands

## Installation

To install and run the PokerNow Winrate Browser Extension, follow these steps:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Aryan-Vora/PokerNow-Analytics-Extension.git
   cd PokerNow-Analytics-Extension
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Build the Extension**

   ```bash
   npx webpack
   ```

4. **Load the Extension in Your Browser**
   - Open your browser and navigate to the extensions page (e.g., `chrome://extensions/` for Chrome).
   - Enable "Developer mode" (usually found in the top right corner).
   - Click "Load unpacked" and select the `PokerNow-Analytics-Extension` folder you cloned.

## Usage

Once the extension is loaded, it will automatically start displaying win rates and common hand statistics when you play on PokerNow. To view it you need to click on the extension and then it will open a small popup with the relevant data.

You may need to reload the browser page if it does not update
