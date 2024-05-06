from django.views.generic import FormView
from django.shortcuts import render
from .forms import TwoFactorAuthenticationForm, MyForm

class TwoFAView(FormView):
    template_name = '2fa.html'
    form_class = MyForm

    def form_valid(self, form):
        # Get the user object based on the user's email
        user = self.request.user

        # Get the entered OTP from the form
        otp = form.cleaned_data['code']

        # Verify the OTP using the user's secret key
        if user.verify_otp(otp):
            # If the OTP is valid, grant access to the protected resources
            return render(self.request, 'protected_resource.html')
        else:
            # If the OTP is invalid, display an error message
            return render(self.request, '2fa.html', {'error': 'Invalid OTP'})