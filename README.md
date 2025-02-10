# Eliza AI Agent


A conversational AI agent built using the Eiza OS framework and deployed on Replit, integrating Grok and OpenAI APIs to engage users with witty banter, handle basic greetings, and provide intelligent responses.

## Features


Engages users with humor and witty responses


Handles basic greetings and farewells.


Uses a structured knowledge base to enhance responses


Integrates Grok and OpenAI APIs for intelligent interactions.


Runs directly on Replit, making it easy to deploy and maintain.


## Project Setup on Replit

### Environment Setup
Replit provides a cloud-based development environment, eliminating the need for local setup.
Required dependencies (Python, Eiza OS, API libraries) are installed in Replit’s package manager.


### Integrating APIs
Grok API: Enables real-time, witty responses based on contextual queries.


OpenAI API: Enhances natural language processing capabilities for engaging conversations.


API keys are securely stored in Replit Secrets Manager to prevent exposure.


### Knowledge Base Integration


A structured document stores predefined witty responses, greetings, and farewell messages.
The AI agent queries this knowledge base before calling external APIs, ensuring consistent and customized responses.


### Conversational Logic


The agent first checks if the user input matches a predefined greeting or farewell.
If no match is found, it queries Grok for a witty response.
If additional intelligence is required, the agent makes an API call to OpenAI to generate an insightful reply.



### Deployment on Replit


The project is continuously hosted on Replit, ensuring accessibility from anywhere.
The AI agent runs as a persistent process, listening for user interactions.
Replit Webview or an external API endpoint can be used to interact with the bot.


## How to Run the AI Agent

Clone or fork the project on Replit.


Add API keys for Grok and OpenAI in Replit Secrets.


Run the script and start chatting with the witty AI.