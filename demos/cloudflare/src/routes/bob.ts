import { html, ViewFunction } from 'htmljs';

export const BobPagePost: ViewFunction = () => [
	html`<ul>
		<li>This Bob</li>
		<li>Rocks</li>
		<li>🎉</li>
	</ul>`,
	html`<div hx-get="/bob" hx-target="#page">Reload</div>`,
];

export const BobPage: ViewFunction = () =>
	html` <div id="page">
		<h1>Hello BOB!</h1>
		<div hx-post="/bob" hx-trigger="load">Loading...</div>
	</div>`;
