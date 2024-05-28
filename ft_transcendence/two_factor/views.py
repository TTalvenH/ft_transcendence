from django.views.generic import View
from django.shortcuts import render

class TwoFAView(View):
    def get(self, request):
        # Handle the 2FA logic here
        return render(request, '2fa.html')