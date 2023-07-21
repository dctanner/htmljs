<center><strong>html.js</strong></center>

html.js is the server-side js framework for HTML. Build modern hyper-speed web apps and web sites with minimal fuss.

# What is html.js?

A html.js app is server side js that returns html to the browser. You could this a back to the future approach. There are several things that make the html.js approach unique:

- HTML is your application's state. There is no need to manage state in js, it's all in the html. There is often no need to write js (although html.js relies on several js libraries under the hood).
- When the user clicks a link or submits a form, the server only returns the HTML that has changed. This is done using the [htmx](https://htmx.org) library. This makes your app feel like a single page app, but without the complexity of managing client side state.
- Every function you write to return html.js is actually a jsx component (jsx the templating language, there is no React here). This makes it easy to build rich UIs with layouts, views and components.
- Flexible file structure which grows with your app. You can start with a single app.js file, and evolve your app into a full MVC architecture over time.
- Extremely lightweight and fast. Because there is no client side state, the browser only has to render the html it receives from the server.
- Deploy anywhere ([full list](https://hono.dev/#web-standard)), including low latency scalable environments like Cloudflare and Vercel.
- Seamless fallback without js. If js is disabled or you're a search engine, the full HTML page is returned.

The foundations of html.js are built using the following excellent libraries. Get familiar with them, they're your new best friends:

- [hono.dev](https://hono.dev) provides a familiar express style router and jsx templating
- [htmx.org](https://htmx.org) powers ajax partial html fetching

I'df you're planning to deploy to Cloudflare Workers, get familiar with the [Workers docs](https://developers.cloudflare.com/workers/).

# Building your first html.js app

__This tutorial covers the basics of html.js. If you want to see a more feature complete app checkout the [htmljs-todo-example repo](https://github.com/dctanner/htmljs-todo-example).__

# Basic routing and views with Hono

The simplest html.js is single js file which contains your routing, layout and views. To get started, we use [Hono's create command](https://hono.dev/getting-started/basic#starter). You can choose any deploy target you like. We like cloudflare-workers or nodejs for simplicity:

```bash
npm create hono@latest my-app
```

Now open up src/index.js and let's create a simple app:

```js
import { Hono } from 'hono'
import { html } from 'hono/html'
import { rootLayout, view } from 'htmljs'

const db = {
  posts: {
    1: { title: 'Hello World', body: 'This is my first post' }
  }
}

const app = new Hono()

app.use('*', rootLayout(AppLayout))
app.get('/post/:id', view(GetBlogPost))

const GetBlogPost = async ({ context }) => {
  const { id } = context.req.param()
  const post = db.posts[id]; // Replace with your own db call

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  )
}

const AppLayout = ({ context, children }) => html`
<html>
<head>
  <meta charset="UTF-8">
  <title>html.js</title>
</head>
  <body>
    ${props.children}
  </body>
</html>
`

export default app
```

Take note of a few interesting things here:

- You pass the view() and rootLayout() functions jsx or html to render (there is also a layout() function used for nested layouts). The jsx you pass to these functions is always called with a single props param. props.context is the [Hono context object](https://hono.dev/api/context) and is always passed. The rootLayout() is also passed the children prop, which allows it to act as a layout.
- Homepage, GetBlogPost and AppLayout are all equivalent jsx functions. A jsx function can be as simple as some html, jsx or an async function that makes network or database calls before returning html or jsx.

Let's improve the code by separating out the jsx GetBlogPost returns into a new jsx function called BlogPost:

```js
const BlogPost = async ({ post, linked }) => (
  <article>
    <h1>{linked ? <a href={`/post/{post.id}`}>{post.title}</a> : post.tit;e}</h1>
    <p>{post.body}</p>
  </article>
)

const GetBlogPost = async ({ context }) => {
  const { id } = context.req.param()
  const post = db.posts[id]; // Replace with your own db call

  return <BlogPost post={post} />
}
```

Now we can reuse BlogPost in another function if we like. Remember, jsx is a function, so `return <BlogPost post={post} />` can also be written as `return BlogPost({ post })`.

As you app grows, we recommend moving realted jsx functions into their own files in a folder (we like to use routes/). For example, you could create a file called routes/blog.js and move BlogPost and GetBlogPost into it. If you wanted to follow an MVC pattern, you could move GetBlogPost into a controllers/ folder and BlogPost into a views/ folder. You can even split your routes into multiple files using Hono's [grouping feature](https://hono.dev/api/routing#grouping).

Now, let's add a list of blog posts to the homepage:

```js
app.get('/', view(ListBlogPosts))

const ListBlogPosts = async ({ context }) => {
  const posts = db.posts; // Replace with your own db call

  return (
    <div id="main">
      {posts.map(post =>
        <BlogPost post={post} linked={true} />
      )}
    </div>
  )
}
```

## Adding interactivity with htmx

Currently our app will work great as a regular website with a full page load when clicking links. Let's upgrade this to a fast ajax driven experience using the [htmx](https://htmx.org) library. Add the htmx script tag to your AppLayout `<head>`: `<script src="https://unpkg.com/htmx.org@^1"></script>`

htmx lets you turn regular links and form submissions into js driven ajax requests. The server responds with HTML, and htmx lets you specify where in the page this updated HTML should be inserted. You do this by adding `hx-` attributes to your HTML.

The simplest htmx feature is `hx-boost="true"`. This turns a link or form into an ajax request, and htmx replaces the whole page body with the response. E.g. `<a href="/"hx-boost="true">Home</a>`. We recommend using `hx-boost="true"` as the default link behaviour in html.js. It's especially helpful to use `hx-boost` when a form updates data that appears in multiple places on the page, as the whole page will be updated.

htmx really shines when you make use of `hx-target` alongside the `hx-get`, `hx-post`, `hx-put` and `hx-delete` attributes. `hx-target` lets you specify a CSS selector to insert the response into. E.g. `<a href="/post/1" hx-target="#main">Post 1</a>`. This will insert the response into the element with the id `main`. This is great for updating a only the part of the page which needs to change. You can also use `hx-swap="outerHTML"` to replace the element itself. `hx-get` etc. are used to specify the HTTP method and URL to request.

Let's change our blog post links to replace the #main div with the response:

```js
const BlogPost = async ({ post, linked }) => (
  <article>
    <h1>{linked ? <a hx-get={`/post/{post.id}`} hx-target="#main">{post.title}</a> : post.title}</h1>
    <p>{post.body}</p>
  </article>
)
```

But how does the server know when to return the full page including the AppLayout, or just the BlogPost view? That's where our rootLayout(), layout() and view() html.js functions come in. They check for HX-Request, HX-Boosted and HX-Target headers, and appropriately return the full page or just the view.

## Where next?

Now you've seen the basics of a html.js app, you probably want to learn see what a more feature complete app looks like. Checkout the [htmljs-todo-example repo](https://github.com/dctanner/htmljs-todo-example) which uses html.js deployed to Cloudflare Workers with Cloudflare D1 SQLite database and tailwindcss.

html.js is currently the small single js file htmljs.js you see in this repo. Simply copy it into your app (alongside hono and htmx). We'll be releasing as an npm package once we have stabilized the design decicions. We're also working on a CLI tool to help you get started with a new html.js app.

html.js is in its infancy. If you think it's exciting, please contribute!
