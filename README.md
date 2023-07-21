# html.js

html.js is the server-side js framework for HTML. Build modern hyper-speed web apps and web sites with minimal fuss.

# What is html.js?

A html.js app is server side js that returns html to the browser. You could this a back to the future approach. There are several things that make the html.js approach unique:

- HTML is your application's state. There is no need to manage state in js, it's all in the html. There is often no need to write js (although html.js relies on several js libraries under the hood).
- When the user clicks a link or submits a form, the server only returns the HTML that has changed. This is done using the [htmx](https://htmx.org) library. This makes your app feel like a single page app, but without the complexity of managing client side state.
- Every function you write to return html.js is actually a jsx component (jsx the templating language, there is no React here). This makes it easy to build rich UIs with layouts, views and components.
- Extremely lightweight and fast. Because there is no client side state, the browser only has to render the html it receives from the server.
- Deploy anywhere ([full list](https://hono.dev/#web-standard)), including low latency scalable environments like Cloudflare and Vercel.
- Seamless fallback without js. If js is disabled or you're a search engine, the full HTML page is returned.

The foundations of html.js are built using the following excellent libraries. Get familiar with them, they're your new best friends:

- [hono.dev](https://hono.dev) provides a familiar express style router and jsx templating
- [htmx.org](https://htmx.org) powers ajax partial html fetching

# What does a html.js app look like?

html.js has a flexible file structure which grows with your app. You can start with a single js file, and evolve your app into a full MVC architecture over time.

The simplest html.js is single app.js which contains your routing, layout and views:

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
app.get('/', view(Homepage))
app.get('/:id', view(GetBlogPost))

const Homepage = (props) => (
  <h1>Homepage</h1>
  <p>Welcome to html.js</p>
)

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
  <script src="/htmx.min.js"></script>
</head>
  <body>
    ${props.children}
  </body>
</html>
`
```

Take note of a few interesting things here:

- You pass the view() and rootLayout() functions jsx or html to render. The jsx you pass rootLayout() is passed the children prop, which allows it to act as a layout.
- Homepage, GetBlogPost and AppLayout are all equivalent jsx functions. A jsx function can be as simple as some html, jsx or an async function that makes network or database calls before returning html or jsx. You can use jsx and html`` interchangably.

Next we could separete out a jsx function to make it reusable. Lets take the jsx GetBlogPost returns and move it to a new jsx function BlogPost:

```js
const BlogPost = async ({ post }) => (
  <article>
    <h1>{post.title}</h1>
    <p>{post.body}</p>
  </article>
)

const GetBlogPost = async ({ context }) => {
  const { id } = context.req.param()
  const post = db.posts[id]; // Replace with your own db call

  return <BlogPost post={post} />
}
```

Now we can reuse BlogPost in another function if we like.
Remember, jsx functions are functions, so `return <BlogPost post={post} />` can also be written as `return BlogPost({ post })`.

```js
