import * as React from "react";
import { AppModel } from "../models/AppModel";
import { observer } from "mobx-react-lite";
import { Game } from "./Game";

//================================================================================
type Props = {
  model: AppModel;
};

export const App = observer(
  (props: Props): JSX.Element => {
    const { model } = props;
    return (
      <div>
        <Game model={model} />
      </div>
    );
  }
);
