import { observable} from 'mobx'
import { CardState } from './CardState';

export class Card {

    public id: number = -1;
    
    public value: number = -1;

    @observable
    public state: CardState = CardState.Hidden;
}