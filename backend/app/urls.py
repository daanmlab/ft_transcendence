from django.urls import path

from app.views.auth_views import (
    LoginView,
    UserDetailView,
    VerifyEmailView,
)

from app.views.oauth_views import (
    OAuth42View,
    OAuth42CallbackView,
)

from rest_framework_simplejwt.views import TokenRefreshView

from app.views.two_factor_auth_views import VerifyOTPView

from app.views.user_views import (
	UserListView,
	 FriendRequestView,
	 FriendAcceptView,
	 FriendInvitableUsersListView,
	 FriendRequestUsersListView,
	 FriendsListView
)

urlpatterns = [
    path('token/', LoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user', UserDetailView.as_view(), name='user-detail'),
	path('users/', UserListView.as_view(), name='user-list'),
	path('user/<int:pk>', UserDetailView.as_view(), name='user-detail-pk'),
	path('friend-request/<int:friend_id>', FriendRequestView.as_view(), name='friend-request'),
	path('friend-accept/<int:friend_id>', FriendAcceptView.as_view(), name='friend-accept'),
	path('friends-invitable/', FriendInvitableUsersListView.as_view(), name='friend-invitable-users'),
	path('friends-requests/', FriendRequestUsersListView.as_view(), name='friend-request-users'),
	path('friends/', FriendsListView.as_view(), name='friends-list'),
    path('verify-email/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('oauth/42', OAuth42View.as_view(), name='oauth_42'),
    path('oauth/42/callback', OAuth42CallbackView.as_view(), name='oauth_42_callback'),
    path('verify-otp', VerifyOTPView.as_view(), name='verify-otp'),
]
