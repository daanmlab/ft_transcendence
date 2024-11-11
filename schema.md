# Database Schema

## user_customuser
- **id** (`bigint`, PK): Unique identifier for each user
- **password** (`character varying(128)`): User’s password
- **last_login** (`timestamp with time zone`): Timestamp of the user's last login
- **is_superuser** (`boolean`): Indicates if the user has superuser privileges
- **first_name** (`character varying(150)`): User's first name
- **last_name** (`character varying(150)`): User's last name
- **is_staff** (`boolean`): Indicates if the user is a staff member
- **is_active** (`boolean`): Indicates if the user's account is active
- **date_joined** (`timestamp with time zone`): Date the user joined
- **email** (`character varying(255)`, UNIQUE): User’s email address
- **email_is_verified** (`boolean`): Indicates if the user’s email is verified
- **username** (`character varying(20)`, UNIQUE): User's username
- **avatar** (`character varying(200)`): URL of the user's avatar image
- **oauth_provider** (`character varying(50)`): OAuth provider if applicable
- **oauth_uid** (`character varying(255)`): OAuth user ID if applicable
- **two_factor_method** (`character varying(5)`): Indicates the type of two-factor authentication enabled
- **email_pending** (`character varying(255)`): Email pending verification
- **email_pending_is_verified** (`boolean`): Indicates if the pending email is verified
- **avatar_upload** (`character varying(100)`): Path to the user-uploaded avatar image

## friends
- **id** (`bigint`, PK): Unique identifier for each friend relationship
- **user_id** (`bigint`, FK to user_customuser): The user who initiated or accepted the friend request
- **friend_id** (`bigint`, FK to user_customuser): The user who is the friend
- **status** (`character varying`, e.g., "pending", "accepted", "rejected"): Current status of the friend request
- **created_at** (`timestamp`): Timestamp when the friend request was created
- **updated_at** (`timestamp`): Timestamp for the last update to the friend relationship status

## match_history
- **id** (`bigint`, PK): Unique identifier for each match
- **player_one_id** (`bigint`, FK to user_customuser): User ID for the first player
- **player_two_id** (`bigint`, FK to user_customuser): User ID for the second player
- **winner_id** (`bigint`, FK to user_customuser): User ID of the match winner
- **score_player_one** (`integer`): Score of the first player
- **score_player_two** (`integer`): Score of the second player
- **match_date** (`timestamp`): Date and time the match occurred
- **tournament_id** (`bigint`, FK to tournaments, nullable): Tournament ID if the match is part of a tournament

## tournaments
- **id** (`bigint`, PK): Unique identifier for each tournament
- **name** (`character varying`): Tournament name
- **created_by** (`bigint`, FK to user_customuser): User ID of the tournament creator
- **start_date** (`timestamp`): Date when the tournament begins
- **end_date** (`timestamp`): Date when the tournament ends
- **status** (`character varying`, e.g., "upcoming", "ongoing", "completed"): Current status of the tournament

## tournament_participants
- **id** (`bigint`, PK): Unique identifier for each tournament participant
- **tournament_id** (`bigint`, FK to tournaments): ID of the tournament
- **user_id** (`bigint`, FK to user_customuser): User ID of the participant
- **match_result** (`character varying`, e.g., "won", "lost"): Result of the participant's match in the tournament
- **ranking** (`integer`): Final ranking of the participant in the tournament (if applicable)

## game_stats
- **id** (`bigint`, PK): Unique identifier for each user’s game statistics entry
- **user_id** (`bigint`, FK to user_customuser): User ID associated with the stats
- **total_matches** (`integer`): Total number of matches played by the user
- **wins** (`integer`): Total number of matches won by the user
- **losses** (`integer`): Total number of matches lost by the user
- **win_rate** (`decimal`, e.g., percentage): Calculated win rate of the user
- **last_match_date** (`timestamp`): Date of the user’s last match