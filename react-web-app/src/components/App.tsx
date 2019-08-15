import * as React from "react";
import { Greeting } from "./Greeting";

export class App extends React.Component<{}, {}> {
  render() {
    return (
      <div>
        <Greeting name="World" />
      </div>
    );
  }
}
