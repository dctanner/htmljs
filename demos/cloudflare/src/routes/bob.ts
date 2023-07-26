import { html, ViewFunction } from 'htmljs';

export const BobPagePost: ViewFunction = () =>
	html`<ul>
		<li>Bob</li>
		<li>Rocks</li>
		<li>🎉</li>
	</ul>`;

export const BobPage: ViewFunction = () =>
	html`<h1>Hello BOB!</h1>
		<div hx-post="/bob" hx-trigger="load">Loading...</div> `;
