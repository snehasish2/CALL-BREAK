let players = [];
let rounds = 0;
let bids = {};
let scores = {};
let wins = {};

function addPlayer() {
    const playerNameInput = document.getElementById('playerName');
    const playerName = playerNameInput.value.trim();
    
    if (playerName === '') {
        alert('Please enter a player name.');
        return;
    }

    if (players.includes(playerName)) {
        alert('Player already added.');
        return;
    }

    players.push(playerName);
    bids[playerName] = [];
    scores[playerName] = [];
    wins[playerName] = [];
    playerNameInput.value = '';
    renderPlayerList();
}

function setRounds() {
    const roundNumberInput = document.getElementById('roundNumber');
    const numRounds = parseInt(roundNumberInput.value, 10);
    
    if (isNaN(numRounds) || numRounds <= 0) {
        alert('Please enter a valid number of rounds.');
        return;
    }

    rounds = numRounds;
    roundNumberInput.value = '';
    renderScorecard();
}

function setUpEnterKeyListener() {
    const playerNameInput = document.getElementById('playerName');
    playerNameInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            addPlayer();
        }
    });

    const roundNumberInput = document.getElementById('roundNumber');
    roundNumberInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            setRounds();
        }
    });
}

function renderPlayerList() {
    const playerListDiv = document.getElementById('playerList');
    playerListDiv.innerHTML = '';

    if (players.length === 0) return;

    const list = document.createElement('ul');

    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player;
        list.appendChild(li);
    });

    playerListDiv.appendChild(list);
}

function renderScorecard() {
    const scorecardDiv = document.getElementById('scorecard');
    scorecardDiv.innerHTML = '';

    if (players.length === 0 || rounds === 0) return;

    const table = document.createElement('table');
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const emptyHeader = document.createElement('th');
    emptyHeader.textContent = 'Round/Player';
    headerRow.appendChild(emptyHeader);
    
    players.forEach(player => {
        const th = document.createElement('th');
        th.textContent = player;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');

    for (let i = 1; i <= rounds; i++) {
        const row = document.createElement('tr');
        
        const roundHeader = document.createElement('td');
        roundHeader.textContent = `Round ${i}`;
        row.appendChild(roundHeader);
        
        players.forEach(player => {
            const td = document.createElement('td');

            // Create bid input field
            const bidInput = document.createElement('input');
            bidInput.type = 'number';
            bidInput.min = '0';
            bidInput.placeholder = 'Bid';
            bidInput.className = 'bid-input';
            bidInput.dataset.player = player;
            bidInput.dataset.round = i;
            bidInput.addEventListener('input', updateBid);
            td.appendChild(bidInput);

            // Create score input field
            const scoreInput = document.createElement('input');
            scoreInput.type = 'number';
            scoreInput.min = '0';
            scoreInput.placeholder = 'Score';
            scoreInput.className = 'score-input';
            scoreInput.dataset.player = player;
            scoreInput.dataset.round = i;
            scoreInput.addEventListener('input', updateScore);
            td.appendChild(scoreInput);

            // Create win button
            const winButton = document.createElement('button');
            winButton.textContent = 'Win';
            winButton.dataset.player = player;
            winButton.dataset.round = i;
            winButton.addEventListener('click', incrementWin);
            td.appendChild(winButton);

            // Display win count
            const winDisplay = document.createElement('span');
            winDisplay.textContent = ' Wins: 0';
            winDisplay.className = `win-display ${player}-${i}`;
            td.appendChild(winDisplay);

            row.appendChild(td);
        });
        tbody.appendChild(row);
    }
    
    table.appendChild(tbody);
    scorecardDiv.appendChild(table);
}

function updateBid(event) {
    const input = event.target;
    const player = input.dataset.player;
    const round = input.dataset.round;
    const bid = parseInt(input.value, 10) || 0;

    // Store bid
    if (!bids[player]) bids[player] = [];
    bids[player][round - 1] = bid;

    updateScoreDisplay(player, round);
}

function updateScore(event) {
    const input = event.target;
    const player = input.dataset.player;
    const round = input.dataset.round;
    const score = parseInt(input.value, 10) || 0;

    // Store score
    if (!scores[player]) scores[player] = [];
    scores[player][round - 1] = score;

    updateScoreDisplay(player, round);
}

function incrementWin(event) {
    const button = event.target;
    const player = button.dataset.player;
    const round = button.dataset.round;

    // Initialize win array if not present
    if (!wins[player]) wins[player] = [];
    wins[player][round - 1] = (wins[player][round - 1] || 0) + 1;

    // Update win display
    const winDisplay = document.querySelector(`.win-display.${player}-${round}`);
    winDisplay.textContent = ` Wins: ${wins[player][round - 1]}`;

    updateScoreDisplay(player, round);
}

function updateScoreDisplay(player, round) {
    const bid = bids[player] ? bids[player][round - 1] || 0 : 0;
    const win = wins[player] ? wins[player][round - 1] || 0 : 0;
    let score = 0;

    if (win < bid) {
        score = -bid;
    } else {
        score = bid + (win - bid) * 0.1;
    }

    // Store score
    if (!scores[player]) scores[player] = [];
    scores[player][round - 1] = score;

    // Display score
    const scoreInput = document.querySelector(`input[data-player="${player}"][data-round="${round}"].score-input`);
    if (scoreInput) {
        scoreInput.value = score;
    }
}

function calculateTotals() {
    const totalsDiv = document.getElementById('totals');
    totalsDiv.innerHTML = '';

    if (players.length === 0 || rounds === 0) return;

    // Sort players by total score
    const sortedPlayers = players.slice().sort((a, b) => {
        const totalScoreA = (scores[a] || []).reduce((acc, score) => acc + (score || 0), 0);
        const totalScoreB = (scores[b] || []).reduce((acc, score) => acc + (score || 0), 0);
        return totalScoreB - totalScoreA;
    });

    const table = document.createElement('table');

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const emptyHeader = document.createElement('th');
    emptyHeader.textContent = 'Player';
    headerRow.appendChild(emptyHeader);

    const totalScoreHeader = document.createElement('th');
    totalScoreHeader.textContent = 'Total Score';
    headerRow.appendChild(totalScoreHeader);

    const totalBidsHeader = document.createElement('th');
    totalBidsHeader.textContent = 'Total Bid';
    headerRow.appendChild(totalBidsHeader);

    const totalWinsHeader = document.createElement('th');
    totalWinsHeader.textContent = 'Total Wins';
    headerRow.appendChild(totalWinsHeader);

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');

    sortedPlayers.forEach(player => {
        const row = document.createElement('tr');
        
        const playerCell = document.createElement('td');
        playerCell.textContent = player;
        row.appendChild(playerCell);

        const totalScoreCell = document.createElement('td');
        totalScoreCell.textContent = (scores[player] || []).reduce((acc, score) => acc + (score || 0), 0);
        row.appendChild(totalScoreCell);

        const totalBidsCell = document.createElement('td');
        totalBidsCell.textContent = (bids[player] || []).reduce((acc, bid) => acc + (bid || 0), 0);
        row.appendChild(totalBidsCell);

        const totalWinsCell = document.createElement('td');
        totalWinsCell.textContent = (wins[player] || []).reduce((acc, win) => acc + (win || 0), 0);
        row.appendChild(totalWinsCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    totalsDiv.appendChild(table);

    // Display winner
    declareWinner(sortedPlayers);
}

function declareWinner(sortedPlayers) {
    if (sortedPlayers.length === 0) return;

    const winner = sortedPlayers[0];
    const winnerDiv = document.getElementById('winner');
    winnerDiv.innerHTML = `<p>Congratulations ${winner}! You are the Winner!</p>`;
    winnerDiv.classList.add('winner-animation');
    winnerDiv.classList.remove('hidden');
}

function resetScorecard() {
    players = [];
    rounds = 0;
    bids = {};
    scores = {};
    wins = {};
    document.getElementById('scorecard').innerHTML = '';
    document.getElementById('totals').innerHTML = '';
    document.getElementById('playerList').innerHTML = '';
    document.getElementById('winner').classList.add('hidden');
}

// Initialize Enter key listener
setUpEnterKeyListener();
