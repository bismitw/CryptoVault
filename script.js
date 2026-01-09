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

})