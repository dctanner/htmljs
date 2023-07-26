import { html, ViewFunction } from 'htmljs';

export const get: ViewFunction = () => html`<h1>Home!</h1>
	<a href="/bob">See Bob</a>`;
