import { HtmlJS } from 'htmljs';

import { RootLayout, BobLayout } from '@layouts';
import { BobPage, BobPagePost } from '@routes/bob';
import { HomePage } from '@routes';

const { app, view, layout } = new HtmlJS(RootLayout);
app.get('/', view(HomePage));
app.use('/bob', layout(BobLayout));
app.post('/bob', view(BobPagePost));
app.get('/bob', view(BobPage));

export default app;
