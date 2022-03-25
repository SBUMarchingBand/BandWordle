document.addEventListener("DOMContentLoaded", () => {
  // also in local storage
  let guessedWordCount = 0;
  let guessedWordCountshare = "X";
  let availableSpace = 1;
  let guessedWords = [[]];

  let date = new Date();
  let baseDate = new Date("03/21/2022");
  let Difference_In_Time = date.getTime() - baseDate.getTime();
  let currentWordIndex = Math.floor(Difference_In_Time / (1000 * 3600 * 24));
  let day = date.getDate();
  let month = date.getMonth()+1;
  let year = date.getFullYear();
  let today = `${month}.${day}.${year}`;

  const wordscasesens = ["Brass","Arena","Steps","Beats","Fight","Snare","Pride","March","Stick","April","Notes","Fifth","Music","Flags","Guard","Shore","Stony","Baton","Twirl","Drill","Major","Flute","Brook","Sandy","Crash","Crowd","Songs","Minor","Horns","Pitch","Vibes","Drums","Today"];
  const words = wordscasesens.map(element => {
    return element.toLowerCase();
  });
  let currentWord = words[currentWordIndex];

  initHelpModal();
  initStatsModal();
  createSquares();
  addKeyboardClicks();
  loadLocalStorage();

  function loadLocalStorage() {
    const lastDate = window.localStorage.getItem("lastDate");
    const finished = Number(window.localStorage.getItem("finished"));
  
    if(finished == null) {
      window.localStorage.setItem("finished", 0);
    }

    if(finished != 0 && lastDate != today) {
      resetGameState();
      return;
    }

    guessedWordCount =
      Number(window.localStorage.getItem("guessedWordCount")) ||
      guessedWordCount;
    guessedWordCountshare =
      Number(window.localStorage.getItem("guessedWordCountshare")) ||
      guessedWordCountshare;  
    availableSpace =
      Number(window.localStorage.getItem("availableSpace")) || availableSpace;
    guessedWords =
      JSON.parse(window.localStorage.getItem("guessedWords")) || guessedWords;

    currentWord = words[currentWordIndex];

    const storedBoardContainer = window.localStorage.getItem("boardContainer");
    if (storedBoardContainer) {
      document.getElementById("board-container").innerHTML =
        storedBoardContainer;
    }

    const storedKeyboardContainer =
      window.localStorage.getItem("keyboardContainer");
    if (storedKeyboardContainer) {
      document.getElementById("keyboard-container").innerHTML =
        storedKeyboardContainer;

      addKeyboardClicks();
    }

    if(finished != 0) {
      clearBoard();
      if(finished == 1) {
        showResult();
      }
      else {
        showLosingResult();
      }
      return;
    }
  }

  function resetGameState() {
    window.localStorage.removeItem("guessedWordCount");
    window.localStorage.removeItem("guessedWordCountshare");
    window.localStorage.removeItem("guessedWords");
    window.localStorage.removeItem("keyboardContainer");
    window.localStorage.removeItem("boardContainer");
    window.localStorage.removeItem("availableSpace");
    window.localStorage.setItem("finished", 0);
  }

  function createSquares() {
    const gameBoard = document.getElementById("board");

    for (let i = 0; i < 30; i++) {
      let square = document.createElement("div");
      square.classList.add("animate__animated");
      square.classList.add("square");
      square.setAttribute("id", i + 1);
      gameBoard.appendChild(square);
    }
  }

  function preserveGameState() {
    window.localStorage.setItem("guessedWords", JSON.stringify(guessedWords));

    const keyboardContainer = document.getElementById("keyboard-container");
    window.localStorage.setItem(
      "keyboardContainer",
      keyboardContainer.innerHTML
    );

    const boardContainer = document.getElementById("board-container");
    window.localStorage.setItem("boardContainer", boardContainer.innerHTML);
  }

  function getCurrentWordArr() {
    const numberOfGuessedWords = guessedWords.length;
    return guessedWords[numberOfGuessedWords - 1];
  }

  function updateGuessedLetters(letter) {
    const currentWordArr = getCurrentWordArr();

    if (currentWordArr && currentWordArr.length < 5) {
      currentWordArr.push(letter);

      const availableSpaceEl = document.getElementById(availableSpace);

      availableSpaceEl.textContent = letter;
      availableSpace = availableSpace + 1;
    }
  }

  function updateTotalGames() {
    const totalGames = window.localStorage.getItem("totalGames") || 0;
    window.localStorage.setItem("totalGames", Number(totalGames) + 1);
  }

  function showResult() {
    const finalResultEl = document.getElementById("final-score");
    finalResultEl.textContent = "You win!";
  }

  function showLosingResult() {
    const finalResultEl = document.getElementById("final-score");
    finalResultEl.textContent = `Unsuccessful Today!`;
  }

  function incrementStreak() {
    const totalWins = window.localStorage.getItem("totalWins") || 0;
    window.localStorage.setItem("totalWins", Number(totalWins) + 1);

    const currentStreak = window.localStorage.getItem("currentStreak") || 0;
    window.localStorage.setItem("currentStreak", Number(currentStreak) + 1);
  }

  function resetStreak() {
    window.localStorage.setItem("currentStreak", 0);
  }

  function clearBoard() {
    //for (let i = 0; i < 30; i++) {
    //  let square = document.getElementById(i + 1);
    //  square.textContent = "";
    //}

    const keys = document.getElementsByClassName("keyboard-button");

    for (var key of keys) {
      key.disabled = true;
    }
  }

  function getIndicesOfLetter(letter, arr) {
    const indices = [];
    let idx = arr.indexOf(letter);
    while (idx != -1) {
      indices.push(idx);
      idx = arr.indexOf(letter, idx + 1);
    }
    return indices;
  }

  function getTileClass(letter, index, currentWordArr) {
    const isCorrectLetter = currentWord
      .toUpperCase()
      .includes(letter.toUpperCase());

    if (!isCorrectLetter) {
      return "incorrect-letter";
    }

    const letterInThatPosition = currentWord.charAt(index);
    const isCorrectPosition =
      letter.toLowerCase() === letterInThatPosition.toLowerCase();

    if (isCorrectPosition) {
      return "correct-letter-in-place";
    }

    const isGuessedMoreThanOnce =
      currentWordArr.filter((l) => l === letter).length > 1;

    if (!isGuessedMoreThanOnce) {
      return "correct-letter";
    }

    const existsMoreThanOnce =
      currentWord.split("").filter((l) => l === letter).length > 1;

    // is guessed more than once and exists more than once
    if (existsMoreThanOnce) {
      return "correct-letter";
    }

    const hasBeenGuessedAlready = currentWordArr.indexOf(letter) < index;

    const indices = getIndicesOfLetter(letter, currentWord.split(""));
    const otherIndices = indices.filter((i) => i !== index);
    const isGuessedCorrectlyLater = otherIndices.some(
      (i) => i > index && currentWordArr[i] === letter
    );

    if (!hasBeenGuessedAlready && !isGuessedCorrectlyLater) {
      return "correct-letter";
    }

    return "incorrect-letter";
  }

  async function handleSubmitWord() {
    const currentWordArr = getCurrentWordArr();
    const guessedWord = currentWordArr.join("");

    if (guessedWord.length !== 5) {
      return;
    }

    try {
      const res = await fetch(
        `https://wordsapiv1.p.rapidapi.com/words/${guessedWord.toLowerCase()}`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
            "x-rapidapi-key": "59cb132ce2msh8ff017689aa3828p1f0a65jsna5daf38e4182",
          },
        }
      );

      if (!res.ok) {
        throw Error();
      }
      const firstLetterId = guessedWordCount * 5 + 1;

      localStorage.setItem("availableSpace", availableSpace);

      const interval = 200;
      currentWordArr.forEach((letter, index) => {
        setTimeout(() => {
          const tileClass = getTileClass(letter, index, currentWordArr);
          if (tileClass) {
            const letterId = firstLetterId + index;
            const letterEl = document.getElementById(letterId);
            letterEl.classList.add("animate__flipInX");
            letterEl.classList.add(tileClass);

            const keyboardEl = document.querySelector(`[data-key=${letter}]`);
            keyboardEl.classList.add(tileClass);
          }

          if (index === 4) {
            preserveGameState();
          }
        }, index * interval);
      });

      guessedWordCount += 1;
      window.localStorage.setItem("guessedWordCount", guessedWordCount);

      if (guessedWord === currentWord) {
        setTimeout(() => {
          guessedWordCountshare = String(guessedWordCount)
          window.localStorage.setItem("guessedWordCountshare", guessedWordCountshare);
          clearBoard();
          showResult();
          incrementStreak();
          updateTotalGames();
          window.localStorage.setItem("lastDate", today);
          window.localStorage.setItem("finished", 1);
          showStatsModal();
          return;
        }, 1200);
      }

      if (guessedWords.length === 6 && guessedWord !== currentWord) {
        setTimeout(() => {
          guessedWordCountshare = "X"
          window.localStorage.setItem("guessedWordCountshare", guessedWordCountshare);
          clearBoard();
          showLosingResult();
          resetStreak();
          updateTotalGames();
          window.localStorage.setItem("lastDate", today);
          window.localStorage.setItem("finished", 2);
          showStatsModal();
          return;
        }, 1200);
      }

      guessedWords.push([]);
    } catch (_error) {
      window.alert("Word is not recognised!");
    }
  }

  function handleDelete() {
    const currentWordArr = getCurrentWordArr();

    if (!currentWordArr.length) {
      return;
    }

    currentWordArr.pop();

    guessedWords[guessedWords.length - 1] = currentWordArr;

    const lastLetterEl = document.getElementById(availableSpace - 1);

    lastLetterEl.innerHTML = "";
    availableSpace = availableSpace - 1;
  }

  function addKeyboardClicks() {
    const keys = document.querySelectorAll(".keyboard-row button");
    for (let i = 0; i < keys.length; i++) {
      keys[i].addEventListener("click", ({ target }) => {
        const key = target.getAttribute("data-key");

        if (key === "enter") {
          handleSubmitWord();
          return;
        }

        if (key === "del") {
          handleDelete();
          return;
        }

        updateGuessedLetters(key);
      });
    }
  }

  function initHelpModal() {
    const modal = document.getElementById("help-modal");

    // Get the button that opens the modal
    const btn = document.getElementById("help");

    // Get the <span> element that closes the modal
    const span = document.getElementById("close-help");

    // When the user clicks on the button, open the modal
    btn.addEventListener("click", function () {
      modal.style.display = "block";
    });

    // When the user clicks on <span> (x), close the modal
    span.addEventListener("click", function () {
      modal.style.display = "none";
    });

    // When the user clicks anywhere outside of the modal, close it
    window.addEventListener("click", function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    });
  }


  function updateStatsModal() {
    const currentStreak = window.localStorage.getItem("currentStreak");
    const totalWins = window.localStorage.getItem("totalWins");
    const totalGames = window.localStorage.getItem("totalGames");

    document.getElementById("total-played").textContent = totalGames;
    document.getElementById("total-wins").textContent = totalWins;
    document.getElementById("current-streak").textContent = currentStreak;

    const winPct = Math.round((totalWins / totalGames) * 100) || 0;
    document.getElementById("win-pct").textContent = winPct;
  }

  function showStatsModal() {
    const modal = document.getElementById("stats-modal");
    updateStatsModal();
    modal.style.display = "block";
  }

  function initStatsModal() {
    const modal = document.getElementById("stats-modal");

    // Get the button that opens the modal
    const btn = document.getElementById("stats");

    // Get the <span> element that closes the modal
    const span = document.getElementById("close-stats");

    // When the user clicks on the button, open the modal
    btn.addEventListener("click", function () {
      updateStatsModal();
      modal.style.display = "block";
    });

    // When the user clicks on <span> (x), close the modal
    span.addEventListener("click", function () {
      modal.style.display = "none";
    });

    // When the user clicks anywhere outside of the modal, close it
    window.addEventListener("click", function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    });

    const shareButton = document.querySelector('.share-button');

    shareButton.addEventListener('click', event => {
      if (navigator.share) {
        let message = "SOSB Bandle "+currentWordIndex+": "+guessedWordCountshare+"/6\n\n";
        
        for (let i = 0; i < (guessedWordCount*5); i++) {
          let className = document.getElementById(i+1).className;
          if (className === "animate__animated square animate__flipInX correct-letter-in-place"){
            message += "🟩";
          }
          if (className === "animate__animated square animate__flipInX correct-letter"){
            message += "🟨";
          }
          if (className === "animate__animated square animate__flipInX incorrect-letter"){
            message += "⬜";
          }
          if (i === 4){
            message += "\n";
          }
          if (i === 9){
            message += "\n";
          }
          if (i === 14){
            message += "\n";
          }
          if (i === 19){
            message += "\n";
          }
          if (i === 24){
            message += "\n";
          }
          if (i === 29){
            message += "\n";
          }
        }
        
        message +="\nPlay Bandle! Get your tickets to the Spirit of Stony Brook's Spring Concert at bit.ly/sosbconcert2022\n"
        navigator.share({
          title: "Share today's Bandle Result!",
          url: 'https://bit.ly/sbubandle',
          text: message
        }).then(() => {
          console.log('Thanks for sharing!');
        })
        .catch(console.error);
      } else {
        // fallback
      }
    });
  }
});



