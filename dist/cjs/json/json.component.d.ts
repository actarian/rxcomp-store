import { Component, IFactoryMeta } from 'rxcomp';
export default class JsonComponent extends Component {
    active: boolean;
    onToggle(): void;
    static meta: IFactoryMeta;
}
