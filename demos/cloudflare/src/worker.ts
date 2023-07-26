import { HtmlJS } from 'htmljs';

import { RootLayout, BobLayout } from '@layouts';
import * as bob from '@routes/bob';
import * as home from '@routes';

const { app, view, layout } = new HtmlJS(RootLayout);
app.get('/', view(home.get));
app.use('/bob', layout(BobLayout));
app.post('/bob', view(bob.post));
app.get('/bob', view(bob.get));

export default app;
