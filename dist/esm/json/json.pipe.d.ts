import { Pipe } from 'rxcomp';
export default class JsonPipe extends Pipe {
    static transform(value: any): string;
}
