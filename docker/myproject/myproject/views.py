def read_secret_from_file(file_path):
    try:
        with open(file_path, 'r') as file:
            return file.read().strip()  # Strip is used to remove any extra newlines or whitespace
    except FileNotFoundError:
        print(f"Error: File not found at {file_path}")
        return None
    except Exception as e:
        print(f"Error reading from {file_path}: {e}")
        return None

def vault_authenticate_and_write_secret(secret_path, secret_data):
    import hvac
    import os

    client = hvac.Client(url=os.environ['VAULT_ADDR'])
    
    # Assuming the files are at a specific path. Modify these paths as necessary.
    role_id_path = '/etc/vault/volume/role_id'
    secret_id_path = '/etc/vault/volume/secret_id'

    # Read role_id and secret_id from files
    role_id = read_secret_from_file(role_id_path)
    secret_id = read_secret_from_file(secret_id_path)

    if not role_id or not secret_id:
        print("Failed to retrieve Role ID or Secret ID from files.")
        return

    # Authenticate with Vault using AppRole
    client.auth.approle.login(role_id=role_id, secret_id=secret_id)

    # Write secret
    write_response = client.secrets.kv.v2.create_or_update_secret(
        path=secret_path,
        secret=secret_data,
    )
    if write_response.status_code == 204:
        print("Secret written successfully.")
    else:
        print("Failed to write secret:", write_response.text)

# Example usage
vault_authenticate_and_write_secret('mysecret', {'password': 'myStrongPassword'})
