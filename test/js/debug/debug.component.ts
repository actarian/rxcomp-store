import { Component, getContext, IFactoryMeta } from 'rxcomp';

export default class JsonComponent extends Component {

	onChanges() {
		const { node } = getContext(this);
		node.innerHTML = this.debug ? JSON.stringify(this.debug, null, 2) : this.debug;
	}

	static meta: IFactoryMeta = {
		selector: 'json-component',
		inputs: ['debug'],
	};
}
