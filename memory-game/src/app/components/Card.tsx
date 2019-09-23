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

const valueClass = style({
  display: "block"
});

//================================================================================
type Props = {
  card: CardModel;
  onClick: (card: CardModel) => void;
};

export const Card = observer((props: Props) : JSX.Element => {
  const { card, onClick } = props;

  const onCardClick = () => onClick(card);

  const renderValue = () => {
    if (card.state !== CardState.Hidden) {
      return <div className={valueClass}>{card.value}</div>;
    }
    return <div className={valueClass}></div>;
  };

  let cardClass = hiddenCardClass;
  switch (card.state) {
    case CardState.Revealed:
      cardClass = revealedCardClass;
      break;
    case CardState.Matched:
      cardClass = matchedCardClass;
      break;
    case CardState.Mismatched:
      cardClass = mismatchedCardClass;
      break;
    case CardState.Hidden:
    default:
  }

  return (
    <div className={cardClass} onClick={onCardClick}>
      {renderValue()}
    </div>
  );
});
