auto_auth {
  method "approle" {
    config = {
      role_id_file_path   = "/etc/vault/vault-id/role_id"
      secret_id_file_path = "/etc/vault/vault-id/secret_id"
    }
  }

  sink "file" {
    config = {
      path = "/etc/vault/token_sink"
    }
  }
}

cache {
    use_auto_auth_token = true
}

listener "tcp" {
    address = "0.0.0.0:8200"
    tls_disable = true
}