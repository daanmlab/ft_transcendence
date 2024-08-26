from channels.middleware import BaseMiddleware
from django.conf import settings
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async 


User = get_user_model()

def user_id_from_token(token):
	try:
		token = AccessToken(token, False)
		user_id = token.payload['user_id']
		return user_id
	except:
		return -1

def get_token_from_headers(headers):
	authorization = headers.get(b'authorization', None)
	if not authorization:
		return None
	authorization = authorization.decode()
	if not authorization.startswith('Bearer '):
		return None
	return authorization.split(' ')[1]


class JwtAuthMiddleware(BaseMiddleware):

	async def __call__(self, scope, receive, send):
		token = get_token_from_headers(dict(scope['headers']))
		user_id = user_id_from_token(token)
		if user_id == -1:
			scope['error'] = 'Invalid token'
			return await super().__call__(scope, receive, send)
		
		scope['user_id'] = user_id
		scope['user'] = None
		try:
			# Check if the token is valid
			user = await sync_to_async(User.objects.get)(id=user_id)  
			scope['user'] = user
		except User.DoesNotExist:
			scope['error'] = 'Invalid token'
		return await super().__call__(scope, receive, send)