import Fastify, { FastifyInstance, FastifyRequest } from 'fastify'

class Server {
	app: FastifyInstance

	constructor() {
		this.app = Fastify()
	}

	registerRoutes(routes: { [key: string]: CallableFunction }) {
		for (const path in routes) {
			this.app.get(path, (req: FastifyRequest) => routes[path](req))
		}
	}

	async start(port: number): Promise<void> {
		await this.app.listen(port)
	}
}

export default Server
