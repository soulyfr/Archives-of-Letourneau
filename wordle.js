const rowCount = 6;
const letterCount = 5;
let currentRow = 0;
let guess = new Array(letterCount).fill(''); // Initialize guess as an array with empty strings
const wordleButtton = document.querySelector('.wordle-button');

const wordData = await fetchData('https://random-word-api.herokuapp.com/word?length=5');
const word = wordData[0];
console.log(word);
const dict = await fetchData('./words_dictionary.json');

wordleButtton.addEventListener('click', function(){window.scrollTo({top:document.body.scrollHeight, behavior:'smooth'});});

function buildBoard() {
    const board = document.querySelector('.wordle-box');
    for (let i = 0; i < rowCount; i++) {
        const row = document.createElement('div');
        row.className = 'wordle-row';
        row.setAttribute('row-index', i);

        for (let j = 0; j < letterCount; j++) {
            const letterBox = document.createElement('input');
            letterBox.className = 'letter-box';
            letterBox.setAttribute('maxlength', '1');
            letterBox.setAttribute('oninput', 'this.value = this.value.toUpperCase()')
            letterBox.setAttribute('letter-index', j);
            letterBox.disabled = i !== currentRow;
            letterBox.addEventListener('input', getInput);
            letterBox.addEventListener('keydown', backTrack);
            row.appendChild(letterBox);
        }
        board.appendChild(row);
    }
}

async function fetchData(link) {

    try{

         
        const response = await fetch(link);

        if(!response.ok){
            throw new Error("Could not fetch resource");
        }

        const data = await response.json();
        //console.log(data);
        return data;
    }
    catch(error){
        console.error(error);
    }
}

function getInput(inputEvent) {
    const letterBox = inputEvent.target;
    const row = letterBox.parentElement;
    const col = parseInt(letterBox.getAttribute('letter-index'));
    console.log(row);
    if(letterBox.value == ''){
        return;
    } else guess[col] = letterBox.value;
    if (col < letterCount - 1) {
        row.children[col + 1].focus();
    } else {
        checkGuess();
    }
}

function backTrack (event){
    
    console.log(event.key);
    if(event.key == 'Backspace'){
        console.log('backspace');
    
        const letterBox = this;
        console.log(letterBox);
        const row = letterBox.parentElement;
        const col = parseInt(letterBox.getAttribute('letter-index'));
        // for(const box of row.children){
        //     box.value ='';
        // }
        if(letterBox.value !== ''){
            letterBox.value = '';
        } 
        else if(col > 0){
            row.children[col-1].focus();
        }
    }
}

function checkGuess() {
    const activeRow = document.querySelector(`[row-index="${currentRow}"]`);
    const allLetterBoxes = document.querySelectorAll('.letter-box');
 
    const currentGuess = guess.join('').toLowerCase();
    console.log(currentGuess);
    if (currentGuess.length !== letterCount) {
        console.log(currentGuess);
        console.log('Incomplete guess: ' + currentGuess);
        return;
    }
    console.log(currentGuess);
    const isInvalid = checkInvalid(currentGuess);
    if(isInvalid){
        console.log('Input a real word!');
        for (const letterBox of activeRow.children) {
            letterBox.classList.add('red');
        }
        return;
    }
 
    for (let i = 0; i < letterCount; i++) {
        const letter = currentGuess[i];
        const letterBox = activeRow.children[i];

        if (letter === word[i]) {
            letterBox.classList.remove('red');
            letterBox.classList.add('green');
        } else if (word.includes(letter)) {
            letterBox.classList.remove('red');
            letterBox.classList.add('yellow');
        } else {
            letterBox.classList.remove('red');  
        }
    }
 
    if (currentGuess === word) {
        endGame(true);
    } 
    
    else if (currentRow === rowCount - 1) {
        endGame(false);
    } 
    
    else {
        currentRow++;
        guess = new Array(letterCount).fill('');  
        nextRow();
    }
}

function checkInvalid(word) {
    if (dict[word] == 1) {
        return false;
    } else {return true;}
}

function nextRow() {
    const nextRow = document.querySelector(`[row-index="${currentRow}"]`);
    const previousRow = document.querySelector(`[row-index="${currentRow - 1}"]`);

    if (previousRow) {
        Array.from(previousRow.children).forEach(box => box.disabled = true);
    }

    Array.from(nextRow.children).forEach(box => box.disabled = false);
    nextRow.children[0].focus();
}

function endGame(isWin) {
    document.querySelectorAll('.letter-box').forEach(box => {
        box.disabled = true;
    });

    if (isWin) {
        console.log('Congratulations! You guessed the word!');
    } else {
        console.log('You lost! Better luck next time.');
    }
}

buildBoard();