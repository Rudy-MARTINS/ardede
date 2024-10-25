import React, { useState, useEffect } from "react";

// Fonction pour obtenir le symbole de la couleur (suit)
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

// Fonction pour obtenir la valeur de la carte (ex: Valet, Dame, Roi, As)
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

const DonnePrendPhase = ({
  players,
  remainingDeck,
  setDeck,
  playerCards,
  updateGorgees,
  endDonnePrendPhase,
}) => {
  const [currentRound, setCurrentRound] = useState(1); // Commence par 1
  const [phaseDonne, setPhaseDonne] = useState(true); // Commence par "Donne"
  const [currentCard, setCurrentCard] = useState(null);
  const [cardRevealed, setCardRevealed] = useState(false);
  const [message, setMessage] = useState("");
  const [playersWithCard, setPlayersWithCard] = useState([]);
  const [currentGiverIndex, setCurrentGiverIndex] = useState(0);
  const [hardcoreMode, setHardcoreMode] = useState(false); // Pour gérer le mode HARDCORE
  const [showCoucou, setShowCoucou] = useState(false); // Pour afficher "coucou" après le test

  // Fonction pour tirer une carte du deck restant
  const drawCard = (isHardcore = false) => {
    console.log("Tirage d'une carte lancé");

    if (!remainingDeck || remainingDeck.length === 0) {
      setMessage("Le deck est vide, la phase est terminée !");
      return;
    }

    let newDeck = [...remainingDeck];
    let card;
    do {
      card = newDeck.pop(); // Tirer une carte du deck
    } while (isHardcore && card?.value === currentCard?.value); // Assurer que la nouvelle carte est différente

    setCurrentCard(card);
    setDeck(newDeck); // Mise à jour du deck
    setCardRevealed(true);
    console.log("Carte tirée : ", card);

    // Vérification des joueurs qui ont cette carte (par valeur seulement)
    console.log("Cartes des joueurs : ", playerCards);
    const playersWithThisCard = players
      .map((player, index) => ({
        playerName: player,
        playerIndex: index,
        hasCard: playerCards[index]?.some(
          (playerCard) => playerCard?.value === card?.value // Comparaison de la valeur uniquement
        ),
      }))
      .filter((playerData) => playerData.hasCard);

    if (playersWithThisCard.length === 0) {
      setMessage("Aucun joueur n'a cette carte.");
      setHardcoreMode(true); // Activer le mode HARDCORE
    } else {
      setPlayersWithCard(playersWithThisCard.map((p) => p.playerIndex));
      setCurrentGiverIndex(0); // Commence par le premier joueur qui doit donner ou prendre
      setMessage(""); // Effacer le message "Aucun joueur n'a cette carte"
      setHardcoreMode(false); // Désactiver le mode HARDCORE si un joueur a la carte
    }
  };

  // Fonction pour distribuer 1 gorgée (pour la phase Donne)
  const handleDistributeGorgee = (toPlayer) => {
    updateGorgees(toPlayer, currentRound); // Distribution des gorgées
    const currentGiver = players[playersWithCard[currentGiverIndex]];
    setMessage(`${currentGiver} a distribué ${currentRound} gorgée(s) à ${players[toPlayer]}.`);

    // Passer au prochain joueur qui doit distribuer ou terminer
    if (currentGiverIndex < playersWithCard.length - 1) {
      setCurrentGiverIndex(currentGiverIndex + 1);
    } else {
      setMessage("Distribution terminée.");
      setTimeout(() => handleNextPhase(), 2000); // Enchaîner automatiquement après la distribution
    }
  };

  // Fonction pour prendre 1 gorgée (pour la phase Prends)
  const handleDrinkGorgee = (playerIndex) => {
    updateGorgees(playerIndex, currentRound); // Comptabilisation des gorgées bues
    setMessage(`${players[playerIndex]} a bu ${currentRound} gorgée(s).`);

    // Vérification si tous les joueurs ont bu
    if (currentGiverIndex < playersWithCard.length - 1) {
      setCurrentGiverIndex(currentGiverIndex + 1);
    } else if (currentRound === 1 && !phaseDonne) {
      // Test pour afficher "coucou" après le "Je prends 1"
      setTimeout(() => setShowCoucou(true), 2000); // Attendre avant d'afficher "coucou"
    } else {
      setTimeout(() => handleNextPhase(), 2000); // Enchaîner automatiquement après avoir bu
    }
  };

  // Fonction pour gérer l'enchaînement des phases
  const handleNextPhase = () => {
    if (!phaseDonne) {
      setCurrentRound((prevRound) => prevRound + 1); // Passer au round suivant
    }
    setPhaseDonne(!phaseDonne); // Alterner entre "Donne" et "Prends"
    setCardRevealed(false); // Réinitialiser l'affichage de la carte
    setCurrentGiverIndex(0); // Réinitialiser l'index du joueur
  };

  // Affichage principal
  if (showCoucou) {
    return <h1>coucou</h1>;
  }

  return (
    <div className="donne-prend-phase">
      <h1>Phase Donne/Prend</h1>

      {phaseDonne ? (
        <h2>Donne {currentRound} gorgée(s)</h2>
      ) : (
        <h2>Prend {currentRound} gorgée(s)</h2>
      )}

      {!cardRevealed ? (
        <button onClick={() => drawCard()}>Tirer une carte</button>
      ) : (
        <div>
          <p>
            Carte tirée : {getCardValue(currentCard.value)} de {getSymbolForSuit(currentCard.suit)}
          </p>
          <p>{message}</p>

          {playersWithCard.length > 0 ? (
            phaseDonne ? (
              // Phase "Donne"
              <div>
                {playersWithCard[currentGiverIndex] !== undefined && (
                  <>
                    <h3>{players[playersWithCard[currentGiverIndex]]}, distribuez vos gorgées</h3>
                    {players.map(
                      (name, index) =>
                        index !== playersWithCard[currentGiverIndex] && (
                          <button key={index} onClick={() => handleDistributeGorgee(index)}>
                            Donner {currentRound} gorgée(s) à {name}
                          </button>
                        )
                    )}
                  </>
                )}
              </div>
            ) : (
              // Phase "Prends"
              <div>
                {playersWithCard[currentGiverIndex] !== undefined && (
                  <>
                    <h3>{players[playersWithCard[currentGiverIndex]]}, c'est à toi de boire</h3>
                    <button onClick={() => handleDrinkGorgee(playersWithCard[currentGiverIndex])}>
                      J'ai bu
                    </button>
                  </>
                )}
              </div>
            )
          ) : (
            hardcoreMode && (
              <button onClick={() => drawCard(true)}>HARDCORE - Tirer une autre carte</button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default DonnePrendPhase;
