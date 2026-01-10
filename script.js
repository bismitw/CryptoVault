document.addEventListener('DOMContentLoaded', () =>{

    const searchInput = document.getElementById('search-input');
    const addCoinBtn = document.getElementById("add-coin-btn");
    const coinResults = document.getElementById("coin-results");
    const portfolioList = document.getElementById("portfolio-list");
    const totalValueDisplay = document.getElementById('total-value');
    const pnlDisplay = document.getElementById('pnl');
    const coinCountDisplay = document.getElementById('coin-count');
    const refreshBtn =  document.getElementById('search-input');

//State variables
let portfolio = JSON.parse(localStorage.getItem('crypto-portfolio')) || [];
let allCoins = [];
let currentPieces = [];

//CoinGecko API 

const API_Base = "https://api.coingecko.com/api/v3";

//Search Coins
    async (query) => {
        try {
            const response = await fetch(`${API_Base}/search?query=${query}`)
            const data = await response.json();
            allCoins = data.coins.slice(0,10) //Top 10 results
            await renderSearchResults();

        } catch (error) {
            console.error('Search error:', error);
            coinResults.innerHTML= '<div class="empty-state"> Search failed. Try Again.</div>';
        }   
    }

//Render Search Results

    async function renderSearchResults(){
        if(!allCoins.length) return;

        try {
            const ids = allCoins.map(coin => coin.id).join(',');
            const priceResponse = await fetch (`${API_Base}/simple/price?ids=${ids}&vs_currencies=usd`);
            const prices = await priceResponse.json();
            coinResults.innerHTML = '';
            allCoins.array.forEach(coin => {
                const price = prices[coin.id]?.usd || 0;
                const coinEl = document.createElement('div');
                coinEl.className = 'coin-item';
                coinEl.innerHTML = `<div class="coin-info">
                        <div class="coin-symbol">${coin.symbol.toUpperCase()}</div>
                        <div class="coin-name">${coin.name}</div>
                    </div>
                    <div class="coin-price">$${price ? price.toFixed(4) : "N/A"}</div>`;
                    coinEl.addEventListener('click', ()=> addtoPortfolio(coin));
                    coinResults.appendChild(coinEl);
            });
            
        } catch (error) {
            console.error('Price Fetch Error:',error);
            
        }
    }
})