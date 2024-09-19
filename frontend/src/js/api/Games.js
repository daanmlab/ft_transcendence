import axios from "axios";

export default class Games {
    constructor(baseURL = "http://localhost:8000/api/games") {
        this.api = axios.create({
            baseURL: baseURL,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    // Set the JWT token for authenticated requests
    setAuthToken(token) {
        this.api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    // Fetch invited games, created games, and active games
    async getGames() {
        try {
            const response = await this.api.get();
            return response.data;
        } catch (error) {
            console.error("Error fetching games:", error);
            throw error;
        }
    }

    // Create a new game
    async createGame(opponentId) {
        try {
            const response = await this.api.post("", {
                opponent_id: opponentId,
            });
            return response.data;
        } catch (error) {
            console.error("Error creating game:", error);
            throw error;
        }
    }
}
