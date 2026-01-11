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
let currentPrices = [];

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

    //Add to portfolio
    function addtoPortfolio(coin){
        const amount = prompt(`How much ${coin.symbol.toUpperCase()} do you own?`);
        if(!amount || isNaN(amount)|| amount <= 0) return;

        fetch(`${API_Base}/simple/price?ids=${coin.id}&vs_currencies=usd`)
        .then(res => res.json())
        .then(data=> {
            const boughtPrice = data[coin.id]?.usd || 0;
                const portfolioItem = {
                    id: Date.now(),
                    coinId: coin.id,
                    symbol: coin.symbol.toUpperCase(),
                    name: coin.name,
                    amount: parseFloat(amount),
                    boughtPrice: boughtPrice
                }
                portfolio.push(portfolioItem);
                localStorage.setItem(
                "crypto-portfolio",
                JSON.stringify(portfolio)
                );
                renderPortfolio();
                updateTotals();
                coinResults.innerHTML = "";
                searchInput.value = "";
        })
    }

    //fetch live Prices
        async function fetchPrices() {
        try {
            const ids = portfolio.map((item) => item.coinId).join(",");
            if (!ids) return;

            const response = await fetch(
            `${API_Base}/simple/price?ids=${ids}&vs_currencies=usd`
            );
            currentPrices = await response.json();

            renderPortfolio();
            updateTotals();
        } catch (error) {
            console.error("Price fetch error:", error);
        }
        }

    //Render portfolio
    
    function renderPortfolio(){
        portfolioList.innerHTML = '';
        if(!portfolio.length){
            portfolioList.innerHTML = '<div class="empty-state"><h3>Your portfolio is empty</h3><p>Add coins using search above!</p></div>';
            coinCountDisplay.textContent = "0";
            return;
        }
        portfolio.forEach(item => {
            const currentPrice =
            currentPrices[item.coinId]?.usd || item.boughtPrice || 0;
            const currentValue = item.amount * currentPrice;
            const pnlValue = currentValue - item.amount * item.boughtPrice;
            const pnlPercent = ((pnlValue / (item.amount * item.boughtPrice)) * 100).toFixed(2);
            const portfolioEl = document.createElement("div");
            portfolioEl.className = "portfolio-item";
            portfolioEl.innerHTML = `
                <div class="portfolio-symbol">${item.symbol}</div>
                <div class="portfolio-amount">${item.amount.toFixed(4)}</div>
                <div class="portfolio-current">$${currentPrice.toFixed(4)}</div>
                <div class="portfolio-pnl ${pnlValue >= 0 ? "pnl-profit" : "pnl-loss"
                }">
                    $${pnlValue.toFixed(2)} (${pnlPercent}%)
                </div>
                <button class="delete-btn" data-id="${item.id}">×</button>
            `;
            portfolioList.appendChild(portfolioEl);
            
        });
    }

    //Update totals
    function updateTotals(){
        const totalValue= portfolio.reduce((sum,item) =>{
            const price = currentPrices[item.coinId]?.usd || item.boughtPrice || 0;
            return sum + (item.amount * item.boughtPrice);
        },0);

        const totalInvested = portfolio.reduce((sum,item) => {
            return sum + (item.amount * item.boughtPrice);
        },0);

        const pnl = totalValue - totalInvested;
        totalValueDisplay.textContent = totalValue.toFixed(2);
        pnlDisplay.textContent = pnl.toFixed(2);
        pnlDisplay.className = pnl >= 0 ? "pnl-profit" : "pnl-loss";
    }

    //Delete coin(Event delegation)
    portfolioList.addEventListener('click', (e) => {
        if(e.target.classlist.contains('delete-btn')){
            const id = parseInt(e.target.dataset.id);
            portfolio = portfolio.filter((item) => item.id !== id);
            localStorage.setItem("crypto-portfolio", JSON.stringify(portfolio));
            renderPortfolio();
            updateTotals();
            fetchPrices(); //Refresh prices
        }
    } );
    //Event listeners
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        if(e.target.value.length>2){
            searchTimeout = searchTimeout(() => searchCoins(e.target.value),500);//Debounce
        } else{
            coinResults.innerHTML = '';
        }
    });
        refreshBtn.addEventListener("click", fetchPrices);

})