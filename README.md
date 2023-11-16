# LLM Talk Demo

This is the little demo application I'm using for my "[Building Web Apps with LLMs](https://www.meetup.com/web-enthusiasts-basel/events/295242076/)" talk. The application is built using [Nuxt](https://nuxt.com), [Tailwind CSS](https://tailwindcss.com) and [Langchain](https://www.langchain.com).

## Installation

Clone this repository and run `npm install` in the root directory. Then run `npm run dev` to start the development server.

To run the examples, you need to create a `.env` file in the root directory and add the following line:

```
OPENAI_API_KEY=<your openai api key>
```

If you don't have a key yet, sign up for a OpenAI account and generate an API key.

## Examples

### Example 1 (`index.vue`)

This is a very simple example, which is showing how you can load and call a model. If the user clicks the button, it will generate a suggestions for a repository name.

### Example 2 (`example2.vue`)

This example is just a little more dynamic: using [Prompt Templates](https://js.langchain.com/docs/modules/model_io/prompts/prompt_templates/), we can create a very simple form in which the user can enter sentence which GPT then rewrites to make it sound professional.

### Example 3 (`example3.vue`)

Our users are able to input a link to an article here and we'll create a new chat model with the article's text embedded in it. The user can then ask questions about the article and the model will try to answer them.

### Example 4 (`example4.vue`)

In this example we're using a vector database that was filled with data from the [Nuxt documentation](https://nuxt.com/docs).

To run this example, you have to have a [ChromaDB](https://www.trychroma.com) instance running locally, with CORS headers enabled. To do this, you need to edit the `config.py` file inside the root folder:

```python
chroma_server_cors_allow_origins: List[str] = ["http://localhost:3000"]
```

You also have to clone the Nuxt website repo and run the processing script, you can do so as follows:

```bash
git clone git@github.com:nuxt/website-v2.git processing/nuxt-website-repo
npm run process-data
```

This will scrape all the documentation pages from the Nuxt website and store them in the ChromaDB instance. It's using [OpenAIs ada-002 embedding model](https://platform.openai.com/docs/guides/embeddings/what-are-embeddings) to create the vectors.

### Example 5 (`example5.vue`)

In this example we're introducing an assistant that can access data and tools inside a demo todo application.

The agent is also given tools to view and edit the source code of the web application, it itself is running on. You can give it orders to change various things on the open website and, because it's running in dev mode with HMR enabled, see the changes be applied in real-time.

You can take a look at the defined tools in the `example5.vue` file, and the API methods they are calling in the `server/api/code/` directory.

Here are a few prompt examples:

```
> On the current page, before the prompt container, add a title and then a paragraph (use a smaller font and gray color) describing what the user can do on this page

> In the main navigation bar, change the text from Example 5 to Agents

> Use comic sans as font for the web application

> Create a new page called "licenses" where you list all the packages we're using for this project and a link to their npm website
```

## A word of caution

This is just a demo application, so it's not optimized for production use. It's also doing the API calls to OpenAI from the client, which works well, but you can't hide your API key that way. So if you want to use this in production, you should probably create a server-side proxy for the API calls.

When developing with the OpenAI API it's always a good idea to keep an eye on the [usage and costs in your dashboard](https://platform.openai.com/account/usage).
