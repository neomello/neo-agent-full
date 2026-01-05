
# Environment Variables
ENV_FILE=.env

# Commands
.PHONY: build dev start install test deploy

install:
	npm install

build:
	npm run build

dev:
	npm run dev

start:
	npm start

test:
	@echo "Running local test simulating Webhook..."
	curl -X POST http://localhost:3000/webhook \
	-H "Content-Type: application/json" \
	-d '{ "intent": "Analyze the state of the network", "context": { "local_test": true } }'

deploy:
	git push heroku main
