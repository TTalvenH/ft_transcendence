from django import forms
from .models import CustomUser
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm

class CreateUserForm(UserCreationForm):
	two_factor_method = forms.ChoiceField(choices=[('app', 'Auth-app'), ('email', 'Email')], required=False)
	class Meta:
		model = CustomUser
		fields = ['username', 'email', 'password', 'two_factor_method']

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.fields['username'].widget.attrs.update({
			'required': True,
			'onkeyup': "this.setAttribute('value', this.value);",
			'value': ''
		})
		self.fields['email'].widget.attrs.update({
			'required': True,
			'onkeyup': "this.setAttribute('value', this.value);",
			'value': ''
		})
		self.fields['password1'].widget.attrs.update({
			'required': True,
			'onkeyup': "this.setAttribute('value', this.value);",
			'value': '',
			'pattern': "(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}",
			'title': 'Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters',
		})
		self.fields['password2'].widget.attrs.update({
			'required': True,
			'onkeyup': "this.setAttribute('value', this.value);",
			'value': '',
			'pattern': "(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}",
			'title': 'Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters',
		})

class LoginForm(AuthenticationForm):
	class Meta:
		model = CustomUser
		fields = ['username', 'password']
	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.fields['username'].widget.attrs.update({
			'required': True,
			'onkeyup': "this.setAttribute('value', this.value);",
			'value': ''
		})
		self.fields['password'].widget.attrs.update({
			'required': True,
			'onkeyup': "this.setAttribute('value', this.value);",
			'value': '',
			'pattern': '(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}',
			'title': 'Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters',
			'type': 'password'
		})
