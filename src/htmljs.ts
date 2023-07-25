import { Hono } from 'hono';
import { html } from 'hono/html';
import { Context, Next } from 'hono';
import { HtmlEscapedString } from 'hono/utils/html';
export * from 'hono/html';

type ViewProps = {
  context: Context;
};
type LayoutProps = {
  context: Context;
  children: HtmlEscapedString;
};
export type ViewFunction = (
  props: ViewProps
) => Promise<HtmlEscapedString> | HtmlEscapedString;
export type LayoutFunction = (
  props: LayoutProps
) => Promise<HtmlEscapedString> | HtmlEscapedString;

export class HtmlJS {
  app: Hono;

  constructor(RootLayout: LayoutFunction) {
    this.app = new Hono();
    this.app.use('*', this.layout(RootLayout, true));
  }

  view(viewToRender: ViewFunction) {
    return async (c: Context) => {
      const newBody = await viewToRender({ context: c });
      return c.html(newBody);
    };
  }

  layout(layoutToApply: LayoutFunction, isRoot = false) {
    return async (c: Context, next: Next) => {
      await next();
      if (c.req.method !== 'GET') {
        // ignore layout for non-GET requests
        return;
      }
      const isHXBoosted = c.req.header('HX-Boosted') === 'true';
      if (isRoot && isHXBoosted) {
        // ignore root layout for boosted requests
        return;
      }
      const curBody = (await c.res.text()) as unknown as TemplateStringsArray;
      // To overwrite res, set it to undefined before setting new value
      // https://github.com/honojs/hono/pull/970 released in https://github.com/honojs/hono/releases/tag/v3.1.0
      c.res = undefined;
      const newBody = await layoutToApply({
        context: c,
        children: html(curBody),
      });
      c.res = c.html(newBody);
    };
  }
}
