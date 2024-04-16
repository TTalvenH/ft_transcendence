
import hvac
from django.http import HttpResponse

def get_vault_client():
    """Create and return a Vault client using the HVAC library."""
    client = hvac.Client(url='http://vault-cont:8200')
    return client

def fetch_secret(secret_path):
    """Fetch a secret from Vault given a secret path."""
    client = get_vault_client()
    secret = client.secrets.kv.v2.read_secret_version(path=secret_path)
    return secret['data']['data']

def write_secret(request):
	"""Write a secret to Vault at the given path."""
	secret_data = {'password': 'testpass123'}
	client = get_vault_client()
	client.secrets.kv.v2.create_or_update_secret(
		path='password',
		secret=secret_data,
    )
	return HttpResponse("Secret written successfully.")
