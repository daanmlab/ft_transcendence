class Bracket extends HTMLElement {
	constructor() {
		super().attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
		<style>
			.container {
				display: flex;
				flex-wrap: wrap;
				align-content: center;
				flex-direction: column;
				font-size: 1rem;
				padding: 2rem 0;
			}
			.tournament-name {
			    align-self: center;
			}

			.bracket {
				white-space: nowrap;
				font-size: 0;
			}

			.round {
				display: inline-block;
				vertical-align: middle;
			}

			.winners>div {
				display: inline-block;
				vertical-align: middle;
			}

			.winners>div.matchups .matchup:last-child {
				margin-bottom: 0 !important;
			}

			.winners>div.matchups .matchup .participants {
				border-radius: 0.25rem;
				overflow: hidden;
			}

			.winners>div.matchups .matchup .participants .participant {
				box-sizing: border-box;
				color: #858585;
				border-left: 0.25rem solid #858585;
				background: #dee2e6;
				width: 14rem;
				height: 3rem;
				box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.12);
			}

			.winners>div.matchups .matchup .participants .participant.winner {
				color: #60c645;
				border-color: #60c645;
			}

			.winners>div.matchups .matchup .participants .participant.loser {
				color: #dc563f;
				border-color: #dc563f;
			}

			.winners>div.matchups .matchup .participants .participant:not(:last-child) {
				border-bottom: thin solid #f0f2f2;
			}

			.winners>div.matchups .matchup .participants .participant span {
				margin: 0 1.25rem;
				line-height: 3;
				font-size: 1rem;
			}

			.winners>div.connector.filled .line,
			.winners>div.connector.filled.bottom .merger:after,
			.winners>div.connector.filled.top .merger:before {
				border-color: #60c645;
			}

			.winners>div.connector .line,
			.winners>div.connector .merger {
				box-sizing: border-box;
				width: 2rem;
				display: inline-block;
				vertical-align: top;
			}

			.winners>div.connector .line {
				border-bottom: thin solid #c0c0c8;
				height: 4rem;
			}

			.winners>div.connector .merger {
				position: relative;
				height: 8rem;
			}

			.winners>div.connector .merger:before,
			.winners>div.connector .merger:after {
				content: "";
				display: block;
				box-sizing: border-box;
				width: 100%;
				height: 50%;
				border: 0 solid;
				border-color: #c0c0c8;
			}

			.winners>div.connector .merger:before {
				border-right-width: thin;
				border-top-width: thin;
			}

			.winners>div.connector .merger:after {
				border-right-width: thin;
				border-bottom-width: thin;
			}

			.round.semifinals .winners .matchups .matchup:not(:last-child) {
				margin-bottom: 10rem;
			}

			.round.semifinals .winners .connector .merger {
				height: 12rem;
			}

			.round.semifinals .winners .connector .line {
				height: 6rem;
			}

			.round.finals .winners .connector .merger {
				height: 3rem;
			}

			.round.finals .winners .connector .line {
				height: 1.5rem;
			}

			/* Pong Simulator */
			.pong-simulator {
				width: 500px;
				height: 500px;
				display: flex;
				justify-content: center;
				align-items: center;
				background: #adb5bd;
				font-family: var(--font-content);
				font-size: 2rem;
				border-radius: 15px;
			}
		</style>
			<div class="container">
				<div class="pong-simulator">
					<span></span>
				</div>
				<h2 class="tournament-name"></h2>
				<div class="bracket">
					<section class="round semifinals">
						<div class="winners">
							<div class="matchups">
								<div class="matchup">
									<div class="participants">
										<div class="participant">
											<span></span>
										</div>
										<div class="participant">
											<span></span>
										</div>
									</div>
								</div>
								<div class="matchup">
									<div class="participants">
										<div class="participant">
											<span></span>
										</div>
										<div class="participant">
											<span></span>
										</div>
									</div>
								</div>
							</div>
							<div class="connector">
								<div class="merger"></div>
								<div class="line"></div>
							</div>
						</div>
					</section>
					<section class="round finals">
						<div class="winners">
							<div class="matchups">
								<div class="matchup">
									<div class="participants">
										<div class="participant">
											<span></span>
										</div>
										<div class="participant">
											<span></span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>
				</div>
			</div>
        `;
	}

	reset() {
		const participantEls = this.shadowRoot.querySelectorAll('.participant span');
		const tournamentNameEl = this.shadowRoot.querySelector('.tournament-name');
		const winnerBadges = this.shadowRoot.querySelectorAll('.winner-badge');
	
		participantEls.forEach(el => {
			el.textContent = '';
			el.parentElement.classList.remove('winner', 'loser');
		});
	
		winnerBadges.forEach(el => el.remove());
	
		if (tournamentNameEl) {
			tournamentNameEl.textContent = '';
		}
	}
	
	init(participants, tournamentName) {
		this.reset();
		const tournamentNameEl = this.shadowRoot.querySelector('.tournament-name');
		const semiFinals = this.shadowRoot.querySelectorAll('.semifinals .matchup');
		const finals = this.shadowRoot.querySelector('.finals .matchup');
		const pongSimulator = this.shadowRoot.querySelector('.pong-simulator span');
	
		tournamentNameEl.textContent = tournamentName;
	
		const shuffle = array => {
			for (let i = array.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[array[i], array[j]] = [array[j], array[i]];
			}
		};
	
		shuffle(participants);
	
		semiFinals.forEach((matchup, index) => {
			const [participant1, participant2] = matchup.querySelectorAll('.participant span');
			participant1.textContent = participants[index * 2];
			participant2.textContent = participants[index * 2 + 1];
		});
	
		const simulateWinner = matchup => {
			const participants = matchup.querySelectorAll('.participant');
			const winnerIndex = Math.floor(Math.random() * participants.length);
	
			participants.forEach((participant, index) => {
				participant.classList.toggle('winner', index === winnerIndex);
				participant.classList.toggle('loser', index !== winnerIndex);
			});
	
			return participants[winnerIndex].querySelector('span').textContent;
		};
	
		const addWinnerBadge = participant => {
			const winnerBadge = document.createElement('span');
			winnerBadge.classList.add('winner-badge');
			winnerBadge.textContent = '🏆';
			participant.appendChild(winnerBadge);
		};
	
		const startCountdown = (stage, el, callback) => {
			let countdown = 3;
			const countdownInterval = setInterval(() => {
				if (countdown > 0) {
					el.textContent = `Starting in ${countdown}...`;
					countdown--;
				} else {
					clearInterval(countdownInterval);
					el.textContent = `Simulating ${stage}... 🏓`;
					setTimeout(callback, 3000);
				}
			}, 1000);
		};
	
		const simulateTournament = () => {
			const finalParticipants = [];
			startCountdown("semi-finals", pongSimulator, () => {
				semiFinals.forEach(matchup => {
					finalParticipants.push(simulateWinner(matchup));
				});
	
				const [finalParticipant1, finalParticipant2] = finals.querySelectorAll('.participant span');
				[finalParticipant1.textContent, finalParticipant2.textContent] = finalParticipants;
	
				startCountdown("final", pongSimulator, () => {
					simulateWinner(finals);
					addWinnerBadge(finals.querySelector('.winner'));
					pongSimulator.textContent = 'End';
				});
			});
		};
	
		simulateTournament();
	}
}

if (!customElements.get("tournament-bracket"))
	customElements.define("tournament-bracket", Bracket);