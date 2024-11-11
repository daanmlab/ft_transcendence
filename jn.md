# User Journeys

## User Journey 1: Onboarding

### Steps
1. **Sign-Up**
   -User signs up via email/password or OAuth2.
2. **Profile Setup**
   -Upload avatar if not registered via OAuth2.
3. **First Action**
   -User is asked if they want to start by playing Pong with AI, inviting friends for 1v1, or joining a tournament.

### Pages
- `landing` -> `register` -> `home`

---

## User Journey 2: AI Game

### Steps
1. **Choosing Game Type**
   -User selects whether to play against AI or challenge a friend to a 1v1 match.
2. **AI Opponent**
   -User plays the game against AI.
3. **Post-Game**
   -After the game ends, user is shown their match history, stats, and performance.

### Pages
- `home` -> `game` -> `game stats`

---

## User Journey 3: 1v1 Game

### Steps
1. **Invite Friend**
   -User invites a friend to play a 1v1 match.
2. **Game Play**
   -When the friend accepts the invite, the game starts. User plays the game against their friend.
3. **Post-Game**
   -After the game ends, user is shown their match history, stats, and performance.

### Pages
- `home` -> `1v1` -> `game` -> `game stats`

---

## User Journey 4: Tournament

### Steps
1. **Join Tournament**
   -User joins or creates a tournament.
2. **Tournament Play**
   -Once the tournament has enough participants, the tournament starts.
3. **First Opponent**
   -User plays against the first opponent and wins.
4. **Post-Game**
   -After the game ends, user is shown the stats and performance and the bracket and next opponent if any.
5. **Countdown Timer**
   -User is shown a countdown timer for the next match if the next match is available or waits for the next opponent to finish their match.
6. **Tournament End**
   -User is shown the final stats and performance and the winner of the tournament.

### Pages
- `home` -> `tournament` -> `game` -> `game stats`

---

## User Journey 5: Profile & Customization

### Steps
1. **Profile Setup**
   -User updates their avatar, change their display name, password, email, 2FA methods or deletes their account.

### Pages
- `profile`

---

## User Journey 6: Match History & Stats

### Steps
1. **Check Match History**
   -The user checks their match history by accessing the "History" section, where they view past games, dates, and results (wins or losses).
2. **View Performance Statistics**
   -The user views their performance statistics on a personal dashboard, showing detailed data such as wins, losses, total matches played, win rate, and any other relevant metrics.

### Pages
- `dashboard`

---

## User Journey 7: Data Management & GDPR

### Steps
1. **Data Anonymization or Deletion**
   -The user requests anonymization or permanent deletion of their data through the "Privacy" settings, following the necessary steps for confirming their identity.
2. **Data Review**
   -The user reviews their stored personal data by navigating to the "Data Review" section, where they can see, edit, or delete any stored information such as email, preferences, and game history.

### Pages
- `data-review`