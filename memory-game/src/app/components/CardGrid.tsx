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
