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
