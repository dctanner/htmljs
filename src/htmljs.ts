import { Hono } from 'hono';
import { html } from 'hono/html';
import { Context, Next } from 'hono';
import { HtmlEscapedString } from 'hono/utils/html';
export * from 'hono/html';
export { handle } from 'hono/cloudflare-pages';

type ViewProps = {
  context: Context;
};
type LayoutProps = {
  context: Context;
  children: HtmlEscapedString;
};
type EndpointResponse =
  | Promise<HtmlEscapedString>
  | HtmlEscapedString
  | Promise<HtmlEscapedString[]>
  | HtmlEscapedString[];
export type ViewFunction = (props: ViewProps) => EndpointResponse;
export type LayoutFunction = (props: LayoutProps) => EndpointResponse;

export class HtmlJS {
  app: Hono;

  constructor(RootLayout: LayoutFunction) {
    this.app = new Hono();
    this.app.use('*', this.layout(RootLayout, true));
  }

  view(viewToRender: ViewFunction) {
    return async (c: Context) => {
      const newBody = await viewToRender({ context: c });
      const newBodyText = Array.isArray(newBody) ? newBody.join('\n') : newBody;
      return c.html(newBodyText);
    };
  }

  layout(layoutToApply: LayoutFunction, isRoot = false) {
    return async (c: Context, next: Next) => {
      await next();
      const isHXBoosted = c.req.header('HX-Boosted') === 'true';
      const isHXRequested = c.req.header('HX-Request') === 'true';
      const isTargetBody =
        c.req.header('HX-Target') === '#body' ||
        c.req.header('HX-Target') === 'body';
      // render all layouts including root if there's no HX-Request header
      const renderRoot = !isHXRequested;
      const renderLayout =
        !isRoot && isHXRequested && (isHXBoosted || isTargetBody);
      console.log({ isRoot, renderRoot, isHXRequested, renderLayout });
      if (renderRoot || renderLayout) {
        const curBody = (await c.res.text()) as unknown as TemplateStringsArray;
        // To overwrite res, set it to undefined before setting new value
        // https://github.com/honojs/hono/pull/970 released in https://github.com/honojs/hono/releases/tag/v3.1.0
        c.res = undefined;
        const newBody = await layoutToApply({
          context: c,
          children: html(curBody),
        });
        const newBodyText = Array.isArray(newBody)
          ? newBody.join('\n')
          : newBody;
        c.res = c.html(newBodyText);
      }
    };
  }
}
