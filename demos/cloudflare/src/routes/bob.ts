import { html } from 'htmljs';

export const BobPage = () =>
	html`<h1>Hello BOB!</h1>
		<div hx-post="/bob" hx-trigger="load">Loading...</div> `;

export const BobPagePost = () =>
	html`<ul>
		<li>Bob</li>
		<li>Rocks</li>
		<li>🎉</li>
	</ul>`;
