import { Component, IFactoryMeta } from 'rxcomp';
import { IStorageItem } from './storage.service';
export default class LocalStorageComponent extends Component {
    active: boolean;
    items: IStorageItem[];
    onInit(): void;
    onToggle(): void;
    onClear(): void;
    onRemove(item: IStorageItem): void;
    static meta: IFactoryMeta;
}
