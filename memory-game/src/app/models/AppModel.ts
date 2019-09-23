import { observable, action } from "mobx";
import * as _ from "lodash";
import { Card } from "./Card";
import { CardState } from "./CardState";
import { Player } from "./Player";

export class AppModel {
  // We always have 2 players
  public playerA: Player = new Player("Player A");
  public playerB: Player = new Player("Player B");

  // This is the current player taking a turn.
  @observable
  public currentPlayer: Player | null = null;

  // The cards on the table
  @observable
  public cards: Card[] = [];

  // A message about which player won, lost, or tied.
  @observable
  public gameResult: string = "";

  // Track the  cards selected by the current player.
  private card1: Card | null = null;
  private card2: Card | null = null;

  @action
  public startNewGame(): void {
    // Reset the player scores
    this.playerA.score = 0;
    this.playerB.score = 0;
    this.gameResult = '';

    // Choose who gets to go first
    this.currentPlayer = Math.random() >= 0.5 ? this.playerA : this.playerB;

    // Define a 4x4 grid of cards of paired values (face down)
    let size = 4;

    let cardDeck: Card[] = [];
    for (let i = 0; i < size * size; i++) {
      cardDeck.push({
        id: i,
        value: Math.floor(i / 2),
        state: CardState.Hidden
      });
    }

    // Shuffle the deck
    cardDeck = _.shuffle(cardDeck);

    this.cards = cardDeck;
  }

  @action nextTurn() {
    if (this.currentPlayer === this.playerA) {
      this.currentPlayer = this.playerB;
    } else {
      this.currentPlayer = this.playerA;
    }
  }

  @action
  private delayHideCards() {
    // This uses a simple 1 second delay for hiding the cards.
    // This could be done through CSS animation as well.
    setTimeout(() => {
      if (this.card1 !== null && this.card2 !== null) {
        this.card1.state = CardState.Hidden;
        this.card2.state = CardState.Hidden;
      }

      this.card1 = null;
      this.card2 = null;
      this.nextTurn();
    }, 1000);
  }

  @action
  private delayCheckForMatch() {
    setTimeout(() => {
      // If the player has chosen two cards
      if (this.card1 !== null && this.card2 !== null) {
        // If the cards are matched, show them, and give the player a point.
        if (this.card1.value === this.card2.value) {
          this.card1.state = CardState.Matched;
          this.card2.state = CardState.Matched;
          this.card1 = null;
          this.card2 = null;

          if (this.currentPlayer !== null) {
            this.currentPlayer.score++;

            // if all the cards have been matched, figure out a winner
            if (
              this.cards.filter(c => c.state !== CardState.Matched).length < 2
            ) {
              if (this.playerA.score > this.playerB.score) {
                this.gameResult = `${this.playerA.name} wins!`;
              } else if (this.playerB.score > this.playerA.score) {
                this.gameResult = `${this.playerB.name} wins!`;
              } else {
                this.gameResult = `${this.playerA.name} and ${this.playerB.name} tied!`;
              }
            }
          }
        } else {
          // If the cards are not matched, show the error then hide them.
          this.card1.state = CardState.Mismatched;
          this.card2.state = CardState.Mismatched;
          this.delayHideCards();
        }
      }
    }, 500);
  }

  @action
  public selectCard(card: Card): void {
    // If the card has not been match and this is the first card then show it.
    if (card.state !== CardState.Matched) {
      if (this.card1 === null) {
        this.card1 = card;
        card.state = CardState.Revealed;
      } else if (this.card2 === null && card.id !== this.card1.id) {
        // If this is the second card show it and then check for a match.
        this.card2 = card;
        card.state = CardState.Revealed;
        this.delayCheckForMatch();
      }
    }
  }
}