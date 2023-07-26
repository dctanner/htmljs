import { html, ViewFunction } from 'htmljs';

export const post: ViewFunction = () => [
	html`<ul>
		<li>Bob</li>
		<li>Rocks</li>
		<li>🎉</li>
	</ul>`,
	html`<div hx-get="/bob" hx-target="#page">Reload</div>`,
];

export const get: ViewFunction = () =>
	html` <div id="page">
		<h1>Hello BOB!</h1>
		<div hx-post="/bob" hx-trigger="load">Loading...</div>
	</div>`;
