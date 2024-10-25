import React, { useState, useEffect } from "react";
import "./app.css";
import WowGuy from "./assets/images/WowGuy.webp";
import DonnePrendPhase from "./components/DonnePrendPhase/DonnePrendPhase";

function App() {
  const [numPlayers, setNumPlayers] = useState(2);
  const [playerNames, setPlayerNames] = useState(Array(numPlayers).fill(""));
  const [startGame, setStartGame] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [message, setMessage] = useState("");
  const [currentCard, setCurrentCard] = useState(null);
  const [playerCards, setPlayerCards] = useState(Array(numPlayers).fill([]));
  const [gorgeesDistribuees, setGorgeesDistribuees] = useState(Array(numPlayers).fill(0));
  const [gorgeesRecues, setGorgeesRecues] = useState(Array(numPlayers).fill(0));
  const [showDistribution, setShowDistribution] = useState(false);
  const [cardRevealed, setCardRevealed] = useState(false);
  const [gorgeesToDistribute, setGorgeesToDistribute] = useState(0);
  const [splitGorgees, setSplitGorgees] = useState([]);
  const [showRecap, setShowRecap] = useState(false);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [showIntermediatePage, setShowIntermediatePage] = useState(false);
  const [showDonnePrendPhase, setShowDonnePrendPhase] = useState(false); // Nouvel état pour gérer la phase Donne / Prend
  const [deck, setDeck] = useState([]);  // Le deck pour la phase Donne / Prend

  const suits = ["cœur", "carreau", "pique", "trèfle"];
  
  const getCardValue = (value) => {
    switch (value) {
      case 11:
        return "Valet";
      case 12:
        return "Dame";
      case 13:
        return "Roi";
      case 14:
        return "As";
      default:
        return value;
    }
  };

  const getSymbolForSuit = (suit) => {
    switch (suit) {
      case "pique":
        return "♠";
      case "trèfle":
        return "♣";
      case "cœur":
        return "♥";
      case "carreau":
        return "♦";
      default:
        return suit;
    }
  };

  useEffect(() => {
    initializeDeck();
  }, []);

  const initializeDeck = () => {
    const newDeck = [];
    suits.forEach((suit) => {
      for (let value = 2; value <= 14; value++) {
        newDeck.push({ value, suit });
      }
    });
    setDeck(shuffle(newDeck));
  };

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const drawCard = () => {
    if (deck.length === 0) return null;
    const newDeck = [...deck];
    const card = newDeck.pop();
    setDeck(newDeck);
    return card;
  };

  const handleNumPlayersChange = (e) => {
    const value = parseInt(e.target.value);
    setNumPlayers(value);
    setPlayerNames(Array(value).fill(""));
    setPlayerCards(Array(value).fill([]));
  };

  const handlePlayerNameChange = (e, index) => {
    const newPlayerNames = [...playerNames];
    newPlayerNames[index] = e.target.value;
    setPlayerNames(newPlayerNames);
  };

  const handleStartGame = () => {
    if (playerNames.every((name) => name.trim() !== "")) {
      setStartGame(true);
      setMessage(`${playerNames[currentPlayer]} commence le tour 1 : Rouge ou Noir.`);
      const card = drawCard();
      setCurrentCard(card);
      setCardRevealed(false);
    } else {
      alert("Veuillez remplir tous les noms des joueurs.");
    }
  };

  const handlePlayerGuess = (guess) => {
    setCardRevealed(true);

    switch (roundNumber) {
      case 1:
        handleColorGuess(guess);
        break;
      case 2:
        handleComparisonGuess(guess);
        break;
      case 3:
        handleInsideOutsideGuess(guess);
        break;
      case 4:
        handleSuitGuess(guess);
        break;
      default:
        break;
    }
  };

  const handleColorGuess = (guess) => {
    const isRed = currentCard.suit === "cœur" || currentCard.suit === "carreau";
    if ((guess === "rouge" && isRed) || (guess === "noir" && !isRed)) {
      setMessage(`${playerNames[currentPlayer]} a deviné correctement et peut distribuer ${roundNumber} gorgée(s).`);
      setGorgeesToDistribute(roundNumber);
      setShowDistribution(true);
    } else {
      setMessage(`Ah ah ah, bien joué ${playerNames[currentPlayer]}... c'était pas ça. TU BOIS ${roundNumber} gorgée(s) !`);
      let newGorgeesRecues = [...gorgeesRecues];
      newGorgeesRecues[currentPlayer] += roundNumber;
      setGorgeesRecues(newGorgeesRecues);
      setWaitingForConfirmation(true);
    }
  };

  const handleComparisonGuess = (guess) => {
    const previousCard = playerCards[currentPlayer][0];
    const comparison = currentCard.value - previousCard.value;

    if ((guess === "supérieure" && comparison > 0) || (guess === "inférieure" && comparison < 0) || (guess === "égale" && comparison === 0)) {
      setMessage(`${playerNames[currentPlayer]} a deviné correctement et peut distribuer ${roundNumber} gorgée(s).`);
      setGorgeesToDistribute(roundNumber);
      setShowDistribution(true);
    } else {
      setMessage(`Ah ah ah, bien joué ${playerNames[currentPlayer]}... c'était pas ça. TU BOIS ${roundNumber} gorgée(s) !`);
      let newGorgeesRecues = [...gorgeesRecues];
      newGorgeesRecues[currentPlayer] += roundNumber;
      setGorgeesRecues(newGorgeesRecues);
      setWaitingForConfirmation(true);
    }
  };

  const handleInsideOutsideGuess = (guess) => {
    const cards = playerCards[currentPlayer];
    const isInside = currentCard.value > Math.min(...cards.map((card) => card.value)) && currentCard.value < Math.max(...cards.map((card) => card.value));

    if ((guess === "intérieur" && isInside) || (guess === "extérieur" && !isInside)) {
      setMessage(`${playerNames[currentPlayer]} a deviné correctement et peut distribuer ${roundNumber} gorgée(s).`);
      setGorgeesToDistribute(roundNumber);
      setShowDistribution(true);
    } else {
      setMessage(`Ah ah ah, bien joué ${playerNames[currentPlayer]}... c'était pas ça. TU BOIS ${roundNumber} gorgée(s) !`);
      let newGorgeesRecues = [...gorgeesRecues];
      newGorgeesRecues[currentPlayer] += roundNumber;
      setGorgeesRecues(newGorgeesRecues);
      setWaitingForConfirmation(true);
    }
  };

  const handleSuitGuess = (guess) => {
    if (guess === currentCard.suit) {
      setMessage(`${playerNames[currentPlayer]} a deviné correctement et peut distribuer ${roundNumber} gorgée(s).`);
      setGorgeesToDistribute(roundNumber);
      setShowDistribution(true);
    } else {
      setMessage(`Ah ah ah, bien joué ${playerNames[currentPlayer]}... c'était pas ça. TU BOIS ${roundNumber} gorgée(s) !`);
      let newGorgeesRecues = [...gorgeesRecues];
      newGorgeesRecues[currentPlayer] += roundNumber;
      setGorgeesRecues(newGorgeesRecues);
      setWaitingForConfirmation(true);
    }
  };

  const handleNextTurn = () => {
    setWaitingForConfirmation(false);
    nextTurn();
  };

  const distributeGorgees = (toPlayer, amount) => {
    let newSplitGorgees = [...splitGorgees, { toPlayer, amount }];
    let totalDistributed = newSplitGorgees.reduce((total, entry) => total + entry.amount, 0);

    if (totalDistributed > gorgeesToDistribute) {
      alert("Vous ne pouvez pas distribuer plus que le nombre de gorgées à distribuer.");
      return;
    }

    if (totalDistributed === gorgeesToDistribute) {
      let newGorgeesDistribuees = [...gorgeesDistribuees];
      let newGorgeesRecues = [...gorgeesRecues];
      newSplitGorgees.forEach(({ toPlayer, amount }) => {
        newGorgeesDistribuees[currentPlayer] += amount;
        newGorgeesRecues[toPlayer] += amount;
      });

      setGorgeesDistribuees(newGorgeesDistribuees);
      setGorgeesRecues(newGorgeesRecues);
      setShowDistribution(false);
      setSplitGorgees([]);
      nextTurn();
    } else {
      setSplitGorgees(newSplitGorgees);
    }
  };

  const nextTurn = () => {
    let nextPlayer = (currentPlayer + 1) % numPlayers;

    let newPlayerCards = [...playerCards];
    newPlayerCards[currentPlayer] = [...newPlayerCards[currentPlayer], currentCard];
    setPlayerCards(newPlayerCards);

    if (nextPlayer === 0) {
      if (roundNumber === 4) {
        setShowIntermediatePage(true);
        return;
      }
      setRoundNumber((prev) => (prev % 4) + 1);
    }

    const newCard = drawCard();
    setCurrentCard(newCard);
    setCardRevealed(false);
    setCurrentPlayer(nextPlayer);
    setMessage(`${playerNames[nextPlayer]}, à toi de jouer pour le tour ${roundNumber}.`);
  };

  const renderRecap = () => {
    return playerNames.map((name, index) => (
      <div key={index}>
        <p>
          {name} a distribué {gorgeesDistribuees[index]} gorgées et a bu {gorgeesRecues[index]} gorgées.
        </p>
        <p>
          Cartes tirées :{" "}
          {playerCards[index].map((card, idx) => (
            <span key={idx}>
              {getCardValue(card.value)} de {getSymbolForSuit(card.suit)},{" "}
            </span>
          ))} 
        </p>
      </div>
    ));
  };

  const handleContinueToRecap = () => {
    setShowRecap(true);
  };

  const handleStartDonnePrendPhase = () => {
    setShowDonnePrendPhase(true); // Passer à la phase Donne / Prend
  };

  return (
    <div className="App">
      {startGame ? (
        <div className="game">
          {showDonnePrendPhase ? (
            <DonnePrendPhase players={playerNames} remainingDeck={deck} setDeck={setDeck} playerCards={playerCards} updateGorgees={distributeGorgees} endDonnePrendPhase={handleNextTurn} />
          ) : showRecap ? (
            <div>
              <h2>Récapitulatif final</h2>
              {renderRecap()}
              <button onClick={handleStartDonnePrendPhase}>Commencer Donne / Prend</button>
            </div>
          ) : showIntermediatePage ? (
            <div>
              <h2>La première phase de jeu est terminée !</h2>
              <p>Vous pouvez reposer vos foies... Mais pas trop longtemps car la suite arrive !</p>
              <button onClick={handleContinueToRecap}>Passer au récap provisoire avant la suite</button>
            </div>
          ) : (
            <div>
              <h2>{message}</h2>

              {cardRevealed && (
                <p>
                  Carte révélée : {getCardValue(currentCard.value)} de {getSymbolForSuit(currentCard.suit)}
                </p>
              )}

              {playerCards[currentPlayer].length > 0 && (
                <div>
                  <h3>Cartes tirées par {playerNames[currentPlayer]}</h3>
                  {playerCards[currentPlayer].map((card, index) => (
                    <p key={index}>
                      {getCardValue(card.value)} de {getSymbolForSuit(card.suit)}
                    </p>
                  ))}
                </div>
              )}

              {roundNumber === 1 && !showDistribution && !cardRevealed && (
                <div>
                  <h3>Devinez si la carte est rouge ou noire</h3>
                  <button onClick={() => handlePlayerGuess("rouge")}>Rouge</button>
                  <button onClick={() => handlePlayerGuess("noir")}>Noir</button>
                </div>
              )}

              {roundNumber === 2 && !showDistribution && !cardRevealed && (
                <div>
                  <h3>Devinez si la carte est supérieure, inférieure ou égale à la première</h3>
                  <button onClick={() => handlePlayerGuess("supérieure")}>Supérieure</button>
                  <button onClick={() => handlePlayerGuess("inférieure")}>Inférieure</button>
                  <button onClick={() => handlePlayerGuess("égale")}>Égale</button>
                </div>
              )}

              {roundNumber === 3 && !showDistribution && !cardRevealed && (
                <div>
                  <h3>Devinez si la carte est à l'intérieur ou à l'extérieur des cartes précédentes</h3>
                  <button onClick={() => handlePlayerGuess("intérieur")}>À l'intérieur</button>
                  <button onClick={() => handlePlayerGuess("extérieur")}>À l'extérieur</button>
                </div>
              )}

              {roundNumber === 4 && !showDistribution && !cardRevealed && (
                <div>
                  <h3>Devinez la forme de la carte</h3>
                  <button onClick={() => handlePlayerGuess("cœur")}>Cœur</button>
                  <button onClick={() => handlePlayerGuess("carreau")}>Carreau</button>
                  <button onClick={() => handlePlayerGuess("pique")}>Pique</button>
                  <button onClick={() => handlePlayerGuess("trèfle")}>Trèfle</button>
                </div>
              )}

              {showDistribution && (
                <div>
                  <h3>Distribuez vos gorgées ({gorgeesToDistribute} à répartir)</h3>
                  {playerNames.map(
                    (name, index) =>
                      index !== currentPlayer && (
                        <button key={index} onClick={() => distributeGorgees(index, 1)}>
                          Donner 1 gorgée à {name}
                        </button>
                      )
                  )}
                </div>
              )}

              {waitingForConfirmation && (
                <div>
                  <button onClick={handleNextTurn}>J'ai bu, tour suivant</button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="player-setup">
          <h1 className="title">L'Ardechoise</h1>
          <h2 className="citation">Pour les gens qu'on pas peur de boire... de l'eau</h2>
          <h4 className="jcvd" >" Dans 20 - 30 ans y en aura plus " - JCVD </h4>
          <img src={WowGuy} alt="WOW Guy" className="wow-image" />
          <div className="player-selection">
            <label htmlFor="numPlayers">Nombre de joueurs :</label>
            <select id="numPlayers" value={numPlayers} onChange={handleNumPlayersChange}>
              {[...Array(9).keys()].map((num) => (
                <option key={num + 2} value={num + 2}>
                  {num + 2}
                </option>
              ))}
            </select>

            <div className="player-names">
              {playerNames.map((name, index) => (
                <input key={index} type="text" placeholder={`Joueur ${index + 1}`} value={name} onChange={(e) => handlePlayerNameChange(e, index)} />
              ))}
            </div>
          </div>

          <button className="start-game-btn" onClick={handleStartGame}>
            Lancer le jeu
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
