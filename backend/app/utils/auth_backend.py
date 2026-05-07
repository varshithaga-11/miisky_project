from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from ..models import UserRegister

class RoleBasedModelBackend(ModelBackend):
    """
    Custom authentication backend to allow login using (username or email) + role + password.
    """
    def authenticate(self, request, username=None, password=None, role=None, **kwargs):
        if username is None:
            return None

        try:
            if role:
                # Normal login with explicit role
                user = UserRegister.objects.get(
                    (Q(username__iexact=username) | Q(email__iexact=username)),
                    role=role
                )
            else:
                # System login (e.g. Django Admin) - search for admin-like roles
                # We prioritize roles that are typically used for administrative access
                user = UserRegister.objects.get(
                    (Q(username__iexact=username) | Q(email__iexact=username)),
                    role__in=['admin', 'master']
                )
        except (UserRegister.DoesNotExist, UserRegister.MultipleObjectsReturned):
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None

    def get_user(self, user_id):
        try:
            return UserRegister.objects.get(pk=user_id)
        except UserRegister.DoesNotExist:
            return None
