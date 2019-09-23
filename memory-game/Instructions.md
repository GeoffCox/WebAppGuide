# Memory Game Guide

This contains the steps build the memory card game.  This guide will include building React control, managing application state, and styling the user interface.

The memory game:
* An even number of cards are shuffled and laid out in a grid.
* Each card in the grid has a matching card in the grid.
* Players take turns trying to find two matching cards.
* Each turn consists of turning over one card, then turning over a a second card attemping to reveal a match.
* If a match is found, the cards are left face up and that player gets a point.
* If a match is not found, the cards are turned face down and the next player gets a turn.
* After all matches are found, the player with the most matches wins.

## Sequence

These instructions start from the electron-react-web-app example, but all these changes could easily be made to the react-web-app example.

Here's what we'll do in this guide:

1. TODO!!!!

# Make a copy of the electron react web application

1. Start with a copy of the electron-react-web-app

2. Update package.json to rename the application.

Replace the name statement with the following.

```json
{
  "name": "memory-game",
}
```

3. Update webpack.config.js to rename the page title.

Replace the title statement within the HtmlWebpackPlugin with the following.

```js
title: "Memory Game",
```

4. Delete src/app/components/Greeting.tsx

# Add useful packages

1. Install Lodash

Lodash provides a shuffling algorithm for the cards.

```batchfile
npm install --save lodash
npm install --save-dev @types/lodash
```

2. Install MobX

MobX provides an observer/observable functionality so React can react to application state changes.

```batchfile
npm install --save mobx mobx-react mobx-react-lite
```

3. Install TypeStyle

TypeStyle allows you to place CSS styles within Typescript.

```batchfile
npm install --save typestyle
```

# Model application state

We are going to define application state that will represent the state of the game in memory. The root of this state will be the AppModel class.

We will mark these classes with the @observable attribute so that MobX can help the controls observe them and update the UI.

1. Create a models folder under src/app.

```
src/
  app/
    components/
    models/
  main/
```

2. Create src/app/models/CardState.ts

```ts
export enum CardState {
    Hidden,
    Revealed,
    Matched,
    Mismatched
};
```

2. Create src/app/models/Card.ts

The ID and value of a card never change, so only the state member to be observable.

```ts
import { observable} from 'mobx'
import { CardState } from './CardState';

export class Card {

    public id: number = -1;
    
    public value: number = -1;

    @observable
    public state: CardState = CardState.Hidden;
}
```

3. Create src/app/models/Player.ts

```ts
import { observable } from "mobx";

export class Player {
  constructor(name: string) {
    this.name = name;
  }

  @observable
  public name: string;

  @observable
  public score: number = 0;
}
```

4. Create src/app/models/AppModel.ts

```ts
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
```

# Create React components

We will create several React components to render the UI of the memory game. 

* Card will show an indivdual card based on its card state.
* CardGrid will layout a set of cards in a grid.
* Scoreboard will show the players, who is the current player, their scores, and the winner.
* Game will compose all the control and provide a new game button.

Some things about how we write these components:
* TypeStyle declares CSS styles within the Typescript of the component.
* The newer React hooks approach is used.
* The component functions are wrapped in observable() so that MobX will inform the component whenever application state changes.

1. Create src/app/components/Card.tsx

```tsx
import * as React from "react";
import { observer } from "mobx-react-lite";
import { Card as CardModel } from "../models/Card";
import { CardState } from "../models/CardState";
import { style } from "typestyle";
import { NestedCSSProperties } from "typestyle/lib/types";

const cardStyle: NestedCSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  alignContent: "center",
  width: "50px",
  height: "50px",
  margin: "5px",
  background: "lightgray",
  cursor: "pointer",
  userSelect: "none"
};

const hiddenCardClass = style(cardStyle);

const revealedCardClass = style(cardStyle, {
  backgroundColor: "#134f7c",
  color: "white"
});

const matchedCardClass = style(cardStyle, {
  backgroundColor: "#137c15",
  color: "white",
  cursor: "default"
});

const mismatchedCardClass = style(cardStyle, {
  backgroundColor: "#7c2313",
  color: "white"
});

//================================================================================
type Props = {
  card: CardModel;
  onClick: (card: CardModel) => void;
};

export const Card = observer((props: Props) => {
  const { card } = props;

  switch (card.state) {
    case CardState.Revealed:
      return <div className={revealedCardClass}>{card.value}</div>;
      break;
    case CardState.Matched:
      return <div className={matchedCardClass}>{card.value}</div>;
      break;
    case CardState.Mismatched:
      return <div className={mismatchedCardClass}>{card.value}</div>;
      break;
    case CardState.Hidden:

    default:
      return <div className={hiddenCardClass}></div>;
  }
});
```
2. Create src/app/components/CardGrid.tsx

```tsx
import * as React from "react";
import { observer } from "mobx-react-lite";
import { Card as CardModel } from "../models/Card";
import { style } from "typestyle";
import { Card } from "./Card";

const cardGridClass = style({
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-start",
  alignItems: "center"
});

const cardRowClass = style({});

//================================================================================
type Props = {
  cards: CardModel[];
  onClick: (card: CardModel) => void;
};

export const CardGrid = observer(
  (props: Props): JSX.Element => {
    const { cards, onClick } = props;

    const renderRow = (row: CardModel[]) => {
      return (
        <div className={cardRowClass}>
          {row.map(c => (
            <Card card={c} onClick={onClick} />
          ))}
        </div>
      );
    };

    const renderCards = () => {
      let size = Math.floor(Math.sqrt(cards.length));

      let rows = [];
      for (let r = 0; r < size; r++) {
        let row = cards.slice(r * size, r * size + size);
        rows.push(renderRow(row));
      }

      return rows;
    };

    return <div className={cardGridClass}>{renderCards()}</div>;
  }
);
```

3. Create src/app/components/Scoreboard.tsx

```tsx
import * as React from "react";
import { observer } from "mobx-react-lite";
import { style } from "typestyle";
import { Player } from "../models/Player";
import { NestedCSSProperties } from "typestyle/lib/types";

const scoreboardClass = style({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center"
});

const playerStyle: NestedCSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "center",
  margin: "15px"
};

const playerClass = style(playerStyle);

const currentPlayerClass = style(playerStyle, {
  fontWeight: "bold",
  color: '#134f7c'
});

//================================================================================
type Props = {
  playerA: Player;
  playerB: Player;
  currentPlayer: Player | null;
};

export const Scoreboard = observer(
  (props: Props): JSX.Element => {
    const { playerA, playerB, currentPlayer } = props;

    const renderPlayer = (player: Player) => {
      const renderPlayerClass =
        currentPlayer === player ? currentPlayerClass : playerClass;
      return (
        <div className={renderPlayerClass}>
          <div>{player.name}</div>
          <div>{player.score}</div>
        </div>
      );
    };

    return (
      <div className={scoreboardClass}>
        {renderPlayer(playerA)}
        {renderPlayer(playerB)}
      </div>
    );
  }
);
```

4. Create src/app/components/Game.tsx

```tsx
import * as React from "react";
import { observer } from "mobx-react-lite";
import { Card as CardModel } from "../models/Card";
import { style } from "typestyle";
import { Scoreboard } from "./Scoreboard";
import { CardGrid } from "./CardGrid";
import { AppModel } from "../models/AppModel";

const gameClass = style({
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center"
  });
  
  const newGameButtonClass = style({
    padding: '5px',
    margin: '5px',
    fontSize: '18pt'
  });
  
  const gameResultClass = style({
    fontSize: '14pt'
  });

//================================================================================
type Props = {
    model: AppModel;
};

export const Game = observer(
  (props: Props): JSX.Element => {
    const {
        model,
        model: { playerA, playerB, currentPlayer, cards, gameResult }
      } = props;

      const  onClickCard = (card: CardModel) => {        
        model.selectCard(card);
      };

      return (
        <div className={gameClass}>
          <Scoreboard playerA={playerA} playerB={playerB} currentPlayer={currentPlayer} />
          <CardGrid cards={cards} onClick={onClickCard} />
          <button className={newGameButtonClass} onClick={() => model.startNewGame()}>New Game</button>
          <div className={gameResultClass} >{gameResult}</div>
        </div>
      );
  }
);
```

# Instantiate the model for the application

1. Update src/app/index.tsx

This imports the AppModel class and creates a new instance of it.  Each time the application is created the model is passed to the component.  This let's state of the application remain when hot module reloading components.

```tsx
import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./components/App";
import { AppModel } from "./models/AppModel";

const appElement = document.getElementById("app");

const model = new AppModel();

// Creates an application
const createApp = (AppComponent: typeof App) => {
  return <AppComponent model={model} />;
};

// Initial rendering of the application
ReactDOM.render(createApp(App), appElement);

// Hot Module Replacement types
interface NodeModule {
  hot: any;
}

declare var module: NodeModule;

interface NodeRequire {
  <T>(path: string): T;
}

declare var require: NodeRequire;

// Whenever the HMR indicates the source has changed,
// a new application is created and swapped with the current one.
if (module.hot) {
  module.hot.accept("./components/App", () => {
    console.log("hot module reload");
    const NextApp = require<{ App: typeof App }>("./components/App").App;
    ReactDOM.render(createApp(NextApp), appElement);
  });
}
```