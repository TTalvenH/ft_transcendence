from django import forms

class MyForm(forms.Form):
    name = forms.CharField(label='Your Name', max_length=100)
    email = forms.EmailField(label='Your Email')
    message = forms.CharField(label='Your Message', widget=forms.Textarea)

class TwoFactorAuthenticationForm(forms.Form):
    code = forms.CharField(label='Verification Code', max_length=6)