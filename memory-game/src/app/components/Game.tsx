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
