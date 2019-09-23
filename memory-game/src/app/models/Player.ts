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